import { SliceHTMLError } from "./SliceHTMLError";

const calculateOffset = ({
  node,
  start,
  end,
}: {
  node: Node;
  start: number;
  end?: number;
}) => {
  const length = node.textContent?.length;

  if (length === undefined) {
    throw new SliceHTMLError();
  }

  const explicitEnd = end ?? length;

  return {
    start: start < 0 ? length + start : start,
    end: explicitEnd < 0 ? length + explicitEnd : explicitEnd,
  };
};

const detectPositionByOffset = ({
  node,
  offset,
}: {
  node: Node;
  offset: number;
}) => {
  const treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);

  let count = 0;
  let detectedNode: Node | undefined;
  let detectedOffset: number | undefined;

  while ((detectedNode = treeWalker.nextNode() ?? undefined)) {
    if (!(detectedNode instanceof Text)) {
      throw new SliceHTMLError();
    }

    const length = detectedNode.length;

    if (offset < length + count) {
      detectedOffset = offset - count;

      break;
    }

    count += length;
  }

  return {
    node: detectedNode,
    offset: detectedOffset,
  };
};

const extractHTMLByOffset = ({
  node,
  start,
  end,
}: {
  node: Node;
  start: number;
  end: number;
}) => {
  const clonedNode = node.cloneNode(true);

  const startPosition = detectPositionByOffset({
    node: clonedNode,
    offset: start,
  });

  if (!startPosition.node || startPosition.offset === undefined) {
    return new DocumentFragment();
  }

  const endPosition = detectPositionByOffset({ node: clonedNode, offset: end });

  const range = new Range();

  range.setStart(startPosition.node, startPosition.offset);

  if (endPosition.node && endPosition.offset !== undefined) {
    range.setEnd(endPosition.node, endPosition.offset);
  } else {
    if (!clonedNode.lastChild) {
      throw new SliceHTMLError();
    }

    range.setEndAfter(clonedNode.lastChild);
  }

  return range.extractContents();
};

const sliceHTML = (node: Node, start: number = 0, end?: number) => {
  const offset = calculateOffset({ node, start, end });

  return extractHTMLByOffset({ node, start: offset.start, end: offset.end });
};

export { sliceHTML };
