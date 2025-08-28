import { IFRAME_MOUSE_MOVE_EVENT } from "@/hooks/useIframeMouseCapture";

declare global {
  interface WindowEventMap {
    [IFRAME_MOUSE_MOVE_EVENT]: MouseEvent;
  }
}
