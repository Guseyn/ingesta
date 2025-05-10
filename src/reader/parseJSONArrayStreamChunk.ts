export type JSONElementCallback<T> = (
  element: T,
  done: boolean,
) => Promise<void>;

export type ParserState = {
  buffer: string;
  rootArrayStarted: boolean;
};

export async function parseJSONArrayStreamChunk<T>(
  chunk: string,
  parserState: ParserState,
  done: boolean,
  onObject: JSONElementCallback<T>,
) {
  parserState.buffer += chunk;

  let currentObjectAccumulator: string[] | null = null;
  let inString = false;
  let depth = 0;
  let lastOpenBraceIndexWithDepthZero = 0;

  for (let i = 0; i < parserState.buffer.length; i++) {
    const currentChar = parserState.buffer[i];
    if (currentChar === '[' && !parserState.rootArrayStarted) {
      parserState.rootArrayStarted = true;
      continue;
    }
    if (currentChar === '"' && currentObjectAccumulator) {
      inString = !inString;
      currentObjectAccumulator.push(currentChar);
      if (i === parserState.buffer.length - 1) {
        parserState.buffer = parserState.buffer.slice(
          lastOpenBraceIndexWithDepthZero,
        );
      }
      continue;
    }
    if (inString && currentObjectAccumulator) {
      if (
        currentChar === '\n' ||
        currentChar === '\r' ||
        currentChar === '\t'
      ) {
        currentObjectAccumulator.push('\\' + currentChar);
      } else {
        currentObjectAccumulator.push(currentChar);
      }
      if (i === parserState.buffer.length - 1) {
        parserState.buffer = parserState.buffer.slice(
          lastOpenBraceIndexWithDepthZero,
        );
      }
      continue;
    }
    if (currentChar === '{') {
      if (depth === 0) {
        currentObjectAccumulator = [];
        lastOpenBraceIndexWithDepthZero = i;
      }
      if (currentObjectAccumulator) {
        depth += 1;
        currentObjectAccumulator.push(currentChar);
      }
      if (i === parserState.buffer.length - 1) {
        parserState.buffer = parserState.buffer.slice(
          lastOpenBraceIndexWithDepthZero,
        );
      }
      continue;
    }
    if (currentChar === '}' && currentObjectAccumulator) {
      depth -= 1;
      currentObjectAccumulator.push(currentChar);
      if (depth === 0) {
        await onObject(JSON.parse(currentObjectAccumulator.join('')), done);
        currentObjectAccumulator.length = 0;
        currentObjectAccumulator = null;
      }
      if (i === parserState.buffer.length - 1) {
        parserState.buffer = parserState.buffer.slice(
          lastOpenBraceIndexWithDepthZero,
        );
      }
      continue;
    }
    if (currentObjectAccumulator) {
      currentObjectAccumulator.push(currentChar);
      if (i === parserState.buffer.length - 1) {
        parserState.buffer = parserState.buffer.slice(
          lastOpenBraceIndexWithDepthZero,
        );
      }
      continue;
    }
    if (i === parserState.buffer.length - 1) {
      parserState.buffer = parserState.buffer.slice(
        lastOpenBraceIndexWithDepthZero,
      );
    }
  }
}
