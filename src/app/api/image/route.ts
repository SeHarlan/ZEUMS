export const runtime = "nodejs"; // @img/sharp requires the Node.js runtime (native bindings)

import { resizeImageHandler } from "@/server/handlers/image/resize";

export { resizeImageHandler as GET };
