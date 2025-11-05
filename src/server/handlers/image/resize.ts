export const runtime = "nodejs"; // sharp needs Node/serverless, not Edge

import { NextRequest, NextResponse } from "next/server";
// import sharp from "sharp";

const LONG_CACHE_CONTROL =
  "public, max-age=7776000, immutable, s-maxage=31536000, stale-while-revalidate=86400, stale-if-error=604800";

const SHORT_CACHE_CONTROL = "public, max-age=86400, s-maxage=604800";

const ZEUM_DOMAIN = process.env.NEXTAUTH_URL || "https://www.zeums.art";

/** default loader quality is 70 */
const HIGH_QUALITY_THRESHOLD = 70;

/**
 * Validates that the request is coming from zeum domain or localhost (will be in next auth url)
 */
function validateOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  try {
    // Check origin header
    if (origin) {
      const originUrl = new URL(origin);
      if (originUrl.origin === new URL(ZEUM_DOMAIN).origin) {
        return true;
      }
    }

    // Check referer header
    if (referer) {
      const refererUrl = new URL(referer);
      if (refererUrl.origin === new URL(ZEUM_DOMAIN).origin) {
        return true;
      }
    }
  } catch {
    return false;
  }

  return false;
}

/**
 * Basic URL validation - ensures it's a valid http/https URL and blocks unsafe hosts
 */
function validateUrl(src: string): boolean {
  try {
    const url = new URL(src);

    // Must be http or https
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }

    const hostname = url.hostname.toLowerCase();

    // Block localhost variants
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.startsWith("127.")
    ) {
      return false;
    }

    // Block private IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
    if (hostname.startsWith("10.") || hostname.startsWith("192.168.")) {
      return false;
    }
    // Block 172.16.0.0/12 (172.16-31.x.x)
    if (hostname.startsWith("172.")) {
      const parts = hostname.split(".");
      const secondOctet = parseInt(parts[1] || "0", 10);
      if (secondOctet >= 16 && secondOctet <= 31) {
        return false;
      }
    }

    // Block link-local and metadata service IPs
    if (hostname.startsWith("169.254.")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function resizeImageHandler(
  req: NextRequest
): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const src = searchParams.get("src");
  const qParam = searchParams.get("q");
  const wParam = searchParams.get("w");
  const w = wParam ? parseInt(wParam, 10) : undefined;
  const q = qParam ? parseInt(qParam, 10) : undefined;

  //high quality assets will generally be public facing so we should present the best/optimized version
  //default in loader is 70 so these will be false by default
  const serverCache = q && q > HIGH_QUALITY_THRESHOLD;
  const animateGif = q && q > HIGH_QUALITY_THRESHOLD;

  if (!src) return NextResponse.json({ error: "Missing src" }, { status: 400 });

  // Validate request origin
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: "Unauthorized origin" }, { status: 403 });
  }

  // Basic URL validation
  if (!validateUrl(src)) {
    return NextResponse.json(
      { error: "Invalid or unsafe src" },
      { status: 400 }
    );
  }

  if (serverCache) {
    //TODO: implement server cache
  }

  // Fetch original with timeout
  const controller = new AbortController();
  const timeoutMs = 8000; // 8 seconds
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(src, { redirect: "follow", signal: controller.signal });
    clearTimeout(timeoutId);
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Upstream timeout" },
        {
          status: 504,
          headers: { "Cache-Control": SHORT_CACHE_CONTROL, Vary: "Accept" },
        }
      );
    }
    return NextResponse.json(
      { error: "Bad upstream" },
      {
        status: 500,
        headers: { "Cache-Control": SHORT_CACHE_CONTROL, Vary: "Accept" },
      }
    );
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: "Bad upstream" },
      {
        status: 502,
        headers: { "Cache-Control": SHORT_CACHE_CONTROL, Vary: "Accept" },
      }
    );
  }
  const buf = Buffer.from(await res.arrayBuffer());


  let sharp: typeof import("sharp");
  
  try {
    sharp = (await import("sharp")).default 
  } catch (error: unknown) {
    console.error("Failed to load sharp module:", error);
    return NextResponse.json(
      { error: "Image processing unavailable" },
      { status: 503, headers: { "Cache-Control": SHORT_CACHE_CONTROL, Vary: "Accept" } }
    );
  }

  if (animateGif) {
    let metadata;
    try {
      
      metadata = await sharp(buf).metadata();
    } catch (error: unknown) {
      console.error(error);
      return NextResponse.json({ error: "Invalid image" }, { status: 400 });
    }

    // If GIF , return original (Sharp can't preserve animation when resizing/converting)
    if (metadata.format === "gif") {
      const contentType = res.headers.get("content-type") || "image/gif";
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": LONG_CACHE_CONTROL,
          Vary: "Accept",
        },
      });
    }
  }

  // Negotiate best output
  const accept = req.headers.get("accept") || "";
  const toAvif = accept.includes("image/avif");
  const toWebp = accept.includes("image/webp");

  let out: Buffer;
  let type: string;
  try {
    let pipeline = sharp(buf);

    // only resize if width defined
    if (w && !isNaN(w)) {
      // optionally still enforce a max cap
      pipeline = pipeline.resize({
        width: w,
        withoutEnlargement: true,
      });
    }

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
  } catch (error: unknown) {
    console.error("Image processing failed:", error);
    return new NextResponse("Image processing error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": SHORT_CACHE_CONTROL,
        Vary: "Accept",
      },
    });
  }

  return new NextResponse(new Uint8Array(out), {
    headers: {
      "Content-Type": type,
      "Cache-Control": LONG_CACHE_CONTROL,
      Vary: "Accept",
    },
  });
}
