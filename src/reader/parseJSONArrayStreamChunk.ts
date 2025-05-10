export type JSONElementCallback<T> = (
  element: T | null,
  done: boolean,
) => Promise<void>;

export type ParserState = {
  buffer: string;
  rootArrayStarted: boolean;
  chunkCount: number;
};

export async function parseJSONArrayStreamChunk<T>(
  chunk: string,
  parserState: ParserState,
  done: boolean,
  onObject: JSONElementCallback<T>,
) {
  parserState.chunkCount += 1;

  if (done) {
    await onObject(null, true);
    return;
  }

  parserState.buffer += chunk;

  let currentObjectAccumulator: string[] | null = null;
  let inString = false;
  let escapeNext = false;
  let braceDepth = 0;
  let bracketDepth = parserState.rootArrayStarted ? 1 : 0;
  let lastOpenBraceIndexWithDepthZero = 0;

  for (let i = 0; i < parserState.buffer.length; i++) {
    const currentChar = parserState.buffer[i];
    if (currentChar === '[' && !parserState.rootArrayStarted) {
      parserState.rootArrayStarted = true;
      bracketDepth++;
      continue;
    }
    if (currentChar === '[') {
      bracketDepth++;
    }
    if (currentChar === ']') {
      bracketDepth--;
      if (!currentObjectAccumulator && bracketDepth === 0) {
        parserState.buffer = '';
        break;
      }
    }
    if (currentChar === '"' && currentObjectAccumulator) {
      if (!escapeNext) {
        inString = !inString;
      }
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
        if (currentChar === '\\') {
          escapeNext = !escapeNext;
        } else {
          escapeNext = false;
        }
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
      if (braceDepth === 0) {
        currentObjectAccumulator = [];
        lastOpenBraceIndexWithDepthZero = i;
      }
      if (currentObjectAccumulator) {
        braceDepth += 1;
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
      braceDepth -= 1;
      currentObjectAccumulator.push(currentChar);
      if (braceDepth === 0) {
        await onObject(JSON.parse(currentObjectAccumulator.join('')), false);
        currentObjectAccumulator.length = 0;
        currentObjectAccumulator = null;
        if (i === parserState.buffer.length - 1) {
          parserState.buffer = '';
        }
        continue;
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
      parserState.buffer = '';
    }
  }
}
