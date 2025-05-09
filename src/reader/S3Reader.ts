import {
  parseJSONArrayStreamChunk,
  ParserState,
} from './parseJSONArrayStreamChunk';

export class S3Reader<T> {
  private readonly url;

  constructor(url: string) {
    this.url = url;
  }

  async streamJSON(
    onEachElementCallback: (obj: T) => Promise<void>,
  ): Promise<void> {
    const response = await fetch(this.url);

    if (!response.ok || !response.body) {
      throw new Error(
        `Failed to fetch from ${this.url}: ${response.statusText}`,
      );
    }

    const decoder = new TextDecoder();
    const reader = response.body.getReader();

    const parserState: ParserState = {
      buffer: '',
      rootArrayStarted: false,
    };

    while (true) {
      const { value, done } = await reader.read();

      const chunk: string = decoder.decode(value, { stream: true });

      await parseJSONArrayStreamChunk<T>(
        chunk,
        parserState,
        onEachElementCallback,
      );

      if (done) break;
    }
  }
}
