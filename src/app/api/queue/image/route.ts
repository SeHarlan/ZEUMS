export const runtime = "nodejs"; // sharp requires Node.js runtime (native bindings)

import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { processImage } from "@/server/queue/worker";
import { ProcessImageJob } from "@/server/queue/worker";

async function handler(req: Request) {
  try {
    const body = (await req.json()) as ProcessImageJob;
    await processImage(body);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error processing image job:", error);
    return Response.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Export the POST handler with signature verification
export const POST = verifySignatureAppRouter(handler);
