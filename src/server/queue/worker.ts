import { put } from "@vercel/blob";
import { kv } from "@vercel/kv";
import sharp from "sharp";
import { HIGH_QUALITY_THRESHOLD } from "@/constants/image";

const LONG_CACHE_CONTROL =
  "public, max-age=7776000, immutable, s-maxage=31536000, stale-while-revalidate=86400, stale-if-error=604800";

export interface ProcessImageJob {
    src: string;
    w: number | undefined;
    q: number | undefined;
    noCdn: boolean | undefined;
}

export async function processImage(job: ProcessImageJob): Promise<void> {
    const { src, w, q } = job;
    const cacheKey = `image:${src}:${w || "auto"}:${q || "auto"}`;
    const failedKey = `failed:${cacheKey}`;

    try {
        const res = await fetch(src, { redirect: "follow" });

        if (!res.ok) {
            throw new Error(`Failed to fetch image: ${res.statusText}`);
        }

        const buf = Buffer.from(await res.arrayBuffer());

        const animateGif = q && q > HIGH_QUALITY_THRESHOLD;
        if (animateGif) {
            const metadata = await sharp(buf).metadata();
            if (metadata.format === "gif") {
                const contentType = res.headers.get("content-type") || "image/gif";
                const blob = await put(cacheKey, buf, {
                    access: "public",
                    contentType: contentType,
                    cacheControl: LONG_CACHE_CONTROL,
                });
                await kv.set(cacheKey, blob.url);
                return;
            }
        }

        let pipeline = sharp(buf);

        if (w && !isNaN(w)) {
            pipeline = pipeline.resize({
                width: w,
                withoutEnlargement: true,
            });
        }

        // Negotiate best output
        const accept = "image/avif,image/webp,image/jpeg"; // Assume all modern formats are accepted
        const toAvif = accept.includes("image/avif");
        const toWebp = accept.includes("image/webp");

        let out: Buffer;
        let type: string;

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

        const blob = await put(cacheKey, out, {
            access: "public",
            contentType: type,
            cacheControl: LONG_CACHE_CONTROL,
        });

        await kv.set(cacheKey, blob.url);
    } catch (error) {
        console.error("Image processing failed:", error);
        await kv.set(failedKey, "true", { ex: 3600 }); // Cache failure for 1 hour
        throw error; // Re-throw to let the queue handle retries
    }
}
