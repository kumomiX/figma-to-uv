"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
figma.showUI(__html__, { width: 0, height: 0 });
function mapToUvCoords({ elementX, elementY, elementWidth, elementHeight, parentWidth, parentHeight, }) {
    const x1 = elementX / parentWidth;
    const y1 = 1 - (elementY + elementHeight) / parentHeight;
    const x2 = (elementX + elementWidth) / parentWidth;
    const y2 = 1 - elementY / parentHeight;
    return [x1, y1, x2, y2];
}
function quit(message) {
    figma.closePlugin(message);
}
function getCoordsAgainstParent(node, targetParentId) {
    if (!('relativeTransform' in node)) {
        return { x: 0, y: 0 };
    }
    let totalX = 0;
    let totalY = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current = node;
    while (current && current.id !== targetParentId) {
        totalX += current.relativeTransform[0][2];
        totalY += current.relativeTransform[1][2];
        current = current.parent;
    }
    return { x: totalX, y: totalY };
}
function main() {
    figma.ui.onmessage = (...args_1) => __awaiter(this, [...args_1], void 0, function* (message = {}) {
        if (message.quit && message.text) {
            return quit('Copied: ' + message.text);
        }
    });
    const selection = figma.currentPage.selection[0];
    let parent = selection.parent;
    // Walk up till we hit the root frame
    while ((parent === null || parent === void 0 ? void 0 : parent.parent) && parent.parent.type === 'FRAME') {
        parent = parent.parent;
    }
    if ((parent === null || parent === void 0 ? void 0 : parent.type) !== 'FRAME') {
        return quit('Need frame parent');
    }
    if (!('x' in selection)) {
        return quit('Select element with position');
    }
    const { x, y } = getCoordsAgainstParent(selection, parent.id);
    const coords = mapToUvCoords({
        elementX: x,
        elementY: y,
        elementWidth: selection.width,
        elementHeight: selection.height,
        parentWidth: parent.width,
        parentHeight: parent.height,
    });
    const text = `[${coords.map((c) => c.toFixed(3)).join(', ')}]`;
    figma.ui.postMessage({ text });
}
main();
