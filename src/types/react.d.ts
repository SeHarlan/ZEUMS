import type { ModelViewerElement } from "@google/model-viewer";

export declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<ModelViewerElement> & Partial<ModelViewerElement>,
        ModelViewerElement
      >;
    }
  }
}

