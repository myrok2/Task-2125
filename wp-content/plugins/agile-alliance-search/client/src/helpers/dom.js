import { isNaN, toNumber } from 'lodash';

function parseValue(value) {
  const cleanValue = (typeof value === 'string')
    ? value.replace('px', '')
    : value;
  const num = toNumber(cleanValue);
  return isNaN(num) ? 0 : Math.ceil(num);
}

/**
 * Given an element and an axis, will return calculated size
 * @param el {object} dom node to be measured
 * @param axis {('width'|'height')} the axis of the node to be computed
 * @return {number} calculated size in pixels
 */
export function getCalcWidth(el, axis = 'width') {
  const axisWords = {
    width: { a: 'Left', b: 'Right', c: 'Width' },
    height: { a: 'Top', b: 'Bottom', c: 'Height' },
  }[axis];

  const style = el.currentStyle || window.getComputedStyle(el);
  const baseSize = el[`client${axisWords.c}`];

  const margin = parseValue(style[`margin${axisWords.a}`])
    + parseValue(style[`margin${axisWords.b}`]);

  const padding = parseValue(style[`padding${axisWords.a}`])
    + parseValue(style[`padding${axisWords.b}`]);

  const border = parseValue(style[`border${axisWords.a}${axisWords.c}`])
    + parseValue(style[`border${axisWords.b}${axisWords.c}`]);

  return baseSize + margin + padding + border;
}

export default {
  getCalcWidth,
};
