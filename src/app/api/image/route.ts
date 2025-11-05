export const runtime = "nodejs"; // sharp requires Node.js runtime (native bindings)

import { resizeImageHandler } from "@/server/handlers/image/resize";

export { resizeImageHandler as GET };
