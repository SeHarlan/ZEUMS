import { IFRAME_MOUSE_MOVE_EVENT } from "@/hooks/useIframeMouseCapture";

declare global {
  interface WindowEventMap {
    [IFRAME_MOUSE_MOVE_EVENT]: MouseEvent;
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src: string;
          "camera-controls"?: string | boolean;
          "auto-rotate"?: string | boolean;
          autoplay?: string | boolean;
          "rotation-per-second"?: string;
          "shadow-intensity"?: string;
          "interaction-prompt"?: string;
          "environment-image"?: string;
          ar?: string | boolean;
          "ar-modes"?: string;
          loading?: string;
          reveal?: string;
          "reveal-when-loaded"?: string | boolean;
        },
        HTMLElement
      >;
    }
  }
}