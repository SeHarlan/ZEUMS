import { Queue } from "@vercel/queue";
import { ProcessImageJob } from "@/server/queue/worker";

export const imageQueue = Queue<ProcessImageJob>({
  handler: async (job) => {
    const { processImage } = await import("@/server/queue/worker");
    await processImage(job);
  },
  retries: 1,

});
