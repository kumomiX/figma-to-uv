figma.showUI(__html__, { width: 0, height: 0 })

/** x-start, y-start, x-end, y-end */
type UvCoords = [x1: number, y1: number, x2: number, y2: number]

function mapToUvCoords({
  elementX,
  elementY,
  elementWidth,
  elementHeight,
  parentWidth,
  parentHeight,
}: {
  elementX: number
  elementY: number
  elementWidth: number
  elementHeight: number
  parentWidth: number
  parentHeight: number
}): UvCoords {
  const x1 = elementX / parentWidth
  const y1 = 1 - (elementY + elementHeight) / parentHeight
  const x2 = (elementX + elementWidth) / parentWidth
  const y2 = 1 - elementY / parentHeight

  return [x1, y1, x2, y2]
}

function quit(message?: string) {
  figma.closePlugin(message)
}

figma.ui.onmessage = async (message = {}) => {
  if (message.quit && message.text) {
    return quit('Copied: ' + message.text)
  }
}

function getFirstElementWithOffset<T extends SceneNode>(node: T) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = node

  while (
    current &&
    'x' in current &&
    'y' in current &&
    current.x === 0 &&
    current.y === 0
  ) {
    current = current.parent
  }

  return current
}

function main() {
  const selection = figma.currentPage.selection[0]
  let parent = selection.parent

  // Walk up till we hit the root frame
  while (parent?.parent && parent.parent.type === 'FRAME') {
    parent = parent.parent
  }

  if (parent?.type !== 'FRAME') {
    return quit('Need frame parent')
  }

  if (!('x' in selection)) {
    return quit('Select element with position')
  }

  const element = getFirstElementWithOffset(selection)

  const coords = mapToUvCoords({
    elementX: element.x,
    elementY: element.y,
    elementWidth: selection.width,
    elementHeight: selection.height,
    parentWidth: parent.width,
    parentHeight: parent.height,
  })

  const text = `[${coords.map((c) => c.toFixed(3)).join(', ')}]`

  figma.ui.postMessage({ text })
}

main()
