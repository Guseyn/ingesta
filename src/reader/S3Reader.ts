import {
  JSONElementCallback,
  parseJSONArrayStreamChunk,
  ParserState,
} from './parseJSONArrayStreamChunk';

export class S3Reader<T> {
  private readonly url;

  constructor(url: string) {
    this.url = url;
  }

  async streamJSON(
    onEachElementCallback: JSONElementCallback<T>,
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
      chunkCount: 0,
    };

    while (true) {
      const { value, done } = await reader.read();

      const chunk: string = decoder.decode(value, { stream: true });

      await parseJSONArrayStreamChunk<T>(
        chunk,
        parserState,
        done,
        onEachElementCallback,
      );

      if (done) {
        break;
      }
    }
  }
}
