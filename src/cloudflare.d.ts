interface HTMLRewriterElement {
  append(
    content: string,
    options?: {
      html?: boolean;
    }
  ): void;
}

interface HTMLRewriterElementHandler {
  element(
    element: HTMLRewriterElement
  ): void | Promise<void>;
}

declare class HTMLRewriter {
  on(
    selector: string,
    handlers: HTMLRewriterElementHandler
  ): HTMLRewriter;

  transform(
    response: Response
  ): Response;
}
