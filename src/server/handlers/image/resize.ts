import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { imageQueue } from "@/server/queue/image-queue";
import { HIGH_QUALITY_THRESHOLD } from "@/constants/image";

const LONG_CACHE_CONTROL =
  "public, max-age=7776000, immutable, s-maxage=31536000, stale-while-revalidate=86400, stale-if-error=604800";
const SHORT_CACHE_CONTROL = "public, max-age=86400, s-maxage=604800";
const ZEUM_DOMAIN = process.env.NEXTAUTH_URL || "https://www.zeums.art";
const TIMEOUT_MS = 10000;

// Lazy-load Sharp
let sharpPromise: Promise<typeof import("sharp")> | null = null;
let sharpModule: typeof import("sharp") | null = null;

async function getSharp(): Promise<typeof import("sharp")> {
    if (sharpModule) return sharpModule;
    if (sharpPromise) return sharpPromise;
    sharpPromise = import("sharp").then((module) => {
        sharpModule = module.default;
        return sharpModule;
    }).catch((error) => {
        sharpPromise = null;
        throw error;
    });
    return sharpPromise;
}

function checkAborted(req: NextRequest): NextResponse | null {
    if (req.signal.aborted) {
        return new NextResponse(null, { status: 499 });
    }
    return null;
}

function validateOrigin(req: NextRequest): boolean {
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    try {
        if (origin && new URL(origin).origin === new URL(ZEUM_DOMAIN).origin) return true;
        if (referer && new URL(referer).origin === new URL(ZEUM_DOMAIN).origin) return true;
    } catch {
        return false;
    }
    return false;
}

function validateUrl(src: string): boolean {
    try {
        const url = new URL(src);
        if (url.protocol !== "http:" && url.protocol !== "https:") return false;
        const hostname = url.hostname.toLowerCase();
        if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname.startsWith("127.")) return false;
        if (hostname.startsWith("10.") || hostname.startsWith("192.168.")) return false;
        if (hostname.startsWith("172.")) {
            const secondOctet = parseInt(hostname.split(".")[1] || "0", 10);
            if (secondOctet >= 16 && secondOctet <= 31) return false;
        }
        if (hostname.startsWith("169.254.")) return false;
        return true;
    } catch {
        return false;
    }
}

async function _handleSyncImageResize(req: NextRequest, src: string, w?: number, q?: number): Promise<NextResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    if (req.signal.aborted) {
        clearTimeout(timeoutId);
        return new NextResponse(null, { status: 499 });
    }
    req.signal.addEventListener("abort", () => {
        controller.abort();
        clearTimeout(timeoutId);
    });

    let res: Response;
    try {
        res = await fetch(src, { redirect: "follow", signal: controller.signal });
        clearTimeout(timeoutId);
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === "AbortError") {
            return NextResponse.json({ error: "Aborted by client or timeout" }, { status: 504, headers: { "Cache-Control": SHORT_CACHE_CONTROL, Vary: "Accept" } });
        }
        return NextResponse.json({ error: "Bad upstream" }, { status: 500, headers: { "Cache-Control": SHORT_CACHE_CONTROL, Vary: "Accept" } });
    }

    if (!res.ok) {
        return NextResponse.json({ error: "Bad upstream" }, { status: 502, headers: { "Cache-Control": SHORT_CACHE_CONTROL, Vary: "Accept" } });
    }

    const buf = Buffer.from(await res.arrayBuffer());
    const abortResponseAfterBuffer = checkAborted(req);
    if (abortResponseAfterBuffer) return abortResponseAfterBuffer;

    let sharp: typeof import("sharp");
    try {
        sharp = await getSharp();
    } catch (error) {
        console.error("Failed to load sharp module:", error);
        return NextResponse.json({ error: "Image processing unavailable" }, { status: 503, headers: { "Cache-Control": SHORT_CACHE_CONTROL, Vary: "Accept" } });
    }

    const animateGif = q && q > HIGH_QUALITY_THRESHOLD;
    if (animateGif) {
        const metadata = await sharp(buf).metadata();
        if (metadata.format === "gif") {
            const contentType = res.headers.get("content-type") || "image/gif";
            return new NextResponse(new Uint8Array(buf), { headers: { "Content-Type": contentType, "Cache-Control": LONG_CACHE_CONTROL, Vary: "Accept" } });
        }
    }

    const accept = req.headers.get("accept") || "";
    const toAvif = accept.includes("image/avif");
    const toWebp = accept.includes("image/webp");

    let out: Buffer;
    let type: string;
    try {
        let pipeline = sharp(buf);
        if (w && !isNaN(w)) {
            pipeline = pipeline.resize({ width: w, withoutEnlargement: true });
        }

        const abortResponseBeforeProcessing = checkAborted(req);
        if (abortResponseBeforeProcessing) return abortResponseBeforeProcessing;

        if (toAvif) {
            out = await pipeline.avif({ quality: q || 50 }).toBuffer();
            type = "image/avif";
        } else if (toWebp) {
            out = await pipeline.webp({ quality: q || 60 }).toBuffer();
            type = "image/webp";
        } else {
            out = await pipeline.jpeg({ quality: q || 70, mozjpeg: true }).toBuffer();
            type = "image/jpeg";
        }
    } catch (error) {
        const abortResponse = checkAborted(req);
        if (abortResponse) return abortResponse;
        console.error("Image processing failed:", error);
        return new NextResponse("Image processing error", { status: 500, headers: { "Content-Type": "text/plain", "Cache-Control": SHORT_CACHE_CONTROL, Vary: "Accept" } });
    }

    return new NextResponse(new Uint8Array(out), { headers: { "Content-Type": type, "Cache-Control": LONG_CACHE_CONTROL, Vary: "Accept" } });
}

export async function resizeImageHandler(req: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const src = searchParams.get("src");
    const qParam = searchParams.get("q");
    const wParam = searchParams.get("w");
    const w = wParam ? parseInt(wParam, 10) : undefined;
    const q = qParam ? parseInt(qParam, 10) : undefined;
    const noCdnParam = searchParams.get("noCdn");
    const noCdn = noCdnParam === "true";

    if (!src) return NextResponse.json({ error: "Missing src" }, { status: 400 });
    if (!validateOrigin(req)) return NextResponse.json({ error: "Unauthorized origin" }, { status: 403 });
    if (!validateUrl(src)) return NextResponse.json({ error: "Invalid or unsafe src" }, { status: 400 });

    if (noCdn) {
        return await _handleSyncImageResize(req, src, w, q);
    }

    const cacheKey = `image:${src}:${w || "auto"}:${q || "auto"}`;
    try {
        const cachedUrl = await kv.get<string>(cacheKey);
        if (cachedUrl) {
            return NextResponse.redirect(cachedUrl, 302);
        }

        const failedKey = `failed:${cacheKey}`;
        const isFailed = await kv.get(failedKey);
        if (isFailed) {
            return NextResponse.json({ error: "Image processing previously failed" }, { status: 404 });
        }

        await imageQueue.enqueue({ src, w, q, noCdn: false });
        return new NextResponse(null, { status: 202 });
    } catch (error) {
        console.error("KV error, falling back to synchronous processing:", error);
        return await _handleSyncImageResize(req, src, w, q);
    }
}
