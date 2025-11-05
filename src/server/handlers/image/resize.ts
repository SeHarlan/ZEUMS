import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const LONG_CACHE_CONTROL =
  "public, max-age=7776000, immutable, s-maxage=31536000, stale-while-revalidate=86400, stale-if-error=604800";

const SHORT_CACHE_CONTROL = "public, max-age=86400, s-maxage=604800";
  
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
  const serverCache = q && q > 70;
  const animateGif = q && q > 70;

  if (!src) return NextResponse.json({ error: "Missing src" }, { status: 400 });

  if (serverCache) { 
    //TODO: implement server cache
  }

  // Fetch original
  const res = await fetch(src, { redirect: "follow" });
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

  let pipeline = sharp(buf);

  // only resize if width defined
  if (w && !isNaN(w)) {
    // optionally still enforce a max cap
    pipeline = pipeline.resize({
      width: w,
      withoutEnlargement: true,
    });
  }

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

  return new NextResponse(new Uint8Array(out), {
    headers: {
      "Content-Type": type,
      "Cache-Control": LONG_CACHE_CONTROL,
      Vary: "Accept",
    },
  });
}