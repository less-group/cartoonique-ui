/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 5260:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  arrow: function() { return /* reexport */ arrow; },
  autoPlacement: function() { return /* reexport */ autoPlacement; },
  autoUpdate: function() { return /* binding */ autoUpdate; },
  computePosition: function() { return /* binding */ floating_ui_dom_esm_computePosition; },
  detectOverflow: function() { return /* reexport */ detectOverflow; },
  flip: function() { return /* reexport */ flip; },
  getOverflowAncestors: function() { return /* reexport */ getOverflowAncestors; },
  hide: function() { return /* reexport */ hide; },
  inline: function() { return /* reexport */ inline; },
  limitShift: function() { return /* reexport */ limitShift; },
  offset: function() { return /* reexport */ offset; },
  platform: function() { return /* binding */ platform; },
  shift: function() { return /* reexport */ shift; },
  size: function() { return /* reexport */ size; }
});

;// CONCATENATED MODULE: ./node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
const sides = ['top', 'right', 'bottom', 'left'];
const alignments = ['start', 'end'];
const placements = /*#__PURE__*/sides.reduce((acc, side) => acc.concat(side, side + "-" + alignments[0], side + "-" + alignments[1]), []);
const min = Math.min;
const max = Math.max;
const round = Math.round;
const floor = Math.floor;
const createCoords = v => ({
  x: v,
  y: v
});
const oppositeSideMap = {
  left: 'right',
  right: 'left',
  bottom: 'top',
  top: 'bottom'
};
const oppositeAlignmentMap = {
  start: 'end',
  end: 'start'
};
function clamp(start, value, end) {
  return max(start, min(value, end));
}
function evaluate(value, param) {
  return typeof value === 'function' ? value(param) : value;
}
function getSide(placement) {
  return placement.split('-')[0];
}
function getAlignment(placement) {
  return placement.split('-')[1];
}
function getOppositeAxis(axis) {
  return axis === 'x' ? 'y' : 'x';
}
function getAxisLength(axis) {
  return axis === 'y' ? 'height' : 'width';
}
function getSideAxis(placement) {
  return ['top', 'bottom'].includes(getSide(placement)) ? 'y' : 'x';
}
function getAlignmentAxis(placement) {
  return getOppositeAxis(getSideAxis(placement));
}
function getAlignmentSides(placement, rects, rtl) {
  if (rtl === void 0) {
    rtl = false;
  }
  const alignment = getAlignment(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const length = getAxisLength(alignmentAxis);
  let mainAlignmentSide = alignmentAxis === 'x' ? alignment === (rtl ? 'end' : 'start') ? 'right' : 'left' : alignment === 'start' ? 'bottom' : 'top';
  if (rects.reference[length] > rects.floating[length]) {
    mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
  }
  return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
}
function getExpandedPlacements(placement) {
  const oppositePlacement = getOppositePlacement(placement);
  return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
}
function getOppositeAlignmentPlacement(placement) {
  return placement.replace(/start|end/g, alignment => oppositeAlignmentMap[alignment]);
}
function getSideList(side, isStart, rtl) {
  const lr = ['left', 'right'];
  const rl = ['right', 'left'];
  const tb = ['top', 'bottom'];
  const bt = ['bottom', 'top'];
  switch (side) {
    case 'top':
    case 'bottom':
      if (rtl) return isStart ? rl : lr;
      return isStart ? lr : rl;
    case 'left':
    case 'right':
      return isStart ? tb : bt;
    default:
      return [];
  }
}
function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
  const alignment = getAlignment(placement);
  let list = getSideList(getSide(placement), direction === 'start', rtl);
  if (alignment) {
    list = list.map(side => side + "-" + alignment);
    if (flipAlignment) {
      list = list.concat(list.map(getOppositeAlignmentPlacement));
    }
  }
  return list;
}
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, side => oppositeSideMap[side]);
}
function expandPaddingObject(padding) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...padding
  };
}
function getPaddingObject(padding) {
  return typeof padding !== 'number' ? expandPaddingObject(padding) : {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding
  };
}
function rectToClientRect(rect) {
  return {
    ...rect,
    top: rect.y,
    left: rect.x,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height
  };
}



;// CONCATENATED MODULE: ./node_modules/@floating-ui/core/dist/floating-ui.core.mjs



function computeCoordsFromPlacement(_ref, placement, rtl) {
  let {
    reference,
    floating
  } = _ref;
  const sideAxis = getSideAxis(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const alignLength = getAxisLength(alignmentAxis);
  const side = getSide(placement);
  const isVertical = sideAxis === 'y';
  const commonX = reference.x + reference.width / 2 - floating.width / 2;
  const commonY = reference.y + reference.height / 2 - floating.height / 2;
  const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
  let coords;
  switch (side) {
    case 'top':
      coords = {
        x: commonX,
        y: reference.y - floating.height
      };
      break;
    case 'bottom':
      coords = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;
    case 'right':
      coords = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;
    case 'left':
      coords = {
        x: reference.x - floating.width,
        y: commonY
      };
      break;
    default:
      coords = {
        x: reference.x,
        y: reference.y
      };
  }
  switch (getAlignment(placement)) {
    case 'start':
      coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
      break;
    case 'end':
      coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
      break;
  }
  return coords;
}

/**
 * Computes the `x` and `y` coordinates that will place the floating element
 * next to a reference element when it is given a certain positioning strategy.
 *
 * This export does not have any `platform` interface logic. You will need to
 * write one for the platform you are using Floating UI with.
 */
const computePosition = async (reference, floating, config) => {
  const {
    placement = 'bottom',
    strategy = 'absolute',
    middleware = [],
    platform
  } = config;
  const validMiddleware = middleware.filter(Boolean);
  const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(floating));
  let rects = await platform.getElementRects({
    reference,
    floating,
    strategy
  });
  let {
    x,
    y
  } = computeCoordsFromPlacement(rects, placement, rtl);
  let statefulPlacement = placement;
  let middlewareData = {};
  let resetCount = 0;
  for (let i = 0; i < validMiddleware.length; i++) {
    const {
      name,
      fn
    } = validMiddleware[i];
    const {
      x: nextX,
      y: nextY,
      data,
      reset
    } = await fn({
      x,
      y,
      initialPlacement: placement,
      placement: statefulPlacement,
      strategy,
      middlewareData,
      rects,
      platform,
      elements: {
        reference,
        floating
      }
    });
    x = nextX != null ? nextX : x;
    y = nextY != null ? nextY : y;
    middlewareData = {
      ...middlewareData,
      [name]: {
        ...middlewareData[name],
        ...data
      }
    };
    if (reset && resetCount <= 50) {
      resetCount++;
      if (typeof reset === 'object') {
        if (reset.placement) {
          statefulPlacement = reset.placement;
        }
        if (reset.rects) {
          rects = reset.rects === true ? await platform.getElementRects({
            reference,
            floating,
            strategy
          }) : reset.rects;
        }
        ({
          x,
          y
        } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
      }
      i = -1;
      continue;
    }
  }
  return {
    x,
    y,
    placement: statefulPlacement,
    strategy,
    middlewareData
  };
};

/**
 * Resolves with an object of overflow side offsets that determine how much the
 * element is overflowing a given clipping boundary on each side.
 * - positive = overflowing the boundary by that number of pixels
 * - negative = how many pixels left before it will overflow
 * - 0 = lies flush with the boundary
 * @see https://floating-ui.com/docs/detectOverflow
 */
async function detectOverflow(state, options) {
  var _await$platform$isEle;
  if (options === void 0) {
    options = {};
  }
  const {
    x,
    y,
    platform,
    rects,
    elements,
    strategy
  } = state;
  const {
    boundary = 'clippingAncestors',
    rootBoundary = 'viewport',
    elementContext = 'floating',
    altBoundary = false,
    padding = 0
  } = evaluate(options, state);
  const paddingObject = getPaddingObject(padding);
  const altContext = elementContext === 'floating' ? 'reference' : 'floating';
  const element = elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = rectToClientRect(await platform.getClippingRect({
    element: ((_await$platform$isEle = await (platform.isElement == null ? void 0 : platform.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || (await (platform.getDocumentElement == null ? void 0 : platform.getDocumentElement(elements.floating))),
    boundary,
    rootBoundary,
    strategy
  }));
  const rect = elementContext === 'floating' ? {
    ...rects.floating,
    x,
    y
  } : rects.reference;
  const offsetParent = await (platform.getOffsetParent == null ? void 0 : platform.getOffsetParent(elements.floating));
  const offsetScale = (await (platform.isElement == null ? void 0 : platform.isElement(offsetParent))) ? (await (platform.getScale == null ? void 0 : platform.getScale(offsetParent))) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  };
  const elementClientRect = rectToClientRect(platform.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform.convertOffsetParentRelativeRectToViewportRelativeRect({
    rect,
    offsetParent,
    strategy
  }) : rect);
  return {
    top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
    bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
    left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
    right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
  };
}

/**
 * Provides data to position an inner element of the floating element so that it
 * appears centered to the reference element.
 * @see https://floating-ui.com/docs/arrow
 */
const arrow = options => ({
  name: 'arrow',
  options,
  async fn(state) {
    const {
      x,
      y,
      placement,
      rects,
      platform,
      elements,
      middlewareData
    } = state;
    // Since `element` is required, we don't Partial<> the type.
    const {
      element,
      padding = 0
    } = evaluate(options, state) || {};
    if (element == null) {
      return {};
    }
    const paddingObject = getPaddingObject(padding);
    const coords = {
      x,
      y
    };
    const axis = getAlignmentAxis(placement);
    const length = getAxisLength(axis);
    const arrowDimensions = await platform.getDimensions(element);
    const isYAxis = axis === 'y';
    const minProp = isYAxis ? 'top' : 'left';
    const maxProp = isYAxis ? 'bottom' : 'right';
    const clientProp = isYAxis ? 'clientHeight' : 'clientWidth';
    const endDiff = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
    const startDiff = coords[axis] - rects.reference[axis];
    const arrowOffsetParent = await (platform.getOffsetParent == null ? void 0 : platform.getOffsetParent(element));
    let clientSize = arrowOffsetParent ? arrowOffsetParent[clientProp] : 0;

    // DOM platform can return `window` as the `offsetParent`.
    if (!clientSize || !(await (platform.isElement == null ? void 0 : platform.isElement(arrowOffsetParent)))) {
      clientSize = elements.floating[clientProp] || rects.floating[length];
    }
    const centerToReference = endDiff / 2 - startDiff / 2;

    // If the padding is large enough that it causes the arrow to no longer be
    // centered, modify the padding so that it is centered.
    const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1;
    const minPadding = min(paddingObject[minProp], largestPossiblePadding);
    const maxPadding = min(paddingObject[maxProp], largestPossiblePadding);

    // Make sure the arrow doesn't overflow the floating element if the center
    // point is outside the floating element's bounds.
    const min$1 = minPadding;
    const max = clientSize - arrowDimensions[length] - maxPadding;
    const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
    const offset = clamp(min$1, center, max);

    // If the reference is small enough that the arrow's padding causes it to
    // to point to nothing for an aligned placement, adjust the offset of the
    // floating element itself. To ensure `shift()` continues to take action,
    // a single reset is performed when this is true.
    const shouldAddOffset = !middlewareData.arrow && getAlignment(placement) != null && center != offset && rects.reference[length] / 2 - (center < min$1 ? minPadding : maxPadding) - arrowDimensions[length] / 2 < 0;
    const alignmentOffset = shouldAddOffset ? center < min$1 ? center - min$1 : center - max : 0;
    return {
      [axis]: coords[axis] + alignmentOffset,
      data: {
        [axis]: offset,
        centerOffset: center - offset - alignmentOffset,
        ...(shouldAddOffset && {
          alignmentOffset
        })
      },
      reset: shouldAddOffset
    };
  }
});

function getPlacementList(alignment, autoAlignment, allowedPlacements) {
  const allowedPlacementsSortedByAlignment = alignment ? [...allowedPlacements.filter(placement => getAlignment(placement) === alignment), ...allowedPlacements.filter(placement => getAlignment(placement) !== alignment)] : allowedPlacements.filter(placement => getSide(placement) === placement);
  return allowedPlacementsSortedByAlignment.filter(placement => {
    if (alignment) {
      return getAlignment(placement) === alignment || (autoAlignment ? getOppositeAlignmentPlacement(placement) !== placement : false);
    }
    return true;
  });
}
/**
 * Optimizes the visibility of the floating element by choosing the placement
 * that has the most space available automatically, without needing to specify a
 * preferred placement. Alternative to `flip`.
 * @see https://floating-ui.com/docs/autoPlacement
 */
const autoPlacement = function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: 'autoPlacement',
    options,
    async fn(state) {
      var _middlewareData$autoP, _middlewareData$autoP2, _placementsThatFitOnE;
      const {
        rects,
        middlewareData,
        placement,
        platform,
        elements
      } = state;
      const {
        crossAxis = false,
        alignment,
        allowedPlacements = placements,
        autoAlignment = true,
        ...detectOverflowOptions
      } = evaluate(options, state);
      const placements$1 = alignment !== undefined || allowedPlacements === placements ? getPlacementList(alignment || null, autoAlignment, allowedPlacements) : allowedPlacements;
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const currentIndex = ((_middlewareData$autoP = middlewareData.autoPlacement) == null ? void 0 : _middlewareData$autoP.index) || 0;
      const currentPlacement = placements$1[currentIndex];
      if (currentPlacement == null) {
        return {};
      }
      const alignmentSides = getAlignmentSides(currentPlacement, rects, await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating)));

      // Make `computeCoords` start from the right place.
      if (placement !== currentPlacement) {
        return {
          reset: {
            placement: placements$1[0]
          }
        };
      }
      const currentOverflows = [overflow[getSide(currentPlacement)], overflow[alignmentSides[0]], overflow[alignmentSides[1]]];
      const allOverflows = [...(((_middlewareData$autoP2 = middlewareData.autoPlacement) == null ? void 0 : _middlewareData$autoP2.overflows) || []), {
        placement: currentPlacement,
        overflows: currentOverflows
      }];
      const nextPlacement = placements$1[currentIndex + 1];

      // There are more placements to check.
      if (nextPlacement) {
        return {
          data: {
            index: currentIndex + 1,
            overflows: allOverflows
          },
          reset: {
            placement: nextPlacement
          }
        };
      }
      const placementsSortedByMostSpace = allOverflows.map(d => {
        const alignment = getAlignment(d.placement);
        return [d.placement, alignment && crossAxis ?
        // Check along the mainAxis and main crossAxis side.
        d.overflows.slice(0, 2).reduce((acc, v) => acc + v, 0) :
        // Check only the mainAxis.
        d.overflows[0], d.overflows];
      }).sort((a, b) => a[1] - b[1]);
      const placementsThatFitOnEachSide = placementsSortedByMostSpace.filter(d => d[2].slice(0,
      // Aligned placements should not check their opposite crossAxis
      // side.
      getAlignment(d[0]) ? 2 : 3).every(v => v <= 0));
      const resetPlacement = ((_placementsThatFitOnE = placementsThatFitOnEachSide[0]) == null ? void 0 : _placementsThatFitOnE[0]) || placementsSortedByMostSpace[0][0];
      if (resetPlacement !== placement) {
        return {
          data: {
            index: currentIndex + 1,
            overflows: allOverflows
          },
          reset: {
            placement: resetPlacement
          }
        };
      }
      return {};
    }
  };
};

/**
 * Optimizes the visibility of the floating element by flipping the `placement`
 * in order to keep it in view when the preferred placement(s) will overflow the
 * clipping boundary. Alternative to `autoPlacement`.
 * @see https://floating-ui.com/docs/flip
 */
const flip = function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: 'flip',
    options,
    async fn(state) {
      var _middlewareData$arrow, _middlewareData$flip;
      const {
        placement,
        middlewareData,
        rects,
        initialPlacement,
        platform,
        elements
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = true,
        fallbackPlacements: specifiedFallbackPlacements,
        fallbackStrategy = 'bestFit',
        fallbackAxisSideDirection = 'none',
        flipAlignment = true,
        ...detectOverflowOptions
      } = evaluate(options, state);

      // If a reset by the arrow was caused due to an alignment offset being
      // added, we should skip any logic now since `flip()` has already done its
      // work.
      // https://github.com/floating-ui/floating-ui/issues/2549#issuecomment-1719601643
      if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      const side = getSide(placement);
      const isBasePlacement = getSide(initialPlacement) === initialPlacement;
      const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
      const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
      if (!specifiedFallbackPlacements && fallbackAxisSideDirection !== 'none') {
        fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
      }
      const placements = [initialPlacement, ...fallbackPlacements];
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const overflows = [];
      let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
      if (checkMainAxis) {
        overflows.push(overflow[side]);
      }
      if (checkCrossAxis) {
        const sides = getAlignmentSides(placement, rects, rtl);
        overflows.push(overflow[sides[0]], overflow[sides[1]]);
      }
      overflowsData = [...overflowsData, {
        placement,
        overflows
      }];

      // One or more sides is overflowing.
      if (!overflows.every(side => side <= 0)) {
        var _middlewareData$flip2, _overflowsData$filter;
        const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
        const nextPlacement = placements[nextIndex];
        if (nextPlacement) {
          // Try next placement and re-run the lifecycle.
          return {
            data: {
              index: nextIndex,
              overflows: overflowsData
            },
            reset: {
              placement: nextPlacement
            }
          };
        }

        // First, find the candidates that fit on the mainAxis side of overflow,
        // then find the placement that fits the best on the main crossAxis side.
        let resetPlacement = (_overflowsData$filter = overflowsData.filter(d => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;

        // Otherwise fallback.
        if (!resetPlacement) {
          switch (fallbackStrategy) {
            case 'bestFit':
              {
                var _overflowsData$map$so;
                const placement = (_overflowsData$map$so = overflowsData.map(d => [d.placement, d.overflows.filter(overflow => overflow > 0).reduce((acc, overflow) => acc + overflow, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$map$so[0];
                if (placement) {
                  resetPlacement = placement;
                }
                break;
              }
            case 'initialPlacement':
              resetPlacement = initialPlacement;
              break;
          }
        }
        if (placement !== resetPlacement) {
          return {
            reset: {
              placement: resetPlacement
            }
          };
        }
      }
      return {};
    }
  };
};

function getSideOffsets(overflow, rect) {
  return {
    top: overflow.top - rect.height,
    right: overflow.right - rect.width,
    bottom: overflow.bottom - rect.height,
    left: overflow.left - rect.width
  };
}
function isAnySideFullyClipped(overflow) {
  return sides.some(side => overflow[side] >= 0);
}
/**
 * Provides data to hide the floating element in applicable situations, such as
 * when it is not in the same clipping context as the reference element.
 * @see https://floating-ui.com/docs/hide
 */
const hide = function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: 'hide',
    options,
    async fn(state) {
      const {
        rects
      } = state;
      const {
        strategy = 'referenceHidden',
        ...detectOverflowOptions
      } = evaluate(options, state);
      switch (strategy) {
        case 'referenceHidden':
          {
            const overflow = await detectOverflow(state, {
              ...detectOverflowOptions,
              elementContext: 'reference'
            });
            const offsets = getSideOffsets(overflow, rects.reference);
            return {
              data: {
                referenceHiddenOffsets: offsets,
                referenceHidden: isAnySideFullyClipped(offsets)
              }
            };
          }
        case 'escaped':
          {
            const overflow = await detectOverflow(state, {
              ...detectOverflowOptions,
              altBoundary: true
            });
            const offsets = getSideOffsets(overflow, rects.floating);
            return {
              data: {
                escapedOffsets: offsets,
                escaped: isAnySideFullyClipped(offsets)
              }
            };
          }
        default:
          {
            return {};
          }
      }
    }
  };
};

function getBoundingRect(rects) {
  const minX = min(...rects.map(rect => rect.left));
  const minY = min(...rects.map(rect => rect.top));
  const maxX = max(...rects.map(rect => rect.right));
  const maxY = max(...rects.map(rect => rect.bottom));
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}
function getRectsByLine(rects) {
  const sortedRects = rects.slice().sort((a, b) => a.y - b.y);
  const groups = [];
  let prevRect = null;
  for (let i = 0; i < sortedRects.length; i++) {
    const rect = sortedRects[i];
    if (!prevRect || rect.y - prevRect.y > prevRect.height / 2) {
      groups.push([rect]);
    } else {
      groups[groups.length - 1].push(rect);
    }
    prevRect = rect;
  }
  return groups.map(rect => rectToClientRect(getBoundingRect(rect)));
}
/**
 * Provides improved positioning for inline reference elements that can span
 * over multiple lines, such as hyperlinks or range selections.
 * @see https://floating-ui.com/docs/inline
 */
const inline = function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: 'inline',
    options,
    async fn(state) {
      const {
        placement,
        elements,
        rects,
        platform,
        strategy
      } = state;
      // A MouseEvent's client{X,Y} coords can be up to 2 pixels off a
      // ClientRect's bounds, despite the event listener being triggered. A
      // padding of 2 seems to handle this issue.
      const {
        padding = 2,
        x,
        y
      } = evaluate(options, state);
      const nativeClientRects = Array.from((await (platform.getClientRects == null ? void 0 : platform.getClientRects(elements.reference))) || []);
      const clientRects = getRectsByLine(nativeClientRects);
      const fallback = rectToClientRect(getBoundingRect(nativeClientRects));
      const paddingObject = getPaddingObject(padding);
      function getBoundingClientRect() {
        // There are two rects and they are disjoined.
        if (clientRects.length === 2 && clientRects[0].left > clientRects[1].right && x != null && y != null) {
          // Find the first rect in which the point is fully inside.
          return clientRects.find(rect => x > rect.left - paddingObject.left && x < rect.right + paddingObject.right && y > rect.top - paddingObject.top && y < rect.bottom + paddingObject.bottom) || fallback;
        }

        // There are 2 or more connected rects.
        if (clientRects.length >= 2) {
          if (getSideAxis(placement) === 'y') {
            const firstRect = clientRects[0];
            const lastRect = clientRects[clientRects.length - 1];
            const isTop = getSide(placement) === 'top';
            const top = firstRect.top;
            const bottom = lastRect.bottom;
            const left = isTop ? firstRect.left : lastRect.left;
            const right = isTop ? firstRect.right : lastRect.right;
            const width = right - left;
            const height = bottom - top;
            return {
              top,
              bottom,
              left,
              right,
              width,
              height,
              x: left,
              y: top
            };
          }
          const isLeftSide = getSide(placement) === 'left';
          const maxRight = max(...clientRects.map(rect => rect.right));
          const minLeft = min(...clientRects.map(rect => rect.left));
          const measureRects = clientRects.filter(rect => isLeftSide ? rect.left === minLeft : rect.right === maxRight);
          const top = measureRects[0].top;
          const bottom = measureRects[measureRects.length - 1].bottom;
          const left = minLeft;
          const right = maxRight;
          const width = right - left;
          const height = bottom - top;
          return {
            top,
            bottom,
            left,
            right,
            width,
            height,
            x: left,
            y: top
          };
        }
        return fallback;
      }
      const resetRects = await platform.getElementRects({
        reference: {
          getBoundingClientRect
        },
        floating: elements.floating,
        strategy
      });
      if (rects.reference.x !== resetRects.reference.x || rects.reference.y !== resetRects.reference.y || rects.reference.width !== resetRects.reference.width || rects.reference.height !== resetRects.reference.height) {
        return {
          reset: {
            rects: resetRects
          }
        };
      }
      return {};
    }
  };
};

// For type backwards-compatibility, the `OffsetOptions` type was also
// Derivable.
async function convertValueToCoords(state, options) {
  const {
    placement,
    platform,
    elements
  } = state;
  const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
  const side = getSide(placement);
  const alignment = getAlignment(placement);
  const isVertical = getSideAxis(placement) === 'y';
  const mainAxisMulti = ['left', 'top'].includes(side) ? -1 : 1;
  const crossAxisMulti = rtl && isVertical ? -1 : 1;
  const rawValue = evaluate(options, state);

  // eslint-disable-next-line prefer-const
  let {
    mainAxis,
    crossAxis,
    alignmentAxis
  } = typeof rawValue === 'number' ? {
    mainAxis: rawValue,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: 0,
    crossAxis: 0,
    alignmentAxis: null,
    ...rawValue
  };
  if (alignment && typeof alignmentAxis === 'number') {
    crossAxis = alignment === 'end' ? alignmentAxis * -1 : alignmentAxis;
  }
  return isVertical ? {
    x: crossAxis * crossAxisMulti,
    y: mainAxis * mainAxisMulti
  } : {
    x: mainAxis * mainAxisMulti,
    y: crossAxis * crossAxisMulti
  };
}

/**
 * Modifies the placement by translating the floating element along the
 * specified axes.
 * A number (shorthand for `mainAxis` or distance), or an axes configuration
 * object may be passed.
 * @see https://floating-ui.com/docs/offset
 */
const offset = function (options) {
  if (options === void 0) {
    options = 0;
  }
  return {
    name: 'offset',
    options,
    async fn(state) {
      const {
        x,
        y
      } = state;
      const diffCoords = await convertValueToCoords(state, options);
      return {
        x: x + diffCoords.x,
        y: y + diffCoords.y,
        data: diffCoords
      };
    }
  };
};

/**
 * Optimizes the visibility of the floating element by shifting it in order to
 * keep it in view when it will overflow the clipping boundary.
 * @see https://floating-ui.com/docs/shift
 */
const shift = function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: 'shift',
    options,
    async fn(state) {
      const {
        x,
        y,
        placement
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = false,
        limiter = {
          fn: _ref => {
            let {
              x,
              y
            } = _ref;
            return {
              x,
              y
            };
          }
        },
        ...detectOverflowOptions
      } = evaluate(options, state);
      const coords = {
        x,
        y
      };
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const crossAxis = getSideAxis(getSide(placement));
      const mainAxis = getOppositeAxis(crossAxis);
      let mainAxisCoord = coords[mainAxis];
      let crossAxisCoord = coords[crossAxis];
      if (checkMainAxis) {
        const minSide = mainAxis === 'y' ? 'top' : 'left';
        const maxSide = mainAxis === 'y' ? 'bottom' : 'right';
        const min = mainAxisCoord + overflow[minSide];
        const max = mainAxisCoord - overflow[maxSide];
        mainAxisCoord = clamp(min, mainAxisCoord, max);
      }
      if (checkCrossAxis) {
        const minSide = crossAxis === 'y' ? 'top' : 'left';
        const maxSide = crossAxis === 'y' ? 'bottom' : 'right';
        const min = crossAxisCoord + overflow[minSide];
        const max = crossAxisCoord - overflow[maxSide];
        crossAxisCoord = clamp(min, crossAxisCoord, max);
      }
      const limitedCoords = limiter.fn({
        ...state,
        [mainAxis]: mainAxisCoord,
        [crossAxis]: crossAxisCoord
      });
      return {
        ...limitedCoords,
        data: {
          x: limitedCoords.x - x,
          y: limitedCoords.y - y
        }
      };
    }
  };
};
/**
 * Built-in `limiter` that will stop `shift()` at a certain point.
 */
const limitShift = function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    options,
    fn(state) {
      const {
        x,
        y,
        placement,
        rects,
        middlewareData
      } = state;
      const {
        offset = 0,
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = true
      } = evaluate(options, state);
      const coords = {
        x,
        y
      };
      const crossAxis = getSideAxis(placement);
      const mainAxis = getOppositeAxis(crossAxis);
      let mainAxisCoord = coords[mainAxis];
      let crossAxisCoord = coords[crossAxis];
      const rawOffset = evaluate(offset, state);
      const computedOffset = typeof rawOffset === 'number' ? {
        mainAxis: rawOffset,
        crossAxis: 0
      } : {
        mainAxis: 0,
        crossAxis: 0,
        ...rawOffset
      };
      if (checkMainAxis) {
        const len = mainAxis === 'y' ? 'height' : 'width';
        const limitMin = rects.reference[mainAxis] - rects.floating[len] + computedOffset.mainAxis;
        const limitMax = rects.reference[mainAxis] + rects.reference[len] - computedOffset.mainAxis;
        if (mainAxisCoord < limitMin) {
          mainAxisCoord = limitMin;
        } else if (mainAxisCoord > limitMax) {
          mainAxisCoord = limitMax;
        }
      }
      if (checkCrossAxis) {
        var _middlewareData$offse, _middlewareData$offse2;
        const len = mainAxis === 'y' ? 'width' : 'height';
        const isOriginSide = ['top', 'left'].includes(getSide(placement));
        const limitMin = rects.reference[crossAxis] - rects.floating[len] + (isOriginSide ? ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse[crossAxis]) || 0 : 0) + (isOriginSide ? 0 : computedOffset.crossAxis);
        const limitMax = rects.reference[crossAxis] + rects.reference[len] + (isOriginSide ? 0 : ((_middlewareData$offse2 = middlewareData.offset) == null ? void 0 : _middlewareData$offse2[crossAxis]) || 0) - (isOriginSide ? computedOffset.crossAxis : 0);
        if (crossAxisCoord < limitMin) {
          crossAxisCoord = limitMin;
        } else if (crossAxisCoord > limitMax) {
          crossAxisCoord = limitMax;
        }
      }
      return {
        [mainAxis]: mainAxisCoord,
        [crossAxis]: crossAxisCoord
      };
    }
  };
};

/**
 * Provides data that allows you to change the size of the floating element —
 * for instance, prevent it from overflowing the clipping boundary or match the
 * width of the reference element.
 * @see https://floating-ui.com/docs/size
 */
const size = function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: 'size',
    options,
    async fn(state) {
      const {
        placement,
        rects,
        platform,
        elements
      } = state;
      const {
        apply = () => {},
        ...detectOverflowOptions
      } = evaluate(options, state);
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const side = getSide(placement);
      const alignment = getAlignment(placement);
      const isYAxis = getSideAxis(placement) === 'y';
      const {
        width,
        height
      } = rects.floating;
      let heightSide;
      let widthSide;
      if (side === 'top' || side === 'bottom') {
        heightSide = side;
        widthSide = alignment === ((await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating))) ? 'start' : 'end') ? 'left' : 'right';
      } else {
        widthSide = side;
        heightSide = alignment === 'end' ? 'top' : 'bottom';
      }
      const overflowAvailableHeight = height - overflow[heightSide];
      const overflowAvailableWidth = width - overflow[widthSide];
      const noShift = !state.middlewareData.shift;
      let availableHeight = overflowAvailableHeight;
      let availableWidth = overflowAvailableWidth;
      if (isYAxis) {
        const maximumClippingWidth = width - overflow.left - overflow.right;
        availableWidth = alignment || noShift ? min(overflowAvailableWidth, maximumClippingWidth) : maximumClippingWidth;
      } else {
        const maximumClippingHeight = height - overflow.top - overflow.bottom;
        availableHeight = alignment || noShift ? min(overflowAvailableHeight, maximumClippingHeight) : maximumClippingHeight;
      }
      if (noShift && !alignment) {
        const xMin = max(overflow.left, 0);
        const xMax = max(overflow.right, 0);
        const yMin = max(overflow.top, 0);
        const yMax = max(overflow.bottom, 0);
        if (isYAxis) {
          availableWidth = width - 2 * (xMin !== 0 || xMax !== 0 ? xMin + xMax : max(overflow.left, overflow.right));
        } else {
          availableHeight = height - 2 * (yMin !== 0 || yMax !== 0 ? yMin + yMax : max(overflow.top, overflow.bottom));
        }
      }
      await apply({
        ...state,
        availableWidth,
        availableHeight
      });
      const nextDimensions = await platform.getDimensions(elements.floating);
      if (width !== nextDimensions.width || height !== nextDimensions.height) {
        return {
          reset: {
            rects: true
          }
        };
      }
      return {};
    }
  };
};



;// CONCATENATED MODULE: ./node_modules/@floating-ui/utils/dom/dist/floating-ui.utils.dom.mjs
function getNodeName(node) {
  if (isNode(node)) {
    return (node.nodeName || '').toLowerCase();
  }
  // Mocked nodes in testing environments may not be instances of Node. By
  // returning `#document` an infinite loop won't occur.
  // https://github.com/floating-ui/floating-ui/issues/2317
  return '#document';
}
function getWindow(node) {
  var _node$ownerDocument;
  return (node == null ? void 0 : (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node) {
  var _ref;
  return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
}
function isNode(value) {
  return value instanceof Node || value instanceof getWindow(value).Node;
}
function isElement(value) {
  return value instanceof Element || value instanceof getWindow(value).Element;
}
function isHTMLElement(value) {
  return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
  // Browsers without `ShadowRoot` support.
  if (typeof ShadowRoot === 'undefined') {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
function isOverflowElement(element) {
  const {
    overflow,
    overflowX,
    overflowY,
    display
  } = getComputedStyle(element);
  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !['inline', 'contents'].includes(display);
}
function isTableElement(element) {
  return ['table', 'td', 'th'].includes(getNodeName(element));
}
function isContainingBlock(element) {
  const webkit = isWebKit();
  const css = getComputedStyle(element);

  // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
  return css.transform !== 'none' || css.perspective !== 'none' || (css.containerType ? css.containerType !== 'normal' : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== 'none' : false) || !webkit && (css.filter ? css.filter !== 'none' : false) || ['transform', 'perspective', 'filter'].some(value => (css.willChange || '').includes(value)) || ['paint', 'layout', 'strict', 'content'].some(value => (css.contain || '').includes(value));
}
function getContainingBlock(element) {
  let currentNode = getParentNode(element);
  while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
    if (isContainingBlock(currentNode)) {
      return currentNode;
    } else {
      currentNode = getParentNode(currentNode);
    }
  }
  return null;
}
function isWebKit() {
  if (typeof CSS === 'undefined' || !CSS.supports) return false;
  return CSS.supports('-webkit-backdrop-filter', 'none');
}
function isLastTraversableNode(node) {
  return ['html', 'body', '#document'].includes(getNodeName(node));
}
function getComputedStyle(element) {
  return getWindow(element).getComputedStyle(element);
}
function getNodeScroll(element) {
  if (isElement(element)) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }
  return {
    scrollLeft: element.pageXOffset,
    scrollTop: element.pageYOffset
  };
}
function getParentNode(node) {
  if (getNodeName(node) === 'html') {
    return node;
  }
  const result =
  // Step into the shadow DOM of the parent of a slotted node.
  node.assignedSlot ||
  // DOM Element detected.
  node.parentNode ||
  // ShadowRoot detected.
  isShadowRoot(node) && node.host ||
  // Fallback.
  getDocumentElement(node);
  return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node) {
  const parentNode = getParentNode(node);
  if (isLastTraversableNode(parentNode)) {
    return node.ownerDocument ? node.ownerDocument.body : node.body;
  }
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode;
  }
  return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node, list, traverseIframes) {
  var _node$ownerDocument2;
  if (list === void 0) {
    list = [];
  }
  if (traverseIframes === void 0) {
    traverseIframes = true;
  }
  const scrollableAncestor = getNearestOverflowAncestor(node);
  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
  const win = getWindow(scrollableAncestor);
  if (isBody) {
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], win.frameElement && traverseIframes ? getOverflowAncestors(win.frameElement) : []);
  }
  return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
}



;// CONCATENATED MODULE: ./node_modules/@floating-ui/dom/dist/floating-ui.dom.esm.js






function getCssDimensions(element) {
  const css = getComputedStyle(element);
  // In testing environments, the `width` and `height` properties are empty
  // strings for SVG elements, returning NaN. Fallback to `0` in this case.
  let width = parseFloat(css.width) || 0;
  let height = parseFloat(css.height) || 0;
  const hasOffset = isHTMLElement(element);
  const offsetWidth = hasOffset ? element.offsetWidth : width;
  const offsetHeight = hasOffset ? element.offsetHeight : height;
  const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
  if (shouldFallback) {
    width = offsetWidth;
    height = offsetHeight;
  }
  return {
    width,
    height,
    $: shouldFallback
  };
}

function unwrapElement(element) {
  return !isElement(element) ? element.contextElement : element;
}

function getScale(element) {
  const domElement = unwrapElement(element);
  if (!isHTMLElement(domElement)) {
    return createCoords(1);
  }
  const rect = domElement.getBoundingClientRect();
  const {
    width,
    height,
    $
  } = getCssDimensions(domElement);
  let x = ($ ? round(rect.width) : rect.width) / width;
  let y = ($ ? round(rect.height) : rect.height) / height;

  // 0, NaN, or Infinity should always fallback to 1.

  if (!x || !Number.isFinite(x)) {
    x = 1;
  }
  if (!y || !Number.isFinite(y)) {
    y = 1;
  }
  return {
    x,
    y
  };
}

const noOffsets = /*#__PURE__*/createCoords(0);
function getVisualOffsets(element) {
  const win = getWindow(element);
  if (!isWebKit() || !win.visualViewport) {
    return noOffsets;
  }
  return {
    x: win.visualViewport.offsetLeft,
    y: win.visualViewport.offsetTop
  };
}
function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
    return false;
  }
  return isFixed;
}

function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  const clientRect = element.getBoundingClientRect();
  const domElement = unwrapElement(element);
  let scale = createCoords(1);
  if (includeScale) {
    if (offsetParent) {
      if (isElement(offsetParent)) {
        scale = getScale(offsetParent);
      }
    } else {
      scale = getScale(element);
    }
  }
  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
  let x = (clientRect.left + visualOffsets.x) / scale.x;
  let y = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;
  if (domElement) {
    const win = getWindow(domElement);
    const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
    let currentIFrame = win.frameElement;
    while (currentIFrame && offsetParent && offsetWin !== win) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css = getComputedStyle(currentIFrame);
      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
      const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
      x *= iframeScale.x;
      y *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;
      x += left;
      y += top;
      currentIFrame = getWindow(currentIFrame).frameElement;
    }
  }
  return rectToClientRect({
    width,
    height,
    x,
    y
  });
}

function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
  let {
    rect,
    offsetParent,
    strategy
  } = _ref;
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  if (offsetParent === documentElement) {
    return rect;
  }
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  let scale = createCoords(1);
  const offsets = createCoords(0);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && strategy !== 'fixed') {
    if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isHTMLElement(offsetParent)) {
      const offsetRect = getBoundingClientRect(offsetParent);
      scale = getScale(offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    }
  }
  return {
    width: rect.width * scale.x,
    height: rect.height * scale.y,
    x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x,
    y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y
  };
}

function getClientRects(element) {
  return Array.from(element.getClientRects());
}

function getWindowScrollBarX(element) {
  // If <html> has a CSS width greater than the viewport, then this will be
  // incorrect for RTL.
  return getBoundingClientRect(getDocumentElement(element)).left + getNodeScroll(element).scrollLeft;
}

// Gets the entire size of the scrollable document area, even extending outside
// of the `<html>` and `<body>` rect bounds if horizontally scrollable.
function getDocumentRect(element) {
  const html = getDocumentElement(element);
  const scroll = getNodeScroll(element);
  const body = element.ownerDocument.body;
  const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
  const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
  let x = -scroll.scrollLeft + getWindowScrollBarX(element);
  const y = -scroll.scrollTop;
  if (getComputedStyle(body).direction === 'rtl') {
    x += max(html.clientWidth, body.clientWidth) - width;
  }
  return {
    width,
    height,
    x,
    y
  };
}

function getViewportRect(element, strategy) {
  const win = getWindow(element);
  const html = getDocumentElement(element);
  const visualViewport = win.visualViewport;
  let width = html.clientWidth;
  let height = html.clientHeight;
  let x = 0;
  let y = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    const visualViewportBased = isWebKit();
    if (!visualViewportBased || visualViewportBased && strategy === 'fixed') {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }
  return {
    width,
    height,
    x,
    y
  };
}

// Returns the inner client rect, subtracting scrollbars if present.
function getInnerBoundingClientRect(element, strategy) {
  const clientRect = getBoundingClientRect(element, true, strategy === 'fixed');
  const top = clientRect.top + element.clientTop;
  const left = clientRect.left + element.clientLeft;
  const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
  const width = element.clientWidth * scale.x;
  const height = element.clientHeight * scale.y;
  const x = left * scale.x;
  const y = top * scale.y;
  return {
    width,
    height,
    x,
    y
  };
}
function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
  let rect;
  if (clippingAncestor === 'viewport') {
    rect = getViewportRect(element, strategy);
  } else if (clippingAncestor === 'document') {
    rect = getDocumentRect(getDocumentElement(element));
  } else if (isElement(clippingAncestor)) {
    rect = getInnerBoundingClientRect(clippingAncestor, strategy);
  } else {
    const visualOffsets = getVisualOffsets(element);
    rect = {
      ...clippingAncestor,
      x: clippingAncestor.x - visualOffsets.x,
      y: clippingAncestor.y - visualOffsets.y
    };
  }
  return rectToClientRect(rect);
}
function hasFixedPositionAncestor(element, stopNode) {
  const parentNode = getParentNode(element);
  if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
    return false;
  }
  return getComputedStyle(parentNode).position === 'fixed' || hasFixedPositionAncestor(parentNode, stopNode);
}

// A "clipping ancestor" is an `overflow` element with the characteristic of
// clipping (or hiding) child elements. This returns all clipping ancestors
// of the given element up the tree.
function getClippingElementAncestors(element, cache) {
  const cachedResult = cache.get(element);
  if (cachedResult) {
    return cachedResult;
  }
  let result = getOverflowAncestors(element, [], false).filter(el => isElement(el) && getNodeName(el) !== 'body');
  let currentContainingBlockComputedStyle = null;
  const elementIsFixed = getComputedStyle(element).position === 'fixed';
  let currentNode = elementIsFixed ? getParentNode(element) : element;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
  while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
    const computedStyle = getComputedStyle(currentNode);
    const currentNodeIsContaining = isContainingBlock(currentNode);
    if (!currentNodeIsContaining && computedStyle.position === 'fixed') {
      currentContainingBlockComputedStyle = null;
    }
    const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === 'static' && !!currentContainingBlockComputedStyle && ['absolute', 'fixed'].includes(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
    if (shouldDropCurrentNode) {
      // Drop non-containing blocks.
      result = result.filter(ancestor => ancestor !== currentNode);
    } else {
      // Record last containing block for next iteration.
      currentContainingBlockComputedStyle = computedStyle;
    }
    currentNode = getParentNode(currentNode);
  }
  cache.set(element, result);
  return result;
}

// Gets the maximum area that the element is visible in due to any number of
// clipping ancestors.
function getClippingRect(_ref) {
  let {
    element,
    boundary,
    rootBoundary,
    strategy
  } = _ref;
  const elementClippingAncestors = boundary === 'clippingAncestors' ? getClippingElementAncestors(element, this._c) : [].concat(boundary);
  const clippingAncestors = [...elementClippingAncestors, rootBoundary];
  const firstClippingAncestor = clippingAncestors[0];
  const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
    const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
  return {
    width: clippingRect.right - clippingRect.left,
    height: clippingRect.bottom - clippingRect.top,
    x: clippingRect.left,
    y: clippingRect.top
  };
}

function getDimensions(element) {
  return getCssDimensions(element);
}

function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  const isFixed = strategy === 'fixed';
  const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const offsets = createCoords(0);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }
  return {
    x: rect.left + scroll.scrollLeft - offsets.x,
    y: rect.top + scroll.scrollTop - offsets.y,
    width: rect.width,
    height: rect.height
  };
}

function getTrueOffsetParent(element, polyfill) {
  if (!isHTMLElement(element) || getComputedStyle(element).position === 'fixed') {
    return null;
  }
  if (polyfill) {
    return polyfill(element);
  }
  return element.offsetParent;
}

// Gets the closest ancestor positioned element. Handles some edge cases,
// such as table ancestors and cross browser bugs.
function getOffsetParent(element, polyfill) {
  const window = getWindow(element);
  if (!isHTMLElement(element)) {
    return window;
  }
  let offsetParent = getTrueOffsetParent(element, polyfill);
  while (offsetParent && isTableElement(offsetParent) && getComputedStyle(offsetParent).position === 'static') {
    offsetParent = getTrueOffsetParent(offsetParent, polyfill);
  }
  if (offsetParent && (getNodeName(offsetParent) === 'html' || getNodeName(offsetParent) === 'body' && getComputedStyle(offsetParent).position === 'static' && !isContainingBlock(offsetParent))) {
    return window;
  }
  return offsetParent || getContainingBlock(element) || window;
}

const getElementRects = async function (_ref) {
  let {
    reference,
    floating,
    strategy
  } = _ref;
  const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
  const getDimensionsFn = this.getDimensions;
  return {
    reference: getRectRelativeToOffsetParent(reference, await getOffsetParentFn(floating), strategy),
    floating: {
      x: 0,
      y: 0,
      ...(await getDimensionsFn(floating))
    }
  };
};

function isRTL(element) {
  return getComputedStyle(element).direction === 'rtl';
}

const platform = {
  convertOffsetParentRelativeRectToViewportRelativeRect,
  getDocumentElement: getDocumentElement,
  getClippingRect,
  getOffsetParent,
  getElementRects,
  getClientRects,
  getDimensions,
  getScale,
  isElement: isElement,
  isRTL
};

// https://samthor.au/2021/observing-dom/
function observeMove(element, onMove) {
  let io = null;
  let timeoutId;
  const root = getDocumentElement(element);
  function cleanup() {
    clearTimeout(timeoutId);
    io && io.disconnect();
    io = null;
  }
  function refresh(skip, threshold) {
    if (skip === void 0) {
      skip = false;
    }
    if (threshold === void 0) {
      threshold = 1;
    }
    cleanup();
    const {
      left,
      top,
      width,
      height
    } = element.getBoundingClientRect();
    if (!skip) {
      onMove();
    }
    if (!width || !height) {
      return;
    }
    const insetTop = floor(top);
    const insetRight = floor(root.clientWidth - (left + width));
    const insetBottom = floor(root.clientHeight - (top + height));
    const insetLeft = floor(left);
    const rootMargin = -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px";
    const options = {
      rootMargin,
      threshold: max(0, min(1, threshold)) || 1
    };
    let isFirstUpdate = true;
    function handleObserve(entries) {
      const ratio = entries[0].intersectionRatio;
      if (ratio !== threshold) {
        if (!isFirstUpdate) {
          return refresh();
        }
        if (!ratio) {
          timeoutId = setTimeout(() => {
            refresh(false, 1e-7);
          }, 100);
        } else {
          refresh(false, ratio);
        }
      }
      isFirstUpdate = false;
    }

    // Older browsers don't support a `document` as the root and will throw an
    // error.
    try {
      io = new IntersectionObserver(handleObserve, {
        ...options,
        // Handle <iframe>s
        root: root.ownerDocument
      });
    } catch (e) {
      io = new IntersectionObserver(handleObserve, options);
    }
    io.observe(element);
  }
  refresh(true);
  return cleanup;
}

/**
 * Automatically updates the position of the floating element when necessary.
 * Should only be called when the floating element is mounted on the DOM or
 * visible on the screen.
 * @returns cleanup function that should be invoked when the floating element is
 * removed from the DOM or hidden from the screen.
 * @see https://floating-ui.com/docs/autoUpdate
 */
function autoUpdate(reference, floating, update, options) {
  if (options === void 0) {
    options = {};
  }
  const {
    ancestorScroll = true,
    ancestorResize = true,
    elementResize = typeof ResizeObserver === 'function',
    layoutShift = typeof IntersectionObserver === 'function',
    animationFrame = false
  } = options;
  const referenceEl = unwrapElement(reference);
  const ancestors = ancestorScroll || ancestorResize ? [...(referenceEl ? getOverflowAncestors(referenceEl) : []), ...getOverflowAncestors(floating)] : [];
  ancestors.forEach(ancestor => {
    ancestorScroll && ancestor.addEventListener('scroll', update, {
      passive: true
    });
    ancestorResize && ancestor.addEventListener('resize', update);
  });
  const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update) : null;
  let reobserveFrame = -1;
  let resizeObserver = null;
  if (elementResize) {
    resizeObserver = new ResizeObserver(_ref => {
      let [firstEntry] = _ref;
      if (firstEntry && firstEntry.target === referenceEl && resizeObserver) {
        // Prevent update loops when using the `size` middleware.
        // https://github.com/floating-ui/floating-ui/issues/1740
        resizeObserver.unobserve(floating);
        cancelAnimationFrame(reobserveFrame);
        reobserveFrame = requestAnimationFrame(() => {
          resizeObserver && resizeObserver.observe(floating);
        });
      }
      update();
    });
    if (referenceEl && !animationFrame) {
      resizeObserver.observe(referenceEl);
    }
    resizeObserver.observe(floating);
  }
  let frameId;
  let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
  if (animationFrame) {
    frameLoop();
  }
  function frameLoop() {
    const nextRefRect = getBoundingClientRect(reference);
    if (prevRefRect && (nextRefRect.x !== prevRefRect.x || nextRefRect.y !== prevRefRect.y || nextRefRect.width !== prevRefRect.width || nextRefRect.height !== prevRefRect.height)) {
      update();
    }
    prevRefRect = nextRefRect;
    frameId = requestAnimationFrame(frameLoop);
  }
  update();
  return () => {
    ancestors.forEach(ancestor => {
      ancestorScroll && ancestor.removeEventListener('scroll', update);
      ancestorResize && ancestor.removeEventListener('resize', update);
    });
    cleanupIo && cleanupIo();
    resizeObserver && resizeObserver.disconnect();
    resizeObserver = null;
    if (animationFrame) {
      cancelAnimationFrame(frameId);
    }
  };
}

/**
 * Computes the `x` and `y` coordinates that will place the floating element
 * next to a reference element when it is given a certain CSS positioning
 * strategy.
 */
const floating_ui_dom_esm_computePosition = (reference, floating, options) => {
  // This caches the expensive `getClippingElementAncestors` function so that
  // multiple lifecycle resets re-use the same result. It only lives for a
  // single call. If other functions become expensive, we can add them as well.
  const cache = new Map();
  const mergedOptions = {
    platform,
    ...options
  };
  const platformWithCache = {
    ...mergedOptions.platform,
    _c: cache
  };
  return computePosition(reference, floating, {
    ...mergedOptions,
    platform: platformWithCache
  });
};




/***/ }),

/***/ 3311:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEFAULT_ID: function() { return /* binding */ DEFAULT_ID; },
/* harmony export */   Loader: function() { return /* binding */ Loader; },
/* harmony export */   LoaderStatus: function() { return /* binding */ LoaderStatus; }
/* harmony export */ });
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

// do not edit .js files directly - edit src/index.jst



var fastDeepEqual = function equal(a, b) {
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false;

    var length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (!equal(a[i], b[i])) return false;
      return true;
    }



    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (i = length; i-- !== 0;)
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

    for (i = length; i-- !== 0;) {
      var key = keys[i];

      if (!equal(a[key], b[key])) return false;
    }

    return true;
  }

  // true if both NaN, false otherwise
  return a!==a && b!==b;
};

/**
 * Copyright 2019 Google LLC. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at.
 *
 *      Http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const DEFAULT_ID = "__googleMapsScriptId";
/**
 * The status of the [[Loader]].
 */
var LoaderStatus;
(function (LoaderStatus) {
    LoaderStatus[LoaderStatus["INITIALIZED"] = 0] = "INITIALIZED";
    LoaderStatus[LoaderStatus["LOADING"] = 1] = "LOADING";
    LoaderStatus[LoaderStatus["SUCCESS"] = 2] = "SUCCESS";
    LoaderStatus[LoaderStatus["FAILURE"] = 3] = "FAILURE";
})(LoaderStatus || (LoaderStatus = {}));
/**
 * [[Loader]] makes it easier to add Google Maps JavaScript API to your application
 * dynamically using
 * [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
 * It works by dynamically creating and appending a script node to the the
 * document head and wrapping the callback function so as to return a promise.
 *
 * ```
 * const loader = new Loader({
 *   apiKey: "",
 *   version: "weekly",
 *   libraries: ["places"]
 * });
 *
 * loader.load().then((google) => {
 *   const map = new google.maps.Map(...)
 * })
 * ```
 */
class Loader {
    /**
     * Creates an instance of Loader using [[LoaderOptions]]. No defaults are set
     * using this library, instead the defaults are set by the Google Maps
     * JavaScript API server.
     *
     * ```
     * const loader = Loader({apiKey, version: 'weekly', libraries: ['places']});
     * ```
     */
    constructor({ apiKey, authReferrerPolicy, channel, client, id = DEFAULT_ID, language, libraries = [], mapIds, nonce, region, retries = 3, url = "https://maps.googleapis.com/maps/api/js", version, }) {
        this.callbacks = [];
        this.done = false;
        this.loading = false;
        this.errors = [];
        this.apiKey = apiKey;
        this.authReferrerPolicy = authReferrerPolicy;
        this.channel = channel;
        this.client = client;
        this.id = id || DEFAULT_ID; // Do not allow empty string
        this.language = language;
        this.libraries = libraries;
        this.mapIds = mapIds;
        this.nonce = nonce;
        this.region = region;
        this.retries = retries;
        this.url = url;
        this.version = version;
        if (Loader.instance) {
            if (!fastDeepEqual(this.options, Loader.instance.options)) {
                throw new Error(`Loader must not be called again with different options. ${JSON.stringify(this.options)} !== ${JSON.stringify(Loader.instance.options)}`);
            }
            return Loader.instance;
        }
        Loader.instance = this;
    }
    get options() {
        return {
            version: this.version,
            apiKey: this.apiKey,
            channel: this.channel,
            client: this.client,
            id: this.id,
            libraries: this.libraries,
            language: this.language,
            region: this.region,
            mapIds: this.mapIds,
            nonce: this.nonce,
            url: this.url,
            authReferrerPolicy: this.authReferrerPolicy,
        };
    }
    get status() {
        if (this.errors.length) {
            return LoaderStatus.FAILURE;
        }
        if (this.done) {
            return LoaderStatus.SUCCESS;
        }
        if (this.loading) {
            return LoaderStatus.LOADING;
        }
        return LoaderStatus.INITIALIZED;
    }
    get failed() {
        return this.done && !this.loading && this.errors.length >= this.retries + 1;
    }
    /**
     * CreateUrl returns the Google Maps JavaScript API script url given the [[LoaderOptions]].
     *
     * @ignore
     * @deprecated
     */
    createUrl() {
        let url = this.url;
        url += `?callback=__googleMapsCallback`;
        if (this.apiKey) {
            url += `&key=${this.apiKey}`;
        }
        if (this.channel) {
            url += `&channel=${this.channel}`;
        }
        if (this.client) {
            url += `&client=${this.client}`;
        }
        if (this.libraries.length > 0) {
            url += `&libraries=${this.libraries.join(",")}`;
        }
        if (this.language) {
            url += `&language=${this.language}`;
        }
        if (this.region) {
            url += `&region=${this.region}`;
        }
        if (this.version) {
            url += `&v=${this.version}`;
        }
        if (this.mapIds) {
            url += `&map_ids=${this.mapIds.join(",")}`;
        }
        if (this.authReferrerPolicy) {
            url += `&auth_referrer_policy=${this.authReferrerPolicy}`;
        }
        return url;
    }
    deleteScript() {
        const script = document.getElementById(this.id);
        if (script) {
            script.remove();
        }
    }
    /**
     * Load the Google Maps JavaScript API script and return a Promise.
     * @deprecated, use importLibrary() instead.
     */
    load() {
        return this.loadPromise();
    }
    /**
     * Load the Google Maps JavaScript API script and return a Promise.
     *
     * @ignore
     * @deprecated, use importLibrary() instead.
     */
    loadPromise() {
        return new Promise((resolve, reject) => {
            this.loadCallback((err) => {
                if (!err) {
                    resolve(window.google);
                }
                else {
                    reject(err.error);
                }
            });
        });
    }
    importLibrary(name) {
        this.execute();
        return google.maps.importLibrary(name);
    }
    /**
     * Load the Google Maps JavaScript API script with a callback.
     * @deprecated, use importLibrary() instead.
     */
    loadCallback(fn) {
        this.callbacks.push(fn);
        this.execute();
    }
    /**
     * Set the script on document.
     */
    setScript() {
        var _a, _b;
        if (document.getElementById(this.id)) {
            // TODO wrap onerror callback for cases where the script was loaded elsewhere
            this.callback();
            return;
        }
        const params = {
            key: this.apiKey,
            channel: this.channel,
            client: this.client,
            libraries: this.libraries.length && this.libraries,
            v: this.version,
            mapIds: this.mapIds,
            language: this.language,
            region: this.region,
            authReferrerPolicy: this.authReferrerPolicy,
        };
        // keep the URL minimal:
        Object.keys(params).forEach(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (key) => !params[key] && delete params[key]);
        if (!((_b = (_a = window === null || window === void 0 ? void 0 : window.google) === null || _a === void 0 ? void 0 : _a.maps) === null || _b === void 0 ? void 0 : _b.importLibrary)) {
            // tweaked copy of https://developers.google.com/maps/documentation/javascript/load-maps-js-api#dynamic-library-import
            // which also sets the base url, the id, and the nonce
            /* eslint-disable */
            ((g) => {
                // @ts-ignore
                let h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window;
                // @ts-ignore
                b = b[c] || (b[c] = {});
                // @ts-ignore
                const d = b.maps || (b.maps = {}), r = new Set(), e = new URLSearchParams(), u = () => 
                // @ts-ignore
                h || (h = new Promise((f, n) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    yield (a = m.createElement("script"));
                    a.id = this.id;
                    e.set("libraries", [...r] + "");
                    // @ts-ignore
                    for (k in g)
                        e.set(k.replace(/[A-Z]/g, (t) => "_" + t[0].toLowerCase()), g[k]);
                    e.set("callback", c + ".maps." + q);
                    a.src = this.url + `?` + e;
                    d[q] = f;
                    a.onerror = () => (h = n(Error(p + " could not load.")));
                    // @ts-ignore
                    a.nonce = this.nonce || ((_a = m.querySelector("script[nonce]")) === null || _a === void 0 ? void 0 : _a.nonce) || "";
                    m.head.append(a);
                })));
                // @ts-ignore
                d[l] ? console.warn(p + " only loads once. Ignoring:", g) : (d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)));
            })(params);
            /* eslint-enable */
        }
        // While most libraries populate the global namespace when loaded via bootstrap params,
        // this is not the case for "marker" when used with the inline bootstrap loader
        // (and maybe others in the future). So ensure there is an importLibrary for each:
        const libraryPromises = this.libraries.map((library) => this.importLibrary(library));
        // ensure at least one library, to kick off loading...
        if (!libraryPromises.length) {
            libraryPromises.push(this.importLibrary("core"));
        }
        Promise.all(libraryPromises).then(() => this.callback(), (error) => {
            const event = new ErrorEvent("error", { error }); // for backwards compat
            this.loadErrorCallback(event);
        });
    }
    /**
     * Reset the loader state.
     */
    reset() {
        this.deleteScript();
        this.done = false;
        this.loading = false;
        this.errors = [];
        this.onerrorEvent = null;
    }
    resetIfRetryingFailed() {
        if (this.failed) {
            this.reset();
        }
    }
    loadErrorCallback(e) {
        this.errors.push(e);
        if (this.errors.length <= this.retries) {
            const delay = this.errors.length * Math.pow(2, this.errors.length);
            console.error(`Failed to load Google Maps script, retrying in ${delay} ms.`);
            setTimeout(() => {
                this.deleteScript();
                this.setScript();
            }, delay);
        }
        else {
            this.onerrorEvent = e;
            this.callback();
        }
    }
    callback() {
        this.done = true;
        this.loading = false;
        this.callbacks.forEach((cb) => {
            cb(this.onerrorEvent);
        });
        this.callbacks = [];
    }
    execute() {
        this.resetIfRetryingFailed();
        if (this.done) {
            this.callback();
        }
        else {
            // short circuit and warn if google.maps is already loaded
            if (window.google && window.google.maps && window.google.maps.version) {
                console.warn("Google Maps already loaded outside @googlemaps/js-api-loader." +
                    "This may result in undesirable behavior as options and script parameters may not match.");
                this.callback();
                return;
            }
            if (this.loading) ;
            else {
                this.loading = true;
                this.setScript();
            }
        }
    }
}


//# sourceMappingURL=index.esm.js.map


/***/ }),

/***/ 9635:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ ClassNames; }
/* harmony export */ });
const defaultOptions = {
  active: true,
  breakpoints: {},
  selected: 'is-selected',
  draggable: 'is-draggable',
  dragging: 'is-dragging'
};

function removeClass(node, className) {
  const cl = node.classList;
  if (className && cl.contains(className)) cl.remove(className);
}
function addClass(node, className) {
  const cl = node.classList;
  if (className && !cl.contains(className)) cl.add(className);
}

function ClassNames(userOptions = {}) {
  let options;
  let emblaApi;
  let root;
  let slides;
  const selectedEvents = ['select', 'pointerUp'];
  const draggingEvents = ['pointerDown', 'pointerUp'];
  function init(emblaApiInstance, optionsHandler) {
    emblaApi = emblaApiInstance;
    const {
      mergeOptions,
      optionsAtMedia
    } = optionsHandler;
    const optionsBase = mergeOptions(defaultOptions, ClassNames.globalOptions);
    const allOptions = mergeOptions(optionsBase, userOptions);
    options = optionsAtMedia(allOptions);
    root = emblaApi.rootNode();
    slides = emblaApi.slideNodes();
    const isDraggable = !!emblaApi.internalEngine().options.watchDrag;
    if (isDraggable) {
      addClass(root, options.draggable);
    }
    if (options.dragging) {
      draggingEvents.forEach(evt => emblaApi.on(evt, toggleDraggingClass));
    }
    if (options.selected) {
      selectedEvents.forEach(evt => emblaApi.on(evt, toggleSelectedClass));
      toggleSelectedClass();
    }
  }
  function destroy() {
    removeClass(root, options.draggable);
    draggingEvents.forEach(evt => emblaApi.off(evt, toggleDraggingClass));
    selectedEvents.forEach(evt => emblaApi.off(evt, toggleSelectedClass));
    slides.forEach(slide => removeClass(slide, options.selected));
  }
  function toggleDraggingClass(_, evt) {
    if (evt === 'pointerDown') addClass(root, options.dragging);else removeClass(root, options.dragging);
  }
  function toggleSelectedClass() {
    const inView = emblaApi.slidesInView(true);
    const notInView = emblaApi.slidesNotInView(true);
    notInView.forEach(index => removeClass(slides[index], options.selected));
    inView.forEach(index => addClass(slides[index], options.selected));
  }
  const self = {
    name: 'classNames',
    options: userOptions,
    init,
    destroy
  };
  return self;
}
ClassNames.globalOptions = undefined;


//# sourceMappingURL=embla-carousel-class-names.esm.js.map


/***/ }),

/***/ 9298:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  WheelGesturesPlugin: function() { return /* binding */ WheelGesturesPlugin; }
});

;// CONCATENATED MODULE: ./node_modules/wheel-gestures/dist/wheel-gestures.esm.js
function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var DECAY = 0.996;
/**
 * movement projection based on velocity
 * @param velocityPxMs
 * @param decay
 */

var projection = function projection(velocityPxMs, decay) {
  if (decay === void 0) {
    decay = DECAY;
  }

  return velocityPxMs * decay / (1 - decay);
};

function lastOf(array) {
  return array[array.length - 1];
}
function average(numbers) {
  return numbers.reduce(function (a, b) {
    return a + b;
  }) / numbers.length;
}
var clamp = function clamp(value, min, max) {
  return Math.min(Math.max(min, value), max);
};
function addVectors(v1, v2) {
  if (v1.length !== v2.length) {
    throw new Error('vectors must be same length');
  }

  return v1.map(function (val, i) {
    return val + v2[i];
  });
}
function absMax(numbers) {
  return Math.max.apply(Math, numbers.map(Math.abs));
} // eslint-disable-next-line @typescript-eslint/ban-types

function deepFreeze(o) {
  Object.freeze(o);
  Object.values(o).forEach(function (value) {
    if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  });
  return o;
}

function EventBus() {
  var listeners = {};

  function on(type, listener) {
    listeners[type] = (listeners[type] || []).concat(listener);
    return function () {
      return off(type, listener);
    };
  }

  function off(type, listener) {
    listeners[type] = (listeners[type] || []).filter(function (l) {
      return l !== listener;
    });
  }

  function dispatch(type, data) {
    if (!(type in listeners)) return;
    listeners[type].forEach(function (l) {
      return l(data);
    });
  }

  return deepFreeze({
    on: on,
    off: off,
    dispatch: dispatch
  });
}

function WheelTargetObserver(eventListener) {
  var targets = []; // add event listener to target element

  var observe = function observe(target) {
    target.addEventListener('wheel', eventListener, {
      passive: false
    });
    targets.push(target);
    return function () {
      return unobserve(target);
    };
  }; /// remove event listener from target element


  var unobserve = function unobserve(target) {
    target.removeEventListener('wheel', eventListener);
    targets = targets.filter(function (t) {
      return t !== target;
    });
  }; // stops watching all of its target elements for visibility changes.


  var disconnect = function disconnect() {
    targets.forEach(unobserve);
  };

  return deepFreeze({
    observe: observe,
    unobserve: unobserve,
    disconnect: disconnect
  });
}

var LINE_HEIGHT = 16 * 1.125;
var PAGE_HEIGHT = typeof window !== 'undefined' && window.innerHeight || 800;
var DELTA_MODE_UNIT = [1, LINE_HEIGHT, PAGE_HEIGHT];
function normalizeWheel(e) {
  var deltaX = e.deltaX * DELTA_MODE_UNIT[e.deltaMode];
  var deltaY = e.deltaY * DELTA_MODE_UNIT[e.deltaMode];
  var deltaZ = (e.deltaZ || 0) * DELTA_MODE_UNIT[e.deltaMode];
  return {
    timeStamp: e.timeStamp,
    axisDelta: [deltaX, deltaY, deltaZ]
  };
}
var reverseAll = [-1, -1, -1];
function reverseAxisDeltaSign(wheel, reverseSign) {
  if (!reverseSign) {
    return wheel;
  }

  var multipliers = reverseSign === true ? reverseAll : reverseSign.map(function (shouldReverse) {
    return shouldReverse ? -1 : 1;
  });
  return _extends({}, wheel, {
    axisDelta: wheel.axisDelta.map(function (delta, i) {
      return delta * multipliers[i];
    })
  });
}
var DELTA_MAX_ABS = 700;
var clampAxisDelta = function clampAxisDelta(wheel) {
  return _extends({}, wheel, {
    axisDelta: wheel.axisDelta.map(function (delta) {
      return clamp(delta, -DELTA_MAX_ABS, DELTA_MAX_ABS);
    })
  });
};

var __DEV__ = "production" !== 'production';
var ACC_FACTOR_MIN = 0.6;
var ACC_FACTOR_MAX = 0.96;
var WHEELEVENTS_TO_MERGE = 2;
var WHEELEVENTS_TO_ANALAZE = 5;

var configDefaults = /*#__PURE__*/deepFreeze({
  preventWheelAction: true,
  reverseSign: [true, true, false]
});

var WILL_END_TIMEOUT_DEFAULT = 400;
function createWheelGesturesState() {
  return {
    isStarted: false,
    isStartPublished: false,
    isMomentum: false,
    startTime: 0,
    lastAbsDelta: Infinity,
    axisMovement: [0, 0, 0],
    axisVelocity: [0, 0, 0],
    accelerationFactors: [],
    scrollPoints: [],
    scrollPointsToMerge: [],
    willEndTimeout: WILL_END_TIMEOUT_DEFAULT
  };
}

function WheelGestures(optionsParam) {
  if (optionsParam === void 0) {
    optionsParam = {};
  }

  var _EventBus = EventBus(),
      on = _EventBus.on,
      off = _EventBus.off,
      dispatch = _EventBus.dispatch;

  var config = configDefaults;
  var state = createWheelGesturesState();
  var currentEvent;
  var negativeZeroFingerUpSpecialEvent = false;
  var prevWheelEventState;

  var feedWheel = function feedWheel(wheelEvents) {
    if (Array.isArray(wheelEvents)) {
      wheelEvents.forEach(function (wheelEvent) {
        return processWheelEventData(wheelEvent);
      });
    } else {
      processWheelEventData(wheelEvents);
    }
  };

  var updateOptions = function updateOptions(newOptions) {
    if (newOptions === void 0) {
      newOptions = {};
    }

    if (Object.values(newOptions).some(function (option) {
      return option === undefined || option === null;
    })) {
      __DEV__ && console.error('updateOptions ignored! undefined & null options not allowed');
      return config;
    }

    return config = deepFreeze(_extends({}, configDefaults, config, newOptions));
  };

  var publishWheel = function publishWheel(additionalData) {
    var wheelEventState = _extends({
      event: currentEvent,
      isStart: false,
      isEnding: false,
      isMomentumCancel: false,
      isMomentum: state.isMomentum,
      axisDelta: [0, 0, 0],
      axisVelocity: state.axisVelocity,
      axisMovement: state.axisMovement,

      get axisMovementProjection() {
        return addVectors(wheelEventState.axisMovement, wheelEventState.axisVelocity.map(function (velocity) {
          return projection(velocity);
        }));
      }

    }, additionalData);

    dispatch('wheel', _extends({}, wheelEventState, {
      previous: prevWheelEventState
    })); // keep reference without previous, otherwise we would create a long chain

    prevWheelEventState = wheelEventState;
  }; // should prevent when there is mainly movement on the desired axis


  var shouldPreventDefault = function shouldPreventDefault(deltaMaxAbs, axisDelta) {
    var _config = config,
        preventWheelAction = _config.preventWheelAction;
    var deltaX = axisDelta[0],
        deltaY = axisDelta[1],
        deltaZ = axisDelta[2];
    if (typeof preventWheelAction === 'boolean') return preventWheelAction;

    switch (preventWheelAction) {
      case 'x':
        return Math.abs(deltaX) >= deltaMaxAbs;

      case 'y':
        return Math.abs(deltaY) >= deltaMaxAbs;

      case 'z':
        return Math.abs(deltaZ) >= deltaMaxAbs;

      default:
        __DEV__ && console.warn('unsupported preventWheelAction value: ' + preventWheelAction, 'warn');
        return false;
    }
  };

  var processWheelEventData = function processWheelEventData(wheelEvent) {
    var _clampAxisDelta = clampAxisDelta(reverseAxisDeltaSign(normalizeWheel(wheelEvent), config.reverseSign)),
        axisDelta = _clampAxisDelta.axisDelta,
        timeStamp = _clampAxisDelta.timeStamp;

    var deltaMaxAbs = absMax(axisDelta);

    if (wheelEvent.preventDefault && shouldPreventDefault(deltaMaxAbs, axisDelta)) {
      wheelEvent.preventDefault();
    }

    if (!state.isStarted) {
      start();
    } // check if user started scrolling again -> cancel
    else if (state.isMomentum && deltaMaxAbs > Math.max(2, state.lastAbsDelta * 2)) {
        end(true);
        start();
      } // special finger up event on windows + blink


    if (deltaMaxAbs === 0 && Object.is && Object.is(wheelEvent.deltaX, -0)) {
      negativeZeroFingerUpSpecialEvent = true; // return -> zero delta event should not influence velocity

      return;
    }

    currentEvent = wheelEvent;
    state.axisMovement = addVectors(state.axisMovement, axisDelta);
    state.lastAbsDelta = deltaMaxAbs;
    state.scrollPointsToMerge.push({
      axisDelta: axisDelta,
      timeStamp: timeStamp
    });
    mergeScrollPointsCalcVelocity(); // only wheel event (move) and not start/end get the delta values

    publishWheel({
      axisDelta: axisDelta,
      isStart: !state.isStartPublished
    }); // state.isMomentum ? MOMENTUM_WHEEL : WHEEL, { axisDelta })
    // publish start after velocity etc. have been updated

    state.isStartPublished = true; // calc debounced end function, to recognize end of wheel event stream

    willEnd();
  };

  var mergeScrollPointsCalcVelocity = function mergeScrollPointsCalcVelocity() {
    if (state.scrollPointsToMerge.length === WHEELEVENTS_TO_MERGE) {
      state.scrollPoints.unshift({
        axisDeltaSum: state.scrollPointsToMerge.map(function (b) {
          return b.axisDelta;
        }).reduce(addVectors),
        timeStamp: average(state.scrollPointsToMerge.map(function (b) {
          return b.timeStamp;
        }))
      }); // only update velocity after a merged scrollpoint was generated

      updateVelocity(); // reset toMerge array

      state.scrollPointsToMerge.length = 0; // after calculation of velocity only keep the most recent merged scrollPoint

      state.scrollPoints.length = 1;

      if (!state.isMomentum) {
        detectMomentum();
      }
    } else if (!state.isStartPublished) {
      updateStartVelocity();
    }
  };

  var updateStartVelocity = function updateStartVelocity() {
    state.axisVelocity = lastOf(state.scrollPointsToMerge).axisDelta.map(function (d) {
      return d / state.willEndTimeout;
    });
  };

  var updateVelocity = function updateVelocity() {
    // need to have two recent points to calc velocity
    var _state$scrollPoints = state.scrollPoints,
        latestScrollPoint = _state$scrollPoints[0],
        prevScrollPoint = _state$scrollPoints[1];

    if (!prevScrollPoint || !latestScrollPoint) {
      return;
    } // time delta


    var deltaTime = latestScrollPoint.timeStamp - prevScrollPoint.timeStamp;

    if (deltaTime <= 0) {
      __DEV__ && console.warn('invalid deltaTime');
      return;
    } // calc the velocity per axes


    var velocity = latestScrollPoint.axisDeltaSum.map(function (d) {
      return d / deltaTime;
    }); // calc the acceleration factor per axis

    var accelerationFactor = velocity.map(function (v, i) {
      return v / (state.axisVelocity[i] || 1);
    });
    state.axisVelocity = velocity;
    state.accelerationFactors.push(accelerationFactor);
    updateWillEndTimeout(deltaTime);
  };

  var updateWillEndTimeout = function updateWillEndTimeout(deltaTime) {
    // use current time between events rounded up and increased by a bit as timeout
    var newTimeout = Math.ceil(deltaTime / 10) * 10 * 1.2; // double the timeout, when momentum was not detected yet

    if (!state.isMomentum) {
      newTimeout = Math.max(100, newTimeout * 2);
    }

    state.willEndTimeout = Math.min(1000, Math.round(newTimeout));
  };

  var accelerationFactorInMomentumRange = function accelerationFactorInMomentumRange(accFactor) {
    // when main axis is the the other one and there is no movement/change on the current one
    if (accFactor === 0) return true;
    return accFactor <= ACC_FACTOR_MAX && accFactor >= ACC_FACTOR_MIN;
  };

  var detectMomentum = function detectMomentum() {
    if (state.accelerationFactors.length >= WHEELEVENTS_TO_ANALAZE) {
      if (negativeZeroFingerUpSpecialEvent) {
        negativeZeroFingerUpSpecialEvent = false;

        if (absMax(state.axisVelocity) >= 0.2) {
          recognizedMomentum();
          return;
        }
      }

      var recentAccelerationFactors = state.accelerationFactors.slice(WHEELEVENTS_TO_ANALAZE * -1); // check recent acceleration / deceleration factors
      // all recent need to match, if any did not match

      var detectedMomentum = recentAccelerationFactors.every(function (accFac) {
        // when both axis decelerate exactly in the same rate it is very likely caused by momentum
        var sameAccFac = !!accFac.reduce(function (f1, f2) {
          return f1 && f1 < 1 && f1 === f2 ? 1 : 0;
        }); // check if acceleration factor is within momentum range

        var bothAreInRangeOrZero = accFac.filter(accelerationFactorInMomentumRange).length === accFac.length; // one the requirements must be fulfilled

        return sameAccFac || bothAreInRangeOrZero;
      });

      if (detectedMomentum) {
        recognizedMomentum();
      } // only keep the most recent events


      state.accelerationFactors = recentAccelerationFactors;
    }
  };

  var recognizedMomentum = function recognizedMomentum() {
    state.isMomentum = true;
  };

  var start = function start() {
    state = createWheelGesturesState();
    state.isStarted = true;
    state.startTime = Date.now();
    prevWheelEventState = undefined;
    negativeZeroFingerUpSpecialEvent = false;
  };

  var willEnd = function () {
    var willEndId;
    return function () {
      clearTimeout(willEndId);
      willEndId = setTimeout(end, state.willEndTimeout);
    };
  }();

  var end = function end(isMomentumCancel) {
    if (isMomentumCancel === void 0) {
      isMomentumCancel = false;
    }

    if (!state.isStarted) return;

    if (state.isMomentum && isMomentumCancel) {
      publishWheel({
        isEnding: true,
        isMomentumCancel: true
      });
    } else {
      publishWheel({
        isEnding: true
      });
    }

    state.isMomentum = false;
    state.isStarted = false;
  };

  var _WheelTargetObserver = WheelTargetObserver(feedWheel),
      observe = _WheelTargetObserver.observe,
      unobserve = _WheelTargetObserver.unobserve,
      disconnect = _WheelTargetObserver.disconnect;

  updateOptions(optionsParam);
  return deepFreeze({
    on: on,
    off: off,
    observe: observe,
    unobserve: unobserve,
    disconnect: disconnect,
    feedWheel: feedWheel,
    updateOptions: updateOptions
  });
}

/* harmony default export */ var wheel_gestures_esm = (WheelGestures);

//# sourceMappingURL=wheel-gestures.esm.js.map

;// CONCATENATED MODULE: ./node_modules/embla-carousel-wheel-gestures/dist/embla-carousel-wheel-gestures.esm.js


var defaultOptions = {
  active: true,
  breakpoints: {},
  wheelDraggingClass: 'is-wheel-dragging',
  forceWheelAxis: undefined,
  target: undefined
};
WheelGesturesPlugin.globalOptions = undefined;

var embla_carousel_wheel_gestures_esm_DEV_ = "production" !== 'production';

function WheelGesturesPlugin(userOptions) {
  if (userOptions === void 0) {
    userOptions = {};
  }

  var options;

  var cleanup = function cleanup() {};

  function init(embla, optionsHandler) {
    var _options$target, _options$forceWheelAx;

    var mergeOptions = optionsHandler.mergeOptions,
        optionsAtMedia = optionsHandler.optionsAtMedia;
    var optionsBase = mergeOptions(defaultOptions, WheelGesturesPlugin.globalOptions);
    var allOptions = mergeOptions(optionsBase, userOptions);
    options = optionsAtMedia(allOptions);
    var engine = embla.internalEngine();
    var targetNode = (_options$target = options.target) != null ? _options$target : embla.containerNode().parentNode;
    var wheelAxis = (_options$forceWheelAx = options.forceWheelAxis) != null ? _options$forceWheelAx : engine.options.axis;
    var wheelGestures = wheel_gestures_esm({
      preventWheelAction: wheelAxis,
      reverseSign: [true, true, false]
    });
    var unobserveTargetNode = wheelGestures.observe(targetNode);
    var offWheel = wheelGestures.on('wheel', handleWheel);
    var isStarted = false;
    var startEvent;

    function wheelGestureStarted(state) {
      try {
        startEvent = new MouseEvent('mousedown', state.event);
        dispatchEvent(startEvent);
      } catch (e) {
        // Legacy Browsers like IE 10 & 11 will throw when attempting to create the Event
        if (embla_carousel_wheel_gestures_esm_DEV_) {
          console.warn('Legacy browser requires events-polyfill (https://github.com/xiel/embla-carousel-wheel-gestures#legacy-browsers)');
        }

        return cleanup();
      }

      isStarted = true;
      addNativeMouseEventListeners();

      if (options.wheelDraggingClass) {
        targetNode.classList.add(options.wheelDraggingClass);
      }
    }

    function wheelGestureEnded(state) {
      isStarted = false;
      dispatchEvent(createRelativeMouseEvent('mouseup', state));
      removeNativeMouseEventListeners();

      if (options.wheelDraggingClass) {
        targetNode.classList.remove(options.wheelDraggingClass);
      }
    }

    function addNativeMouseEventListeners() {
      document.documentElement.addEventListener('mousemove', preventNativeMouseHandler, true);
      document.documentElement.addEventListener('mouseup', preventNativeMouseHandler, true);
      document.documentElement.addEventListener('mousedown', preventNativeMouseHandler, true);
    }

    function removeNativeMouseEventListeners() {
      document.documentElement.removeEventListener('mousemove', preventNativeMouseHandler, true);
      document.documentElement.removeEventListener('mouseup', preventNativeMouseHandler, true);
      document.documentElement.removeEventListener('mousedown', preventNativeMouseHandler, true);
    }

    function preventNativeMouseHandler(e) {
      if (isStarted && e.isTrusted) {
        e.stopImmediatePropagation();
      }
    }

    function createRelativeMouseEvent(type, state) {
      var moveX, moveY;

      if (wheelAxis === engine.options.axis) {
        var _state$axisMovement = state.axisMovement;
        moveX = _state$axisMovement[0];
        moveY = _state$axisMovement[1];
      } else {
        var _state$axisMovement2 = state.axisMovement;
        moveY = _state$axisMovement2[0];
        moveX = _state$axisMovement2[1];
      }

      return new MouseEvent(type, {
        clientX: startEvent.clientX + moveX,
        clientY: startEvent.clientY + moveY,
        screenX: startEvent.screenX + moveX,
        screenY: startEvent.screenY + moveY,
        movementX: moveX,
        movementY: moveY,
        button: 0,
        bubbles: true,
        cancelable: true,
        composed: true
      });
    }

    function dispatchEvent(event) {
      embla.containerNode().dispatchEvent(event);
    }

    function handleWheel(state) {
      var _state$axisDelta = state.axisDelta,
          deltaX = _state$axisDelta[0],
          deltaY = _state$axisDelta[1];
      var primaryAxisDelta = wheelAxis === 'x' ? deltaX : deltaY;
      var crossAxisDelta = wheelAxis === 'x' ? deltaY : deltaX;
      var isRelease = state.isMomentum && state.previous && !state.previous.isMomentum;
      var isEndingOrRelease = state.isEnding && !state.isMomentum || isRelease;
      var primaryAxisDeltaIsDominant = Math.abs(primaryAxisDelta) > Math.abs(crossAxisDelta);

      if (primaryAxisDeltaIsDominant && !isStarted && !state.isMomentum) {
        wheelGestureStarted(state);
      }

      if (!isStarted) return;

      if (isEndingOrRelease) {
        wheelGestureEnded(state);
      } else {
        dispatchEvent(createRelativeMouseEvent('mousemove', state));
      }
    }

    cleanup = function cleanup() {
      unobserveTargetNode();
      offWheel();
      removeNativeMouseEventListeners();
    };
  }

  var self = {
    name: 'wheelGestures',
    options: userOptions,
    init: init,
    destroy: function destroy() {
      return cleanup();
    }
  };
  return self;
}


//# sourceMappingURL=embla-carousel-wheel-gestures.esm.js.map


/***/ }),

/***/ 1689:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ EmblaCarousel; }
/* harmony export */ });
function isNumber(subject) {
  return typeof subject === 'number';
}
function isString(subject) {
  return typeof subject === 'string';
}
function isBoolean(subject) {
  return typeof subject === 'boolean';
}
function isObject(subject) {
  return Object.prototype.toString.call(subject) === '[object Object]';
}
function mathAbs(n) {
  return Math.abs(n);
}
function mathSign(n) {
  return Math.sign(n);
}
function deltaAbs(valueB, valueA) {
  return mathAbs(valueB - valueA);
}
function factorAbs(valueB, valueA) {
  if (valueB === 0 || valueA === 0) return 0;
  if (mathAbs(valueB) <= mathAbs(valueA)) return 0;
  const diff = deltaAbs(mathAbs(valueB), mathAbs(valueA));
  return mathAbs(diff / valueB);
}
function arrayKeys(array) {
  return objectKeys(array).map(Number);
}
function arrayLast(array) {
  return array[arrayLastIndex(array)];
}
function arrayLastIndex(array) {
  return Math.max(0, array.length - 1);
}
function objectKeys(object) {
  return Object.keys(object);
}
function objectsMergeDeep(objectA, objectB) {
  return [objectA, objectB].reduce((mergedObjects, currentObject) => {
    objectKeys(currentObject).forEach(key => {
      const valueA = mergedObjects[key];
      const valueB = currentObject[key];
      const areObjects = isObject(valueA) && isObject(valueB);
      mergedObjects[key] = areObjects ? objectsMergeDeep(valueA, valueB) : valueB;
    });
    return mergedObjects;
  }, {});
}
function isMouseEvent(evt, ownerWindow) {
  return typeof ownerWindow.MouseEvent !== 'undefined' && evt instanceof ownerWindow.MouseEvent;
}

function Alignment(align, viewSize) {
  const predefined = {
    start,
    center,
    end
  };
  function start() {
    return 0;
  }
  function center(n) {
    return end(n) / 2;
  }
  function end(n) {
    return viewSize - n;
  }
  function percent() {
    return viewSize * Number(align);
  }
  function measure(n) {
    if (isNumber(align)) return percent();
    return predefined[align](n);
  }
  const self = {
    measure
  };
  return self;
}

function Axis(axis, direction) {
  const scroll = axis === 'y' ? 'y' : 'x';
  const cross = axis === 'y' ? 'x' : 'y';
  const startEdge = getStartEdge();
  const endEdge = getEndEdge();
  function measureSize(rect) {
    const {
      width,
      height
    } = rect;
    return scroll === 'x' ? width : height;
  }
  function getStartEdge() {
    if (scroll === 'y') return 'top';
    return direction === 'rtl' ? 'right' : 'left';
  }
  function getEndEdge() {
    if (scroll === 'y') return 'bottom';
    return direction === 'rtl' ? 'left' : 'right';
  }
  const self = {
    scroll,
    cross,
    startEdge,
    endEdge,
    measureSize
  };
  return self;
}

function Limit(min, max) {
  const length = mathAbs(min - max);
  function reachedMin(n) {
    return n < min;
  }
  function reachedMax(n) {
    return n > max;
  }
  function reachedAny(n) {
    return reachedMin(n) || reachedMax(n);
  }
  function constrain(n) {
    if (!reachedAny(n)) return n;
    return reachedMin(n) ? min : max;
  }
  function removeOffset(n) {
    if (!length) return n;
    return n - length * Math.ceil((n - max) / length);
  }
  const self = {
    length,
    max,
    min,
    constrain,
    reachedAny,
    reachedMax,
    reachedMin,
    removeOffset
  };
  return self;
}

function Counter(max, start, loop) {
  const {
    constrain
  } = Limit(0, max);
  const loopEnd = max + 1;
  let counter = withinLimit(start);
  function withinLimit(n) {
    return !loop ? constrain(n) : mathAbs((loopEnd + n) % loopEnd);
  }
  function get() {
    return counter;
  }
  function set(n) {
    counter = withinLimit(n);
    return self;
  }
  function add(n) {
    return clone().set(get() + n);
  }
  function clone() {
    return Counter(max, get(), loop);
  }
  const self = {
    get,
    set,
    add,
    clone
  };
  return self;
}

function Direction(direction) {
  const sign = direction === 'rtl' ? -1 : 1;
  function apply(n) {
    return n * sign;
  }
  const self = {
    apply
  };
  return self;
}

function EventStore() {
  let listeners = [];
  function add(node, type, handler, options = {
    passive: true
  }) {
    node.addEventListener(type, handler, options);
    listeners.push(() => node.removeEventListener(type, handler, options));
    return self;
  }
  function clear() {
    listeners = listeners.filter(remove => remove());
  }
  const self = {
    add,
    clear
  };
  return self;
}

function DragHandler(axis, direction, rootNode, ownerDocument, ownerWindow, target, dragTracker, location, animation, scrollTo, scrollBody, scrollTarget, index, eventHandler, percentOfView, dragFree, dragThreshold, skipSnaps, baseFriction) {
  const {
    cross: crossAxis
  } = axis;
  const focusNodes = ['INPUT', 'SELECT', 'TEXTAREA'];
  const nonPassiveEvent = {
    passive: false
  };
  const initEvents = EventStore();
  const dragEvents = EventStore();
  const goToNextThreshold = Limit(50, 225).constrain(percentOfView.measure(20));
  const snapForceBoost = {
    mouse: 300,
    touch: 400
  };
  const freeForceBoost = {
    mouse: 500,
    touch: 600
  };
  const baseSpeed = dragFree ? 43 : 25;
  let isMoving = false;
  let startScroll = 0;
  let startCross = 0;
  let pointerIsDown = false;
  let preventScroll = false;
  let preventClick = false;
  let isMouse = false;
  function init(emblaApi, watchDrag) {
    if (!watchDrag) return;
    function downIfAllowed(evt) {
      if (isBoolean(watchDrag) || watchDrag(emblaApi, evt)) down(evt);
    }
    const node = rootNode;
    initEvents.add(node, 'dragstart', evt => evt.preventDefault(), nonPassiveEvent).add(node, 'touchmove', () => undefined, nonPassiveEvent).add(node, 'touchend', () => undefined).add(node, 'touchstart', downIfAllowed).add(node, 'mousedown', downIfAllowed).add(node, 'touchcancel', up).add(node, 'contextmenu', up).add(node, 'click', click, true);
  }
  function destroy() {
    initEvents.clear();
    dragEvents.clear();
  }
  function addDragEvents() {
    const node = isMouse ? ownerDocument : rootNode;
    dragEvents.add(node, 'touchmove', move, nonPassiveEvent).add(node, 'touchend', up).add(node, 'mousemove', move, nonPassiveEvent).add(node, 'mouseup', up);
  }
  function isFocusNode(node) {
    const nodeName = node.nodeName || '';
    return focusNodes.includes(nodeName);
  }
  function forceBoost() {
    const boost = dragFree ? freeForceBoost : snapForceBoost;
    const type = isMouse ? 'mouse' : 'touch';
    return boost[type];
  }
  function allowedForce(force, targetChanged) {
    const next = index.add(mathSign(force) * -1);
    const baseForce = scrollTarget.byDistance(force, !dragFree).distance;
    if (dragFree || mathAbs(force) < goToNextThreshold) return baseForce;
    if (skipSnaps && targetChanged) return baseForce * 0.5;
    return scrollTarget.byIndex(next.get(), 0).distance;
  }
  function down(evt) {
    const isMouseEvt = isMouseEvent(evt, ownerWindow);
    isMouse = isMouseEvt;
    if (isMouseEvt && evt.button !== 0) return;
    if (isFocusNode(evt.target)) return;
    preventClick = dragFree && isMouseEvt && !evt.buttons && isMoving;
    isMoving = deltaAbs(target.get(), location.get()) >= 2;
    pointerIsDown = true;
    dragTracker.pointerDown(evt);
    scrollBody.useFriction(0).useDuration(0);
    target.set(location);
    addDragEvents();
    startScroll = dragTracker.readPoint(evt);
    startCross = dragTracker.readPoint(evt, crossAxis);
    eventHandler.emit('pointerDown');
  }
  function move(evt) {
    const lastScroll = dragTracker.readPoint(evt);
    const lastCross = dragTracker.readPoint(evt, crossAxis);
    const diffScroll = deltaAbs(lastScroll, startScroll);
    const diffCross = deltaAbs(lastCross, startCross);
    if (!preventScroll && !isMouse) {
      if (!evt.cancelable) return up(evt);
      preventScroll = diffScroll > diffCross;
      if (!preventScroll) return up(evt);
    }
    const diff = dragTracker.pointerMove(evt);
    if (diffScroll > dragThreshold) preventClick = true;
    scrollBody.useFriction(0.3).useDuration(1);
    animation.start();
    target.add(direction.apply(diff));
    evt.preventDefault();
  }
  function up(evt) {
    const currentLocation = scrollTarget.byDistance(0, false);
    const targetChanged = currentLocation.index !== index.get();
    const rawForce = dragTracker.pointerUp(evt) * forceBoost();
    const force = allowedForce(direction.apply(rawForce), targetChanged);
    const forceFactor = factorAbs(rawForce, force);
    const speed = baseSpeed - 10 * forceFactor;
    const friction = baseFriction + forceFactor / 50;
    preventScroll = false;
    pointerIsDown = false;
    dragEvents.clear();
    scrollBody.useDuration(speed).useFriction(friction);
    scrollTo.distance(force, !dragFree);
    isMouse = false;
    eventHandler.emit('pointerUp');
  }
  function click(evt) {
    if (preventClick) {
      evt.stopPropagation();
      evt.preventDefault();
    }
  }
  function pointerDown() {
    return pointerIsDown;
  }
  const self = {
    init,
    pointerDown,
    destroy
  };
  return self;
}

function DragTracker(axis, ownerWindow) {
  const logInterval = 170;
  let startEvent;
  let lastEvent;
  function readTime(evt) {
    return evt.timeStamp;
  }
  function readPoint(evt, evtAxis) {
    const property = evtAxis || axis.scroll;
    const coord = `client${property === 'x' ? 'X' : 'Y'}`;
    return (isMouseEvent(evt, ownerWindow) ? evt : evt.touches[0])[coord];
  }
  function pointerDown(evt) {
    startEvent = evt;
    lastEvent = evt;
    return readPoint(evt);
  }
  function pointerMove(evt) {
    const diff = readPoint(evt) - readPoint(lastEvent);
    const expired = readTime(evt) - readTime(startEvent) > logInterval;
    lastEvent = evt;
    if (expired) startEvent = evt;
    return diff;
  }
  function pointerUp(evt) {
    if (!startEvent || !lastEvent) return 0;
    const diffDrag = readPoint(lastEvent) - readPoint(startEvent);
    const diffTime = readTime(evt) - readTime(startEvent);
    const expired = readTime(evt) - readTime(lastEvent) > logInterval;
    const force = diffDrag / diffTime;
    const isFlick = diffTime && !expired && mathAbs(force) > 0.1;
    return isFlick ? force : 0;
  }
  const self = {
    pointerDown,
    pointerMove,
    pointerUp,
    readPoint
  };
  return self;
}

function PercentOfView(viewSize) {
  function measure(n) {
    return viewSize * (n / 100);
  }
  const self = {
    measure
  };
  return self;
}

function ResizeHandler(container, eventHandler, ownerWindow, slides, axis) {
  let resizeObserver;
  let containerSize;
  let slideSizes = [];
  let destroyed = false;
  function readSize(node) {
    return axis.measureSize(node.getBoundingClientRect());
  }
  function init(emblaApi, watchResize) {
    if (!watchResize) return;
    containerSize = readSize(container);
    slideSizes = slides.map(readSize);
    function defaultCallback(entries) {
      for (const entry of entries) {
        const isContainer = entry.target === container;
        const slideIndex = slides.indexOf(entry.target);
        const lastSize = isContainer ? containerSize : slideSizes[slideIndex];
        const newSize = readSize(isContainer ? container : slides[slideIndex]);
        if (lastSize !== newSize) {
          ownerWindow.requestAnimationFrame(() => {
            emblaApi.reInit();
            eventHandler.emit('resize');
          });
          break;
        }
      }
    }
    resizeObserver = new ResizeObserver(entries => {
      if (destroyed) return;
      if (isBoolean(watchResize) || watchResize(emblaApi, entries)) {
        defaultCallback(entries);
      }
    });
    const observeNodes = [container].concat(slides);
    observeNodes.forEach(node => resizeObserver.observe(node));
  }
  function destroy() {
    if (resizeObserver) resizeObserver.disconnect();
    destroyed = true;
  }
  const self = {
    init,
    destroy
  };
  return self;
}

function ScrollBody(location, target, baseDuration, baseFriction) {
  let hasSettled = true;
  let bodyVelocity = 0;
  let scrollDirection = 0;
  let scrollDuration = baseDuration;
  let scrollFriction = baseFriction;
  let rawLocation = location.get();
  let rawLocationPrevious = 0;
  function seek() {
    const diff = target.get() - location.get();
    const isInstant = !scrollDuration;
    let directionDiff = 0;
    if (isInstant) {
      bodyVelocity = 0;
      location.set(target);
      directionDiff = diff;
    } else {
      bodyVelocity += diff / scrollDuration;
      bodyVelocity *= scrollFriction;
      rawLocation += bodyVelocity;
      location.add(bodyVelocity);
      directionDiff = rawLocation - rawLocationPrevious;
    }
    scrollDirection = mathSign(directionDiff);
    rawLocationPrevious = rawLocation;
    hasSettled = mathAbs(diff) < 0.001;
    return self;
  }
  function settled() {
    return hasSettled;
  }
  function duration() {
    return scrollDuration;
  }
  function direction() {
    return scrollDirection;
  }
  function velocity() {
    return bodyVelocity;
  }
  function useBaseDuration() {
    return useDuration(baseDuration);
  }
  function useBaseFriction() {
    return useFriction(baseFriction);
  }
  function useDuration(n) {
    scrollDuration = n;
    return self;
  }
  function useFriction(n) {
    scrollFriction = n;
    return self;
  }
  const self = {
    direction,
    duration,
    velocity,
    seek,
    settled,
    useBaseFriction,
    useBaseDuration,
    useFriction,
    useDuration
  };
  return self;
}

function ScrollBounds(limit, location, target, scrollBody, percentOfView) {
  const pullBackThreshold = percentOfView.measure(10);
  const edgeOffsetTolerance = percentOfView.measure(50);
  const frictionLimit = Limit(0.1, 0.99);
  let disabled = false;
  function shouldConstrain() {
    if (disabled) return false;
    if (!limit.reachedAny(target.get())) return false;
    if (!limit.reachedAny(location.get())) return false;
    return true;
  }
  function constrain(pointerDown) {
    if (!shouldConstrain()) return;
    const edge = limit.reachedMin(location.get()) ? 'min' : 'max';
    const diffToEdge = mathAbs(limit[edge] - location.get());
    const diffToTarget = target.get() - location.get();
    const friction = frictionLimit.constrain(diffToEdge / edgeOffsetTolerance);
    target.subtract(diffToTarget * friction);
    if (!pointerDown && mathAbs(diffToTarget) < pullBackThreshold) {
      target.set(limit.constrain(target.get()));
      scrollBody.useDuration(25).useBaseFriction();
    }
  }
  function toggleActive(active) {
    disabled = !active;
  }
  const self = {
    constrain,
    toggleActive
  };
  return self;
}

function ScrollContain(viewSize, contentSize, snapsAligned, containScroll) {
  const scrollBounds = Limit(-contentSize + viewSize, snapsAligned[0]);
  const snapsBounded = measureBounded();
  const snapsContained = measureContained();
  function findDuplicates() {
    const startSnap = snapsBounded[0];
    const endSnap = arrayLast(snapsBounded);
    const min = snapsBounded.lastIndexOf(startSnap);
    const max = snapsBounded.indexOf(endSnap) + 1;
    return Limit(min, max);
  }
  function measureBounded() {
    return snapsAligned.map(scrollBounds.constrain).map(scrollBound => parseFloat(scrollBound.toFixed(3)));
  }
  function measureContained() {
    if (contentSize <= viewSize) return [scrollBounds.max];
    if (containScroll === 'keepSnaps') return snapsBounded;
    const {
      min,
      max
    } = findDuplicates();
    return snapsBounded.slice(min, max);
  }
  const self = {
    snapsContained
  };
  return self;
}

function ScrollLimit(contentSize, scrollSnaps, loop) {
  const max = scrollSnaps[0];
  const min = loop ? max - contentSize : arrayLast(scrollSnaps);
  const limit = Limit(min, max);
  const self = {
    limit
  };
  return self;
}

function ScrollLooper(contentSize, limit, offsetLocation, vectors) {
  const jointSafety = 0.1;
  const min = limit.min + jointSafety;
  const max = limit.max + jointSafety;
  const {
    reachedMin,
    reachedMax
  } = Limit(min, max);
  function shouldLoop(direction) {
    if (direction === 1) return reachedMax(offsetLocation.get());
    if (direction === -1) return reachedMin(offsetLocation.get());
    return false;
  }
  function loop(direction) {
    if (!shouldLoop(direction)) return;
    const loopDistance = contentSize * (direction * -1);
    vectors.forEach(v => v.add(loopDistance));
  }
  const self = {
    loop
  };
  return self;
}

function ScrollProgress(limit) {
  const {
    max,
    length: scrollLength
  } = limit;
  function get(n) {
    const currentLocation = n - max;
    return currentLocation / -scrollLength;
  }
  const self = {
    get
  };
  return self;
}

function ScrollSnaps(axis, alignment, containerRect, slideRects, slideSizesWithGaps, slidesToScroll, containScroll) {
  const {
    startEdge,
    endEdge
  } = axis;
  const {
    groupSlides
  } = slidesToScroll;
  const alignments = measureSizes().map(alignment.measure);
  const snaps = measureUnaligned();
  const snapsAligned = measureAligned();
  function measureSizes() {
    return groupSlides(slideRects).map(rects => arrayLast(rects)[endEdge] - rects[0][startEdge]).map(mathAbs);
  }
  function measureUnaligned() {
    return slideRects.map(rect => containerRect[startEdge] - rect[startEdge]).map(snap => -mathAbs(snap));
  }
  function measureAligned() {
    const containedStartSnap = 0;
    const containedEndSnap = arrayLast(snaps) - arrayLast(slideSizesWithGaps);
    return groupSlides(snaps).map(g => g[0]).map((snap, index, groupedSnaps) => {
      const isFirst = !index;
      const isLast = index === arrayLastIndex(groupedSnaps);
      if (containScroll && isFirst) return containedStartSnap;
      if (containScroll && isLast) return containedEndSnap;
      return snap + alignments[index];
    });
  }
  const self = {
    snaps,
    snapsAligned
  };
  return self;
}

function ScrollTarget(loop, scrollSnaps, contentSize, limit, targetVector) {
  const {
    reachedAny,
    removeOffset,
    constrain
  } = limit;
  function minDistance(distances) {
    return distances.concat().sort((a, b) => mathAbs(a) - mathAbs(b))[0];
  }
  function findTargetSnap(target) {
    const distance = loop ? removeOffset(target) : constrain(target);
    const ascDiffsToSnaps = scrollSnaps.map(scrollSnap => scrollSnap - distance).map(diffToSnap => shortcut(diffToSnap, 0)).map((diff, i) => ({
      diff,
      index: i
    })).sort((d1, d2) => mathAbs(d1.diff) - mathAbs(d2.diff));
    const {
      index
    } = ascDiffsToSnaps[0];
    return {
      index,
      distance
    };
  }
  function shortcut(target, direction) {
    const targets = [target, target + contentSize, target - contentSize];
    if (!loop) return targets[0];
    if (!direction) return minDistance(targets);
    const matchingTargets = targets.filter(t => mathSign(t) === direction);
    return minDistance(matchingTargets);
  }
  function byIndex(index, direction) {
    const diffToSnap = scrollSnaps[index] - targetVector.get();
    const distance = shortcut(diffToSnap, direction);
    return {
      index,
      distance
    };
  }
  function byDistance(distance, snap) {
    const target = targetVector.get() + distance;
    const {
      index,
      distance: targetSnapDistance
    } = findTargetSnap(target);
    const reachedBound = !loop && reachedAny(target);
    if (!snap || reachedBound) return {
      index,
      distance
    };
    const diffToSnap = scrollSnaps[index] - targetSnapDistance;
    const snapDistance = distance + shortcut(diffToSnap, 0);
    return {
      index,
      distance: snapDistance
    };
  }
  const self = {
    byDistance,
    byIndex,
    shortcut
  };
  return self;
}

function ScrollTo(animation, indexCurrent, indexPrevious, scrollTarget, scrollBody, targetVector, eventHandler) {
  function scrollTo(target) {
    const distanceDiff = target.distance;
    const indexDiff = target.index !== indexCurrent.get();
    targetVector.add(distanceDiff);
    if (distanceDiff) {
      if (scrollBody.duration()) {
        animation.start();
      } else {
        animation.update();
        animation.render(1);
        animation.update();
      }
    }
    if (indexDiff) {
      indexPrevious.set(indexCurrent.get());
      indexCurrent.set(target.index);
      eventHandler.emit('select');
    }
  }
  function distance(n, snap) {
    const target = scrollTarget.byDistance(n, snap);
    scrollTo(target);
  }
  function index(n, direction) {
    const targetIndex = indexCurrent.clone().set(n);
    const target = scrollTarget.byIndex(targetIndex.get(), direction);
    scrollTo(target);
  }
  const self = {
    distance,
    index
  };
  return self;
}

function Vector1D(initialValue) {
  let value = initialValue;
  function get() {
    return value;
  }
  function set(n) {
    value = normalizeInput(n);
  }
  function add(n) {
    value += normalizeInput(n);
  }
  function subtract(n) {
    value -= normalizeInput(n);
  }
  function normalizeInput(n) {
    return isNumber(n) ? n : n.get();
  }
  const self = {
    get,
    set,
    add,
    subtract
  };
  return self;
}

function Translate(axis, direction, container) {
  const translate = axis.scroll === 'x' ? x : y;
  const containerStyle = container.style;
  let disabled = false;
  function x(n) {
    return `translate3d(${n}px,0px,0px)`;
  }
  function y(n) {
    return `translate3d(0px,${n}px,0px)`;
  }
  function to(target) {
    if (disabled) return;
    containerStyle.transform = translate(direction.apply(target));
  }
  function toggleActive(active) {
    disabled = !active;
  }
  function clear() {
    if (disabled) return;
    containerStyle.transform = '';
    if (!container.getAttribute('style')) container.removeAttribute('style');
  }
  const self = {
    clear,
    to,
    toggleActive
  };
  return self;
}

function SlideLooper(axis, direction, viewSize, contentSize, slideSizesWithGaps, scrollSnaps, slidesInView, offsetLocation, slides) {
  const ascItems = arrayKeys(slideSizesWithGaps);
  const descItems = arrayKeys(slideSizesWithGaps).reverse();
  const loopPoints = startPoints().concat(endPoints());
  function removeSlideSizes(indexes, from) {
    return indexes.reduce((a, i) => {
      return a - slideSizesWithGaps[i];
    }, from);
  }
  function slidesInGap(indexes, gap) {
    return indexes.reduce((a, i) => {
      const remainingGap = removeSlideSizes(a, gap);
      return remainingGap > 0 ? a.concat([i]) : a;
    }, []);
  }
  function findLoopPoints(indexes, edge) {
    const isStartEdge = edge === 'start';
    const offset = isStartEdge ? -contentSize : contentSize;
    const slideBounds = slidesInView.findSlideBounds([offset]);
    return indexes.map(index => {
      const initial = isStartEdge ? 0 : -contentSize;
      const altered = isStartEdge ? contentSize : 0;
      const bounds = slideBounds.filter(b => b.index === index)[0];
      const loopPoint = bounds[isStartEdge ? 'end' : 'start'];
      return {
        index,
        slideLocation: Vector1D(-1),
        translate: Translate(axis, direction, slides[index]),
        target: () => offsetLocation.get() > loopPoint ? initial : altered
      };
    });
  }
  function startPoints() {
    const gap = scrollSnaps[0] - 1;
    const indexes = slidesInGap(descItems, gap);
    return findLoopPoints(indexes, 'end');
  }
  function endPoints() {
    const gap = viewSize - scrollSnaps[0] - 1;
    const indexes = slidesInGap(ascItems, gap);
    return findLoopPoints(indexes, 'start');
  }
  function canLoop() {
    return loopPoints.every(({
      index
    }) => {
      const otherIndexes = ascItems.filter(i => i !== index);
      return removeSlideSizes(otherIndexes, viewSize) <= 0.1;
    });
  }
  function loop() {
    loopPoints.forEach(loopPoint => {
      const {
        target,
        translate,
        slideLocation
      } = loopPoint;
      const shiftLocation = target();
      if (shiftLocation === slideLocation.get()) return;
      translate.to(shiftLocation);
      slideLocation.set(shiftLocation);
    });
  }
  function clear() {
    loopPoints.forEach(loopPoint => loopPoint.translate.clear());
  }
  const self = {
    canLoop,
    clear,
    loop,
    loopPoints
  };
  return self;
}

function SlidesHandler(container, eventHandler) {
  let mutationObserver;
  let destroyed = false;
  function init(emblaApi, watchSlides) {
    if (!watchSlides) return;
    function defaultCallback(mutations) {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          emblaApi.reInit();
          eventHandler.emit('slidesChanged');
          break;
        }
      }
    }
    mutationObserver = new MutationObserver(mutations => {
      if (destroyed) return;
      if (isBoolean(watchSlides) || watchSlides(emblaApi, mutations)) {
        defaultCallback(mutations);
      }
    });
    mutationObserver.observe(container, {
      childList: true
    });
  }
  function destroy() {
    if (mutationObserver) mutationObserver.disconnect();
    destroyed = true;
  }
  const self = {
    init,
    destroy
  };
  return self;
}

function SlidesInView(viewSize, contentSize, slideSizes, snaps, limit, loop, inViewThreshold) {
  const {
    removeOffset,
    constrain
  } = limit;
  const roundingSafety = 0.5;
  const cachedOffsets = loop ? [0, contentSize, -contentSize] : [0];
  const cachedBounds = findSlideBounds(cachedOffsets, inViewThreshold);
  function findSlideThresholds(threshold) {
    const slideThreshold = threshold || 0;
    return slideSizes.map(slideSize => {
      const thresholdLimit = Limit(roundingSafety, slideSize - roundingSafety);
      return thresholdLimit.constrain(slideSize * slideThreshold);
    });
  }
  function findSlideBounds(offsets, threshold) {
    const slideOffsets = offsets || cachedOffsets;
    const slideThresholds = findSlideThresholds(threshold);
    return slideOffsets.reduce((list, offset) => {
      const bounds = snaps.map((snap, index) => ({
        start: snap - slideSizes[index] + slideThresholds[index] + offset,
        end: snap + viewSize - slideThresholds[index] + offset,
        index
      }));
      return list.concat(bounds);
    }, []);
  }
  function check(location, bounds) {
    const limitedLocation = loop ? removeOffset(location) : constrain(location);
    const slideBounds = bounds || cachedBounds;
    return slideBounds.reduce((list, slideBound) => {
      const {
        index,
        start,
        end
      } = slideBound;
      const inList = list.includes(index);
      const inView = start < limitedLocation && end > limitedLocation;
      return !inList && inView ? list.concat([index]) : list;
    }, []);
  }
  const self = {
    check,
    findSlideBounds
  };
  return self;
}

function SlideSizes(axis, containerRect, slideRects, slides, readEdgeGap, ownerWindow) {
  const {
    measureSize,
    startEdge,
    endEdge
  } = axis;
  const withEdgeGap = slideRects[0] && readEdgeGap;
  const startGap = measureStartGap();
  const endGap = measureEndGap();
  const slideSizes = slideRects.map(measureSize);
  const slideSizesWithGaps = measureWithGaps();
  function measureStartGap() {
    if (!withEdgeGap) return 0;
    const slideRect = slideRects[0];
    return mathAbs(containerRect[startEdge] - slideRect[startEdge]);
  }
  function measureEndGap() {
    if (!withEdgeGap) return 0;
    const style = ownerWindow.getComputedStyle(arrayLast(slides));
    return parseFloat(style.getPropertyValue(`margin-${endEdge}`));
  }
  function measureWithGaps() {
    return slideRects.map((rect, index, rects) => {
      const isFirst = !index;
      const isLast = index === arrayLastIndex(rects);
      if (isFirst) return slideSizes[index] + startGap;
      if (isLast) return slideSizes[index] + endGap;
      return rects[index + 1][startEdge] - rect[startEdge];
    }).map(mathAbs);
  }
  const self = {
    slideSizes,
    slideSizesWithGaps
  };
  return self;
}

function SlidesToScroll(viewSize, slideSizesWithGaps, slidesToScroll) {
  const groupByNumber = isNumber(slidesToScroll);
  function byNumber(array, groupSize) {
    return arrayKeys(array).filter(i => i % groupSize === 0).map(i => array.slice(i, i + groupSize));
  }
  function bySize(array) {
    return arrayKeys(array).reduce((groupSizes, i) => {
      const chunk = slideSizesWithGaps.slice(arrayLast(groupSizes), i + 1);
      const chunkSize = chunk.reduce((a, s) => a + s, 0);
      return !i || chunkSize > viewSize ? groupSizes.concat(i) : groupSizes;
    }, []).map((start, i, groupSizes) => array.slice(start, groupSizes[i + 1]));
  }
  function groupSlides(array) {
    return groupByNumber ? byNumber(array, slidesToScroll) : bySize(array);
  }
  const self = {
    groupSlides
  };
  return self;
}

function Engine(root, container, slides, ownerDocument, ownerWindow, options, eventHandler, animations) {
  // Options
  const {
    align,
    axis: scrollAxis,
    direction: contentDirection,
    startIndex,
    inViewThreshold,
    loop,
    duration,
    dragFree,
    dragThreshold,
    slidesToScroll: groupSlides,
    skipSnaps,
    containScroll
  } = options;
  // Measurements
  const containerRect = container.getBoundingClientRect();
  const slideRects = slides.map(slide => slide.getBoundingClientRect());
  const direction = Direction(contentDirection);
  const axis = Axis(scrollAxis, contentDirection);
  const viewSize = axis.measureSize(containerRect);
  const percentOfView = PercentOfView(viewSize);
  const alignment = Alignment(align, viewSize);
  const containSnaps = !loop && !!containScroll;
  const readEdgeGap = loop || !!containScroll;
  const {
    slideSizes,
    slideSizesWithGaps
  } = SlideSizes(axis, containerRect, slideRects, slides, readEdgeGap, ownerWindow);
  const slidesToScroll = SlidesToScroll(viewSize, slideSizesWithGaps, groupSlides);
  const {
    snaps,
    snapsAligned
  } = ScrollSnaps(axis, alignment, containerRect, slideRects, slideSizesWithGaps, slidesToScroll, containSnaps);
  const contentSize = -arrayLast(snaps) + arrayLast(slideSizesWithGaps);
  const {
    snapsContained
  } = ScrollContain(viewSize, contentSize, snapsAligned, containScroll);
  const scrollSnaps = containSnaps ? snapsContained : snapsAligned;
  const {
    limit
  } = ScrollLimit(contentSize, scrollSnaps, loop);
  // Indexes
  const index = Counter(arrayLastIndex(scrollSnaps), startIndex, loop);
  const indexPrevious = index.clone();
  const slideIndexes = arrayKeys(slides);
  // Animation
  const update = ({
    dragHandler,
    scrollBody,
    scrollBounds,
    eventHandler,
    animation,
    options: {
      loop
    }
  }) => {
    const pointerDown = dragHandler.pointerDown();
    if (!loop) scrollBounds.constrain(pointerDown);
    const hasSettled = scrollBody.seek().settled();
    if (hasSettled && !pointerDown) {
      animation.stop();
      eventHandler.emit('settle');
    }
    if (!hasSettled) eventHandler.emit('scroll');
  };
  const render = ({
    scrollBody,
    translate,
    location,
    offsetLocation,
    scrollLooper,
    slideLooper,
    options: {
      loop
    }
  }, lagOffset) => {
    const velocity = scrollBody.velocity();
    offsetLocation.set(location.get() - velocity + velocity * lagOffset);
    if (loop) {
      scrollLooper.loop(scrollBody.direction());
      slideLooper.loop();
    }
    translate.to(offsetLocation.get());
  };
  const animation = {
    start: () => animations.start(engine),
    stop: () => animations.stop(engine),
    update: () => update(engine),
    render: lagOffset => render(engine, lagOffset)
  };
  // Shared
  const friction = 0.68;
  const startLocation = scrollSnaps[index.get()];
  const location = Vector1D(startLocation);
  const offsetLocation = Vector1D(startLocation);
  const target = Vector1D(startLocation);
  const scrollBody = ScrollBody(location, target, duration, friction);
  const scrollTarget = ScrollTarget(loop, scrollSnaps, contentSize, limit, target);
  const scrollTo = ScrollTo(animation, index, indexPrevious, scrollTarget, scrollBody, target, eventHandler);
  const slidesInView = SlidesInView(viewSize, contentSize, slideSizes, snaps, limit, loop, inViewThreshold);
  // Engine
  const engine = {
    ownerDocument,
    ownerWindow,
    eventHandler,
    containerRect,
    slideRects,
    animation,
    axis,
    direction,
    dragHandler: DragHandler(axis, direction, root, ownerDocument, ownerWindow, target, DragTracker(axis, ownerWindow), location, animation, scrollTo, scrollBody, scrollTarget, index, eventHandler, percentOfView, dragFree, dragThreshold, skipSnaps, friction),
    eventStore: EventStore(),
    percentOfView,
    index,
    indexPrevious,
    limit,
    location,
    offsetLocation,
    options,
    resizeHandler: ResizeHandler(container, eventHandler, ownerWindow, slides, axis),
    scrollBody,
    scrollBounds: ScrollBounds(limit, location, target, scrollBody, percentOfView),
    scrollLooper: ScrollLooper(contentSize, limit, offsetLocation, [location, offsetLocation, target]),
    scrollProgress: ScrollProgress(limit),
    scrollSnaps,
    scrollTarget,
    scrollTo,
    slideLooper: SlideLooper(axis, direction, viewSize, contentSize, slideSizesWithGaps, scrollSnaps, slidesInView, offsetLocation, slides),
    slidesHandler: SlidesHandler(container, eventHandler),
    slidesInView,
    slideIndexes,
    slidesToScroll,
    target,
    translate: Translate(axis, direction, container)
  };
  return engine;
}

function Animations(ownerWindow) {
  const timeStep = 1000 / 60;
  let engines = [];
  let lastTimeStamp = null;
  let lag = 0;
  let animationFrame = 0;
  function animate(timeStamp) {
    if (!lastTimeStamp) lastTimeStamp = timeStamp;
    const elapsed = timeStamp - lastTimeStamp;
    lastTimeStamp = timeStamp;
    lag += elapsed;
    while (lag >= timeStep) {
      engines.forEach(({
        animation
      }) => animation.update());
      lag -= timeStep;
    }
    const lagOffset = mathAbs(lag / timeStep);
    engines.forEach(({
      animation
    }) => animation.render(lagOffset));
    if (animationFrame) ownerWindow.requestAnimationFrame(animate);
  }
  function start(engine) {
    if (!engines.includes(engine)) engines.push(engine);
    if (animationFrame) return;
    animationFrame = ownerWindow.requestAnimationFrame(animate);
  }
  function stop(engine) {
    engines = engines.filter(e => e !== engine);
    if (engines.length) return;
    ownerWindow.cancelAnimationFrame(animationFrame);
    lastTimeStamp = null;
    lag = 0;
    animationFrame = 0;
  }
  function reset() {
    lastTimeStamp = null;
    lag = 0;
  }
  const self = {
    start,
    stop,
    reset,
    window: ownerWindow
  };
  return self;
}

function EventHandler() {
  const listeners = {};
  let api;
  function init(emblaApi) {
    api = emblaApi;
  }
  function getListeners(evt) {
    return listeners[evt] || [];
  }
  function emit(evt) {
    getListeners(evt).forEach(e => e(api, evt));
    return self;
  }
  function on(evt, cb) {
    listeners[evt] = getListeners(evt).concat([cb]);
    return self;
  }
  function off(evt, cb) {
    listeners[evt] = getListeners(evt).filter(e => e !== cb);
    return self;
  }
  const self = {
    init,
    emit,
    off,
    on
  };
  return self;
}

const defaultOptions = {
  align: 'center',
  axis: 'x',
  container: null,
  slides: null,
  containScroll: 'trimSnaps',
  direction: 'ltr',
  slidesToScroll: 1,
  breakpoints: {},
  dragFree: false,
  dragThreshold: 10,
  inViewThreshold: 0,
  loop: false,
  skipSnaps: false,
  duration: 25,
  startIndex: 0,
  active: true,
  watchDrag: true,
  watchResize: true,
  watchSlides: true
};

function OptionsHandler(ownerWindow) {
  function mergeOptions(optionsA, optionsB) {
    return objectsMergeDeep(optionsA, optionsB || {});
  }
  function optionsAtMedia(options) {
    const optionsAtMedia = options.breakpoints || {};
    const matchedMediaOptions = objectKeys(optionsAtMedia).filter(media => ownerWindow.matchMedia(media).matches).map(media => optionsAtMedia[media]).reduce((a, mediaOption) => mergeOptions(a, mediaOption), {});
    return mergeOptions(options, matchedMediaOptions);
  }
  function optionsMediaQueries(optionsList) {
    return optionsList.map(options => objectKeys(options.breakpoints || {})).reduce((acc, mediaQueries) => acc.concat(mediaQueries), []).map(ownerWindow.matchMedia);
  }
  const self = {
    mergeOptions,
    optionsAtMedia,
    optionsMediaQueries
  };
  return self;
}

function PluginsHandler(optionsHandler) {
  let activePlugins = [];
  function init(plugins, emblaApi) {
    activePlugins = plugins.filter(({
      options
    }) => optionsHandler.optionsAtMedia(options).active !== false);
    activePlugins.forEach(plugin => plugin.init(emblaApi, optionsHandler));
    return plugins.reduce((map, plugin) => Object.assign(map, {
      [plugin.name]: plugin
    }), {});
  }
  function destroy() {
    activePlugins = activePlugins.filter(plugin => plugin.destroy());
  }
  const self = {
    init,
    destroy
  };
  return self;
}

function EmblaCarousel(root, userOptions, userPlugins) {
  const ownerDocument = root.ownerDocument;
  const ownerWindow = ownerDocument.defaultView;
  const optionsHandler = OptionsHandler(ownerWindow);
  const pluginsHandler = PluginsHandler(optionsHandler);
  const mediaHandlers = EventStore();
  const documentVisibleHandler = EventStore();
  const eventHandler = EventHandler();
  const {
    animationRealms
  } = EmblaCarousel;
  const {
    mergeOptions,
    optionsAtMedia,
    optionsMediaQueries
  } = optionsHandler;
  const {
    on,
    off,
    emit
  } = eventHandler;
  const reInit = reActivate;
  let destroyed = false;
  let engine;
  let optionsBase = mergeOptions(defaultOptions, EmblaCarousel.globalOptions);
  let options = mergeOptions(optionsBase);
  let pluginList = [];
  let pluginApis;
  let container;
  let slides;
  function storeElements() {
    const {
      container: userContainer,
      slides: userSlides
    } = options;
    const customContainer = isString(userContainer) ? root.querySelector(userContainer) : userContainer;
    container = customContainer || root.children[0];
    const customSlides = isString(userSlides) ? container.querySelectorAll(userSlides) : userSlides;
    slides = [].slice.call(customSlides || container.children);
  }
  function createEngine(options, animations) {
    const engine = Engine(root, container, slides, ownerDocument, ownerWindow, options, eventHandler, animations);
    if (options.loop && !engine.slideLooper.canLoop()) {
      const optionsWithoutLoop = Object.assign({}, options, {
        loop: false
      });
      return createEngine(optionsWithoutLoop, animations);
    }
    return engine;
  }
  function activate(withOptions, withPlugins) {
    if (destroyed) return;
    const animationRealm = animationRealms.find(a => a.window === ownerWindow);
    const animations = animationRealm || Animations(ownerWindow);
    if (!animationRealm) animationRealms.push(animations);
    optionsBase = mergeOptions(optionsBase, withOptions);
    options = optionsAtMedia(optionsBase);
    pluginList = withPlugins || pluginList;
    storeElements();
    engine = createEngine(options, animations);
    optionsMediaQueries([optionsBase, ...pluginList.map(({
      options
    }) => options)]).forEach(query => mediaHandlers.add(query, 'change', reActivate));
    if (!options.active) return;
    engine.translate.to(engine.location.get());
    engine.eventHandler.init(self);
    engine.resizeHandler.init(self, options.watchResize);
    engine.slidesHandler.init(self, options.watchSlides);
    documentVisibleHandler.add(ownerDocument, 'visibilitychange', () => {
      if (ownerDocument.hidden) animations.reset();
    });
    if (engine.options.loop) engine.slideLooper.loop();
    if (container.offsetParent && slides.length) {
      engine.dragHandler.init(self, options.watchDrag);
    }
    pluginApis = pluginsHandler.init(pluginList, self);
  }
  function reActivate(withOptions, withPlugins) {
    const startIndex = selectedScrollSnap();
    deActivate();
    activate(mergeOptions({
      startIndex
    }, withOptions), withPlugins);
    eventHandler.emit('reInit');
  }
  function deActivate() {
    engine.dragHandler.destroy();
    engine.animation.stop();
    engine.eventStore.clear();
    engine.translate.clear();
    engine.slideLooper.clear();
    engine.resizeHandler.destroy();
    engine.slidesHandler.destroy();
    pluginsHandler.destroy();
    mediaHandlers.clear();
    documentVisibleHandler.clear();
  }
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    mediaHandlers.clear();
    deActivate();
    eventHandler.emit('destroy');
  }
  function slidesInView(target) {
    const location = engine[target ? 'target' : 'location'].get();
    const type = options.loop ? 'removeOffset' : 'constrain';
    return engine.slidesInView.check(engine.limit[type](location));
  }
  function slidesNotInView(target) {
    const inView = slidesInView(target);
    return engine.slideIndexes.filter(index => !inView.includes(index));
  }
  function scrollTo(index, jump, direction) {
    if (!options.active || destroyed) return;
    engine.scrollBody.useBaseFriction().useDuration(jump ? 0 : options.duration);
    engine.scrollTo.index(index, direction || 0);
  }
  function scrollNext(jump) {
    const next = engine.index.add(1).get();
    scrollTo(next, jump === true, -1);
  }
  function scrollPrev(jump) {
    const prev = engine.index.add(-1).get();
    scrollTo(prev, jump === true, 1);
  }
  function canScrollNext() {
    const next = engine.index.add(1).get();
    return next !== selectedScrollSnap();
  }
  function canScrollPrev() {
    const prev = engine.index.add(-1).get();
    return prev !== selectedScrollSnap();
  }
  function scrollSnapList() {
    return engine.scrollSnaps.map(engine.scrollProgress.get);
  }
  function scrollProgress() {
    return engine.scrollProgress.get(engine.location.get());
  }
  function selectedScrollSnap() {
    return engine.index.get();
  }
  function previousScrollSnap() {
    return engine.indexPrevious.get();
  }
  function plugins() {
    return pluginApis;
  }
  function internalEngine() {
    return engine;
  }
  function rootNode() {
    return root;
  }
  function containerNode() {
    return container;
  }
  function slideNodes() {
    return slides;
  }
  const self = {
    canScrollNext,
    canScrollPrev,
    containerNode,
    internalEngine,
    destroy,
    off,
    on,
    emit,
    plugins,
    previousScrollSnap,
    reInit,
    rootNode,
    scrollNext,
    scrollPrev,
    scrollProgress,
    scrollSnapList,
    scrollTo,
    selectedScrollSnap,
    slideNodes,
    slidesInView,
    slidesNotInView
  };
  activate(userOptions, userPlugins);
  setTimeout(() => eventHandler.emit('init'), 0);
  return self;
}
EmblaCarousel.animationRealms = [];
EmblaCarousel.globalOptions = undefined;


//# sourceMappingURL=embla-carousel.esm.js.map


/***/ }),

/***/ 7090:
/***/ (function(module) {

(function(window, factory) {
	var lazySizes = factory(window, window.document, Date);
	window.lazySizes = lazySizes;
	if( true && module.exports){
		module.exports = lazySizes;
	}
}(typeof window != 'undefined' ?
      window : {}, 
/**
 * import("./types/global")
 * @typedef { import("./types/lazysizes-config").LazySizesConfigPartial } LazySizesConfigPartial
 */
function l(window, document, Date) { // Pass in the window Date function also for SSR because the Date class can be lost
	'use strict';
	/*jshint eqnull:true */

	var lazysizes,
		/**
		 * @type { LazySizesConfigPartial }
		 */
		lazySizesCfg;

	(function(){
		var prop;

		var lazySizesDefaults = {
			lazyClass: 'lazyload',
			loadedClass: 'lazyloaded',
			loadingClass: 'lazyloading',
			preloadClass: 'lazypreload',
			errorClass: 'lazyerror',
			//strictClass: 'lazystrict',
			autosizesClass: 'lazyautosizes',
			fastLoadedClass: 'ls-is-cached',
			iframeLoadMode: 0,
			srcAttr: 'data-src',
			srcsetAttr: 'data-srcset',
			sizesAttr: 'data-sizes',
			//preloadAfterLoad: false,
			minSize: 40,
			customMedia: {},
			init: true,
			expFactor: 1.5,
			hFac: 0.8,
			loadMode: 2,
			loadHidden: true,
			ricTimeout: 0,
			throttleDelay: 125,
		};

		lazySizesCfg = window.lazySizesConfig || window.lazysizesConfig || {};

		for(prop in lazySizesDefaults){
			if(!(prop in lazySizesCfg)){
				lazySizesCfg[prop] = lazySizesDefaults[prop];
			}
		}
	})();

	if (!document || !document.getElementsByClassName) {
		return {
			init: function () {},
			/**
			 * @type { LazySizesConfigPartial }
			 */
			cfg: lazySizesCfg,
			/**
			 * @type { true }
			 */
			noSupport: true,
		};
	}

	var docElem = document.documentElement;

	var supportPicture = window.HTMLPictureElement;

	var _addEventListener = 'addEventListener';

	var _getAttribute = 'getAttribute';

	/**
	 * Update to bind to window because 'this' becomes null during SSR
	 * builds.
	 */
	var addEventListener = window[_addEventListener].bind(window);

	var setTimeout = window.setTimeout;

	var requestAnimationFrame = window.requestAnimationFrame || setTimeout;

	var requestIdleCallback = window.requestIdleCallback;

	var regPicture = /^picture$/i;

	var loadEvents = ['load', 'error', 'lazyincluded', '_lazyloaded'];

	var regClassCache = {};

	var forEach = Array.prototype.forEach;

	/**
	 * @param ele {Element}
	 * @param cls {string}
	 */
	var hasClass = function(ele, cls) {
		if(!regClassCache[cls]){
			regClassCache[cls] = new RegExp('(\\s|^)'+cls+'(\\s|$)');
		}
		return regClassCache[cls].test(ele[_getAttribute]('class') || '') && regClassCache[cls];
	};

	/**
	 * @param ele {Element}
	 * @param cls {string}
	 */
	var addClass = function(ele, cls) {
		if (!hasClass(ele, cls)){
			ele.setAttribute('class', (ele[_getAttribute]('class') || '').trim() + ' ' + cls);
		}
	};

	/**
	 * @param ele {Element}
	 * @param cls {string}
	 */
	var removeClass = function(ele, cls) {
		var reg;
		if ((reg = hasClass(ele,cls))) {
			ele.setAttribute('class', (ele[_getAttribute]('class') || '').replace(reg, ' '));
		}
	};

	var addRemoveLoadEvents = function(dom, fn, add){
		var action = add ? _addEventListener : 'removeEventListener';
		if(add){
			addRemoveLoadEvents(dom, fn);
		}
		loadEvents.forEach(function(evt){
			dom[action](evt, fn);
		});
	};

	/**
	 * @param elem { Element }
	 * @param name { string }
	 * @param detail { any }
	 * @param noBubbles { boolean }
	 * @param noCancelable { boolean }
	 * @returns { CustomEvent }
	 */
	var triggerEvent = function(elem, name, detail, noBubbles, noCancelable){
		var event = document.createEvent('Event');

		if(!detail){
			detail = {};
		}

		detail.instance = lazysizes;

		event.initEvent(name, !noBubbles, !noCancelable);

		event.detail = detail;

		elem.dispatchEvent(event);
		return event;
	};

	var updatePolyfill = function (el, full){
		var polyfill;
		if( !supportPicture && ( polyfill = (window.picturefill || lazySizesCfg.pf) ) ){
			if(full && full.src && !el[_getAttribute]('srcset')){
				el.setAttribute('srcset', full.src);
			}
			polyfill({reevaluate: true, elements: [el]});
		} else if(full && full.src){
			el.src = full.src;
		}
	};

	var getCSS = function (elem, style){
		return (getComputedStyle(elem, null) || {})[style];
	};

	/**
	 *
	 * @param elem { Element }
	 * @param parent { Element }
	 * @param [width] {number}
	 * @returns {number}
	 */
	var getWidth = function(elem, parent, width){
		width = width || elem.offsetWidth;

		while(width < lazySizesCfg.minSize && parent && !elem._lazysizesWidth){
			width =  parent.offsetWidth;
			parent = parent.parentNode;
		}

		return width;
	};

	var rAF = (function(){
		var running, waiting;
		var firstFns = [];
		var secondFns = [];
		var fns = firstFns;

		var run = function(){
			var runFns = fns;

			fns = firstFns.length ? secondFns : firstFns;

			running = true;
			waiting = false;

			while(runFns.length){
				runFns.shift()();
			}

			running = false;
		};

		var rafBatch = function(fn, queue){
			if(running && !queue){
				fn.apply(this, arguments);
			} else {
				fns.push(fn);

				if(!waiting){
					waiting = true;
					(document.hidden ? setTimeout : requestAnimationFrame)(run);
				}
			}
		};

		rafBatch._lsFlush = run;

		return rafBatch;
	})();

	var rAFIt = function(fn, simple){
		return simple ?
			function() {
				rAF(fn);
			} :
			function(){
				var that = this;
				var args = arguments;
				rAF(function(){
					fn.apply(that, args);
				});
			}
		;
	};

	var throttle = function(fn){
		var running;
		var lastTime = 0;
		var gDelay = lazySizesCfg.throttleDelay;
		var rICTimeout = lazySizesCfg.ricTimeout;
		var run = function(){
			running = false;
			lastTime = Date.now();
			fn();
		};
		var idleCallback = requestIdleCallback && rICTimeout > 49 ?
			function(){
				requestIdleCallback(run, {timeout: rICTimeout});

				if(rICTimeout !== lazySizesCfg.ricTimeout){
					rICTimeout = lazySizesCfg.ricTimeout;
				}
			} :
			rAFIt(function(){
				setTimeout(run);
			}, true)
		;

		return function(isPriority){
			var delay;

			if((isPriority = isPriority === true)){
				rICTimeout = 33;
			}

			if(running){
				return;
			}

			running =  true;

			delay = gDelay - (Date.now() - lastTime);

			if(delay < 0){
				delay = 0;
			}

			if(isPriority || delay < 9){
				idleCallback();
			} else {
				setTimeout(idleCallback, delay);
			}
		};
	};

	//based on http://modernjavascript.blogspot.de/2013/08/building-better-debounce.html
	var debounce = function(func) {
		var timeout, timestamp;
		var wait = 99;
		var run = function(){
			timeout = null;
			func();
		};
		var later = function() {
			var last = Date.now() - timestamp;

			if (last < wait) {
				setTimeout(later, wait - last);
			} else {
				(requestIdleCallback || run)(run);
			}
		};

		return function() {
			timestamp = Date.now();

			if (!timeout) {
				timeout = setTimeout(later, wait);
			}
		};
	};

	var loader = (function(){
		var preloadElems, isCompleted, resetPreloadingTimer, loadMode, started;

		var eLvW, elvH, eLtop, eLleft, eLright, eLbottom, isBodyHidden;

		var regImg = /^img$/i;
		var regIframe = /^iframe$/i;

		var supportScroll = ('onscroll' in window) && !(/(gle|ing)bot/.test(navigator.userAgent));

		var shrinkExpand = 0;
		var currentExpand = 0;

		var isLoading = 0;
		var lowRuns = -1;

		var resetPreloading = function(e){
			isLoading--;
			if(!e || isLoading < 0 || !e.target){
				isLoading = 0;
			}
		};

		var isVisible = function (elem) {
			if (isBodyHidden == null) {
				isBodyHidden = getCSS(document.body, 'visibility') == 'hidden';
			}

			return isBodyHidden || !(getCSS(elem.parentNode, 'visibility') == 'hidden' && getCSS(elem, 'visibility') == 'hidden');
		};

		var isNestedVisible = function(elem, elemExpand){
			var outerRect;
			var parent = elem;
			var visible = isVisible(elem);

			eLtop -= elemExpand;
			eLbottom += elemExpand;
			eLleft -= elemExpand;
			eLright += elemExpand;

			while(visible && (parent = parent.offsetParent) && parent != document.body && parent != docElem){
				visible = ((getCSS(parent, 'opacity') || 1) > 0);

				if(visible && getCSS(parent, 'overflow') != 'visible'){
					outerRect = parent.getBoundingClientRect();
					visible = eLright > outerRect.left &&
						eLleft < outerRect.right &&
						eLbottom > outerRect.top - 1 &&
						eLtop < outerRect.bottom + 1
					;
				}
			}

			return visible;
		};

		var checkElements = function() {
			var eLlen, i, rect, autoLoadElem, loadedSomething, elemExpand, elemNegativeExpand, elemExpandVal,
				beforeExpandVal, defaultExpand, preloadExpand, hFac;
			var lazyloadElems = lazysizes.elements;

			if((loadMode = lazySizesCfg.loadMode) && isLoading < 8 && (eLlen = lazyloadElems.length)){

				i = 0;

				lowRuns++;

				for(; i < eLlen; i++){

					if(!lazyloadElems[i] || lazyloadElems[i]._lazyRace){continue;}

					if(!supportScroll || (lazysizes.prematureUnveil && lazysizes.prematureUnveil(lazyloadElems[i]))){unveilElement(lazyloadElems[i]);continue;}

					if(!(elemExpandVal = lazyloadElems[i][_getAttribute]('data-expand')) || !(elemExpand = elemExpandVal * 1)){
						elemExpand = currentExpand;
					}

					if (!defaultExpand) {
						defaultExpand = (!lazySizesCfg.expand || lazySizesCfg.expand < 1) ?
							docElem.clientHeight > 500 && docElem.clientWidth > 500 ? 500 : 370 :
							lazySizesCfg.expand;

						lazysizes._defEx = defaultExpand;

						preloadExpand = defaultExpand * lazySizesCfg.expFactor;
						hFac = lazySizesCfg.hFac;
						isBodyHidden = null;

						if(currentExpand < preloadExpand && isLoading < 1 && lowRuns > 2 && loadMode > 2 && !document.hidden){
							currentExpand = preloadExpand;
							lowRuns = 0;
						} else if(loadMode > 1 && lowRuns > 1 && isLoading < 6){
							currentExpand = defaultExpand;
						} else {
							currentExpand = shrinkExpand;
						}
					}

					if(beforeExpandVal !== elemExpand){
						eLvW = innerWidth + (elemExpand * hFac);
						elvH = innerHeight + elemExpand;
						elemNegativeExpand = elemExpand * -1;
						beforeExpandVal = elemExpand;
					}

					rect = lazyloadElems[i].getBoundingClientRect();

					if ((eLbottom = rect.bottom) >= elemNegativeExpand &&
						(eLtop = rect.top) <= elvH &&
						(eLright = rect.right) >= elemNegativeExpand * hFac &&
						(eLleft = rect.left) <= eLvW &&
						(eLbottom || eLright || eLleft || eLtop) &&
						(lazySizesCfg.loadHidden || isVisible(lazyloadElems[i])) &&
						((isCompleted && isLoading < 3 && !elemExpandVal && (loadMode < 3 || lowRuns < 4)) || isNestedVisible(lazyloadElems[i], elemExpand))){
						unveilElement(lazyloadElems[i]);
						loadedSomething = true;
						if(isLoading > 9){break;}
					} else if(!loadedSomething && isCompleted && !autoLoadElem &&
						isLoading < 4 && lowRuns < 4 && loadMode > 2 &&
						(preloadElems[0] || lazySizesCfg.preloadAfterLoad) &&
						(preloadElems[0] || (!elemExpandVal && ((eLbottom || eLright || eLleft || eLtop) || lazyloadElems[i][_getAttribute](lazySizesCfg.sizesAttr) != 'auto')))){
						autoLoadElem = preloadElems[0] || lazyloadElems[i];
					}
				}

				if(autoLoadElem && !loadedSomething){
					unveilElement(autoLoadElem);
				}
			}
		};

		var throttledCheckElements = throttle(checkElements);

		var switchLoadingClass = function(e){
			var elem = e.target;

			if (elem._lazyCache) {
				delete elem._lazyCache;
				return;
			}

			resetPreloading(e);
			addClass(elem, lazySizesCfg.loadedClass);
			removeClass(elem, lazySizesCfg.loadingClass);
			addRemoveLoadEvents(elem, rafSwitchLoadingClass);
			triggerEvent(elem, 'lazyloaded');
		};
		var rafedSwitchLoadingClass = rAFIt(switchLoadingClass);
		var rafSwitchLoadingClass = function(e){
			rafedSwitchLoadingClass({target: e.target});
		};

		var changeIframeSrc = function(elem, src){
			var loadMode = elem.getAttribute('data-load-mode') || lazySizesCfg.iframeLoadMode;

			// loadMode can be also a string!
			if (loadMode == 0) {
				elem.contentWindow.location.replace(src);
			} else if (loadMode == 1) {
				elem.src = src;
			}
		};

		var handleSources = function(source){
			var customMedia;

			var sourceSrcset = source[_getAttribute](lazySizesCfg.srcsetAttr);

			if( (customMedia = lazySizesCfg.customMedia[source[_getAttribute]('data-media') || source[_getAttribute]('media')]) ){
				source.setAttribute('media', customMedia);
			}

			if(sourceSrcset){
				source.setAttribute('srcset', sourceSrcset);
			}
		};

		var lazyUnveil = rAFIt(function (elem, detail, isAuto, sizes, isImg){
			var src, srcset, parent, isPicture, event, firesLoad;

			if(!(event = triggerEvent(elem, 'lazybeforeunveil', detail)).defaultPrevented){

				if(sizes){
					if(isAuto){
						addClass(elem, lazySizesCfg.autosizesClass);
					} else {
						elem.setAttribute('sizes', sizes);
					}
				}

				srcset = elem[_getAttribute](lazySizesCfg.srcsetAttr);
				src = elem[_getAttribute](lazySizesCfg.srcAttr);

				if(isImg) {
					parent = elem.parentNode;
					isPicture = parent && regPicture.test(parent.nodeName || '');
				}

				firesLoad = detail.firesLoad || (('src' in elem) && (srcset || src || isPicture));

				event = {target: elem};

				addClass(elem, lazySizesCfg.loadingClass);

				if(firesLoad){
					clearTimeout(resetPreloadingTimer);
					resetPreloadingTimer = setTimeout(resetPreloading, 2500);
					addRemoveLoadEvents(elem, rafSwitchLoadingClass, true);
				}

				if(isPicture){
					forEach.call(parent.getElementsByTagName('source'), handleSources);
				}

				if(srcset){
					elem.setAttribute('srcset', srcset);
				} else if(src && !isPicture){
					if(regIframe.test(elem.nodeName)){
						changeIframeSrc(elem, src);
					} else {
						elem.src = src;
					}
				}

				if(isImg && (srcset || isPicture)){
					updatePolyfill(elem, {src: src});
				}
			}

			if(elem._lazyRace){
				delete elem._lazyRace;
			}
			removeClass(elem, lazySizesCfg.lazyClass);

			rAF(function(){
				// Part of this can be removed as soon as this fix is older: https://bugs.chromium.org/p/chromium/issues/detail?id=7731 (2015)
				var isLoaded = elem.complete && elem.naturalWidth > 1;

				if( !firesLoad || isLoaded){
					if (isLoaded) {
						addClass(elem, lazySizesCfg.fastLoadedClass);
					}
					switchLoadingClass(event);
					elem._lazyCache = true;
					setTimeout(function(){
						if ('_lazyCache' in elem) {
							delete elem._lazyCache;
						}
					}, 9);
				}
				if (elem.loading == 'lazy') {
					isLoading--;
				}
			}, true);
		});

		/**
		 *
		 * @param elem { Element }
		 */
		var unveilElement = function (elem){
			if (elem._lazyRace) {return;}
			var detail;

			var isImg = regImg.test(elem.nodeName);

			//allow using sizes="auto", but don't use. it's invalid. Use data-sizes="auto" or a valid value for sizes instead (i.e.: sizes="80vw")
			var sizes = isImg && (elem[_getAttribute](lazySizesCfg.sizesAttr) || elem[_getAttribute]('sizes'));
			var isAuto = sizes == 'auto';

			if( (isAuto || !isCompleted) && isImg && (elem[_getAttribute]('src') || elem.srcset) && !elem.complete && !hasClass(elem, lazySizesCfg.errorClass) && hasClass(elem, lazySizesCfg.lazyClass)){return;}

			detail = triggerEvent(elem, 'lazyunveilread').detail;

			if(isAuto){
				 autoSizer.updateElem(elem, true, elem.offsetWidth);
			}

			elem._lazyRace = true;
			isLoading++;

			lazyUnveil(elem, detail, isAuto, sizes, isImg);
		};

		var afterScroll = debounce(function(){
			lazySizesCfg.loadMode = 3;
			throttledCheckElements();
		});

		var altLoadmodeScrollListner = function(){
			if(lazySizesCfg.loadMode == 3){
				lazySizesCfg.loadMode = 2;
			}
			afterScroll();
		};

		var onload = function(){
			if(isCompleted){return;}
			if(Date.now() - started < 999){
				setTimeout(onload, 999);
				return;
			}


			isCompleted = true;

			lazySizesCfg.loadMode = 3;

			throttledCheckElements();

			addEventListener('scroll', altLoadmodeScrollListner, true);
		};

		return {
			_: function(){
				started = Date.now();

				lazysizes.elements = document.getElementsByClassName(lazySizesCfg.lazyClass);
				preloadElems = document.getElementsByClassName(lazySizesCfg.lazyClass + ' ' + lazySizesCfg.preloadClass);

				addEventListener('scroll', throttledCheckElements, true);

				addEventListener('resize', throttledCheckElements, true);

				addEventListener('pageshow', function (e) {
					if (e.persisted) {
						var loadingElements = document.querySelectorAll('.' + lazySizesCfg.loadingClass);

						if (loadingElements.length && loadingElements.forEach) {
							requestAnimationFrame(function () {
								loadingElements.forEach( function (img) {
									if (img.complete) {
										unveilElement(img);
									}
								});
							});
						}
					}
				});

				if(window.MutationObserver){
					new MutationObserver( throttledCheckElements ).observe( docElem, {childList: true, subtree: true, attributes: true} );
				} else {
					docElem[_addEventListener]('DOMNodeInserted', throttledCheckElements, true);
					docElem[_addEventListener]('DOMAttrModified', throttledCheckElements, true);
					setInterval(throttledCheckElements, 999);
				}

				addEventListener('hashchange', throttledCheckElements, true);

				//, 'fullscreenchange'
				['focus', 'mouseover', 'click', 'load', 'transitionend', 'animationend'].forEach(function(name){
					document[_addEventListener](name, throttledCheckElements, true);
				});

				if((/d$|^c/.test(document.readyState))){
					onload();
				} else {
					addEventListener('load', onload);
					document[_addEventListener]('DOMContentLoaded', throttledCheckElements);
					setTimeout(onload, 20000);
				}

				if(lazysizes.elements.length){
					checkElements();
					rAF._lsFlush();
				} else {
					throttledCheckElements();
				}
			},
			checkElems: throttledCheckElements,
			unveil: unveilElement,
			_aLSL: altLoadmodeScrollListner,
		};
	})();


	var autoSizer = (function(){
		var autosizesElems;

		var sizeElement = rAFIt(function(elem, parent, event, width){
			var sources, i, len;
			elem._lazysizesWidth = width;
			width += 'px';

			elem.setAttribute('sizes', width);

			if(regPicture.test(parent.nodeName || '')){
				sources = parent.getElementsByTagName('source');
				for(i = 0, len = sources.length; i < len; i++){
					sources[i].setAttribute('sizes', width);
				}
			}

			if(!event.detail.dataAttr){
				updatePolyfill(elem, event.detail);
			}
		});
		/**
		 *
		 * @param elem {Element}
		 * @param dataAttr
		 * @param [width] { number }
		 */
		var getSizeElement = function (elem, dataAttr, width){
			var event;
			var parent = elem.parentNode;

			if(parent){
				width = getWidth(elem, parent, width);
				event = triggerEvent(elem, 'lazybeforesizes', {width: width, dataAttr: !!dataAttr});

				if(!event.defaultPrevented){
					width = event.detail.width;

					if(width && width !== elem._lazysizesWidth){
						sizeElement(elem, parent, event, width);
					}
				}
			}
		};

		var updateElementsSizes = function(){
			var i;
			var len = autosizesElems.length;
			if(len){
				i = 0;

				for(; i < len; i++){
					getSizeElement(autosizesElems[i]);
				}
			}
		};

		var debouncedUpdateElementsSizes = debounce(updateElementsSizes);

		return {
			_: function(){
				autosizesElems = document.getElementsByClassName(lazySizesCfg.autosizesClass);
				addEventListener('resize', debouncedUpdateElementsSizes);
			},
			checkElems: debouncedUpdateElementsSizes,
			updateElem: getSizeElement
		};
	})();

	var init = function(){
		if(!init.i && document.getElementsByClassName){
			init.i = true;
			autoSizer._();
			loader._();
		}
	};

	setTimeout(function(){
		if(lazySizesCfg.init){
			init();
		}
	});

	lazysizes = {
		/**
		 * @type { LazySizesConfigPartial }
		 */
		cfg: lazySizesCfg,
		autoSizer: autoSizer,
		loader: loader,
		init: init,
		uP: updatePolyfill,
		aC: addClass,
		rC: removeClass,
		hC: hasClass,
		fire: triggerEvent,
		gW: getWidth,
		rAF: rAF,
	};

	return lazysizes;
}
));


/***/ }),

/***/ 1770:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(window, factory) {
	if(!window) {return;}
	var globalInstall = function(){
		factory(window.lazySizes);
		window.removeEventListener('lazyunveilread', globalInstall, true);
	};

	factory = factory.bind(null, window, window.document);

	if( true && module.exports){
		factory(__webpack_require__(7090));
	} else if (true) {
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(7090)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}(typeof window != 'undefined' ?
	window : 0, function(window, document, lazySizes) {
	'use strict';

	if(!window.addEventListener){return;}

	var regDescriptors = /\s+(\d+)(w|h)\s+(\d+)(w|h)/;
	var regCssFit = /parent-fit["']*\s*:\s*["']*(contain|cover|width)/;
	var regCssObject = /parent-container["']*\s*:\s*["']*(.+?)(?=(\s|$|,|'|"|;))/;
	var regPicture = /^picture$/i;
	var cfg = lazySizes.cfg;

	var getCSS = function (elem){
		return (getComputedStyle(elem, null) || {});
	};

	var parentFit = {

		getParent: function(element, parentSel){
			var parent = element;
			var parentNode = element.parentNode;

			if((!parentSel || parentSel == 'prev') && parentNode && regPicture.test(parentNode.nodeName || '')){
				parentNode = parentNode.parentNode;
			}

			if(parentSel != 'self'){
				if(parentSel == 'prev'){
					parent = element.previousElementSibling;
				} else if(parentSel && (parentNode.closest || window.jQuery)){
					parent = (parentNode.closest ?
							parentNode.closest(parentSel) :
							jQuery(parentNode).closest(parentSel)[0]) ||
						parentNode
					;
				} else {
					parent = parentNode;
				}
			}

			return parent;
		},

		getFit: function(element){
			var tmpMatch, parentObj;
			var css = getCSS(element);
			var content = css.content || css.fontFamily;
			var obj = {
				fit: element._lazysizesParentFit || element.getAttribute('data-parent-fit')
			};

			if(!obj.fit && content && (tmpMatch = content.match(regCssFit))){
				obj.fit = tmpMatch[1];
			}

			if(obj.fit){
				parentObj = element._lazysizesParentContainer || element.getAttribute('data-parent-container');

				if(!parentObj && content && (tmpMatch = content.match(regCssObject))){
					parentObj = tmpMatch[1];
				}

				obj.parent = parentFit.getParent(element, parentObj);


			} else {
				obj.fit = css.objectFit;
			}

			return obj;
		},

		getImageRatio: function(element){
			var i, srcset, media, ratio, match, width, height;
			var parent = element.parentNode;
			var elements = parent && regPicture.test(parent.nodeName || '') ?
					parent.querySelectorAll('source, img') :
					[element]
				;

			for(i = 0; i < elements.length; i++){
				element = elements[i];
				srcset = element.getAttribute(cfg.srcsetAttr) || element.getAttribute('srcset') || element.getAttribute('data-pfsrcset') || element.getAttribute('data-risrcset') || '';
				media = element._lsMedia || element.getAttribute('media');
				media = cfg.customMedia[element.getAttribute('data-media') || media] || media;

				if(srcset && (!media || (window.matchMedia && matchMedia(media) || {}).matches )){
					ratio = parseFloat(element.getAttribute('data-aspectratio'));

					if (!ratio) {
						match = srcset.match(regDescriptors);

						if (match) {
							if(match[2] == 'w'){
								width = match[1];
								height = match[3];
							} else {
								width = match[3];
								height = match[1];
							}
						} else {
							width = element.getAttribute('width');
							height = element.getAttribute('height');
						}

						ratio = width / height;
					}

					break;
				}
			}

			return ratio;
		},

		calculateSize: function(element, width){
			var displayRatio, height, imageRatio, retWidth;
			var fitObj = this.getFit(element);
			var fit = fitObj.fit;
			var fitElem = fitObj.parent;

			if(fit != 'width' && ((fit != 'contain' && fit != 'cover') || !(imageRatio = this.getImageRatio(element)))){
				return width;
			}

			if(fitElem){
				width = fitElem.clientWidth;
			} else {
				fitElem = element;
			}

			retWidth = width;

			if(fit == 'width'){
				retWidth = width;
			} else {
				height = fitElem.clientHeight;

				if((displayRatio =  width / height) && ((fit == 'cover' && displayRatio < imageRatio) || (fit == 'contain' && displayRatio > imageRatio))){
					retWidth = width * (imageRatio / displayRatio);
				}
			}

			return retWidth;
		}
	};

	lazySizes.parentFit = parentFit;

	document.addEventListener('lazybeforesizes', function(e){
		if(e.defaultPrevented || e.detail.instance != lazySizes){return;}

		var element = e.target;
		e.detail.width = parentFit.calculateSize(element, e.detail.width);
	});
}));


/***/ }),

/***/ 5065:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ 735:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartAPI = void 0;
const { routes } = window;
class CartAPI {
    change(config) {
        return fetch(routes.cart_change_url, config).then(response => response.text());
    }
    add(config) {
        return fetch(routes.cart_add_url, config).then(response => response.text());
    }
    update(config) {
        return fetch(routes.cart_update_url, config);
    }
    get() {
        return fetch(routes.cart_url).then(response => response.text());
    }
    getDrawer() {
        return fetch(routes.root_url).then(response => response.text());
    }
}
exports.CartAPI = CartAPI;


/***/ }),

/***/ 3191:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PredictiveSearchAPI = void 0;
const { routes } = window;
class PredictiveSearchAPI {
    get(params) {
        const { searchQuery, sectionParam, limitParam, fieldsParam } = params;
        const baseUrl = routes.predictive_search_url;
        return fetch(`${baseUrl}?q=${searchQuery}&${limitParam}&${sectionParam}&${fieldsParam}`).then(response => response.text());
    }
}
exports.PredictiveSearchAPI = PredictiveSearchAPI;


/***/ }),

/***/ 9867:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccordeonButton = void 0;
const base_component_1 = __webpack_require__(3608);
const key_1 = __webpack_require__(9650);
const utils_1 = __webpack_require__(4083);
const ACCORDEON_SELECTOR = 'accordeon-component';
class AccordeonButton extends base_component_1.BaseComponent {
    mountComponent() {
        this.addListener(this, 'click', this.handleButtonClick);
        this.addListener(this, 'keydown', this.handleKeyDown);
    }
    handleButtonClick = (event) => {
        event.preventDefault();
        this.toggle();
    };
    handleKeyDown = (event) => {
        if ((0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            this.toggle();
        }
    };
    toggle() {
        const accordeon = (0, utils_1.$elParent)(ACCORDEON_SELECTOR, this);
        accordeon?.toggle();
    }
}
exports.AccordeonButton = AccordeonButton;


/***/ }),

/***/ 4604:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccordeonComponent = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const CONTENT_WRAP_SELECTOR = `[data-accordeon-content-wrap]`;
const CONTENT_SELECTOR = `[data-accordeon-content]`;
const BODY_ELEMENT_SELECTOR = 'body-element';
class AccordeonComponent extends base_component_1.BaseComponent {
    resizeObserver;
    isExpanded;
    mountComponent() {
        const content = (0, utils_1.$el)(CONTENT_SELECTOR, this);
        this.isExpanded = this.getAttribute('data-aria-expanded') === 'true';
        this.updateHeight();
        this.addListener(this, 'focusout', this.handleAccordeonFocusout);
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(content);
    }
    unmountComponent() {
        this.resizeObserver.disconnect();
    }
    handleAccordeonFocusout = () => {
        const bodyElement = (0, utils_1.$el)(BODY_ELEMENT_SELECTOR);
        if (!this.isExpanded && bodyElement.isUsingKeyboard) {
            this.show();
        }
    };
    handleResize = () => {
        this.updateHeight();
    };
    hide() {
        this.setExpand(false);
        this.emit('hide', { blockId: this.dataset.blockId });
    }
    show() {
        this.setExpand(true);
        this.emit('show', { blockId: this.dataset.blockId });
    }
    toggle() {
        this.setExpand(!this.isExpanded);
        this.emit('toggle', { blockId: this.dataset.blockId });
    }
    updateHeight() {
        const contentWrap = (0, utils_1.$el)(CONTENT_WRAP_SELECTOR, this);
        const content = (0, utils_1.$el)(CONTENT_SELECTOR, this);
        if (content) {
            contentWrap.style.maxHeight = `${Math.ceil(this.isExpanded ? content.scrollHeight : 0)}px`;
        }
    }
    setExpand(isExpanded) {
        this.isExpanded = isExpanded;
        this.setAttribute('data-aria-expanded', isExpanded ? 'true' : 'false');
        this.updateHeight();
    }
}
exports.AccordeonComponent = AccordeonComponent;


/***/ }),

/***/ 7606:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccordeonButton = exports.AccordeonComponent = void 0;
var accordeon_1 = __webpack_require__(4604);
Object.defineProperty(exports, "AccordeonComponent", ({ enumerable: true, get: function () { return accordeon_1.AccordeonComponent; } }));
var accordeon_button_1 = __webpack_require__(9867);
Object.defineProperty(exports, "AccordeonButton", ({ enumerable: true, get: function () { return accordeon_button_1.AccordeonButton; } }));


/***/ }),

/***/ 29:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const check_media_1 = __webpack_require__(5580);
const utils_1 = __webpack_require__(4083);
const SCROLL_ANIMATION_TRIGGER_CLASSNAME = 'scroll-trigger';
const SCROLL_ANIMATION_OFFSCREEN_CLASSNAME = 'scroll-trigger--offscreen';
const ZOOM_OUT_CLASSNAME = 'animate--zoom-out';
const KEEP_OBSERVE_ATTRIBUTE = 'data-keep-observe-animation';
const REMOVE_ANIMATION_CLASS_ATTRIBUTE = 'data-remove-animation-class';
const IS_SLIDE_CLASSNAME = 'slider-grid__slide';
const REGULAR_IMGAE_ZOOM_CLASSNAME = 'zoom';
function onIntersection(elements, observer) {
    elements.forEach((element, index) => {
        const elementTarget = element.target;
        if (element.isIntersecting) {
            handleIntersecting(elementTarget, index, observer);
        }
        else {
            handleNonIntersecting(elementTarget, observer);
        }
    });
}
function handleIntersecting(elementTarget, index, observer) {
    if (elementTarget.classList.contains(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME)) {
        elementTarget.classList.remove(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME);
        elementTarget.setAttribute('style', `--gsc-animation-order: ${index};`);
    }
    if (elementTarget.hasAttribute(REMOVE_ANIMATION_CLASS_ATTRIBUTE) ||
        elementTarget.classList.contains(REGULAR_IMGAE_ZOOM_CLASSNAME)) {
        removeAnimationClasses(elementTarget);
    }
    if (!elementTarget.hasAttribute(KEEP_OBSERVE_ATTRIBUTE)) {
        observer.unobserve(elementTarget);
    }
}
function handleNonIntersecting(elementTarget, observer) {
    if ((0, check_media_1.isMobile)() &&
        (elementTarget.classList.contains(IS_SLIDE_CLASSNAME) ||
            elementTarget.classList.contains(ZOOM_OUT_CLASSNAME)) &&
        elementTarget.getBoundingClientRect().left >
            document.body.getBoundingClientRect().width) {
        elementTarget.classList.remove(SCROLL_ANIMATION_TRIGGER_CLASSNAME);
        observer.unobserve(elementTarget);
    }
    else {
        elementTarget.classList.add(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME);
    }
}
async function removeAnimationClasses(elementTarget) {
    await (0, utils_1.transitionToPromise)(elementTarget);
    elementTarget.classList.remove(SCROLL_ANIMATION_TRIGGER_CLASSNAME);
    elementTarget.removeAttribute('style');
}
function getObserverOptions() {
    const asidePaddings = getComputedStyle(document.body).getPropertyValue('--gsc-aside-padding-size');
    return {
        rootMargin: `0px -${asidePaddings} -25px -${asidePaddings}`,
    };
}
function initializeScrollAnimationTrigger() {
    const animationTriggerElements = Array.from(document.getElementsByClassName(SCROLL_ANIMATION_TRIGGER_CLASSNAME));
    if (animationTriggerElements.length === 0)
        return;
    const observer = new IntersectionObserver(onIntersection, getObserverOptions());
    animationTriggerElements.forEach(element => observer.observe(element));
}
window.addEventListener('DOMContentLoaded', () => {
    initializeScrollAnimationTrigger();
});


/***/ }),

/***/ 5318:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BackToTopButton = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const key_1 = __webpack_require__(9650);
const debounce_1 = __webpack_require__(2731);
const BUTTON_SELECTOR = '[data-back-to-top-button]';
class BackToTopButton extends base_component_1.BaseComponent {
    lastPosition = 0;
    mountComponent() {
        this.addListener(this, 'keydown', this.handleKeydown);
        this.addListener(this, 'click', this.handleButtonClick);
        this.addListener(window, 'scroll', this.handleWindowScroll);
    }
    handleWindowScroll = (0, debounce_1.debounce)(() => {
        const button = (0, utils_1.$el)(BUTTON_SELECTOR, this);
        const { scrollY, innerHeight } = window;
        button?.classList.toggle('is-visible', scrollY > innerHeight && scrollY < this.lastPosition);
        this.lastPosition = scrollY === 0 ? this.lastPosition + 1 : scrollY;
    }, 100);
    handleButtonClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    handleKeydown = (event) => {
        if ((0, key_1.isEnterKey)(event)) {
            const skipContent = (0, utils_1.$el)('#SkipContent');
            window.scrollTo({ top: 0, behavior: 'instant' });
            skipContent.focus();
        }
    };
}
exports.BackToTopButton = BackToTopButton;


/***/ }),

/***/ 1521:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BackToTopButton = void 0;
var back_to_top_button_1 = __webpack_require__(5318);
Object.defineProperty(exports, "BackToTopButton", ({ enumerable: true, get: function () { return back_to_top_button_1.BackToTopButton; } }));


/***/ }),

/***/ 2506:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseComponent = void 0;
const editor_1 = __webpack_require__(6353);
const { Shopify } = window;
class BaseComponent extends HTMLElement {
    listeners = [];
    events = {};
    editor = new editor_1.ShopifyEditor();
    isEditor = Shopify.designMode;
    connectedCallback() {
        try {
            this.mountComponent();
        }
        catch (error) {
            console.log(this.tagName, 'mount', error.name);
            console.log(error);
        }
    }
    disconnectedCallback() {
        try {
            this.unmountComponent();
        }
        catch (error) {
            console.log(this.tagName, 'unmount', error.name);
        }
        if (this.isEditor) {
            this.editor.destroy();
        }
        this.destroyListeners();
    }
    mountComponent() { }
    unmountComponent() { }
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }
    off(event, removedListener) {
        if (!this.events[event]) {
            return;
        }
        this.events[event] = this.events[event].filter(listener => listener !== removedListener);
    }
    emit(event, data) {
        if (!this.events[event]) {
            return;
        }
        this.events[event].forEach(listener => listener(data));
    }
    addListener(element, event, listener, options) {
        if (!element || !event || !listener) {
            return;
        }
        element.addEventListener(event, listener, options);
        this.listeners = [...this.listeners, { element, event, listener }];
    }
    removeListener(targetElement, targetEvent, targetListener) {
        if (!targetElement || !targetEvent || !targetListener) {
            return;
        }
        targetElement.removeEventListener(targetEvent, targetListener);
        this.listeners = this.listeners.filter(({ element, event, listener }) => {
            return (element !== targetElement &&
                event !== targetEvent &&
                listener !== targetListener);
        });
    }
    destroyListeners() {
        this.listeners.forEach(({ element, event, listener }) => {
            element.removeEventListener(event, listener);
        });
        this.listeners = [];
    }
}
exports.BaseComponent = BaseComponent;


/***/ }),

/***/ 6353:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShopifyEditor = void 0;
const constants_1 = __webpack_require__(3036);
class ShopifyEditor {
    listeners = {};
    on(eventName, listener) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        document.addEventListener(constants_1.SHOPIFY_EVENTS[eventName], listener);
        this.listeners[eventName].push(listener);
    }
    off(eventName, removedListener) {
        if (!this.listeners[eventName]) {
            return;
        }
        document.removeEventListener(constants_1.SHOPIFY_EVENTS[eventName], removedListener);
        this.listeners[eventName] = this.listeners[eventName].filter(listener => listener !== removedListener);
    }
    destroy() {
        Object.keys(this.listeners).forEach(event => {
            this.listeners[event].forEach(listener => {
                this.off(event, listener);
            });
        });
        this.listeners = {};
    }
}
exports.ShopifyEditor = ShopifyEditor;


/***/ }),

/***/ 3608:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShopifyEditor = exports.BaseComponent = void 0;
var base_component_1 = __webpack_require__(2506);
Object.defineProperty(exports, "BaseComponent", ({ enumerable: true, get: function () { return base_component_1.BaseComponent; } }));
var editor_1 = __webpack_require__(6353);
Object.defineProperty(exports, "ShopifyEditor", ({ enumerable: true, get: function () { return editor_1.ShopifyEditor; } }));


/***/ }),

/***/ 3831:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BodyElement = void 0;
const product_breadcrumbs_1 = __webpack_require__(9180);
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
const utils_2 = __webpack_require__(4142);
const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
class BodyElement extends base_component_1.BaseComponent {
    notification;
    overlayCalls = [];
    isScrolling = false;
    timeoutScrollId;
    removeOverlayTimeoutId;
    prefetchedLinks = [];
    isVisible;
    isFixed;
    fixedTopPosition;
    openedDialogWindows = [];
    lastFocusedTarget;
    currentFocusEl;
    isUsingKeyboard = false;
    zIndex;
    scrollbarWidth;
    isOpenedOnFirefox;
    withGradient;
    mountComponent() {
        this.setBreadcrumbs();
        this.setViewportObserver();
        this.setRegistrationMessage();
        this.setNotification();
        this.setThemeInfo();
        this.isFixed = false;
        this.addListener(window, 'wheel', this.handleWindowWheel);
        this.addListener(window, 'beforeunload', this.handlePageChange);
        this.addListener(window, 'pagehide', this.handlePageHide);
        this.addListener(window, 'pageshow', this.handlePageShow);
        this.addListener(document, 'mouseover', this.handleLinkOver);
        this.addListener(document, 'mousedown', this.handleMousedown);
        this.addListener(document, 'keydown', this.handleKeydown);
        this.addListener(document, 'focusout', this.handleFocusout);
        this.removeLoadingOverlay('#GlobalLoadingOverlayDots');
        this.removeOverlayTimeoutId = setTimeout(() => {
            this.removeLoadingOverlay('#GlobalLoadingOverlayDots');
        }, 5000);
        this.setGradientOverlay();
    }
    unmountComponent() {
        clearTimeout(this.timeoutScrollId);
        clearTimeout(this.removeOverlayTimeoutId);
    }
    handleMousedown = () => {
        this.setUsingKeyboard(false);
    };
    handleKeydown = () => {
        this.setUsingKeyboard(true);
    };
    addDialogWindow(newWindowId) {
        if (this.openedDialogWindows.length === 0) {
            const isNotWindowChild = this.openedDialogWindows.every(windowId => {
                return !this.currentFocusEl.closest(`[id="${windowId}"]`);
            });
            if (isNotWindowChild) {
                this.lastFocusedTarget = this.currentFocusEl || (0, utils_1.$el)('#MainContent');
            }
        }
        if (!this.openedDialogWindows.includes(newWindowId)) {
            this.openedDialogWindows = [...this.openedDialogWindows, newWindowId];
        }
    }
    removeDialogWindow(removedWindowId) {
        this.openedDialogWindows = this.openedDialogWindows.filter(windowId => windowId !== removedWindowId);
        const lastOpenedWindowId = this.openedDialogWindows[this.openedDialogWindows.length - 1];
        if (lastOpenedWindowId) {
            const lastOpenedWindow = (0, utils_1.$el)(`#${lastOpenedWindowId}`);
            const { firstTarget } = (0, utils_1.getTargets)(lastOpenedWindow);
            firstTarget?.focus();
        }
        else if (this.lastFocusedTarget) {
            this.lastFocusedTarget.focus();
            this.lastFocusedTarget = null;
        }
    }
    isLastOpenedWindow(windowId) {
        return (this.openedDialogWindows[this.openedDialogWindows.length - 1] === windowId);
    }
    setUsingKeyboard(usingKeyboard) {
        document.body.classList.toggle('using-keyboard', usingKeyboard);
        this.isUsingKeyboard = usingKeyboard;
    }
    handleFocusout = event => {
        const focusTarget = event.relatedTarget;
        if (focusTarget) {
            this.currentFocusEl = focusTarget;
        }
    };
    setBreadcrumbs() {
        if (window.location.pathname.includes('products')) {
            customElements.define('product-breadcrumbs', product_breadcrumbs_1.ProductBreadcrumbs);
            const breadcrumbs = (0, utils_1.$list)('product-breadcrumbs');
            if (breadcrumbs.length) {
                const page = localStorage.getItem('prevCollectionPage');
                breadcrumbs.forEach(el => el.setCollectionPage(page));
                localStorage.removeItem('prevCollectionPage');
            }
        }
        else if (!window.location.pathname.includes('collections')) {
            localStorage.removeItem('prevCollectionPage');
        }
    }
    setViewportObserver() {
        const sections = (0, utils_1.$list)('.shopify-section');
        sections.forEach(section => {
            utils_1.viewportObserver.observe(section);
        });
    }
    setThemeInfo() {
        window.auroraTheme = {
            ...window.auroraTheme,
            theme_version: '3.5.0',
            id: window.Shopify.theme.id,
            storeId: window.Shopify.theme.theme_store_id,
            isLicenseTheme: !!window.Shopify.theme.theme_store_id,
        };
    }
    handleWindowWheel = () => {
        if (this.timeoutScrollId) {
            clearTimeout(this.timeoutScrollId);
            this.isScrolling = true;
        }
        this.timeoutScrollId = setTimeout(() => {
            this.isScrolling = false;
        }, 200);
    };
    handleLinkOver = (event) => {
        const link = (0, utils_1.$elParent)('a[href]', event.target);
        const href = link?.href;
        if (!href) {
            return;
        }
        if (link?.hasAttribute('without-prefetch-on-hover')) {
            return;
        }
        const wasPrefetched = this.prefetchedLinks.includes(href);
        const isNotPrefetchetable = (0, utils_1.isExternalLink)(href) || (0, utils_1.isCurrentPageLink)(href);
        if (wasPrefetched || isNotPrefetchetable) {
            return;
        }
        (0, utils_1.createPrefetchLink)(href);
        this.prefetchedLinks.push(href);
    };
    handlePageChange = () => {
        this.showLoadingOverlay('#GlobalLoadingOverlayDots');
    };
    handlePageHide = () => {
        this.removeLoadingOverlay('#GlobalLoadingOverlayDots');
    };
    handlePageShow = () => {
        this.removeLoadingOverlay('#GlobalLoadingOverlayDots');
    };
    showLoadingOverlay = (selector) => {
        this.setScrollLock();
        const loadingOverlay = (0, utils_1.$el)(selector);
        loadingOverlay.classList.remove('hidden');
        requestAnimationFrame(() => {
            loadingOverlay.style.opacity = '1';
        });
    };
    removeLoadingOverlay = async (selector) => {
        const loadingOverlay = (0, utils_1.$el)(selector);
        if (loadingOverlay.classList.contains('hidden')) {
            return;
        }
        loadingOverlay.style.opacity = '0';
        await (0, utils_1.transitionToPromise)(loadingOverlay);
        loadingOverlay.classList.add('hidden');
        this.unsetScrollLock();
    };
    setNotification() {
        const notification = (0, utils_1.$el)('#GlobalNotification');
        if (!notification || !window.notification) {
            return;
        }
        const { text, variant, duration } = window.notification;
        notification.show(text, variant, duration);
    }
    showOverlay(key, styles) {
        this.zIndex = styles.zIndex ?? 3;
        this.setScrollLock();
        this.setZindexVariable();
        this.setOverlayStyles(styles);
        if (styles.backdropFilter) {
            this.classList.add('with-custom-background');
        }
        this.classList.add('visible');
        this.isVisible = true;
        this.overlayCalls = [...this.overlayCalls, { key, styles }];
    }
    async hideOverlay(key) {
        if (!this.isVisible) {
            return;
        }
        this.overlayCalls = this.overlayCalls.filter(overlayCall => overlayCall.key !== key);
        const lastCall = this.overlayCalls[this.overlayCalls.length - 1];
        if (lastCall) {
            this.setOverlayStyles(lastCall.styles);
        }
        else {
            this.isVisible = false;
            this.setOverlayZindex();
            await (0, utils_1.transitionToPromise)(this);
            if (this.isVisible === false) {
                this.unsetScrollLock();
                this.classList.remove('visible');
                this.classList.remove('with-custom-background');
                await (0, utils_1.transitionToPromise)(this);
                this.removeZindexVariable();
            }
        }
    }
    showNotification = (text, variant, duration) => {
        const notification = (0, utils_1.$el)('#GlobalNotification');
        notification.show(text, variant, duration);
    };
    setScrollLock() {
        this.isFixed = true;
        this.scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;
        if (this.scrollbarWidth && !isFirefox) {
            this.fixedTopPosition = window.scrollY || this.fixedTopPosition;
            document.body.style.top = `-${this.fixedTopPosition}px`;
            document.body.classList.add('scroll-y-off');
        }
        else {
            if (!this.isOpenedOnFirefox) {
                document.body.style.paddingRight = `${this.scrollbarWidth}px`;
            }
            document.body.classList.add('scroll-y-off-firefox');
            this.isOpenedOnFirefox = true;
        }
    }
    unsetScrollLock() {
        if (!this.isFixed) {
            return;
        }
        this.isFixed = false;
        if (this.scrollbarWidth && !isFirefox) {
            document.body.style.top = '';
            document.body.classList.remove('scroll-y-off');
            if (this.fixedTopPosition) {
                window.scrollTo(0, this.fixedTopPosition);
                this.fixedTopPosition = undefined;
            }
        }
        else {
            document.body.style.paddingRight = '';
            document.body.classList.remove('scroll-y-off-firefox');
            this.isOpenedOnFirefox = false;
        }
    }
    setOverlayStyles(styles = {}) {
        Object.keys(styles).forEach(key => {
            this.style[key] = styles[key];
        });
    }
    setOverlayZindex() {
        this.setAttribute('style', `z-index: ${this.zIndex};`);
    }
    setZindexVariable = () => {
        (0, dom_1.setStyleVariable)('body-overlay-zIndex', this.zIndex);
    };
    removeZindexVariable = () => {
        (0, dom_1.removeStyleVariable)('body-overlay-zIndex');
    };
    setRegistrationMessage = () => {
        const isCaptchaPage = window.location.pathname.includes('challenge');
        const isAccountPage = window.location.pathname.includes('account');
        if (!isCaptchaPage && !isAccountPage) {
            if (localStorage.getItem('isRegistered')) {
                (0, utils_1.whenDefined)('notification-component').then(() => {
                    const message = window.auroraThemeLocales.registrationMessage;
                    const visibilityDuration = 10000;
                    const notification = (0, utils_1.$el)('#GlobalNotification');
                    notification.show(message, 'success', visibilityDuration);
                    localStorage.removeItem('isRegistered');
                });
            }
        }
    };
    setGradientOverlay = () => {
        if (this.hasAttribute('data-gradient') && !this.withGradient) {
            this.parentElement.setAttribute('style', `--gsc-gradient-overlay: ${(0, utils_2.gradientOpacity)(this.dataset.gradient, this.dataset.opacity)}`);
            this.withGradient = true;
        }
    };
}
exports.BodyElement = BodyElement;


/***/ }),

/***/ 8659:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LazyVideo = void 0;
const base_component_1 = __webpack_require__(3608);
const INTERSECTION_OBSERVER_OPTIONS = {
    root: null,
    rootMargin: '0px 0px 200px 0px',
};
class LazyVideo extends base_component_1.BaseComponent {
    intersectionObserver;
    mountComponent() {
        this.addListener(window, 'load', this.handleWindowLoad);
    }
    unmountComponent() {
        this.removeListener(window, 'load', this.handleWindowLoad);
        this.intersectionObserver?.disconnect();
    }
    handleWindowLoad = () => {
        this.intersectionObserver = new IntersectionObserver(this.handleIntersectionObserve, INTERSECTION_OBSERVER_OPTIONS);
        this.intersectionObserver.observe(this);
    };
    handleIntersectionObserve = (entries) => {
        if (!entries[0].isIntersecting) {
            return;
        }
        this.intersectionObserver.unobserve(this);
        this.intersectionObserver.disconnect();
        this.initVideo();
    };
    initVideo = () => {
        const parentNode = this.parentNode;
        const withAutoplay = this.hasAttribute('with-autoplay');
        if (!parentNode) {
            return;
        }
        const video = this.querySelector('video');
        video.load();
        const handleTouch = () => {
            if (video.paused && withAutoplay) {
                video.load();
                video.play();
            }
            this.removeListener(window, 'touchstart', handleTouch);
        };
        const handleCanPlay = () => {
            parentNode.replaceChild(video, this);
            if (withAutoplay) {
                video.play();
            }
            this.removeListener(video, 'canplaythrough', handleCanPlay);
        };
        this.addListener(video, 'canplaythrough', handleCanPlay);
        this.addListener(window, 'touchstart', handleTouch);
    };
}
exports.LazyVideo = LazyVideo;


/***/ }),

/***/ 6219:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ArticleTags = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const debounce_1 = __webpack_require__(2731);
const COLLAPSED_TAGS_SELECTOR = '[data-collapsed-tags]';
const TAG_SELECTOR = '[data-tag]';
const EXTEND_BUTTON_SELECTOR = `[data-extend-button]`;
class ArticleTags extends base_component_1.BaseComponent {
    extendButton;
    extendButtonWidth;
    maxBottomPoint;
    resizeObserver;
    constructor() {
        super();
        this.extendButton = (0, utils_1.$el)(EXTEND_BUTTON_SELECTOR, this);
        this.extendButtonWidth = this.extendButton?.offsetWidth ?? 0;
    }
    mountComponent() {
        this.resizeObserver = new ResizeObserver(this.handleContentResize);
        this.resizeObserver.observe(this);
    }
    unmountComponent() {
        this.resizeObserver.disconnect();
    }
    handleContentResize = (0, debounce_1.debounce)(() => {
        this.update();
    }, 200);
    updateButtonVisible() {
        if (!this.extendButton) {
            return;
        }
        const hiddenTags = this.querySelectorAll('[tag-hidden]');
        const hasHiddenTags = hiddenTags.length > 0;
        if (hasHiddenTags) {
            const left = hiddenTags[0].style.left;
            this.extendButton.style.left = left;
        }
        this.extendButton.classList.toggle('hidden', !hasHiddenTags);
    }
    updateTagsVisible() {
        const tags = (0, utils_1.$list)(TAG_SELECTOR, this);
        const isToCollapse = tags.findIndex(tag => tag.getBoundingClientRect().bottom > this.maxBottomPoint);
        if (isToCollapse === -1) {
            return;
        }
        const tagsToCollapse = tags.slice(isToCollapse - 1);
        const hiddenTags = (0, utils_1.$el)(COLLAPSED_TAGS_SELECTOR, this);
        const collapsedTagsFragment = document.createDocumentFragment();
        tagsToCollapse.forEach(tag => {
            const clone = tag.cloneNode(true);
            tag.setAttribute('tag-hidden', '');
            collapsedTagsFragment.appendChild(clone);
        });
        hiddenTags?.element.replaceChildren(collapsedTagsFragment);
    }
    update() {
        this.maxBottomPoint = this.getBoundingClientRect().bottom;
        if (this.maxBottomPoint > 0) {
            this.updateTagsVisible();
            this.updateButtonVisible();
            this.setAttribute('visible', '');
        }
    }
}
exports.ArticleTags = ArticleTags;


/***/ }),

/***/ 8616:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ArticleTags = void 0;
var article_tags_1 = __webpack_require__(6219);
Object.defineProperty(exports, "ArticleTags", ({ enumerable: true, get: function () { return article_tags_1.ArticleTags; } }));


/***/ }),

/***/ 8214:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Card = void 0;
const base_component_1 = __webpack_require__(3608);
class Card extends base_component_1.BaseComponent {
}
exports.Card = Card;


/***/ }),

/***/ 1058:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HorizontalProductCard = void 0;
const card_1 = __webpack_require__(8214);
const utils_1 = __webpack_require__(4083);
const key_1 = __webpack_require__(9650);
const QUICK_VIEW_BUTTON_SELECTOR = '[data-product-card-quick-view-button]';
const QUICK_VIEW_SELECTOR = '#Quick-view';
class HorizontalProductCard extends card_1.Card {
    mountComponent() {
        const quickViewBtn = (0, utils_1.$el)(QUICK_VIEW_BUTTON_SELECTOR, this);
        this.addListener(quickViewBtn, 'keydown', this.handleQuickViewBtnKeyDown);
        this.addListener(quickViewBtn, 'click', this.handleQuickViewBtnClick);
        this.addListener(this, 'mouseenter', this.handleProductCardEnter);
    }
    handleQuickViewBtnKeyDown = async (event) => {
        if ((0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            this.callQuickView(true);
        }
    };
    handleQuickViewBtnClick = async () => {
        this.callQuickView(true);
    };
    handleProductCardEnter = () => {
        this.callQuickView(false);
    };
    async callQuickView(withOpen) {
        const quickView = (0, utils_1.$el)(QUICK_VIEW_SELECTOR);
        const url = this.dataset.url;
        const id = this.dataset.id;
        if (!quickView || !url || !id) {
            return;
        }
        await quickView.requestProductFromUrl(url, id);
        if (withOpen) {
            this.setQuickViewLoading(true);
            await quickView.openAndRenderProductByUrl(url);
            this.setQuickViewLoading(false);
        }
    }
    setQuickViewLoading(isLoading) {
        const quickViewBtn = (0, utils_1.$el)(QUICK_VIEW_BUTTON_SELECTOR, this);
        if (quickViewBtn) {
            quickViewBtn.classList.toggle('loading', isLoading);
            quickViewBtn.toggleAttribute('disabled', isLoading);
        }
    }
}
exports.HorizontalProductCard = HorizontalProductCard;


/***/ }),

/***/ 5705:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ColorSwatches = void 0;
const dom_1 = __webpack_require__(3889);
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const debounce_1 = __webpack_require__(2731);
const HIDDEN_COUNT_SELECTOR = '[data-color-swatches-hidden-count]';
const LABEL_SELECTOR = '[data-color-swatches-label]';
const ITEM_SELECTOR = '[data-color-swatches-item]';
const PRODUCT_CARD_SELECTOR = 'product-card';
class ColorSwatches extends base_component_1.BaseComponent {
    productCard;
    currentVisibleImage;
    images;
    constructor() {
        super();
        this.productCard = (0, utils_1.$elParent)(PRODUCT_CARD_SELECTOR, this);
        this.images = (0, utils_1.$list)('img[data-variant-id], [data-main-media]', this.productCard);
    }
    mountComponent() {
        this.setOffsets();
        this.update();
        this.addListener(this, 'mousemove', this.handleSwatchEnter);
        this.addListener(this, 'mouseleave', this.handleSwatchesLeave);
    }
    handleSwatchesLeave = (0, debounce_1.debounce)(() => {
        this.images.forEach(img => {
            this.setImageVisible(img, img.hasAttribute('data-main-media'));
        });
        this.reset();
    }, 100);
    handleSwatchEnter = (0, debounce_1.debounce)((event) => {
        if (!this.productCard) {
            return;
        }
        const item = (0, utils_1.$elParent)(ITEM_SELECTOR, event.target);
        if (!item) {
            this.leave();
            return;
        }
        const variantId = item.dataset.variantId;
        const image = (0, utils_1.$el)(`img[data-variant-id="${variantId}"]`, this.productCard);
        const color = item.dataset.color;
        if (!image || !this.productCard.getMainMedia() || !color) {
            return;
        }
        this.updateLabel(color);
        this.images.forEach(img => {
            this.setImageVisible(img, img === image);
        });
        this.setHoverStatus(true);
        this.currentVisibleImage = image;
    }, 10);
    leave = () => {
        if (this.currentVisibleImage) {
            this.setImageVisible(this.currentVisibleImage, false);
        }
        if (this.productCard.getMainMedia()) {
            this.setImageVisible(this.productCard.getMainMedia(), true);
        }
        this.reset();
    };
    reset = () => {
        this.setHoverStatus(false);
        this.updateLabel('');
    };
    update() {
        this.updateSwatchesVisible();
        this.updateCount();
        this.updateDetailsInner();
    }
    updateDetailsInner() {
        const detailsInner = (0, utils_1.$elParent)('[data-product-details-inner]', this);
        if (!detailsInner) {
            return;
        }
        if (detailsInner.offsetHeight < this.offsetHeight) {
            detailsInner.style.minHeight = `${this.offsetHeight}px`;
        }
    }
    setImageVisible(img, isVisible) {
        img.classList.toggle('product-card__img--visible', isVisible);
    }
    updateSwatchesVisible() {
        const items = (0, utils_1.$list)(ITEM_SELECTOR, this);
        items.forEach(swatch => {
            const rightPosition = swatch.offsetLeft + swatch.offsetWidth;
            const parentNode = this.parentNode;
            const maxWidth = parentNode.offsetWidth - swatch.offsetWidth;
            const isHidden = rightPosition > maxWidth;
            swatch.classList.toggle('hidden-swatch', isHidden);
            swatch.setAttribute('tabindex', isHidden ? '-1' : '0');
        });
    }
    setOffsets() {
        const items = (0, utils_1.$list)(ITEM_SELECTOR, this);
        items.forEach(swatch => {
            swatch.style.left = `${swatch.offsetLeft}px`;
        });
    }
    updateCount() {
        const items = (0, utils_1.$list)(ITEM_SELECTOR, this);
        const hiddenCount = (0, utils_1.$el)(HIDDEN_COUNT_SELECTOR, this);
        if (!hiddenCount) {
            return;
        }
        const hiddenCountLabel = (0, utils_1.$el)('[data-color-swatches-hidden-count-label]', this);
        if (!hiddenCountLabel) {
            return;
        }
        const notHiddenSwatches = items.filter(item => !item.classList.contains('hidden-swatch'));
        const count = +(this.dataset.count || 0) - notHiddenSwatches.length;
        if (count > 0) {
            (0, dom_1.showElement)(hiddenCount);
            hiddenCountLabel.innerText = `+${count}`;
        }
        else {
            (0, dom_1.hideElement)(hiddenCount);
            hiddenCountLabel.innerText = '';
        }
    }
    updateLabel(color) {
        const label = (0, utils_1.$el)(LABEL_SELECTOR, this);
        if (label) {
            label.innerText = color ? (0, utils_1.capitalize)(color) : '';
        }
    }
    setHoverStatus(isHover) {
        this.productCard?.classList.toggle('is-color-swatch-hover', isHover);
    }
}
exports.ColorSwatches = ColorSwatches;


/***/ }),

/***/ 7195:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductMediaTabs = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const PRODUCT_CARD_SELECTOR = 'product-card';
const ITEM_SELECTOR = '[data-product-media-tabs-item]';
const MAIN_MEDIA_SELECTOR = '[data-main-media]';
class ProductMediaTabs extends base_component_1.BaseComponent {
    selected = null;
    mountComponent() {
        const tabs = (0, utils_1.$list)(ITEM_SELECTOR, this);
        tabs.forEach(tab => {
            this.addListener(tab, 'mouseenter', this.handleTabEnter);
            this.addListener(tab, 'mouseleave', this.handleTabLeave);
        });
    }
    handleTabEnter = (event) => {
        const productCard = (0, utils_1.$elParent)(PRODUCT_CARD_SELECTOR, this);
        const tab = event.currentTarget;
        const img = (0, utils_1.$el)(`[data-id="${tab.dataset.id}"]`, productCard);
        if (this.selected) {
            this.reset();
        }
        this.setTabSelect(tab, true);
        this.setImageVisible(productCard.getMainMedia(), false);
        this.setImageVisible(img, true);
        this.selected = { tab, img };
        if (img.tagName === 'VIDEO') {
            img.play();
        }
    };
    handleTabLeave = () => {
        const productCard = (0, utils_1.$elParent)(PRODUCT_CARD_SELECTOR, this);
        if (this.selected) {
            this.reset();
        }
        const mainMedias = (0, utils_1.$list)(MAIN_MEDIA_SELECTOR, productCard);
        mainMedias.forEach(media => {
            this.setImageVisible(media, true);
        });
    };
    setTabSelect(tab, isSelected) {
        tab.classList.toggle('selected', isSelected);
    }
    setImageVisible(img, isVisible) {
        img.classList.toggle('product-card__img--visible', isVisible);
    }
    reset() {
        if (!this.selected) {
            return;
        }
        if (this.selected.img.tagName === 'VIDEO') {
            this.selected.img.pause();
        }
        this.selected.img.classList.remove('product-card__img--visible');
        this.selected.tab.classList.remove('selected');
        this.selected = null;
    }
}
exports.ProductMediaTabs = ProductMediaTabs;


/***/ }),

/***/ 6978:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductCard = void 0;
const key_1 = __webpack_require__(9650);
const debounce_1 = __webpack_require__(2731);
const dom_1 = __webpack_require__(3889);
const card_1 = __webpack_require__(8214);
const utils_1 = __webpack_require__(4083);
const check_media_1 = __webpack_require__(5580);
const QUICK_VIEW_BUTTON_SELECTOR = '[data-product-card-quick-view-button]';
const PRELOADER_SELECTOR = '[data-product-card-preloader]';
const BUTTONS_SELECTOR = '[data-product-card-buttons]';
const FEATURED_MEDIA_SELECTOR = '[data-product-card-featured-image]';
const COLOR_SWATCHES_SELECTOR = '[data-product-card-color-swatches]';
const INNER_SELECTOR = '[data-product-card-inner]';
const QUICK_VIEW_SELECTOR = '#Quick-view';
const MAIN_MEDIA_SELECTOR = '[data-main-media]';
class ProductCard extends card_1.Card {
    resizeObserver;
    buttonsWidth = 0;
    buttonsHeight = 0;
    carouselInited;
    playingVideo;
    mountComponent() {
        const quickViewBtn = (0, utils_1.$el)(QUICK_VIEW_BUTTON_SELECTOR, this);
        const featuredImages = (0, utils_1.$list)(FEATURED_MEDIA_SELECTOR, this);
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(this);
        featuredImages.forEach(featuredImage => {
            if (featuredImage.complete ||
                featuredImage.readyState === 4 ||
                featuredImage.tagName === 'IFRAME') {
                this.handleMediaLoad();
            }
            else {
                this.addListener(featuredImage, 'load', this.handleMediaLoad);
                this.addListener(featuredImage, 'loadeddata', this.handleMediaLoad);
            }
        });
        this.addListener(quickViewBtn, 'click', this.handleQuickViewBtnClick);
        this.addListener(quickViewBtn, 'keydown', this.handleQuickViewBtnKeyDown);
        this.addListener(this, 'mouseenter', this.handleProductCardEnter);
    }
    unmountComponent() {
        this.resizeObserver.disconnect();
    }
    handleQuickViewBtnKeyDown = async (event) => {
        if ((0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            this.callQuickView(true);
        }
    };
    handleQuickViewBtnClick = async () => {
        this.callQuickView(true);
    };
    handleProductCardEnter = () => {
        this.callQuickView(false);
    };
    async callQuickView(withOpen) {
        const quickView = (0, utils_1.$el)(QUICK_VIEW_SELECTOR);
        const url = this.dataset.url;
        const id = this.dataset.id;
        if (!quickView || !url || !id) {
            return;
        }
        await quickView.requestProductFromUrl(url, id);
        if (withOpen) {
            this.setQuickViewLoading(true);
            await quickView.openAndRenderProductByUrl(url);
            this.setQuickViewLoading(false);
        }
    }
    handleResize = (0, debounce_1.debounce)(() => {
        const buttons = (0, utils_1.$el)(BUTTONS_SELECTOR, this);
        const swatches = (0, utils_1.$el)(COLOR_SWATCHES_SELECTOR, this);
        if (buttons) {
            this.setButtonsOverflow();
        }
        if (swatches) {
            swatches.update();
        }
        if ((0, check_media_1.isMobile)()) {
            this.initMobileCarousel();
        }
    }, 250);
    handleMediaLoad = () => {
        const loader = (0, utils_1.$el)(PRELOADER_SELECTOR, this);
        (0, dom_1.hideElement)(loader);
    };
    initMobileCarousel = () => {
        if (this.carouselInited) {
            return;
        }
        const carousel = (0, utils_1.$el)('carousel-component', this);
        if (!carousel) {
            return;
        }
        const video = (0, utils_1.$el)('video', carousel);
        if (video) {
            carousel.embla?.on('select', this.handleCarouselSelect);
            this.carouselInited = true;
        }
    };
    handleCarouselSelect = (0, debounce_1.debounce)(embla => {
        if (this.playingVideo) {
            this.playingVideo.pause();
            this.playingVideo = null;
        }
        const currentSlide = embla.slideNodes()[embla.selectedScrollSnap()].firstElementChild;
        if (currentSlide.tagName === 'VIDEO') {
            currentSlide.play();
            this.playingVideo = currentSlide;
        }
    }, 100);
    setButtonsOverflow() {
        const buttons = (0, utils_1.$el)(BUTTONS_SELECTOR, this);
        const inner = (0, utils_1.$el)(INNER_SELECTOR, this);
        if (!buttons) {
            return;
        }
        if (this.offsetWidth < this.buttonsWidth) {
            return;
        }
        const isWidthOverflow = buttons.offsetWidth > inner.offsetWidth;
        const isHeightOverflow = buttons.offsetHeight > inner.offsetHeight;
        if (isWidthOverflow && buttons.offsetWidth > this.buttonsWidth) {
            this.buttonsWidth = buttons.offsetWidth;
        }
        if (isHeightOverflow && buttons.offsetHeight > this.buttonsHeight) {
            this.buttonsHeight = buttons.offsetHeight;
        }
        buttons.classList.toggle('is-width-overflowed', isWidthOverflow);
        buttons.classList.toggle('is-height-overflowed', isHeightOverflow);
    }
    setQuickViewLoading(isLoading) {
        const quickViewBtn = (0, utils_1.$el)(QUICK_VIEW_BUTTON_SELECTOR, this);
        if (quickViewBtn) {
            quickViewBtn.classList.toggle('loading', isLoading);
            quickViewBtn.toggleAttribute('disabled', isLoading);
        }
    }
    getMainMedia() {
        return (0, utils_1.$el)(MAIN_MEDIA_SELECTOR, this);
    }
}
exports.ProductCard = ProductCard;


/***/ }),

/***/ 3505:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VerticalProductCard = void 0;
const card_1 = __webpack_require__(8214);
const utils_1 = __webpack_require__(4083);
const key_1 = __webpack_require__(9650);
const QUICK_VIEW_BUTTON_SELECTOR = '[data-product-card-quick-view-button]';
const QUICK_VIEW_SELECTOR = '#Quick-view';
class VerticalProductCard extends card_1.Card {
    mountComponent() {
        const quickViewBtn = (0, utils_1.$el)(QUICK_VIEW_BUTTON_SELECTOR, this);
        this.addListener(quickViewBtn, 'click', this.handleQuickViewBtnClick);
        this.addListener(quickViewBtn, 'keydown', this.handleQuickViewBtnKeyDown);
        this.addListener(this, 'mouseenter', this.handleProductCardEnter);
    }
    handleQuickViewBtnKeyDown = async (event) => {
        if ((0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            this.callQuickView(true);
        }
    };
    handleQuickViewBtnClick = async () => {
        this.callQuickView(true);
    };
    handleProductCardEnter = () => {
        this.callQuickView(false);
    };
    async callQuickView(withOpen) {
        const quickView = (0, utils_1.$el)(QUICK_VIEW_SELECTOR);
        const url = this.dataset.url;
        const id = this.dataset.id;
        if (!quickView || !url || !id) {
            return;
        }
        await quickView.requestProductFromUrl(url, id);
        if (withOpen) {
            this.setQuickViewLoading(true);
            await quickView.openAndRenderProductByUrl(url);
            this.setQuickViewLoading(false);
        }
    }
    setQuickViewLoading(isLoading) {
        const quickViewBtn = (0, utils_1.$el)(QUICK_VIEW_BUTTON_SELECTOR, this);
        if (quickViewBtn) {
            quickViewBtn.classList.toggle('loading', isLoading);
            quickViewBtn.toggleAttribute('disabled', isLoading);
        }
    }
}
exports.VerticalProductCard = VerticalProductCard;


/***/ }),

/***/ 6470:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.seamlessAutoPlay = exports.oneAtTimeAutoPlay = void 0;
const interval_timer_1 = __webpack_require__(9331);
const oneAtTimeAutoPlay = (embla, interval) => {
    const next = () => {
        const lastSlideIndex = embla.scrollSnapList().length - 1;
        const isLastSlide = embla.selectedScrollSnap() === lastSlideIndex;
        if (isLastSlide) {
            embla.scrollTo(0);
        }
        else {
            embla.scrollNext();
        }
    };
    const intervalTimer = new interval_timer_1.IntervalTimer(next, interval);
    const play = () => {
        intervalTimer.resume();
    };
    const stop = () => {
        intervalTimer.stop();
    };
    const pause = () => {
        intervalTimer.pause();
    };
    const start = () => {
        intervalTimer.start();
    };
    return { play, stop, start, pause };
};
exports.oneAtTimeAutoPlay = oneAtTimeAutoPlay;
const seamlessAutoPlay = (embla, interval) => {
    let tick = 0;
    const engine = embla.internalEngine();
    const distance = interval / -5;
    const animate = () => {
        engine.scrollTo.distance(distance, false);
        tick = requestAnimationFrame(animate);
    };
    const play = () => {
        tick = requestAnimationFrame(animate);
    };
    const pause = () => {
        cancelAnimationFrame(tick);
    };
    const stop = () => {
        cancelAnimationFrame(tick);
        tick = 0;
    };
    return { play, pause, stop };
};
exports.seamlessAutoPlay = seamlessAutoPlay;


/***/ }),

/***/ 532:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CarouselButton = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const key_1 = __webpack_require__(9650);
const CAROUSEL_COMPONENT_SELECTOR = 'carousel-component';
const CAROUSEL_DOTS_SELECTOR = 'carousel-dots';
const HIDE_INSIDE_DOTS_SELECTOR = 'data-hide-inside-dots';
class CarouselButton extends base_component_1.BaseComponent {
    snaps = [];
    mountComponent() {
        this.snaps = [...Array(this.carousel.embla.slideNodes().length).keys()];
        if (this.hasAttribute(HIDE_INSIDE_DOTS_SELECTOR)) {
            this.checkIfToHideButton();
        }
        else {
            this.initButton();
        }
    }
    unmountComponent() {
        if (this.carousel) {
            this.carousel.embla.off('reInit', this.handleCarouselReInit);
            this.carousel.embla.off('scroll', this.handleCarouselScroll);
            this.carousel.embla.off('select', this.handleCarouselSelect);
        }
    }
    checkIfToHideButton = () => {
        const dots = (0, utils_1.$elParent)(CAROUSEL_DOTS_SELECTOR, this);
        const slidesInView = dots.embla.slidesInView();
        if (slidesInView.length === this.snaps.length) {
            this.hideButton(true);
        }
        else {
            this.initButton();
        }
    };
    initButton = () => {
        this.update();
        this.addListener(this, 'keydown', this.handleKeyDown);
        this.addListener(this, 'click', this.handleButtonClick);
        if (this.carousel) {
            this.carousel.embla.on('reInit', this.handleCarouselReInit);
            this.carousel.embla.on('select', this.handleCarouselSelect);
            this.carousel.embla.on('scroll', this.handleCarouselScroll);
        }
    };
    handleButtonClick = (event) => {
        event.preventDefault();
        this.trigger();
    };
    handleKeyDown = (event) => {
        if ((0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            this.trigger();
        }
    };
    handleCarouselReInit = () => {
        this.update();
    };
    handleCarouselSelect = () => {
        this.update();
    };
    handleCarouselScroll = () => {
        this.update();
    };
    update() {
        this.updateDisable();
        this.updateVisible();
    }
    updateDisable = () => {
        const canScroll = this.dataset.direction === 'next'
            ? this.carousel?.embla.canScrollNext()
            : this.carousel?.embla.canScrollPrev();
        this.toggleAttribute('disabled', !canScroll);
    };
    updateVisible() {
        if (!this.carousel) {
            return;
        }
        const slides = this.carousel.embla.slidesInView();
        const index = this.dataset.direction === 'next' ? this.snaps.length - 1 : 0;
        this.hideButton(slides.includes(index));
    }
    hideButton = (boolean) => {
        this.toggleAttribute('has-not-slides-not-in-view', boolean);
    };
    trigger() {
        if (this.dataset.direction === 'next') {
            this.carousel?.embla.scrollNext();
        }
        else {
            this.carousel?.embla.scrollPrev();
        }
        this.carousel?.stop();
    }
    get carousel() {
        const carousel = (0, utils_1.$elParent)(CAROUSEL_COMPONENT_SELECTOR, this);
        return carousel;
    }
}
exports.CarouselButton = CarouselButton;


/***/ }),

/***/ 4887:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CarouselDots = void 0;
const tslib_1 = __webpack_require__(7582);
const base_component_1 = __webpack_require__(3608);
const embla_carousel_1 = tslib_1.__importDefault(__webpack_require__(1689));
const embla_carousel_wheel_gestures_1 = __webpack_require__(9298);
const key_1 = __webpack_require__(9650);
const embla_carousel_class_names_1 = tslib_1.__importDefault(__webpack_require__(9635));
const debounce_1 = __webpack_require__(2731);
const utils_1 = __webpack_require__(4083);
const CAROUSEL_SELECTOR = 'carousel-component';
const CAROUSEL_DOT_SELECTOR = '[data-carousel-dot]';
class CarouselDots extends base_component_1.BaseComponent {
    embla;
    dots;
    mountComponent() {
        this.handleCarouselInit();
        this.carousel?.on('changePlayState', this.handleChangePlayState);
    }
    unmountComponent() {
        this.carousel?.off('changePlayState', this.handleChangePlayState);
        this.carousel?.embla.off('reInit', this.handleCarouselReInit);
        this.carousel?.embla.off('select', this.handleCarouselSelect);
        this.embla.destroy();
    }
    handleDotClick = (event) => {
        const dot = (0, utils_1.$elParent)(CAROUSEL_DOT_SELECTOR, event.target);
        if (!dot) {
            return;
        }
        this.scrollToIndex(+dot.dataset.dotIndex);
    };
    handleKeydown = (event) => {
        if ((0, key_1.isTabKey)(event)) {
            const targets = (0, utils_1.$list)((0, utils_1.getFocusTargets)(), this).filter(target => target.clientWidth > 0);
            const index = targets.findIndex(target => target === event.target);
            const nextTarget = targets[index + 1];
            const prevTarget = targets[index - 1];
            if (event.shiftKey) {
                if (prevTarget) {
                    this.focusScroll(prevTarget);
                }
            }
            else {
                if (nextTarget) {
                    this.focusScroll(nextTarget);
                }
            }
        }
        const dot = (0, utils_1.$elParent)(CAROUSEL_DOT_SELECTOR, event.target);
        if (!dot) {
            return;
        }
        if ((0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            this.scrollToIndex(+dot.dataset.dotIndex);
        }
    };
    handleSettle = () => {
        this.update();
    };
    handleCarouselInit = () => {
        this.setCarousel();
        this.updateLoadAnimation();
        this.addListener(this, 'click', this.handleDotClick);
        this.addListener(this, 'keydown', this.handleKeydown);
        this.carousel?.embla.on('reInit', this.handleCarouselReInit);
        this.carousel?.embla.on('select', this.handleCarouselSelect);
        this.embla.on('resize', this.handleResize);
        this.embla.on('settle', this.handleSettle);
        if (this.getAttribute('change-slide-on-scroll')) {
            this.embla.on('select', this.handleSelect);
        }
    };
    handleSelect = () => {
        const selectedDotIndex = this.dots.findIndex(dot => {
            return dot.classList.contains('is-selected');
        });
        this.carousel.embla.scrollTo(selectedDotIndex);
    };
    handleCarouselReInit = () => {
        this.setCarousel();
    };
    handleResize = (0, debounce_1.debounce)(() => {
        this.update();
    }, 250);
    handleCarouselSelect = () => {
        if (!this.carousel) {
            return;
        }
        const index = this.carousel.embla.selectedScrollSnap();
        this.embla.scrollTo(index);
        this.dots.forEach(dot => {
            dot.classList.toggle('is-primary', +dot.dataset.dotIndex === index);
        });
    };
    handleChangePlayState = () => {
        this.updateLoadAnimation();
    };
    focusScroll = (target) => {
        const slides = [...this.embla.slideNodes()];
        const slideIndex = slides.findIndex(slide => slide.contains(target));
        if (slideIndex === -1) {
            return;
        }
        this.embla.scrollTo(slideIndex, true);
    };
    updateLoadAnimation() {
        this.classList.toggle('is-autoplaying', this.carousel?.isPlay);
    }
    reInit() {
        this.embla.reInit(this.getOptions(), this.getPlugins());
    }
    scrollToIndex(index) {
        this.carousel?.embla.scrollTo(index);
        this.carousel?.stop();
    }
    getOptions = () => ({
        inViewThreshold: +(this.dataset.inViewThreshhold || 0) || 0.5,
        containScroll: this.getAttribute('data-contain-scroll'),
        align: this.getAttribute('data-align'),
        skipSnaps: this.hasAttribute('data-skip-snaps'),
        watchDrag: this.hasAttribute('data-draggable'),
        axis: this.getAttribute('data-axis'),
    });
    getPlugins = () => {
        const plugins = [(0, embla_carousel_class_names_1.default)()];
        if (this.hasAttribute('data-with-wheel-gestures')) {
            plugins.push((0, embla_carousel_wheel_gestures_1.WheelGesturesPlugin)({
                forceWheelAxis: this.getAttribute('data-axis'),
            }));
        }
        return plugins;
    };
    setCarousel() {
        const viewport = (0, utils_1.$el)('[data-carousel-viewport]', this);
        if (!viewport) {
            return;
        }
        this.embla = (0, embla_carousel_1.default)(viewport, this.getOptions(), this.getPlugins());
        this.dots = [...this.embla.slideNodes()];
    }
    stop() {
        this.carousel?.stop();
    }
    update() {
        const indexList = this.dots.map((_, index) => index);
        const visibleIndexList = this.embla.slidesInView();
        this.dots.forEach((dot, index) => {
            const firstVisibleIndex = visibleIndexList[0];
            const lastVisibleIndex = visibleIndexList[visibleIndexList.length - 1];
            const firstIndex = indexList[0];
            const lastIndex = indexList[indexList.length - 1];
            const isLast = index === lastIndex;
            const isLastVisible = index === lastVisibleIndex;
            const isFirst = index === firstIndex;
            const isFirstVisible = index === firstVisibleIndex;
            dot.classList.toggle('is-prev-prev', (isFirstVisible || isLastVisible) && !isLast && !isFirst);
        });
    }
    get carousel() {
        return (0, utils_1.$elParent)(CAROUSEL_SELECTOR, this);
    }
}
exports.CarouselDots = CarouselDots;


/***/ }),

/***/ 317:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CarouselPlayButton = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const BUTTON_SELECTOR = '[data-carousel-play-button]';
const CAROUSEL_SELECTOR = 'carousel-component';
class CarouselPlayButton extends base_component_1.BaseComponent {
    mountComponent() {
        this.update();
        this.addListener(this, 'click', this.handleButtonClick);
        if (this.carousel) {
            customElements.upgrade(this.carousel); // https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/upgrade
            (0, utils_1.whenDefined)('carousel-component').then(() => {
                this.carousel?.on('changePlayState', this.handleChangePlayState);
            });
        }
    }
    unmountComponent() {
        if (this.carousel) {
            (0, utils_1.whenDefined)('carousel-component').then(() => {
                this.carousel?.off('changePlayState', this.handleChangePlayState);
            });
        }
    }
    handleChangePlayState = () => {
        this.update();
    };
    handleButtonClick = (event) => {
        event.stopPropagation();
        if (!this.carousel) {
            return;
        }
        if (!this.carousel.isPlay) {
            this.carousel.play();
        }
        else {
            this.carousel.stop();
        }
        this.resetAnimation();
    };
    update() {
        const button = (0, utils_1.$el)(BUTTON_SELECTOR, this);
        if (!this.carousel || !button) {
            return;
        }
        button.toggleAttribute('data-autoplay-stopped', !this.carousel.isPlay);
    }
    resetAnimation() {
        this.carousel.classList.toggle('is-reset-autoplay-loader-animation', !this.carousel.isPlay);
    }
    get carousel() {
        return (0, utils_1.$elParent)(CAROUSEL_SELECTOR, this);
    }
}
exports.CarouselPlayButton = CarouselPlayButton;


/***/ }),

/***/ 319:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CarouselProgress = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const CAROUSEL_COMPONENT = 'carousel-component';
const INDICATOR_SELECTOR = '[data-carousel-progress-indicator]';
class CarouselProgress extends base_component_1.BaseComponent {
    targetEvent;
    carousel;
    constructor() {
        super();
        this.targetEvent = this.dataset.target === 'scroll' ? 'scroll' : 'settle';
    }
    mountComponent() {
        this.carousel = (0, utils_1.$elParent)(CAROUSEL_COMPONENT, this);
        this.update();
        this.carousel?.embla.on(this.targetEvent, this.handleProgress);
        this.carousel?.embla.on('reInit', this.handleCarouselReInit);
    }
    unmountComponent() {
        this.carousel?.embla.off(this.targetEvent, this.handleProgress);
        this.carousel?.embla.off('reInit', this.handleCarouselReInit);
    }
    handleProgress = () => {
        this.update();
    };
    handleCarouselReInit = () => {
        this.update();
    };
    update() {
        const indicator = (0, utils_1.$el)(INDICATOR_SELECTOR, this);
        if (!indicator) {
            return;
        }
        indicator.style.transform =
            this.dataset.axis === 'vertical'
                ? `translate3d(0, ${this.getProgress()}%, 0)`
                : `translate3d(${this.getProgress()}%, 0, 0)`;
    }
    getProgress() {
        return this.dataset.target === 'scroll'
            ? this.getProgressByScroll()
            : this.getProgressBySlideInView();
    }
    getProgressBySlideInView() {
        if (!this.carousel) {
            return 0;
        }
        const slideCount = this.carousel.embla.slideNodes().length;
        const visibleSlides = this.carousel.embla.slidesInView();
        const lastVisibleSlide = visibleSlides[visibleSlides.length - 1] + 1;
        const progressPerSlide = 100 / slideCount;
        return Math.ceil(progressPerSlide * lastVisibleSlide);
    }
    getProgressByScroll() {
        if (!this.carousel) {
            return 0;
        }
        return Math.max(0, Math.min(1, this.carousel.embla.scrollProgress())) * 100;
    }
}
exports.CarouselProgress = CarouselProgress;


/***/ }),

/***/ 3442:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CarouselComponent = void 0;
const tslib_1 = __webpack_require__(7582);
const embla_carousel_wheel_gestures_1 = __webpack_require__(9298);
const base_component_1 = __webpack_require__(3608);
const embla_carousel_1 = tslib_1.__importDefault(__webpack_require__(1689));
const embla_carousel_class_names_1 = tslib_1.__importDefault(__webpack_require__(9635));
const utils_1 = __webpack_require__(4083);
const key_1 = __webpack_require__(9650);
const carousel_autoplay_1 = __webpack_require__(6470);
const check_media_1 = __webpack_require__(5580);
class CarouselComponent extends base_component_1.BaseComponent {
    withSimpleAutoplay;
    withSeamlessAutoplay;
    withAutoplay;
    withFade;
    isTouching;
    isPlay;
    lastIsMobile;
    autoplay;
    embla;
    resizeObserver;
    constructor() {
        super();
        this.withSimpleAutoplay = this.dataset.autoplayMode === 'one_at_time';
        this.withSeamlessAutoplay = this.dataset.autoplayMode === 'seamless';
        this.withAutoplay = this.withSimpleAutoplay || this.withSeamlessAutoplay;
        this.withFade = this.dataset.animation === 'fade';
    }
    mountComponent() {
        this.setCarousel();
        this.setAutoplay();
        this.addListener(this, 'keydown', this.handleKeydown);
        this.embla.on('select', this.handleCarouselSelect);
        this.embla.on('scroll', this.handleCarouselScroll);
        this.embla.on('pointerUp', this.handleCarouselPointerUp);
        this.embla.on('pointerDown', this.handleCarouselPointerDown);
        if (this.withFade) {
            this.embla.on('init', this.initFade);
            this.embla.on('resize', this.resizeFade);
            this.embla.on('reInit', this.initFade);
            this.embla.internalEngine().translate.toggleActive(false);
        }
        else {
            document.fonts.ready.then(() => {
                this.reInit();
            });
        }
        const withHoverPause = this.hasAttribute('with-hover-pause') && this.isPlay;
        if (withHoverPause) {
            this.addListener(this, 'mouseenter', this.handleCarouselEnter);
            this.addListener(this, 'mouseleave', this.handleCarouselLeave);
        }
        if (this.isEditor) {
            this.resizeObserver = new ResizeObserver(this.handleCarouselResize);
            this.resizeObserver.observe(this);
            this.editor.on('BLOCK_SELECT', this.handleBlockSelect);
            this.editor.on('SECTION_LOAD', this.handleSectionLoad);
        }
    }
    unmountComponent() {
        this.embla.destroy();
        if (this.isEditor) {
            this.resizeObserver.disconnect();
        }
    }
    handleKeydown = (event) => {
        this.stop();
        if ((0, key_1.isTabKey)(event)) {
            const targets = (0, utils_1.$list)((0, utils_1.getFocusTargets)(), this).filter(target => target.clientWidth > 0);
            const index = targets.findIndex(target => target === event.target);
            const nextTarget = targets[index + 1];
            const prevTarget = targets[index - 1];
            if (event.shiftKey) {
                if (prevTarget) {
                    this.focusScroll(prevTarget);
                }
            }
            else {
                if (nextTarget) {
                    this.focusScroll(nextTarget);
                }
            }
        }
        if ((0, key_1.isLeftKey)(event)) {
            this.embla.scrollPrev();
        }
        if ((0, key_1.isRightKey)(event)) {
            this.embla.scrollNext();
        }
    };
    handleCarouselResize = () => {
        if (this.lastIsMobile !== (0, check_media_1.isMobile)() && !this.isPlay) {
            this.play();
        }
        this.lastIsMobile = (0, check_media_1.isMobile)();
    };
    focusScroll = (target) => {
        const slides = [...this.embla.slideNodes()];
        const slideIndex = slides.findIndex(slide => slide.contains(target));
        if (slideIndex === -1) {
            return;
        }
        const slidesInOneScroll = Math.floor(slides.length / this.embla.scrollSnapList().length);
        const snapIndex = Math.floor(slideIndex / slidesInOneScroll);
        this.embla.scrollTo(snapIndex, true);
    };
    handleCarouselEnter = () => {
        if ((0, check_media_1.isMobile)()) {
            return;
        }
        if (this.isPlay === true) {
            this.autoplay?.pause();
        }
    };
    handleCarouselLeave = () => {
        if ((0, check_media_1.isMobile)()) {
            return;
        }
        if (this.isPlay === true) {
            this.autoplay?.play();
        }
    };
    handleCarouselSelect = () => {
        this.dataset.startIndex = `${this.embla.selectedScrollSnap()}`;
        this.emit('carouselSelect', {});
    };
    handleCarouselScroll = () => {
        if (this.isTouching) {
            this.stop();
        }
        this.emit('carouselSelect', {});
    };
    handleCarouselPointerUp = () => {
        this.isTouching = false;
    };
    handleCarouselPointerDown = () => {
        this.isTouching = true;
    };
    handleBlockSelect = ({ detail: { sectionId, blockId, load } }) => {
        if (this.dataset.sectionId !== sectionId) {
            return;
        }
        const slides = this.embla.slideNodes();
        const slideIndex = slides.findIndex(({ attributes }) => attributes['block-id']?.value === blockId);
        if (slideIndex !== -1) {
            this.embla.scrollTo(slideIndex, load);
            this.stop();
        }
    };
    handleSectionLoad = ({ detail: { sectionId } }) => {
        if (this.dataset.sectionId === sectionId) {
            this.stop();
            if (this.withAutoplay) {
                this.setAutoplay();
            }
            this.reInit();
        }
    };
    getOptions = () => ({
        loop: this.hasAttribute('data-loop'),
        dragFree: this.hasAttribute('data-drag-free'),
        watchDrag: this.hasAttribute('data-draggable'),
        skipSnaps: this.hasAttribute('data-skip-snaps'),
        align: this.getAttribute('data-align'),
        containScroll: this.getAttribute('data-contain-scroll'),
        inViewThreshold: +(this.dataset.inViewThreshhold || 0) || 0.75,
        axis: this.getAttribute('data-axis'),
        breakpoints: this.hasAttribute('data-breakpoints')
            ? JSON.parse(this.dataset.breakpoints)
            : undefined,
        slidesToScroll: +(this.getAttribute('data-slides-to-scroll') ?? 1),
        startIndex: this.hasAttribute('data-start-index')
            ? Number(this.dataset.startIndex)
            : 0,
        direction: this.hasAttribute('data-direction-rtl') ? 'rtl' : 'ltr',
    });
    getPlugins = () => {
        const plugins = [(0, embla_carousel_class_names_1.default)()];
        if (this.hasAttribute('data-with-wheel-gestures')) {
            plugins.push((0, embla_carousel_wheel_gestures_1.WheelGesturesPlugin)({
                forceWheelAxis: this.getAttribute('data-axis'),
            }));
        }
        return plugins;
    };
    setCarousel() {
        const viewport = (0, utils_1.$el)('[data-carousel-viewport]', this);
        if (!viewport) {
            return;
        }
        this.embla = (0, embla_carousel_1.default)(viewport, this.getOptions(), this.getPlugins());
    }
    setAutoplay() {
        if (this.autoplay) {
            return;
        }
        const autoplayInterval = +(this.dataset.autoplayInterval || 0);
        this.isPlay = autoplayInterval > 0;
        if (this.withSimpleAutoplay) {
            this.autoplay = (0, carousel_autoplay_1.oneAtTimeAutoPlay)(this.embla, autoplayInterval * 1000);
            this.autoplay.start();
        }
        if (this.withSeamlessAutoplay) {
            this.autoplay = (0, carousel_autoplay_1.seamlessAutoPlay)(this.embla, autoplayInterval);
            this.autoplay.play();
        }
    }
    stop() {
        if (!this.withAutoplay) {
            return;
        }
        this.autoplay?.stop();
        this.isPlay = false;
        this.emit('changePlayState', {});
    }
    play() {
        if (!this.withAutoplay) {
            return;
        }
        if (this.withSimpleAutoplay) {
            this.autoplay.start();
        }
        if (this.withSeamlessAutoplay) {
            this.autoplay.play();
        }
        this.isPlay = true;
        this.emit('changePlayState', {});
    }
    resizeFade = () => {
        this.classList.remove('carousel--with-fade');
        this.reInit();
    };
    initFade = () => {
        const slide = this.embla.slideNodes()[0];
        const height = slide.getBoundingClientRect().height;
        this.setAttribute('style', `--gsc-fade-height: ${height}px`);
        this.classList.add('carousel--with-fade');
    };
    reInit = (options = {}) => {
        this.embla.reInit({ ...this.getOptions(), ...options }, this.getPlugins());
    };
}
exports.CarouselComponent = CarouselComponent;


/***/ }),

/***/ 9691:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CarouselProgress = exports.CarouselPlayButton = exports.CarouselDots = exports.CarouselButton = exports.CarouselComponent = void 0;
var carousel_1 = __webpack_require__(3442);
Object.defineProperty(exports, "CarouselComponent", ({ enumerable: true, get: function () { return carousel_1.CarouselComponent; } }));
var carousel_button_1 = __webpack_require__(532);
Object.defineProperty(exports, "CarouselButton", ({ enumerable: true, get: function () { return carousel_button_1.CarouselButton; } }));
var carousel_dots_1 = __webpack_require__(4887);
Object.defineProperty(exports, "CarouselDots", ({ enumerable: true, get: function () { return carousel_dots_1.CarouselDots; } }));
var carousel_play_button_1 = __webpack_require__(317);
Object.defineProperty(exports, "CarouselPlayButton", ({ enumerable: true, get: function () { return carousel_play_button_1.CarouselPlayButton; } }));
var carousel_progress_bar_1 = __webpack_require__(319);
Object.defineProperty(exports, "CarouselProgress", ({ enumerable: true, get: function () { return carousel_progress_bar_1.CarouselProgress; } }));


/***/ }),

/***/ 7300:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SliderGrid = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const debounce_1 = __webpack_require__(2731);
const check_media_1 = __webpack_require__(5580);
const key_1 = __webpack_require__(9650);
const CART_DRAWER_SELECTOR = 'cart-drawer';
const TRACK_SELECTOR = '[slider-grid-track]';
const SLIDE_SELECTOR = 'slider-grid-slide';
const AUTOPLAY_ATTRIBUTE = 'autoplay-mode';
const AUTOPLAY_INTERVAL_ATTRIBUTE = 'autoplay-interval';
const ONE_AT_TIME_AUTOPLAY_RUNNING_ATTRIBUTE = 'autoplay-running';
const SEAMLESS_AUTOPLAY_RUNNING_ATTRIBUTE = 'seamless-autoplay-running';
const SEAMLESS_AUTOPLAY_PAUSED_ATTRIBUTE = 'seamless-autoplay-paused';
const BUTTON_SELECTOR = 'button[data-direction]';
const BUTTON_DIRECTION_SELECTOR = 'data-direction';
const PROGRESS_BAR_SELECTOR = '[slider-grid-progress]';
const DOT_SELECTOR = '[slider-grid-dot]';
const DESKTOP_DISABLED_ATTRIBUTE = 'desktop-disabled';
const MOBILE_DISABLED_ATTRIBUTE = 'mobile-disabled';
class SliderGrid extends base_component_1.BaseComponent {
    activeSlide;
    lastSlideIndex;
    track;
    trackWidth;
    navButtons;
    buttonsInited;
    withProgressBar;
    dots;
    slides;
    withDots;
    snaps;
    x;
    y;
    autoplay;
    requestFrameId;
    seamlessRunning;
    pausedAt;
    resizeObserver;
    intersectionObserver;
    autoplayIntersectionObserver;
    autoplayForcedStopped;
    isMobile;
    desktopDisabled;
    mobileDisabled;
    forceDeactivated;
    sidebar;
    isFocused;
    constructor() {
        super();
        this.activeSlide = 0;
        this.autoplay = this.getAttribute(AUTOPLAY_ATTRIBUTE);
        this.desktopDisabled = this.hasAttribute(DESKTOP_DISABLED_ATTRIBUTE);
        this.mobileDisabled = this.hasAttribute(MOBILE_DISABLED_ATTRIBUTE);
        this.sidebar = this.closest(CART_DRAWER_SELECTOR);
    }
    mountComponent() {
        this.track = (0, utils_1.$el)(TRACK_SELECTOR, this);
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(this);
    }
    unmountComponent() {
        this.stopAutoplay();
        this.resizeObserver.disconnect();
        this.intersectionObserver?.disconnect();
        this.autoplayIntersectionObserver?.disconnect();
    }
    // INIT
    init = () => {
        this.isMobile = (0, check_media_1.isMobile)();
        this.forceDeactivated = false;
        if ((this.isMobile && this.mobileDisabled) ||
            (!this.isMobile && this.desktopDisabled)) {
            this.toggleListeners(false);
            this.stopAutoplay();
            return;
        }
        this.activeSlide = 0;
        this.setSnaps();
        if (this.forceDeactivated) {
            this.toggleListeners(false);
            this.setButtonsInactive();
        }
        else {
            this.initButtons();
            this.toggleButtonsActive();
            this.initProgressBar();
            this.initDots();
            this.initAutoplay();
            this.toggleListeners(true);
        }
    };
    handleResize = (0, debounce_1.debounce)(async () => {
        if (!this.offsetWidth) {
            return;
        }
        this.track.removeAttribute('style');
        this.stopAutoplay();
        await (0, utils_1.transitionToPromise)(this.track);
        this.init();
    }, 50);
    setSnaps = () => {
        const slides = (0, utils_1.$list)(`[${SLIDE_SELECTOR}]`, this);
        const viewportWidth = this.track.getBoundingClientRect().width + 1;
        const { left: firstSlideLeft, width: slideWidth } = slides[0].getBoundingClientRect();
        const lastSlideRight = slides[slides.length - 1].getBoundingClientRect().right;
        const slidesPerView = Math.floor(viewportWidth / slideWidth);
        const snapsCount = slides.length - slidesPerView;
        if (snapsCount < 1) {
            this.forceDeactivated = true;
            return;
        }
        this.snaps = slides.reduce((acc, slide, index) => {
            if (index === snapsCount ||
                (index < snapsCount && index % slidesPerView === 0)) {
                let snapPosition = firstSlideLeft - slide.getBoundingClientRect().left;
                if (index === snapsCount && snapPosition < viewportWidth) {
                    snapPosition = this.isMobile
                        ? -(lastSlideRight - viewportWidth + firstSlideLeft)
                        : -(lastSlideRight - viewportWidth - firstSlideLeft);
                }
                return [...acc, snapPosition];
            }
            else {
                return acc;
            }
        }, []);
        this.lastSlideIndex = this.snaps.length - 1;
        this.trackWidth = firstSlideLeft + lastSlideRight;
    };
    // EVENTS
    toggleListeners = (enable) => {
        if (enable) {
            this.addListener(this, 'mousedown', this.handleMouseDown);
            this.addListener(this, 'mouseup', this.handleMouseUp);
            this.addListener(this, 'dragstart', this.handleDragStart);
            this.addListener(this, 'keydown', this.handleKeydown);
        }
        else {
            this.removeListener(this, 'mousedown', this.handleMouseDown);
            this.removeListener(this, 'mouseup', this.handleMouseUp);
            this.removeListener(this, 'dragstart', this.handleDragStart);
            this.removeListener(this, 'keydown', this.handleKeydown);
            this.removeListener(this, 'focusin', this.handleFocus);
        }
    };
    handleKeydown = (event) => {
        if (!this.isFocused) {
            this.stopAutoplay();
            const { lastTarget } = (0, utils_1.getTargets)(this, false);
            this.addListener(lastTarget, 'focusout', this.handleFocusOut);
            this.addListener(this, 'focusin', this.handleFocus);
        }
        if ((0, key_1.isLeftKey)(event)) {
            this.scrollPrev();
        }
        if ((0, key_1.isRightKey)(event)) {
            this.scrollNext();
        }
        this.isFocused = true;
    };
    handleFocus = (event) => {
        const targetLeft = event.target.getBoundingClientRect()
            .left;
        const thisRight = this.getBoundingClientRect().right;
        if (targetLeft > thisRight) {
            this.scrollNext();
        }
        if (targetLeft < 0) {
            this.scrollTo(0);
            this.activeSlide = 0;
        }
        this.toggleButtonsActive();
    };
    handleFocusOut = ({ currentTarget }) => {
        this.removeListener(currentTarget, 'focusout', this.handleFocusOut);
        this.removeListener(this, 'focusin', this.handleFocus);
    };
    handleMouseDown = ({ x }) => {
        this.addListener(this, 'mousemove', this.handleMouseMove);
        this.x = x;
        this.stopAutoplay();
    };
    handleMouseUp = ({ x }) => {
        if (this.isSwipeRight(x)) {
            this.scrollNext();
        }
        if (this.isSwipeLeft(x)) {
            this.scrollPrev();
        }
        this.classList.remove('dragging');
        this.removeListener(this, 'mousemove', this.handleMouseMove);
    };
    handleMouseMove = ({ x }) => {
        if (this.isSwipeRight(x) || this.isSwipeLeft(x)) {
            this.classList.add('dragging');
        }
    };
    handleDragStart = (event) => {
        event.preventDefault();
        return false;
    };
    handleTouchStart = () => {
        const translated = this.track
            .getAttribute('style')
            ?.replace('transform: translateX(', '')
            .replace('px);', '');
        this.stopAutoplay();
        this.track.removeAttribute('style');
        this.track.scrollTo({
            left: Math.abs(+translated),
        });
        this.autoplayForcedStopped = true;
    };
    isSwipeRight = (x) => {
        return this.x - x > 0;
    };
    isSwipeLeft = (x) => {
        return this.x - x < 0;
    };
    handleMouseEnterAutoplay = () => {
        this.pauseAutoplay();
    };
    handleMouseLeaveAutoplay = () => {
        this.startAutoplay();
    };
    // SCROLLLING
    scrollNext = () => {
        if (!this.canScrollNext()) {
            return;
        }
        const nextIndex = this.activeSlide + 1;
        this.activeSlide = nextIndex;
        this.scrollTo(this.snaps[nextIndex]);
    };
    scrollPrev = () => {
        if (!this.canScrollPrev()) {
            return;
        }
        const nextIndex = this.activeSlide < 1 ? 0 : this.activeSlide - 1;
        this.activeSlide = nextIndex;
        this.scrollTo(this.snaps[nextIndex]);
        if (this.seamlessRunning) {
            this.seamlessRunning = false;
        }
    };
    scrollTo = value => {
        this.track.setAttribute('style', `transform: translateX(${value}px);`);
        this.toggleNavItems();
    };
    canScrollNext = () => {
        return this.activeSlide !== this.lastSlideIndex;
    };
    canScrollPrev = () => {
        return this.seamlessRunning || this.activeSlide !== 0;
    };
    scrollSlideIntoView = (slideIndex) => {
        if (slideIndex === this.activeSlide) {
            return;
        }
        if (this.isMobile) {
            this.track.scrollTo({
                left: Math.abs(this.snaps[slideIndex]),
                behavior: 'smooth',
            });
            this.activeSlide = slideIndex;
        }
        else {
            const slideLeft = (0, utils_1.$list)(`[${SLIDE_SELECTOR}]`, this)[slideIndex].getBoundingClientRect().left;
            const trackLeft = this.track.getBoundingClientRect().left;
            const snapToScroll = slideIndex === 0
                ? 0
                : slideIndex > this.lastSlideIndex
                    ? this.lastSlideIndex
                    : this.snaps.findIndex(snap => slideLeft - trackLeft + snap < 10);
            this.scrollTo(this.snaps[snapToScroll]);
            this.activeSlide = snapToScroll;
        }
        this.toggleNavItems();
    };
    toggleNavItems = () => {
        this.toggleButtonsActive();
        if (this.withProgressBar) {
            this.setProgress();
        }
        if (this.withDots) {
            this.toggleDotsActive(this.activeSlide);
        }
    };
    // AUTOPLAY
    initAutoplay = () => {
        if (this.autoplay) {
            if (this.isMobile) {
                this.addListener(this, 'touchstart', this.handleTouchStart);
            }
            this.addListener(this, 'mouseenter', this.handleMouseEnterAutoplay);
            this.addListener(this, 'mouseleave', this.handleMouseLeaveAutoplay);
            this.autoplayIntersectionObserver = new IntersectionObserver(this.toggleAutoplayOnIntersection);
            this.autoplayIntersectionObserver.observe(this);
        }
    };
    toggleAutoplayOnIntersection = (elements) => {
        if (elements[0].isIntersecting) {
            this.startAutoplay();
        }
        else {
            this.pauseAutoplay();
            if (this.autoplayForcedStopped) {
                this.autoplayIntersectionObserver.disconnect();
            }
        }
    };
    startAutoplay = () => {
        if (this.autoplay === 'one_at_time') {
            this.startOneAtTimeAutoPlay();
        }
        else if (this.autoplay === 'seamless') {
            this.startSeamlessAutoPlay();
            this.toggleButtonsActive();
        }
    };
    stopAutoplay = () => {
        this.removeAutoplayState();
        this.removeListener(this, 'touchstart', this.handleTouchStart);
        this.removeListener(this, 'mouseenter', this.handleMouseEnterAutoplay);
        this.removeListener(this, 'mouseleave', this.handleMouseLeaveAutoplay);
    };
    pauseAutoplay = () => {
        this.removeAutoplayState();
        if (this.autoplay === 'seamless') {
            this.pausedAt = +this.track.style.transform
                .replace('translateX(', '')
                .replace('px)', '');
        }
    };
    removeAutoplayState = () => {
        cancelAnimationFrame(this.requestFrameId);
        this.removeAttribute(ONE_AT_TIME_AUTOPLAY_RUNNING_ATTRIBUTE);
        this.removeAttribute(SEAMLESS_AUTOPLAY_RUNNING_ATTRIBUTE);
    };
    startOneAtTimeAutoPlay = async () => {
        if (this.sidebar) {
            await (0, utils_1.transitionToPromise)(this.sidebar);
            this.setSnaps();
        }
        this.removeAttribute(ONE_AT_TIME_AUTOPLAY_RUNNING_ATTRIBUTE);
        const interval = +this.getAttribute(AUTOPLAY_INTERVAL_ATTRIBUTE) * 1000;
        let last;
        const tick = (timestamp) => {
            if (!last) {
                last = timestamp;
            }
            const delta = timestamp - last;
            if (delta > interval) {
                if (this.canScrollNext()) {
                    this.scrollNext();
                }
                else {
                    this.activeSlide = -1;
                    this.scrollNext();
                }
                last = timestamp;
            }
            this.requestFrameId = requestAnimationFrame(tick);
        };
        this.requestFrameId = requestAnimationFrame(tick);
        this.setAttribute(ONE_AT_TIME_AUTOPLAY_RUNNING_ATTRIBUTE, '');
    };
    startSeamlessAutoPlay = async () => {
        if (this.sidebar) {
            await (0, utils_1.transitionToPromise)(this.sidebar);
            this.setSnaps();
        }
        this.setAttribute(SEAMLESS_AUTOPLAY_RUNNING_ATTRIBUTE, '');
        const distance = this.snaps[this.snaps.length - 1];
        const interval = 0.2 * +this.getAttribute(AUTOPLAY_INTERVAL_ATTRIBUTE);
        let scrolled = this.pausedAt ?? 0;
        const tick = () => {
            scrolled = Math.max(scrolled - interval, distance);
            this.scrollTo(scrolled);
            if (scrolled != distance) {
                this.requestFrameId = requestAnimationFrame(tick);
                const currentSnap = this.snaps.findIndex(val => {
                    const diff = scrolled - val;
                    return diff > 0 && diff < 20;
                });
                if (currentSnap > 0) {
                    this.activeSlide = currentSnap;
                }
                if (this.withProgressBar) {
                    this.setProgress(Math.abs(scrolled / distance) * 100);
                }
            }
            else {
                this.restartSeamlessAutoplay();
            }
        };
        this.requestFrameId = requestAnimationFrame(tick);
        this.seamlessRunning = true;
        this.pausedAt = 0;
    };
    restartSeamlessAutoplay = async () => {
        this.setAttribute(SEAMLESS_AUTOPLAY_PAUSED_ATTRIBUTE, '');
        await (0, utils_1.transitionToPromise)(this.track);
        if (!this.isMobile) {
            this.removeAttribute(SEAMLESS_AUTOPLAY_RUNNING_ATTRIBUTE);
        }
        cancelAnimationFrame(this.requestFrameId);
        this.track.removeAttribute('style');
        if (this.withProgressBar) {
            this.setProgress(0);
        }
        await (0, utils_1.transitionToPromise)(this.track);
        this.removeAttribute(SEAMLESS_AUTOPLAY_PAUSED_ATTRIBUTE);
        await (0, utils_1.delay)(500);
        this.pausedAt = 0;
        this.activeSlide = 0;
        this.startSeamlessAutoPlay();
    };
    // BUTTONS
    initButtons = () => {
        if (this.buttonsInited) {
            this.navButtons.forEach(btn => {
                this.removeListener(btn, 'click', this.handleButtonClick);
            });
        }
        this.navButtons = (0, utils_1.$list)(BUTTON_SELECTOR, this);
        if (this.navButtons.length) {
            this.navButtons.forEach(btn => {
                this.addListener(btn, 'click', this.handleButtonClick);
            });
            this.buttonsInited = true;
        }
    };
    handleButtonClick = ({ currentTarget }) => {
        const direction = currentTarget.getAttribute(BUTTON_DIRECTION_SELECTOR);
        direction === 'next' ? this.scrollNext() : this.scrollPrev();
    };
    toggleButtonsActive = () => {
        if (this.buttonsInited) {
            this.navButtons[0].toggleAttribute('disabled', !this.canScrollPrev());
            this.navButtons[1].toggleAttribute('disabled', !this.canScrollNext());
        }
    };
    setButtonsInactive = () => {
        (0, utils_1.$list)(BUTTON_SELECTOR, this).forEach(btn => {
            btn.setAttribute('disabled', '');
        });
    };
    // PROGRESS
    initProgressBar = () => {
        if (this.withProgressBar) {
            this.setProgress(0);
            return;
        }
        const progressBar = (0, utils_1.$el)(PROGRESS_BAR_SELECTOR, this);
        if (progressBar) {
            this.setProgress();
            this.withProgressBar = true;
            if (this.isMobile) {
                this.addListener(this.track, 'scroll', this.handleProgressOnMobile);
            }
        }
    };
    setProgress = (value) => {
        const progress = value ?? (this.activeSlide / this.lastSlideIndex) * 100;
        this.setAttribute('style', `--gsc-slider-grid-progress: ${progress}%;`);
    };
    handleProgressOnMobile = ({ target }) => {
        this.setProgress((target.scrollLeft / this.trackWidth) * 100);
    };
    // DOTS
    initDots = () => {
        if (this.withDots) {
            this.intersectionObserver?.disconnect();
            this.removeListener(this.dots[0].parentElement, 'click', this.handleDotTouch);
        }
        if (this.isMobile) {
            this.initMobileDots();
        }
        else {
            if (this.withDots) {
                this.track.scrollTo({
                    left: 0,
                    behavior: 'smooth',
                });
            }
            this.initDesktopDots();
        }
        this.toggleDotsActive(0);
    };
    initMobileDots = () => {
        this.dots = (0, utils_1.$list)(DOT_SELECTOR, this).filter(dot => dot.offsetWidth > 0);
        if (this.dots.length > 0) {
            this.slides = (0, utils_1.$list)(`[${SLIDE_SELECTOR}]`, this);
            this.addListener(this.dots[0].parentElement, 'click', this.handleDotTouch);
            this.intersectionObserver = new IntersectionObserver(this.observeSlides, {
                rootMargin: `0px`,
                root: this,
            });
            this.slides.forEach(slide => {
                this.intersectionObserver.observe(slide);
            });
            this.withDots = true;
        }
    };
    initDesktopDots = () => {
        this.dots = (0, utils_1.$list)(DOT_SELECTOR, this).filter(dot => dot.offsetWidth > 0);
        if (this.dots.length > 0) {
            this.addListener(this.dots[0].parentElement, 'click', this.handleDotTouch);
            this.withDots = true;
        }
    };
    observeSlides = (0, debounce_1.debounce)((entries) => {
        if (!this.isMobile) {
            return;
        }
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.toggleDotsActive(+entry.target.getAttribute('index'));
            }
        });
    }, 50);
    handleDotTouch = ({ target }) => {
        const dotClicked = target.closest(DOT_SELECTOR);
        if (this.isMobile) {
            this.track.scrollTo({
                left: Math.abs(this.snaps[+dotClicked.getAttribute('index')]),
                behavior: 'smooth',
            });
        }
        else {
            this.activeSlide = +dotClicked.getAttribute('index');
            this.scrollTo(this.snaps[this.activeSlide]);
            this.toggleDotsActive(this.activeSlide);
            this.toggleButtonsActive();
        }
    };
    toggleDotsActive = (index) => {
        this.dots?.forEach(dot => dot.classList.toggle('is-primary', +dot.getAttribute('index') === index));
    };
}
exports.SliderGrid = SliderGrid;


/***/ }),

/***/ 8078:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartCount = void 0;
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const CART_PAGE_SELECTOR = 'cart-page';
const CART_DRAWER_SELECTOR = 'cart-drawer';
const CART_POPUP_SELECTOR = 'cart-notification-popup';
const NEW_COUNT_SELECTOR = `#NewCartCount`;
class CartCount extends base_component_1.BaseComponent {
    mountComponent() {
        const cart = (0, utils_1.$el)(CART_PAGE_SELECTOR);
        const cartDrawer = (0, utils_1.$el)(CART_DRAWER_SELECTOR);
        const cartPopup = (0, utils_1.$el)(CART_POPUP_SELECTOR);
        cart?.on('update-nodes', this.handleCartUpdate);
        cartDrawer?.on('update-nodes', this.handleCartUpdate);
        cartPopup?.on('update-nodes', this.handleCartUpdate);
    }
    unmountComponent() {
        const cart = (0, utils_1.$el)(CART_PAGE_SELECTOR);
        const cartDrawer = (0, utils_1.$el)(CART_DRAWER_SELECTOR);
        const cartPopup = (0, utils_1.$el)(CART_POPUP_SELECTOR);
        cart?.off('update-nodes', this.handleCartUpdate);
        cartDrawer?.off('update-nodes', this.handleCartUpdate);
        cartPopup?.off('update-nodes', this.handleCartUpdate);
    }
    handleCartUpdate = ({ node }) => {
        const newNode = (0, utils_1.$el)(NEW_COUNT_SELECTOR, node);
        (0, dom_1.replaceNodeChildren)(this, newNode);
    };
}
exports.CartCount = CartCount;


/***/ }),

/***/ 3492:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartCount = void 0;
var cart_count_1 = __webpack_require__(8078);
Object.defineProperty(exports, "CartCount", ({ enumerable: true, get: function () { return cart_count_1.CartCount; } }));


/***/ }),

/***/ 5237:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartNotificationPopup = void 0;
const modal_1 = __webpack_require__(1181);
const utils_1 = __webpack_require__(4083);
const dom_1 = __webpack_require__(3889);
const check_media_1 = __webpack_require__(5580);
const HEADER_SELECTOR = 'header-component';
const HEADER_WITH_POPUP_CLASS = 'shopify-section-header--with-cart-popup';
class CartNotificationPopup extends modal_1.ModalComponent {
    wasHeaderHidden;
    purchaseHandler(html, parsedState) {
        const header = (0, utils_1.$el)(HEADER_SELECTOR);
        this.wasHeaderHidden = header.isHidden;
        if (this.element) {
            const newNode = (0, utils_1.$el)(`#CartNotificationPopupItem-${parsedState.id}`, html);
            const node = (0, utils_1.$el)('[data-cart-notification-popup]', this.element);
            (0, dom_1.replaceNodeChildren)(node, newNode);
            this.toggleMobileHeader(false).then(() => {
                this.show();
                (0, utils_1.delay)(5000).then(() => {
                    this.hide();
                });
            });
            this.emit('update-nodes', { node, parsedState });
        }
    }
    async hide() {
        await super.hide();
        await (0, utils_1.transitionToPromise)(this);
        this.toggleMobileHeader(true);
    }
    toggleMobileHeader = async (isToShow) => {
        if ((0, check_media_1.isMobile)()) {
            const header = (0, utils_1.$el)(HEADER_SELECTOR);
            header.parentElement.classList.toggle(HEADER_WITH_POPUP_CLASS, !isToShow);
            if (this.wasHeaderHidden) {
                header.setHidden(isToShow);
            }
            await (0, utils_1.delay)(300);
        }
    };
}
exports.CartNotificationPopup = CartNotificationPopup;


/***/ }),

/***/ 1070:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartNotificationPopup = void 0;
var cart_notification_popup_1 = __webpack_require__(5237);
Object.defineProperty(exports, "CartNotificationPopup", ({ enumerable: true, get: function () { return cart_notification_popup_1.CartNotificationPopup; } }));


/***/ }),

/***/ 8435:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClipboardButtonTooltip = void 0;
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(5260);
const dom_2 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const ARROW_SELECTOR = '[data-float-element-arrow]';
class ClipboardButtonTooltip extends base_component_1.BaseComponent {
    element;
    removeUpdate = () => { };
    constructor() {
        super();
        this.element = (0, dom_2.getTemplateFirstChild)((0, utils_1.$el)(`[data-clipboard-button-tooltip-template="${this.id}"]`, this));
    }
    updatePosition({ x, y }) {
        Object.assign(this.style, {
            left: `${x}px`,
            top: `${y}px`,
        });
    }
    getOptions() {
        const arrowElement = (0, utils_1.$el)(ARROW_SELECTOR, this.element);
        const middleware = [
            (0, dom_1.offset)({
                alignmentAxis: +(this.dataset.alignmentAxisOffset || 0),
                mainAxis: +(this.dataset.mainAxisOffset || 0),
            }),
            (0, dom_1.flip)(),
            (0, dom_1.shift)(),
        ];
        if (arrowElement) {
            middleware.push((0, dom_1.arrow)({ element: arrowElement }));
        }
        return {
            placement: this.dataset.placement || 'bottom-end',
            middleware,
            strategy: 'fixed',
        };
    }
    updateArrow({ placement, middlewareData }) {
        const arrowElement = (0, utils_1.$el)(ARROW_SELECTOR, this.element);
        if (!arrowElement) {
            return;
        }
        const { x: arrowX, y: arrowY } = middlewareData.arrow;
        const staticSide = {
            top: 'bottom',
            right: 'left',
            bottom: 'top',
            left: 'right',
        }[placement.split('-')[0]];
        Object.assign(arrowElement.style, {
            left: arrowX != null ? `${arrowX}px` : '',
            top: arrowY != null ? `${arrowY}px` : '',
            right: '',
            bottom: '',
            [staticSide]: '-5px',
        });
    }
    mount() {
        const floatElement = (0, utils_1.$el)(`[data-clipboard-button-tooltip-target-id="${this.id}"]`);
        this.replaceChildren(this.element);
        if (!floatElement) {
            return;
        }
        this.removeUpdate = (0, dom_1.autoUpdate)(floatElement, this, () => {
            (0, dom_1.computePosition)(floatElement, this, this.getOptions()).then(data => {
                this.updatePosition(data);
                this.updateArrow(data);
            });
        });
    }
    unmount() {
        this.replaceChildren();
        this.removeUpdate();
    }
    show = () => {
        this.mount();
        this.setVisible(true);
        this.emit('show', {});
    };
    hide = () => {
        this.setVisible(false);
        this.unmount();
        this.emit('hide', {});
    };
    setVisible(isVisible) {
        this.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
    }
}
exports.ClipboardButtonTooltip = ClipboardButtonTooltip;


/***/ }),

/***/ 8292:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClipboardButton = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const key_1 = __webpack_require__(9650);
class ClipboardButton extends base_component_1.BaseComponent {
    mountComponent() {
        this.addListener(this, 'click', this.handleButtonClick);
        this.addListener(this, 'keydown', this.handleButtonKeydown);
    }
    handleButtonClick = (event) => {
        event.preventDefault();
        this.copy();
    };
    handleButtonKeydown = (event) => {
        if ((0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            this.copy();
        }
    };
    copy = () => {
        const value = this.dataset.value;
        if (value && navigator.clipboard) {
            navigator.clipboard
                .writeText(value)
                .then(() => {
                this.showTooltip();
            })
                .catch(e => {
                if (window.Shopify.designMode) {
                    // The Clipboard API blocked in Shopify editor
                    this.showTooltip();
                }
                throw e;
            });
        }
    };
    showTooltip() {
        const tooltip = (0, utils_1.$el)(`#${this.dataset.tooltipId}`);
        if (tooltip) {
            tooltip.show();
            (0, utils_1.delay)(1000).then(() => {
                tooltip.hide();
            });
        }
    }
}
exports.ClipboardButton = ClipboardButton;


/***/ }),

/***/ 9911:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClipboardButtonTooltip = exports.ClipboardButton = void 0;
var clipboard_button_1 = __webpack_require__(8292);
Object.defineProperty(exports, "ClipboardButton", ({ enumerable: true, get: function () { return clipboard_button_1.ClipboardButton; } }));
var clipboard_button_tooltip_1 = __webpack_require__(8435);
Object.defineProperty(exports, "ClipboardButtonTooltip", ({ enumerable: true, get: function () { return clipboard_button_tooltip_1.ClipboardButtonTooltip; } }));


/***/ }),

/***/ 5370:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CloseCursor = void 0;
const base_component_1 = __webpack_require__(3608);
const check_media_1 = __webpack_require__(5580);
const utils_1 = __webpack_require__(4083);
const OVERLAY_SELECTOR = 'body-element';
class CloseCursor extends base_component_1.BaseComponent {
    overlaySelector;
    isInited;
    overlay;
    constructor() {
        super();
        this.isInited = false;
        this.overlay = (0, utils_1.$el)(OVERLAY_SELECTOR);
    }
    handleMouseMove = (event) => {
        this.toggleVisibility(event);
    };
    toggleVisibility = (event) => {
        const target = event.target;
        const isOnOverlay = this.checkIsOnOverlay(target);
        if (isOnOverlay) {
            this.setVisible(event);
        }
        else {
            this.setHidden();
        }
    };
    setVisible(event) {
        this.setAttribute('visible', '');
        const { clientY: top, clientX: left } = event;
        this.style.transform = `translate(calc(-50% + ${left}px), calc(-50% + ${top}px))`;
    }
    setHidden() {
        this.removeAttribute('visible');
    }
    setInitialVisibility = (clickEvent) => {
        const { clientY, clientX } = clickEvent;
        const target = document.elementFromPoint(clientX, clientY);
        const isOnOverlay = this.checkIsOnOverlay(target);
        if (isOnOverlay) {
            this.setVisible(clickEvent);
        }
    };
    toggle(clickEvent) {
        if (!(0, check_media_1.isMobile)() && this.overlay.isVisible) {
            this.isInited ? this.deInit() : this.init(clickEvent);
        }
    }
    init = (clickEvent) => {
        window.addEventListener('mousemove', this.handleMouseMove);
        if (clickEvent?.clientX) {
            this.setInitialVisibility(clickEvent);
        }
        this.isInited = true;
    };
    deInit() {
        window.removeEventListener('mousemove', this.handleMouseMove);
        this.setHidden();
        this.isInited = false;
    }
    checkIsOnOverlay(target) {
        return target === this.overlay;
    }
}
exports.CloseCursor = CloseCursor;


/***/ }),

/***/ 3221:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CollapsedTags = void 0;
const utils_1 = __webpack_require__(4083);
const debounce_1 = __webpack_require__(2731);
const base_component_1 = __webpack_require__(3608);
class CollapsedTags extends base_component_1.BaseComponent {
    extendButton;
    tags;
    hiddenTags;
    extendButtonWidth;
    maxRightPoint;
    resizeObserver;
    constructor() {
        super();
        this.tags = (0, utils_1.$list)('[data-tag]', this);
        this.hiddenTags =
            (0, utils_1.$el)('[data-collapsed-tags]', this) ?? (0, utils_1.$el)('#show_other_tags');
        this.extendButton = (0, utils_1.$el)('[data-extend-button]', this);
        this.extendButtonWidth = this.extendButton?.offsetWidth ?? 0;
        this.maxRightPoint =
            this.getBoundingClientRect().right - this.extendButtonWidth - 20;
    }
    mountComponent() {
        this.resizeObserver = new ResizeObserver(this.handleContentResize);
        this.resizeObserver.observe(this);
    }
    unmountComponent() {
        this.resizeObserver.disconnect();
    }
    handleContentResize = (0, debounce_1.debounce)(() => {
        this.setOffsets();
        this.update();
    }, 200);
    updateButtonVisible() {
        if (!this.extendButton) {
            return;
        }
        const hiddenTags = this.querySelectorAll('[tag-hidden]');
        const hasHiddenTags = hiddenTags.length > 0;
        if (hasHiddenTags) {
            const left = hiddenTags[0].style.left;
            this.extendButton.style.left = left;
        }
        this.extendButton.classList.toggle('hidden', !hasHiddenTags);
        this.setAttribute('data-is-collapsed', hasHiddenTags.toString());
    }
    setOffsets() {
        this.tags.forEach(tag => {
            tag.style.left = `${tag.offsetLeft}px`;
            tag.style.top = `${tag.offsetTop}px`;
        });
    }
    updateTagsVisible() {
        const collapsedTagsFragment = document.createDocumentFragment();
        this.tags.forEach(tag => {
            const tagRightPosition = tag.getBoundingClientRect().right;
            const isOverflowed = tagRightPosition > this.maxRightPoint;
            if (isOverflowed) {
                const clone = tag.cloneNode(true);
                this.setTagVisible(clone, true);
                collapsedTagsFragment.appendChild(clone);
            }
            this.setTagVisible(tag, !isOverflowed);
        });
        this.hiddenTags?.element.replaceChildren(collapsedTagsFragment);
    }
    setTagVisible(tag, isVisible) {
        tag.toggleAttribute('tag-hidden', !isVisible);
    }
    resetVisibility = () => {
        this.tags.forEach(tag => {
            this.setTagVisible(tag, false);
        });
    };
    update() {
        this.extendButtonWidth = this.extendButton?.offsetWidth ?? 0;
        this.maxRightPoint =
            this.getBoundingClientRect().right - this.extendButtonWidth - 20;
        this.updateTagsVisible();
        this.updateButtonVisible();
        this.setAttribute('visible', '');
    }
}
exports.CollapsedTags = CollapsedTags;


/***/ }),

/***/ 3210:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CollapsedTags = void 0;
var collapsed_tags_1 = __webpack_require__(3221);
Object.defineProperty(exports, "CollapsedTags", ({ enumerable: true, get: function () { return collapsed_tags_1.CollapsedTags; } }));


/***/ }),

/***/ 5177:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CountdownTimer = void 0;
const utils_1 = __webpack_require__(4083);
const dom_1 = __webpack_require__(3889);
const base_component_1 = __webpack_require__(3608);
const timer_storage_1 = __webpack_require__(7921);
const types_1 = __webpack_require__(1709);
const ONE_DAY_MS = 86400000;
const MONTHS = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
};
const getEvergreenEndDate = (unit, value) => {
    const date = new Date();
    switch (unit) {
        case 'day':
            date.setDate(date.getDate() + value);
            break;
        case 'hour':
            date.setHours(date.getHours() + value);
            break;
        case 'minute':
            date.setMinutes(date.getMinutes() + value);
            break;
        case 'second':
            date.setSeconds(date.getSeconds() + value);
            break;
    }
    return date;
};
class CountdownTimer extends base_component_1.BaseComponent {
    mode = types_1.TimerMode.Fixed;
    endDate = new Date();
    timerRef;
    finishStrategy = types_1.TimerFinishStrategy.None;
    timerStorage;
    evergreenUnit;
    evergreenValue;
    daysUnit;
    hoursUnit;
    minutesUnit;
    secondsUnit;
    daysUnitLabel;
    hoursUnitLabel;
    minutesUnitLabel;
    secondsUnitLabel;
    constructor() {
        super();
        this.daysUnit = (0, utils_1.$el)('[data-timer-days]', this);
        this.hoursUnit = (0, utils_1.$el)('[data-timer-hours]', this);
        this.minutesUnit = (0, utils_1.$el)('[data-timer-minutes]', this);
        this.secondsUnit = (0, utils_1.$el)('[data-timer-seconds]', this);
        this.daysUnitLabel = (0, utils_1.$el)('[data-timer-days-label]', this);
        this.hoursUnitLabel = (0, utils_1.$el)('[data-timer-hours-label]', this);
        this.minutesUnitLabel = (0, utils_1.$el)('[data-timer-minutes-label]', this);
        this.secondsUnitLabel = (0, utils_1.$el)('[data-timer-seconds-label]', this);
        this.evergreenUnit = this.dataset.evergreenUnit || 'minute';
        this.evergreenValue = parseInt(this.dataset.evergreenValue || '0');
        this.mode = this.dataset.mode;
        if (this.mode === types_1.TimerMode.Fixed) {
            this.finishStrategy =
                this.dataset.hideOnComplete === 'true'
                    ? types_1.TimerFinishStrategy.Hide
                    : types_1.TimerFinishStrategy.None;
        }
        if (this.mode === types_1.TimerMode.Evergreen) {
            this.finishStrategy =
                this.dataset.evergreenOnComplete ||
                    types_1.TimerFinishStrategy.Restart;
            this.timerStorage = new timer_storage_1.TimerStorage(this.dataset.blockId || this.id);
        }
    }
    mountComponent() {
        this.start();
    }
    unmountComponent() {
        clearInterval(this.timerRef);
    }
    getHash() {
        return `${this.finishStrategy}-${this.evergreenUnit}-${this.evergreenValue}`;
    }
    start() {
        if (this.mode === types_1.TimerMode.Fixed) {
            const year = Number(this.dataset.year);
            const month = MONTHS[this.dataset.month ?? 'january'];
            const day = Number(this.dataset.day);
            const hour = Number(this.dataset.hour);
            const minute = Number(this.dataset.minute);
            this.endDate = new Date(year, month, day, hour, minute);
        }
        if (this.mode === types_1.TimerMode.Evergreen) {
            const timerData = this.timerStorage.loadData();
            if (!timerData || timerData.hash !== this.getHash()) {
                this.updateEvergreenData();
            }
            else {
                this.endDate = timerData.endDate;
            }
        }
        this.timerRef = window.setInterval(this.tick.bind(this), 1000);
        this.tick();
    }
    updateEvergreenData() {
        const endDate = getEvergreenEndDate(this.evergreenUnit, this.evergreenValue);
        this.timerStorage.saveData({ endDate, hash: this.getHash() });
        this.endDate = endDate;
    }
    finish() {
        clearInterval(this.timerRef);
        switch (this.finishStrategy) {
            case types_1.TimerFinishStrategy.Restart:
                this.timerStorage.saveData({
                    endDate: getEvergreenEndDate(this.evergreenUnit, this.evergreenValue),
                    hash: this.getHash(),
                });
                this.start();
                break;
            case types_1.TimerFinishStrategy.WaitOneDay:
                if (new Date().getTime() - this.endDate.getTime() > ONE_DAY_MS) {
                    const endDate = getEvergreenEndDate(this.evergreenUnit, this.evergreenValue);
                    this.timerStorage.saveData({ endDate, hash: this.getHash() });
                    this.start();
                }
                else {
                    this.hide();
                }
                break;
            case types_1.TimerFinishStrategy.None:
                this.show(); // show zero-values if time is over
                break;
            default:
                this.hide();
        }
    }
    renderTime(days, hours, minutes, seconds) {
        if (!this.daysUnit ||
            !this.hoursUnit ||
            !this.minutesUnit ||
            !this.secondsUnit) {
            return;
        }
        this.daysUnit.innerText = days.toString();
        this.hoursUnit.innerText = hours.toString();
        this.minutesUnit.innerText = minutes.toString();
        this.secondsUnit.innerText = seconds.toString();
        this.renderLabels(days, hours, minutes, seconds);
    }
    renderLabels(days, hours, minutes, seconds) {
        if (!this.daysUnitLabel ||
            !this.hoursUnitLabel ||
            !this.minutesUnitLabel ||
            !this.secondsUnitLabel) {
            return;
        }
        this.daysUnitLabel.innerText =
            days === 1
                ? window.auroraThemeLocales.countdownTimerString.day
                : window.auroraThemeLocales.countdownTimerString.days;
        this.hoursUnitLabel.innerText =
            hours === 1
                ? window.auroraThemeLocales.countdownTimerString.hour
                : window.auroraThemeLocales.countdownTimerString.hours;
        this.minutesUnitLabel.innerText =
            minutes === 1
                ? window.auroraThemeLocales.countdownTimerString.minute
                : window.auroraThemeLocales.countdownTimerString.minutes;
        this.secondsUnitLabel.innerText =
            seconds === 1
                ? window.auroraThemeLocales.countdownTimerString.second
                : window.auroraThemeLocales.countdownTimerString.seconds;
    }
    tick() {
        const diff = this.endDate.getTime() - new Date().getTime();
        if (diff > 0) {
            this.show();
            this.renderTime(Math.floor(diff / (1000 * 60 * 60 * 24)), Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)), Math.floor((diff % (1000 * 60)) / 1000));
            return;
        }
        this.renderTime(0, 0, 0, 0);
        this.finish();
        if (window.Shopify.designMode) {
            this.show();
        }
    }
    show() {
        (0, dom_1.showElement)(this);
        if (this.dataset.blockId) {
            (0, dom_1.showElement)((0, utils_1.$el)(`.block-${this.dataset.blockId}`));
        }
    }
    hide() {
        if (window.Shopify.designMode) {
            return;
        }
        if (this.dataset.sectionId) {
            (0, dom_1.hideElement)((0, utils_1.$el)(`.section-${this.dataset.sectionId}`));
        }
        if (this.dataset.blockId) {
            (0, dom_1.hideElement)((0, utils_1.$el)(`.block-${this.dataset.blockId}`));
        }
        (0, dom_1.hideElement)(this);
    }
}
exports.CountdownTimer = CountdownTimer;


/***/ }),

/***/ 5950:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CountdownTimer = void 0;
var countdown_timer_1 = __webpack_require__(5177);
Object.defineProperty(exports, "CountdownTimer", ({ enumerable: true, get: function () { return countdown_timer_1.CountdownTimer; } }));


/***/ }),

/***/ 7921:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TimerStorage = void 0;
const STORAGE_KEY = 'AuroraTheme-Timer';
class TimerStorage {
    _blockId;
    constructor(blockId) {
        this._blockId = blockId;
    }
    parseData(data) {
        try {
            const obj = JSON.parse(data ?? '{}');
            if ('endDate' in obj && 'hash' in obj) {
                return {
                    endDate: new Date(+obj.endDate),
                    hash: obj.hash,
                };
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    saveData(data) {
        try {
            localStorage.setItem(`${STORAGE_KEY}-${this._blockId}`, JSON.stringify({ endDate: data.endDate.getTime(), hash: data.hash }));
        }
        catch (e) { }
    }
    loadData() {
        try {
            return this.parseData(localStorage.getItem(`${STORAGE_KEY}-${this._blockId}`));
        }
        catch (e) {
            return null;
        }
    }
}
exports.TimerStorage = TimerStorage;


/***/ }),

/***/ 1709:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TimerFinishStrategy = exports.TimerMode = void 0;
var TimerMode;
(function (TimerMode) {
    TimerMode["Fixed"] = "fixed";
    TimerMode["Evergreen"] = "evergreen";
})(TimerMode || (exports.TimerMode = TimerMode = {}));
var TimerFinishStrategy;
(function (TimerFinishStrategy) {
    TimerFinishStrategy["None"] = "none";
    TimerFinishStrategy["Hide"] = "hide";
    TimerFinishStrategy["Restart"] = "restart";
    TimerFinishStrategy["WaitOneDay"] = "wait_one_day";
})(TimerFinishStrategy || (exports.TimerFinishStrategy = TimerFinishStrategy = {}));


/***/ }),

/***/ 8745:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DeferredMedia = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const POSTER_SELECTOR = '[id^="Deferred-Poster-"]';
const CAROUSEL_SELECTOR = 'carousel-component';
const SLIDE_ATTRIBUTE = '[data-media-id]';
const AUTOPLAY_ATTRIBUTE = 'data-autoplay';
const CONTROLS_ATTRIBUTE = 'data-enable-controls';
class DeferredMedia extends base_component_1.BaseComponent {
    carousel;
    video;
    isTouched;
    mountComponent() {
        this.carousel = (0, utils_1.$elParent)(CAROUSEL_SELECTOR, this);
        this.carousel?.embla.on('settle', this.handleCarouselSettle);
        if (this.hasAttribute(AUTOPLAY_ATTRIBUTE)) {
            this.loadContent();
        }
        else {
            this.addListener(this, 'click', this.handlePosterClick);
        }
    }
    unmountComponent() {
        this.carousel?.embla.off('settle', this.handleCarouselSettle);
    }
    handleCarouselSettle = () => {
        if (this.video?.tagName === 'VIDEO') {
            const slide = (0, utils_1.$elParent)(SLIDE_ATTRIBUTE, this);
            const isSelected = slide.className.includes('is-selected');
            if (isSelected && this.isTouched) {
                return;
            }
            const withAutoplay = this.video.hasAttribute('autoplay');
            if (isSelected && withAutoplay) {
                this.video.play();
            }
            else if (!isSelected) {
                this.video.pause();
                this.isTouched = false;
            }
        }
    };
    handlePosterClick = (event) => {
        const poster = (0, utils_1.$elParent)(POSTER_SELECTOR, event.target);
        if (poster) {
            this.loadContent();
        }
    };
    handleUncontrolledVideoClick = () => {
        if (this.video.paused) {
            this.video.play();
        }
        else {
            this.video.pause();
        }
        this.isTouched = true;
    };
    loadContent() {
        if (!this.getAttribute('loaded')) {
            this.addVideo();
            this.setAttribute('loaded', 'true');
        }
    }
    removeVideo() {
        const video = (0, utils_1.$el)('video,  iframe', this);
        if (video) {
            video.remove();
            this.removeAttribute('loaded');
        }
    }
    addVideo() {
        const content = document.createElement('div');
        const template = (0, utils_1.$el)('template', this);
        const templateContent = template?.content;
        if (!templateContent || !templateContent.firstElementChild) {
            return;
        }
        const firstChild = templateContent.firstElementChild.cloneNode(true);
        content.appendChild(firstChild);
        const video = (0, utils_1.$el)('video, model-viewer, iframe', content);
        if (!video) {
            return;
        }
        this.appendChild(video);
        this.video = video;
        if (video.tagName === 'VIDEO') {
            this.video.play();
            if (!this.hasAttribute(CONTROLS_ATTRIBUTE)) {
                this.addListener(this, 'click', this.handleUncontrolledVideoClick);
            }
        }
    }
}
exports.DeferredMedia = DeferredMedia;


/***/ }),

/***/ 7230:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DeferredMedia = void 0;
var deffered_media_1 = __webpack_require__(8745);
Object.defineProperty(exports, "DeferredMedia", ({ enumerable: true, get: function () { return deffered_media_1.DeferredMedia; } }));


/***/ }),

/***/ 8510:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DropdownOpener = void 0;
const utils_1 = __webpack_require__(4083);
const key_1 = __webpack_require__(9650);
const base_component_1 = __webpack_require__(3608);
const HEADER_BUTTON_SELECTOR = 'data-header-btn-with-backdrop';
class DropdownOpener extends base_component_1.BaseComponent {
    hideTimeoutId;
    element;
    isHeaderBtn;
    floatElementId;
    constructor() {
        super();
        this.element = this.getElement();
        this.isHeaderBtn = this.hasAttribute(HEADER_BUTTON_SELECTOR);
        if (this.isHeaderBtn) {
            this.floatElementId = this.firstElementChild.getAttribute('data-float-element-trigger');
        }
    }
    mountComponent() {
        if (this.floatElement) {
            customElements.upgrade(this.floatElement); // https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/upgrade
            this.floatElement?.on('show', this.handleDropdownShow);
            this.floatElement?.on('hide', this.handleDropdownHide);
        }
        this.addListener(this.element, 'keydown', this.handleKeyDown);
        this.addListener(this.element, 'click', this.handleTrigger);
    }
    unmountComponent() {
        if (this.floatElement) {
            customElements.upgrade(this.floatElement); // https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/upgrade
            this.floatElement?.off('show', this.handleDropdownShow);
            this.floatElement?.off('hide', this.handleDropdownHide);
        }
        clearTimeout(this.hideTimeoutId);
        this.removeListener(this.element, 'blur', this.handleBlur);
    }
    handleBlur = () => {
        this.hideTimeoutId = setTimeout(() => {
            this.hideFloatElement();
        }, 0);
    };
    handleDropdownShow = () => {
        this.setTargetListeners('add');
    };
    handleDropdownHide = () => {
        this.setTargetListeners('remove');
        clearTimeout(this.hideTimeoutId);
    };
    handleKeyDown = (event) => {
        const { firstTarget } = this.getTargets();
        if ((0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            this.showFloatElement();
            this.addListener(this.element, 'blur', this.handleBlur);
        }
        if ((0, key_1.isTabKey)(event) &&
            firstTarget &&
            this.floatElement.isOpen &&
            !event.shiftKey) {
            event.preventDefault();
            firstTarget.focus();
            clearTimeout(this.hideTimeoutId);
        }
    };
    handleHeaderKeyDown = (event) => {
        if ((0, key_1.isEscKey)(event)) {
            event.preventDefault();
            this.floatElement.hide();
            this.emit('openerClickOutside', { element: this, opener: this });
            this.removeListener(window, 'keydown', this.handleHeaderKeyDown);
        }
    };
    handleFirstTargetFocus = () => { };
    handleTargetFocus = () => {
        clearTimeout(this.hideTimeoutId);
    };
    handleLastTargetBlur = () => {
        this.hideTimeoutId = setTimeout(() => {
            this.hideFloatElement();
            this.focus();
        }, 0);
    };
    hideFloatElement() {
        if (this.floatElement) {
            this.floatElement.hide();
        }
    }
    showFloatElement() {
        if (this.floatElement) {
            this.floatElement.show();
        }
    }
    handleTrigger = (event) => {
        event.preventDefault();
        this.trigger();
    };
    handleUntrigger = ({ clientX: x, clientY: y, target }) => {
        if (!this.floatElement ||
            (this.isHeaderBtn && target.closest(`[${HEADER_BUTTON_SELECTOR}]`))) {
            return;
        }
        let isToCloseDropDown;
        if (this.isHeaderBtn) {
            const isInside = target.closest('[data-header-float-element-template]');
            isToCloseDropDown = !isInside;
        }
        else {
            const isCursorOutside = this.floatElement.checkCursorOutside(x, y);
            const isOutsideFloatElements = this.isTargetOutsideFloatElements(target);
            isToCloseDropDown = isCursorOutside && isOutsideFloatElements;
        }
        if (isToCloseDropDown) {
            this.floatElement.hide();
            this.emit('openerClickOutside', { element: this, opener: this });
            this.removeListener(window, 'keydown', this.handleHeaderKeyDown);
        }
    };
    setTargetListeners(action) {
        const { targets, firstTarget, lastTarget } = this.getTargets();
        const listenerSetter = action === 'add' ? 'addListener' : 'removeListener';
        this[listenerSetter](firstTarget, 'focus', this.handleFirstTargetFocus);
        targets.forEach(target => this[listenerSetter](target, 'focus', this.handleTargetFocus));
        this[listenerSetter](lastTarget, 'blur', this.handleLastTargetBlur);
        this[listenerSetter](window, 'click', this.handleUntrigger);
    }
    getTargets() {
        if (!this.floatElement) {
            return;
        }
        const element = this.floatElement.element;
        const targets = (0, utils_1.$list)((0, utils_1.getFocusTargets)(), element);
        const firstTarget = targets[0];
        const lastTarget = targets[targets.length - 1];
        return { targets, firstTarget, lastTarget };
    }
    isTargetOutsideFloatElements(target) {
        if (!this.floatElement) {
            return;
        }
        const isInsideFloatElement = this.floatElement.contains(target);
        const isInsideFloatElementBtn = this.contains(target);
        return !isInsideFloatElement && !isInsideFloatElementBtn;
    }
    getElement() {
        return ((0, utils_1.$el)(`[data-float-element-trigger="${this.dataset.floatElementId}"]`, this) || this);
    }
    trigger = () => {
        if (!this.floatElement) {
            return;
        }
        this.floatElement.isOpen && !this.isHeaderBtn
            ? this.floatElement.hide()
            : this.floatElement.show();
        this.addListener(window, 'click', this.handleUntrigger);
        if (this.isHeaderBtn) {
            this.emit('openerClick', { element: this, opener: this });
            this.addListener(window, 'keydown', this.handleHeaderKeyDown);
        }
    };
    setExpand(isExpanded) {
        this.setAttribute('data-aria-expanded', isExpanded);
    }
    get floatElement() {
        return (0, utils_1.$el)(`#${this.dataset.floatElementId}`);
    }
}
exports.DropdownOpener = DropdownOpener;


/***/ }),

/***/ 3000:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FloatElementBtn = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const key_1 = __webpack_require__(9650);
const safe_polygon_1 = __webpack_require__(6709);
class FloatElementBtn extends base_component_1.BaseComponent {
    element;
    safePolygonFn;
    hideTimeoutId;
    constructor() {
        super();
        this.element = this.getElement();
    }
    mountComponent() {
        this.addListener(this.element, 'keydown', this.handleKeyDown);
        if (this.dataset.trigger === 'click') {
            this.addListener(window, 'click', this.handleWindowClick);
            this.addListener(this.element, 'click', this.handleElementClick);
        }
        else {
            this.addListener(this.element, 'mouseleave', this.handleMouseLeave);
            this.addListener(this.element, 'mouseenter', this.handleMouseEnter);
            this.addListener(this.element, 'touchend', this.handleTouchend);
        }
    }
    handleKeyDown = (event) => {
        const { firstTarget } = (0, utils_1.getTargets)(this.floatElement.element);
        if ((0, key_1.isTabKey)(event) && !event.shiftKey) {
            if (!this.isOpen) {
                event.preventDefault();
                this.floatElement.show();
            }
            if (firstTarget) {
                event.preventDefault();
                this.setTargetListeners('add');
                firstTarget.focus();
            }
            this.addListener(this.element, 'blur', this.handleBlur, { once: true });
        }
    };
    handleBlur = () => {
        this.hideTimeoutId = setTimeout(() => {
            this.hideFloatElement();
        }, 0);
    };
    handleFirstTargetFocus = () => { };
    handleTargetFocus = () => {
        clearTimeout(this.hideTimeoutId);
    };
    handleLastTargetBlur = ({ currentTarget }) => {
        this.emit('lastTargetBlured', { button: this });
        this.hideTimeoutId = setTimeout(() => {
            this.hideFloatElement();
        }, 0);
    };
    hideFloatElement() {
        this.setTargetListeners('remove');
        this.floatElement.hide();
    }
    handleMouseEnter = (event) => {
        event.stopPropagation();
        this.trigger();
    };
    handleElementClick = () => {
        this.trigger();
    };
    handleWindowClick = (event) => {
        const isCursorOutside = this.floatElement.checkCursorOutside(event.clientX, event.clientY);
        const isOutsideFloatElements = this.isTargetOutsideFloatElements(event.target);
        if (isCursorOutside && isOutsideFloatElements && this.floatElement.isOpen) {
            this.removeListener(window, 'click', this.handleWindowClick);
            this.floatElement.hide();
        }
    };
    handleMouseLeave = (event) => {
        if (this.safePolygonFn) {
            this.removeListener(window, 'mousemove', this.handleMouseMove);
        }
        this.safePolygonFn = (0, safe_polygon_1.safePolygon)()({
            x: event.clientX,
            y: event.clientY,
            placement: this.floatElement.dataset.placement,
            onClose: () => {
                this.removeListener(window, 'mousemove', this.handleMouseMove);
                if (this.floatElement && this.floatElement.isOpen) {
                    this.floatElement.hide();
                }
            },
            elements: { domReference: this.element, floating: this.floatElement },
            nodeId: null,
            tree: null,
        });
        this.safePolygonFn(event);
        this.addListener(window, 'mousemove', this.handleMouseMove);
    };
    handleMouseMove = (event) => {
        this.safePolygonFn(event);
    };
    handleTouchend = (event) => {
        if (!this.isOpen) {
            event.preventDefault();
            this.floatElement.show();
            this.addListener(window, 'click', this.handleWindowClick);
            (0, utils_1.$list)('[data-aria-expanded="true"]').forEach((btn) => {
                if (btn !== this) {
                    btn.floatElement.hide();
                }
            });
        }
    };
    setTargetListeners(action) {
        const { targets, firstTarget, lastTarget } = (0, utils_1.getTargets)(this.floatElement.element);
        const listenerSetter = action === 'add' ? 'addListener' : 'removeListener';
        this[listenerSetter](firstTarget, 'focus', this.handleFirstTargetFocus);
        targets.forEach(target => {
            this[listenerSetter](target, 'focus', this.handleTargetFocus);
        });
        this[listenerSetter](lastTarget, 'blur', this.handleLastTargetBlur);
        this[listenerSetter](window, 'click', this.handleWindowClick);
    }
    getElement() {
        return ((0, utils_1.$el)(`[data-float-element-trigger="${this.dataset.floatElementId}"]`, this) || this);
    }
    isTargetOutsideFloatElements(target) {
        return !this.floatElement.contains(target) && !this.contains(target);
    }
    trigger = () => {
        const triggerAction = this.dataset.trigger === 'click' ? 'click' : 'mouseenter';
        if (triggerAction === 'click') {
            this.floatElement.isOpen
                ? this.floatElement.hide()
                : this.floatElement.show();
            this.addListener(window, 'click', this.handleWindowClick);
        }
        else {
            this.floatElement.show();
            this.addListener(this.element, 'mouseleave', this.handleMouseLeave);
        }
    };
    setExpand(isExpanded) {
        this.setAttribute('data-aria-expanded', isExpanded);
    }
    get floatElement() {
        if (!this.dataset.floatElementId) {
            return;
        }
        return (0, utils_1.$el)(`#${this.dataset.floatElementId}`);
    }
    get isOpen() {
        return this.floatElement.isOpen;
    }
}
exports.FloatElementBtn = FloatElementBtn;


/***/ }),

/***/ 9448:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FloatElement = void 0;
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(5260);
const dom_2 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const key_1 = __webpack_require__(9650);
const ARROW_SELECTOR = '[data-float-element-arrow]';
const BODY_ELEMENT_SELECTOR = 'body-element';
class FloatElement extends base_component_1.BaseComponent {
    initialPlacement;
    element;
    arrow;
    removeUpdate = () => { };
    constructor() {
        super();
        this.element = (0, dom_2.getTemplateFirstChild)((0, utils_1.$el)(`[data-float-element-template="${this.id}"]`, this));
        this.arrow = (0, utils_1.$el)(ARROW_SELECTOR, this.element);
        this.initialPlacement = this.dataset.placement;
        if (this.hasAttribute('data-with-portal')) {
            (0, utils_1.createPortal)(this, document.body);
        }
    }
    mountComponent() {
        super.mountComponent();
        if (this.isEditor) {
            this.editor.on('BLOCK_SELECT', this.handleBlockSelect);
            this.editor.on('BLOCK_DESELECT', this.handleBlockDeselect);
        }
    }
    unmountComponent() {
        super.unmountComponent();
        if (this.isEditor) {
            this.editor.off('BLOCK_SELECT', this.handleBlockSelect);
            this.editor.off('BLOCK_DESELECT', this.handleBlockDeselect);
        }
    }
    handleDropdownKeyDown = (event) => {
        if ((0, key_1.isEscKey)(event)) {
            event.preventDefault();
            this.hide();
        }
    };
    handleScroll = () => {
        if (this.dataset.type === 'tooltip') {
            this.hide();
            this.removeListener(window, 'wheel', this.handleScroll);
        }
    };
    handleBlockSelect = ({ detail: { blockId, sectionId } }) => {
        if (this.dataset.sectionId === sectionId) {
            const target = (0, utils_1.$el)(`[block-id="${blockId}"]`, this.element);
            const isTarget = this.getAttribute('block-id') === blockId || target;
            const btn = (0, utils_1.$el)(`[data-float-element-id="${this.id}"], [data-tooltip-id="${this.id}"]`);
            if (!isTarget) {
                return;
            }
            if (btn) {
                btn.trigger();
            }
            else {
                this.hide();
            }
        }
    };
    handleBlockDeselect = ({ detail: { blockId, sectionId } }) => {
        if (this.dataset.sectionId === sectionId) {
            const target = (0, utils_1.$el)(`[block-id="${blockId}"]`, this.element);
            const isTarget = this.getAttribute('block-id') === blockId || target;
            if (!isTarget) {
                return;
            }
            this.hide();
        }
    };
    updatePosition({ x, y }) {
        Object.assign(this.style, {
            left: `${x}px`,
            top: `${y}px`,
        });
    }
    getOptions() {
        const middleware = [
            (0, dom_1.offset)({
                alignmentAxis: +(this.dataset.alignmentAxisOffset || 0),
                mainAxis: +(this.dataset.mainAxisOffset || 0),
            }),
            (0, dom_1.flip)(),
            (0, dom_1.shift)(),
        ];
        if (this.arrow) {
            middleware.push((0, dom_1.arrow)({ element: this.arrow }));
        }
        return {
            placement: this.dataset.placement,
            middleware: middleware,
            strategy: this.dataset.strategy || 'absolute',
        };
    }
    checkCursorOutside(x, y) {
        const mainAxisOffset = this.dataset.mainAxisOffset || 0;
        const offset = +mainAxisOffset;
        const interactiveBorder = 2;
        const boundaries = this.getBoundingClientRect();
        const exceedsTop = boundaries.top - (y + offset) > interactiveBorder;
        const exceedsBottom = y - boundaries.bottom - offset > interactiveBorder;
        const exceedsLeft = boundaries.left - (x + offset) > interactiveBorder;
        const exceedsRight = x - boundaries.right - offset > interactiveBorder;
        return exceedsTop || exceedsBottom || exceedsLeft || exceedsRight;
    }
    updateArrow({ placement, middlewareData }) {
        if (!this.arrow) {
            return;
        }
        const { x: arrowX, y: arrowY } = middlewareData.arrow;
        const staticSide = {
            top: 'bottom',
            right: 'left',
            bottom: 'top',
            left: 'right',
        }[placement.split('-')[0]];
        Object.assign(this.arrow.style, {
            left: arrowX != null ? `${arrowX}px` : '',
            top: arrowY != null ? `${arrowY}px` : '',
            right: '',
            bottom: '',
            [staticSide]: '-5px',
        });
    }
    mount() {
        this.replaceChildren(this.element);
        this.setUpdate();
    }
    unmount() {
        this.removeUpdate();
        this.replaceChildren();
    }
    show = async () => {
        const bodyElement = (0, utils_1.$el)(BODY_ELEMENT_SELECTOR);
        if (this.dataset.type === 'tooltip' && bodyElement.isScrolling) {
            return;
        }
        this.mount();
        this.setVisible(true);
        await (0, utils_1.transitionToPromise)(this);
        const videos = (0, utils_1.$list)('lazy-video', this);
        videos.forEach(video => {
            video.initVideo();
        });
        this.addListener(window, 'wheel', this.handleScroll);
        this.addListener(window, 'keydown', this.handleDropdownKeyDown);
        this.emit('show', { element: this.element });
    };
    hide = async () => {
        this.setVisible(false);
        await (0, utils_1.transitionToPromise)(this);
        if (!this.isOpen) {
            this.removeListener(window, 'wheel', this.handleScroll);
            this.removeListener(window, 'keydown', this.handleDropdownKeyDown);
            this.dataset.placement = this.initialPlacement;
            this.unmount();
            this.emit('hide', { element: this.element });
        }
    };
    setUpdate() {
        const btn = (0, utils_1.$el)(`[data-float-element-id="${this.id}"], [data-tooltip-id="${this.id}"]`);
        const floatElement = (0, utils_1.$el)(`#${this.dataset.floatingElementId}`) || btn;
        if (!floatElement) {
            return;
        }
        this.removeUpdate = (0, dom_1.autoUpdate)(floatElement, this, () => {
            (0, dom_1.computePosition)(floatElement, this, this.getOptions()).then(data => {
                if (this.dataset.placement !== data.placement) {
                    this.dataset.placement = data.placement;
                }
                this.updatePosition(data);
                if (this.arrow) {
                    this.updateArrow(data);
                }
            });
        });
    }
    setVisible(isVisible) {
        const bodyElement = (0, utils_1.$el)(BODY_ELEMENT_SELECTOR);
        this.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
        this.setBtnExpand(isVisible);
        if (this.hasAttribute('data-with-overlay')) {
            (0, utils_1.whenDefined)('body-element').then(() => {
                this.isOpen
                    ? bodyElement.showOverlay(this.id, {})
                    : bodyElement.hideOverlay(this.id);
            });
        }
    }
    setBtnExpand = isVisible => {
        const btn = (0, utils_1.$el)(`[data-float-element-id="${this.id}"], [data-tooltip-id="${this.id}"]`);
        if (btn) {
            btn.setExpand(isVisible);
        }
    };
    get isOpen() {
        return this.getAttribute('aria-hidden') === 'false';
    }
}
exports.FloatElement = FloatElement;


/***/ }),

/***/ 4732:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HeaderFloatElementBtn = void 0;
const utils_1 = __webpack_require__(4083);
const _1 = __webpack_require__(1279);
const key_1 = __webpack_require__(9650);
class HeaderFloatElementBtn extends _1.FloatElementBtn {
    floatElementContainerId;
    floatElementId;
    isFocused;
    isTouched;
    constructor() {
        super();
        this.floatElementContainerId = this.dataset.floatElementId;
        this.element = this.firstElementChild;
        this.floatElementId = this.element.dataset.headerFloatElementTrigger;
        this.addListener(this.element, 'touchend', this.handleTouchend);
    }
    handleTouchend = (event) => {
        if (!this.isOpen) {
            this.addListener(document, 'touchend', this.handleWindowClick);
            (0, utils_1.$list)('[data-aria-expanded="true"]').forEach((btn) => {
                if (btn !== this) {
                    btn.floatElement.hide();
                }
            });
        }
        if (!this.isTouched) {
            event.preventDefault();
            this.header.handleButtonHover(this);
            this.setExpand(true);
            this.isTouched = true;
        }
    };
    handleWindowClick = ({ target }) => {
        const isMenu = target.closest('.header__dropdown-menu');
        if (isMenu) {
            return;
        }
        const isButton = target.closest('header-float-element-btn');
        if (isButton !== this) {
            this.isTouched = false;
        }
        if (!isButton) {
            this.header.handleMouseLeave();
            this.setExpand(false);
            this.removeListener(document, 'touchend', this.handleWindowClick);
            this.isTouched = false;
        }
    };
    handleMouseLeave = (event) => {
        event.stopPropagation();
    };
    handleMouseEnter = (event) => {
        event.stopPropagation();
    };
    handleKeyDown = (event) => {
        if ((0, key_1.isTabKey)(event) && !event.shiftKey) {
            event.preventDefault();
            this.emit('focused', { button: this });
            if (!this.isOpen) {
                const header = this.closest('header-component');
                header.handleButtonHover(this);
                this.setExpand(true);
                return;
            }
            const { targets, lastTarget } = (0, utils_1.getTargets)(this.floatElement.currentVisible, false);
            const firstTarget = targets.find(el => !el.hasAttribute('disabled'));
            if (firstTarget && !this.isFocused) {
                this.addListener(lastTarget, 'blur', this.handleLastTargetBlur);
                firstTarget.focus();
                this.isFocused = true;
            }
        }
    };
    handleLastTargetBlur = ({ currentTarget }) => {
        const header = this.closest('header-component');
        header.handleMouseLeave();
        let nextToFocus;
        if (this.hasAttribute('data-is-last-menu-item')) {
            nextToFocus = (0, utils_1.getTargets)(header.navContainer.nextElementSibling).firstTarget;
        }
        else {
            nextToFocus = this.nextElementSibling?.hasAttribute('href')
                ? this.nextElementSibling
                : this.nextElementSibling.firstElementChild;
        }
        nextToFocus?.focus();
        this.setExpand(false);
        this.isFocused = false;
        this.removeListener(currentTarget, 'blur', this.handleLastTargetBlur);
    };
    handleBlur = () => {
        this.emit('blured', { button: this });
    };
    trigger = () => { };
    setExpand(isExpanded) {
        this.setAttribute('data-aria-expanded', isExpanded);
    }
    get isOpen() {
        return this.dataset.ariaExpanded === 'true';
    }
    get header() {
        return this.closest('header-component');
    }
}
exports.HeaderFloatElementBtn = HeaderFloatElementBtn;


/***/ }),

/***/ 6308:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HeaderFloatElement = void 0;
const dom_1 = __webpack_require__(3889);
const _1 = __webpack_require__(1279);
const utils_1 = __webpack_require__(4083);
const debounce_1 = __webpack_require__(2731);
const key_1 = __webpack_require__(9650);
const BODY_ELEMENT_SELECTOR = 'body-element';
class HeaderFloatElement extends _1.FloatElement {
    currentVisible;
    mounted;
    constructor() {
        super();
        const templates = (0, utils_1.$list)('template', this);
        const fragment = document.createDocumentFragment();
        templates.forEach(template => {
            const content = (0, dom_1.getTemplateFirstChild)(template);
            content.setAttribute('data-header-float-element-template', template.dataset.headerFloatElementTemplate);
            content.setAttribute('inert', '');
            fragment.appendChild(content);
        });
        this.element = fragment;
        this.mounted = false;
        this.initialPlacement = this.dataset.placement;
    }
    mountComponent() {
        super.mountComponent();
        const header = (0, utils_1.$el)('header-component');
        customElements.whenDefined('header-component').then(() => {
            header.on('headerButtonHover', this.handleButtonHover);
            header.on('mouseLeavedHeader', this.handleMouseLeave);
        });
    }
    unmountComponent() {
        super.unmountComponent();
    }
    handleMouseLeave = () => {
        if (!this.isOpen) {
            this.hide();
            this.toggleVideos(false);
        }
    };
    handleButtonHover = ({ floatElementId }) => {
        this.toggleElementVisible(floatElementId);
        this.show();
        this.toggleVideos(true);
    };
    toggleVideos = isToPlay => {
        const videos = (0, utils_1.$list)('video', this);
        videos.forEach(video => {
            isToPlay ? video.play() : video.pause();
        });
    };
    toggleElementVisible = floatElementId => {
        if (this.currentVisible) {
            this.currentVisible.removeAttribute('visible');
            this.currentVisible.setAttribute('inert', '');
        }
        const parent = this.mounted ? this : this.element;
        const visible = parent.querySelector(`[data-header-float-element-template=${floatElementId}]`);
        visible.removeAttribute('inert');
        visible.setAttribute('visible', '');
        this.currentVisible = visible;
        this.emit('dropDownVisible', { el: this.currentVisible });
    };
    setVisible(isVisible) {
        const bodyElement = (0, utils_1.$el)(BODY_ELEMENT_SELECTOR);
        this.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
        const styles = {
            zIndex: 2,
        };
        isVisible
            ? bodyElement.showOverlay(this.id, styles)
            : bodyElement.hideOverlay(this.id);
    }
    mount() {
        if (!this.mounted) {
            this.replaceChildren(this.element);
        }
        this.setUpdate();
        this.mounted = true;
    }
    unmount() {
        this.removeUpdate();
    }
    handleDropdownKeyDown = (event) => {
        if ((0, key_1.isEscKey)(event)) {
            event.preventDefault();
        }
    };
    setBtnExpand = isVisible => { };
    handleBlockSelect = (0, debounce_1.debounce)(({ detail: { blockId, sectionId } }) => {
        if (this.dataset.sectionId === sectionId) {
            if (!this.header.navContainer ||
                this.header.navContainer.hasAttribute('hidden')) {
                return;
            }
            const target = this.getTargetWhenBlockChange(blockId);
            if (!target) {
                this.header.handleMouseLeave();
                return;
            }
            const floatElementId = target.getAttribute('data-header-float-element-template');
            const buttons = (0, utils_1.$list)('[data-header-btn-with-backdrop]');
            const targetButton = buttons.find((btn) => {
                if (btn.floatElementId) {
                    return btn.floatElementId === floatElementId;
                }
                else {
                    const btnFloatElementId = btn.firstElementChild.getAttribute('data-float-element-trigger');
                    return btnFloatElementId === floatElementId;
                }
            });
            this.header.blockInEditorSelected = true;
            this.header.handleButtonHover(targetButton);
            this.addListener(document, 'click', this.handleOutsideClick);
        }
    }, 50);
    handleBlockDeselect = (0, debounce_1.debounce)(({ detail: { blockId, sectionId } }) => {
        if (this.dataset.sectionId === sectionId) {
            if (!this.header.navContainer ||
                this.header.navContainer.hasAttribute('hidden')) {
                return;
            }
            const target = this.getTargetWhenBlockChange(blockId);
            if (target === this.currentVisible) {
                this.header.blockInEditorSelected = false;
                this.header.handleMouseLeave();
                this.removeListener(document, 'click', this.handleOutsideClick);
            }
        }
    }, 100);
    getTargetWhenBlockChange = blockId => {
        const parent = this.mounted ? this : this.element;
        const target = (0, utils_1.$el)(`[block-id="${blockId}"]`, parent);
        return target;
    };
    handleOutsideClick = ({ clientY, clientX }) => {
        const target = document.elementFromPoint(clientX, clientY);
        const bodyElement = (0, utils_1.$el)(BODY_ELEMENT_SELECTOR);
        if (target === bodyElement) {
            this.header.blockInEditorSelected = false;
            this.header.handleMouseLeave();
            this.removeListener(document, 'click', this.handleOutsideClick);
        }
    };
    get isOpen() {
        return this.parentElement.hasAttribute('with-opened-dropdown');
    }
    get header() {
        return (0, utils_1.$el)('header-component');
    }
}
exports.HeaderFloatElement = HeaderFloatElement;


/***/ }),

/***/ 1279:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TooltipTrigger = exports.FloatElementBtn = exports.FloatElement = exports.DropdownOpener = void 0;
var dropdown_opener_1 = __webpack_require__(8510);
Object.defineProperty(exports, "DropdownOpener", ({ enumerable: true, get: function () { return dropdown_opener_1.DropdownOpener; } }));
var float_element_1 = __webpack_require__(9448);
Object.defineProperty(exports, "FloatElement", ({ enumerable: true, get: function () { return float_element_1.FloatElement; } }));
var float_element_btn_1 = __webpack_require__(3000);
Object.defineProperty(exports, "FloatElementBtn", ({ enumerable: true, get: function () { return float_element_btn_1.FloatElementBtn; } }));
var tooltip_trigger_1 = __webpack_require__(3254);
Object.defineProperty(exports, "TooltipTrigger", ({ enumerable: true, get: function () { return tooltip_trigger_1.TooltipTrigger; } }));


/***/ }),

/***/ 6709:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.safePolygon = exports.getTarget = exports.destroyPolygon = exports.getChildren = void 0;
const utils_1 = __webpack_require__(4083);
function getChildren(nodes, id) {
    let allChildren = nodes.filter(node => node.parentId === id && node.context?.open);
    let currentChildren = allChildren;
    while (currentChildren.length) {
        currentChildren = nodes.filter(node => currentChildren?.some(n => node.parentId === n.id && node.context?.open));
        allChildren = allChildren.concat(currentChildren);
    }
    return allChildren;
}
exports.getChildren = getChildren;
function isPointInPolygon(point, polygon) {
    const [x, y] = point;
    let isInside = false;
    const length = polygon.length;
    for (let i = 0, j = length - 1; i < length; j = i++) {
        const [xi, yi] = polygon[i] || [0, 0];
        const [xj, yj] = polygon[j] || [0, 0];
        const intersect = yi >= y !== yj >= y && x <= ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) {
            isInside = !isInside;
        }
    }
    return isInside;
}
function isInside(point, rect) {
    return (point[0] >= rect.x &&
        point[0] <= rect.x + rect.width &&
        point[1] >= rect.y &&
        point[1] <= rect.y + rect.height);
}
const contains = (parent, child) => {
    if (!parent || !child) {
        return false;
    }
    return parent.contains(child);
};
const isElement = value => {
    return value
        ? value instanceof (document.defaultView || window).Element
        : false;
};
const destroyPolygon = polygonRef => {
    if (polygonRef.current) {
        polygonRef.current.remove();
        polygonRef.current = null;
    }
};
exports.destroyPolygon = destroyPolygon;
function getTarget(event) {
    if ('composedPath' in event) {
        return event.composedPath()[0];
    }
    // TS thinks `event` is of type never as it assumes all browsers support
    // `composedPath()`, but browsers without shadow DOM don't.
    return event.target;
}
exports.getTarget = getTarget;
const safePolygon = () => {
    const restMs = 0;
    const buffer = 0.5;
    const blockPointerEvents = false;
    let timeoutId;
    let hasLanded = false;
    let lastX = null;
    let lastY = null;
    let lastCursorTime = performance.now();
    const requireIntent = true;
    function getCursorSpeed(x, y) {
        const currentTime = performance.now();
        const elapsedTime = currentTime - lastCursorTime;
        if (lastX === null || lastY === null || elapsedTime === 0) {
            lastX = x;
            lastY = y;
            lastCursorTime = currentTime;
            return null;
        }
        const deltaX = x - lastX;
        const deltaY = y - lastY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const speed = distance / elapsedTime; // px / ms
        lastX = x;
        lastY = y;
        lastCursorTime = currentTime;
        return speed;
    }
    const fn = ({ x, y, placement, elements, onClose, nodeId, tree }) => {
        return function onMouseMove(event) {
            function close() {
                clearTimeout(timeoutId);
                onClose();
            }
            clearTimeout(timeoutId);
            if (!elements.domReference ||
                !elements.floating ||
                placement == null ||
                x == null ||
                y == null) {
                return;
            }
            const { clientX, clientY } = event;
            const clientPoint = [clientX, clientY];
            const target = getTarget(event);
            const isLeave = event.type === 'mouseleave';
            const isOverFloatingEl = contains(elements.floating, target);
            const isOverReferenceEl = contains(elements.domReference, target);
            const refRect = elements.domReference.getBoundingClientRect();
            const rect = elements.floating.getBoundingClientRect();
            const side = placement.split('-')[0];
            const cursorLeaveFromRight = x > rect.right - rect.width / 2;
            const cursorLeaveFromBottom = y > rect.bottom - rect.height / 2;
            const isOverReferenceRect = isInside(clientPoint, refRect);
            const isFloatingWider = rect.width > refRect.width;
            const isFloatingTaller = rect.height > refRect.height;
            const left = (isFloatingWider ? refRect : rect).left;
            const right = (isFloatingWider ? refRect : rect).right;
            const top = (isFloatingTaller ? refRect : rect).top;
            const bottom = (isFloatingTaller ? refRect : rect).bottom;
            if (isOverFloatingEl) {
                hasLanded = true;
                if (!isLeave) {
                    return;
                }
            }
            if (isOverReferenceEl) {
                hasLanded = false;
            }
            if (isOverReferenceEl && !isLeave) {
                hasLanded = true;
                return;
            }
            // Prevent overlapping floating element from being stuck in an open-close
            // loop: https://github.com/floating-ui/floating-ui/issues/1910
            if (isLeave &&
                isElement(event.relatedTarget) &&
                contains(elements.floating, event.relatedTarget)) {
                return;
            }
            // If any nested child is open, abort.
            // if (
            //   tree &&
            //   getChildren(tree.nodesRef.current, nodeId).some(
            //     ({ context }) => context?.open,
            //   )
            // ) {
            //   return
            // }
            const hasOpenedChildren = (0, utils_1.$el)('float-element[aria-hidden="false"]', elements.floating);
            if (hasOpenedChildren) {
                return;
            }
            // If the pointer is leaving from the opposite side, the "buffer" logic
            // creates a point where the floating element remains open, but should be
            // ignored.
            // A constant of 1 handles floating point rounding errors.
            if ((side === 'top' && y >= refRect.bottom - 1) ||
                (side === 'bottom' && y <= refRect.top + 1) ||
                (side === 'left' && x >= refRect.right - 1) ||
                (side === 'right' && x <= refRect.left + 1)) {
                return close();
            }
            // Ignore when the cursor is within the rectangular trough between the
            // two elements. Since the triangle is created from the cursor point,
            // which can start beyond the ref element's edge, traversing back and
            // forth from the ref to the floating element can cause it to close. This
            // ensures it always remains open in that case.
            let rectPoly = [];
            switch (side) {
                case 'top':
                    rectPoly = [
                        [left, refRect.top + 1],
                        [left, rect.bottom - 1],
                        [right, rect.bottom - 1],
                        [right, refRect.top + 1],
                    ];
                    break;
                case 'bottom':
                    rectPoly = [
                        [left, rect.top + 1],
                        [left, refRect.bottom - 1],
                        [right, refRect.bottom - 1],
                        [right, rect.top + 1],
                    ];
                    break;
                case 'left':
                    rectPoly = [
                        [rect.right - 1, bottom],
                        [rect.right - 1, top],
                        [refRect.left + 1, top],
                        [refRect.left + 1, bottom],
                    ];
                    break;
                case 'right':
                    rectPoly = [
                        [refRect.right - 1, bottom],
                        [refRect.right - 1, top],
                        [rect.left + 1, top],
                        [rect.left + 1, bottom],
                    ];
                    break;
            }
            function getPolygon([x, y]) {
                switch (side) {
                    case 'top': {
                        const cursorPointOne = [
                            isFloatingWider
                                ? x + buffer / 2
                                : cursorLeaveFromRight
                                    ? x + buffer * 4
                                    : x - buffer * 4,
                            y + buffer + 1,
                        ];
                        const cursorPointTwo = [
                            isFloatingWider
                                ? x - buffer / 2
                                : cursorLeaveFromRight
                                    ? x + buffer * 4
                                    : x - buffer * 4,
                            y + buffer + 1,
                        ];
                        const commonPoints = [
                            [
                                rect.left,
                                cursorLeaveFromRight
                                    ? rect.bottom - buffer
                                    : isFloatingWider
                                        ? rect.bottom - buffer
                                        : rect.top,
                            ],
                            [
                                rect.right,
                                cursorLeaveFromRight
                                    ? isFloatingWider
                                        ? rect.bottom - buffer
                                        : rect.top
                                    : rect.bottom - buffer,
                            ],
                        ];
                        return [cursorPointOne, cursorPointTwo, ...commonPoints];
                    }
                    case 'bottom': {
                        const cursorPointOne = [
                            isFloatingWider
                                ? x + buffer / 2
                                : cursorLeaveFromRight
                                    ? x + buffer * 4
                                    : x - buffer * 4,
                            y - buffer,
                        ];
                        const cursorPointTwo = [
                            isFloatingWider
                                ? x - buffer / 2
                                : cursorLeaveFromRight
                                    ? x + buffer * 4
                                    : x - buffer * 4,
                            y - buffer,
                        ];
                        const commonPoints = [
                            [
                                rect.left,
                                cursorLeaveFromRight
                                    ? rect.top + buffer
                                    : isFloatingWider
                                        ? rect.top + buffer
                                        : rect.bottom,
                            ],
                            [
                                rect.right,
                                cursorLeaveFromRight
                                    ? isFloatingWider
                                        ? rect.top + buffer
                                        : rect.bottom
                                    : rect.top + buffer,
                            ],
                        ];
                        return [cursorPointOne, cursorPointTwo, ...commonPoints];
                    }
                    case 'left': {
                        const cursorPointOne = [
                            x + buffer + 1,
                            isFloatingTaller
                                ? y + buffer / 2
                                : cursorLeaveFromBottom
                                    ? y + buffer * 4
                                    : y - buffer * 4,
                        ];
                        const cursorPointTwo = [
                            x + buffer + 1,
                            isFloatingTaller
                                ? y - buffer / 2
                                : cursorLeaveFromBottom
                                    ? y + buffer * 4
                                    : y - buffer * 4,
                        ];
                        const commonPoints = [
                            [
                                cursorLeaveFromBottom
                                    ? rect.right - buffer
                                    : isFloatingTaller
                                        ? rect.right - buffer
                                        : rect.left,
                                rect.top,
                            ],
                            [
                                cursorLeaveFromBottom
                                    ? isFloatingTaller
                                        ? rect.right - buffer
                                        : rect.left
                                    : rect.right - buffer,
                                rect.bottom,
                            ],
                        ];
                        return [...commonPoints, cursorPointOne, cursorPointTwo];
                    }
                    case 'right': {
                        const cursorPointOne = [
                            x - buffer,
                            isFloatingTaller
                                ? y + buffer / 2
                                : cursorLeaveFromBottom
                                    ? y + buffer * 4
                                    : y - buffer * 4,
                        ];
                        const cursorPointTwo = [
                            x - buffer,
                            isFloatingTaller
                                ? y - buffer / 2
                                : cursorLeaveFromBottom
                                    ? y + buffer * 4
                                    : y - buffer * 4,
                        ];
                        const commonPoints = [
                            [
                                cursorLeaveFromBottom
                                    ? rect.left + buffer
                                    : isFloatingTaller
                                        ? rect.left + buffer
                                        : rect.right,
                                rect.top,
                            ],
                            [
                                cursorLeaveFromBottom
                                    ? isFloatingTaller
                                        ? rect.left + buffer
                                        : rect.right
                                    : rect.left + buffer,
                                rect.bottom,
                            ],
                        ];
                        return [cursorPointOne, cursorPointTwo, ...commonPoints];
                    }
                }
            }
            if (isPointInPolygon([clientX, clientY], rectPoly)) {
                return;
            }
            if (hasLanded && !isOverReferenceRect) {
                return close();
            }
            if (!isLeave && requireIntent) {
                const cursorSpeed = getCursorSpeed(event.clientX, event.clientY);
                const cursorSpeedThreshold = 0.1;
                if (cursorSpeed !== null && cursorSpeed < cursorSpeedThreshold) {
                    return close();
                }
            }
            if (!isPointInPolygon([clientX, clientY], getPolygon([x, y]))) {
                close();
            }
            else if (!hasLanded && requireIntent) {
                timeoutId = window.setTimeout(close, 40);
            }
        };
    };
    return fn;
};
exports.safePolygon = safePolygon;


/***/ }),

/***/ 3254:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TooltipTrigger = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
class TooltipTrigger extends base_component_1.BaseComponent {
    mountComponent() {
        this.addListener(this, 'mouseenter', this.handleMouseEnter);
        this.addListener(this, 'mouseleave', this.handleMouseLeave);
    }
    handleMouseEnter = () => {
        const floatElement = (0, utils_1.$el)(`#${this.dataset.floatElementId}`);
        floatElement?.show();
    };
    handleMouseLeave = () => {
        const floatElement = (0, utils_1.$el)(`#${this.dataset.floatElementId}`);
        floatElement?.hide();
    };
    setExpand(isExpanded) {
        this.setAttribute('data-aria-expanded', isExpanded ? 'true' : 'false');
    }
}
exports.TooltipTrigger = TooltipTrigger;


/***/ }),

/***/ 9099:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FreeShippingBar = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const PROGRESS_BAR_DOTS = '[data-free-shipping-progress-bar-dots]';
const MESSAGE_NODE_SELECTOR = '[data-free-shipping-bar-message]';
const DIFFERENCE_ATTRIBUTE = 'data-free-shipping-difference';
const DIFFERENCE_PERCENT_ATTRIBUTE = 'data-free-shipping-difference-percent';
const PROGRESS_MESSAGE_ATTRIBUTE = 'data-progress-message';
const ACHIEVED_MESSAGE_ATTRIBUTE = 'data-achieved-message';
class FreeShippingBar extends base_component_1.BaseComponent {
    constructor() {
        super();
        this.updateProgressByDifference(this.getAttribute(DIFFERENCE_ATTRIBUTE), +this.getAttribute(DIFFERENCE_PERCENT_ATTRIBUTE));
    }
    updateProgressByDifference(difference, differencePercent) {
        const progressMessage = this.getAttribute(PROGRESS_MESSAGE_ATTRIBUTE) ?? '';
        const achievedMessage = this.getAttribute(ACHIEVED_MESSAGE_ATTRIBUTE) ?? '';
        if (differencePercent < 100) {
            this.setText(progressMessage.replace('[value]', difference));
            this.setProgress(differencePercent);
        }
        else {
            this.setText(achievedMessage);
            this.setProgress(100);
        }
    }
    setProgress = (value) => {
        const dots = (0, utils_1.$el)(PROGRESS_BAR_DOTS, this);
        if (dots) {
            dots.setAttribute('style', `--gsc-freeshipping-bar-percent: ${value}%`);
        }
    };
    setText = (text) => {
        const messageNode = (0, utils_1.$el)(MESSAGE_NODE_SELECTOR, this);
        messageNode?.replaceChildren(text);
    };
}
exports.FreeShippingBar = FreeShippingBar;


/***/ }),

/***/ 8430:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FreeShippingBar = void 0;
var free_shipping_bar_1 = __webpack_require__(9099);
Object.defineProperty(exports, "FreeShippingBar", ({ enumerable: true, get: function () { return free_shipping_bar_1.FreeShippingBar; } }));


/***/ }),

/***/ 1027:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SearchField = exports.PasswordField = void 0;
var password_input_1 = __webpack_require__(2710);
Object.defineProperty(exports, "PasswordField", ({ enumerable: true, get: function () { return password_input_1.PasswordField; } }));
var search_input_1 = __webpack_require__(3820);
Object.defineProperty(exports, "SearchField", ({ enumerable: true, get: function () { return search_input_1.SearchField; } }));


/***/ }),

/***/ 2710:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PasswordField = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const INPUT_SELECTOR = `[data-password-field-input]`;
const BUTTON_SELECTOR = `[data-password-field-button]`;
class PasswordField extends base_component_1.BaseComponent {
    mountComponent() {
        const button = (0, utils_1.$el)(BUTTON_SELECTOR, this);
        this.addListener(button, 'click', this.handleButtonClick);
    }
    handleButtonClick = (event) => {
        event.preventDefault();
        this.togglePasswordVisible();
    };
    togglePasswordVisible() {
        const input = (0, utils_1.$el)(INPUT_SELECTOR, this);
        if (input) {
            const isHidden = input.getAttribute('type') === 'password';
            input.setAttribute('type', isHidden ? 'text' : 'password');
            this.setHiddenButton(isHidden);
        }
    }
    setHiddenButton(isHidden) {
        const button = (0, utils_1.$el)(BUTTON_SELECTOR, this);
        button?.toggleAttribute('password-visible', isHidden);
    }
}
exports.PasswordField = PasswordField;


/***/ }),

/***/ 3820:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SearchField = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const INPUT_SELECTOR = `[data-search-field-input]`;
const RESET_BTN_SELECTOR = `[data-search-field-reset-button]`;
class SearchField extends base_component_1.BaseComponent {
    mountComponent() {
        const resetButton = (0, utils_1.$el)(RESET_BTN_SELECTOR, this);
        const input = (0, utils_1.$el)(INPUT_SELECTOR, this);
        this.addListener(input, 'input', this.handleInputChange);
        this.addListener(window, 'click', this.handleWindowClick);
        this.addListener(resetButton, 'click', this.handleResetButtonClick);
    }
    handleWindowClick = (event) => {
        const input = (0, utils_1.$el)(INPUT_SELECTOR, this);
        const target = event.target;
        const isInputChild = (0, utils_1.$elParent)('search-input', target);
        const isInput = input === target;
        if (!isInput && !isInputChild) {
            this.updateResetButtonVisible();
        }
    };
    handleInputChange = () => {
        this.updateResetButtonVisible();
    };
    handleResetButtonClick = (event) => {
        event.preventDefault();
        this.reset();
    };
    reset() {
        const input = (0, utils_1.$el)(INPUT_SELECTOR, this);
        if (input) {
            input.value = '';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.focus();
        }
    }
    updateResetButtonVisible() {
        const resetButton = (0, utils_1.$el)(RESET_BTN_SELECTOR, this);
        if (resetButton) {
            resetButton.classList.toggle('hidden', !this.hasInputValue());
        }
    }
    hasInputValue() {
        const input = (0, utils_1.$el)(INPUT_SELECTOR, this);
        return input ? input.value.trim().length > 0 : false;
    }
    get value() {
        const input = (0, utils_1.$el)(INPUT_SELECTOR, this);
        return input ? input.value : '';
    }
}
exports.SearchField = SearchField;


/***/ }),

/***/ 758:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LocalizationSelector = void 0;
var localization_selector_1 = __webpack_require__(9076);
Object.defineProperty(exports, "LocalizationSelector", ({ enumerable: true, get: function () { return localization_selector_1.LocalizationSelector; } }));


/***/ }),

/***/ 9076:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LocalizationSelector = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const INPUT_SELECTOR = `[data-localization-input]`;
const FORM_SELECTOR = 'form';
const SEARCH_FIELD_SELECTOR = '[data-localization-search-field]';
const COUNTRY_SELECTOR = 'data-country';
const RESET_BTN_SELECTOR = `[data-search-field-reset-button]`;
class LocalizationSelector extends base_component_1.BaseComponent {
    labels;
    resetButton;
    mountComponent() {
        this.addListener(this, 'click', this.handleClick);
        const searchField = (0, utils_1.$el)(SEARCH_FIELD_SELECTOR, this);
        if (searchField) {
            this.addListener(searchField, 'input', this.handleSearchInput);
            this.labels = (0, utils_1.$list)(`[${COUNTRY_SELECTOR}]`, this);
            this.resetButton = (0, utils_1.$el)(RESET_BTN_SELECTOR, this);
            this.addListener(this.resetButton, 'click', this.handleResetButtonClick);
        }
    }
    handleSearchInput = ({ target }) => {
        this.labels.forEach(label => {
            label.classList.toggle('hidden', !label
                .getAttribute(COUNTRY_SELECTOR)
                .toLowerCase()
                .startsWith(target.value.toLowerCase()));
        });
        this.resetButton.classList.toggle('hidden', !target.value.length);
    };
    handleResetButtonClick = () => {
        const input = (0, utils_1.$el)(SEARCH_FIELD_SELECTOR, this);
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
    };
    handleClick = (event) => {
        event.preventDefault();
        const target = event.target;
        const item = target.closest(`[data-localization-item]`);
        if (item) {
            const input = (0, utils_1.$el)(INPUT_SELECTOR, this);
            const form = (0, utils_1.$el)(FORM_SELECTOR, this);
            if (!input || !form || !item.dataset.value) {
                return;
            }
            input.value = item.dataset.value;
            form.submit();
            const floatElement = this.closest('float-element');
            floatElement.hide();
        }
    };
}
exports.LocalizationSelector = LocalizationSelector;


/***/ }),

/***/ 436:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MaxLinesComponent = void 0;
var max_lines_component_1 = __webpack_require__(7039);
Object.defineProperty(exports, "MaxLinesComponent", ({ enumerable: true, get: function () { return max_lines_component_1.MaxLinesComponent; } }));


/***/ }),

/***/ 7039:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MaxLinesComponent = void 0;
const base_component_1 = __webpack_require__(3608);
const debounce_1 = __webpack_require__(2731);
const utils_1 = __webpack_require__(4083);
const LINE_CLAMP_SELECTOR = '[data-quote-line-clamp]';
const TARGET_SELECTOR = '[data-quote-line-clamp-target]';
class MaxLinesComponent extends base_component_1.BaseComponent {
    resizeObserver;
    mountComponent() {
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(this);
    }
    unmountComponent() {
        this.resizeObserver.disconnect();
    }
    handleResize = (0, debounce_1.debounce)(() => {
        if (this.offsetHeight > 0) {
            this.update();
        }
    }, 100);
    update() {
        const lineClamp = (0, utils_1.$el)(LINE_CLAMP_SELECTOR, this);
        const target = (0, utils_1.$el)(TARGET_SELECTOR, this);
        if (!lineClamp || !target) {
            return;
        }
        const heightContainer = (0, utils_1.$el)('[data-quote-height]', this);
        const styles = getComputedStyle(target);
        const lineHeight = parseFloat(styles['lineHeight']);
        const height = lineClamp.offsetHeight;
        const containerHeight = heightContainer?.offsetHeight ?? height;
        const diff = (containerHeight - height) / lineHeight;
        let maxLines = Math.floor(height / lineHeight);
        if (diff > 2) {
            maxLines = Math.floor(containerHeight / lineHeight);
            lineClamp.style.maxHeight = `${containerHeight}px`;
        }
        target.style['-webkit-line-clamp'] = maxLines;
        target.style.height = `${maxLines * lineHeight}px`;
        this.setAttribute('data-line-clamp-setter-is-ready', '');
        this.emit('linesSetted', { target });
    }
}
exports.MaxLinesComponent = MaxLinesComponent;


/***/ }),

/***/ 1181:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ModalButton = exports.ModalComponent = void 0;
var modal_1 = __webpack_require__(2549);
Object.defineProperty(exports, "ModalComponent", ({ enumerable: true, get: function () { return modal_1.ModalComponent; } }));
var modal_button_1 = __webpack_require__(467);
Object.defineProperty(exports, "ModalButton", ({ enumerable: true, get: function () { return modal_button_1.ModalButton; } }));


/***/ }),

/***/ 467:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ModalButton = void 0;
const base_component_1 = __webpack_require__(3608);
const key_1 = __webpack_require__(9650);
const utils_1 = __webpack_require__(4083);
class ModalButton extends base_component_1.BaseComponent {
    mountComponent() {
        this.addListener(this, 'keydown', this.handleKeyDown);
        this.addListener(this, 'click', this.handleButtonClick);
    }
    handleButtonClick = (event) => {
        event.preventDefault();
        this.trigger();
    };
    handleKeyDown = (event) => {
        if ((0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            this.trigger();
        }
    };
    trigger() {
        const modal = (0, utils_1.$el)(this.dataset.modal, document);
        if (modal) {
            switch (this.dataset.action) {
                case 'close':
                    modal.hide();
                    return;
                case 'open':
                    modal.show();
                    return;
                case 'toggle':
                    modal.toggle();
                    return;
            }
        }
        this.emit('click', {});
    }
}
exports.ModalButton = ModalButton;


/***/ }),

/***/ 2549:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ModalComponent = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const key_1 = __webpack_require__(9650);
const dom_1 = __webpack_require__(3889);
const BODY_ELEMENT_SELECTOR = 'body-element';
class ModalComponent extends base_component_1.BaseComponent {
    element;
    isOpen;
    withOutsideClick;
    skipTransitionWait;
    constructor() {
        super();
        this.element = (0, dom_1.getTemplateFirstChild)((0, utils_1.$el)(`[data-modal-template="${this.id}"]`, this));
        this.withOutsideClick = this.hasAttribute('data-with-close-on-outside');
        this.skipTransitionWait = this.hasAttribute('data-skip-transition-wait');
    }
    mountComponent() {
        super.mountComponent();
        if (this.withOutsideClick) {
            this.addListener(window, 'click', this.handleOutsideClick);
        }
        if (this.isEditor) {
            if (!this.isSection) {
                this.hide(true);
            }
        }
    }
    handleModalFocusout = event => {
        const bodyElement = (0, utils_1.$el)(BODY_ELEMENT_SELECTOR);
        const focusTarget = event.relatedTarget;
        const isLastOpenedWindow = bodyElement.isLastOpenedWindow(this.id);
        const isfocusTargetOut = !focusTarget || !this.contains(focusTarget);
        if (isfocusTargetOut && isLastOpenedWindow && bodyElement.isUsingKeyboard) {
            const { firstTarget } = (0, utils_1.getTargets)(this.element);
            firstTarget.focus();
        }
    };
    handleKeydown = (event) => {
        if (!this.hasAttribute('data-ignore-esc-key') && (0, key_1.isEscKey)(event)) {
            event.preventDefault();
            this.hide();
        }
    };
    handleOutsideClick = (event) => {
        const isOverlay = (0, utils_1.$elParent)(BODY_ELEMENT_SELECTOR, event.target);
        if (isOverlay && this.isOpen) {
            this.hide();
        }
    };
    async show() {
        const bodyElement = (0, utils_1.$el)(BODY_ELEMENT_SELECTOR);
        (0, utils_1.whenDefined)('body-element').then(() => {
            bodyElement.addDialogWindow(this.id);
        });
        this.mount();
        await this.setOpenState(true);
        if (!this.skipTransitionWait) {
            await (0, utils_1.transitionToPromise)(this);
        }
        const videos = (0, utils_1.$list)('video[autoplay]', this.element);
        videos?.forEach(video => {
            video.play();
        });
        if (window.self === window.top) {
            const { firstTarget } = (0, utils_1.getTargets)(this.element);
            firstTarget?.focus();
        }
        this.addListener(this, 'focusout', this.handleModalFocusout);
        this.addListener(window, 'keydown', this.handleKeydown);
        this.emit('show', {});
    }
    async hide(isInstant) {
        const bodyElement = (0, utils_1.$el)(BODY_ELEMENT_SELECTOR);
        (0, utils_1.whenDefined)('body-element').then(() => {
            bodyElement.removeDialogWindow(this.id);
        });
        this.removeListener(window, 'keydown', this.handleKeydown);
        this.removeListener(this, 'focusout', this.handleModalFocusout);
        await this.setOpenState(false);
        if (this.skipTransitionWait || isInstant) {
            this.unmount();
        }
        else {
            await (0, utils_1.transitionToPromise)(this);
            this.unmount();
        }
        this.emit('hide', {});
    }
    async toggle() {
        if (this.isOpen) {
            this.hide();
        }
        else {
            this.show();
        }
    }
    mount() {
        this.replaceChildren(this.element);
    }
    unmount() {
        this.replaceChildren();
    }
    async setOpenState(isOpen) {
        this.isOpen = isOpen;
        const withOverlay = this.hasAttribute('data-with-overlay');
        if (withOverlay) {
            const bodyElement = (0, utils_1.$el)(BODY_ELEMENT_SELECTOR);
            const isImportant = this.hasAttribute('data-overlay-important');
            const hasCustomOpacity = this.hasAttribute('data-overlay-opacity');
            let styles = {};
            if (isImportant) {
                styles = {
                    ...styles,
                    zIndex: parseFloat(getComputedStyle(this).zIndex) - 1,
                };
            }
            if (hasCustomOpacity) {
                styles = {
                    ...styles,
                    '--gsc-overlay-opacity': +this.getAttribute('data-overlay-opacity'),
                };
            }
            (0, utils_1.whenDefined)('body-element').then(() => {
                if (isOpen) {
                    bodyElement.showOverlay(this.id, styles);
                }
                else {
                    bodyElement.hideOverlay(this.id);
                }
                this.setVisible(isOpen);
            });
        }
        else {
            this.setVisible(isOpen);
        }
    }
    setVisible(isOpened) {
        this.classList.toggle('is-opened', isOpened);
    }
    get isSection() {
        return this.hasAttribute('is-section');
    }
}
exports.ModalComponent = ModalComponent;


/***/ }),

/***/ 4061:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationComponent = void 0;
var notification_component_1 = __webpack_require__(8190);
Object.defineProperty(exports, "NotificationComponent", ({ enumerable: true, get: function () { return notification_component_1.NotificationComponent; } }));


/***/ }),

/***/ 8190:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationComponent = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const CLOSE_BUTTON_SELECTOR = '[data-notification-close-button]';
const NOTIFICATION_ALERT_SELECTOR = '[data-notification-alert]';
const ALERT_TEXT_SELECTOR = '[data-notification-alert-text]';
const SCREEN_READER_ALERT_TEXT_SELECTOR = '[data-notification-screen-reader-alert-text]';
class NotificationComponent extends base_component_1.BaseComponent {
    showTimeoutId;
    mountComponent() {
        this.addListener(this, 'click', this.handleClick);
    }
    unmountComponent() {
        clearTimeout(this.showTimeoutId);
    }
    handleClick = (event) => {
        event.preventDefault();
        const button = (0, utils_1.$elParent)(CLOSE_BUTTON_SELECTOR, event.target);
        if (button) {
            this.hide();
        }
    };
    show(errorText, variant = 'warning', duration = 3000) {
        this.setAlert(errorText, variant);
        if (this.showTimeoutId) {
            clearTimeout(this.showTimeoutId);
        }
        this.setVisible(true);
        this.showTimeoutId = setTimeout(() => {
            this.setVisible(false);
        }, duration);
    }
    hide() {
        this.setVisible(false);
    }
    setVisible(isVisible) {
        this.classList.toggle('is-visible', isVisible);
    }
    setAlert(errorText, variant) {
        const alert = (0, utils_1.$el)(NOTIFICATION_ALERT_SELECTOR, this);
        const text = (0, utils_1.$el)(ALERT_TEXT_SELECTOR, this);
        const screenReaderText = (0, utils_1.$el)(SCREEN_READER_ALERT_TEXT_SELECTOR, this);
        if (alert && text) {
            alert.setAttribute('alert-type', variant);
            text.innerHTML = errorText;
            screenReaderText.innerHTML = errorText;
        }
    }
}
exports.NotificationComponent = NotificationComponent;


/***/ }),

/***/ 6504:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaginationLoadButton = exports.PaginationLink = exports.PaginationInfiniteScroll = exports.PaginationComponent = void 0;
var pagination_1 = __webpack_require__(3223);
Object.defineProperty(exports, "PaginationComponent", ({ enumerable: true, get: function () { return pagination_1.PaginationComponent; } }));
var pagination_infinite_scroll_1 = __webpack_require__(7330);
Object.defineProperty(exports, "PaginationInfiniteScroll", ({ enumerable: true, get: function () { return pagination_infinite_scroll_1.PaginationInfiniteScroll; } }));
var pagination_link_1 = __webpack_require__(1668);
Object.defineProperty(exports, "PaginationLink", ({ enumerable: true, get: function () { return pagination_link_1.PaginationLink; } }));
var pagination_load_button_1 = __webpack_require__(9553);
Object.defineProperty(exports, "PaginationLoadButton", ({ enumerable: true, get: function () { return pagination_load_button_1.PaginationLoadButton; } }));


/***/ }),

/***/ 7330:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaginationInfiniteScroll = void 0;
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const PRELOADER_SELECTOR = '.loading-spinner';
const INTERSECTION_OBSERVER_OPTIONS = {
    root: null,
    rootMargin: '0px 0px 200px 0px',
};
class PaginationInfiniteScroll extends base_component_1.BaseComponent {
    intersectionObserver;
    mountComponent() {
        this.intersectionObserver = new IntersectionObserver(this.handleIntersectionObserve, INTERSECTION_OBSERVER_OPTIONS);
        this.intersectionObserver.observe(this);
    }
    unmountComponent() {
        this.intersectionObserver.disconnect();
    }
    handleIntersectionObserve = (entries) => {
        const preloader = (0, utils_1.$el)(PRELOADER_SELECTOR, this);
        const url = this.dataset.url;
        if (url) {
            if (!entries[0].isIntersecting) {
                return;
            }
            this.intersectionObserver.unobserve(this);
            preloader.classList.remove('hidden');
            fetch(url)
                .then(response => response.text())
                .then(responseText => {
                const html = (0, dom_1.parseHTML)(responseText);
                const pagination = (0, utils_1.$elParent)('pagination-component', this);
                preloader.classList.add('hidden');
                this.updateFromHTML(html);
                if (pagination) {
                    pagination.updateTargetsFromHTML(html);
                }
            })
                .catch(() => {
                console.log('Error in infinite scroll component');
            });
        }
    };
    updateFromHTML(html) {
        const newPagination = (0, utils_1.$el)('pagination-infinite-scroll', html);
        if (newPagination) {
            this.setPaginationUrl(newPagination.dataset.url);
            this.intersectionObserver.observe(this);
        }
        else {
            this.removeAttribute('data-url');
        }
    }
    setPaginationUrl(url) {
        this.dataset.url = url;
    }
}
exports.PaginationInfiniteScroll = PaginationInfiniteScroll;


/***/ }),

/***/ 1668:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaginationLink = void 0;
const base_component_1 = __webpack_require__(3608);
const key_1 = __webpack_require__(9650);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const PAGINATION_COMPONENT_SELECTOR = 'pagination-component';
class PaginationLink extends base_component_1.BaseComponent {
    mountComponent() {
        this.addListener(this, 'keydown', this.handleKeyDown);
        this.addListener(this, 'click', this.handleLinkClick);
    }
    handleLinkClick = (event) => {
        event.preventDefault();
        this.fetchResults();
    };
    handleKeyDown = (event) => {
        if ((0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            this.fetchResults();
        }
    };
    fetchResults() {
        const pagination = (0, utils_1.$elParent)(PAGINATION_COMPONENT_SELECTOR, this);
        const url = this.dataset.url;
        if (pagination && url) {
            this.getFromUrl(url);
        }
    }
    getFromUrl(url) {
        const pagination = (0, utils_1.$elParent)(PAGINATION_COMPONENT_SELECTOR, this);
        if (pagination) {
            pagination.loadingOverlay.classList.remove('hidden');
            fetch(url)
                .then(response => response.text())
                .then(responseText => {
                pagination.loadingOverlay.classList.add('hidden');
                this.updatePaginationFromHTML((0, dom_1.parseHTML)(responseText));
                history.pushState({ searchParams: url }, '', url);
            })
                .catch(() => {
                console.log('Error in pagination link component');
            });
        }
    }
    updatePaginationFromHTML(html) {
        const pagination = (0, utils_1.$elParent)(PAGINATION_COMPONENT_SELECTOR, this);
        if (pagination) {
            pagination.updateResultsFromHTML(html);
            pagination.updateFromHTML(html);
        }
    }
}
exports.PaginationLink = PaginationLink;


/***/ }),

/***/ 9553:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaginationLoadButton = void 0;
const base_component_1 = __webpack_require__(3608);
const key_1 = __webpack_require__(9650);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const PAGINATION_COMPONENT_SELECTOR = 'pagination-component';
const PAGINATION_LOAD_BUTTON_SELECTOR = 'pagination-load-button';
class PaginationLoadButton extends base_component_1.BaseComponent {
    mountComponent() {
        this.addListener(this, 'keydown', this.handleKeyDown);
        this.addListener(this, 'click', this.handleButtonClick);
    }
    handleButtonClick = (event) => {
        event.preventDefault();
        this.fetchResults();
    };
    handleKeyDown = (event) => {
        if ((0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            this.fetchResults();
        }
    };
    fetchResults() {
        if (this.dataset.url) {
            this.setLoading(true);
            fetch(this.dataset.url)
                .then(response => response.text())
                .then(responseText => {
                const html = (0, dom_1.parseHTML)(responseText);
                this.setLoading(false);
                this.updateFromHTML(html);
                this.updatePaginationFromHTML(html);
            })
                .catch(() => {
                console.log('Error in pagination load button component');
            });
        }
    }
    updatePaginationFromHTML(html) {
        const pagination = (0, utils_1.$elParent)(PAGINATION_COMPONENT_SELECTOR, this);
        pagination?.updateTargetsFromHTML(html);
        pagination?.updateFromHTML(html);
    }
    setPaginationUrl(newUrl) {
        this.dataset.url = newUrl;
    }
    removePagination() {
        const pagination = (0, utils_1.$elParent)(PAGINATION_COMPONENT_SELECTOR, this);
        pagination?.remove();
    }
    updateFromHTML(html) {
        const newBtn = (0, utils_1.$el)(PAGINATION_LOAD_BUTTON_SELECTOR, html);
        if (newBtn) {
            this.setPaginationUrl(newBtn.dataset.url);
        }
        else {
            this.removePagination();
        }
    }
    setLoading(isLoading) {
        this.toggleAttribute('disabled', isLoading);
        this.classList.toggle('loading', isLoading);
    }
}
exports.PaginationLoadButton = PaginationLoadButton;


/***/ }),

/***/ 3223:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaginationComponent = void 0;
const utils_1 = __webpack_require__(4083);
const dom_1 = __webpack_require__(3889);
const base_component_1 = __webpack_require__(3608);
const PAGINATION_COMPONENT_SELECTOR = 'pagination-component';
class PaginationComponent extends base_component_1.BaseComponent {
    updateTargetsFromHTML(html) {
        if (!this.dataset.containerId) {
            return;
        }
        const newResults = (0, utils_1.$el)(`#${this.dataset.containerId}`, html);
        const results = (0, utils_1.$el)(`#${this.dataset.containerId}`);
        if (newResults && results) {
            const targets = (0, utils_1.$list)(`.${this.dataset.target}`, newResults);
            const fragment = document.createDocumentFragment();
            targets.forEach(target => {
                fragment.appendChild(target);
            });
            results.appendChild(fragment);
            const firstNewTarget = targets[0];
            if (firstNewTarget) {
                const { firstTarget } = (0, utils_1.getTargets)(firstNewTarget);
                firstTarget?.focus();
            }
        }
    }
    updateResultsFromHTML(html) {
        if (!this.dataset.containerId) {
            return;
        }
        const newResults = (0, utils_1.$el)(`#${this.dataset.containerId}`, html);
        const results = (0, utils_1.$el)(`#${this.dataset.containerId}`);
        if (newResults && results) {
            const resultsParentNode = results.parentNode;
            resultsParentNode.replaceChild(newResults, results);
            if ((0, utils_1.isNotThemeStore)()) {
                newResults.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
    updateFromHTML(html) {
        const newPagination = (0, utils_1.$el)(PAGINATION_COMPONENT_SELECTOR, html);
        (0, dom_1.replaceNodeChildren)(this, newPagination);
    }
    get loadingOverlay() {
        return (0, utils_1.$el)(`#${this.dataset.overlayId}`);
    }
}
exports.PaginationComponent = PaginationComponent;


/***/ }),

/***/ 4710:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuantityBtn = exports.QuantityComponent = void 0;
var quantity_1 = __webpack_require__(1176);
Object.defineProperty(exports, "QuantityComponent", ({ enumerable: true, get: function () { return quantity_1.QuantityComponent; } }));
var quantity_btn_1 = __webpack_require__(9535);
Object.defineProperty(exports, "QuantityBtn", ({ enumerable: true, get: function () { return quantity_btn_1.QuantityBtn; } }));


/***/ }),

/***/ 9535:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuantityBtn = void 0;
const base_component_1 = __webpack_require__(3608);
const key_1 = __webpack_require__(9650);
const utils_1 = __webpack_require__(4083);
const QUANTITY_COMPONENT = 'quantity-component';
class QuantityBtn extends base_component_1.BaseComponent {
    mountComponent() {
        this.addListener(this, 'click', this.handleButtonClick);
        this.addListener(this, 'keydown', this.handleKeyDown);
    }
    handleButtonClick = (event) => {
        event.preventDefault();
        this.update();
    };
    handleKeyDown = (event) => {
        const target = event.target;
        if ((0, key_1.isEnterKey)(event) && !target.hasAttribute('disabled')) {
            event.preventDefault();
            this.update();
        }
    };
    update() {
        const quantity = (0, utils_1.$elParent)(QUANTITY_COMPONENT, this);
        const action = this.dataset.action;
        if (!quantity && !action) {
            return;
        }
        if (action === 'minus' && quantity.value === '1') {
            return this.remove();
        }
        quantity.inputChange(action);
    }
    remove() {
        const cart = (0, utils_1.$elParent)('cart-page, cart-drawer', this);
        if (cart) {
            const index = (0, utils_1.$elParent)('cart-item', this).dataset.index;
            cart.updateItem(+index, 0);
        }
    }
}
exports.QuantityBtn = QuantityBtn;


/***/ }),

/***/ 1176:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuantityComponent = void 0;
const base_component_1 = __webpack_require__(3608);
const key_1 = __webpack_require__(9650);
const utils_1 = __webpack_require__(4083);
const INPUT_SELECTOR = '[data-quantity-input]';
class QuantityComponent extends base_component_1.BaseComponent {
    input;
    prevValue;
    stockValue;
    constructor() {
        super();
        this.input = (0, utils_1.$el)(INPUT_SELECTOR, this);
        this.prevValue = this.value;
        this.stockValue = this.dataset.stock || '0';
    }
    mountComponent() {
        this.updateButtonsDisable();
        this.addListener(this.input, 'keypress', this.handleKeydown);
        this.addListener(this.input, 'input', this.handleInput);
        this.addListener(this.input, 'blur', this.handleBlur);
    }
    handleBlur = (event) => {
        if (this.input) {
            const target = event.target;
            const value = target.value || '0';
            this.input.value = value;
            this.updateButtonsDisable();
            this.prevValue = value;
        }
    };
    handleKeydown = (event) => {
        if (this.input && (0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            this.input.blur();
        }
    };
    handleInput = (event) => {
        if (this.input) {
            const input = event.target;
            const value = input.value;
            this.input.value = this.isMoreThanStock ? this.stockValue : value;
            this.updateButtonsDisable();
            this.prevValue = value;
        }
    };
    inputChange(action) {
        if (this.input) {
            if (action === 'minus') {
                this.input.stepDown();
            }
            else {
                this.input.stepUp();
            }
            if (+this.prevValue !== +this.value) {
                this.input.dispatchEvent(new Event('change', { bubbles: true }));
            }
            this.updateButtonsDisable();
        }
    }
    updateButtonsDisable() {
        this.updateButtonDisabled('minus', this.isLessThanMin);
        this.updateButtonDisabled('plus', this.isMoreThanStock);
    }
    setDisable(isDisabled) {
        this.updateButtonDisabled('minus', isDisabled);
        this.updateButtonDisabled('plus', isDisabled);
    }
    updateButtonDisabled(btnType, isDisabled) {
        const button = (0, utils_1.$el)(`quantity-btn[data-action="${btnType}"]`, this);
        button?.toggleAttribute('disabled', isDisabled);
    }
    get value() {
        if (!this.input) {
            return '0';
        }
        return this.input.value;
    }
    get isLessThanMin() {
        if (!this.input) {
            return false;
        }
        return +this.value <= +this.input.min;
    }
    get isMoreThanStock() {
        return +this.value >= +this.stockValue;
    }
}
exports.QuantityComponent = QuantityComponent;


/***/ }),

/***/ 1030:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuoteComponent = void 0;
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
class QuoteComponent extends base_component_1.BaseComponent {
    sidebarButtonSelector;
    quoteLinkAttribute;
    quoteProductLinkAttribute;
    quoteLinkTemplateAttribute;
    targetAttribute;
    quoteWithProductClass;
    quoteLink;
    quoteProductLink;
    quoteLinkTemplate;
    sidebarButton;
    target;
    constructor() {
        super();
        this.sidebarButtonSelector = 'sidebar-button';
        this.quoteLinkAttribute = '[data-quote-link]';
        this.quoteProductLinkAttribute = '[data-quote-product-link]';
        this.quoteLinkTemplateAttribute = '[data-quote-link-template]';
        this.targetAttribute = '[data-quote-line-clamp-target]';
        this.quoteWithProductClass = 'quote--with-product-link';
        this.quoteLink = this.querySelector(this.quoteLinkAttribute);
        this.quoteProductLink = this.querySelector(this.quoteProductLinkAttribute);
        this.quoteLinkTemplate = this.querySelector(this.quoteLinkTemplateAttribute);
        this.sidebarButton = this.closest(this.sidebarButtonSelector);
        this.target = this.querySelector(this.targetAttribute);
    }
    connectedCallback() {
        if (this.quoteProductLink && this.target) {
            this.setLinks();
        }
    }
    setLinks = () => {
        const targetHeight = this.target.offsetHeight;
        const targetTextHeight = this.target.firstElementChild
            .offsetHeight;
        if (targetTextHeight > targetHeight) {
            return;
        }
        if (this.quoteLink) {
            this.quoteLink.href = this.quoteProductLink.href;
        }
        else {
            const clone = (0, dom_1.getTemplateFirstChild)(this.quoteLinkTemplate);
            clone.href = this.quoteProductLink?.href;
            this.appendChild(clone);
        }
        if (this.sidebarButton) {
            this.sidebarButton.destroyListeners();
        }
        this.classList.add(this.quoteWithProductClass);
    };
}
exports.QuoteComponent = QuoteComponent;


/***/ }),

/***/ 7317:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShapeSwatch = void 0;
var shape_swatch_1 = __webpack_require__(7922);
Object.defineProperty(exports, "ShapeSwatch", ({ enumerable: true, get: function () { return shape_swatch_1.ShapeSwatch; } }));


/***/ }),

/***/ 7922:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShapeSwatch = void 0;
const utils_1 = __webpack_require__(4083);
const color_1 = __webpack_require__(7734);
const base_component_1 = __webpack_require__(3608);
const SWATCH_SELECTOR = '.color-swatch';
class ShapeSwatch extends base_component_1.BaseComponent {
    element;
    constructor() {
        super();
        this.element = (0, utils_1.$el)(SWATCH_SELECTOR, this) || this;
        this.setValue();
    }
    setValue() {
        if (this.hasAttribute('is-image')) {
            return;
        }
        const selectedValue = this.dataset.color.toLowerCase().trim();
        const patterns = this.dataset.colorsPatterns.split('\n');
        const isValidColor = this.isColor(selectedValue);
        if (!isValidColor) {
            this.element.setAttribute('not-valid', '');
        }
        this.setPropertyValue(selectedValue);
        patterns.forEach(pattern => {
            const config = pattern.split('::');
            const patternLabel = config[0];
            const patternValue = config[1];
            const patternLabelDowncase = patternLabel.toLowerCase().trim();
            if (patternLabelDowncase === selectedValue) {
                this.setPropertyValue(patternValue);
                return;
            }
        });
    }
    getGradientValue(colors) {
        let gradientValue = '90deg, ';
        let notValidColor = 0;
        const patterns = this.dataset.colorsPatterns.split('\n');
        const preparedPatterns = patterns.reduce((acc, pattern) => {
            const config = pattern.split('::');
            const patternLabel = config[0];
            const patternValue = config[1];
            const patternLabelDowncase = patternLabel.toLowerCase().trim();
            return { ...acc, [patternLabelDowncase]: patternValue };
        }, {});
        colors.forEach((gradientColor, index) => {
            const percent = 100.0 / colors.length;
            let color = gradientColor.toLowerCase();
            if (preparedPatterns[color]) {
                color = preparedPatterns[color];
            }
            else if (!this.isColor(color)) {
                color = 'white';
                notValidColor += 1;
            }
            const startPoint = `${percent * index}%`;
            const endPoint = `${percent * (index + 1)}%`;
            const pointValue = `${color} ${startPoint}, ${color} ${endPoint}`;
            gradientValue = `${gradientValue} ${pointValue}`;
            if (index !== colors.length - 1) {
                gradientValue = `${gradientValue}, `;
            }
        });
        return notValidColor === colors.length
            ? null
            : `linear-gradient(${gradientValue})`;
    }
    setPropertyValue(value) {
        const isImage = this.isImage(value);
        const isUrl = this.isUrl(value);
        const isGradient = this.isGradient(value);
        const isValidColor = this.isColor(value);
        const bgColorHex = this.dataset.sectionBackground;
        const bgColorName = (0, color_1.hexToColorName)(bgColorHex);
        if (isUrl) {
            this.element.removeAttribute('not-valid');
            this.element.style.setProperty('--gsc-color-swatch-value', `url(${value})`);
            this.setSimilarlyBgColorStatus(false);
        }
        else if (isImage) {
            this.setSimilarlyBgColorStatus(false);
        }
        else if (isGradient) {
            const gradientColors = value.split('/');
            const gradientValue = this.getGradientValue(gradientColors);
            const isSimilarlyBgColor = value.includes(bgColorHex) || value.includes(bgColorName);
            if (gradientValue) {
                this.element.removeAttribute('not-valid');
                this.element.style.setProperty('--gsc-color-swatch-value', gradientValue);
            }
            this.setSimilarlyBgColorStatus(isSimilarlyBgColor);
        }
        else {
            const isSimilarlyBgColor = value === bgColorHex || value === bgColorName;
            if (isValidColor) {
                this.element.removeAttribute('not-valid');
            }
            this.setSimilarlyBgColorStatus(isSimilarlyBgColor);
            this.element.style.setProperty('--gsc-color-swatch-value', value);
        }
    }
    setSimilarlyBgColorStatus(isSimilarlyBgColor) {
        this.element.toggleAttribute('section-background-color-equally', isSimilarlyBgColor);
    }
    isColor(color) {
        const style = new Option().style;
        style.color = color;
        return style.color !== '';
    }
    isImage(value) {
        return value.includes('.png') || value.includes('.jp');
    }
    isUrl(value) {
        try {
            new URL(value);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    isGradient(value) {
        return value.includes('/');
    }
}
exports.ShapeSwatch = ShapeSwatch;


/***/ }),

/***/ 3533:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShareWrapper = exports.ShareComponent = void 0;
var share_component_1 = __webpack_require__(5190);
Object.defineProperty(exports, "ShareComponent", ({ enumerable: true, get: function () { return share_component_1.ShareComponent; } }));
var share_wrapper_1 = __webpack_require__(7116);
Object.defineProperty(exports, "ShareWrapper", ({ enumerable: true, get: function () { return share_wrapper_1.ShareWrapper; } }));


/***/ }),

/***/ 5190:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShareComponent = void 0;
const base_component_1 = __webpack_require__(3608);
class ShareComponent extends base_component_1.BaseComponent {
    mountComponent() {
        this.addListener(this, 'click', this.handleClick);
    }
    handleClick = (event) => {
        event.preventDefault();
        if (navigator.share) {
            navigator.share({ text: this.dataset.valueToCopy });
        }
    };
}
exports.ShareComponent = ShareComponent;


/***/ }),

/***/ 7116:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShareWrapper = void 0;
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const TEMPLATE_SELECTOR = '[data-share-custom-template]';
const DEFAULT_TEMPLATE_SELECTOR = '[data-share-system-default-template]';
class ShareWrapper extends base_component_1.BaseComponent {
    mountComponent() {
        this.init();
    }
    init() {
        const customTemplate = (0, utils_1.$el)(TEMPLATE_SELECTOR, this);
        const systemDefaultTemplate = (0, utils_1.$el)(DEFAULT_TEMPLATE_SELECTOR, this);
        const template = navigator.share ? systemDefaultTemplate : customTemplate;
        this.replaceChildren((0, dom_1.getTemplateContent)(template));
    }
}
exports.ShareWrapper = ShareWrapper;


/***/ }),

/***/ 6426:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SidebarButton = exports.SidebarComponent = void 0;
var sidebar_1 = __webpack_require__(4622);
Object.defineProperty(exports, "SidebarComponent", ({ enumerable: true, get: function () { return sidebar_1.SidebarComponent; } }));
var sidebar_button_1 = __webpack_require__(9315);
Object.defineProperty(exports, "SidebarButton", ({ enumerable: true, get: function () { return sidebar_button_1.SidebarButton; } }));


/***/ }),

/***/ 9315:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SidebarButton = void 0;
const base_component_1 = __webpack_require__(3608);
const key_1 = __webpack_require__(9650);
const utils_1 = __webpack_require__(4083);
const BUTTON_SELECTOR = `[data-sidebar-button]`;
class SidebarButton extends base_component_1.BaseComponent {
    mountComponent() {
        this.addListener(this, 'click', this.handleButtonClick);
        this.addListener(this, 'keydown', this.handleKeyDown);
    }
    handleButtonClick = (event) => {
        if (!event.target.closest('[href]')) {
            event.preventDefault();
            this.toggle(event);
        }
    };
    handleKeyDown = (event) => {
        if ((0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            this.toggle(event);
        }
    };
    toggle(event) {
        const button = (0, utils_1.$el)(BUTTON_SELECTOR, this);
        const sidebar = (0, utils_1.$el)(`#${button.dataset.sidebarId}`);
        sidebar?.toggle(event);
        button?.classList.toggle('is-opened', sidebar?.isOpen);
    }
}
exports.SidebarButton = SidebarButton;


/***/ }),

/***/ 4622:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SidebarComponent = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const key_1 = __webpack_require__(9650);
const dom_1 = __webpack_require__(3889);
const check_media_1 = __webpack_require__(5580);
const BODY_ELEMENT_SELECTOR = 'body-element';
class SidebarComponent extends base_component_1.BaseComponent {
    template;
    element;
    touchStartX;
    touchStartY;
    touchEndX;
    touchEndY;
    isOpen;
    constructor() {
        super();
        if (this.hasAttribute('is-open-on-init')) {
            this.element = (0, utils_1.$el)('[data-sidebar-body]', this);
        }
        else {
            this.element = (0, dom_1.getTemplateFirstChild)((0, utils_1.$el)(`[data-sidebar-template="${this.id}"]`, this));
        }
        this.isOpen = this.classList.contains('is-opened');
    }
    mountComponent() {
        super.mountComponent();
        if (this.isEditor) {
            if (!this.isSection) {
                this.hide(true);
            }
            this.editor.on('SECTION_SELECT', this.handleSectionSelect);
            this.editor.on('SECTION_DESELECT', this.handleSectionDeselect);
        }
    }
    handleSidebarFocusout = event => {
        const bodyElement = (0, utils_1.$el)(BODY_ELEMENT_SELECTOR);
        const focusTarget = event.relatedTarget;
        const isLastOpenedWindow = bodyElement.isLastOpenedWindow(this.id);
        const isfocusTargetOut = !focusTarget || !this.contains(focusTarget);
        if (isfocusTargetOut && isLastOpenedWindow && bodyElement.isUsingKeyboard) {
            const { firstTarget } = (0, utils_1.getTargets)(this.element);
            firstTarget.focus();
        }
    };
    handleSectionSelect = ({ detail: { sectionId } }) => {
        if (this.isSection && this.dataset.sectionId === sectionId) {
            this.open();
        }
    };
    handleSectionDeselect = ({ detail: { sectionId } }) => {
        if (this.isSection && this.dataset.sectionId === sectionId) {
            this.hide();
        }
    };
    handleOutsideClick = (event) => {
        const isOverlay = (0, utils_1.$elParent)(BODY_ELEMENT_SELECTOR, event.target);
        if (isOverlay && this.isOpen) {
            this.hide();
        }
    };
    handleTouchStart = (event) => {
        this.touchStartX = event.targetTouches[0].clientX;
        this.touchStartY = event.targetTouches[0].clientY;
    };
    handleTouchMove = (event) => {
        this.touchEndX = event.targetTouches[0].clientX;
        this.touchEndY = event.targetTouches[0].clientY;
    };
    handleTouchEnd = (event) => {
        const X_DIRECTION_THRESHOLD = this.offsetWidth / 2;
        const Y_DIRECTION_THRESHOLD = 48;
        const distanceX = Math.abs(this.touchStartX - this.touchEndX);
        const distanceY = Math.abs(this.touchStartY - this.touchEndY);
        const isCarousel = (0, utils_1.$elParent)('[data-carousel-viewport]', event.target);
        const isPriceRange = (0, utils_1.$elParent)('price-range', event.target);
        if (isCarousel || isPriceRange) {
            this.cleanTouchPoints();
            return;
        }
        if (this.touchEndX === 0) {
            this.cleanTouchPoints();
            return;
        }
        if (distanceY > Y_DIRECTION_THRESHOLD) {
            this.cleanTouchPoints();
            return;
        }
        const isTrigger = this.dataset.openDirection === 'right'
            ? this.touchStartX < this.touchEndX
            : this.touchStartX > this.touchEndX;
        if (this.isOpen && distanceX > X_DIRECTION_THRESHOLD && isTrigger) {
            this.hide();
        }
        this.cleanTouchPoints();
    };
    handleKeydown = (event) => {
        const withCloseOnEscape = this.hasAttribute('data-with-close-on-escape');
        if (withCloseOnEscape && (0, key_1.isEscKey)(event)) {
            event.preventDefault();
            this.hide();
        }
    };
    cleanTouchPoints() {
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.touchStartY = 0;
        this.touchEndY = 0;
    }
    async open(event) {
        const bodyElement = (0, utils_1.$el)(BODY_ELEMENT_SELECTOR);
        (0, utils_1.whenDefined)('body-element').then(() => {
            bodyElement.addDialogWindow(this.id);
        });
        this.mount();
        this.setOpenState(true);
        await (0, utils_1.transitionToPromise)(this);
        const videos = (0, utils_1.$list)('lazy-video, video', this);
        videos.forEach(video => {
            video.play ? video.play() : video.initVideo();
        });
        this.toggleListeners(true);
        if (!(0, check_media_1.isMobile)()) {
            this.initFocus();
            this.toggleCloseCursor(event);
        }
    }
    async hide(isInstant) {
        const bodyElement = (0, utils_1.$el)(BODY_ELEMENT_SELECTOR);
        (0, utils_1.whenDefined)('body-element').then(() => {
            bodyElement.removeDialogWindow(this.id);
        });
        this.toggleListeners(false);
        this.toggleCloseCursor();
        this.setOpenState(false);
        if (isInstant) {
            this.unmount();
        }
        else {
            await (0, utils_1.transitionToPromise)(this);
            this.unmount();
        }
        this.removeAttribute('header-shadow-visible');
    }
    initFocus() {
        if ((0, utils_1.isNotIframe)()) {
            const { firstTarget } = (0, utils_1.getTargets)(this);
            firstTarget?.focus();
        }
    }
    async toggle(event) {
        if (this.isOpen) {
            this.hide();
        }
        else {
            this.open(event);
        }
    }
    mount() {
        this.replaceChildren(this.element);
    }
    unmount() {
        this.replaceChildren();
    }
    updateTemplate(template) {
        this.element = (0, dom_1.getTemplateFirstChild)(template);
        this.replaceChildren(this.element);
    }
    setOpenState(isOpen) {
        this.isOpen = isOpen;
        this.setVisible(isOpen);
        this.toggleOverlay(isOpen);
        const buttons = (0, utils_1.$list)(`[data-sidebar-button][data-sidebar-id="${this.id}"]`);
        buttons.forEach(button => {
            button.classList.toggle('is-opened', isOpen);
        });
    }
    toggleOverlay = (isOpen) => {
        const overlayType = this.getAttribute('data-with-overlay');
        const bodyElement = (0, utils_1.$el)(BODY_ELEMENT_SELECTOR);
        if ((0, check_media_1.isMobile)() && overlayType === 'only-desktop') {
            if (isOpen) {
                bodyElement.setScrollLock();
            }
            else {
                bodyElement.unsetScrollLock();
            }
            return;
        }
        if (overlayType !== null) {
            const isImportant = this.hasAttribute('data-overlay-important');
            const hasCustomOpacity = this.hasAttribute('data-overlay-opacity');
            const computedStyles = getComputedStyle(this);
            let styles = {};
            if (isImportant) {
                styles = { ...styles, zIndex: parseFloat(computedStyles['zIndex']) - 1 };
            }
            if (hasCustomOpacity) {
                styles = {
                    ...styles,
                    '--gsc-overlay-opacity': +this.getAttribute('data-overlay-opacity'),
                };
            }
            (0, utils_1.whenDefined)('body-element').then(() => {
                if (isOpen) {
                    bodyElement.showOverlay(this.id, styles);
                }
                else {
                    bodyElement.hideOverlay(this.id);
                }
            });
        }
    };
    setVisible(isVisible) {
        this.classList.toggle('is-opened', isVisible);
    }
    toggleCloseCursor = (event) => {
        const closeCursor = (0, utils_1.$el)('close-cursor');
        (0, utils_1.whenDefined)('close-cursor').then(() => {
            closeCursor?.toggle(event);
        });
    };
    toggleListeners = boolean => {
        const withOutsideClick = this.hasAttribute('data-with-close-on-outside');
        if (boolean) {
            this.addListener(window, 'keydown', this.handleKeydown);
            this.addListener(this, 'focusout', this.handleSidebarFocusout);
            this.addListener(this, 'touchstart', this.handleTouchStart);
            this.addListener(this, 'touchmove', this.handleTouchMove);
            this.addListener(this, 'touchend', this.handleTouchEnd);
            if (withOutsideClick) {
                this.addListener(window, 'click', this.handleOutsideClick);
            }
        }
        else {
            this.removeListener(window, 'keydown', this.handleKeydown);
            this.removeListener(this, 'focusout', this.handleSidebarFocusout);
            this.removeListener(this, 'touchstart', this.handleTouchStart);
            this.removeListener(this, 'touchmove', this.handleTouchMove);
            this.removeListener(this, 'touchend', this.handleTouchEnd);
            if (withOutsideClick) {
                this.removeListener(window, 'click', this.handleOutsideClick);
            }
        }
    };
    get isSection() {
        return this.hasAttribute('data-sidebar-section');
    }
}
exports.SidebarComponent = SidebarComponent;


/***/ }),

/***/ 5285:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StickyCartButton = void 0;
var sticky_cart_button_1 = __webpack_require__(7767);
Object.defineProperty(exports, "StickyCartButton", ({ enumerable: true, get: function () { return sticky_cart_button_1.StickyCartButton; } }));


/***/ }),

/***/ 7767:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StickyCartButton = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const BUTTON_SELECTOR = '[data-cart-sticky-button]';
const HEADER_SELECTOR = '.shopify-section.shopify-section-header';
class StickyCartButton extends base_component_1.BaseComponent {
    mountComponent() {
        this.addListener(window, 'scroll', this.handleWindowScroll);
    }
    handleWindowScroll = () => {
        const header = (0, utils_1.$el)(HEADER_SELECTOR);
        const button = (0, utils_1.$el)(BUTTON_SELECTOR, this);
        if (header && button) {
            const rect = header.getBoundingClientRect();
            button.classList.toggle('is-visible', rect.bottom + button.offsetHeight < 0);
        }
    };
}
exports.StickyCartButton = StickyCartButton;


/***/ }),

/***/ 1167:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TabsComponent = exports.TabWithDynamicHeight = exports.TabComponent = void 0;
var tab_1 = __webpack_require__(3722);
Object.defineProperty(exports, "TabComponent", ({ enumerable: true, get: function () { return tab_1.TabComponent; } }));
var tab_with_dynamic_height_1 = __webpack_require__(8042);
Object.defineProperty(exports, "TabWithDynamicHeight", ({ enumerable: true, get: function () { return tab_with_dynamic_height_1.TabWithDynamicHeight; } }));
var tabs_1 = __webpack_require__(7812);
Object.defineProperty(exports, "TabsComponent", ({ enumerable: true, get: function () { return tabs_1.TabsComponent; } }));


/***/ }),

/***/ 8042:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TabWithDynamicHeight = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const CONTENT_SELECTOR = '[data-tabs-element-content]';
class TabWithDynamicHeight extends base_component_1.BaseComponent {
    resizeObserver;
    mountComponent() {
        const content = (0, utils_1.$el)(CONTENT_SELECTOR, this);
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(content);
        this.updateHeight();
    }
    unmountComponent() {
        this.resizeObserver.disconnect();
    }
    handleResize = () => {
        this.updateHeight();
    };
    attributeChangedCallback(name, oldValue, newValue) {
        this.updateHeight();
    }
    async show() {
        this.setVisible(true);
    }
    async hide() {
        this.setVisible(false);
    }
    setVisible(isVisible) {
        this.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
    }
    updateHeight() {
        const content = (0, utils_1.$el)(CONTENT_SELECTOR, this);
        if (!content) {
            return;
        }
        this.style.maxHeight = `${Math.ceil(this.isVisible ? content.offsetHeight : 0)}px`;
    }
    get isVisible() {
        return this.getAttribute('aria-hidden') === 'false';
    }
    static get observedAttributes() {
        return ['aria-hidden'];
    }
}
exports.TabWithDynamicHeight = TabWithDynamicHeight;


/***/ }),

/***/ 3722:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TabComponent = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
class TabComponent extends base_component_1.BaseComponent {
    async show() {
        await this.setVisible(true);
    }
    async hide() {
        await this.setVisible(false);
    }
    async setVisible(isVisible) {
        this.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
        await (0, utils_1.transitionToPromise)(this);
    }
    get isVisible() {
        return this.getAttribute('aria-hidden') === 'false';
    }
}
exports.TabComponent = TabComponent;


/***/ }),

/***/ 7812:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TabsComponent = void 0;
const base_component_1 = __webpack_require__(3608);
const key_1 = __webpack_require__(9650);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const CONTAINER_SELECTOR = `[data-tabs-container]`;
const TEMPLATE_SELECTOR = `[data-tabs-elements-template]`;
const TAB_SELECTOR = `tab-component, tab-with-dynamic-height`;
const TAB_NAME_SELECTOR = `[data-tabs-name]`;
class TabsComponent extends base_component_1.BaseComponent {
    template;
    templateContent;
    tabs;
    constructor() {
        super();
        this.template = (0, utils_1.$el)(TEMPLATE_SELECTOR, this);
        this.templateContent = (0, dom_1.getTemplateContent)(this.template);
        this.tabs = [
            (0, utils_1.$el)(TAB_SELECTOR, this),
            ...(0, utils_1.$list)(TAB_SELECTOR, this.templateContent),
        ];
    }
    mountComponent() {
        const names = (0, utils_1.$list)(TAB_NAME_SELECTOR, this);
        names.forEach(name => {
            this.addListener(name, 'keydown', this.handleKeyDown);
            this.addListener(name, 'click', this.handleNameClick);
        });
    }
    handleNameClick = (event) => {
        event.preventDefault();
        const target = event.target.closest('[data-id]');
        if (target.dataset.id) {
            this.selectTab(target.dataset.id);
        }
    };
    handleKeyDown = (event) => {
        const target = event.target;
        if (!target.dataset.id) {
            return;
        }
        if ((0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            this.selectTab(target.dataset.id);
        }
    };
    generateTabMap() {
        return this.tabs.reduce((map, tab) => {
            const tabId = tab.dataset.id;
            return tabId ? { ...map, [tabId]: tab } : map;
        }, {});
    }
    async selectTab(tabId) {
        this.updateNameById(tabId);
        await this.showNextTab(tabId);
    }
    updateNameById(tabId) {
        const names = (0, utils_1.$list)(TAB_NAME_SELECTOR, this);
        names.forEach(name => {
            name.classList.toggle('selected', tabId === name.getAttribute('data-id'));
        });
    }
    async showNextTab(tabId) {
        const tabMap = this.generateTabMap();
        const tab = tabMap[tabId];
        const id = tab.getAttribute('data-id');
        const container = (0, utils_1.$el)(CONTAINER_SELECTOR, this);
        if (!id || !container) {
            return;
        }
        this.dataset.selectedTabId = id;
        container.replaceChildren(tab);
        await tab.show();
        const video = (0, utils_1.$el)('video[autoplay]', tab);
        video?.play();
        this.emit('selectTab', { tabId, tab });
    }
    getNames() {
        return (0, utils_1.$list)(TAB_NAME_SELECTOR, this);
    }
}
exports.TabsComponent = TabsComponent;


/***/ }),

/***/ 4736:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TestimonialsComponent = void 0;
var testimonials_1 = __webpack_require__(9615);
Object.defineProperty(exports, "TestimonialsComponent", ({ enumerable: true, get: function () { return testimonials_1.TestimonialsComponent; } }));


/***/ }),

/***/ 9615:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TestimonialsComponent = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const check_media_1 = __webpack_require__(5580);
const debounce_1 = __webpack_require__(2731);
class TestimonialsComponent extends base_component_1.BaseComponent {
    resizeObserver;
    blockId;
    gridElements;
    carousels;
    mountComponent() {
        if (!this.isEditor) {
            return;
        }
        this.gridElements = (0, utils_1.$list)('quote-component', this);
        this.carousels = (0, utils_1.$list)('carousel-component', this);
        this.carousels.forEach(carousel => {
            carousel.editor.destroy();
            carousel.handleBlockSelect = this.handleBlockSelect;
        });
        this.editor.on('BLOCK_SELECT', this.handleBlockSelect);
        this.editor.on('SECTION_LOAD', this.handleSectionLoad);
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(this);
        if (this.blockId) {
            this.scrollToSelectedBlock();
        }
    }
    handleSectionLoad = () => {
        if (this.blockId) {
            this.scrollToSelectedBlock();
        }
    };
    handleBlockSelect = ({ detail: { sectionId, blockId, load } }) => {
        if (this.dataset.sectionId !== sectionId) {
            return;
        }
        this.blockId = blockId;
        this.scrollToSelectedBlock();
    };
    handleResize = (0, debounce_1.debounce)(() => {
        if (this.blockId) {
            this.scrollToSelectedBlock();
        }
    }, 100);
    scrollToSelectedBlock = () => {
        const isGrid = (!(0, check_media_1.isMobile)() && this.dataset.desktopLayout.includes('grid')) ||
            ((0, check_media_1.isMobile)() && this.dataset.mobileLayout.includes('column'));
        if (isGrid) {
            this.scrollGrid();
        }
        else {
            this.scrollCarousel();
        }
    };
    scrollCarousel = () => {
        const carousel = (0, utils_1.$list)('carousel-component', this).filter(carousel => carousel.offsetWidth > 0)[0];
        const dots = (0, utils_1.$el)('carousel-dots', carousel);
        const slides = carousel.embla.slideNodes();
        const slideIndex = slides.findIndex(({ attributes }) => attributes['block-id']?.value === this.blockId);
        const scrollToIndex = slideIndex % +this.dataset.desktopColumns === 0
            ? Math.floor(slideIndex / +this.dataset.desktopColumns)
            : Math.floor((slideIndex - 1) / +this.dataset.desktopColumns);
        if (scrollToIndex !== -1) {
            carousel.embla.scrollTo((0, check_media_1.isMobile)() ? slideIndex : scrollToIndex, false);
            carousel.stop();
            dots?.handleCarouselSelect();
        }
    };
    scrollGrid = () => {
        const grid = this.gridElements.filter(el => el.offsetWidth > 0);
        const block = grid.find(({ attributes }) => attributes['block-id']?.value === this.blockId);
        if ((0, utils_1.isNotThemeStore)()) {
            block?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    };
}
exports.TestimonialsComponent = TestimonialsComponent;


/***/ }),

/***/ 8121:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnnouncementBar = void 0;
const dom_1 = __webpack_require__(3889);
const base_component_1 = __webpack_require__(3608);
const debounce_1 = __webpack_require__(2731);
class AnnouncementBar extends base_component_1.BaseComponent {
    resizeObserver;
    mountComponent() {
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(this);
        if (this.isEditor) {
            this.editor.on('SECTION_LOAD', this.handleSectionLoad);
            this.editor.on('SECTION_UNLOAD', this.handleSectionLoad);
        }
    }
    unmountComponent() {
        this.resizeObserver.disconnect();
        if (this.isEditor) {
            this.editor.off('SECTION_LOAD', this.handleSectionLoad);
            this.editor.off('SECTION_UNLOAD', this.handleSectionLoad);
        }
    }
    toggleStyleVariable = () => {
        const barStyles = getComputedStyle(this.parentElement);
        if (barStyles.position == 'sticky') {
            (0, dom_1.setStyleVariable)('sticky-bar-bottom', `${this.parentElement.offsetHeight + parseFloat(barStyles.top)}px`);
        }
        else {
            (0, dom_1.removeStyleVariable)('sticky-bar-bottom');
        }
    };
    handleResize = (0, debounce_1.debounce)(this.toggleStyleVariable, 100);
    handleSectionLoad = (0, debounce_1.debounce)(({ detail: { sectionId } }) => {
        if (this.dataset.sectionId === sectionId) {
            this.toggleStyleVariable();
        }
    }, 100);
}
exports.AnnouncementBar = AnnouncementBar;


/***/ }),

/***/ 4830:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BeforeAfterImages = void 0;
const base_component_1 = __webpack_require__(3608);
const key_1 = __webpack_require__(9650);
const utils_1 = __webpack_require__(4083);
const BUTTON_SELECTOR = '[data-before-after-images-button]';
const STEP = 20;
const WITH_TRANSITION_CLASS = 'before-after--with-transition';
const SEPARATOR_SELECTOR = '[data-before-after-images-separator]';
class BeforeAfterImages extends base_component_1.BaseComponent {
    isMoving = false;
    intersectionObserver;
    mountComponent() {
        const button = (0, utils_1.$el)(BUTTON_SELECTOR, this);
        this.addListener(button, 'keyup', this.handleButtonKeyUp);
        this.addListener(button, 'mousedown', this.handleButtonMouseDown);
        this.addListener(document, 'mouseup', this.handleButtonMouseUp);
        this.addListener(document, 'mousemove', this.handleMouseMove);
        this.addListener(button, 'touchstart', this.handleTouchStart);
        this.addListener(this, 'touchmove', this.handleTouchMove);
        this.addListener(document, 'touchend', this.handleTouchEnd);
        this.intersectionObserver = new IntersectionObserver(this.handleInViewport, { rootMargin: `0px` });
        this.intersectionObserver.observe(this);
    }
    unmountComponent() {
        this.intersectionObserver?.disconnect();
    }
    setInitialPosition = async () => {
        const separator = (0, utils_1.$el)(SEPARATOR_SELECTOR, this);
        this.setPosition(Number(this.dataset.initialDragPosition));
        await (0, utils_1.transitionToPromise)(separator);
        this.classList.remove(WITH_TRANSITION_CLASS);
    };
    handleInViewport = (entries) => {
        if (entries.some(entry => entry.isIntersecting)) {
            this.intersectionObserver.disconnect();
            this.setInitialPosition();
        }
    };
    handleButtonMouseDown = (event) => {
        event.preventDefault();
        this.startMove();
    };
    handleButtonMouseUp = () => {
        this.endMove();
    };
    handleMouseMove = (event) => {
        if (!this.isMoving) {
            return;
        }
        this.move(event.pageX);
    };
    handleButtonKeyUp = (event) => {
        const button = (0, utils_1.$el)(BUTTON_SELECTOR, this);
        if (!button) {
            return;
        }
        if (!(0, key_1.isLeftKey)(event) && !(0, key_1.isRightKey)(event)) {
            return;
        }
        const rect = button.getBoundingClientRect();
        const point = rect.right - rect.width / 2;
        const position = (0, key_1.isLeftKey)(event) ? point - STEP : point + STEP;
        this.move(position);
    };
    handleTouchStart = () => {
        this.startMove();
    };
    handleTouchEnd = () => {
        this.endMove();
    };
    handleTouchMove = (event) => {
        if (!this.isMoving) {
            return;
        }
        event.preventDefault();
        this.move(event.targetTouches[0].clientX);
    };
    startMove() {
        this.isMoving = true;
    }
    endMove() {
        this.isMoving = false;
    }
    setPosition(position) {
        this.style.setProperty('--gsc-drag-position', `${position}%`);
    }
    move(newPosition) {
        const rect = this.getBoundingClientRect();
        if (newPosition <= rect.left) {
            this.setPosition(0);
        }
        else if (newPosition >= rect.right) {
            this.setPosition(100);
        }
        else {
            const position = Math.floor(((newPosition - rect.left) / this.offsetWidth) * 1000) / 10;
            this.setPosition(position);
        }
    }
}
exports.BeforeAfterImages = BeforeAfterImages;


/***/ }),

/***/ 7126:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BeforeAfterImages = void 0;
var before_after_images_1 = __webpack_require__(4830);
Object.defineProperty(exports, "BeforeAfterImages", ({ enumerable: true, get: function () { return before_after_images_1.BeforeAfterImages; } }));


/***/ }),

/***/ 8733:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartDrawerButtonsBlock = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const CART_DRAWER_SELECTOR = 'cart-drawer';
const CHECKOUT_BUTTON_SELECTOR = '[data-cart-checkout-button]';
class CartDrawerButtonsBlock extends base_component_1.BaseComponent {
    mountComponent() {
        const cartDrawer = (0, utils_1.$elParent)(CART_DRAWER_SELECTOR, this);
        cartDrawer?.on('start-update', this.handleStartCartUpdate);
        cartDrawer?.on('stop-update', this.handleCartUpdate);
        cartDrawer?.on('update-nodes', this.handleCartUpdate);
    }
    unmountComponent() {
        const cartDrawer = (0, utils_1.$elParent)(CART_DRAWER_SELECTOR, this);
        cartDrawer?.off('start-update', this.handleStartCartUpdate);
        cartDrawer?.off('update-nodes', this.handleCartUpdate);
    }
    handleStartCartUpdate = () => {
        this.setLoading(true);
    };
    handleCartUpdate = () => {
        this.setLoading(false);
    };
    setLoading(isLoading) {
        const button = (0, utils_1.$el)(CHECKOUT_BUTTON_SELECTOR, this);
        button?.toggleAttribute('disabled', isLoading);
        button?.classList.toggle('loading', isLoading);
    }
}
exports.CartDrawerButtonsBlock = CartDrawerButtonsBlock;


/***/ }),

/***/ 8640:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartDrawerFooter = void 0;
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const CART_DRAWER_SELECTOR = 'cart-drawer';
const CART_DRAWER_FOOTER_SELECTOR = 'cart-drawer-footer';
class CartDrawerFooter extends base_component_1.BaseComponent {
    mountComponent() {
        const cartDrawer = (0, utils_1.$elParent)(CART_DRAWER_SELECTOR, this);
        cartDrawer?.on('update-nodes', this.handleCartDrawerUpdate);
    }
    unmountComponent() {
        const cartDrawer = (0, utils_1.$elParent)(CART_DRAWER_SELECTOR, this);
        cartDrawer?.off('update-nodes', this.handleCartDrawerUpdate);
    }
    handleCartDrawerUpdate = ({ node }) => {
        (0, dom_1.replaceNodeChildren)(this, (0, utils_1.$el)(CART_DRAWER_FOOTER_SELECTOR, node));
    };
}
exports.CartDrawerFooter = CartDrawerFooter;


/***/ }),

/***/ 2715:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartDrawerFreeShippingBarBlock = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const CART_DRAWER_SELECTOR = 'cart-drawer';
const FREE_SHIPPING_BAR_SELECTOR = 'free-shipping-bar';
class CartDrawerFreeShippingBarBlock extends base_component_1.BaseComponent {
    mountComponent() {
        const cartDrawer = (0, utils_1.$elParent)(CART_DRAWER_SELECTOR, this);
        cartDrawer?.on('update-nodes', this.handleCartUpdate);
    }
    unmountComponent() {
        const cartDrawer = (0, utils_1.$elParent)(CART_DRAWER_SELECTOR, this);
        cartDrawer?.off('update-nodes', this.handleCartUpdate);
    }
    handleCartUpdate = (data) => {
        const bar = (0, utils_1.$el)(FREE_SHIPPING_BAR_SELECTOR, this);
        const newBar = (0, utils_1.$el)(FREE_SHIPPING_BAR_SELECTOR, data.node);
        if (!bar || !newBar) {
            return;
        }
        const difference = newBar.getAttribute('data-free-shipping-difference') || '';
        const differencePercent = +(newBar.getAttribute('data-free-shipping-difference-percent') || 0);
        bar.updateProgressByDifference(difference, differencePercent);
    };
}
exports.CartDrawerFreeShippingBarBlock = CartDrawerFreeShippingBarBlock;


/***/ }),

/***/ 4029:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartDrawerHeader = void 0;
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const CART_DRAWER_SELECTOR = 'cart-drawer';
const CART_DRAWER_HEADER_SELECTOR = 'cart-drawer-header';
class CartDrawerHeader extends base_component_1.BaseComponent {
    mountComponent() {
        const cartDrawer = (0, utils_1.$elParent)(CART_DRAWER_SELECTOR, this);
        cartDrawer?.on('update-nodes', this.handleCartDrawerUpdate);
    }
    unmountComponent() {
        const cartDrawer = (0, utils_1.$elParent)(CART_DRAWER_SELECTOR, this);
        cartDrawer?.off('update-nodes', this.handleCartDrawerUpdate);
    }
    handleCartDrawerUpdate = ({ node }) => {
        (0, dom_1.replaceNodeChildren)(this, (0, utils_1.$el)(CART_DRAWER_HEADER_SELECTOR, node));
    };
}
exports.CartDrawerHeader = CartDrawerHeader;


/***/ }),

/***/ 358:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartDrawerInCartBannerBlock = void 0;
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const CART_DRAWER_SELECTOR = 'cart-drawer';
const CART_DRAWER_IN_CART_BANNER_SELECTOR = 'cart-drawer-in-cart-banner-block';
class CartDrawerInCartBannerBlock extends base_component_1.BaseComponent {
    mountComponent() {
        const cartDrawer = (0, utils_1.$elParent)(CART_DRAWER_SELECTOR, this);
        cartDrawer?.on('update-nodes', this.handleCartDrawerUpdate);
    }
    unmountComponent() {
        const cartDrawer = (0, utils_1.$elParent)(CART_DRAWER_SELECTOR, this);
        cartDrawer?.off('update-nodes', this.handleCartDrawerUpdate);
    }
    handleCartDrawerUpdate = ({ node }) => {
        (0, dom_1.replaceNodeChildren)(this, (0, utils_1.$el)(`${CART_DRAWER_IN_CART_BANNER_SELECTOR}[block-id="${this.getAttribute('block-id')}"]`, node));
    };
}
exports.CartDrawerInCartBannerBlock = CartDrawerInCartBannerBlock;


/***/ }),

/***/ 2411:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartDrawerItemsBlock = void 0;
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const CART_DRAWER_SELECTOR = 'cart-drawer';
const CART_DRAWER_ITEM_SELECTOR = 'cart-drawer-items-block';
class CartDrawerItemsBlock extends base_component_1.BaseComponent {
    mountComponent() {
        const cartDrawer = (0, utils_1.$elParent)(CART_DRAWER_SELECTOR, this);
        cartDrawer?.on('update-nodes', this.handleCartDrawerUpdate);
        cartDrawer?.on('purchase', this.handleCartDrawerPurschase);
    }
    unmountComponent() {
        const cartDrawer = (0, utils_1.$elParent)(CART_DRAWER_SELECTOR, this);
        cartDrawer?.off('update-nodes', this.handleCartDrawerUpdate);
        cartDrawer?.off('purchase', this.handleCartDrawerPurschase);
    }
    handleCartDrawerUpdate = ({ node, parsedState }) => {
        const newCartItems = (0, utils_1.$el)(`${CART_DRAWER_ITEM_SELECTOR}[block-id="${this.getAttribute('block-id')}"]`, node);
        if (parsedState && parsedState.quantity === 1) {
            const newItem = (0, utils_1.$el)(`cart-item[data-variant-id="${parsedState.id}"]`, newCartItems);
            newItem.setAttribute('is-new', '');
        }
        (0, dom_1.replaceNodeChildren)(this, newCartItems);
    };
    handleCartDrawerPurschase = async ({ parsedState }) => {
        const item = (0, utils_1.$el)(`cart-item[data-variant-id="${parsedState.id}"]`, this);
        if (item && parsedState.quantity === 1) {
            await item?.showAsNew();
        }
        item?.showCheckmark();
    };
}
exports.CartDrawerItemsBlock = CartDrawerItemsBlock;


/***/ }),

/***/ 8476:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartDrawerRelatedProductsBlock = void 0;
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const RELATED_PRODUCTS_SELECTOR = '[data-cart-drawer-related-products]';
const CART_DRAWER_SELECTOR = 'cart-drawer';
const CART_DRAWER_RELATED_PRODUCTS_SELECTOR = 'cart-drawer-related-products-block';
const CAROUSEL_SELECTOR = 'carousel-component';
class CartDrawerRelatedProductsBlock extends base_component_1.BaseComponent {
    mountComponent() {
        const cartDrawer = (0, utils_1.$elParent)(CART_DRAWER_SELECTOR, this);
        cartDrawer?.on('update-nodes', this.handleCartDrawerUpdate);
    }
    unmountComponent() {
        const cartDrawer = (0, utils_1.$elParent)(CART_DRAWER_SELECTOR, this);
        cartDrawer?.off('update-nodes', this.handleCartDrawerUpdate);
    }
    handleCartDrawerUpdate = ({ node }) => {
        const relatedProducts = (0, utils_1.$el)(RELATED_PRODUCTS_SELECTOR, this);
        if (!relatedProducts) {
            return;
        }
        const newRelatedProducts = (0, utils_1.$el)(`${CART_DRAWER_RELATED_PRODUCTS_SELECTOR}[block-id="${this.getAttribute('block-id')}"] [data-cart-drawer-related-products]`, node);
        if (!newRelatedProducts) {
            return;
        }
        const isAuto = this.hasAttribute('is-auto-recommendations');
        if (isAuto) {
            const newUrl = newRelatedProducts.getAttribute('data-url');
            relatedProducts.setAttribute('data-url', newUrl);
            if (newUrl) {
                relatedProducts.loadProducts();
            }
            else {
                relatedProducts.erase();
                this.checkHasAsideProducts();
                this.updateVisibility();
            }
        }
        else {
            (0, dom_1.replaceNodeChildren)(relatedProducts, newRelatedProducts);
            this.checkHasAsideProducts();
            this.updateVisibility();
        }
        this.reInitCarousel();
    };
    checkHasAsideProducts() {
        const isAsideProducts = this.hasAttribute('is-aside-related-products');
        if (isAsideProducts) {
            const products = (0, utils_1.$list)('[is-aside-related-products] vertical-product-card, [is-aside-related-products] horizontal-product-card');
            const cartDrawer = (0, utils_1.$el)('cart-drawer');
            const hasAsideProducts = products?.length > 0;
            if (cartDrawer) {
                cartDrawer.toggleAttribute('has-aside-products', hasAsideProducts);
            }
        }
    }
    updateVisibility = () => {
        const isAsideProducts = this.hasAttribute('is-aside-related-products');
        if (!isAsideProducts) {
            const cartDrawer = (0, utils_1.$el)('cart-drawer');
            const cartDrawerItems = Boolean((0, utils_1.$el)('cart-item', cartDrawer));
            cartDrawer.toggleAttribute('empty-cart', !cartDrawerItems);
        }
    };
    reInitCarousel = () => {
        const carousel = (0, utils_1.$el)(CAROUSEL_SELECTOR, this);
        if (carousel && carousel.withAutoplay) {
            carousel.setCarousel();
            carousel.setAutoplay();
        }
    };
}
exports.CartDrawerRelatedProductsBlock = CartDrawerRelatedProductsBlock;


/***/ }),

/***/ 3255:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartDrawerRelatedProducts = void 0;
const dom_1 = __webpack_require__(3889);
const base_component_1 = __webpack_require__(3608);
const dom_2 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const LOADING_OVERLAY_SELECTOR = '.loading-overlay';
const IN_CART_RELATED_PRODUCTS_SELECTOR = '[in-cart-related-product]';
const CART_DRAWER_TEMPLATE_SELECTOR = '[data-sidebar-template="CartDrawer"]';
const BODY_ELEMENT_SELECTOR = 'body-element';
class CartDrawerRelatedProducts extends base_component_1.BaseComponent {
    prevUrl;
    mountComponent() {
        this.loadProducts();
    }
    erase() {
        this.replaceChildren();
        this.setReady(false);
    }
    loadProducts() {
        if (this.prevUrl === this.dataset.url) {
            return;
        }
        this.prevUrl = this.dataset.url;
        if (!this.dataset.url) {
            return;
        }
        this.showPreloader();
        return fetch(this.dataset.url)
            .then(response => response.text())
            .then(text => {
            this.hidePreloader();
            const template = (0, utils_1.$el)(CART_DRAWER_TEMPLATE_SELECTOR, (0, dom_1.parseHTML)(text));
            const node = (0, dom_1.getTemplateFirstChild)(template);
            this.updateByHTML(node);
        })
            .catch(() => {
            const bodyElement = (0, utils_1.$el)(BODY_ELEMENT_SELECTOR);
            bodyElement.showNotification('Error in cart drawer related products', 'warning');
        });
    }
    updateByHTML = (node) => {
        const recommendations = (0, utils_1.$el)(`#${this.id}`, node);
        (0, dom_1.replaceNodeChildren)(this, recommendations);
        const products = (0, utils_1.$list)(IN_CART_RELATED_PRODUCTS_SELECTOR, this);
        this.setReady(products.length > 0);
    };
    setReady(isReady) {
        this.toggleAttribute('is-ready', isReady);
    }
    showPreloader() {
        const preloader = (0, utils_1.$el)(LOADING_OVERLAY_SELECTOR, this);
        (0, dom_2.showElement)(preloader);
    }
    hidePreloader() {
        const preloader = (0, utils_1.$el)(LOADING_OVERLAY_SELECTOR, this);
        (0, dom_2.hideElement)(preloader);
    }
}
exports.CartDrawerRelatedProducts = CartDrawerRelatedProducts;


/***/ }),

/***/ 5198:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartDrawerTimerBlock = void 0;
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const CART_DRAWER_SELECTOR = 'cart-drawer';
const CART_DRAWER_TIMER_BLOCK_SELECTOR = 'cart-drawer-timer-block';
class CartDrawerTimerBlock extends base_component_1.BaseComponent {
    mountComponent() {
        const cartDrawer = (0, utils_1.$elParent)(CART_DRAWER_SELECTOR, this);
        cartDrawer?.on('update-nodes', this.handleCartDrawerUpdate);
    }
    unmountComponent() {
        const cartDrawer = (0, utils_1.$elParent)(CART_DRAWER_SELECTOR, this);
        cartDrawer?.off('update-nodes', this.handleCartDrawerUpdate);
    }
    handleCartDrawerUpdate = ({ node }) => {
        (0, dom_1.replaceNodeChildren)(this, (0, utils_1.$el)(`${CART_DRAWER_TIMER_BLOCK_SELECTOR}[block-id="${this.getAttribute('block-id')}"]`, node));
    };
}
exports.CartDrawerTimerBlock = CartDrawerTimerBlock;


/***/ }),

/***/ 4626:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartDrawer = void 0;
const cart_api_1 = __webpack_require__(735);
const fetch_config_1 = __webpack_require__(8548);
const sidebar_1 = __webpack_require__(4622);
const dom_1 = __webpack_require__(3889);
const debounce_1 = __webpack_require__(2731);
const utils_1 = __webpack_require__(4083);
const transition_util_1 = __webpack_require__(7322);
const VIEWPORT_SELECTOR = '[data-cart-drawer-viewport]';
const RESULTS_SELECTOR = '[data-cart-drawer-results]';
const NOTIFICATION_SELECTOR = '#CartDrawerNotification';
const CART_ITEM_SELECTOR = 'cart-item';
class CartDrawer extends sidebar_1.SidebarComponent {
    cartAPI = new cart_api_1.CartAPI();
    resizeObserver;
    lastDrawerBody;
    error;
    mountComponent() {
        super.mountComponent();
        const viewport = (0, utils_1.$el)(VIEWPORT_SELECTOR, this.element);
        const results = (0, utils_1.$el)(RESULTS_SELECTOR, this.element);
        if (results) {
            this.resizeObserver = new ResizeObserver(this.handleResultsResize);
            this.resizeObserver.observe(results);
        }
        this.addListener(this, 'change', this.handleCartChange);
        this.addListener(this, 'change', this.handleItemChange);
        this.addListener(viewport, 'scroll', this.handleViewportScroll);
    }
    unmountComponent() {
        super.unmountComponent();
        this.resizeObserver.disconnect();
    }
    handleItemChange = ({ target }) => {
        const item = (0, utils_1.$el)(`#CartItem-${+target.dataset.index}`, this);
        if (item) {
            item.setLoading(true);
            this.setLoadingStatus(true);
        }
    };
    handleCartChange = (0, debounce_1.debounce)(({ target }) => {
        this.updateItem(+target.dataset.index, +target.value);
    }, 500);
    handleViewportScroll = (0, debounce_1.debounce)(() => {
        this.updateViewport();
    }, 25);
    handleResultsResize = (0, debounce_1.debounce)(() => {
        this.updateViewport();
    }, 25);
    updateViewport() {
        const results = (0, utils_1.$el)(RESULTS_SELECTOR, this.element);
        const viewport = (0, utils_1.$el)(VIEWPORT_SELECTOR, this.element);
        if (!results || !viewport) {
            return;
        }
        const isOverflow = results.offsetHeight > viewport.offsetHeight;
        const isScrolled = viewport.scrollTop > 0;
        const isBottom = results.offsetHeight - viewport.scrollTop === viewport.offsetHeight;
        this.classList.toggle('header-shadow-visible', isOverflow && isScrolled);
        this.classList.toggle('footer-shadow-visible', isOverflow && !isBottom);
    }
    update() {
        this.cartAPI
            .getDrawer()
            .then(responseText => {
            this.lastDrawerBody = this.getTemplateContent((0, dom_1.parseHTML)(responseText));
        })
            .catch(() => {
            this.showError('');
        })
            .finally(() => {
            this.mount();
            this.emit('update-nodes', {
                node: this.lastDrawerBody,
            });
            this.updateEmptyStatus();
        });
    }
    updateItem(itemIndex, quantity) {
        const item = (0, utils_1.$el)(`#CartItem-${itemIndex}`, this);
        if (!item) {
            return;
        }
        this.setLoadingStatus(true);
        const currentQuantity = +(item.dataset.quantity || 0);
        if (currentQuantity === quantity) {
            item.setLoading(false);
            this.setLoadingStatus(false);
            return;
        }
        item.setDisabled(true);
        if (quantity === 0) {
            item.removeItem();
            (0, transition_util_1.whenTransitionEnds)(item, () => {
                const items = (0, utils_1.$list)(CART_ITEM_SELECTOR, this.element);
                this.setPreEmpty(items.length === 1);
            });
        }
        this.emit('start-update', {});
        this.cartAPI
            .change({
            ...(0, fetch_config_1.fetchConfig)(),
            body: JSON.stringify({
                line: itemIndex + 1,
                quantity,
                sections: this.dataset.sectionId,
                sections_url: window.location.pathname,
            }),
        })
            .then(state => {
            const data = JSON.parse(state);
            if (data.errors) {
                throw new Error(data.errors);
            }
            this.lastDrawerBody = this.getTemplateContent((0, dom_1.parseHTML)(data.sections[this.dataset.sectionId]));
        })
            .catch(error => {
            this.error = error;
        })
            .finally(() => {
            this.mount();
            this.emit('update-nodes', {
                node: this.lastDrawerBody,
            });
            this.updateEmptyStatus();
            this.initFocus();
            item.setLoading(false);
            this.setLoadingStatus(false);
            item.setDisabled(false);
            if (this.error) {
                this.showError(this.error);
                this.error = null;
            }
        });
    }
    setLoadingStatus(isLoading) {
        this.classList.toggle('is-cart-loading', isLoading);
    }
    showError(text) {
        const notification = (0, utils_1.$el)(NOTIFICATION_SELECTOR, this);
        const message = text ? text : window.auroraThemeLocales.cartStrings.error;
        notification?.show(message, 'warning', 6000);
    }
    async purchaseHandler(html, parsedState) {
        this.setPreEmpty(false);
        const node = this.getTemplateContent(html);
        this.mount();
        this.emit('update-nodes', { node, parsedState });
        this.updateEmptyStatus();
        await this.open();
        this.emit('purchase', { parsedState });
        this.addListener(this, 'showAsNew', this.updateLastDrawerBody);
    }
    updateLastDrawerBody = () => {
        this.lastDrawerBody = this.element.cloneNode(true);
    };
    setPreEmpty(isEmpty) {
        this.classList.toggle('is-pre-empty', isEmpty);
    }
    getTemplateContent(html) {
        const newTemplate = (0, utils_1.$el)(`[data-sidebar-template="${this.id}"]`, html);
        return (0, dom_1.getTemplateFirstChild)(newTemplate);
    }
    updateEmptyStatus() {
        const items = (0, utils_1.$list)(CART_ITEM_SELECTOR, this.element);
        if (this.hasAttribute('data-has-warning-placeholder')) {
            this.toggleAttribute('is-empty', items.length === 0);
        }
        if (items.length === 0) {
            this.emit('cartIsEmpty', {});
        }
    }
    updateAsideProductsByParsedState(parsedState) {
        this.toggleAttribute('has-aside-products', parsedState.quantity > 0);
    }
    async open() {
        await super.open();
        this.lastDrawerBody = this.element.cloneNode(true);
    }
}
exports.CartDrawer = CartDrawer;


/***/ }),

/***/ 9223:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartDrawer = exports.CartDrawerTimerBlock = exports.CartDrawerRelatedProductsBlock = exports.CartDrawerRelatedProducts = exports.CartDrawerItemsBlock = exports.CartDrawerInCartBannerBlock = exports.CartDrawerHeader = exports.CartDrawerFreeShippingBarBlock = exports.CartDrawerFooter = exports.CartDrawerButtonsBlock = void 0;
var cart_drawer_buttons_block_1 = __webpack_require__(8733);
Object.defineProperty(exports, "CartDrawerButtonsBlock", ({ enumerable: true, get: function () { return cart_drawer_buttons_block_1.CartDrawerButtonsBlock; } }));
var cart_drawer_footer_1 = __webpack_require__(8640);
Object.defineProperty(exports, "CartDrawerFooter", ({ enumerable: true, get: function () { return cart_drawer_footer_1.CartDrawerFooter; } }));
var cart_drawer_free_shipping_bar_block_1 = __webpack_require__(2715);
Object.defineProperty(exports, "CartDrawerFreeShippingBarBlock", ({ enumerable: true, get: function () { return cart_drawer_free_shipping_bar_block_1.CartDrawerFreeShippingBarBlock; } }));
var cart_drawer_header_1 = __webpack_require__(4029);
Object.defineProperty(exports, "CartDrawerHeader", ({ enumerable: true, get: function () { return cart_drawer_header_1.CartDrawerHeader; } }));
var cart_drawer_in_cart_banner_block_1 = __webpack_require__(358);
Object.defineProperty(exports, "CartDrawerInCartBannerBlock", ({ enumerable: true, get: function () { return cart_drawer_in_cart_banner_block_1.CartDrawerInCartBannerBlock; } }));
var cart_drawer_items_block_1 = __webpack_require__(2411);
Object.defineProperty(exports, "CartDrawerItemsBlock", ({ enumerable: true, get: function () { return cart_drawer_items_block_1.CartDrawerItemsBlock; } }));
var cart_drawer_related_products_1 = __webpack_require__(3255);
Object.defineProperty(exports, "CartDrawerRelatedProducts", ({ enumerable: true, get: function () { return cart_drawer_related_products_1.CartDrawerRelatedProducts; } }));
var cart_drawer_related_products_block_1 = __webpack_require__(8476);
Object.defineProperty(exports, "CartDrawerRelatedProductsBlock", ({ enumerable: true, get: function () { return cart_drawer_related_products_block_1.CartDrawerRelatedProductsBlock; } }));
var cart_drawer_timer_block_1 = __webpack_require__(5198);
Object.defineProperty(exports, "CartDrawerTimerBlock", ({ enumerable: true, get: function () { return cart_drawer_timer_block_1.CartDrawerTimerBlock; } }));
var cart_drawer_1 = __webpack_require__(4626);
Object.defineProperty(exports, "CartDrawer", ({ enumerable: true, get: function () { return cart_drawer_1.CartDrawer; } }));


/***/ }),

/***/ 3828:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartAppBlock = void 0;
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const CART_PAGE_SELECTOR = 'cart-page';
class CartAppBlock extends base_component_1.BaseComponent {
    mountComponent() {
        const cart = (0, utils_1.$elParent)(CART_PAGE_SELECTOR, this);
        cart?.on('update-nodes', this.handleCartUpdate);
    }
    unmountComponent() {
        const cart = (0, utils_1.$elParent)(CART_PAGE_SELECTOR, this);
        cart?.off('update-nodes', this.handleCartUpdate);
    }
    handleCartUpdate = ({ node }) => {
        (0, dom_1.replaceNodeChildren)(this, (0, utils_1.$el)(`cart-app-block[block-id="${this.getAttribute('block-id')}"]`, node));
    };
}
exports.CartAppBlock = CartAppBlock;


/***/ }),

/***/ 5151:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartButtonsBlock = void 0;
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const CART_PAGE_SELECTOR = 'cart-page';
const CHECKOUT_BUTTON_SELECTOR = '[data-cart-page-checkout-button]';
class CartButtonsBlock extends base_component_1.BaseComponent {
    mountComponent() {
        const cart = (0, utils_1.$elParent)(CART_PAGE_SELECTOR, this);
        cart?.on('start-update', this.handleStartCartUpdate);
        cart?.on('stop-update', this.handleStopUpdate);
        cart?.on('update-nodes', this.handleCartUpdate);
    }
    unmountComponent() {
        const cart = (0, utils_1.$elParent)(CART_PAGE_SELECTOR, this);
        cart?.off('start-update', this.handleStartCartUpdate);
        cart?.off('stop-update', this.handleStopUpdate);
        cart?.off('update-nodes', this.handleCartUpdate);
    }
    handleStartCartUpdate = () => {
        this.setLoading(true);
    };
    handleCartUpdate = ({ node }) => {
        this.setLoading(false);
        (0, dom_1.replaceNodeChildren)(this, (0, utils_1.$el)(`cart-buttons-block[block-id="${this.getAttribute('block-id')}"]`, node));
    };
    handleStopUpdate = () => {
        this.setLoading(false);
    };
    setLoading(isLoading) {
        const button = (0, utils_1.$el)(CHECKOUT_BUTTON_SELECTOR, this);
        button?.toggleAttribute('disabled', isLoading);
        button?.classList.toggle('loading', isLoading);
    }
}
exports.CartButtonsBlock = CartButtonsBlock;


/***/ }),

/***/ 7684:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartCountdownBlock = void 0;
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const CART_PAGE_SELECTOR = 'cart-page';
class CartCountdownBlock extends base_component_1.BaseComponent {
    mountComponent() {
        const cart = (0, utils_1.$elParent)(CART_PAGE_SELECTOR, this);
        cart?.on('update-nodes', this.handleCartUpdate);
    }
    unmountComponent() {
        const cart = (0, utils_1.$elParent)(CART_PAGE_SELECTOR, this);
        cart?.off('update-nodes', this.handleCartUpdate);
    }
    handleCartUpdate = ({ node }) => {
        (0, dom_1.replaceNodeChildren)(this, (0, utils_1.$el)(`cart-countdown-block[block-id="${this.getAttribute('block-id')}"]`, node));
    };
}
exports.CartCountdownBlock = CartCountdownBlock;


/***/ }),

/***/ 5504:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartFreeShippingBarBlock = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const CART_PAGE_SELECTOR = 'cart-page';
const FREE_SHIPPING_BAR = 'free-shipping-bar';
class CartFreeShippingBarBlock extends base_component_1.BaseComponent {
    mountComponent() {
        const cart = (0, utils_1.$elParent)(CART_PAGE_SELECTOR, this);
        cart?.on('update-nodes', this.handleCartUpdate);
    }
    unmountComponent() {
        const cart = (0, utils_1.$elParent)(CART_PAGE_SELECTOR, this);
        cart?.off('update-nodes', this.handleCartUpdate);
    }
    handleCartUpdate = (data) => {
        const bar = (0, utils_1.$el)(FREE_SHIPPING_BAR, this);
        const newBar = (0, utils_1.$el)(FREE_SHIPPING_BAR, data.node);
        if (!bar || !newBar) {
            return;
        }
        const difference = newBar.getAttribute('data-free-shipping-difference') || '';
        const differencePercent = +(newBar.getAttribute('data-free-shipping-difference-percent') || 0);
        bar.updateProgressByDifference(difference, differencePercent);
    };
}
exports.CartFreeShippingBarBlock = CartFreeShippingBarBlock;


/***/ }),

/***/ 3604:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartInCartBannerBlock = void 0;
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const CART_PAGE_SELECTOR = 'cart-page';
class CartInCartBannerBlock extends base_component_1.BaseComponent {
    mountComponent() {
        const cart = (0, utils_1.$elParent)(CART_PAGE_SELECTOR, this);
        cart?.on('update-nodes', this.handleCartUpdate);
    }
    unmountComponent() {
        const cart = (0, utils_1.$elParent)(CART_PAGE_SELECTOR, this);
        cart?.off('update-nodes', this.handleCartUpdate);
    }
    handleCartUpdate = ({ node }) => {
        (0, dom_1.replaceNodeChildren)(this, (0, utils_1.$el)(`cart-in-cart-banner-block[block-id="${this.getAttribute('block-id')}"]`, node));
    };
}
exports.CartInCartBannerBlock = CartInCartBannerBlock;


/***/ }),

/***/ 4475:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartItem = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const CHECKMARK_SELECTOR = `[data-cart-item-checkmark]`;
const QUANTITY_SELECTOR = `[data-cart-item-quantity]`;
class CartItem extends base_component_1.BaseComponent {
    mountComponent() {
        this.setHeight(this.hasAttribute('is-new') ? 0 : this.scrollHeight);
    }
    async removeItem() {
        await this.collapse();
    }
    async expand() {
        this.setHeight(this.scrollHeight);
        await (0, utils_1.transitionToPromise)(this);
    }
    async collapse() {
        this.setHeight(0);
        await (0, utils_1.transitionToPromise)(this);
    }
    async showAsNew() {
        await this.expand();
        this.removeAttribute('is-new');
        this.dispatchEvent(new Event('showAsNew', { bubbles: true }));
    }
    showCheckmark = () => {
        const checkmark = (0, utils_1.$el)(CHECKMARK_SELECTOR, this);
        checkmark?.classList.remove('hidden');
        (0, utils_1.delay)(2500).then(() => {
            checkmark?.classList.add('hidden');
        });
    };
    setLoading = (isLoading) => {
        this?.toggleAttribute('is-loading', isLoading);
    };
    setHeight(maxHeight) {
        this.style.maxHeight = `${Math.ceil(maxHeight)}px`;
    }
    setDisabled(isDisable) {
        const quantity = (0, utils_1.$el)(QUANTITY_SELECTOR, this);
        quantity?.setDisable(isDisable);
    }
}
exports.CartItem = CartItem;


/***/ }),

/***/ 3882:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartItemsBlock = void 0;
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const CART_PAGE_SELECTOR = 'cart-page';
class CartItemsBlock extends base_component_1.BaseComponent {
    mountComponent() {
        const cart = (0, utils_1.$elParent)(CART_PAGE_SELECTOR, this);
        cart?.on('update-nodes', this.handleCartUpdate);
    }
    unmountComponent() {
        const cart = (0, utils_1.$elParent)(CART_PAGE_SELECTOR, this);
        cart?.off('update-nodes', this.handleCartUpdate);
    }
    handleCartUpdate = ({ node }) => {
        (0, dom_1.replaceNodeChildren)(this, (0, utils_1.$el)(`cart-items-block[block-id="${this.getAttribute('block-id')}"]`, node));
        if ((0, utils_1.isNotThemeStore)()) {
            this.scrollIntoView({ behavior: 'smooth' });
        }
    };
}
exports.CartItemsBlock = CartItemsBlock;


/***/ }),

/***/ 3699:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartNote = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const TEXTAREA_SELECTOR = '[data-cart-note-textarea]';
const LOCAL_STORAGE_SELECTOR = 'cartNote';
const CART_SELECTOR = 'cart-page';
const CART_DRAWER_SELECTOR = 'cart-drawer';
class CartNote extends base_component_1.BaseComponent {
    valueFromLS;
    currentValue;
    mountComponent() {
        const cartDrawer = (0, utils_1.$elParent)(CART_DRAWER_SELECTOR, this);
        const cart = (0, utils_1.$elParent)(CART_SELECTOR, this);
        const textarea = (0, utils_1.$el)(TEXTAREA_SELECTOR, this);
        this.currentValue = textarea?.value;
        this.updateByLocalStorage();
        this.addListener(textarea, 'blur', this.handleTextareaBlur);
        this.addListener(window, 'storage', this.handleBetweenTabsUpdate);
        (0, utils_1.whenDefined)(CART_SELECTOR).then(() => cart?.on('cartIsEmpty', this.handleCartStatusUpdate));
        (0, utils_1.whenDefined)(CART_DRAWER_SELECTOR).then(() => cartDrawer?.on('cartIsEmpty', this.handleCartStatusUpdate));
    }
    unmountComponent() {
        const cartDrawer = (0, utils_1.$elParent)(CART_DRAWER_SELECTOR, this);
        const cart = (0, utils_1.$elParent)(CART_SELECTOR, this);
        (0, utils_1.whenDefined)(CART_SELECTOR).then(() => cart?.off('cartIsEmpty', this.handleCartStatusUpdate));
        (0, utils_1.whenDefined)(CART_DRAWER_SELECTOR).then(() => cartDrawer?.off('cartIsEmpty', this.handleCartStatusUpdate));
    }
    handleTextareaBlur = (event) => {
        const { value } = event.target;
        if (!value) {
            return;
        }
        localStorage.setItem(LOCAL_STORAGE_SELECTOR, value);
        this.currentValue = value;
    };
    updateByLocalStorage = () => {
        const textarea = (0, utils_1.$el)(TEXTAREA_SELECTOR, this);
        this.valueFromLS = localStorage.getItem(LOCAL_STORAGE_SELECTOR);
        if (this.valueFromLS !== this.currentValue) {
            textarea.value = this.valueFromLS;
            this.currentValue = this.valueFromLS;
        }
    };
    handleBetweenTabsUpdate = (event) => {
        if (event.key === LOCAL_STORAGE_SELECTOR) {
            this.updateByLocalStorage();
        }
    };
    handleCartStatusUpdate = () => {
        this.clearValueFromLS();
    };
    clearValueFromLS = () => {
        localStorage.removeItem(LOCAL_STORAGE_SELECTOR);
        this.currentValue = undefined;
    };
}
exports.CartNote = CartNote;


/***/ }),

/***/ 5629:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartOrderNotesBlock = void 0;
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const CART_PAGE_SELECTOR = 'cart-page';
class CartOrderNotesBlock extends base_component_1.BaseComponent {
    mountComponent() {
        const cart = (0, utils_1.$elParent)(CART_PAGE_SELECTOR, this);
        cart?.on('update-nodes', this.handleCartUpdate);
    }
    unmountComponent() {
        const cart = (0, utils_1.$elParent)(CART_PAGE_SELECTOR, this);
        cart?.off('update-nodes', this.handleCartUpdate);
    }
    handleCartUpdate = ({ node }) => {
        (0, dom_1.replaceNodeChildren)(this, (0, utils_1.$el)(`cart-order-notes-block[block-id="${this.getAttribute('block-id')}"]`, node));
    };
}
exports.CartOrderNotesBlock = CartOrderNotesBlock;


/***/ }),

/***/ 145:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartRelatedProductsBlock = void 0;
const dom_1 = __webpack_require__(3889);
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const RELATED_PRODUCTS_SELECTOR = '[data-cart-related-products]';
const CART_PAGE_SELECTOR = 'cart-page';
class CartRelatedProductsBlock extends base_component_1.BaseComponent {
    mountComponent() {
        const cart = (0, utils_1.$elParent)(CART_PAGE_SELECTOR, this);
        cart?.on('update-nodes', this.handleCartUpdate);
    }
    unmountComponent() {
        const cart = (0, utils_1.$elParent)(CART_PAGE_SELECTOR, this);
        cart?.off('update-nodes', this.handleCartUpdate);
    }
    handleCartUpdate = ({ node }) => {
        const relatedProducts = (0, utils_1.$el)(RELATED_PRODUCTS_SELECTOR, this);
        const newRelatedProducts = (0, utils_1.$el)(`cart-related-products-block[block-id="${this.getAttribute('block-id')}"] [data-cart-related-products]`, node);
        const isAuto = this.hasAttribute('is-auto-recommendations');
        if (!relatedProducts || !newRelatedProducts) {
            return;
        }
        if (isAuto) {
            const newUrl = newRelatedProducts.getAttribute('data-url');
            relatedProducts.setAttribute('data-url', newUrl);
            if (newUrl) {
                relatedProducts.loadProducts();
                (0, dom_1.showElement)(this);
            }
            else {
                relatedProducts.erase();
                (0, dom_1.hideElement)(this);
            }
        }
        else {
            (0, dom_1.replaceNodeChildren)(relatedProducts, newRelatedProducts);
        }
    };
}
exports.CartRelatedProductsBlock = CartRelatedProductsBlock;


/***/ }),

/***/ 7813:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartRelatedProducts = void 0;
const dom_1 = __webpack_require__(3889);
const base_component_1 = __webpack_require__(3608);
const dom_2 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const LOADING_OVERLAY_SELECTOR = '.loading-overlay';
class CartRelatedProducts extends base_component_1.BaseComponent {
    prevUrl;
    mountComponent() {
        this.loadProducts();
    }
    erase() {
        this.replaceChildren();
        this.setReady(false);
    }
    loadProducts() {
        if (this.prevUrl === this.dataset.url) {
            return;
        }
        this.prevUrl = this.dataset.url;
        if (!this.dataset.url) {
            return;
        }
        this.showPreloader();
        return fetch(this.dataset.url)
            .then(response => response.text())
            .then(text => {
            this.hidePreloader();
            this.updateByHTML((0, dom_1.parseHTML)(text));
        })
            .catch(() => {
            console.log('Error in cart related products');
        });
    }
    updateByHTML = (node) => {
        const recommendations = (0, utils_1.$el)(`#${this.id}`, node);
        (0, dom_1.replaceNodeChildren)(this, recommendations);
        const products = (0, utils_1.$list)('vertical-product-card', this);
        this.setReady(products.length > 0);
    };
    setReady(isReady) {
        this.toggleAttribute('is-ready', isReady);
    }
    showPreloader() {
        const loadingOverlay = (0, utils_1.$el)(LOADING_OVERLAY_SELECTOR, this);
        (0, dom_2.showElement)(loadingOverlay);
    }
    hidePreloader() {
        const loadingOverlay = (0, utils_1.$el)(LOADING_OVERLAY_SELECTOR, this);
        (0, dom_2.hideElement)(loadingOverlay);
    }
}
exports.CartRelatedProducts = CartRelatedProducts;


/***/ }),

/***/ 4287:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartRemoveButton = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const key_1 = __webpack_require__(9650);
class CartRemoveButton extends base_component_1.BaseComponent {
    mountComponent() {
        this.addListener(this, 'keydown', this.handleKeyDown);
        this.addListener(this, 'click', this.handleButtonClick);
    }
    handleButtonClick = (event) => {
        event.preventDefault();
        this.update();
    };
    handleKeyDown = (event) => {
        if ((0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            this.update();
        }
    };
    update() {
        const cart = (0, utils_1.$elParent)('cart-page, cart-drawer', this);
        const index = this.dataset.index;
        if (cart && index) {
            cart.updateItem(+index, 0);
        }
    }
}
exports.CartRemoveButton = CartRemoveButton;


/***/ }),

/***/ 8261:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartSubtotalBlock = void 0;
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const CART_PAGE_SELECTOR = 'cart-page';
class CartSubtotalBlock extends base_component_1.BaseComponent {
    mountComponent() {
        const cart = (0, utils_1.$elParent)(CART_PAGE_SELECTOR, this);
        cart?.on('update-nodes', this.handleCartUpdate);
    }
    unmountComponent() {
        const cart = (0, utils_1.$elParent)(CART_PAGE_SELECTOR, this);
        cart?.off('update-nodes', this.handleCartUpdate);
    }
    handleCartUpdate = ({ node }) => {
        (0, dom_1.replaceNodeChildren)(this, (0, utils_1.$el)(`cart-subtotal-block[block-id="${this.getAttribute('block-id')}"]`, node));
    };
}
exports.CartSubtotalBlock = CartSubtotalBlock;


/***/ }),

/***/ 1678:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartPage = void 0;
const base_component_1 = __webpack_require__(3608);
const cart_api_1 = __webpack_require__(735);
const fetch_config_1 = __webpack_require__(8548);
const dom_1 = __webpack_require__(3889);
const debounce_1 = __webpack_require__(2731);
const utils_1 = __webpack_require__(4083);
const BODY_ELEMENT_SELECTOR = 'body-element';
class CartPage extends base_component_1.BaseComponent {
    cartAPI = new cart_api_1.CartAPI();
    cartState;
    mountComponent() {
        this.setCartState();
        this.addListener(this, 'change', this.handleCartChange);
        this.addListener(this, 'change', this.handleItemChange);
    }
    handleItemChange = (event) => {
        const item = (0, utils_1.$el)(`#CartItem-${+event.target.dataset.index}`, this);
        item?.setLoading(true);
        this.setLoadingStatus(true);
    };
    handleCartChange = (0, debounce_1.debounce)((event) => {
        this.updateItem(+event.target.dataset.index, event.target.value);
    }, 500);
    setCartState = () => {
        this.cartState = this.cloneNode(true);
    };
    resetToPrevCartState = () => {
        this.replaceWith(this.cartState);
    };
    updateItem(itemIndex, quantity) {
        const item = (0, utils_1.$el)(`#CartItem-${itemIndex}`);
        if (!item) {
            return;
        }
        this.setLoadingStatus(true);
        const currentQuantity = +(item.dataset.quantity || 0);
        if (currentQuantity === +quantity) {
            item.setLoading(false);
            this.setLoadingStatus(false);
            return;
        }
        if (+quantity === 0) {
            const items = (0, utils_1.$list)('cart-item', this);
            this.updateEmptyStatus(items.length === 1);
            item.removeItem();
        }
        this.emit('start-update', {});
        item.setDisabled(true);
        this.cartAPI
            .change({
            ...(0, fetch_config_1.fetchConfig)(),
            body: JSON.stringify({
                line: itemIndex + 1,
                quantity,
                sections: this.dataset.sectionId,
                sections_url: window.location.pathname,
            }),
        })
            .then(state => {
            item.setDisabled(false);
            item.setLoading(false);
            this.setLoadingStatus(false);
            this.emit('update-nodes', {
                node: (0, dom_1.parseHTML)(JSON.parse(state).sections[this.dataset.sectionId]),
            });
            this.setCartState();
        })
            .catch(() => {
            this.showError();
            item.setDisabled(false);
            item.setLoading(false);
            this.setLoadingStatus(false);
            this.emit('stop-update', {});
            this.resetToPrevCartState();
        });
    }
    setLoadingStatus(isLoading) {
        this.classList.toggle('is-cart-loading', isLoading);
    }
    async purchaseHandler(html, parsedState) {
        this.emit('update-nodes', {
            node: html,
        });
        const item = (0, utils_1.$el)(`cart-item[data-variant-id="${parsedState.id}"]`, this);
        if (!item) {
            return;
        }
        if (parsedState.quantity === 1) {
            await item.showAsNew();
        }
        item.showCheckmark();
    }
    showError() {
        const bodyElement = (0, utils_1.$el)(BODY_ELEMENT_SELECTOR);
        bodyElement.showNotification(window.auroraThemeLocales.cartStrings.error, 'warning');
    }
    updateEmptyStatus(isEmpty) {
        this.classList.toggle('is-empty', isEmpty);
        if (isEmpty) {
            this.emit('cartIsEmpty', {});
        }
    }
}
exports.CartPage = CartPage;


/***/ }),

/***/ 1636:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CartPage = exports.CartSubtotalBlock = exports.CartRemoveButton = exports.CartRelatedProductsBlock = exports.CartRelatedProducts = exports.CartOrderNotesBlock = exports.CartNote = exports.CartItemsBlock = exports.CartItem = exports.CartInCartBannerBlock = exports.CartFreeShippingBarBlock = exports.CartCountdownBlock = exports.CartButtonsBlock = exports.CartAppBlock = void 0;
var cart_app_block_1 = __webpack_require__(3828);
Object.defineProperty(exports, "CartAppBlock", ({ enumerable: true, get: function () { return cart_app_block_1.CartAppBlock; } }));
var cart_buttons_block_1 = __webpack_require__(5151);
Object.defineProperty(exports, "CartButtonsBlock", ({ enumerable: true, get: function () { return cart_buttons_block_1.CartButtonsBlock; } }));
var cart_countdown_block_1 = __webpack_require__(7684);
Object.defineProperty(exports, "CartCountdownBlock", ({ enumerable: true, get: function () { return cart_countdown_block_1.CartCountdownBlock; } }));
var cart_free_shipping_bar_block_1 = __webpack_require__(5504);
Object.defineProperty(exports, "CartFreeShippingBarBlock", ({ enumerable: true, get: function () { return cart_free_shipping_bar_block_1.CartFreeShippingBarBlock; } }));
var cart_in_cart_banner_block_1 = __webpack_require__(3604);
Object.defineProperty(exports, "CartInCartBannerBlock", ({ enumerable: true, get: function () { return cart_in_cart_banner_block_1.CartInCartBannerBlock; } }));
var cart_item_1 = __webpack_require__(4475);
Object.defineProperty(exports, "CartItem", ({ enumerable: true, get: function () { return cart_item_1.CartItem; } }));
var cart_items_block_1 = __webpack_require__(3882);
Object.defineProperty(exports, "CartItemsBlock", ({ enumerable: true, get: function () { return cart_items_block_1.CartItemsBlock; } }));
var cart_note_1 = __webpack_require__(3699);
Object.defineProperty(exports, "CartNote", ({ enumerable: true, get: function () { return cart_note_1.CartNote; } }));
var cart_order_notes_block_1 = __webpack_require__(5629);
Object.defineProperty(exports, "CartOrderNotesBlock", ({ enumerable: true, get: function () { return cart_order_notes_block_1.CartOrderNotesBlock; } }));
var cart_related_products_1 = __webpack_require__(7813);
Object.defineProperty(exports, "CartRelatedProducts", ({ enumerable: true, get: function () { return cart_related_products_1.CartRelatedProducts; } }));
var cart_related_products_block_1 = __webpack_require__(145);
Object.defineProperty(exports, "CartRelatedProductsBlock", ({ enumerable: true, get: function () { return cart_related_products_block_1.CartRelatedProductsBlock; } }));
var cart_remove_btn_1 = __webpack_require__(4287);
Object.defineProperty(exports, "CartRemoveButton", ({ enumerable: true, get: function () { return cart_remove_btn_1.CartRemoveButton; } }));
var cart_subtotal_block_1 = __webpack_require__(8261);
Object.defineProperty(exports, "CartSubtotalBlock", ({ enumerable: true, get: function () { return cart_subtotal_block_1.CartSubtotalBlock; } }));
var cart_1 = __webpack_require__(1678);
Object.defineProperty(exports, "CartPage", ({ enumerable: true, get: function () { return cart_1.CartPage; } }));


/***/ }),

/***/ 3513:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ColumnSwitcher = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const key_1 = __webpack_require__(9650);
const ITEM_SELECTOR = `[data-column-switcher-item]`;
const TARGET_SELECTOR = `[data-column-switcher-target]`;
class ColumnSwitcher extends base_component_1.BaseComponent {
    mountComponent() {
        const items = (0, utils_1.$list)(ITEM_SELECTOR, this);
        items.forEach(item => {
            this.addListener(item, 'keydown', this.handleKeyDown);
            this.addListener(item, 'click', this.handleItemClick);
        });
        if (this.isEditor) {
            this.editor.on('SECTION_LOAD', this.handleSectionLoad);
        }
        else {
            this.init();
        }
    }
    handleSectionLoad = (event) => {
        if (this.dataset.sectionId === event.detail.sectionId) {
            this.reset();
        }
    };
    handleItemClick = (event) => {
        event.preventDefault();
        const item = (0, utils_1.$elParent)(ITEM_SELECTOR, event.target);
        if (item) {
            this.updateByCount(+(item.dataset.value || 1));
        }
    };
    handleKeyDown = (event) => {
        if ((0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            const item = (0, utils_1.$elParent)(ITEM_SELECTOR, event.target);
            if (item) {
                this.updateByCount(+(item.dataset.value || 1));
            }
        }
    };
    updateByCount(newCount) {
        this.setIndicator(newCount);
        this.updateGrid(newCount);
    }
    setIndicator(columnCount) {
        const items = (0, utils_1.$list)(ITEM_SELECTOR, this);
        items.forEach(item => {
            const value = +(item.getAttribute('data-value') || 1);
            item.classList.toggle('selected', value === columnCount);
        });
    }
    updateGrid(value) {
        const target = (0, utils_1.$elParent)(TARGET_SELECTOR, this);
        if (target) {
            target.style.setProperty(`--gsc-${this.dataset.columnSwitcherCssVariable}`, value.toString());
            localStorage.setItem(`products-${this.dataset.columnSwitcherCssVariable}`, value.toString());
        }
    }
    init() {
        const value = localStorage.getItem(`products-${this.dataset.columnSwitcherCssVariable}`);
        if (!value || value === 'null') {
            return;
        }
        const preparedValue = Number(value);
        if (preparedValue > 0) {
            this.updateByCount(preparedValue);
        }
    }
    reset() {
        if (!this.dataset.default) {
            return;
        }
        this.updateByCount(Number(this.dataset.default));
    }
}
exports.ColumnSwitcher = ColumnSwitcher;


/***/ }),

/***/ 7794:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FilterRemoveBtn = void 0;
const base_component_1 = __webpack_require__(3608);
const key_1 = __webpack_require__(9650);
const utils_1 = __webpack_require__(4083);
const ACTIVE_FILTERS_SELECTOR = 'shop-active-filters';
const SHOP_COMPONENT_SELECTOR = 'shop-component';
class FilterRemoveBtn extends base_component_1.BaseComponent {
    mountComponent() {
        this.addListener(this, 'keydown', this.handleKeyDown);
        this.addListener(this, 'click', this.handleButtonClick);
    }
    handleButtonClick = (event) => {
        event.preventDefault();
        this.update();
    };
    handleKeyDown = (event) => {
        if ((0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            this.update();
        }
    };
    update() {
        this.updateShop();
        this.updateActiveFilters();
    }
    updateShop() {
        const isResetButton = this.hasAttribute('data-filters-reset');
        const shop = (0, utils_1.$el)(SHOP_COMPONENT_SELECTOR);
        const url = this.dataset.url || '';
        let preparedSearchParams;
        if (shop) {
            if (isResetButton) {
                preparedSearchParams = '';
                shop.reset();
            }
            else {
                preparedSearchParams =
                    url.indexOf('?') === -1 ? '' : url.slice(url.indexOf('?') + 1);
            }
            shop.updateBySearchParams(preparedSearchParams);
        }
    }
    updateActiveFilters() {
        const activeFilters = (0, utils_1.$el)(ACTIVE_FILTERS_SELECTOR);
        if (activeFilters) {
            const isRemoveButton = this.hasAttribute('data-filter-remove-btn');
            const isResetButton = this.hasAttribute('data-filters-reset');
            if (isResetButton) {
                activeFilters.reset();
            }
            if (isRemoveButton) {
                if (activeFilters.buttons.length === 1) {
                    activeFilters.reset();
                }
                else {
                    activeFilters.setDisable();
                    this.remove();
                }
            }
        }
    }
}
exports.FilterRemoveBtn = FilterRemoveBtn;


/***/ }),

/***/ 4980:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FiltersSubmitBtn = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const SHOP_COMPONENT_SELECTOR = 'shop-component';
const SIDEBAR_COMPONENT_SELECTOR = '#SidebarFiltersMobile';
class FiltersSubmitBtn extends base_component_1.BaseComponent {
    mountComponent() {
        this.addListener(this, 'click', this.handleButtonClick);
    }
    handleButtonClick = (event) => {
        event.preventDefault();
        const shop = (0, utils_1.$el)(SHOP_COMPONENT_SELECTOR);
        const sidebar = (0, utils_1.$elParent)(SIDEBAR_COMPONENT_SELECTOR, this);
        if (shop && sidebar) {
            const searchParams = [shop.filterQuery, shop.sortQuery].join('&');
            const preparedUrl = `${window.location.pathname}?${shop.formatParams(searchParams) || ''}`;
            shop.updateURL(searchParams, preparedUrl);
            shop.updateShop(preparedUrl);
            sidebar.hide();
        }
    };
}
exports.FiltersSubmitBtn = FiltersSubmitBtn;


/***/ }),

/***/ 3389:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShopComponent = exports.SortList = exports.SidebarFiltersStickyMobileButton = exports.SidebarFiltersMobile = exports.SidebarFiltersDesktop = exports.SidebarFilters = exports.ShopActiveFilters = exports.PriceRange = exports.ListBtn = exports.ListComponent = exports.FiltersSubmitBtn = exports.FilterRemoveBtn = exports.ColumnSwitcher = void 0;
var column_switcher_1 = __webpack_require__(3513);
Object.defineProperty(exports, "ColumnSwitcher", ({ enumerable: true, get: function () { return column_switcher_1.ColumnSwitcher; } }));
var filter_remove_btn_1 = __webpack_require__(7794);
Object.defineProperty(exports, "FilterRemoveBtn", ({ enumerable: true, get: function () { return filter_remove_btn_1.FilterRemoveBtn; } }));
var filters_submit_btn_1 = __webpack_require__(4980);
Object.defineProperty(exports, "FiltersSubmitBtn", ({ enumerable: true, get: function () { return filters_submit_btn_1.FiltersSubmitBtn; } }));
var list_1 = __webpack_require__(9790);
Object.defineProperty(exports, "ListComponent", ({ enumerable: true, get: function () { return list_1.ListComponent; } }));
var list_btn_1 = __webpack_require__(2772);
Object.defineProperty(exports, "ListBtn", ({ enumerable: true, get: function () { return list_btn_1.ListBtn; } }));
var price_range_1 = __webpack_require__(2874);
Object.defineProperty(exports, "PriceRange", ({ enumerable: true, get: function () { return price_range_1.PriceRange; } }));
var shop_active_filters_1 = __webpack_require__(5513);
Object.defineProperty(exports, "ShopActiveFilters", ({ enumerable: true, get: function () { return shop_active_filters_1.ShopActiveFilters; } }));
var sidebar_filters_1 = __webpack_require__(8030);
Object.defineProperty(exports, "SidebarFilters", ({ enumerable: true, get: function () { return sidebar_filters_1.SidebarFilters; } }));
var sidebar_filters_desktop_1 = __webpack_require__(1184);
Object.defineProperty(exports, "SidebarFiltersDesktop", ({ enumerable: true, get: function () { return sidebar_filters_desktop_1.SidebarFiltersDesktop; } }));
var sidebar_filters_mobile_1 = __webpack_require__(9246);
Object.defineProperty(exports, "SidebarFiltersMobile", ({ enumerable: true, get: function () { return sidebar_filters_mobile_1.SidebarFiltersMobile; } }));
var sidebar_filters_mobile_sticky_button_1 = __webpack_require__(7607);
Object.defineProperty(exports, "SidebarFiltersStickyMobileButton", ({ enumerable: true, get: function () { return sidebar_filters_mobile_sticky_button_1.SidebarFiltersStickyMobileButton; } }));
var sort_list_1 = __webpack_require__(8590);
Object.defineProperty(exports, "SortList", ({ enumerable: true, get: function () { return sort_list_1.SortList; } }));
var shop_1 = __webpack_require__(2993);
Object.defineProperty(exports, "ShopComponent", ({ enumerable: true, get: function () { return shop_1.ShopComponent; } }));


/***/ }),

/***/ 2772:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ListBtn = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const key_1 = __webpack_require__(9650);
const LIST_SELECTOR = 'list-component';
class ListBtn extends base_component_1.BaseComponent {
    mountComponent() {
        this.addListener(this, 'keydown', this.handleKeyDown);
        this.addListener(this, 'click', this.handleButtonClick);
    }
    handleButtonClick = (event) => {
        event.preventDefault();
        this.update();
    };
    handleKeyDown = (event) => {
        if ((0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            this.update();
        }
    };
    update() {
        const list = (0, utils_1.$elParent)(LIST_SELECTOR, this);
        if (this.dataset.trigger === 'collapse') {
            list?.collapse();
        }
        else {
            list?.expand();
        }
    }
}
exports.ListBtn = ListBtn;


/***/ }),

/***/ 9790:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ListComponent = void 0;
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const ITEM_SELECTOR = `[data-list-item]`;
const EXPAND_BTN_SELECTOR = `list-btn[data-trigger="expand"]`;
const COLLAPSE_BTN_SELECTOR = `list-btn[data-trigger="collapse"]`;
const VISIBLE_ITEM_SELECTOR = `${ITEM_SELECTOR}:not(.hidden)`;
const HIDDEN_ITEM_SELECTOR = `${ITEM_SELECTOR}.hidden`;
class ListComponent extends base_component_1.BaseComponent {
    initialHeight;
    maxHeight;
    setInitialHeight() {
        this.initialHeight = Math.ceil(this.offsetHeight);
        this.style.maxHeight = `${this.initialHeight}px`;
    }
    setHeight() {
        this.maxHeight = Math.ceil(this.scrollHeight);
        this.style.maxHeight = `${this.maxHeight}px`;
    }
    collapse = () => {
        const expandBtn = (0, utils_1.$el)(EXPAND_BTN_SELECTOR, this);
        const collapseBtn = (0, utils_1.$el)(COLLAPSE_BTN_SELECTOR, this);
        this.hideItems();
        (0, dom_1.hideElement)(collapseBtn);
        (0, dom_1.showElement)(expandBtn);
        expandBtn.focus();
    };
    expand = () => {
        const collapseBtn = (0, utils_1.$el)(COLLAPSE_BTN_SELECTOR, this);
        if (!this.initialHeight) {
            this.setInitialHeight();
        }
        this.showItems();
        this.tryHideExpandBtn();
        (0, dom_1.showElement)(collapseBtn);
        collapseBtn.focus();
        this.setHeight();
    };
    hideItems() {
        const visibleItems = (0, utils_1.$list)(VISIBLE_ITEM_SELECTOR, this);
        this.style.maxHeight = `${this.initialHeight}px`;
        (0, utils_1.transitionToPromise)(this).then(() => {
            visibleItems.forEach((node, index) => {
                const initialCount = this.dataset.initialCount
                    ? +this.dataset.initialCount
                    : 0;
                if (index + 1 > +initialCount) {
                    (0, dom_1.hideElement)(node);
                }
            });
        });
    }
    showItems() {
        const hiddenItems = (0, utils_1.$list)(HIDDEN_ITEM_SELECTOR, this);
        hiddenItems.forEach((node, index) => {
            const showCount = this.dataset.showCount ? this.dataset.showCount : 0;
            if (index + 1 < +showCount) {
                (0, dom_1.showElement)(node);
            }
        });
        this.style.maxHeight = `${this.maxHeight}px`;
    }
    tryHideExpandBtn() {
        const expandBtn = (0, utils_1.$el)(EXPAND_BTN_SELECTOR, this);
        const hiddenItems = (0, utils_1.$list)(HIDDEN_ITEM_SELECTOR, this);
        if (hiddenItems.length === 0) {
            (0, dom_1.hideElement)(expandBtn);
        }
    }
}
exports.ListComponent = ListComponent;


/***/ }),

/***/ 2874:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PriceRange = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const MIN_RANGE_NUMBER_SELECTOR = `[data-price-min-range-number]`;
const MAX_RANGE_NUMBER_SELECTOR = `[data-price-max-range-number]`;
const RANGE_INPUTS_WRAPPER_SELECTOR = `[data-price-range-inputs-wrapper]`;
const MIN_RANGE_INPUT_SELECTOR = `[data-price-min-range-input]`;
const MAX_RANGE_INPUT_SELECTOR = `[data-price-max-range-input]`;
const PRICE_RANGE_PROGRESS_SELECTOR = `[data-price-range-progress]`;
class PriceRange extends base_component_1.BaseComponent {
    minNumberInput;
    maxNumberInput;
    rangeWrapper;
    minRangeInput;
    maxRangeInput;
    progress;
    currencyWithoutDecimals;
    numbersAfterComma;
    constructor() {
        super();
        this.minNumberInput = (0, utils_1.$el)(MIN_RANGE_NUMBER_SELECTOR, this);
        this.maxNumberInput = (0, utils_1.$el)(MAX_RANGE_NUMBER_SELECTOR, this);
        this.rangeWrapper = (0, utils_1.$el)(RANGE_INPUTS_WRAPPER_SELECTOR, this);
        this.minRangeInput = (0, utils_1.$el)(MIN_RANGE_INPUT_SELECTOR, this);
        this.maxRangeInput = (0, utils_1.$el)(MAX_RANGE_INPUT_SELECTOR, this);
        this.progress = (0, utils_1.$el)(PRICE_RANGE_PROGRESS_SELECTOR, this);
    }
    mountComponent() {
        if (this.minRangeInput) {
            this.updateMinRangeInput(+this.minRangeInput.value);
            this.updateMinPriceInput(+this.minRangeInput.value);
        }
        if (this.maxRangeInput) {
            this.updateMaxRangeInput(+this.maxRangeInput.value);
            this.updateMaxPriceInput(+this.maxRangeInput.value);
        }
        this.addListener(this.minNumberInput, 'input', this.handleNumberChange);
        this.addListener(this.maxNumberInput, 'input', this.handleNumberChange);
        this.addListener(this.minRangeInput, 'input', this.handleRangeChange);
        this.addListener(this.maxRangeInput, 'input', this.handleRangeChange);
        this.addListener(this.rangeWrapper, 'mouseenter', this.handleRangeInput);
        this.addListener(this.rangeWrapper, 'mousemove', this.handleRangeInput);
    }
    handleRangeInput = (event) => {
        const maxInput = (0, utils_1.$el)(`[data-price-range-max-input]`, this);
        const minInput = (0, utils_1.$el)(`[data-price-range-min-input]`, this);
        if (this.progress && minInput && maxInput) {
            const middleOfProgress = this.progress.offsetLeft + this.progress.offsetWidth / 2;
            const isMinInputClosest = event.offsetX < middleOfProgress;
            minInput.toggleAttribute('targeted', isMinInputClosest);
            maxInput.toggleAttribute('targeted', !isMinInputClosest);
        }
    };
    handleNumberChange = () => {
        if (this.minNumberInput && this.maxNumberInput) {
            const minPrice = parseFloat(this.minNumberInput.value);
            const maxPrice = parseFloat(this.maxNumberInput.value);
            this.updateMinRangeInput(minPrice);
            this.updateMaxRangeInput(maxPrice);
        }
    };
    handleRangeChange = () => {
        if (this.minRangeInput && this.maxRangeInput) {
            const minVal = parseFloat(this.minRangeInput.value);
            const maxVal = parseFloat(this.maxRangeInput.value);
            this.updateMaxPriceInput(maxVal);
            this.updateMaxRangeInput(maxVal);
            this.updateMinPriceInput(minVal);
            this.updateMinRangeInput(minVal);
        }
    };
    updateMaxRangeInput(newValue) {
        const value = Math.ceil(newValue);
        if (this.maxRangeInput && this.progress) {
            const rightPosition = 100 - (value / +this.maxRangeInput.max) * 100;
            this.maxRangeInput.value = `${value}`;
            this.progress.style.right = `${rightPosition}%`;
        }
    }
    updateMinRangeInput(newValue) {
        const value = Math.ceil(newValue);
        if (this.minRangeInput && this.progress) {
            this.minRangeInput.value = `${value}`;
            this.progress.style.left = `${(value / +this.minRangeInput.max) * 100}%`;
        }
    }
    updateMaxPriceInput(newValue) {
        const value = Math.ceil(newValue);
        if (this.maxNumberInput) {
            this.maxNumberInput.value = value.toFixed(0);
        }
    }
    updateMinPriceInput(newValue) {
        const value = Math.ceil(newValue);
        if (this.minNumberInput) {
            this.minNumberInput.value = value.toFixed(0);
        }
    }
}
exports.PriceRange = PriceRange;


/***/ }),

/***/ 5513:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShopActiveFilters = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const ACTIVE_FILTERS_OPTIONS_SELECTOR = `[data-shop-active-filters-options]`;
const ACTIVE_FILTERS_REMOVE_BTN_SELECTOR = `[data-filter-remove-btn]`;
class ShopActiveFilters extends base_component_1.BaseComponent {
    reset() {
        this.replaceChildren();
    }
    setDisable() {
        const options = (0, utils_1.$el)(ACTIVE_FILTERS_OPTIONS_SELECTOR, this);
        options?.setAttribute('disabled', '');
    }
    get buttons() {
        return (0, utils_1.$list)(ACTIVE_FILTERS_REMOVE_BTN_SELECTOR, this);
    }
}
exports.ShopActiveFilters = ShopActiveFilters;


/***/ }),

/***/ 2993:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShopComponent = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
const ELEMENTS = [
    'ShopProducts',
    'ShopProductCount',
    'ShopSortList',
    'ShopActiveFilters',
];
const PRELOADER_SELECTOR = '#ShopProductsOverlay';
const MOBILE_FILTER_SELECTOR = '#SidebarFiltersMobile';
const DESKTOP_FILTER_SELECTOR = '#SidebarFiltersDesktop';
class ShopComponent extends base_component_1.BaseComponent {
    searchParamsInitial;
    searchParamsPrev;
    sortQuery = '';
    filterQuery = '';
    constructor() {
        super();
        this.searchParamsInitial = window.location.search.slice(1);
        this.searchParamsPrev = this.searchParamsInitial;
    }
    mountComponent() {
        this.addListener(window, 'popstate', this.handleHistoryChange);
    }
    handleHistoryChange = ({ state: { searchParams } }) => {
        const newSearchParams = searchParams || this.searchParamsInitial;
        if (newSearchParams !== this.searchParamsPrev) {
            this.updateBySearchParams(newSearchParams);
        }
    };
    formatParams(searchParams) {
        this.searchParamsPrev = searchParams;
        return `${this.dataset.baseParams ? `${this.dataset.baseParams}` : ''}${searchParams}`;
    }
    updateBySearchParams(searchParams) {
        const baseUrl = window.location.pathname;
        const params = `${this.formatParams(searchParams ? `${searchParams}` : '')}`;
        const url = baseUrl + '?' + params;
        this.updateURL(searchParams, url);
        this.updateShop(url);
        this.updateFilters(url);
    }
    async getFromUrl(url) {
        const preloaderElement = (0, utils_1.$el)(PRELOADER_SELECTOR, this);
        preloaderElement.classList.remove('hidden');
        return fetch(url)
            .then(response => response.text())
            .then(responseText => {
            preloaderElement.classList.add('hidden');
            return (0, dom_1.parseHTML)(responseText);
        })
            .catch(() => console.log('Error in shop component'));
    }
    updateShop(url) {
        this.getFromUrl(url).then(html => {
            ELEMENTS.forEach(elementId => {
                const element = (0, utils_1.$el)(`#${elementId}`);
                const newElement = (0, utils_1.$el)(`#${elementId}`, html);
                (0, dom_1.replaceNodeChildren)(element, newElement);
            });
            this.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
    updateFilters(url) {
        // @ts-expect-error
        const filters = (0, utils_1.$list)(`${MOBILE_FILTER_SELECTOR}, ${DESKTOP_FILTER_SELECTOR}`);
        filters.forEach(filter => {
            filter.preloader.classList.remove('hidden');
        });
        this.getFromUrl(url).then(html => {
            filters.forEach(filter => {
                filter.updateHTML(html);
                filter.preloader.classList.add('hidden');
            });
            this.emit('filtersUpdated', {});
        });
    }
    updateURL(searchParams, url) {
        history.pushState({ searchParams }, '', url);
    }
    reset() {
        this.sortQuery = '';
        this.filterQuery = '';
    }
}
exports.ShopComponent = ShopComponent;


/***/ }),

/***/ 1184:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SidebarFiltersDesktop = void 0;
const utils_1 = __webpack_require__(4083);
const sidebar_filters_1 = __webpack_require__(8030);
const SHOP_SELECTOR = 'shop-component';
const BODY_ELEMENT_SELECTOR = 'body-element';
class SidebarFiltersDesktop extends sidebar_filters_1.SidebarFilters {
    handleSectionLoad = () => { };
    change() {
        const shop = (0, utils_1.$el)(SHOP_SELECTOR);
        if (shop) {
            this.createQuery();
            shop.updateBySearchParams(this.searchParams);
        }
    }
    async open(event) {
        const bodyElement = (0, utils_1.$el)(BODY_ELEMENT_SELECTOR);
        const isEmbedFilters = this.hasAttribute('is-embed-filters');
        if (isEmbedFilters && window.scrollY > 0) {
            bodyElement.setScrollLock();
            await super.open(event);
            bodyElement.unsetScrollLock();
        }
        else {
            await super.open(event);
        }
    }
    handleSidebarFocusout = event => {
        const focusTarget = event.relatedTarget;
        const isEmbedFilters = this.hasAttribute('is-embed-filters');
        if (isEmbedFilters) {
            return;
        }
        if (!focusTarget || !this.contains(focusTarget)) {
            const { firstTarget } = (0, utils_1.getTargets)(this.element);
            firstTarget.focus();
        }
    };
    reInitFocus = () => {
        if (!this.isOpen) {
            return;
        }
        const { firstTarget } = (0, utils_1.getTargets)(this);
        firstTarget?.focus();
    };
}
exports.SidebarFiltersDesktop = SidebarFiltersDesktop;


/***/ }),

/***/ 7607:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SidebarFiltersStickyMobileButton = void 0;
const debounce_1 = __webpack_require__(2731);
const sidebar_button_1 = __webpack_require__(9315);
const utils_1 = __webpack_require__(4083);
const FOOTER_SELECTOR = '.shopify-section-footer';
const PRODUCTS_SELECTOR = '#ShopProducts';
const THRESHOLD_FOR_EXTEND = 24;
class SidebarFiltersStickyMobileButton extends sidebar_button_1.SidebarButton {
    prevScrollY;
    mountComponent() {
        super.mountComponent();
        this.addListener(window, 'scroll', this.handleWindowScroll);
    }
    handleWindowScroll = () => {
        if (!this.prevScrollY) {
            this.prevScrollY = window.scrollY;
        }
        this.updateVisibleStatus();
        this.updateExtendStatus();
    };
    updateVisibleStatus() {
        const products = (0, utils_1.$el)(PRODUCTS_SELECTOR);
        const footer = (0, utils_1.$el)(FOOTER_SELECTOR);
        const rect = products?.getBoundingClientRect();
        const footerOffsetTop = footer ? footer.offsetTop : 0;
        const isUnderFooter = window.innerHeight + window.scrollY < footerOffsetTop;
        const isUnderProduct = rect.top < 0;
        const isVisible = isUnderFooter && isUnderProduct;
        this.toggleAttribute('is-visible', isVisible);
        document.body.toggleAttribute('is-filters-button-fixed', isVisible);
    }
    updateExtendStatus = (0, debounce_1.debounce)(() => {
        const distance = Math.abs(window.scrollY - this.prevScrollY);
        if (distance > THRESHOLD_FOR_EXTEND) {
            this.toggleAttribute('is-extended', this.prevScrollY > window.scrollY);
        }
        this.prevScrollY = 0;
    }, 50);
}
exports.SidebarFiltersStickyMobileButton = SidebarFiltersStickyMobileButton;


/***/ }),

/***/ 9246:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SidebarFiltersMobile = void 0;
const utils_1 = __webpack_require__(4083);
const dom_1 = __webpack_require__(3889);
const sidebar_filters_1 = __webpack_require__(8030);
const FILTER_REMOVE_BUTTON_SELECTOR = 'filter-remove-btn';
const SHOP_SELECTOR = 'shop-component';
class SidebarFiltersMobile extends sidebar_filters_1.SidebarFilters {
    change() {
        const shop = (0, utils_1.$el)(SHOP_SELECTOR);
        if (shop) {
            this.createQuery();
            shop.updateBySearchParams(this.searchParams);
            const preparedUrl = `${window.location.pathname}?${shop.formatParams(this.searchParams) || ''}`;
            shop.updateFilters(preparedUrl);
            this.setButtonForReset();
        }
    }
    setButtonForReset() {
        const button = (0, utils_1.$el)(FILTER_REMOVE_BUTTON_SELECTOR, this.element);
        if (button) {
            const isHidden = button.classList.contains('hidden');
            if (isHidden) {
                (0, dom_1.showElement)(button);
            }
        }
    }
}
exports.SidebarFiltersMobile = SidebarFiltersMobile;


/***/ }),

/***/ 8030:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SidebarFilters = void 0;
const dom_1 = __webpack_require__(3889);
const sidebar_1 = __webpack_require__(4622);
const utils_1 = __webpack_require__(4083);
const key_1 = __webpack_require__(9650);
const FORM_SELECTOR = '[data-filters-form]';
const CHECKBOX_SELECTOR = '[data-filters-checkbox]';
const SHOP_SELECTOR = 'shop-component';
const HEADER_SELECTOR = '[data-filters-header]';
const PRELOADER_SELECTOR = '[data-filters-loading-overlay]';
class SidebarFilters extends sidebar_1.SidebarComponent {
    mountComponent() {
        super.mountComponent();
        const form = (0, utils_1.$el)(FORM_SELECTOR, this.element);
        this.addListener(form, 'scroll', this.handleFormScroll);
        this.addListener(form, 'change', this.handleInputChange);
        this.addListener(this, 'click', this.handleClick);
        this.addListener(form, 'keydown', this.handleFormKeydown);
        const shop = (0, utils_1.$el)(SHOP_SELECTOR);
        shop.on('filtersUpdated', this.reInitFocus);
    }
    handleFormScroll = () => {
        const form = (0, utils_1.$el)(FORM_SELECTOR, this.element);
        if (form) {
            this.toggleAttribute('header-shadow-visible', form.scrollTop > 0);
        }
    };
    handleClick = (event) => {
        const label = (0, utils_1.$elParent)(CHECKBOX_SELECTOR, event.target);
        if (label) {
            label.setAttribute('selected', '');
        }
    };
    handleFormKeydown = (event) => {
        if ((0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            const target = event.target;
            if (target.tagName === 'INPUT') {
                target.dispatchEvent(new MouseEvent('click', { button: 0, which: 1 }));
            }
        }
    };
    handleInputChange = (event) => {
        const target = event.target;
        if (target.tagName === 'INPUT') {
            this.change();
        }
    };
    createQuery() {
        const form = (0, utils_1.$el)(FORM_SELECTOR, this.element);
        const shop = (0, utils_1.$el)(SHOP_SELECTOR);
        if (form && shop) {
            const formData = new FormData(form);
            const filterQuery = new URLSearchParams(formData).toString();
            shop.filterQuery = filterQuery;
        }
    }
    updateHTML(html) {
        let newElement;
        const filterId = this.getAttribute('id');
        const newFilter = filterId ? (0, utils_1.$el)(`#${filterId}`, html) : null;
        if (this.hasAttribute('is-open-on-init')) {
            newElement = newFilter ? (0, utils_1.$el)('[data-sidebar-body]', newFilter) : null;
        }
        else {
            const newTemplate = newFilter
                ? (0, utils_1.$el)(`[data-sidebar-template="${this.id}"]`, newFilter)
                : null;
            if (newTemplate) {
                newElement = (0, dom_1.getTemplateFirstChild)(newTemplate);
            }
        }
        if (newElement) {
            this.updateFormByElement(newElement);
            this.updateHeaderByElement(newElement);
        }
    }
    updateHeaderByElement(newElement) {
        const header = (0, utils_1.$el)(HEADER_SELECTOR, this.element);
        const newHeader = (0, utils_1.$el)(HEADER_SELECTOR, newElement);
        (0, dom_1.replaceNodeChildren)(header, newHeader);
    }
    updateFormByElement(newElement) {
        const form = (0, utils_1.$el)(FORM_SELECTOR, this.element);
        const newForm = (0, utils_1.$el)(FORM_SELECTOR, newElement);
        (0, dom_1.replaceNodeChildren)(form, newForm);
    }
    reInitFocus = () => {
        // re-define in children
    };
    change() {
        // re-define in children
    }
    get searchParams() {
        const shop = (0, utils_1.$el)(SHOP_SELECTOR);
        if (!shop) {
            return '';
        }
        return [shop.filterQuery, shop.sortQuery].join('&');
    }
    get preloader() {
        return (0, utils_1.$el)(PRELOADER_SELECTOR, this.element);
    }
}
exports.SidebarFilters = SidebarFilters;


/***/ }),

/***/ 8590:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SortList = void 0;
const base_component_1 = __webpack_require__(3608);
const key_1 = __webpack_require__(9650);
const debounce_1 = __webpack_require__(2731);
const utils_1 = __webpack_require__(4083);
const LABEL_SELECTOR = '[data-sort-list-label]';
const SHOP_SELECTOR = 'shop-component';
const SIDEBAR_SELECTOR = 'sidebar-component';
const FORM_SELECTOR = 'form';
const INPUT_SELECTOR = 'input';
class SortList extends base_component_1.BaseComponent {
    mountComponent() {
        const labels = (0, utils_1.$list)(LABEL_SELECTOR, this);
        labels.forEach(label => {
            this.addListener(label, 'keydown', this.handleLabelKeyDown);
        });
        this.addListener(this, 'input', this.handleFormInput);
    }
    handleFormInput = (0, debounce_1.debounce)((event) => {
        event.preventDefault();
        const shop = (0, utils_1.$el)(SHOP_SELECTOR);
        const sidebar = (0, utils_1.$elParent)(SIDEBAR_SELECTOR, this);
        const input = event.target;
        if (sidebar) {
            sidebar.hide();
        }
        if (shop && input) {
            const sortQuery = this.getSortQuery(input);
            let searchParams = `${window.location.search
                .replace(shop.sortQuery, '')
                .replace('?', '')}&${sortQuery}`;
            if (shop.dataset.baseParams) {
                searchParams = searchParams.replace(shop.dataset.baseParams, '');
            }
            shop.sortQuery = sortQuery;
            shop.updateBySearchParams(searchParams);
        }
    }, 250);
    handleLabelKeyDown = (event) => {
        if ((0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            const input = (0, utils_1.$el)(INPUT_SELECTOR, event.target);
            if (input) {
                input.dispatchEvent(new MouseEvent('click', { button: 0, which: 1 }));
            }
        }
    };
    getSortQuery(input) {
        const form = (0, utils_1.$elParent)(FORM_SELECTOR, input);
        if (!form) {
            return '';
        }
        return new URLSearchParams(new FormData(form)).toString();
    }
}
exports.SortList = SortList;


/***/ }),

/***/ 9744:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AddressesComponent = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const key_1 = __webpack_require__(9650);
const ADDRESS_DELETE_BUTTON_SELECTOR = '[data-addresses-delete-button]';
const postLink = function (path, options) {
    options = options || {};
    const method = options['method'] || 'post';
    const params = options['parameters'] || {};
    const form = document.createElement('form');
    form.setAttribute('method', method);
    form.setAttribute('action', path);
    for (let key in params) {
        let hiddenField = document.createElement('input');
        hiddenField.setAttribute('type', 'hidden');
        hiddenField.setAttribute('name', key);
        hiddenField.setAttribute('value', params[key]);
        form.appendChild(hiddenField);
    }
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
};
class AddressesComponent extends base_component_1.BaseComponent {
    mountComponent() {
        const deleteButtons = (0, utils_1.$list)(ADDRESS_DELETE_BUTTON_SELECTOR, this);
        deleteButtons.forEach(element => {
            this.addListener(element, 'click', this.handleDeleteButtonClick);
        });
        this.addListener(this, 'keydown', this.handleKeydown);
    }
    handleKeydown = (event) => {
        const target = event.target;
        const isCheckbox = target.getAttribute('type') === 'checkbox';
        if (isCheckbox && (0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            target.checked = !target.checked;
        }
    };
    handleDeleteButtonClick = ({ currentTarget }) => {
        const text = currentTarget.getAttribute('data-confirm-message');
        const isConfirm = confirm(text);
        if (isConfirm) {
            postLink(currentTarget.dataset.target, {
                parameters: { _method: 'delete' },
            });
        }
    };
}
exports.AddressesComponent = AddressesComponent;


/***/ }),

/***/ 6740:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CountrySelector = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const dom_1 = __webpack_require__(3889);
const FLOAT_ELEMENT_SELECTOR = 'float-element';
const INPUT_SELECTOR = 'input';
const DROPDOWN_TOGGLE_LABEL_SELECTOR = '.dropdown__toggle-label';
const DROPDOWN_ITEM_SELECTOR = '.dropdown__item';
const DROPDOWN_SELECTOR = 'float-element';
const DROPDOWN_OPTION_SELECTOR = 'option';
class CountrySelector extends base_component_1.BaseComponent {
    mountComponent() {
        this.createItems();
        this.addListener(this, 'click', this.handleItemClick);
    }
    handleItemClick = (event) => {
        const dropdown = (0, utils_1.$el)(FLOAT_ELEMENT_SELECTOR, this);
        const input = (0, utils_1.$el)(INPUT_SELECTOR, this);
        const dropdownBtnLabel = (0, utils_1.$el)(DROPDOWN_TOGGLE_LABEL_SELECTOR, this);
        const target = event.target;
        const item = (0, utils_1.$elParent)(DROPDOWN_ITEM_SELECTOR, target);
        if (!item) {
            return;
        }
        if (!input || !dropdownBtnLabel || !dropdown) {
            return;
        }
        input.setAttribute('value', target.dataset.value);
        this.setActiveItem(target.dataset.value);
        dropdownBtnLabel.innerHTML = target.dataset.value;
        dropdown.hide();
    };
    setActiveItem(activeCountryValue) {
        const items = (0, utils_1.$list)(DROPDOWN_ITEM_SELECTOR, this);
        items.forEach(item => {
            item.classList.toggle('active', item.dataset.value === activeCountryValue);
        });
    }
    createItems() {
        const dropdown = (0, utils_1.$el)(DROPDOWN_SELECTOR, this);
        const options = (0, utils_1.$list)(DROPDOWN_OPTION_SELECTOR, this);
        const fragment = document.createDocumentFragment();
        if (!dropdown) {
            return;
        }
        options.forEach(option => {
            const item = document.createElement('div');
            const clonedOption = option.cloneNode(true);
            item.classList.add('dropdown__item');
            item.setAttribute('tabindex', '0');
            item.dataset.value = option.value;
            item.dataset.provinces = option.dataset.provinces;
            item.replaceChildren(...clonedOption.childNodes);
            fragment.appendChild(item);
        });
        (0, dom_1.replaceNodeChildren)(dropdown.element, fragment);
    }
}
exports.CountrySelector = CountrySelector;


/***/ }),

/***/ 4570:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AddressesComponent = exports.CountrySelector = exports.LoginComponent = exports.RegisterComponent = void 0;
var register_component_1 = __webpack_require__(6698);
Object.defineProperty(exports, "RegisterComponent", ({ enumerable: true, get: function () { return register_component_1.RegisterComponent; } }));
var login_component_1 = __webpack_require__(8810);
Object.defineProperty(exports, "LoginComponent", ({ enumerable: true, get: function () { return login_component_1.LoginComponent; } }));
var country_selector_1 = __webpack_require__(6740);
Object.defineProperty(exports, "CountrySelector", ({ enumerable: true, get: function () { return country_selector_1.CountrySelector; } }));
var addresses_1 = __webpack_require__(9744);
Object.defineProperty(exports, "AddressesComponent", ({ enumerable: true, get: function () { return addresses_1.AddressesComponent; } }));


/***/ }),

/***/ 8810:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoginComponent = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const LOGIN_FORM_SELECTOR = '[data-login-form]';
class LoginComponent extends base_component_1.BaseComponent {
    mountComponent() {
        this.updateFocus();
        this.addListener(this, 'click', this.handleClick);
    }
    handleClick = (event) => {
        const target = event.target;
        const isLoginFormButton = target.hasAttribute('data-login-form-button');
        if (isLoginFormButton) {
            const loginFormId = target.dataset.loginFormId || '';
            this.setFormVisibleById(loginFormId);
            this.updateFocus();
        }
    };
    setFormVisibleById(loginFormId) {
        const forms = (0, utils_1.$list)(LOGIN_FORM_SELECTOR, this);
        forms.forEach(form => {
            const isTargetForm = form.getAttribute('data-login-form') === loginFormId;
            form.classList.toggle('hidden', !isTargetForm);
        });
    }
    updateFocus() {
        const forms = (0, utils_1.$list)(LOGIN_FORM_SELECTOR, this);
        forms.forEach(form => {
            const isHidden = form.classList.contains('hidden');
            const emailInput = (0, utils_1.$el)('[type="email"]', form);
            if (!isHidden && emailInput) {
                emailInput.focus();
            }
        });
    }
}
exports.LoginComponent = LoginComponent;


/***/ }),

/***/ 6698:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RegisterComponent = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const FORM_SELECTOR = '[data-register-form]';
class RegisterComponent extends base_component_1.BaseComponent {
    mountComponent() {
        const form = (0, utils_1.$el)(FORM_SELECTOR, this);
        this.addListener(form, 'submit', this.handleSubmit);
    }
    handleSubmit() {
        localStorage.setItem('isRegistered', 'true');
    }
}
exports.RegisterComponent = RegisterComponent;


/***/ }),

/***/ 5959:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FaqSection = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const ACCORDEON_SELECTOR = 'accordeon-component';
class FaqSection extends base_component_1.BaseComponent {
    mountComponent() {
        const tabs = (0, utils_1.$list)(ACCORDEON_SELECTOR, this);
        tabs.forEach(tab => {
            (0, utils_1.whenDefined)(ACCORDEON_SELECTOR).then(() => {
                tab.on('toggle', this.handleTabToggle);
            });
        });
    }
    unmountComponent() {
        const tabs = (0, utils_1.$list)(ACCORDEON_SELECTOR, this);
        tabs.forEach(tab => {
            (0, utils_1.whenDefined)(ACCORDEON_SELECTOR).then(() => {
                tab.off('toggle', this.handleTabToggle);
            });
        });
    }
    handleTabToggle = ({ blockId }) => {
        const tabs = (0, utils_1.$list)(ACCORDEON_SELECTOR, this);
        tabs.forEach(tab => {
            if (tab.dataset.blockId !== blockId && tab.isExpanded) {
                tab.hide();
            }
        });
    };
}
exports.FaqSection = FaqSection;


/***/ }),

/***/ 8563:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FaqSection = void 0;
var faq_1 = __webpack_require__(5959);
Object.defineProperty(exports, "FaqSection", ({ enumerable: true, get: function () { return faq_1.FaqSection; } }));


/***/ }),

/***/ 8432:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FeaturedNavigation = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const check_media_1 = __webpack_require__(5580);
const debounce_1 = __webpack_require__(2731);
class FeaturedNavigation extends base_component_1.BaseComponent {
    elementsTemplateAttribute;
    lineAttribute;
    imageAttribute;
    buttonAttribute;
    imageActiveClass;
    buttonActiveClass;
    buttonIconAttribute;
    template;
    floatingImg;
    floatingBtn;
    container;
    lines;
    images;
    buttons;
    iconPlaceholder;
    scrollingType;
    scrollingTypeAttribute;
    imageWidth;
    imageHeight;
    buttonWidth;
    buttonHeight;
    isAnimating;
    forceStopped;
    mouseIsOn;
    isMobile;
    resizeObserver;
    activeImage;
    activeButton;
    animation;
    x;
    y;
    mouseY;
    constructor() {
        super();
        this.elementsTemplateAttribute = '[data-elements-template]';
        this.lineAttribute = '[data-navigation-line]';
        this.imageAttribute = '[data-navigation-line-image]';
        this.buttonAttribute = '[data-navigation-line-button]';
        this.imageActiveClass = 'featured-navigation__link-image--active';
        this.buttonActiveClass = 'featured-navigation__btn--active';
        this.buttonIconAttribute = '[data-button-without-text]';
        this.scrollingTypeAttribute = 'data-scrolling-type';
        this.template = this.querySelector(this.elementsTemplateAttribute);
        this.floatingImg = this.template.content.querySelector(this.imageAttribute);
        this.floatingBtn = this.template.content.querySelector(this.buttonAttribute);
        this.container = this.querySelector('.container');
        this.lines = this.querySelectorAll(this.lineAttribute);
        this.images = (0, utils_1.$list)(this.imageAttribute, this);
        this.buttons = (0, utils_1.$list)(this.buttonAttribute, this);
        this.iconPlaceholder = (0, utils_1.$el)(this.buttonIconAttribute, this)?.firstElementChild?.cloneNode(true);
        this.scrollingType = this.getAttribute(this.scrollingTypeAttribute);
        this.isAnimating = false;
        this.forceStopped = true;
        this.isMobile = (0, check_media_1.isMobile)();
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(this);
    }
    connectedCallback() {
        if (!this.isMobile) {
            this.initDesktop();
        }
    }
    disconnectedCallback() {
        this.deInitDesktop();
    }
    initDesktop = () => {
        this.initFloatingElements();
        this.setRects(this.floatingImg, this.buttons[0]);
        this.addEventListener('mouseenter', this.handleMouseEnter);
        this.lines.forEach(line => {
            if (this.scrollingType === 'none') {
                line
                    .querySelector('.featured-navigation__link-text')
                    .addEventListener('mouseenter', this.handleMouseEnterLine);
                line
                    .querySelector('.featured-navigation__link-text')
                    .addEventListener('mouseleave', this.handleMouseLeaveLine);
            }
            else {
                line.addEventListener('mouseenter', this.handleMouseEnterLine);
            }
        });
    };
    deInitDesktop = () => {
        this.deinitFloatingElements();
        this.removeEventListener('mouseenter', this.handleMouseEnter);
        this.lines.forEach(line => {
            if (this.scrollingType === 'none') {
                line
                    .querySelector('.featured-navigation__link-text')
                    .removeEventListener('mouseenter', this.handleMouseEnterLine);
                line
                    .querySelector('.featured-navigation__link-text')
                    .removeEventListener('mouseleave', this.handleMouseLeaveLine);
            }
            else {
                line.removeEventListener('mouseenter', this.handleMouseEnterLine);
            }
        });
        document.removeEventListener('mousemove', this.handleMouseMove);
    };
    initFloatingElements = () => {
        this.activeImage = this.floatingImg.cloneNode(true);
        this.activeButton = this.floatingBtn.cloneNode(true);
        this.container.appendChild(this.activeImage);
        this.container.appendChild(this.activeButton);
        this.scaleDown();
    };
    deinitFloatingElements = () => {
        this.activeImage.remove();
        this.activeButton.remove();
    };
    handleMouseEnterLine = (event) => {
        const { targetImage, targetButton } = this.getTargetImageAndButton(event);
        this.replaceFloatingElementsData(targetImage, targetButton);
        this.forceStopped = false;
        if (!this.isAnimating) {
            this.handleMouseEnter(event);
        }
    };
    handleMouseLeaveLine = () => {
        this.scaleDown();
    };
    replaceFloatingElementsData = (imageData, buttonData) => {
        if (imageData) {
            this.activeImage.src = imageData?.src;
            this.activeImage.srcset = imageData?.srcset;
            this.activeImage.style.maxHeight = `${imageData.getBoundingClientRect().height}px`;
            this.toggleImageActiveClass(this.activeImage, 'add');
            this.activeImage.style.opacity = '1';
        }
        else {
            this.toggleImageActiveClass(this.activeImage, 'add');
            this.activeImage.style.opacity = '0';
        }
        if (buttonData) {
            if (buttonData.hasAttribute('data-button-without-text')) {
                this.activeButton.replaceChildren(this.iconPlaceholder);
            }
            else {
                this.activeButton.textContent = buttonData.textContent;
            }
            this.activeButton.className = `${buttonData.className} ${this.buttonActiveClass}`;
            this.activeButton.href = buttonData.href;
            this.toggleButtonActiveClass(this.activeButton, 'add');
            this.activeButton.style.opacity = '1';
        }
        else {
            this.activeButton.style.opacity = '0';
        }
        this.scaleUp();
        this.setRects(imageData, buttonData);
    };
    handleMouseEnter = (event) => {
        this.activeImage.style.translate = `${event.clientX - this.imageWidth}px ${event.clientY - this.imageHeight}px`;
        this.activeButton.style.translate = `${event.clientX - this.buttonWidth}px ${event.clientY - this.buttonHeight}px`;
        if (!this.mouseIsOn) {
            document.addEventListener('mousemove', this.handleMouseMove);
            this.toggleScrollListener(true);
        }
        this.mouseIsOn = true;
    };
    handleMouseLeave = () => {
        this.scaleDown();
        this.toggleScrollListener(false);
    };
    toggleScrollListener = (add) => {
        if (add) {
            this.addListener(window, 'scroll', this.handleScroll);
        }
        else {
            this.removeListener(window, 'scroll', this.handleScroll);
        }
    };
    handleScroll = (0, debounce_1.debounce)(() => {
        const { top, bottom } = this.getBoundingClientRect();
        if (this.mouseY < top || this.mouseY > bottom) {
            this.handleMouseLeave();
        }
    }, 100);
    handleMouseMove = (event) => {
        if (!this.forceStopped) {
            const target = event.target;
            if (target === this.container || !target.closest('featured-navigation')) {
                this.handleMouseLeave();
            }
            const { x, y, mouseY } = this.getMouseCoordinates(event.clientX, event.clientY);
            this.x = x;
            this.y = y;
            this.mouseY = mouseY;
            if (!this.isAnimating) {
                this.startAnimation();
            }
        }
    };
    startAnimation = () => {
        this.isAnimating = true;
        this.animation = requestAnimationFrame(this.tick);
    };
    stopAnimation = () => {
        this.isAnimating = false;
        cancelAnimationFrame(this.animation);
        const cancelAnimation = this.activeImage.style.scale === '0' &&
            this.activeButton.style.scale === '0';
        if (cancelAnimation) {
            this.forceStopped = true;
            this.toggleImageActiveClass(this.activeImage, 'remove');
            this.toggleButtonActiveClass(this.activeButton, 'remove');
            document.removeEventListener('mousemove', this.handleMouseMove);
            this.mouseIsOn = false;
        }
    };
    tick = (time) => {
        const { x, y, width } = this.activeImage
            ? this.activeImage.getBoundingClientRect()
            : this.activeButton.getBoundingClientRect();
        const targetXimage = +(this.x - x).toFixed(3);
        const targetYimage = +(this.y - y).toFixed(3);
        const targetXbutton = targetXimage + this.imageWidth - this.buttonWidth;
        const targetYbutton = targetYimage + this.imageHeight - this.buttonHeight;
        this.draw(targetXimage + x, targetYimage + y, targetXbutton + x, targetYbutton + y);
        if (targetXimage !== 0 && targetYimage !== 0 && width > 0) {
            this.animation = requestAnimationFrame(this.tick);
        }
        else {
            this.stopAnimation();
        }
    };
    draw = (imageX, imageY, buttonX, buttonY) => {
        this.activeImage.style.translate = `${imageX}px ${imageY}px`;
        this.activeButton.style.translate = `${buttonX}px ${buttonY}px`;
    };
    getTargetImageAndButton = (event) => {
        const targetLine = event.currentTarget;
        const id = targetLine.dataset.navigationLine || targetLine.dataset.lineId;
        const targetImage = this.images.find(img => img.dataset.navigationLineImage === id);
        const targetButton = this.buttons.find(btn => btn.dataset.navigationLineButton === id);
        return { targetImage, targetButton };
    };
    setRects = (targetImage, targetButton) => {
        this.imageWidth = this.activeImage.offsetWidth / 2;
        this.imageHeight = targetImage
            ? targetImage.scrollHeight / 2
            : this.activeImage.offsetHeight / 2;
        this.buttonWidth = targetButton?.offsetWidth / 2;
        this.buttonHeight = targetButton?.offsetHeight / 2;
    };
    getMouseCoordinates = (x, y) => {
        return {
            x: x - this.imageWidth,
            y: y - this.imageHeight,
            mouseY: y,
        };
    };
    toggleButtonActiveClass = (element, action) => {
        element?.classList.toggle(this.buttonActiveClass, action === 'add');
    };
    toggleImageActiveClass = (element, action) => {
        element?.classList.toggle(this.imageActiveClass, action === 'add');
    };
    scaleUp = () => {
        this.activeImage.style.scale = '1';
        this.activeButton.style.scale = '1';
    };
    scaleDown = () => {
        this.activeImage.style.scale = '0';
        this.activeButton.style.scale = '0';
    };
    handleResize = (0, debounce_1.debounce)(() => {
        if ((0, check_media_1.isMobile)() === this.isMobile) {
            return;
        }
        if ((0, check_media_1.isMobile)()) {
            this.deInitDesktop();
        }
        else {
            this.initDesktop();
        }
        this.isMobile = (0, check_media_1.isMobile)();
    }, 200);
}
exports.FeaturedNavigation = FeaturedNavigation;


/***/ }),

/***/ 6979:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DrawerMenuPageLink = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const key_1 = __webpack_require__(9650);
const DRAWER_MENU_SELECTOR = 'drawer-menu';
class DrawerMenuPageLink extends base_component_1.BaseComponent {
    mountComponent() {
        this.addListener(this, 'click', this.handlePageLinkClick);
        this.addListener(this, 'keyup', this.handleKeyDown);
    }
    handlePageLinkClick = (event) => {
        event.preventDefault();
        this.setPage();
    };
    handleKeyDown = (event) => {
        if ((0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            this.setPage();
        }
    };
    setPage() {
        const drawerMenu = (0, utils_1.$elParent)(DRAWER_MENU_SELECTOR, this);
        if (drawerMenu) {
            drawerMenu.setPage(drawerMenu.pageMap[this.dataset.pageId]);
        }
    }
}
exports.DrawerMenuPageLink = DrawerMenuPageLink;


/***/ }),

/***/ 910:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DrawerMenuPage = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const BLOCK_SELECTOR = '[data-drawer-menu-content]';
class DrawerMenuPage extends base_component_1.BaseComponent {
    mountComponent() {
        const block = (0, utils_1.$el)(BLOCK_SELECTOR, this);
        this.addListener(block, 'scroll', this.handleBlockScroll);
    }
    handleBlockScroll = () => {
        const block = (0, utils_1.$el)(BLOCK_SELECTOR, this);
        if (block) {
            this.toggleAttribute('header-shadow-visible', block.scrollTop > 0);
        }
    };
}
exports.DrawerMenuPage = DrawerMenuPage;


/***/ }),

/***/ 1035:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DrawerMenu = void 0;
const check_media_1 = __webpack_require__(5580);
const sidebar_1 = __webpack_require__(4622);
const utils_1 = __webpack_require__(4083);
const dom_1 = __webpack_require__(3889);
const HEADER_COMPONENT_SELECTOR = 'header-component';
const DRAWER_MENU_PAGE_SELECTOR = 'drawer-menu-page';
const TOGGLER_SELECTOR = '#DrawerMenuToggler';
class DrawerMenu extends sidebar_1.SidebarComponent {
    openedPage;
    pageMap;
    isCurrentModeMobile;
    resizeObserver;
    constructor() {
        super();
        this.pageMap = this.generatePageMap();
    }
    mountComponent() {
        super.mountComponent();
        const header = (0, utils_1.$el)(HEADER_COMPONENT_SELECTOR);
        (0, utils_1.whenDefined)(HEADER_COMPONENT_SELECTOR).then(() => {
            header.on('drawerActivated', this.handleSetAsSection);
            header.on('drawerUnActivated', this.handleUnsetAsSection);
        });
        if (this.isEditor) {
            this.editor.on('BLOCK_SELECT', this.handleBlockSelect);
            this.editor.on('BLOCK_DESELECT', this.handleBlockDeselect);
            this.editor.on('SECTION_SELECT', this.handleSectionSelect);
            this.editor.on('SECTION_DESELECT', this.handleSectionDeselect);
        }
    }
    unmountComponent() {
        super.unmountComponent();
        const header = (0, utils_1.$el)(HEADER_COMPONENT_SELECTOR);
        if (this.isEditor) {
            this.editor.off('BLOCK_SELECT', this.handleBlockSelect);
            this.editor.off('BLOCK_DESELECT', this.handleBlockDeselect);
            this.editor.off('SECTION_SELECT', this.handleSectionSelect);
            this.editor.off('SECTION_DESELECT', this.handleSectionDeselect);
            header.off('headerNavFitted', this.handleSetAsSection);
        }
        header.off('headerNavUnfitted', this.handleUnsetAsSection);
    }
    handleSetAsSection = () => {
        this.setAttribute('data-drawer-menu-is-section', '');
    };
    handleUnsetAsSection = () => {
        this.removeAttribute('data-drawer-menu-is-section');
        if (this.isOpen) {
            this.hide();
        }
    };
    handleResize = () => {
        if (this.isCurrentModeMobile !== (0, check_media_1.isMobile)() && this.isOpen) {
            this.hide(true);
        }
    };
    handleSectionSelect = ({ detail: { sectionId } }) => {
        if (this.isVisible && this.dataset.sectionId === sectionId) {
            this.open();
            this.reset();
        }
    };
    handleSectionDeselect = ({ detail: { sectionId } }) => {
        if (this.isVisible && this.dataset.sectionId === sectionId) {
            this.reset();
            this.hide(true);
        }
    };
    handleBlockSelect = ({ detail: { blockId, sectionId } }) => {
        if (this.isVisible && this.dataset.sectionId === sectionId) {
            const pages = (0, utils_1.$list)(DRAWER_MENU_PAGE_SELECTOR, this.element);
            const target = pages.find(page => page.querySelector(`[block-id='${blockId}']`));
            if (!target) {
                return;
            }
            this.open();
            this.setPage(target);
        }
    };
    handleBlockDeselect = ({ detail: { blockId, sectionId } }) => {
        if (this.isVisible && this.dataset.sectionId === sectionId) {
            const pages = (0, utils_1.$list)(DRAWER_MENU_PAGE_SELECTOR, this.element);
            const target = pages.find(page => page.querySelector(`[block-id='${blockId}']`));
            if (!target) {
                return;
            }
            this.hide(true);
        }
    };
    handlePageKeydown = (event) => {
        event.preventDefault();
        const target = event.target;
        const page = (0, utils_1.$elParent)(DRAWER_MENU_PAGE_SELECTOR, target);
        if (!page) {
            return;
        }
        const targets = (0, utils_1.$list)((0, utils_1.getFocusTargets)(), page);
        const isLast = target === targets[targets.length - 1];
        const isFirst = target === targets[0];
        const isShift = event.shiftKey;
        if ((isShift && isFirst) || (!isShift && isLast)) {
            this.focusOnToggler();
        }
    };
    mount() {
        super.mount();
        this.addListener(this, 'keydown', this.handlePageKeydown);
        this.isCurrentModeMobile = (0, check_media_1.isMobile)();
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(this);
    }
    unmount() {
        this.removeListener(this, 'keydown', this.handlePageKeydown);
        this.resizeObserver?.disconnect();
        super.unmount();
    }
    focusOnToggler() {
        this.hide().then(() => {
            const toggler = (0, utils_1.$el)(TOGGLER_SELECTOR);
            toggler?.focus();
        });
    }
    generatePageMap() {
        const pages = (0, utils_1.$list)(DRAWER_MENU_PAGE_SELECTOR, this.element);
        const pageMap = pages.reduce((map, page) => {
            const pageId = page.dataset.pageId;
            return pageId ? { ...map, [pageId]: page } : map;
        }, {});
        return pageMap;
    }
    setPage(page) {
        const pageId = page.dataset.pageId;
        const prevOpenedPageId = this.openedPage?.dataset.prevPageId;
        const isReturn = pageId === prevOpenedPageId;
        if (this.openedPage) {
            if (isReturn) {
                this.setPageVisible(this.openedPage, false);
            }
        }
        const firstFocusTarget = (0, utils_1.$el)((0, utils_1.getFocusTargets)(), page);
        if (firstFocusTarget) {
            firstFocusTarget.focus();
        }
        this.setPageVisible(page, true);
        this.openedPage = page;
    }
    reset() {
        const pages = (0, utils_1.$list)(DRAWER_MENU_PAGE_SELECTOR, this.element);
        const homePage = this.pageMap['Menu'];
        pages.forEach(page => {
            this.setPageVisible(page, false);
        });
        this.setPageVisible(homePage, true);
        this.openedPage = homePage;
    }
    setPageVisible(page, isVisible) {
        page.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
    }
    async open() {
        const header = (0, utils_1.$el)(HEADER_COMPONENT_SELECTOR);
        header?.updatePosition();
        super.open();
        await (0, utils_1.transitionToPromise)(this);
        if (this.isEditor &&
            (0, check_media_1.isMobile)() &&
            document.body.style.top !== '' &&
            header?.isDynamicSticky) {
            (0, dom_1.setStyleVariable)('header-bottom-side', `${header.offsetHeight - 1}px`);
            header.section.classList.add('scrolled');
            header.setHidden(false);
        }
    }
    async hide(isInstant) {
        this.reset();
        super.hide(isInstant);
    }
    get isVisible() {
        const isLowResolution = matchMedia('(max-width: 992px)').matches;
        const isSection = this.hasAttribute('data-drawer-menu-is-section');
        return isSection || isLowResolution;
    }
}
exports.DrawerMenu = DrawerMenu;


/***/ }),

/***/ 6409:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HeaderComponent = void 0;
const base_component_1 = __webpack_require__(3608);
const check_media_1 = __webpack_require__(5580);
const debounce_1 = __webpack_require__(2731);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const utils_2 = __webpack_require__(4142);
const HEADER_NAV_SELECTOR = '[data-desktop-nav]';
const BURGER_ICON_SELECTOR = '.drawer-menu-toggle';
const HEADER_GRID_SELECTOR = '.header__grid';
const HEADER_DROPDOWN_BACKDROP_SELECTOR = '[data-header-dropdown-backdrop]';
const HEADER_DROPDOWN_WITH_BACKDROP_BTN_SELECTOR = 'data-header-btn-with-backdrop';
const SECTION_SELECTOR = '.shopify-section-header';
const BODY_ELEMENT_SELECTOR = 'body-element';
class HeaderComponent extends base_component_1.BaseComponent {
    headerGrid;
    navContainer;
    burgerIcon;
    navFirstItem;
    navLastItem;
    dropdownsBackdrop;
    headerLinks;
    dropdowns;
    openers;
    openedElementId;
    lastScrollPosition = 0;
    headerSectionBottom;
    resizeObserver;
    isHidden;
    lastBottom;
    lastHeight;
    navWidth;
    isSticky;
    isCurrentSticky;
    isDynamicSticky;
    isDynamicShowLocked;
    isTransparent;
    blockInEditorSelected;
    withGradient;
    mountComponent() {
        this.isTransparent = this.hasAttribute('transparent-visibility');
        this.updatePosition();
        this.addListener(window, 'scroll', this.handleScroll);
        this.moveDrawer();
        this.navContainer = (0, utils_1.$el)(HEADER_NAV_SELECTOR, this);
        if (this.navContainer) {
            this.setNavItems();
            this.dropdownsBackdrop = (0, utils_1.$el)(HEADER_DROPDOWN_BACKDROP_SELECTOR, this);
            const isWithOpenOnClick = this.hasAttribute('with-open-on-click');
            if (!isWithOpenOnClick) {
                const btns = (0, utils_1.$list)('[data-header-btn-with-backdrop]');
                customElements.whenDefined('header-float-element-btn').then(() => {
                    btns.forEach((btn) => {
                        this.addListener(btn, 'mouseenter', this.handleBtnMouseEnter);
                    });
                });
            }
            else {
                this.openers = (0, utils_1.$list)('dropdown-opener[data-header-btn-with-backdrop]');
                customElements.whenDefined('dropdown-opener').then(() => {
                    this.openers.forEach((opener) => {
                        opener.on('openerClick', this.handleOpenerClick);
                        opener.on('openerClickOutside', this.handleOpenerClickOutside);
                    });
                });
            }
        }
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(this);
        if (this.isEditor) {
            this.blockInEditorSelected = false;
            this.editor.on('SECTION_LOAD', this.handleSectionLoad);
            this.editor.on('SECTION_UNLOAD', this.handleSectionLoad);
        }
    }
    unmountComponent() {
        this.resizeObserver.disconnect();
    }
    handleBtnMouseEnter = ({ currentTarget }) => {
        this.handleButtonHover(currentTarget);
        this.addListener(document, 'mousemove', this.handleMouseMove);
    };
    handleOpenerClick = ({ element, opener }) => {
        this.openers.forEach(el => {
            el.setExpand(el === opener);
        });
        if (this.openedElementId === element.floatElementId) {
            this.handleMouseLeave();
            opener.setExpand(false);
        }
        else {
            this.handleButtonHover(element);
        }
    };
    handleOpenerClickOutside = ({ element, opener }) => {
        this.handleMouseLeave();
        opener.setExpand(false);
    };
    handleMouseMove = (0, debounce_1.debounce)(({ target }) => {
        const isButton = target.closest(`[${HEADER_DROPDOWN_WITH_BACKDROP_BTN_SELECTOR}]`);
        const isInside = target.closest('.header__dropdown-menu') || target.closest('#Portal');
        if (!isButton && !isInside) {
            this.handleMouseLeave();
        }
    }, 20);
    handleButtonHover = button => {
        this.emit('headerButtonHover', {
            floatElementId: button.floatElementId,
        });
        const height = this.getFloatElementHeight(button.floatElement);
        this.expandDropdownBackdrop(height);
        this.openedElementId = button.floatElementId;
    };
    getFloatElementHeight = floatElement => {
        const height = floatElement.maxHeight || floatElement.currentVisible.offsetHeight;
        return height;
    };
    handleMouseLeave = () => {
        this.openedElementId = null;
        if (this.isEditor && this.blockInEditorSelected) {
            return;
        }
        this.collapseDropdownBackdrop();
        this.emit('mouseLeavedHeader', {});
        this.removeListener(document, 'mousemove', this.handleMouseMove);
    };
    expandDropdownBackdrop = height => {
        this.dropdownsBackdrop.setAttribute('style', `--gsc-header-backdrop-height: ${height}px;`);
        (0, utils_1.transitionToPromise)(this.dropdownsBackdrop).then(() => {
            this.dropdownsBackdrop.setAttribute('with-opened-dropdown', '');
        });
    };
    collapseDropdownBackdrop = () => {
        this.dropdownsBackdrop.setAttribute('style', `--gsc-header-backdrop-height: 0px;`);
        this.dropdownsBackdrop.removeAttribute('with-opened-dropdown');
        this.removeListener(this.navContainer, 'mousemove', this.handleMouseMove);
    };
    setNavItems = () => {
        this.headerGrid = (0, utils_1.$el)(HEADER_GRID_SELECTOR, this);
        const navItems = (0, utils_1.$list)('.header__item', this.navContainer);
        this.navFirstItem = navItems[0];
        this.navLastItem = navItems[navItems.length - 1];
        if (!this.burgerIcon) {
            this.burgerIcon = (0, utils_1.$el)(BURGER_ICON_SELECTOR, this).cloneNode(true);
            this.burgerIcon.setAttribute('mock', '');
        }
        const navFirstItemLeft = this.navFirstItem.getBoundingClientRect().left;
        const navLastItemRight = this.navLastItem.getBoundingClientRect().right;
        this.navWidth = navLastItemRight - navFirstItemLeft + 85;
    };
    checkIsNavContainerFitAllLinks = () => {
        if (!this.navContainer) {
            return;
        }
        const navFirstItemLeft = this.navFirstItem.getBoundingClientRect().left;
        let prevElement = this.navContainer.previousElementSibling;
        let nextElement = this.navContainer.nextElementSibling;
        let prevElementRight = prevElement?.getBoundingClientRect().right;
        let nextElementleft = nextElement?.getBoundingClientRect().left;
        if (this.headerGrid.className.includes('header__grid--3')) {
            prevElementRight = navFirstItemLeft;
            nextElementleft = prevElement?.getBoundingClientRect().left;
        }
        if (this.headerGrid.className.includes('header__grid--4') ||
            this.headerGrid.className.includes('header__grid--5')) {
            prevElementRight = navFirstItemLeft;
            nextElementleft = this.getBoundingClientRect().right;
        }
        const currWidthForNav = nextElementleft - prevElementRight;
        const isToAddBurger = currWidthForNav <= this.navWidth;
        this.navContainer.toggleAttribute('hidden', isToAddBurger);
        this.headerGrid.toggleAttribute('fit-nav', isToAddBurger);
        if (isToAddBurger) {
            this.headerGrid.prepend(this.burgerIcon);
            this.emit('drawerActivated', {});
        }
        else {
            this.burgerIcon.firstElementChild.classList.remove('is-opened');
            this.burgerIcon.remove();
            this.emit('drawerUnActivated', {});
        }
    };
    moveDrawer = () => {
        const drawer = (0, utils_1.$el)('drawer-menu', this.section);
        if (!drawer) {
            return;
        }
        if (this.isEditor) {
            const nextSibling = this.section.nextElementSibling;
            if (nextSibling.tagName === 'DRAWER-MENU') {
                nextSibling.remove();
            }
        }
        this.section.after(drawer);
    };
    handleResize = (0, debounce_1.debounce)(() => {
        this.section.removeAttribute('visible');
        if (this.isTransparent) {
            this.toggleTransparentHeader();
        }
        this.section.classList.remove('scrolled');
        this.setHidden(false);
        this.updatePosition();
        const rect = this.section.getBoundingClientRect();
        this.headerSectionBottom = rect.top + window.scrollY;
        if (!(0, check_media_1.isMobile)() && this.navContainer) {
            this.setNavItems();
            this.checkIsNavContainerFitAllLinks();
        }
        this.isCurrentSticky = (0, check_media_1.isMobile)()
            ? this.hasAttribute('is-sticky-mobile')
            : this.hasAttribute('is-sticky');
        if (this.isCurrentSticky) {
            this.setSticky();
        }
        else {
            this.removeSticky();
        }
        this.section.setAttribute('visible', '');
    }, 100);
    handleScroll = (0, debounce_1.throttle)(() => {
        if (this.isDynamicSticky) {
            this.updateVisibleAfterScroll();
        }
        this.setScrollStatus();
    }, 200);
    setScrollStatus() {
        if (!this.section) {
            return;
        }
        const savedScrollPosition = Math.abs(parseInt(document.body.style.top || '0'));
        const scrollPosition = window.scrollY || savedScrollPosition;
        const scrolled = scrollPosition > this.headerSectionBottom;
        this.section.classList.toggle('scrolled', scrolled);
    }
    updateVisibleAfterScroll = (0, debounce_1.debounce)(() => {
        const bodyElement = (0, utils_1.$el)(BODY_ELEMENT_SELECTOR);
        if (!this.section || bodyElement.isFixed) {
            return;
        }
        const scrollY = window.scrollY;
        const threshold = 36;
        const scrollDistance = scrollY - this.lastScrollPosition;
        const isScrollUp = scrollDistance < 0;
        const isScrollDown = scrollDistance > 0;
        const isUnderHeader = scrollY > this.headerSectionBottom;
        const showOnScrollUp = isScrollUp &&
            this.isHidden &&
            scrollDistance + threshold < 0 &&
            isUnderHeader;
        const hideOnScrollDown = isScrollDown && scrollDistance > threshold && isUnderHeader;
        if (showOnScrollUp) {
            this.setHidden(false);
        }
        else if (hideOnScrollDown) {
            this.setHidden(true);
        }
        this.lastScrollPosition = scrollY;
    }, 20);
    setHidden(isHidden) {
        if (!this.section || this.isDynamicShowLocked) {
            return;
        }
        this.isHidden = isHidden;
        this.section.setAttribute('aria-hidden', isHidden ? 'true' : 'false');
    }
    setSticky() {
        const stickyVariant = (0, check_media_1.isMobile)()
            ? this.getAttribute('is-sticky-mobile')
            : this.getAttribute('is-sticky');
        if (stickyVariant == 'static') {
            document.body.setAttribute('header-desktop-sticky', '');
            this.section.removeAttribute('dynamic-sticky');
            this.isDynamicSticky = false;
        }
        if (stickyVariant == 'dynamic') {
            this.section.setAttribute('dynamic-sticky', '');
            this.isDynamicSticky = true;
            this.toggleLockDynamicShow(false);
        }
    }
    toggleLockDynamicShow = bool => {
        this.isDynamicShowLocked = bool;
    };
    removeSticky() {
        this.section.removeAttribute('dynamic-sticky');
        document.body.removeAttribute('header-desktop-sticky');
        this.isDynamicSticky = false;
        if (!this.hasAttribute('with-sticky-colored')) {
            this.section.removeAttribute('with-sticky-colored');
        }
    }
    updatePosition() {
        if (!this.section) {
            return;
        }
        const rect = this.getBoundingClientRect();
        if (this.lastHeight !== rect.height) {
            (0, dom_1.setStyleVariable)('header-height', `${rect.height}px`);
            this.lastHeight = rect.height;
        }
        if (this.lastBottom !== rect.bottom) {
            const bottomSide = rect.bottom;
            (0, dom_1.setStyleVariable)('header-bottom-side', `${bottomSide}px`);
            this.lastBottom = bottomSide;
        }
    }
    toggleTransparentHeader = () => {
        const isCurrentMobile = (0, check_media_1.isMobile)();
        const transparentVisibility = this.getAttribute('transparent-visibility');
        const isCurrentTransparent = (transparentVisibility.includes('mobile') && isCurrentMobile) ||
            (transparentVisibility.includes('desktop') && !isCurrentMobile);
        if (isCurrentTransparent) {
            this.setTransparentMargin();
            this.setGradient();
            this.setAttribute('is-transparent', '');
            this.section.setAttribute('transparent-setted', '');
            if (this.hasAttribute('with-sticky-colored')) {
                this.section.setAttribute('with-sticky-colored', '');
            }
        }
        else {
            this.section.removeAttribute('style');
            this.removeAttribute('style');
            this.removeAttribute('is-transparent');
            this.withGradient = false;
        }
    };
    setTransparentMargin = () => {
        const { height: headerHeight, bottom: headerBottom } = this.getBoundingClientRect();
        const firstSection = (0, utils_1.$el)('.place-under-transparent-header');
        const firstSectionTop = firstSection?.getBoundingClientRect().top;
        const isToSetMargin = firstSectionTop - headerBottom < 100;
        if (isToSetMargin) {
            this.section.style.marginBottom = `-${headerHeight}px`;
            this.section.classList.add('header--add-mobile-paddings');
        }
        else {
            this.section.removeAttribute('style');
        }
    };
    setGradient = () => {
        if (this.hasAttribute('data-gradient') && !this.withGradient) {
            this.setAttribute('style', `--gsc-transparent-background: ${(0, utils_2.gradientOpacity)(this.dataset.gradient, this.dataset.opacity)}`);
            this.withGradient = true;
        }
    };
    handleSectionLoad = (0, debounce_1.debounce)(() => {
        if (this.isTransparent) {
            this.setTransparentMargin();
        }
    }, 100);
    get section() {
        return (0, utils_1.$el)(SECTION_SELECTOR);
    }
}
exports.HeaderComponent = HeaderComponent;


/***/ }),

/***/ 9300:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HeaderComponent = exports.DrawerMenuPageLink = exports.DrawerMenuPage = exports.DrawerMenu = void 0;
var drawer_menu_1 = __webpack_require__(1035);
Object.defineProperty(exports, "DrawerMenu", ({ enumerable: true, get: function () { return drawer_menu_1.DrawerMenu; } }));
var drawer_menu_page_1 = __webpack_require__(910);
Object.defineProperty(exports, "DrawerMenuPage", ({ enumerable: true, get: function () { return drawer_menu_page_1.DrawerMenuPage; } }));
var drawer_menu_page_link_1 = __webpack_require__(6979);
Object.defineProperty(exports, "DrawerMenuPageLink", ({ enumerable: true, get: function () { return drawer_menu_page_link_1.DrawerMenuPageLink; } }));
var header_1 = __webpack_require__(6409);
Object.defineProperty(exports, "HeaderComponent", ({ enumerable: true, get: function () { return header_1.HeaderComponent; } }));


/***/ }),

/***/ 7041:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HotspotsFloatElement = void 0;
const float_element_1 = __webpack_require__(9448);
class HotspotsFloatElement extends float_element_1.FloatElement {
    mountComponent() {
        super.mountComponent();
        this.mount();
    }
    unmount() { }
}
exports.HotspotsFloatElement = HotspotsFloatElement;


/***/ }),

/***/ 4717:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HotspotsComponent = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const MODAL_SELECTOR = 'modal-component';
const HOTSPOTS_FLOAT_ELEMENT = 'hotspots-float-element';
const FLOAT_ELEMENT_BTN_SELECTOR = 'float-element-btn';
class HotspotsComponent extends base_component_1.BaseComponent {
    hasOpenFloatElement;
    mountComponent() {
        const modals = (0, utils_1.$list)(MODAL_SELECTOR, this);
        const floatElements = (0, utils_1.$list)(HOTSPOTS_FLOAT_ELEMENT, this);
        const floatElementsBtns = (0, utils_1.$list)(FLOAT_ELEMENT_BTN_SELECTOR, this);
        modals.forEach(modal => {
            (0, utils_1.whenDefined)('modal-component').then(() => {
                modal.on('show', this.handleModalOpen);
                modal.on('hide', this.handleModalHide);
            });
        });
        floatElements.forEach(floatElement => {
            (0, utils_1.whenDefined)('hotspots-float-element').then(() => {
                floatElement.on('hide', this.handleFloatElementHide);
                floatElement.on('show', this.handleFloatElementShow);
            });
        });
        floatElementsBtns.forEach(btn => {
            this.addListener(btn, 'mouseenter', this.handlePinBtnEnter);
            this.addListener(btn, 'mouseleave', this.handlePinBtnLeave);
            this.addListener(btn, 'click', this.handlePinBtnClick);
        });
        if (this.isEditor) {
            this.addListener(window, 'click', this.handleEditorClick);
        }
    }
    unmountComponent() {
        const modals = (0, utils_1.$list)(MODAL_SELECTOR, this);
        const floatElements = (0, utils_1.$list)(HOTSPOTS_FLOAT_ELEMENT, this);
        modals.forEach(modal => {
            (0, utils_1.whenDefined)('modal-component').then(() => {
                modal.off('show', this.handleModalOpen);
                modal.off('hide', this.handleModalHide);
            });
        });
        floatElements.forEach(floatElement => {
            (0, utils_1.whenDefined)('hotspots-float-element').then(() => {
                floatElement.off('hide', this.handleFloatElementHide);
                floatElement.off('show', this.handleFloatElementShow);
            });
        });
    }
    handlePinBtnClick = (event) => {
        event.preventDefault();
        this.setAttribute('animation-state', 'pause');
    };
    handlePinBtnEnter = (event) => {
        event.preventDefault();
        this.setAttribute('animation-state', 'pause');
    };
    handlePinBtnLeave = (event) => {
        event.preventDefault();
        if (this.hasOpenFloatElement) {
            return;
        }
        this.removeAttribute('animation-state');
    };
    handleFloatElementShow = () => {
        this.hasOpenFloatElement = true;
    };
    handleFloatElementHide = () => {
        this.hasOpenFloatElement = false;
        this.removeAttribute('animation-state');
    };
    handleModalOpen = () => {
        this.setAttribute('animation-state', 'pause');
    };
    handleModalHide = () => {
        this.removeAttribute('animation-state');
    };
    handleEditorClick = (event) => {
        const isTriggerBtn = (0, utils_1.$elParent)(FLOAT_ELEMENT_BTN_SELECTOR, event.target);
        const isFloatElement = (0, utils_1.$elParent)(HOTSPOTS_FLOAT_ELEMENT, event.target);
        const floatElements = (0, utils_1.$list)(HOTSPOTS_FLOAT_ELEMENT, this);
        if (isTriggerBtn || isFloatElement) {
            return;
        }
        floatElements.forEach(floatElement => {
            floatElement.hide();
        });
    };
}
exports.HotspotsComponent = HotspotsComponent;


/***/ }),

/***/ 3891:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HotspotsFloatElement = exports.HotspotsComponent = void 0;
var hotspots_1 = __webpack_require__(4717);
Object.defineProperty(exports, "HotspotsComponent", ({ enumerable: true, get: function () { return hotspots_1.HotspotsComponent; } }));
var hotspots_float_element_1 = __webpack_require__(7041);
Object.defineProperty(exports, "HotspotsFloatElement", ({ enumerable: true, get: function () { return hotspots_float_element_1.HotspotsFloatElement; } }));


/***/ }),

/***/ 9239:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ImageSlider = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const debounce_1 = __webpack_require__(2731);
const key_1 = __webpack_require__(9650);
class ImageSlider extends base_component_1.BaseComponent {
    withProgressBar;
    withRotateImages;
    withVerticalScrollText;
    withVerticalScrollImage;
    carousel;
    progressBar;
    progressBarIndicator;
    progressDots;
    images;
    captions;
    arrows;
    dots;
    length;
    imagesLength;
    captionsLength;
    activeIndex;
    imagesContainer;
    captionHeight;
    touchStartX;
    intersectionObserver;
    resizeObserver;
    isMobile;
    windowClientHeight;
    scrollTriggerTop;
    scrollTriggerBottom;
    scrollDirection;
    lastScroll;
    constructor() {
        super();
        this.withProgressBar = this.hasAttribute('with-progress-bar');
        this.withRotateImages = this.hasAttribute('with-rotate-images');
        this.withVerticalScrollText = this.hasAttribute('with-vertical-scroll');
        this.withVerticalScrollImage = this.hasAttribute('with-vertical-scroll-image');
        this.carousel = (0, utils_1.$el)('carousel-component', this);
        if (this.withRotateImages) {
            this.images = (0, utils_1.$list)('[data-image-slider-image]', this);
            this.captions = (0, utils_1.$list)('[data-image-slider-caption]', this);
            this.arrows = (0, utils_1.$list)('[data-direction]', this);
            this.dots = (0, utils_1.$list)('[data-progress-dot]', this);
            this.length = this.images.length - 1;
            this.activeIndex = 0;
        }
        if (!this.withRotateImages) {
            this.images = (0, utils_1.$list)('[data-image-slider-image]', this);
            this.captions = (0, utils_1.$list)('.image-slider__slide', this);
            this.activeIndex = 0;
            this.length = this.images.length - 1;
        }
        if (this.withProgressBar) {
            this.progressBar = (0, utils_1.$el)('carousel-progress', this);
            this.progressBarIndicator = this.querySelector('[data-carousel-progress-indicator]');
            this.progressDots = (0, utils_1.$list)('[data-progress-dot]', this);
        }
        if (this.withVerticalScrollText || this.withVerticalScrollImage) {
            this.imagesContainer = this.querySelector('[data-carousel-viewport]');
            this.images = (0, utils_1.$list)('[data-image-slider-image]', this);
            this.captions = (0, utils_1.$list)('[data-image-slider-caption]', this);
            this.captionHeight = this.images[0].offsetHeight;
            this.imagesLength = this.images.filter(img => img.firstElementChild.tagName !== 'svg').length;
            this.captionsLength = this.captions.length;
            this.activeIndex = 0;
        }
    }
    mountComponent() {
        if (this.withProgressBar && !this.withRotateImages) {
            (0, utils_1.whenDefined)('carousel-component').then(() => {
                this.carousel?.on('carouselSelect', this.handleCarouselScroll);
            });
        }
        if (this.withRotateImages) {
            if (!this.withVerticalScrollText) {
                this.stackImages();
            }
            this.arrows?.forEach(arrow => {
                arrow.addEventListener('click', this.handleArrowClick);
                arrow.addEventListener('keydown', this.handleArrowKeydown);
            });
            this.dots?.forEach(dot => {
                dot.addEventListener('click', this.handleDotClick);
            });
            this.rotateImages();
            this.toggleArrowsDisabled();
        }
        this.setAttribute('draggable', 'true');
        this.addEventListener('dragstart', this.handleDragStart);
        this.addEventListener('mousedown', this.handleTouchStart);
        this.addEventListener('touchstart', this.handleTouchStart);
        this.addEventListener('mouseup', this.handleTouchEnd);
        this.addEventListener('touchend', this.handleTouchEnd);
        if (this.withVerticalScrollText) {
            this.stackImagesForVerticalScroll();
            this.setObserversForVerticalScroll();
        }
        if (this.withVerticalScrollImage) {
            this.setObserversForVerticalScrollImage();
            this.addListener(this, 'focusout', this.handleVerticalImageFocusout);
        }
        this.carousel?.embla?.on('select', this.handleCarouselSelect);
        this.setComponentVisible();
    }
    handleCarouselSelect = data => {
        const newIndex = data.selectedScrollSnap();
        this.activeIndex = newIndex;
    };
    unmountComponent() {
        if (this.withProgressBar && !this.withRotateImages) {
            this.carousel?.off('carouselSelect', this.handleCarouselScroll);
        }
        if (this.withRotateImages) {
            this.arrows?.forEach(arrow => {
                arrow.removeEventListener('click', this.handleArrowClick);
                arrow.removeEventListener('keydown', this.handleArrowKeydown);
            });
            if (this.withProgressBar) {
                this.dots?.forEach(dot => {
                    dot.removeEventListener('click', this.handleDotClick);
                });
            }
        }
        this.removeEventListener('dragstart', this.handleTouchStart);
        this.removeEventListener('mousedown', this.handleTouchStart);
        this.removeEventListener('touchstart', this.handleTouchStart);
        this.removeEventListener('mouseup', this.handleTouchEnd);
        this.removeEventListener('touchend', this.handleTouchEnd);
        if (this.withVerticalScrollText) {
            this.intersectionObserver.disconnect();
            this.resizeObserver.disconnect();
        }
        window.removeEventListener('scroll', this.handleChangeOpacity);
    }
    handleVerticalImageFocusout = event => {
        const focusTarget = event.relatedTarget;
        if (this.contains(focusTarget)) {
            const block = focusTarget.closest('[data-image-slider-caption]');
            const blockId = block.getAttribute('data-image-slider-caption');
            const imageSlider = (0, utils_1.$el)(`[data-image-slider-image="${blockId}"]`);
            if (imageSlider && (0, utils_1.isNotThemeStore)()) {
                imageSlider.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };
    handleVerticalScroll = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const inViewIndex = Number(entry.target.parentElement.getAttribute('data-image-slider-caption'));
                if (inViewIndex === this.activeIndex) {
                    return;
                }
                if (this.imagesLength === 1) {
                    this.activeIndex = inViewIndex;
                    return;
                }
                if (this.withRotateImages) {
                    const direction = inViewIndex > this.activeIndex ? 'next' : 'prev';
                    this.changeSlides(direction, inViewIndex);
                }
                else {
                    this.images.forEach((img, index) => {
                        if (index === inViewIndex) {
                            img.setAttribute('visible', '');
                            img.removeAttribute('prev');
                            img.removeAttribute('next');
                        }
                        else if (index < inViewIndex) {
                            img.setAttribute('prev', '');
                            img.removeAttribute('visible');
                            img.removeAttribute('next');
                        }
                        else if (index > inViewIndex) {
                            img.setAttribute('next', '');
                            img.removeAttribute('visible');
                            img.removeAttribute('prev');
                        }
                    });
                }
                this.activeIndex = inViewIndex;
            }
        });
    };
    setObserversForVerticalScroll = () => {
        let imagesHeight = this.imagesContainer.getBoundingClientRect().height;
        this.windowClientHeight = document.documentElement.clientHeight;
        if (imagesHeight > this.windowClientHeight) {
            this.images.forEach(image => {
                image.style.maxHeight = `${this.windowClientHeight - 30}px`;
            });
            imagesHeight = this.imagesContainer.getBoundingClientRect().height;
        }
        const topToSet = (this.windowClientHeight - imagesHeight) / 2;
        this.imagesContainer.style.top = `${topToSet}px`;
        this.scrollTriggerTop = topToSet;
        this.scrollTriggerBottom =
            this.windowClientHeight - this.scrollTriggerTop - imagesHeight;
        this.intersectionObserver = new IntersectionObserver(this.handleVerticalScroll, { rootMargin: `0px 0px -${this.scrollTriggerBottom + 30}px 0px` });
        this.captions.forEach(caption => {
            caption.style.minHeight = `${this.captionHeight}px`;
            if (caption.firstElementChild) {
                this.intersectionObserver.observe(caption.firstElementChild);
            }
        });
        if (this.imagesLength === 1) {
            this.images.forEach((img, index) => {
                if (img.firstElementChild.tagName !== 'svg') {
                    img.setAttribute('visible', '');
                    img.removeAttribute('prev');
                    img.removeAttribute('next');
                }
                else {
                    img.removeAttribute('next');
                    img.removeAttribute('visible');
                    img.removeAttribute('prev');
                    img.style.opacity = '0';
                }
            });
        }
        this.resizeObserver = new ResizeObserver(this.handleResizeVerticalScroll);
        this.resizeObserver.observe(this);
        this.setObserveScroll();
    };
    setObserveScroll = () => {
        this.lastScroll = 0;
        window.addEventListener('scroll', this.handleChangeOpacity);
    };
    handleChangeOpacity = () => {
        const scrollTop = document.documentElement.scrollTop;
        const scrollDirection = this.lastScroll > scrollTop ? 'up' : 'down';
        this.lastScroll = scrollTop;
        this.captions.forEach((caption, index) => {
            const bottom = caption.lastElementChild.getBoundingClientRect().bottom;
            const top = caption.firstElementChild.getBoundingClientRect().top;
            if (bottom < 0 ||
                top > this.windowClientHeight ||
                (index === this.captions.length - 1 &&
                    this.windowClientHeight - bottom > this.scrollTriggerBottom &&
                    scrollDirection === 'down')) {
                caption.setAttribute('dont-set-opacity', '');
                caption.style.opacity = `1`;
                return;
            }
            const captionHeight = bottom - top;
            const persentToTop = (bottom - this.scrollTriggerTop) / captionHeight;
            const persentToBottom = (this.windowClientHeight - top - this.scrollTriggerBottom) /
                captionHeight;
            if (!caption.hasAttribute('dont-set-opacity')) {
                caption.style.opacity =
                    top < this.scrollTriggerTop ? `${persentToTop}` : `${persentToBottom}`;
            }
            const bottomLimit = caption.getBoundingClientRect().height <
                this.imagesContainer.getBoundingClientRect().height
                ? this.scrollTriggerBottom
                : this.scrollTriggerBottom -
                    (caption.getBoundingClientRect().height -
                        this.imagesContainer.getBoundingClientRect().height +
                        20);
            if (caption.hasAttribute('dont-set-opacity') &&
                this.windowClientHeight - bottom > bottomLimit &&
                top > this.scrollTriggerTop) {
                caption.removeAttribute('dont-set-opacity');
            }
        });
    };
    handleVerticalScrollImage = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const inViewIndex = Number(entry.target.getAttribute('data-image-slider-image'));
                if (inViewIndex === this.activeIndex) {
                    return;
                }
                this.images[inViewIndex].setAttribute('visible', '');
                this.images[this.activeIndex].removeAttribute('visible');
                if (this.captionsLength > 1) {
                    this.captions[inViewIndex].setAttribute('visible', '');
                    this.captions[this.activeIndex].removeAttribute('visible');
                }
                this.activeIndex = inViewIndex;
            }
        });
    };
    setObserversForVerticalScrollImage = () => {
        const windowHeight = document.documentElement.clientHeight;
        this.intersectionObserver = new IntersectionObserver(this.handleVerticalScrollImage, { rootMargin: `-40% 0% -50% 0%` });
        let captionMaxHeight = 0;
        this.captions.forEach((caption, index) => {
            const top = caption.firstElementChild.getBoundingClientRect().top;
            const bottom = caption.lastElementChild.getBoundingClientRect().bottom;
            const height = bottom - top;
            if (captionMaxHeight < height) {
                captionMaxHeight = height;
            }
            if (height < this.images[index].getBoundingClientRect().height) {
                caption.style.height =
                    this.images[index].getBoundingClientRect().height + 'px';
            }
        });
        const captionIsHigherThenImages = this.images.find(image => image.getBoundingClientRect().height < captionMaxHeight);
        if (captionIsHigherThenImages) {
            this.imagesContainer.style.gap =
                (captionMaxHeight - this.images[0].getBoundingClientRect().height) * 2 +
                    'px';
        }
        const captionsParent = this.captions[0].parentElement;
        if (captionMaxHeight < windowHeight) {
            const parentHeight = captionsParent.getBoundingClientRect().height;
            const topToSet = (windowHeight - parentHeight) / 2;
            captionsParent.style.top = `${topToSet}px`;
        }
        else {
            captionsParent.style.top = '0px';
        }
        this.images.forEach(image => {
            this.intersectionObserver.observe(image);
        });
        if (this.captionsLength === 1) {
            this.captions[0].setAttribute('visible', '');
        }
    };
    handleArrowClick = (event) => {
        const direction = event.currentTarget.getAttribute('data-direction');
        this.arrowMove(direction);
        if (!this.withProgressBar) {
            this.toogleProgressDotActive();
        }
    };
    handleArrowKeydown = (event) => {
        const direction = event.currentTarget.getAttribute('data-direction');
        if ((0, key_1.isEnterKey)(event)) {
            this.arrowMove(direction);
        }
    };
    arrowMove(direction) {
        let newIndex;
        if (direction === 'next') {
            newIndex = this.activeIndex === this.length ? 0 : this.activeIndex + 1;
        }
        else {
            newIndex = this.activeIndex - 1 < 0 ? this.length : this.activeIndex - 1;
        }
        this.changeSlides(direction, newIndex);
        if (this.withRotateImages) {
            this.toggleArrowsDisabled();
        }
        if (this.withProgressBar && this.withRotateImages) {
            this.toogleProgressDotActive();
            this.setProgressIndicator();
        }
    }
    toggleArrowsDisabled = () => {
        this.arrows?.forEach(arrow => {
            const direction = arrow.getAttribute('data-direction');
            if (direction === 'prev') {
                arrow.toggleAttribute('disabled', this.activeIndex === 0);
            }
            else {
                arrow.toggleAttribute('disabled', this.activeIndex === this.length);
            }
        });
    };
    handleDotClick = (event) => {
        const index = event.currentTarget.hasAttribute('data-dot-index')
            ? +event.currentTarget.getAttribute('data-dot-index')
            : +event.target
                .closest('[data-progress-dot]')
                .getAttribute('data-dot-index');
        if (index === this.activeIndex) {
            return;
        }
        let direction = index > this.activeIndex ? 'next' : 'prev';
        if (this.activeIndex === 0 && index === this.length) {
            direction = 'prev';
        }
        if (index - this.activeIndex > 1) {
            direction = 'prev';
        }
        if (this.activeIndex === this.length && index === 0) {
            direction = 'next';
        }
        this.changeSlides(direction, index);
    };
    changeNoRotateSlides = (direction, newIndex) => {
        this.carousel.embla.scrollTo(newIndex);
        this.activeIndex = newIndex;
    };
    changeSlides = (direction, newIndex) => {
        const currentCaption = this.captions[this.activeIndex];
        currentCaption.addEventListener('transitionend', this.animationCaptionEnd);
        currentCaption.removeAttribute('visible');
        const imageToAnimate = direction === 'next'
            ? this.images[this.activeIndex]
            : this.images[newIndex];
        imageToAnimate.addEventListener('animationend', this.animationImageEnd);
        if (direction === 'next') {
            imageToAnimate.setAttribute('animating-forward', '');
        }
        else {
            imageToAnimate.setAttribute('animating-backward', '');
        }
        this.activeIndex = newIndex;
        this.toogleProgressDotActive();
        this.setProgressIndicator();
        this.toggleArrowsDisabled();
    };
    animationCaptionEnd = (event) => {
        const element = event.currentTarget;
        this.captions[this.activeIndex].setAttribute('visible', '');
        element.removeEventListener('transitionend', this.animationCaptionEnd);
    };
    animationImageEnd = (event) => {
        const element = event.currentTarget;
        element.removeAttribute('animating-forward');
        element.removeAttribute('animating-backward');
        element.removeEventListener('animationend', this.animationImageEnd);
        this.stackImages();
    };
    stackImages = () => {
        this.images.forEach((img, index) => {
            if (index === this.activeIndex) {
                img.style.zIndex = String(0);
            }
            else if (index > this.activeIndex) {
                img.style.zIndex = String(this.activeIndex - index);
            }
            else if (index < this.activeIndex) {
                img.style.zIndex = String(-this.length - index + 1);
            }
        });
    };
    stackImagesForVerticalScroll = () => {
        this.images.forEach((img, index) => {
            img.style.zIndex = this.withRotateImages ? `-${index}` : `${index}`;
        });
    };
    handleResizeVerticalScroll = (0, debounce_1.debounce)(() => {
        this.captionHeight = this.images[0].offsetHeight;
        this.captions.forEach(caption => {
            caption.style.minHeight = `${this.captionHeight}px`;
        });
    }, 300);
    rotateImages = () => {
        if (this.withVerticalScrollImage) {
            this.images.forEach((img, index) => {
                img.style.transform =
                    index % 2 === 0 ? `rotate(${1.7}deg)` : `rotate(-${1.7}deg)`;
            });
        }
        else {
            let prevMinus = 0;
            let prevPlus = 0;
            this.images.forEach((img, index) => {
                if ((index + 1) % 3 === 0) {
                    const deg = prevMinus + 2.5;
                    img.style.transform = `rotate(${deg}deg)`;
                    prevMinus = deg;
                }
                else {
                    const deg = prevPlus - 1.5;
                    img.style.transform = `rotate(${deg}deg)`;
                    prevPlus = deg;
                }
            });
        }
    };
    handleCarouselScroll = (data) => {
        if (this.withProgressBar && !this.withRotateImages) {
            this.toogleProgressDotActive();
        }
    };
    toogleProgressDotActive = () => {
        const selectedScrollSnap = this.getSelectedScrollSnap();
        const dots = this.withProgressBar ? this.progressDots : this.dots;
        dots?.forEach((dot, index) => {
            dot.classList.toggle('image-slider__progress-bar-dot--passed', index < selectedScrollSnap);
            dot.classList.toggle('is-primary', index === this.activeIndex);
        });
    };
    setProgressIndicator = () => {
        if (this.progressBarIndicator) {
            const selectedScrollSnap = this.getSelectedScrollSnap();
            const progress = (selectedScrollSnap / this.length) * 100;
            this.progressBarIndicator.style.transform = `translate3d(${progress}%, 0, 0)`;
        }
    };
    getSelectedScrollSnap = () => {
        return this.carousel?.embla.selectedScrollSnap() ?? this.activeIndex;
    };
    setComponentVisible = () => {
        this.setAttribute('visible', '');
    };
    handleDragStart = event => {
        event.preventDefault();
        return false;
    };
    handleTouchStart = event => {
        this.touchStartX = event.clientX ?? event.touches[0].clientX;
    };
    handleTouchEnd = event => {
        if (event.target.closest('[data-progress-dot]')) {
            this.handleDotClick(event);
            return;
        }
        if (this.touchStartX === 0) {
            return;
        }
        const currentX = event.clientX ?? event.changedTouches[0].clientX;
        const swipeLeft = currentX - this.touchStartX < -20;
        const swipeRight = currentX - this.touchStartX > 20;
        if (swipeLeft && this.activeIndex !== this.length) {
            this.handleSwipe('next');
        }
        if (swipeRight && this.activeIndex !== 0) {
            this.handleSwipe('prev');
        }
        this.touchStartX = 0;
    };
    handleSwipe = (direction) => {
        let newIndex;
        if (direction === 'next') {
            newIndex = this.activeIndex === this.length ? 0 : this.activeIndex + 1;
        }
        else {
            newIndex = this.activeIndex - 1 < 0 ? this.length : this.activeIndex - 1;
        }
        if (!this.withRotateImages) {
            this.changeNoRotateSlides(direction, newIndex);
        }
        if (this.withRotateImages) {
            this.changeSlides(direction, newIndex);
            this.toggleArrowsDisabled();
        }
        if (this.withProgressBar && this.withRotateImages) {
            this.toogleProgressDotActive();
            this.setProgressIndicator();
        }
    };
}
exports.ImageSlider = ImageSlider;


/***/ }),

/***/ 5374:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LookbookComponent = exports.LookbookModal = void 0;
var lookbook_modal_1 = __webpack_require__(5914);
Object.defineProperty(exports, "LookbookModal", ({ enumerable: true, get: function () { return lookbook_modal_1.LookbookModal; } }));
var lookbook_1 = __webpack_require__(2263);
Object.defineProperty(exports, "LookbookComponent", ({ enumerable: true, get: function () { return lookbook_1.LookbookComponent; } }));


/***/ }),

/***/ 5914:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LookbookModal = void 0;
const utils_1 = __webpack_require__(4083);
const modal_1 = __webpack_require__(2549);
const LOOKBOOK_SELECTOR = 'lookbook-component';
class LookbookModal extends modal_1.ModalComponent {
    async show() {
        await super.show();
        const lookbook = (0, utils_1.$elParent)(LOOKBOOK_SELECTOR, this);
        lookbook?.showBlockById(lookbook.selectedPinId);
    }
}
exports.LookbookModal = LookbookModal;


/***/ }),

/***/ 2263:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LookbookComponent = void 0;
const check_media_1 = __webpack_require__(5580);
const debounce_1 = __webpack_require__(2731);
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const PIN_SELECTOR = '[data-lookbook-pin]';
const BLOCK_SELECTOR = '[data-lookbook-block]';
const MODAL_SELECTOR = '[data-lookbook-modal]';
const CAROUSEL_SELECTOR = 'slider-grid:not([with-grid])';
const CAROUSEL_TRACK_SELECTOR = '[data-lookbook-mobile-content] [slider-grid-track]';
const DESKTOP_CONTENT_SELECTOR = '[data-lookbook-desktop-content]';
const MOBILE_CONTENT_SELECTOR = '[data-lookbook-mobile-content]';
class LookbookComponent extends base_component_1.BaseComponent {
    animationPausedAttribute = 'animation-paused';
    selectedPinId;
    notHighlightedAttribute = 'not-highlighted';
    pins;
    highlightedBlockId;
    resizeObserver;
    carouselTrack;
    mountComponent() {
        const pins = (0, utils_1.$list)(PIN_SELECTOR, this);
        pins.forEach(pin => {
            this.addListener(pin, 'mouseenter', this.handlePinEnter);
            this.addListener(pin, 'mouseleave', this.handlePinLeave);
            this.addListener(pin, 'click', this.handlePinClick);
        });
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(this);
        if ((0, check_media_1.isMobile)()) {
            this.carouselTrack = (0, utils_1.$el)(CAROUSEL_TRACK_SELECTOR, this);
        }
    }
    unmountComponent() {
        this.resizeObserver.disconnect();
    }
    handlePinEnter = () => {
        this.setAnimationPausedState(true);
    };
    handlePinLeave = () => {
        if (this.highlightedBlockId) {
            return;
        }
        this.setAnimationPausedState(false);
    };
    handleResize = (0, debounce_1.debounce)(() => {
        this.showBlockById(this.highlightedBlockId);
    }, 500);
    handlePinClick = (event) => {
        const pin = event.target;
        const blockId = pin.dataset.blockId;
        this.selectedPinId = blockId;
        if (pin.parentElement.tagName !== 'MODAL-BUTTON') {
            this.showBlockById(blockId);
        }
        this.setListeners();
    };
    handleOutsideClick = (event) => {
        const pin = (0, utils_1.$elParent)(PIN_SELECTOR, event.target);
        if (!pin) {
            this.showBlockById();
            this.removeListeners();
        }
    };
    handlePointerMove = () => {
        this.showBlockById();
        this.removeListeners();
    };
    setListeners = () => {
        this.addListener(window, 'click', this.handleOutsideClick);
        if (this.carouselTrack) {
            this.addListener(this.carouselTrack, 'pointermove', this.handlePointerMove);
        }
    };
    removeListeners = () => {
        this.removeListener(window, 'click', this.handleOutsideClick);
        if (this.carouselTrack) {
            this.removeListener(this.carouselTrack, 'pointermove', this.handlePointerMove);
        }
    };
    showBlockById(blockId) {
        this.updateSelectedStateForPins(blockId);
        if (blockId) {
            this.setHighlightBlockById(blockId);
            this.setAnimationPausedState(true);
        }
        else {
            this.resetHighlight();
            this.setAnimationPausedState(false);
        }
        this.highlightedBlockId = blockId;
    }
    updateSelectedStateForPins(blockId) {
        const pins = (0, utils_1.$list)(PIN_SELECTOR, this);
        pins.forEach(pin => {
            pin.toggleAttribute('is-selected', pin.dataset.blockId === blockId);
        });
    }
    setAnimationPausedState(isAnimationPaused) {
        this.toggleAttribute(this.animationPausedAttribute, isAnimationPaused);
    }
    setHighlightBlockById(blockId) {
        this.blocks.forEach((block, index) => {
            const isHighlighted = block.dataset.blockId === blockId;
            if (isHighlighted) {
                this.scrollToProductByIndex(index);
            }
            block.removeAttribute('style');
            block.toggleAttribute(this.notHighlightedAttribute, !isHighlighted);
        });
    }
    scrollToProductByIndex(index) {
        const block = this.blocks[index];
        const carousel = (0, utils_1.$elParent)(CAROUSEL_SELECTOR, block);
        if (carousel) {
            carousel.scrollSlideIntoView(index);
        }
        else if ((0, utils_1.isNotThemeStore)()) {
            block.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    resetHighlight() {
        this.blocks.forEach(block => {
            block.removeAttribute(this.notHighlightedAttribute);
        });
    }
    get blocks() {
        const desktopContent = (0, utils_1.$el)(DESKTOP_CONTENT_SELECTOR, this);
        const mobileContent = (0, utils_1.$el)(MOBILE_CONTENT_SELECTOR, this);
        const content = (0, check_media_1.isMobile)() ? mobileContent : desktopContent;
        const modal = (0, utils_1.$el)(MODAL_SELECTOR, content);
        const node = modal ? modal.element : content;
        return (0, utils_1.$list)(BLOCK_SELECTOR, node);
    }
}
exports.LookbookComponent = LookbookComponent;


/***/ }),

/***/ 2262:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StoreLocator = void 0;
var store_locator_1 = __webpack_require__(2803);
Object.defineProperty(exports, "StoreLocator", ({ enumerable: true, get: function () { return store_locator_1.StoreLocator; } }));


/***/ }),

/***/ 6942:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MapComponent = void 0;
const base_component_1 = __webpack_require__(3608);
const js_api_loader_1 = __webpack_require__(3311);
const styles_1 = __webpack_require__(8566);
class MapComponent extends base_component_1.BaseComponent {
    styleAttribute = 'data-map-style';
    customStyleAttribute = 'data-map-custom-style';
    zoomAttribute = 'data-map-zoom';
    defaultZoom = 10;
    api_key;
    locationsData = [];
    locations = [];
    center = { lat: 0, lng: 0 };
    markers = [];
    mapStyle;
    mapCustomStyle;
    zoom;
    map;
    constructor() {
        super();
        this.api_key = this.dataset.key;
        this.mapStyle = this.getAttribute(this.styleAttribute);
        this.mapCustomStyle = this.toJSON(this.getAttribute(this.customStyleAttribute));
        this.zoom = +this.getAttribute(this.zoomAttribute) || this.defaultZoom;
    }
    async mountComponent() {
        window.gm_authFailure = this.handleErrors;
        if (this.locationsData.length > 0) {
            await this.initMap();
        }
    }
    unmountComponent() {
        window.gm_authFailure = null;
    }
    initMap = async () => {
        try {
            await new js_api_loader_1.Loader({
                apiKey: this.api_key,
                version: 'weekly',
            }).load();
            this.locations = this.generateMapLocations();
            this.calcMapCenter();
            this.setMap();
            this.setMarkers();
        }
        catch (error) {
            this.handleErrors(error);
        }
    };
    generateMapLocations = () => {
        const data = [];
        for (const store of this.locationsData) {
            const { id, coordinates } = store;
            const location = this.generateCoordinatesFromString(coordinates);
            if (location) {
                data.push({ id, location });
            }
        }
        return data;
    };
    setMap = () => {
        const map = new google.maps.Map(this, {
            zoom: this.locations.length > 0 ? this.zoom : 0,
            center: this.center,
            styles: this.mapCustomStyle ?? styles_1.mapStyles[this.mapStyle],
        });
        this.map = map;
    };
    setMarkers = () => {
        if (this.locations.length === 0) {
            return;
        }
        this.locations.map(location => {
            const marker = new google.maps.Marker({
                map: this.map,
                position: location.location,
                id: location.id,
            });
            if (this.locations.length > 1) {
                marker.addListener('click', event => {
                    this.emit('markerClick', { markerId: location.id });
                });
            }
            this.markers.push(marker);
        });
    };
    generateCoordinatesFromString = (string) => {
        const array = string.split(',');
        const lat = +array[0];
        const lng = +array[1];
        if (!lat || !lng) {
            return;
        }
        return { lat, lng };
    };
    calcMapCenter() {
        const locationsLength = this.locations.length;
        if (locationsLength > 0) {
            const center = { lat: 0, lng: 0 };
            this.locations.forEach(location => {
                center.lat = center.lat + location.location.lat;
                center.lng = center.lng + location.location.lng;
            });
            center.lat = center.lat / locationsLength;
            center.lng = center.lng / locationsLength;
            this.center = center;
        }
    }
    highlightMarker(id) {
        this.markers.forEach(marker => {
            if (!id) {
                marker.setOpacity(1);
                return;
            }
            if (marker.id === id) {
                marker.setOpacity(1);
            }
            else {
                marker.setOpacity(0.5);
            }
        });
    }
    toJSON = (str) => {
        try {
            const json = JSON.parse(str);
            return json;
        }
        catch (e) {
            return null;
        }
    };
    handleErrors = (error) => {
        console.log(error);
        this.emit('mapError', {});
    };
}
exports.MapComponent = MapComponent;


/***/ }),

/***/ 2803:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StoreLocator = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const check_media_1 = __webpack_require__(5580);
class StoreLocator extends base_component_1.BaseComponent {
    mapSelector = '#map';
    storeElementSelector = 'data-store';
    storeIdSelector = 'data-block-id';
    storeNameSelector = 'data-name';
    storeCoordinatesSelector = 'data-coordinates';
    defaultImageSelector = 'map-default-image';
    map;
    stores;
    constructor() {
        super();
        this.map = (0, utils_1.$el)(this.mapSelector, this);
        this.stores = (0, utils_1.$list)(`[${this.storeElementSelector}]`, this);
    }
    mountComponent() {
        if (this.map) {
            this.map.locationsData = this.generateLocationsData();
            this.map.initMap();
            this.map?.on('markerClick', this.handleMarkerClick);
            this.map?.on('mapError', this.handleMapError);
        }
        this.stores.forEach(store => {
            this.addListener(store, 'click', this.handleStoreClick);
        });
    }
    unmountComponent() {
        if (this.map) {
            this.map.off('markerClick', this.handleMarkerClick);
            this.map.off('mapError', this.handleMapError);
        }
    }
    generateLocationsData = () => {
        const locationsData = this.stores.map(store => ({
            coordinates: store.getAttribute(this.storeCoordinatesSelector),
            id: store.getAttribute(this.storeIdSelector),
        }));
        return locationsData;
    };
    handleMarkerClick = ({ markerId }) => {
        const storeToScrollTo = this.stores.find(store => store.dataset.blockId === markerId);
        if ((0, utils_1.isNotThemeStore)()) {
            storeToScrollTo?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        storeToScrollTo?.show();
        this.toggleStoreVisibility(markerId);
    };
    handleStoreClick = ({ currentTarget }) => {
        const storeId = currentTarget.getAttribute(this.storeIdSelector);
        this.toggleStoreVisibility(storeId);
        if ((0, check_media_1.isMobile)() && currentTarget.isExpanded) {
            this.scrollToTabTop(currentTarget);
        }
    };
    scrollToTabTop = async (element) => {
        await (0, utils_1.transitionToPromise)(element);
        const top = element.getBoundingClientRect().top;
        if (top < 0) {
            window.scrollBy({
                top: top - 100,
                left: 0,
                behavior: 'smooth',
            });
        }
    };
    toggleStoreVisibility = (id) => {
        this.toggleStoreExpanded(id);
        this.toggleMarkerHighlighted(id);
    };
    toggleStoreExpanded = (id) => {
        this.stores.forEach(store => {
            if (store.dataset.blockId !== id && store.isExpanded) {
                store.hide();
            }
        });
    };
    toggleMarkerHighlighted = (id) => {
        const isAnyStoreExpanded = this.stores.find(store => store.isExpanded);
        if (isAnyStoreExpanded) {
            this.map?.highlightMarker(id);
        }
        else {
            this.map?.highlightMarker(null);
        }
    };
    setDefaultImage = () => {
        const template = (0, utils_1.$el)(`[${this.defaultImageSelector}]`, this);
        const image = template?.content;
        this.map?.replaceWith(image);
    };
    handleMapError = () => {
        this.setDefaultImage();
    };
}
exports.StoreLocator = StoreLocator;


/***/ }),

/***/ 8566:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.mapStyles = void 0;
exports.mapStyles = {
    silver: [
        {
            elementType: 'geometry',
            stylers: [
                {
                    color: '#f5f5f5',
                },
            ],
        },
        {
            elementType: 'labels.icon',
            stylers: [
                {
                    visibility: 'off',
                },
            ],
        },
        {
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#616161',
                },
            ],
        },
        {
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    color: '#f5f5f5',
                },
            ],
        },
        {
            featureType: 'administrative.land_parcel',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#bdbdbd',
                },
            ],
        },
        {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#eeeeee',
                },
            ],
        },
        {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#757575',
                },
            ],
        },
        {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#e5e5e5',
                },
            ],
        },
        {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#9e9e9e',
                },
            ],
        },
        {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#ffffff',
                },
            ],
        },
        {
            featureType: 'road.arterial',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#757575',
                },
            ],
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#dadada',
                },
            ],
        },
        {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#616161',
                },
            ],
        },
        {
            featureType: 'road.local',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#9e9e9e',
                },
            ],
        },
        {
            featureType: 'transit.line',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#e5e5e5',
                },
            ],
        },
        {
            featureType: 'transit.station',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#eeeeee',
                },
            ],
        },
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#c9c9c9',
                },
            ],
        },
        {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#9e9e9e',
                },
            ],
        },
    ],
    retro: [
        {
            elementType: 'geometry',
            stylers: [
                {
                    color: '#ebe3cd',
                },
            ],
        },
        {
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#523735',
                },
            ],
        },
        {
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    color: '#f5f1e6',
                },
            ],
        },
        {
            featureType: 'administrative',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    color: '#c9b2a6',
                },
            ],
        },
        {
            featureType: 'administrative.land_parcel',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    color: '#dcd2be',
                },
            ],
        },
        {
            featureType: 'administrative.land_parcel',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#ae9e90',
                },
            ],
        },
        {
            featureType: 'landscape.natural',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#dfd2ae',
                },
            ],
        },
        {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#dfd2ae',
                },
            ],
        },
        {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#93817c',
                },
            ],
        },
        {
            featureType: 'poi.park',
            elementType: 'geometry.fill',
            stylers: [
                {
                    color: '#a5b076',
                },
            ],
        },
        {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#447530',
                },
            ],
        },
        {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#f5f1e6',
                },
            ],
        },
        {
            featureType: 'road.arterial',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#fdfcf8',
                },
            ],
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#f8c967',
                },
            ],
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    color: '#e9bc62',
                },
            ],
        },
        {
            featureType: 'road.highway.controlled_access',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#e98d58',
                },
            ],
        },
        {
            featureType: 'road.highway.controlled_access',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    color: '#db8555',
                },
            ],
        },
        {
            featureType: 'road.local',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#806b63',
                },
            ],
        },
        {
            featureType: 'transit.line',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#dfd2ae',
                },
            ],
        },
        {
            featureType: 'transit.line',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#8f7d77',
                },
            ],
        },
        {
            featureType: 'transit.line',
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    color: '#ebe3cd',
                },
            ],
        },
        {
            featureType: 'transit.station',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#dfd2ae',
                },
            ],
        },
        {
            featureType: 'water',
            elementType: 'geometry.fill',
            stylers: [
                {
                    color: '#b9d3c2',
                },
            ],
        },
        {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#92998d',
                },
            ],
        },
    ],
    dark: [
        {
            elementType: 'geometry',
            stylers: [
                {
                    color: '#212121',
                },
            ],
        },
        {
            elementType: 'labels.icon',
            stylers: [
                {
                    visibility: 'off',
                },
            ],
        },
        {
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#757575',
                },
            ],
        },
        {
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    color: '#212121',
                },
            ],
        },
        {
            featureType: 'administrative',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#757575',
                },
            ],
        },
        {
            featureType: 'administrative.country',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#9e9e9e',
                },
            ],
        },
        {
            featureType: 'administrative.land_parcel',
            stylers: [
                {
                    visibility: 'off',
                },
            ],
        },
        {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#bdbdbd',
                },
            ],
        },
        {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#757575',
                },
            ],
        },
        {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#181818',
                },
            ],
        },
        {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#616161',
                },
            ],
        },
        {
            featureType: 'poi.park',
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    color: '#1b1b1b',
                },
            ],
        },
        {
            featureType: 'road',
            elementType: 'geometry.fill',
            stylers: [
                {
                    color: '#2c2c2c',
                },
            ],
        },
        {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#8a8a8a',
                },
            ],
        },
        {
            featureType: 'road.arterial',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#373737',
                },
            ],
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#3c3c3c',
                },
            ],
        },
        {
            featureType: 'road.highway.controlled_access',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#4e4e4e',
                },
            ],
        },
        {
            featureType: 'road.local',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#616161',
                },
            ],
        },
        {
            featureType: 'transit',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#757575',
                },
            ],
        },
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#000000',
                },
            ],
        },
        {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#3d3d3d',
                },
            ],
        },
    ],
    night: [
        {
            elementType: 'geometry',
            stylers: [
                {
                    color: '#242f3e',
                },
            ],
        },
        {
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#746855',
                },
            ],
        },
        {
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    color: '#242f3e',
                },
            ],
        },
        {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#d59563',
                },
            ],
        },
        {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#d59563',
                },
            ],
        },
        {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#263c3f',
                },
            ],
        },
        {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#6b9a76',
                },
            ],
        },
        {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#38414e',
                },
            ],
        },
        {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    color: '#212a37',
                },
            ],
        },
        {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#9ca5b3',
                },
            ],
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#746855',
                },
            ],
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    color: '#1f2835',
                },
            ],
        },
        {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#f3d19c',
                },
            ],
        },
        {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#2f3948',
                },
            ],
        },
        {
            featureType: 'transit.station',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#d59563',
                },
            ],
        },
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#17263c',
                },
            ],
        },
        {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#515c6d',
                },
            ],
        },
        {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    color: '#17263c',
                },
            ],
        },
    ],
    aubergine: [
        {
            elementType: 'geometry',
            stylers: [
                {
                    color: '#1d2c4d',
                },
            ],
        },
        {
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#8ec3b9',
                },
            ],
        },
        {
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    color: '#1a3646',
                },
            ],
        },
        {
            featureType: 'administrative.country',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    color: '#4b6878',
                },
            ],
        },
        {
            featureType: 'administrative.land_parcel',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#64779e',
                },
            ],
        },
        {
            featureType: 'administrative.province',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    color: '#4b6878',
                },
            ],
        },
        {
            featureType: 'landscape.man_made',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    color: '#334e87',
                },
            ],
        },
        {
            featureType: 'landscape.natural',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#023e58',
                },
            ],
        },
        {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#283d6a',
                },
            ],
        },
        {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#6f9ba5',
                },
            ],
        },
        {
            featureType: 'poi',
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    color: '#1d2c4d',
                },
            ],
        },
        {
            featureType: 'poi.park',
            elementType: 'geometry.fill',
            stylers: [
                {
                    color: '#023e58',
                },
            ],
        },
        {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#3C7680',
                },
            ],
        },
        {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#304a7d',
                },
            ],
        },
        {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#98a5be',
                },
            ],
        },
        {
            featureType: 'road',
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    color: '#1d2c4d',
                },
            ],
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#2c6675',
                },
            ],
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    color: '#255763',
                },
            ],
        },
        {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#b0d5ce',
                },
            ],
        },
        {
            featureType: 'road.highway',
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    color: '#023e58',
                },
            ],
        },
        {
            featureType: 'transit',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#98a5be',
                },
            ],
        },
        {
            featureType: 'transit',
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    color: '#1d2c4d',
                },
            ],
        },
        {
            featureType: 'transit.line',
            elementType: 'geometry.fill',
            stylers: [
                {
                    color: '#283d6a',
                },
            ],
        },
        {
            featureType: 'transit.station',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#3a4762',
                },
            ],
        },
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#0e1626',
                },
            ],
        },
        {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#4e6d70',
                },
            ],
        },
    ],
};


/***/ }),

/***/ 4504:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PasswordModalButton = exports.PasswordModal = void 0;
var password_modal_1 = __webpack_require__(3525);
Object.defineProperty(exports, "PasswordModal", ({ enumerable: true, get: function () { return password_modal_1.PasswordModal; } }));
var password_modal_button_1 = __webpack_require__(5777);
Object.defineProperty(exports, "PasswordModalButton", ({ enumerable: true, get: function () { return password_modal_button_1.PasswordModalButton; } }));


/***/ }),

/***/ 5777:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PasswordModalButton = void 0;
const modal_button_1 = __webpack_require__(467);
class PasswordModalButton extends modal_button_1.ModalButton {
    mountComponent() {
        super.mountComponent();
        this.focus();
    }
}
exports.PasswordModalButton = PasswordModalButton;


/***/ }),

/***/ 3525:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PasswordModal = void 0;
const utils_1 = __webpack_require__(4083);
const modal_1 = __webpack_require__(2549);
const INPUT_SELECTOR = '[password-modal-input]';
class PasswordModal extends modal_1.ModalComponent {
    async show() {
        super.show();
        (0, utils_1.$el)(INPUT_SELECTOR, this)?.focus();
    }
}
exports.PasswordModal = PasswordModal;


/***/ }),

/***/ 6502:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConditionRuntime = void 0;
const check_media_1 = __webpack_require__(5580);
const utils_1 = __webpack_require__(4142);
const timeDelayToMs = (delay) => {
    switch (delay) {
        case 'none':
            return 0;
        case '3sec':
            return 3000;
        case '5sec':
            return 5000;
        case '15sec':
            return 15000;
        case '30sec':
            return 30000;
        case '1min':
            return 60000;
        case '2min':
            return 120000;
    }
};
const frequencyToMs = (delay) => {
    switch (delay) {
        case '1h':
            return 60 * 60 * 1000;
        case '12h':
            return 12 * 60 * 60 * 1000;
        case '1d':
            return 24 * 60 * 60 * 1000;
        case '3d':
            return 3 * 24 * 60 * 60 * 1000;
        case '1w':
            return 7 * 24 * 60 * 60 * 1000;
        case '2w':
            return 14 * 24 * 60 * 60 * 1000;
        default:
            return 0;
    }
};
const SCROLL_THRESHOLD = {
    '25': 20,
    '50': 40,
    '75': 55,
    '100': 99,
};
const clearTag = (str) => str.toLowerCase().replace(/\s+/g, '');
class ConditionRuntime {
    whenShow;
    pageCondition;
    pages;
    timeDelay;
    pageScroll;
    exitIntent;
    frequency;
    lastShowDate;
    productTags;
    showCallback;
    startDate;
    timerRef;
    constructor(dataset, lastShowDate, show) {
        this.showCallback = show;
        this.pageCondition = dataset.pageCondition ?? 'all';
        this.whenShow = dataset.whenShow ?? 'immediately';
        this.pages = dataset.pages;
        this.timeDelay = dataset.timeDelay === 'none' ? null : dataset.timeDelay;
        this.pageScroll = dataset.pageScroll === 'none' ? null : dataset.pageScroll;
        this.exitIntent = dataset.exitIntent === 'true' ?? false;
        this.frequency = dataset.frequency ?? 'unlimited';
        this.productTags = (dataset.productTags || '')
            .split(',')
            .map(clearTag)
            .filter(str => str.length > 0);
        this.lastShowDate = lastShowDate;
    }
    _shouldShowOnThisPage = () => {
        if (this.pageCondition === 'target') {
            const urls = this.pages
                ?.split('\n')
                .map(sourceUrl => {
                try {
                    return new URL(sourceUrl);
                }
                catch (e) {
                    return false;
                }
            })
                .filter(Boolean)
                .map(url => url.pathname) ?? [];
            for (let i = 0; i < urls.length; i++) {
                const wildcard = urls[i];
                if ((0, utils_1.wildcardToRegExp)(wildcard).test(window.location.pathname)) {
                    return true;
                }
            }
            return false;
        }
        if (this.pageCondition === 'tags') {
            const currentProductTags = window.auroraProductTags;
            if (!currentProductTags ||
                !Array.isArray(currentProductTags) ||
                currentProductTags.length === 0) {
                return false;
            }
            return currentProductTags
                .map(clearTag)
                .some(tag => this.productTags.includes(tag));
        }
        return true;
    };
    run = () => {
        if (!this._shouldShowOnThisPage()) {
            return;
        }
        if (this.frequency === 'once' && this.lastShowDate) {
            return;
        }
        if (this.frequency !== 'unlimited' &&
            this.lastShowDate &&
            Date.now() - frequencyToMs(this.frequency) < this.lastShowDate.getTime()) {
            return;
        }
        this.startDate = new Date();
        this.timerRef = window.setInterval(() => {
            this._tick();
        }, 1000);
        this._tick();
        if (this.exitIntent && !(0, check_media_1.isMobile)()) {
            document.addEventListener('mouseout', this._handleMouseLeave);
        }
        if (this.pageScroll) {
            window.addEventListener('scroll', this._handleWindowScroll);
            this._handleWindowScroll();
        }
    };
    _tick = () => {
        if (this.whenShow === 'immediately') {
            this._show();
            return;
        }
        if (this.timeDelay) {
            if (Date.now() - timeDelayToMs(this.timeDelay) >=
                this.startDate.getTime()) {
                this._show();
            }
        }
    };
    _handleWindowScroll = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.body.offsetHeight;
        const winHeight = window.innerHeight;
        const scrollPercent = docHeight === winHeight ? 1 : scrollTop / (docHeight - winHeight);
        const scrollPercentRounded = Math.round(scrollPercent * 100);
        if (scrollPercentRounded >= SCROLL_THRESHOLD[this.pageScroll]) {
            this._show();
        }
    };
    _handleMouseLeave = (e) => {
        if (!e.toElement && !e.relatedTarget) {
            this._show();
        }
    };
    _show = () => {
        this.showCallback();
        this.cleanup();
    };
    cleanup = () => {
        clearInterval(this.timerRef);
        if (this.pageScroll) {
            window.removeEventListener('scroll', this._handleWindowScroll);
        }
        if (this.exitIntent && !(0, check_media_1.isMobile)()) {
            document.removeEventListener('mouseout', this._handleMouseLeave);
        }
    };
}
exports.ConditionRuntime = ConditionRuntime;


/***/ }),

/***/ 8126:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.POPUP_CLASSNAMES = exports.POPUP_STORAGE_KEY = void 0;
exports.POPUP_STORAGE_KEY = 'AuroraTheme-Popup';
exports.POPUP_CLASSNAMES = {
    lightboxActive: 'popup--active',
    lightboxClosing: 'popup--closing',
    success: 'popup--success',
    showImage: 'popup--show-image',
};


/***/ }),

/***/ 4997:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PopupTeaser = exports.PopupSignup = exports.PopupPromo = exports.PopupAgeVerifier = void 0;
var popup_age_verifier_1 = __webpack_require__(2677);
Object.defineProperty(exports, "PopupAgeVerifier", ({ enumerable: true, get: function () { return popup_age_verifier_1.PopupAgeVerifier; } }));
var popup_promo_1 = __webpack_require__(4156);
Object.defineProperty(exports, "PopupPromo", ({ enumerable: true, get: function () { return popup_promo_1.PopupPromo; } }));
var popup_signup_1 = __webpack_require__(9379);
Object.defineProperty(exports, "PopupSignup", ({ enumerable: true, get: function () { return popup_signup_1.PopupSignup; } }));
var popup_teaser_1 = __webpack_require__(5520);
Object.defineProperty(exports, "PopupTeaser", ({ enumerable: true, get: function () { return popup_teaser_1.PopupTeaser; } }));


/***/ }),

/***/ 2677:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PopupAgeVerifier = void 0;
const modal_1 = __webpack_require__(2549);
const popup_storage_1 = __webpack_require__(9625);
const types_1 = __webpack_require__(8231);
const utils_1 = __webpack_require__(4142);
const condition_runtime_1 = __webpack_require__(6502);
const constants_1 = __webpack_require__(8126);
const check_media_1 = __webpack_require__(5580);
const utils_2 = __webpack_require__(4083);
const BODY_ELEMENT_SELECTOR = 'body-element';
class PopupAgeVerifier extends modal_1.ModalComponent {
    storage;
    conditionRuntime;
    hasImage;
    hideImgOnMobile;
    constructor() {
        super();
        this.storage = new popup_storage_1.PopupStorage(this.dataset.blockId ?? this.id);
        this.hasImage = this.dataset.hasImage === 'true';
        this.hideImgOnMobile = this.dataset.hideImgMobile === 'true';
    }
    mountComponent() {
        const data = this.storage.loadData();
        if (this.isEditor) {
            this.editor.on('BLOCK_SELECT', this._handleBlockSelect);
            this.editor.on('BLOCK_DESELECT', this._handleBlockDeselect);
            return;
        }
        if (!data || (data.type === types_1.PopupType.AgeVerifier && !data.verified)) {
            this.conditionRuntime = new condition_runtime_1.ConditionRuntime(this.dataset, null, this.show);
            this.conditionRuntime.run();
        }
    }
    unmountComponent() {
        this.conditionRuntime?.cleanup();
    }
    _handleBlockSelect = ({ detail: { blockId } }) => {
        if (this.dataset.blockId === blockId) {
            this.show();
        }
    };
    _handleBlockDeselect = ({ detail: { blockId } }) => {
        if (this.dataset.blockId === blockId) {
            this.hide();
        }
    };
    show = async () => {
        const withGradient = !!this.dataset.overlayGradient;
        const bodyElement = (0, utils_2.$el)(BODY_ELEMENT_SELECTOR);
        const background = withGradient
            ? (0, utils_1.gradientOpacity)(this.dataset.overlayGradient, this.dataset.overlayOpacity)
            : `color-mix(in srgb, ${this.dataset.overlaySolid} ${Number(this.dataset.overlayOpacity) * 100}%, transparent)`;
        const blurFilter = `blur(${this.dataset.overlayBlur}px)`;
        (0, utils_2.whenDefined)('body-element').then(() => {
            bodyElement.showOverlay(this.id, {
                zIndex: 8888,
                background,
                backdropFilter: blurFilter,
                '-webkit-backdrop-filter': blurFilter,
                transitionDuration: '0s',
            });
        });
        await super.show();
        this.classList.add(constants_1.POPUP_CLASSNAMES.lightboxActive);
        this.addListener(this._verifyBtn, 'click', this.onVerify);
        if (this.hasImage) {
            if (this.hideImgOnMobile && (0, check_media_1.isMobile)()) {
                return;
            }
            setTimeout(() => {
                this.classList.add(constants_1.POPUP_CLASSNAMES.showImage);
            }, utils_1.POPUP_ANIMATION_DELAY);
        }
    };
    hide = async () => {
        const bodyElement = (0, utils_2.$el)(BODY_ELEMENT_SELECTOR);
        (0, utils_2.whenDefined)('body-element').then(() => {
            bodyElement.hideOverlay(this.id);
        });
        this.conditionRuntime?.cleanup();
        this.classList.remove(constants_1.POPUP_CLASSNAMES.lightboxActive);
        this.classList.add(constants_1.POPUP_CLASSNAMES.lightboxClosing);
        await super.hide();
        this.classList.remove(constants_1.POPUP_CLASSNAMES.showImage);
        this.classList.remove(constants_1.POPUP_CLASSNAMES.lightboxClosing);
    };
    onVerify = () => {
        if (!this.isEditor) {
            this.storage.saveData({ type: types_1.PopupType.AgeVerifier, verified: true });
        }
        this.removeListener(this._verifyBtn, 'click', this.onVerify);
        this.hide();
    };
    get _verifyBtn() {
        if (!this.isOpen) {
            return null;
        }
        return (0, utils_2.$el)('[data-verify-btn]', this);
    }
}
exports.PopupAgeVerifier = PopupAgeVerifier;


/***/ }),

/***/ 4156:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PopupPromo = void 0;
const modal_1 = __webpack_require__(2549);
const popup_storage_1 = __webpack_require__(9625);
const types_1 = __webpack_require__(8231);
const condition_runtime_1 = __webpack_require__(6502);
const utils_1 = __webpack_require__(4142);
const constants_1 = __webpack_require__(8126);
const check_media_1 = __webpack_require__(5580);
const utils_2 = __webpack_require__(4083);
const BODY_ELEMENT_SELECTOR = 'body-element';
class PopupPromo extends modal_1.ModalComponent {
    storage;
    conditionRuntime;
    variant;
    hasImage;
    hideImgOnMobile;
    constructor() {
        super();
        this.storage = new popup_storage_1.PopupStorage(this.dataset.blockId ?? this.id);
        this.variant = this.dataset.variant;
        this.hasImage = this.dataset.hasImage === 'true';
        this.hideImgOnMobile = this.dataset.hideImgMobile === 'true';
    }
    mountComponent() {
        if (this.isEditor) {
            this.editor.on('BLOCK_SELECT', this._handleBlockSelect);
            this.editor.on('BLOCK_DESELECT', this._handleBlockDeselect);
            return;
        }
        const data = this.storage.loadData();
        if (!data || data.type === types_1.PopupType.Promo) {
            if (data?.lastShow) {
                try {
                    data.lastShow = new Date(data.lastShow);
                }
                catch {
                    data.lastShow = null;
                }
            }
            this.conditionRuntime = new condition_runtime_1.ConditionRuntime(this.dataset, data?.lastShow ?? null, this.show);
            this.conditionRuntime.run();
        }
    }
    unmountComponent() {
        this.conditionRuntime?.cleanup();
    }
    _handleBlockSelect = ({ detail: { blockId } }) => {
        if (this.dataset.blockId === blockId) {
            this.show();
        }
    };
    _handleBlockDeselect = ({ detail: { blockId } }) => {
        if (this.dataset.blockId === blockId) {
            this.hide();
        }
    };
    show = async () => {
        if (this.variant === 'lightbox') {
            const withGradient = !!this.dataset.overlayGradient;
            const bodyElement = (0, utils_2.$el)(BODY_ELEMENT_SELECTOR);
            const background = withGradient
                ? (0, utils_1.gradientOpacity)(this.dataset.overlayGradient, this.dataset.overlayOpacity)
                : `color-mix(in srgb, ${this.dataset.overlaySolid} ${Number(this.dataset.overlayOpacity) * 100}%, transparent)`;
            const blurFilter = `blur(${this.dataset.overlayBlur}px)`;
            (0, utils_2.whenDefined)('body-element').then(() => {
                bodyElement.showOverlay(this.id, {
                    zIndex: 8888,
                    background,
                    backdropFilter: blurFilter,
                    '-webkit-backdrop-filter': blurFilter,
                    transitionDuration: `${utils_1.POPUP_ANIMATION_DELAY}ms`,
                });
            });
        }
        this.emit('popupShown', {});
        await super.show();
        if (this.variant === 'lightbox') {
            this.classList.add(constants_1.POPUP_CLASSNAMES.lightboxActive);
        }
        if (this.hasImage && !(this.hideImgOnMobile && (0, check_media_1.isMobile)())) {
            setTimeout(() => {
                this.classList.add(constants_1.POPUP_CLASSNAMES.showImage);
            }, utils_1.POPUP_ANIMATION_DELAY);
        }
        const closeBtn = this.selectBtn('close-small');
        if (closeBtn) {
            closeBtn.style.display = 'flex';
        }
        this.addListener(this.selectBtn('close'), 'click', this.hide);
        this.addListener(this.selectBtn('close-small'), 'click', this.hide);
        this.addListener(this.selectBtn('promo'), 'click', this.onTouch);
    };
    hide = async () => {
        this.onTouch();
        if (this.variant === 'lightbox') {
            const bodyElement = (0, utils_2.$el)(BODY_ELEMENT_SELECTOR);
            (0, utils_2.whenDefined)('body-element').then(() => {
                bodyElement.hideOverlay(this.id);
            });
        }
        this.conditionRuntime?.cleanup();
        this.removeListener(this.selectBtn('close'), 'click', this.hide);
        this.removeListener(this.selectBtn('close-small'), 'click', this.hide);
        this.removeListener(this.selectBtn('promo'), 'click', this.onTouch);
        if (this.variant === 'lightbox') {
            this.classList.remove(constants_1.POPUP_CLASSNAMES.lightboxActive);
            this.classList.add(constants_1.POPUP_CLASSNAMES.lightboxClosing);
        }
        await super.hide();
        this.classList.remove(constants_1.POPUP_CLASSNAMES.showImage);
        this.classList.remove(constants_1.POPUP_CLASSNAMES.lightboxClosing);
        this.emit('popupHidden', {});
    };
    onTouch = () => {
        this.storage.saveData({
            type: types_1.PopupType.Promo,
            lastShow: new Date(),
        });
    };
    selectBtn(type) {
        if (!this.isOpen) {
            return null;
        }
        return (0, utils_2.$el)(`[data-${type}-btn]`, this);
    }
}
exports.PopupPromo = PopupPromo;


/***/ }),

/***/ 9379:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PopupSignup = void 0;
const modal_1 = __webpack_require__(2549);
const popup_storage_1 = __webpack_require__(9625);
const types_1 = __webpack_require__(8231);
const condition_runtime_1 = __webpack_require__(6502);
const utils_1 = __webpack_require__(4142);
const constants_1 = __webpack_require__(8126);
const check_media_1 = __webpack_require__(5580);
const utils_2 = __webpack_require__(4083);
const BODY_ELEMENT_SELECTOR = 'body-element';
class PopupSignup extends modal_1.ModalComponent {
    storage;
    conditionRuntime;
    variant;
    hasImage;
    hideImgOnMobile;
    isSuccessMessage = false;
    signupCheckbox;
    submitButton;
    constructor() {
        super();
        this.storage = new popup_storage_1.PopupStorage(this.dataset.blockId ?? this.id);
        this.variant = this.dataset.variant;
        this.hasImage = this.dataset.hasImage === 'true';
        this.hideImgOnMobile = this.dataset.hideImgMobile === 'true';
    }
    mountComponent() {
        if (this.isEditor) {
            this.editor.on('BLOCK_SELECT', this._handleBlockSelect);
            this.editor.on('BLOCK_DESELECT', this._handleBlockDeselect);
            return;
        }
        const data = this.storage.loadData();
        // don't show on captcha page
        if (window.location.pathname.includes('challenge')) {
            return;
        }
        // handle success message
        if (this.dataset.showSuccessMessage === 'true' &&
            window.sessionStorage.getItem('customer-posted-block-id') ===
                this.dataset.blockId) {
            this.show();
            window.sessionStorage.removeItem('customer-posted-block-id');
            this.classList.add(constants_1.POPUP_CLASSNAMES.success);
            this.isSuccessMessage = true;
            return;
        }
        if (!data || data.type === types_1.PopupType.Signup) {
            if (data?.lastShow) {
                try {
                    data.lastShow = new Date(data.lastShow);
                }
                catch {
                    data.lastShow = null;
                }
            }
            this.conditionRuntime = new condition_runtime_1.ConditionRuntime(this.dataset, data?.lastShow ?? null, this.show);
            this.conditionRuntime.run();
        }
    }
    unmountComponent() {
        this.conditionRuntime?.cleanup();
    }
    handleSignupCheckboxToggle = ({ currentTarget }) => {
        this.submitButton.toggleAttribute('disabled', !currentTarget.checked);
    };
    _handleBlockSelect = ({ detail: { blockId } }) => {
        if (this.dataset.blockId === blockId) {
            this.show();
        }
    };
    _handleBlockDeselect = ({ detail: { blockId } }) => {
        if (this.dataset.blockId === blockId) {
            this.hide();
        }
    };
    show = async () => {
        if (this.variant === 'lightbox') {
            const withGradient = !!this.dataset.overlayGradient;
            const bodyElement = (0, utils_2.$el)(BODY_ELEMENT_SELECTOR);
            const background = withGradient
                ? (0, utils_1.gradientOpacity)(this.dataset.overlayGradient, this.dataset.overlayOpacity)
                : `color-mix(in srgb, ${this.dataset.overlaySolid} ${Number(this.dataset.overlayOpacity) * 100}%, transparent)`;
            const blurFilter = `blur(${this.dataset.overlayBlur}px)`;
            (0, utils_2.whenDefined)('body-element').then(() => {
                bodyElement.showOverlay(this.id, {
                    zIndex: 8888,
                    background,
                    backdropFilter: blurFilter,
                    '-webkit-backdrop-filter': blurFilter,
                    transitionDuration: `${utils_1.POPUP_ANIMATION_DELAY}ms`,
                });
            });
        }
        this.emit('popupShown', {});
        await super.show();
        this.saveLastShowData();
        const closeBtn = this.selectBtn('close-small');
        if (closeBtn) {
            closeBtn.style.display = 'flex';
        }
        this.addListener(this.selectBtn('close'), 'click', this.hide);
        this.addListener(this.selectBtn('close-small'), 'click', this.hide);
        this.addListener(this.selectBtn('submit'), 'click', this.onSubmit);
        if (this.variant === 'lightbox') {
            this.classList.add(constants_1.POPUP_CLASSNAMES.lightboxActive);
        }
        if (this.hasImage) {
            if (this.hideImgOnMobile && (0, check_media_1.isMobile)()) {
                return;
            }
            if (this.isSuccessMessage) {
                return;
            }
            setTimeout(() => {
                this.classList.add(constants_1.POPUP_CLASSNAMES.showImage);
            }, utils_1.POPUP_ANIMATION_DELAY);
        }
    };
    hide = async () => {
        this.saveLastShowData();
        if (this.variant === 'lightbox') {
            const bodyElement = (0, utils_2.$el)(BODY_ELEMENT_SELECTOR);
            (0, utils_2.whenDefined)('body-element').then(() => {
                bodyElement.hideOverlay(this.id);
            });
        }
        this.conditionRuntime?.cleanup();
        this.removeListener(this.selectBtn('close'), 'click', this.hide);
        this.removeListener(this.selectBtn('close-small'), 'click', this.hide);
        this.removeListener(this.selectBtn('submit'), 'click', this.onSubmit);
        if (this.variant === 'lightbox') {
            this.classList.remove(constants_1.POPUP_CLASSNAMES.lightboxActive);
            this.classList.add(constants_1.POPUP_CLASSNAMES.lightboxClosing);
        }
        await super.hide();
        this.classList.remove(constants_1.POPUP_CLASSNAMES.showImage);
        this.classList.remove(constants_1.POPUP_CLASSNAMES.lightboxClosing);
        this.emit('popupHidden', {});
    };
    onSubmit = () => {
        // for success page detection
        window.sessionStorage.setItem('customer-posted-block-id', this.dataset.blockId);
    };
    saveLastShowData = () => {
        this.storage.saveData({
            type: types_1.PopupType.Signup,
            lastShow: new Date(),
        });
    };
    selectBtn(type) {
        if (!this.isOpen) {
            return null;
        }
        return (0, utils_2.$el)(`[data-${type}-btn]`, this);
    }
}
exports.PopupSignup = PopupSignup;


/***/ }),

/***/ 9625:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PopupStorage = void 0;
const constants_1 = __webpack_require__(8126);
class PopupStorage {
    _blockId;
    constructor(blockId) {
        this._blockId = blockId;
    }
    parseData(data) {
        if (!data) {
            return null;
        }
        try {
            const obj = JSON.parse(data ?? '{}');
            return obj;
        }
        catch (error) {
            return null;
        }
    }
    saveData(data) {
        try {
            localStorage.setItem(`${constants_1.POPUP_STORAGE_KEY}-${this._blockId}`, JSON.stringify(data));
        }
        catch (e) { }
    }
    loadData() {
        try {
            return this.parseData(localStorage.getItem(`${constants_1.POPUP_STORAGE_KEY}-${this._blockId}`));
        }
        catch (e) {
            return null;
        }
    }
}
exports.PopupStorage = PopupStorage;


/***/ }),

/***/ 5520:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PopupTeaser = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const check_media_1 = __webpack_require__(5580);
const utils_2 = __webpack_require__(4142);
const TARGET_POPUP_ATTRIBUTE = 'data-target-popup-id';
const CAN_BE_CLOSED_ATTRIBUTE = 'data-can-be-closed-on';
const CLOSE_BTN_SELECTOR = '[data-popup-teaser-close]';
const ANIMATION_OPTIONS = {
    duration: 750,
    easing: 'ease-in-out',
    fill: 'forwards',
};
class PopupTeaser extends base_component_1.BaseComponent {
    targetPopup;
    canBeClosedOn;
    removePermanently;
    withGradient;
    mountComponent() {
        this.removePermanently = false;
        this.canBeClosedOn = this.getAttribute(CAN_BE_CLOSED_ATTRIBUTE);
        this.targetPopup = (0, utils_1.$el)(`[data-block-id="${this.getAttribute(TARGET_POPUP_ATTRIBUTE)}"]`, this.parentElement);
        this.addListener(this, 'click', this.handleTeaserClick);
        this.targetPopup.on('popupHidden', this.showTeaser);
        this.targetPopup.on('popupShown', this.hideTeaser);
        this.setCloseBtnGradient();
        if (this.isEditor) {
            this.editor.on('BLOCK_SELECT', this.handleBlockSelect);
            this.editor.on('BLOCK_DESELECT', this.handleBlockDeselect);
        }
    }
    unmountComponent() {
        this.removeListener(this, 'click', this.handleTeaserClick);
        this.targetPopup.off('popupHidden', this.showTeaser);
        this.targetPopup.off('popupShown', this.hideTeaser);
        if (this.isEditor) {
            this.editor.off('BLOCK_SELECT', this.handleBlockSelect);
            this.editor.off('BLOCK_DESELECT', this.handleBlockDeselect);
        }
    }
    showTeaser = async () => {
        await this.animate({ [this.getTeaserPosition()]: '0' }, ANIMATION_OPTIONS)
            .finished;
    };
    hideTeaser = async () => {
        await this.animate({ [this.getTeaserPosition()]: '-50%' }, ANIMATION_OPTIONS).finished;
        if (this.removePermanently) {
            this.remove();
        }
    };
    getTeaserPosition = () => {
        const { left, right } = getComputedStyle(this);
        const isLeft = parseInt(left) < 1;
        const isRight = parseInt(right) < 1;
        return isLeft ? 'left' : isRight ? 'right' : 'bottom';
    };
    handleTeaserClick = ({ target }) => {
        if (target.closest(CLOSE_BTN_SELECTOR)) {
            this.removePermanently = true;
            this.hideTeaser();
        }
        else {
            this.showPopup();
        }
    };
    showPopup = () => {
        this.targetPopup.show();
        const isNowMobile = (0, check_media_1.isMobile)();
        this.removePermanently =
            (isNowMobile && !this.canBeClosedOn?.includes('mobile')) ||
                (!isNowMobile && !this.canBeClosedOn?.includes('desktop'));
        this.hideTeaser();
    };
    setCloseBtnGradient = () => {
        if (this.hasAttribute('data-gradient') && !this.withGradient) {
            const btn = (0, utils_1.$el)(CLOSE_BTN_SELECTOR, this);
            btn?.setAttribute('style', `--gsc-teaser-close-background-color: ${(0, utils_2.gradientOpacity)(this.dataset.gradient, this.dataset.opacity)}`);
            this.withGradient = true;
        }
    };
    handleBlockSelect = ({ detail: { blockId } }) => {
        if (this.dataset.targetPopupId === blockId) {
            this.style.zIndex = '10001';
            this.showTeaser();
        }
    };
    handleBlockDeselect = ({ detail: { blockId } }) => {
        if (this.dataset.targetPopupId === blockId) {
            this.hideTeaser();
            this.removeAttribute('style');
        }
    };
}
exports.PopupTeaser = PopupTeaser;


/***/ }),

/***/ 8231:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PopupType = void 0;
var PopupType;
(function (PopupType) {
    PopupType["AgeVerifier"] = "age";
    PopupType["Promo"] = "promo";
    PopupType["Signup"] = "signup";
})(PopupType || (exports.PopupType = PopupType = {}));


/***/ }),

/***/ 4142:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.gradientOpacity = exports.wildcardToRegExp = exports.POPUP_ANIMATION_DELAY = void 0;
exports.POPUP_ANIMATION_DELAY = 750;
const wildcardToRegExp = (wildcardPattern, flags) => {
    const regexMatch = /^\/(.+)\/([im]+)?$/.exec(wildcardPattern);
    if (regexMatch) {
        return new RegExp(regexMatch[1], regexMatch[2] || flags);
    }
    const pattern = wildcardPattern
        .replace(/[\-\[\]\/{}()?.\\^$|]/g, '\\$&')
        .replace(/\*/g, '.*?')
        .replace(/\+/g, '.+?');
    return new RegExp(`^${pattern}$`, flags);
};
exports.wildcardToRegExp = wildcardToRegExp;
const gradientOpacity = (gradient, opacity) => {
    try {
        const colors = gradient.match(/rgba\([^()]*\)|#\w+/g);
        colors?.forEach(color => {
            const [r, g, b, a] = color
                .split('(')[1]
                .split(')')[0]
                .split(',')
                .map(c => c.trim());
            const alpha = +a * +opacity;
            gradient = gradient.replace(color, `rgba(${r}, ${g}, ${b}, ${Math.round(alpha * 100) / 100})`);
        });
        return gradient;
    }
    catch (e) {
        return gradient;
    }
};
exports.gradientOpacity = gradientOpacity;


/***/ }),

/***/ 6368:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductRecommendations = void 0;
var product_recommendations_1 = __webpack_require__(7329);
Object.defineProperty(exports, "ProductRecommendations", ({ enumerable: true, get: function () { return product_recommendations_1.ProductRecommendations; } }));


/***/ }),

/***/ 7329:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductRecommendations = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
class ProductRecommendations extends base_component_1.BaseComponent {
    mountComponent() {
        this.update();
    }
    update = () => {
        const url = this.dataset.url;
        if (!url) {
            return;
        }
        fetch(url)
            .then(response => response.text())
            .then(text => {
            this.updateByHTML((0, dom_1.parseHTML)(text));
        })
            .catch(() => {
            console.log('Error in product recommendations component');
        });
    };
    updateByHTML(html) {
        const recommendations = (0, utils_1.$el)(`product-recommendations[id="${this.id}"]`, html);
        (0, dom_1.replaceNodeChildren)(this, recommendations);
    }
}
exports.ProductRecommendations = ProductRecommendations;


/***/ }),

/***/ 9193:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductBlock = exports.ProductMediaCarousel = exports.ProductMedia = exports.ProductInformationDrawer = exports.ProductFormButton = exports.ProductForm = exports.ProductDetails = exports.ProductContent = exports.ColorSwatchesPicker = exports.ProductBreadcrumbs = exports.ZoomCursor = exports.ProductRelatedBlock = exports.RecipientForm = exports.QuickView = exports.VariantPicker = exports.PickupAvailability = exports.ProductModalButton = exports.ProductModal = void 0;
var product_modal_1 = __webpack_require__(7327);
Object.defineProperty(exports, "ProductModal", ({ enumerable: true, get: function () { return product_modal_1.ProductModal; } }));
var product_modal_button_1 = __webpack_require__(9783);
Object.defineProperty(exports, "ProductModalButton", ({ enumerable: true, get: function () { return product_modal_button_1.ProductModalButton; } }));
var product_pickup_availability_1 = __webpack_require__(250);
Object.defineProperty(exports, "PickupAvailability", ({ enumerable: true, get: function () { return product_pickup_availability_1.PickupAvailability; } }));
var product_variant_picker_1 = __webpack_require__(453);
Object.defineProperty(exports, "VariantPicker", ({ enumerable: true, get: function () { return product_variant_picker_1.VariantPicker; } }));
var quick_view_1 = __webpack_require__(4218);
Object.defineProperty(exports, "QuickView", ({ enumerable: true, get: function () { return quick_view_1.QuickView; } }));
var recipient_form_1 = __webpack_require__(1893);
Object.defineProperty(exports, "RecipientForm", ({ enumerable: true, get: function () { return recipient_form_1.RecipientForm; } }));
var related_products_block_1 = __webpack_require__(9129);
Object.defineProperty(exports, "ProductRelatedBlock", ({ enumerable: true, get: function () { return related_products_block_1.ProductRelatedBlock; } }));
var zoom_cursor_1 = __webpack_require__(9220);
Object.defineProperty(exports, "ZoomCursor", ({ enumerable: true, get: function () { return zoom_cursor_1.ZoomCursor; } }));
var product_breadcrumbs_1 = __webpack_require__(9180);
Object.defineProperty(exports, "ProductBreadcrumbs", ({ enumerable: true, get: function () { return product_breadcrumbs_1.ProductBreadcrumbs; } }));
var product_color_swatches_1 = __webpack_require__(6628);
Object.defineProperty(exports, "ColorSwatchesPicker", ({ enumerable: true, get: function () { return product_color_swatches_1.ColorSwatchesPicker; } }));
var product_content_1 = __webpack_require__(5044);
Object.defineProperty(exports, "ProductContent", ({ enumerable: true, get: function () { return product_content_1.ProductContent; } }));
var product_details_1 = __webpack_require__(5104);
Object.defineProperty(exports, "ProductDetails", ({ enumerable: true, get: function () { return product_details_1.ProductDetails; } }));
var product_form_1 = __webpack_require__(7048);
Object.defineProperty(exports, "ProductForm", ({ enumerable: true, get: function () { return product_form_1.ProductForm; } }));
var product_form_button_1 = __webpack_require__(4742);
Object.defineProperty(exports, "ProductFormButton", ({ enumerable: true, get: function () { return product_form_button_1.ProductFormButton; } }));
var product_information_drawer_1 = __webpack_require__(8272);
Object.defineProperty(exports, "ProductInformationDrawer", ({ enumerable: true, get: function () { return product_information_drawer_1.ProductInformationDrawer; } }));
var product_media_1 = __webpack_require__(3313);
Object.defineProperty(exports, "ProductMedia", ({ enumerable: true, get: function () { return product_media_1.ProductMedia; } }));
var product_media_carousel_1 = __webpack_require__(2822);
Object.defineProperty(exports, "ProductMediaCarousel", ({ enumerable: true, get: function () { return product_media_carousel_1.ProductMediaCarousel; } }));
var product_block_1 = __webpack_require__(2569);
Object.defineProperty(exports, "ProductBlock", ({ enumerable: true, get: function () { return product_block_1.ProductBlock; } }));


/***/ }),

/***/ 2569:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductBlock = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
const CONTAINER_SELECTOR = `[data-product-block-container]`;
class ProductBlock extends base_component_1.BaseComponent {
    updateByVariantId(variantId) {
        const node = (0, utils_1.$el)(CONTAINER_SELECTOR, this);
        const newNode = (0, dom_1.getTemplateContent)((0, utils_1.$el)(`[data-product-block-template="${variantId}"]`, this));
        (0, dom_1.replaceNodeChildren)(node, newNode);
    }
}
exports.ProductBlock = ProductBlock;


/***/ }),

/***/ 9180:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductBreadcrumbs = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const COLLECTION_LINK_SELECTOR = '[data-collection-link]';
class ProductBreadcrumbs extends base_component_1.BaseComponent {
    setCollectionPage = (collectionPage) => {
        if (collectionPage) {
            const link = (0, utils_1.$el)(COLLECTION_LINK_SELECTOR, this);
            if (link) {
                const data = JSON.parse(collectionPage);
                link.href = data.url;
                link.ariaLabel = data.title;
                link.textContent = data.title;
            }
        }
    };
}
exports.ProductBreadcrumbs = ProductBreadcrumbs;


/***/ }),

/***/ 6628:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ColorSwatchesPicker = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const ACTIVE_VALUE_SELECTOR = '[data-color-swatches-picker-active-value]';
const LABEL_SELECTOR = '[data-color-swatches-picker-label]';
class ColorSwatchesPicker extends base_component_1.BaseComponent {
    mountComponent() {
        const labels = (0, utils_1.$list)(LABEL_SELECTOR, this);
        const form = (0, utils_1.$elParent)('variant-picker', this)?.getForm();
        if (form) {
            this.addListener(form, 'change', this.handleFormChange);
        }
        labels.forEach(label => {
            this.addListener(label, 'mouseenter', this.handleMouseEnter);
            this.addListener(label, 'mouseleave', this.handleMouseLeave);
        });
    }
    handleFormChange = () => {
        this.setSelected();
    };
    handleMouseEnter = (event) => {
        event.preventDefault();
        const target = event.target;
        this.setHovered(target.dataset.value);
    };
    handleMouseLeave = (event) => {
        event.preventDefault();
        this.setSelected();
    };
    setSelected() {
        const swatch = (0, utils_1.$el)(`${LABEL_SELECTOR}.selected`, this);
        this.setHovered(swatch?.getAttribute('data-value') || '');
    }
    setHovered(value) {
        const label = (0, utils_1.$el)(ACTIVE_VALUE_SELECTOR, this);
        if (label) {
            label.textContent = value;
        }
    }
}
exports.ColorSwatchesPicker = ColorSwatchesPicker;


/***/ }),

/***/ 5044:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductContent = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const check_media_1 = __webpack_require__(5580);
class ProductContent extends base_component_1.BaseComponent {
    variantPickerSelector;
    containerAttribute;
    visibleClass;
    mobileClass;
    variantPicker;
    variant;
    desktopContent;
    mobileContent;
    desktopContainers;
    mobileContainers;
    carousels;
    dots;
    modal;
    initialImagesQuantity;
    currentImagesQuantity;
    modalQuantityElement;
    isMobile;
    carouselImages;
    dotsImages;
    gridImages;
    modalImages;
    desktopImages;
    mobileImages;
    currentContainers;
    currentImages;
    currentDots;
    resizeObserver;
    constructor() {
        super();
        this.variantPickerSelector = 'variant-picker';
        this.containerAttribute = 'data-container';
        this.visibleClass = 'product__image-visible';
        this.variantPicker = this.querySelector(this.variantPickerSelector);
        this.desktopContent = this.querySelector('[data-product-desktop-media]');
        this.mobileContent = this.querySelector('[data-product-mobile-media]');
        this.desktopContainers = [
            ...this.desktopContent.querySelectorAll(`[${this.containerAttribute}]`),
        ];
        this.mobileContainers = [
            ...this.mobileContent.querySelectorAll(`[${this.containerAttribute}]`),
        ];
        this.dots = [...this.querySelectorAll('carousel-dots')];
        this.carousels = [
            ...this.querySelectorAll('carousel-component, carousel-dots'),
        ];
        this.modal =
            this.querySelector('product-modal') ??
                this.parentElement.querySelector('product-modal');
        this.isMobile = (0, check_media_1.isMobile)();
        this.initialImagesQuantity = null;
        this.currentImagesQuantity = null;
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(this);
    }
    connectedCallback() {
        this.init();
    }
    disconnectedCallback() {
        this.variantPicker.off('change', this.handleVariantChange);
    }
    init = () => {
        Promise.all([(0, utils_1.whenDefined)('product-modal'), (0, utils_1.whenDefined)('variant-picker')])
            .then(() => {
            if (this.modal?.element) {
                const container = (0, utils_1.$el)(`[${this.containerAttribute}]`, this.modal.element);
                this.mobileContainers.push(container);
                this.desktopContainers.push(container);
                this.modalQuantityElement = this.modal.element.querySelector(`[data-product-modal-slides-total]`);
            }
            this.desktopImages = this.assignImages(this.desktopContainers);
            this.mobileImages = this.assignImages(this.mobileContainers);
            this.setCurrentContainers();
            this.setInitialImagesLength();
            this.handleVariantChange({
                variant: this.variantPicker.variant,
            });
            this.variantPicker.on('change', this.handleVariantChange);
        })
            .catch(error => {
            console.log(error);
        });
    };
    handleVariantChange = ({ variant }) => {
        this.currentContainers.forEach(container => {
            switch (container.dataset.container) {
                case 'carousel':
                    this.replaceCarouselSlides(container);
                    break;
                case 'dots':
                    this.replaceDotsSlides(container);
                    break;
                case 'grid':
                    this.replaceGridSlides(container);
                    break;
                case 'modal':
                    this.replaceModalSlides(container);
                    break;
                default:
                    break;
            }
        });
        this.reInitCarousels();
        this.scrollToVariant(variant);
        if (this.modal) {
            this.modal.updateModal();
        }
        this.variant = variant;
    };
    replaceCarouselSlides = (container) => {
        const carouselImages = this.getImages(this.currentImages['carouselImages']);
        carouselImages[0].classList.add('is-selected');
        carouselImages[0].classList.toggle('product-media-carousel-mobile__slide--alone', carouselImages.length < 2);
        this.pasteImages(container, carouselImages);
    };
    replaceDotsSlides = (container) => {
        const dotsImages = this.getImages(this.currentImages['dotsImages']);
        dotsImages.forEach((img, i) => {
            img.setAttribute('data-dot-index', String(i));
        });
        this.pasteImages(container, dotsImages);
    };
    replaceGridSlides = (container) => {
        const gridImages = this.getImages(this.currentImages['gridImages']);
        this.pasteImages(container, gridImages);
    };
    replaceModalSlides = (container) => {
        if (this.modal) {
            const modalImages = this.getImages(this.currentImages['modalImages']);
            this.pasteImages(container, modalImages);
            this.modalQuantityElement.textContent = String(modalImages.length);
        }
    };
    getImages = (initialImages) => {
        const images = initialImages.map(el => el.cloneNode(true));
        const options = this.dataset.options.split(',');
        const filtered = images.filter(img => {
            const imgVariant = img.dataset.variant;
            if (!imgVariant.includes('#') || !imgVariant.includes('_')) {
                return false;
            }
            const altPattern = imgVariant.split('#').find(n => n.includes('_'));
            if (!altPattern) {
                return false;
            }
            const splittedPattern = altPattern.split('_');
            const patternOption = splittedPattern[0];
            const patternValues = splittedPattern[1].split(',');
            return options.some((optionName, index) => {
                if (patternOption.toLowerCase() === optionName.toLowerCase()) {
                    return patternValues.some(patternValue => patternValue.toLowerCase().trim() ===
                        this.variantPicker.variant.options[index].toLowerCase());
                }
                else {
                    return false;
                }
            });
        });
        return filtered.length > 0 ? filtered : images;
    };
    pasteImages = (container, images) => {
        container.replaceChildren(...images);
        this.currentImagesQuantity = images.length;
    };
    reInitCarousels = () => {
        if (this.carousels.length > 0) {
            this.carousels.forEach(carousel => {
                carousel.reInit();
            });
        }
    };
    assignImages = (containers) => {
        const carouselImages = [];
        const dotsImages = [];
        const gridImages = [];
        const modalImages = [];
        containers.forEach(container => {
            const clone = container.cloneNode(true);
            const children = [...clone.children];
            switch (container.dataset.container) {
                case 'carousel':
                    carouselImages.push(...children);
                    carouselImages.forEach((img, i) => {
                        img.classList.remove('is-selected');
                    });
                    break;
                case 'dots':
                    dotsImages.push(...children);
                    dotsImages.forEach((img, i) => {
                        img.classList.remove('is-primary');
                        img.classList.remove('is-selected');
                        img.classList.remove('is-in-view');
                        img.classList.remove('is-snapped');
                        img.classList.remove('is-prev-prev');
                    });
                    break;
                case 'grid':
                    gridImages.push(...children);
                    break;
                case 'modal':
                    modalImages.push(...children);
                    break;
                default:
                    break;
            }
        });
        return { carouselImages, dotsImages, gridImages, modalImages };
    };
    scrollToVariant = (variant) => {
        if (this.currentImagesQuantity === this.initialImagesQuantity &&
            variant.featured_media) {
            this.variantPicker.setFirstMediaByVariant(variant);
        }
        else {
            this.carousels.forEach(carousel => {
                carousel.embla.scrollTo(0);
            });
            this.variantPicker.setFirstMediaByVariant(0);
        }
        if (this.currentDots) {
            const dots = [...this.currentDots.embla.slideNodes()];
            const selectedDotIndex = this.currentDots.carousel.embla.selectedScrollSnap();
            dots.forEach(dot => {
                const isSelectedDot = +dot.dataset.dotIndex === selectedDotIndex;
                dot.classList.toggle('is-primary', isSelectedDot);
            });
        }
    };
    setCurrentContainers = () => {
        this.currentContainers = this.isMobile
            ? this.mobileContainers
            : this.desktopContainers;
        this.currentImages = this.isMobile ? this.mobileImages : this.desktopImages;
        this.currentDots = this.dots.find(el => el.offsetWidth > 0);
    };
    setInitialImagesLength = () => {
        const isCarouselImages = !!this.currentImages.carouselImages?.length;
        this.initialImagesQuantity = isCarouselImages
            ? this.currentImages.carouselImages?.length
            : this.currentImages.gridImages?.length;
    };
    handleResize = () => {
        if (this.isMobile !== (0, check_media_1.isMobile)()) {
            this.isMobile = (0, check_media_1.isMobile)();
            this.setCurrentContainers();
        }
    };
}
exports.ProductContent = ProductContent;


/***/ }),

/***/ 5104:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductDetails = void 0;
const base_component_1 = __webpack_require__(3608);
const check_media_1 = __webpack_require__(5580);
const utils_1 = __webpack_require__(4083);
const TABS_COMPONENT_SELECTOR = 'tabs-component';
const CAROUSEL_SELECTOR = 'carousel-component';
class ProductDetails extends base_component_1.BaseComponent {
    isMobile = (0, check_media_1.isMobile)();
    resizeObserver;
    activeTab;
    activeTabIndex;
    nextTargetTab;
    lastInnerTarget;
    mountComponent() {
        const tabs = (0, utils_1.$el)(TABS_COMPONENT_SELECTOR, this);
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(this);
        (0, utils_1.whenDefined)(TABS_COMPONENT_SELECTOR).then(() => {
            tabs?.on('selectTab', this.handleTabSelect);
        });
    }
    unmountComponent() {
        const tabs = (0, utils_1.$el)(TABS_COMPONENT_SELECTOR, this);
        (0, utils_1.whenDefined)(TABS_COMPONENT_SELECTOR).then(() => {
            tabs?.off('selectTab', this.handleTabSelect);
        });
        this.resizeObserver.disconnect();
    }
    handleTabSelect = ({ tabId, tab }) => {
        this.activeTab = tab;
        this.activeTabIndex = +tabId - 1;
        this.scrollToActiveTab();
        const targets = this.getInnerTargets();
        if (targets.length > 0) {
            this.setTabContentTargets(targets);
        }
    };
    handleResize = () => {
        if ((0, check_media_1.isMobile)() !== this.isMobile) {
            this.isMobile = (0, check_media_1.isMobile)();
        }
        if ((0, check_media_1.isMobile)()) {
            this.scrollToActiveTab();
        }
    };
    scrollToActiveTab = () => {
        const carousel = (0, utils_1.$el)(CAROUSEL_SELECTOR, this);
        carousel?.embla.scrollTo(this.activeTabIndex);
    };
    getInnerTargets = () => {
        const targets = (0, utils_1.$list)((0, utils_1.getFocusTargets)(), this.activeTab);
        return targets;
    };
    setTabContentTargets = targets => {
        const tabComponents = (0, utils_1.$el)(TABS_COMPONENT_SELECTOR, this);
        const tabs = tabComponents.getNames().filter(tab => tab.offsetWidth > 0);
        this.nextTargetTab = tabs[this.activeTabIndex + 1] ?? null;
        this.lastInnerTarget = targets[targets.length - 1];
        this.addListener(this.lastInnerTarget, 'blur', this.handleLastTargetBlur);
        targets[0].focus();
    };
    handleLastTargetBlur = () => {
        this.nextTargetTab.focus();
        this.removeListener(this.lastInnerTarget, 'blur', this.handleLastTargetBlur);
        this.lastInnerTarget = null;
        this.nextTargetTab = null;
    };
}
exports.ProductDetails = ProductDetails;


/***/ }),

/***/ 4742:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductFormButton = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const FOOTER_SELECTOR = '.shopify-section.shopify-section-footer';
const FORM_SELECTOR = 'product-form';
class ProductFormButton extends base_component_1.BaseComponent {
    mountComponent() {
        this.addListener(window, 'scroll', this.handleWindowScroll);
    }
    handleWindowScroll = () => {
        const form = (0, utils_1.$elParent)(FORM_SELECTOR, this);
        if (!form) {
            return;
        }
        const footer = (0, utils_1.$el)(FOOTER_SELECTOR);
        const point = form.offsetTop + form.offsetHeight;
        const footerOffsetTop = footer ? footer.offsetTop : 0;
        const isOverFooter = window.innerHeight + window.scrollY < footerOffsetTop;
        const isVisible = isOverFooter && window.scrollY > point;
        this.classList.toggle('is-visible', isVisible);
        document.body.toggleAttribute('is-product-form-button-fixed', isVisible);
    };
}
exports.ProductFormButton = ProductFormButton;


/***/ }),

/***/ 7048:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductForm = void 0;
const base_component_1 = __webpack_require__(3608);
const cart_api_1 = __webpack_require__(735);
const fetch_config_1 = __webpack_require__(8548);
const utils_1 = __webpack_require__(4083);
const dom_1 = __webpack_require__(3889);
const CART_DRAWER_SELECTOR = `#CartDrawer`;
const CART_PAGE_SELECTOR = 'cart-page';
const CART_NOTIFICATION_POPUP_SELECTOR = '#CartNotificationPopup';
const FORM_SELECTOR = 'form';
const VARIANT_INPUT_SELECTOR = `[data-product-form-variant]`;
const QUICK_VIEW = '#Quick-view';
const BODY_ELEMENT_SELECTOR = 'body-element';
class ProductForm extends base_component_1.BaseComponent {
    cartApi = new cart_api_1.CartAPI();
    lastParsedState;
    mountComponent() {
        const form = (0, utils_1.$el)(FORM_SELECTOR, this);
        this.addListener(form, 'submit', this.handleFormSubmit);
    }
    handleFormSubmit = async (event) => {
        event.preventDefault();
        const config = this.getQueryConfig();
        // this.setDisable(true);
        // this.setLoading(true);
        // await this.cartApi
        //     .add(config)
        //     .then(state => {
        //     this.setDisable(false);
        //     this.setLoading(false);
        //     const parsedState = JSON.parse(state);
        //     if (parsedState.description) {
        //         this.showError(parsedState);
        //         return;
        //     }
        //     this.lastParsedState = parsedState;
        //     this.updateCartItems((0, dom_1.parseHTML)(JSON.parse(state).sections[this.cartId]));
        // })
        //     .catch(() => console.log('Error in product form component'));
    };
    updateCartItems(html) {
        const cartDrawer = (0, utils_1.$el)(CART_DRAWER_SELECTOR);
        const cart = (0, utils_1.$el)(CART_PAGE_SELECTOR);
        const popup = (0, utils_1.$el)(CART_NOTIFICATION_POPUP_SELECTOR);
        if (cart) {
            this.updateCart(html);
        }
        else if (cartDrawer) {
            this.updateCartDrawer(html);
        }
        else if (popup) {
            this.updatePopup(html);
        }
        else {
            this.updateCartCount(html);
        }
    }
    updateCartCount(html) {
        const newCount = (0, utils_1.$el)('#NewCartCount', html);
        const currentCounts = (0, utils_1.$list)('#CartCount');
        this.onUpdateCartItems(() => {
            currentCounts.forEach(currentCount => {
                (0, dom_1.replaceNodeChildren)(currentCount, newCount);
            });
        });
    }
    updateCart(html) {
        const cart = (0, utils_1.$el)(CART_PAGE_SELECTOR);
        cart?.updateEmptyStatus(false);
        this.onUpdateCartItems(() => {
            cart?.purchaseHandler(html, this.lastParsedState);
        });
    }
    updateCartDrawer(html) {
        const cartDrawer = (0, utils_1.$el)(CART_DRAWER_SELECTOR);
        cartDrawer?.updateAsideProductsByParsedState(this.lastParsedState);
        cartDrawer?.updateEmptyStatus();
        this.onUpdateCartItems(() => {
            cartDrawer?.purchaseHandler(html, this.lastParsedState);
        });
    }
    updatePopup(html) {
        this.onUpdateCartItems(() => {
            const popup = (0, utils_1.$el)(CART_NOTIFICATION_POPUP_SELECTOR);
            popup?.purchaseHandler(html, this.lastParsedState);
        });
    }
    async onUpdateCartItems(callback) {
        const quickView = (0, utils_1.$el)(QUICK_VIEW);
        if (quickView.isOpen) {
            quickView.hide().then(callback);
        }
        else {
            callback();
        }
    }
    showError(parsedState) {
        const bodyElement = (0, utils_1.$el)(BODY_ELEMENT_SELECTOR);
        const error = typeof parsedState.description === 'object'
            ? this.getErrorFromObject(parsedState.description)
            : parsedState.description;
        bodyElement.showNotification(error, 'warning');
    }
    getErrorFromObject(errorObject) {
        return Object.keys(errorObject)
            .map(key => {
            return `${key}: ${errorObject[key]}`;
        })
            .join(' , ');
    }
    getQueryConfig() {
        const form = (0, utils_1.$el)(FORM_SELECTOR, this);
        const config = (0, fetch_config_1.fetchConfig)('javascript');
        const formData = new FormData(form);
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];
        formData.append('sections', [this.cartId]);
        formData.append('sections_url', window.location.pathname);
        config.body = formData;
        return config;
    }
    setLoading(isLoading) {
        (0, utils_1.$list)('button[type="submit"]', this).forEach(button => button.classList.toggle('loading', isLoading));
    }
    setDisable(isDisable) {
        (0, utils_1.$list)('button[type="submit"]', this).forEach(button => button.toggleAttribute('disabled', isDisable));
    }
    setButtonText(text) {
        (0, utils_1.$list)('button[type="submit"]', this).forEach(button => (button.textContent = text));
    }
    getVeriantInput() {
        const form = (0, utils_1.$el)(FORM_SELECTOR, this);
        const variantInput = (0, utils_1.$el)(VARIANT_INPUT_SELECTOR, form);
        return variantInput;
    }
    get cartId() {
        const cartDrawer = (0, utils_1.$el)(CART_DRAWER_SELECTOR);
        const cart = (0, utils_1.$el)(CART_PAGE_SELECTOR);
        if (cartDrawer) {
            return cartDrawer.dataset.sectionId;
        }
        else if (cart) {
            return cart.dataset.sectionId;
        }
        else {
            return 'cart-notification-popup-content';
        }
    }
}
exports.ProductForm = ProductForm;


/***/ }),

/***/ 5089:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductInfo = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const debounce_1 = __webpack_require__(2731);
const check_media_1 = __webpack_require__(5580);
const SCROLLTRACK_ATTRIBUTE = 'data-with-scrolltrack';
const HEADER_SELECTOR = 'header-component';
const SMALL_CLASS = 'product__info-wrapper--small';
const WIDE_CLASS = 'product__info-wrapper--wide';
const WIDE_PLUS_CLASS = 'product__info-wrapper--wide-plus';
class ProductInfo extends base_component_1.BaseComponent {
    headerHeight;
    defaultTopSpace;
    infoHeight;
    isToSetMoreHeight;
    resizeObserver;
    mountComponent() {
        const isWithScrollTrack = this.hasAttribute(SCROLLTRACK_ATTRIBUTE);
        if (isWithScrollTrack) {
            customElements.whenDefined('header-component').then(() => {
                this.setDimentions();
                this.addListener(window, 'scroll', this.handleScroll);
            });
            if (this.isEditor) {
                this.editor.on('SECTION_LOAD', this.handleSectionLoad);
            }
        }
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(this);
    }
    setDimentions = () => {
        this.defaultTopSpace = 16;
        this.infoHeight = this.getBoundingClientRect().height;
        const header = (0, utils_1.$el)(HEADER_SELECTOR);
        const headerSection = header.section;
        this.headerHeight = headerSection.offsetHeight;
        this.isToSetMoreHeight = header.getAttribute('is-sticky') === 'static';
    };
    handleScroll = () => {
        const topSpace = this.isToSetMoreHeight
            ? this.defaultTopSpace + this.headerHeight
            : this.defaultTopSpace;
        const viewportHeight = window.innerHeight - topSpace;
        if (window.scrollY > 0 && this.infoHeight > viewportHeight) {
            this.style.top = `${viewportHeight - this.infoHeight}px`;
        }
        else {
            this.style.top = `${topSpace}px`;
        }
    };
    handleSectionLoad = () => {
        this.setDimentions();
    };
    handleResize = (0, debounce_1.debounce)(() => {
        if (!(0, check_media_1.isMobile)()) {
            this.toggleWidthClasses();
        }
    }, 50);
    toggleWidthClasses = () => {
        const infoWidth = this.getBoundingClientRect().width;
        this.classList.toggle(SMALL_CLASS, infoWidth < 380);
        this.classList.toggle(WIDE_CLASS, infoWidth > 480);
        this.classList.toggle(WIDE_PLUS_CLASS, infoWidth > 740);
    };
}
exports.ProductInfo = ProductInfo;


/***/ }),

/***/ 8272:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductInformationDrawer = void 0;
const sidebar_1 = __webpack_require__(4622);
const utils_1 = __webpack_require__(4083);
const VIEWPORT_SELECTOR = '[data-product-information-drawer-viewport]';
class ProductInformationDrawer extends sidebar_1.SidebarComponent {
    mountComponent() {
        super.mountComponent();
        const viewport = (0, utils_1.$el)(VIEWPORT_SELECTOR, this.element);
        this.addListener(viewport, 'scroll', this.handleViewportScroll);
    }
    unmountComponent() {
        super.unmountComponent();
        const viewport = (0, utils_1.$el)(VIEWPORT_SELECTOR, this.element);
        this.removeListener(viewport, 'scroll', this.handleViewportScroll);
    }
    handleViewportScroll = () => {
        const viewport = (0, utils_1.$el)(VIEWPORT_SELECTOR, this.element);
        if (!viewport) {
            return;
        }
        this.toggleAttribute('header-shadow-visible', viewport.scrollTop > 0);
    };
}
exports.ProductInformationDrawer = ProductInformationDrawer;


/***/ }),

/***/ 2822:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductMediaCarousel = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const CAROUSEL_SELECTOR = `[data-product-media-carousel-component]`;
class ProductMediaCarousel extends base_component_1.BaseComponent {
    mountComponent() {
        this.setReady();
    }
    updateFirstMediaByVariant(variant, jump = false) {
        const carousel = (0, utils_1.$el)(CAROUSEL_SELECTOR, this);
        if (variant && variant.featured_media && carousel) {
            const slides = carousel.embla.slideNodes();
            const slideIndex = slides.findIndex(slide => {
                if (!slide.dataset.mediaId) {
                    return false;
                }
                return +slide.dataset.mediaId === +variant.featured_media.id;
            });
            carousel.embla.scrollTo(slideIndex, jump);
        }
    }
    setReady() {
        this.setAttribute('ready', '');
    }
}
exports.ProductMediaCarousel = ProductMediaCarousel;


/***/ }),

/***/ 3313:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductMedia = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const scrollOptions = (jump) => ({
    behavior: jump ? 'auto' : 'smooth',
    block: 'nearest',
});
class ProductMedia extends base_component_1.BaseComponent {
    mountComponent() {
        this.setReady();
    }
    updateFirstMediaByVariant(variant, jump = false) {
        if ((0, utils_1.isNotThemeStore)()) {
            if (variant && variant.featured_media) {
                const media = (0, utils_1.$el)(`[data-media-id="${variant.featured_media.id}"]`, this);
                const element = media ?? this;
                element.scrollIntoView(scrollOptions(jump));
            }
        }
    }
    setReady() {
        this.setAttribute('ready', '');
    }
}
exports.ProductMedia = ProductMedia;


/***/ }),

/***/ 9783:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductModalButton = void 0;
const utils_1 = __webpack_require__(4083);
const modal_button_1 = __webpack_require__(467);
class ProductModalButton extends modal_button_1.ModalButton {
    trigger() {
        super.trigger();
        const modal = (0, utils_1.$el)(this.dataset.modal);
        modal?.openAndShowMediaById(this.dataset.mediaId);
    }
}
exports.ProductModalButton = ProductModalButton;


/***/ }),

/***/ 5066:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductModalImageWrap = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
class ProductModalImageWrap extends base_component_1.BaseComponent {
    image;
    modal;
    carousel;
    preloader;
    currentSettedScale;
    isDragging;
    offsetX;
    offsetY;
    startDragPoint;
    maxScale;
    minScale;
    isTapped;
    tapTimeout;
    lastGesture;
    zoomTimeoutId;
    isTappedTimeout;
    isDoubleTapped;
    firstMove;
    fingers;
    startMoveTouches;
    lastDistanceBetweenTouches;
    dragStartPointY;
    dragStartPointX;
    isPinchScaling;
    index;
    constructor() {
        super();
        this.image = (0, utils_1.$el)('img', this);
        this.modal = (0, utils_1.$elParent)('product-modal', this);
        this.preloader = (0, utils_1.$el)('[data-product-modal-image-preloader]', this);
        this.currentSettedScale = 1;
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.startDragPoint = { x: 0, y: 0 };
        this.maxScale = 3;
        this.minScale = 1;
        this.isTapped = false;
        this.tapTimeout = 300;
        this.lastGesture = null;
        this.setZoomCursorVisible(true);
    }
    mountComponent() {
        this.carousel = this.modal.carousel;
        this.addListener(this.image, 'mousedown', this.handleMouseDown);
        this.addListener(this.image, 'mouseup', this.handleMouseUp);
        this.addListener(this.image, 'mousemove', this.handleMouseMove);
        this.addListener(this.image, 'touchstart', this.handleTouchStart);
        this.addListener(this.image, 'touchend', this.handleTouchEnd);
        this.addListener(this.image, 'touchmove', this.handleTouchMove);
        this.addListener(this.image, 'load', this.handleImageLoad);
        (0, utils_1.whenDefined)('product-modal').then(() => {
            this.modal.on('hide', this.handleModalHide);
            this.index =
                this.modal.mediaIndexMap[this.closest('.carousel__slide').dataset.mediaId];
        });
        this.carousel?.embla.on('select', this.handleCarouselSelect);
    }
    unmountComponent() {
        this.modal?.off('hide', this.handleModalHide);
        this.carousel?.embla.off('select', this.handleCarouselSelect);
        clearTimeout(this.zoomTimeoutId);
        clearTimeout(this.isTappedTimeout);
    }
    handleImageLoad = () => {
        this.setPreloaderVisible(false);
    };
    handleModalHide = () => {
        this.reset();
    };
    handleCarouselSelect = () => {
        this.reset();
    };
    handleTouchStart = event => {
        event.preventDefault();
        if (this.carousel.embla.selectedScrollSnap() !== this.index) {
            return;
        }
        this.fingers = event.touches.length;
        this.firstMove = true;
        this.detectDoubleTap(event);
    };
    handleTouchMove = event => {
        event.preventDefault();
        if (!this.isDoubleTapped) {
            if (this.firstMove) {
                this.updateGesture(event);
                this.startMoveTouches = event.touches.length;
            }
            else if (this.lastGesture) {
                switch (this.lastGesture) {
                    case 'zoom':
                        if (this.startMoveTouches === 2 && event.touches.length === 2) {
                            this.pinch(event);
                        }
                        break;
                    case 'drag':
                        if (this.startMoveTouches === 1 && event.touches.length === 1) {
                            const { clientX, clientY } = event.targetTouches[0];
                            this.drag(clientX, clientY);
                        }
                        break;
                }
            }
            else {
                this.setGesture('none', event);
            }
            this.firstMove = false;
        }
    };
    handleTouchEnd = event => {
        event.preventDefault();
        this.fingers = event.touches.length;
        this.updateGesture(event);
    };
    handleMouseDown = event => {
        event.preventDefault();
        this.startDrag(event.clientX, event.clientY);
        this.setDragging(true);
    };
    handleMouseUp = event => {
        this.setDragging(false);
        const time = this.modal.isZoomed ? 75 : 0;
        this.zoomTimeoutId = setTimeout(() => {
            this.touchZoom(event.clientX, event.clientY);
        }, time);
    };
    handleMouseMove = event => {
        event.preventDefault();
        clearTimeout(this.zoomTimeoutId);
        if (this.isDragging && this.modal.isZoomed) {
            const { clientX, clientY } = event;
            this.drag(clientX, clientY);
        }
    };
    detectDoubleTap(event) {
        if (this.isTappedTimeout && this.fingers === 1) {
            clearTimeout(this.isTappedTimeout);
            this.isTappedTimeout = null;
            this.isDoubleTapped = true;
            this.touchZoom(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
            switch (this.lastGesture) {
                case 'zoom':
                    this.setPinchScaling(false);
                    break;
                case 'drag':
                    this.setDragging(false);
                    break;
            }
        }
        else {
            this.isTappedTimeout = setTimeout(() => {
                this.isTappedTimeout = null;
                this.isDoubleTapped = false;
            }, this.tapTimeout);
        }
    }
    updateGesture(event) {
        if (this.fingers === 2) {
            this.setGesture('zoom', event);
        }
        else if (this.fingers === 1) {
            this.setGesture('drag', event);
        }
        else {
            this.setGesture('none', event);
        }
    }
    setGesture(newGesture, event) {
        if (this.lastGesture !== newGesture) {
            if (this.lastGesture && !newGesture) {
                switch (this.lastGesture) {
                    case 'zoom':
                        this.setPinchScaling(false);
                        break;
                    case 'drag':
                        this.setDragging(false);
                        break;
                }
            }
            switch (newGesture) {
                case 'zoom':
                    this.setPinchScaling(true);
                    break;
                case 'drag':
                    this.startDrag(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
                    this.setDragging(true);
                    break;
                case 'none':
                    this.setDragging(false);
                    this.setPinchScaling(false);
                    break;
            }
        }
        this.lastGesture = newGesture;
    }
    pinch(event) {
        const distanceBetweenTouches = this.getDistanceBetweenTouches(event);
        const isZoomIn = distanceBetweenTouches > this.lastDistanceBetweenTouches;
        const factor = isZoomIn ? 0.125 : -0.125;
        const newScale = this.getNewScale(this.currentScale + factor);
        const midPoint = this.getTouchCenter(event);
        const xs = (midPoint.x - this.offsetX) / this.currentScale;
        const ys = (midPoint.y - this.offsetY) / this.currentScale;
        this.lastDistanceBetweenTouches = distanceBetweenTouches;
        if (!isZoomIn && newScale === 1) {
            this.reset();
            return;
        }
        this.setTransform({
            scale: newScale,
            offsetX: midPoint.x - xs * newScale,
            offsetY: midPoint.y - ys * newScale,
        });
    }
    getDistanceBetweenTouches(event) {
        return Math.hypot(event.touches[0].pageX - event.touches[1].pageX, event.touches[0].pageY - event.touches[1].pageY);
    }
    startDrag(clientX, clientY) {
        this.startDragPoint = {
            x: clientX - this.offsetX,
            y: clientY - this.offsetY,
        };
        this.dragStartPointX = clientX;
        this.dragStartPointY = clientY;
    }
    drag(clientX, clientY) {
        const isRightDrag = this.dragStartPointX > clientX;
        const isBottomDrag = this.dragStartPointY > clientY;
        const newScale = this.getNewScale(this.currentScale);
        let newOffsetX = clientX - this.startDragPoint.x;
        let newOffsetY = clientY - this.startDragPoint.y;
        const isIntersectBounds = this.getIntersectBounds({
            isRightDrag,
            isBottomDrag,
        });
        if (isIntersectBounds.right || isIntersectBounds.left) {
            newOffsetX = this.offsetX;
        }
        if (isIntersectBounds.bottom || isIntersectBounds.top) {
            newOffsetY = this.offsetY;
        }
        this.setTransform({
            scale: newScale,
            offsetX: newOffsetX,
            offsetY: newOffsetY,
        });
    }
    getIntersectBounds({ isRightDrag, isBottomDrag }) {
        const imageRect = this.image.getBoundingClientRect();
        const delta = 8;
        const deltaX = isRightDrag ? -1 * delta : delta;
        const deltaY = isBottomDrag ? -1 * delta : delta;
        const right = isRightDrag && imageRect.right + deltaX < window.innerWidth;
        const left = !isRightDrag && imageRect.left + deltaX > 0;
        const bottom = isBottomDrag && imageRect.bottom + deltaY < window.innerHeight;
        const top = !isBottomDrag && imageRect.top + deltaY > 0;
        return {
            right,
            left,
            bottom,
            top,
        };
    }
    getTouchCenter(event) {
        const sum = (a, b) => a + b;
        const touches = [...event.touches];
        const touchCount = touches.length;
        return {
            x: touches.map(touch => touch.pageX).reduce(sum) / touchCount,
            y: touches.map(touch => touch.pageY).reduce(sum) / touchCount,
        };
    }
    setTransform({ offsetX, offsetY, scale }) {
        this.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale3d(${scale}, ${scale}, 1)`;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.currentScale = scale;
    }
    touchZoom(clientX, clientY) {
        const xs = (clientX - this.offsetX) / this.currentScale;
        const ys = (clientY - this.offsetY) / this.currentScale;
        let newScale;
        let newOffsetX;
        let newOffsetY;
        if (this.modal.isZoomed) {
            newScale = this.getNewScale(1);
            newOffsetX = 0;
            newOffsetY = 0;
        }
        else {
            newScale = this.getNewScale(3);
            newOffsetX = clientX - xs * newScale;
            newOffsetY = clientY - ys * newScale;
        }
        this.style.cursor = this.modal.isZoomed ? '' : 'grab';
        this.setZoomCursorVisible(this.modal.isZoomed);
        this.setTransform({
            scale: newScale,
            offsetX: newOffsetX,
            offsetY: newOffsetY,
        });
    }
    reset() {
        this.setTransform({
            scale: 1,
            offsetX: 0,
            offsetY: 0,
        });
    }
    getNewScale(newScale) {
        return Math.max(this.minScale, Math.min(this.maxScale, newScale));
    }
    setPinchScaling(isPinchScaling) {
        this.toggleAttribute('is-pinch-scaling', isPinchScaling);
        this.isPinchScaling = isPinchScaling;
    }
    setDragging(isDragging) {
        this.toggleAttribute('is-dragging', isDragging);
        this.isDragging = isDragging;
    }
    setZoomCursorVisible(isVisible) {
        this.image?.toggleAttribute('data-zoom-cursor-target', isVisible);
    }
    setModalZoom(isZoomed) {
        this.modal.isZoomed = isZoomed;
        if (this.modal.isZoomed) {
            this.modal.zoomedImage = this;
        }
        this.modal.updateModal();
    }
    setPreloaderVisible(isVisible) {
        this.preloader.classList.toggle('hidden', !isVisible);
        this.image?.toggleAttribute('is-loaded', !isVisible);
    }
    set currentScale(value) {
        if (this.currentSettedScale !== value) {
            this.setModalZoom(value > 1);
            this.currentSettedScale = value;
        }
    }
    get currentScale() {
        return this.currentSettedScale;
    }
}
exports.ProductModalImageWrap = ProductModalImageWrap;


/***/ }),

/***/ 7327:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductModal = void 0;
const modal_1 = __webpack_require__(2549);
const check_media_1 = __webpack_require__(5580);
const key_1 = __webpack_require__(9650);
const utils_1 = __webpack_require__(4083);
const CAROUSEL_SELECTOR = `[data-product-modal-carousel]`;
const CAROUSEL_BUTTONS_SELECTOR = `[data-product-modal-carousel-button]`;
const CAROUSEL_SLIDE_SELECTOR = `[data-product-modal-slide]`;
const CAROUSEL_SELECTED_SLIDE_NUMBER_SELECTOR = `[data-product-modal-selected-slide-number]`;
const ZOOM_CURSOR_SELECTOR = `zoom-cursor`;
class ProductModal extends modal_1.ModalComponent {
    carousel;
    mediaIndexMap;
    isZoomed = false;
    zoomedImage;
    handleKeydown = (event) => {
        if ((0, key_1.isEscKey)(event)) {
            this.isZoomed ? this.zoomedImage.reset() : this.hide();
        }
    };
    handleCarouselInit = () => {
        this.updateCarouselDraggableState();
    };
    handleCarouselSelect = () => {
        this.updateSelectedSlideNumber();
    };
    openAndShowMediaById(mediaId) {
        this.show();
        if (!this.carousel) {
            return;
        }
        const mediaIndex = this.mediaIndexMap[mediaId];
        this.carousel.embla.scrollTo(mediaIndex, true);
        const carouselButtons = (0, utils_1.$list)(CAROUSEL_BUTTONS_SELECTOR, this.carousel);
        if (carouselButtons[0]) {
            carouselButtons[0].focus();
        }
        this.updateSelectedSlideNumber();
    }
    initCarousel() {
        this.mediaIndexMap = this.createMediaIndexMap();
        if (this.element) {
            this.carousel = (0, utils_1.$el)(CAROUSEL_SELECTOR, this.element);
        }
        this.carousel?.embla.on('select', this.handleCarouselSelect);
        this.carousel?.embla.on('init', this.handleCarouselInit);
    }
    resetCarousel() {
        this.carousel?.embla.off('select', this.handleCarouselSelect);
        this.carousel?.embla.off('init', this.handleCarouselInit);
    }
    hide() {
        this.resetCarousel();
        super.hide();
        this.isZoomed = false;
        this.updateModal();
        this.emit('hide', {});
    }
    show() {
        super.show();
        this.initCarousel();
    }
    updateSelectedSlideNumber() {
        const selectedSlideNumber = (0, utils_1.$el)(CAROUSEL_SELECTED_SLIDE_NUMBER_SELECTOR, this.element);
        if (!selectedSlideNumber || !this.carousel) {
            return;
        }
        const selectedIndex = this.carousel.embla.selectedScrollSnap();
        const newSlideNumber = selectedIndex + 1;
        selectedSlideNumber.textContent = String(newSlideNumber);
    }
    updateModal() {
        this.updateCarouselDraggableState();
        this.updateZoomCursorState();
        this.updateZoomState();
    }
    createMediaIndexMap() {
        const slides = (0, utils_1.$list)(CAROUSEL_SLIDE_SELECTOR, this.element);
        return slides.reduce((acc, slide, index) => {
            if (!slide.dataset.mediaId) {
                return acc;
            }
            return { ...acc, [slide.dataset.mediaId]: index };
        }, {});
    }
    updateCarouselDraggableState() {
        if (!this.carousel) {
            return;
        }
        if (!(0, check_media_1.isMobile)()) {
            this.carousel.reInit({ watchDrag: false });
            return;
        }
        this.carousel.reInit({ watchDrag: !this.isZoomed });
    }
    updateZoomCursorState() {
        const zoomCursor = (0, utils_1.$el)(ZOOM_CURSOR_SELECTOR);
        if (!zoomCursor) {
            return;
        }
        zoomCursor.updateState(this.isZoomed);
    }
    updateZoomState() {
        this.toggleAttribute('zoom-enabled', this.isZoomed);
    }
}
exports.ProductModal = ProductModal;


/***/ }),

/***/ 2913:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductModel = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const { Shopify } = window;
const POSTER_SELECTOR = '[id^="Deferred-Poster-"]';
class ProductModel extends base_component_1.BaseComponent {
    modelViewerUI;
    mountComponent() {
        const poster = (0, utils_1.$el)(POSTER_SELECTOR, this);
        this.addListener(poster, 'click', this.handlePosterClick);
        this.carousel?.embla.on('settle', this.handleCarouselSelect);
    }
    unmountComponent() {
        this.carousel?.embla.off('settle', this.handleCarouselSelect);
    }
    handlePosterClick = () => {
        this.loadContent();
    };
    handleCarouselSelect = () => {
        if (this.carousel) {
            this.setCarouselDraggable(true);
        }
    };
    loadContent() {
        if (!this.getAttribute('loaded')) {
            this.addModel();
            this.setAttribute('loaded', 'true');
            if (this.carousel) {
                this.setCarouselDraggable(false);
            }
        }
        Shopify.loadFeatures([
            {
                name: 'model-viewer-ui',
                version: '1.0',
                onLoad: this.setupModelViewerUI.bind(this),
            },
        ], () => { });
    }
    addModel() {
        const template = (0, utils_1.$el)('template', this);
        if (!template || !template.content) {
            return;
        }
        const templateContent = template.content;
        const content = document.createElement('div');
        content.appendChild(templateContent.firstElementChild.cloneNode(true));
        const modelViewer = (0, utils_1.$el)('model-viewer', content);
        this.appendChild(modelViewer);
    }
    setupModelViewerUI(errors) {
        if (errors) {
            return;
        }
        this.modelViewerUI = new Shopify.ModelViewerUI((0, utils_1.$el)('model-viewer', this));
    }
    setCarouselDraggable(isDraggable) {
        const modelViewer = (0, utils_1.$el)('.shopify-model-viewer-ui', this);
        this.carousel.dataset.draggable = isDraggable ? 'true' : 'false';
        this.carousel.reInit({ watchDrag: isDraggable });
        if (isDraggable && modelViewer) {
            modelViewer.remove();
            this.removeAttribute('loaded');
        }
    }
    get carousel() {
        return (0, utils_1.$elParent)('carousel-component', this);
    }
}
exports.ProductModel = ProductModel;
window.ProductModel = {
    loadShopifyXR() {
        Shopify.loadFeatures([
            {
                name: 'shopify-xr',
                version: '1.0',
                onLoad: this.setupShopifyXR.bind(this),
            },
        ], () => { });
    },
    setupShopifyXR(errors) {
        if (errors) {
            return;
        }
        if (!window.ShopifyXR) {
            document.addEventListener('shopify_xr_initialized', () => this.setupShopifyXR());
            return;
        }
        (0, utils_1.$list)('[id^="ProductJSON-"]').forEach(modelJSON => {
            window.ShopifyXR.addModels(JSON.parse(modelJSON.textContent));
            modelJSON.remove();
        });
        window.ShopifyXR.setupXRElements();
    },
};
window.addEventListener('DOMContentLoaded', () => {
    if (Shopify.designMode) {
        (0, utils_1.$list)('[data-shopify-xr-hidden]').forEach(element => element.classList.add('hidden'));
    }
    if (window.ProductModel) {
        window.ProductModel.loadShopifyXR();
    }
});


/***/ }),

/***/ 250:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PickupAvailability = void 0;
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
class PickupAvailability extends base_component_1.BaseComponent {
    mountComponent() {
        this.fetchAvailability();
    }
    fetchAvailability() {
        const url = `${this.dataset.baseUrl}variants/${this.dataset.variantId}/?section_id=pickup-availability`;
        fetch(url)
            .then(response => response.text())
            .then(text => {
            const html = (0, utils_1.$el)('.shopify-section', (0, dom_1.parseHTML)(text));
            this.updateSidebarFromHTML(html);
            this.updateContentFromHTML(html);
        })
            .catch(() => {
            console.log('Error in pickup availability component');
        });
    }
    updateVariantId(newVariantId) {
        this.dataset.variantId = newVariantId;
    }
    updateContentFromHTML(section) {
        const content = (0, utils_1.$el)('pickup-availability-content', this);
        const newContent = (0, utils_1.$el)('pickup-availability-content', section);
        (0, dom_1.replaceNodeChildren)(content, newContent);
    }
    updateSidebarFromHTML(section) {
        const drawer = (0, utils_1.$el)('#pickup-availability-sidebar');
        if (!drawer) {
            return;
        }
        const newTemplate = (0, utils_1.$el)(`[data-sidebar-template="${drawer.id}"]`, section);
        if (newTemplate) {
            drawer.updateTemplate(newTemplate);
        }
    }
}
exports.PickupAvailability = PickupAvailability;


/***/ }),

/***/ 453:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VariantPicker = void 0;
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const key_1 = __webpack_require__(9650);
const ELEMENTS = [
    'sticky-product-buy-btn',
    'product-buy-btn',
    'product-quantity',
];
const BLOCKS = [
    'product-price',
    'product-badges',
    'product-sku',
    'product-stock',
];
const VARIANTS_JSON_SELECTOR = '[data-variant-picker-variants]';
const OPTION_INPUTS_SELECTOR = '[data-variant-picker-option-inputs]';
const OPTION_LABELS_SELECTOR = '[data-variant-picker-option-labels]';
const DROPDOWN_LABEL_SELECTOR = '[data-dropdown-variant-picker-label]';
const ARROW_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
const HEADER_SELECTOR = 'header-component';
class VariantPicker extends base_component_1.BaseComponent {
    variants;
    variant;
    constructor() {
        super();
        this.variants = JSON.parse((0, utils_1.$el)(VARIANTS_JSON_SELECTOR, this).textContent);
    }
    mountComponent() {
        this.setVariant();
        this.setOptionsAvailable();
        if (this.hasAttribute('data-initial-selected-variant')) {
            this.setFirstMedia(true);
        }
        this.setListeners();
    }
    handleVariantChange = event => {
        this.setVariant();
        const targetUrl = event.target.dataset.productUrl;
        if (targetUrl && this.dataset.url !== targetUrl) {
            this.swapProduct(targetUrl);
            return;
        }
        this.setOptionsAvailable();
        this.updateLabels();
        this.updateStock();
        if (!this.variant) {
            return;
        }
        this.updatePickupAvailability();
        this.updateURL();
        this.updateVariantInput();
        this.updateSection();
        if (!this.hasAttribute('data-product-media-filtering-option')) {
            this.setFirstMedia(false);
        }
        this.emit('change', {
            variant: this.variant,
            option: {
                name: event.target.name,
                value: event.target.value,
            },
        });
    };
    toggleHeaderDynamicShow = bool => {
        const header = (0, utils_1.$el)(HEADER_SELECTOR);
        header.toggleLockDynamicShow(bool);
    };
    swapProduct(productUrl) {
        const product = this.closest('.shopify-section');
        const quickView = this.closest('quick-view');
        const options = (0, utils_1.$list)(OPTION_INPUTS_SELECTOR, this);
        const selectedOptionsIds = options.map(option => this.getCheckedInput((0, utils_1.$list)('input', option)).dataset.valueId);
        const params = this.variant
            ? `variant=${this.variant?.id}`
            : `option_values=${selectedOptionsIds.join(',')}`;
        fetch(`${productUrl}?section_id=${this.dataset.sectionIdWithoutPrefix}&${params}`)
            .then(response => response.text())
            .then(responseText => {
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            if (product) {
                const newProduct = html.getElementById(`shopify-section-${this.dataset.sectionIdWithoutPrefix}`);
                product.innerHTML = newProduct.innerHTML;
            }
            else if (quickView) {
                quickView.setProductFromHTML(html);
            }
        });
        window.history.replaceState({}, '', `${productUrl}`);
    }
    updateLabels() {
        const inputContainers = (0, utils_1.$list)(OPTION_INPUTS_SELECTOR, this);
        const labelContainers = (0, utils_1.$list)(OPTION_LABELS_SELECTOR, this);
        inputContainers.forEach((inputContainer, idx) => {
            const labels = (0, utils_1.$list)('label', labelContainers[idx]);
            const inputs = (0, utils_1.$list)('input', inputContainer);
            const input = this.getCheckedInput(inputs);
            const dropdownLabel = (0, utils_1.$el)(DROPDOWN_LABEL_SELECTOR, labelContainers[idx]);
            if (dropdownLabel) {
                dropdownLabel.toggleAttribute('no-available', !this.variant?.available);
            }
            labels.forEach(label => {
                const isSelected = label.getAttribute('for') === input.id;
                if (dropdownLabel && isSelected) {
                    const dropdown = (0, utils_1.$elParent)('dropdown-opener', dropdownLabel);
                    (0, dom_1.replaceNodeChildren)(dropdownLabel, label);
                    dropdown.trigger();
                }
                label.classList.toggle('selected', isSelected);
            });
        });
    }
    updateURL() {
        if (!this.variant || this.dataset.updateUrl === 'false') {
            return;
        }
        window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.variant.id}`);
    }
    updateStock() {
        const stock = (0, utils_1.$el)(`#product-stock-inner-${this.dataset.productId}-${this.dataset.section}`);
        stock?.classList.toggle('hidden', !this.variant);
    }
    setVariant() {
        const options = (0, utils_1.$list)(OPTION_INPUTS_SELECTOR, this);
        const selectedOptions = options.map(option => this.getCheckedInput((0, utils_1.$list)('input', option)).value);
        this.variant = this.variants.find(({ options }) => options.every((option, index) => selectedOptions[index] === option));
        if (!this.variant) {
            (0, utils_1.whenDefined)('product-form').then(() => {
                this.setUnavailable();
            });
        }
    }
    setUnavailable() {
        this.getForm()?.setDisable(true);
        this.getForm()?.setButtonText(window.auroraThemeLocales.variantStrings.unavailable);
    }
    setListeners() {
        const dropdowns = (0, utils_1.$list)('float-element', this);
        const dropdownLabels = dropdowns
            .map(dropdown => (0, utils_1.$list)('label', dropdown.element))
            .flat(1);
        const simpleLabels = (0, utils_1.$list)('label', this);
        const labels = [...dropdownLabels, ...simpleLabels];
        this.addListener(this, 'keydown', this.handleKeydown);
        labels.forEach(label => {
            this.addListener(label, 'keydown', this.handleLabelKeydown);
        });
        this.addListener(this, 'change', this.handleVariantChange);
    }
    handleLabelKeydown = (event) => {
        if ((0, key_1.isEnterKey)(event)) {
            event.preventDefault();
            const target = event.target;
            const input = (0, utils_1.$el)(`input[id="${target.getAttribute('for')}"]`, this);
            if (input) {
                input.dispatchEvent(new MouseEvent('click', { button: 0, which: 1 }));
            }
        }
    };
    handleKeydown = (event) => {
        const isArrowKey = ARROW_KEYS.includes(event.key);
        if (!isArrowKey && !(0, key_1.isTabKey)(event)) {
            return;
        }
        const target = event.target;
        const labelContainer = (0, utils_1.$elParent)(OPTION_LABELS_SELECTOR, target);
        if (!labelContainer) {
            this.removeListener(document, 'keydown', this.handleLabelKeydown);
            return;
        }
        const labels = (0, utils_1.$list)('label', labelContainer);
        const index = labels.findIndex(label => label === event.target);
        const currentLabel = labels[index];
        const firstLabel = labels[0];
        const lastLabel = labels[labels.length - 1];
        const nextLabel = labels[index + 1];
        const prevLabel = labels[index - 1];
        const setActiveLabel = newLabel => {
            currentLabel?.removeAttribute('tabindex');
            newLabel.setAttribute('tabindex', 0);
            newLabel.focus();
            event.preventDefault();
        };
        const changeActiveLabelOnNext = () => {
            setActiveLabel(nextLabel || firstLabel);
        };
        const changeActiveLabelOnPrev = () => {
            setActiveLabel(prevLabel || lastLabel);
        };
        const callback = {
            ArrowLeft: changeActiveLabelOnPrev,
            ArrowRight: changeActiveLabelOnNext,
            ArrowUp: changeActiveLabelOnPrev,
            ArrowDown: changeActiveLabelOnNext,
        }[event.key];
        if ((0, key_1.isTabKey)(event)) {
            if (prevLabel && event.shiftKey) {
                changeActiveLabelOnPrev();
            }
            else if (nextLabel && !event.shiftKey) {
                changeActiveLabelOnNext();
            }
        }
        else {
            callback();
        }
    };
    getVariantsByOption(prevOptions) {
        const availableVariants = this.variants
            .filter(variant => variant.available)
            .map(variant => variant.options);
        if (!prevOptions) {
            return availableVariants;
        }
        return availableVariants.filter(options => prevOptions.every(prevOption => options.includes(prevOption.value)));
    }
    async getDropdownElementBySelector(selector) {
        const dropdowns = (0, utils_1.$list)('float-element', this);
        let elementBySelector;
        await (0, utils_1.whenDefined)('float-element').then(() => {
            elementBySelector = (0, utils_1.$el)(selector, dropdowns.find(dropdown => (0, utils_1.$el)(selector, dropdown.element)).element);
        });
        return elementBySelector;
    }
    async setOptions(options, possibleVariants) {
        for (const option of options) {
            const available = possibleVariants.some(variant => variant.includes(option.value));
            const labelSelector = `label[for="${option.id}"]`;
            const label = (0, utils_1.$el)(labelSelector, this) ||
                (await this.getDropdownElementBySelector(labelSelector));
            label.toggleAttribute('no-available', !available);
        }
    }
    setOptionsAvailable() {
        const options = (0, utils_1.$list)(OPTION_INPUTS_SELECTOR, this);
        const firstOptions = options[0] && (0, utils_1.$list)('input', options[0]);
        const firstOption = this.getCheckedInput(firstOptions);
        this.setOptions(firstOptions, this.getVariantsByOption([]));
        const secondOptions = options[1] && (0, utils_1.$list)('input', options[1]);
        if (secondOptions) {
            const secondOption = this.getCheckedInput(secondOptions);
            this.setOptions(secondOptions, this.getVariantsByOption([firstOption]));
            const thirdOptions = options[2] && (0, utils_1.$list)('input', options[2]);
            if (thirdOptions) {
                this.setOptions(thirdOptions, this.getVariantsByOption([firstOption, secondOption]));
            }
        }
    }
    setFirstMedia(isForceAnimation) {
        const mediaList = (0, utils_1.$list)(`#product-media-${this.dataset.productId}-${this.dataset.section}`);
        mediaList.forEach(media => media.updateFirstMediaByVariant(this.variant, isForceAnimation));
    }
    setFirstMediaByVariant(variantId) {
        const mediaList = (0, utils_1.$list)(`#product-media-${this.dataset.productId}-${this.dataset.section}`);
        mediaList.forEach(media => media.updateFirstMediaByVariant(variantId));
    }
    updateVariantInput() {
        const form = (0, utils_1.$el)(`#product-form-component-${this.dataset.productId}-${this.dataset.section}`);
        if (!form) {
            return;
        }
        form.getVeriantInput().setAttribute('value', String(this.variant.id));
        form.getVeriantInput().dispatchEvent(new Event('change', { bubbles: true }));
    }
    updatePickupAvailability() {
        const pickupAvailability = (0, utils_1.$el)(`#product-pickup-availability-${this.dataset.productId}-${this.dataset.section}`);
        if (pickupAvailability) {
            pickupAvailability.updateVariantId(this.variant.id);
            pickupAvailability.fetchAvailability();
        }
    }
    updateSection() {
        this.toggleHeaderDynamicShow(true);
        const form = (0, utils_1.$el)(`#product-form-component-${this.dataset.productId}-${this.dataset.section}`);
        this.updateBlocks();
        form?.setDisable(true);
        form?.setLoading(true);
        fetch(`${this.dataset.url}?variant=${this.variant.id}&section_id=${this.dataset.sectionIdWithoutPrefix}`)
            .then(response => response.text())
            .then(responseText => {
            form?.setDisable(!this.variant.available);
            form?.setLoading(false);
            this.updateElements((0, dom_1.parseHTML)(responseText));
        })
            .catch(() => {
            console.log('Error in variant picker component');
        })
            .finally(() => {
            this.toggleHeaderDynamicShow(false);
        });
    }
    updateElements(html) {
        ELEMENTS.forEach(block => {
            const id = `${block}-${this.dataset.productId}-${this.dataset.section}`;
            const target = (0, utils_1.$el)(`#${id}`);
            const newTarget = (0, utils_1.$el)(`#${id}`, html);
            (0, dom_1.replaceNodeChildren)(target, newTarget);
        });
    }
    updateBlocks() {
        BLOCKS.forEach(blockId => {
            const block = (0, utils_1.$el)(`#${blockId}-${this.dataset.productId}-${this.dataset.section}`);
            block?.updateByVariantId(this.variant.id);
        });
    }
    getCheckedInput(inputs) {
        return inputs.find(({ checked }) => checked);
    }
    getForm() {
        return (0, utils_1.$el)(`#product-form-component-${this.dataset.productId}-${this.dataset.section}`);
    }
}
exports.VariantPicker = VariantPicker;


/***/ }),

/***/ 4218:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuickView = void 0;
const dom_1 = __webpack_require__(3889);
const utils_1 = __webpack_require__(4083);
const recently_viewed_1 = __webpack_require__(8195);
const sidebar_1 = __webpack_require__(4622);
const { Shopify } = window;
class QuickView extends sidebar_1.SidebarComponent {
    cache = {};
    rendered;
    content;
    requestProductFromUrl(url, id) {
        if (!this.cache[url]) {
            this.rendered = (0, utils_1.$el)(`.shopify-section [data-quick-view-product-id="${id}"]`);
            if (this.rendered && this.rendered.dataset.quickViewProductUrl === url) {
                this.cache[url] = (0, utils_1.delay)(0).then(() => this.rendered);
            }
            else {
                this.cache[url] = fetch(url)
                    .then(response => response.text())
                    .then(responseText => (0, dom_1.parseHTML)(responseText))
                    .catch(() => console.log('error in quick view'));
            }
        }
    }
    handleContentScroll = () => {
        const isScrolled = this.content ? this.content.scrollTop > 0 : false;
        this.toggleAttribute('header-shadow-visible', isScrolled);
    };
    openAndRenderProductByUrl = async (url) => {
        if (this.cache[url]) {
            let html;
            await this.cache[url].then(result => {
                html = result;
            });
            if (this.rendered) {
                this.rendered.replaceChildren();
            }
            if (this.isOpen) {
                await this.hide();
            }
            this.setProductFromHTML(html);
            Shopify?.PaymentButton?.init();
            await this.open();
        }
    };
    setProductFromHTML(html) {
        if (this.dataset.targetId) {
            const target = (0, utils_1.$el)(`#${this.dataset.targetId}`, html);
            if (target) {
                recently_viewed_1.RecentlyViewed.updateProductsInLocalStorage(target.dataset.productHandle);
                const targetClass = target.getAttribute('class') || '';
                const clonedTarget = target.cloneNode(true);
                this.element.setAttribute('class', targetClass);
                this.element.replaceChildren(...clonedTarget.childNodes);
                this.content = (0, utils_1.$el)('[data-quick-view-content]', this.element);
                this.addListener(this.content, 'scroll', this.handleContentScroll);
            }
        }
    }
    resetProduct() {
        if (this.content) {
            this.removeListener(this.content, 'scroll', this.handleContentScroll);
            if (this.rendered) {
                (0, dom_1.replaceNodeChildren)(this.rendered, this.content);
            }
            this.content = null;
        }
        this.element.replaceChildren();
    }
}
exports.QuickView = QuickView;


/***/ }),

/***/ 1893:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RecipientForm = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const RECIPIENT_FORM_CHECKBOX_SELECTOR = `[data-recipient-form-checkbox]`;
const RECIPIENT_FORM_TIMEZONE_INPUT_SELECTOR = `[data-recipient-form-timezone-input]`;
const RECIPIENT_FORM_INPUT_SELECTOR = '[data-recipient-form-input]';
const RECIPIENT_FORM_FIELDS_SELECTOR = '[data-recipient-form-fields]';
class RecipientForm extends base_component_1.BaseComponent {
    mountComponent() {
        this.addListener(this, 'change', this.handleChange);
    }
    handleChange() {
        const checkbox = (0, utils_1.$el)(RECIPIENT_FORM_CHECKBOX_SELECTOR, this);
        this.updateHeight(checkbox.checked);
        this.updateDisable(!checkbox.checked);
        if (!checkbox.checked) {
            this.clearInputs();
        }
    }
    clearInputs() {
        const inputs = (0, utils_1.$list)(`${RECIPIENT_FORM_INPUT_SELECTOR}, ${RECIPIENT_FORM_TIMEZONE_INPUT_SELECTOR}`, this);
        inputs.forEach(input => {
            input.value = '';
        });
    }
    updateDisable(isDisabled) {
        const inputs = (0, utils_1.$list)(`${RECIPIENT_FORM_INPUT_SELECTOR}, ${RECIPIENT_FORM_TIMEZONE_INPUT_SELECTOR}`, this);
        inputs.forEach(field => {
            field.disabled = isDisabled;
        });
    }
    reset() {
        const checkbox = (0, utils_1.$el)(RECIPIENT_FORM_CHECKBOX_SELECTOR, this);
        checkbox.checked = false;
        this.clearInputs();
    }
    updateHeight(isChecked) {
        const fields = (0, utils_1.$el)(RECIPIENT_FORM_FIELDS_SELECTOR, this);
        if (fields) {
            fields.style.maxHeight = `${isChecked ? fields.scrollHeight : 0}px`;
        }
    }
    setTimezone() {
        const timezoneInput = (0, utils_1.$el)(RECIPIENT_FORM_TIMEZONE_INPUT_SELECTOR, this);
        timezoneInput.value = String(new Date().getTimezoneOffset());
    }
}
exports.RecipientForm = RecipientForm;


/***/ }),

/***/ 9129:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductRelatedBlock = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const dom_1 = __webpack_require__(3889);
class ProductRelatedBlock extends base_component_1.BaseComponent {
    mountComponent() {
        this.loadProducts();
    }
    loadProducts() {
        this.setAttribute('is-loading', '');
        return fetch(this.dataset.url)
            .then(response => response.text())
            .then(text => {
            this.updateByHTML((0, dom_1.parseHTML)(text));
            this.removeAttribute('is-loading');
        })
            .catch(() => {
            console.log('Error in product recommendations component');
        });
    }
    updateByHTML(html) {
        const recommendations = (0, utils_1.$el)(`#${this.id}`, html);
        (0, dom_1.replaceNodeChildren)(this, recommendations);
        this.toggleAttribute('is-ready', this.hasChildNodes());
    }
}
exports.ProductRelatedBlock = ProductRelatedBlock;


/***/ }),

/***/ 9220:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ZoomCursor = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const check_media_1 = __webpack_require__(5580);
const ZOOM_TARGET_SELECTOR = `[data-zoom-cursor-target]`;
class ZoomCursor extends base_component_1.BaseComponent {
    mutationObserver;
    constructor() {
        super();
        this.mutationObserver = new MutationObserver(this.handleMutations);
    }
    mountComponent() {
        this.addListener(window, 'mousemove', this.handleMouseMove);
    }
    unmountComponent() {
        this.mutationObserver.disconnect();
    }
    handleMutations = (mutations) => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes') {
                this.setVisible(mutation.target.matches(ZOOM_TARGET_SELECTOR));
            }
        });
    };
    handleMouseMove = (event) => {
        const target = event.target;
        const isTarget = !!(0, utils_1.$elParent)(ZOOM_TARGET_SELECTOR, target);
        if (!(0, check_media_1.isMobile)()) {
            this.setVisible(isTarget);
            if (this.isVisible) {
                this.style.transform = `translate(calc(-50% + ${event.clientX}px), calc(-50% + ${event.clientY}px))`;
            }
        }
        if (isTarget) {
            this.mutationObserver.observe(target, {
                attributes: true,
            });
        }
        else {
            this.mutationObserver.disconnect();
        }
    };
    setVisible(isVisible) {
        this.classList.toggle('is-visible', isVisible);
        document.body.style.cursor = isVisible ? 'none' : '';
    }
    updateState(isZoomed) {
        this.toggleAttribute('zoomed', isZoomed);
    }
    get isVisible() {
        return this.classList.contains('is-visible');
    }
}
exports.ZoomCursor = ZoomCursor;


/***/ }),

/***/ 766:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RecentlyViewed = void 0;
var recently_viewed_1 = __webpack_require__(8195);
Object.defineProperty(exports, "RecentlyViewed", ({ enumerable: true, get: function () { return recently_viewed_1.RecentlyViewed; } }));


/***/ }),

/***/ 8195:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RecentlyViewed = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const defaultCardsLimit = 50;
const defaultCardImgRatio = 'portrait';
const defaultCardAlignment = 'left';
const containerAttribute = '[recently-viewed-container]';
const localStorageSelector = 'AuroraTheme-RecentlyViewed';
const cardTemplateSelector = 'product-card-template';
const cardSelector = 'product-card';
const cardInnerSelector = '[data-product-card-inner]';
class RecentlyViewed extends base_component_1.BaseComponent {
    cardLimit;
    cardImgRatio;
    cardAlignment;
    cardAlignmentClass;
    shapeClass;
    products;
    container;
    constructor() {
        super();
        this.cardLimit = +this.dataset.cardLimit ?? defaultCardsLimit;
        this.cardImgRatio = this.dataset.imgRatio ?? defaultCardImgRatio;
        this.cardAlignment = this.dataset.cardAlignment ?? defaultCardAlignment;
        this.cardAlignmentClass = `product-card--${this.cardAlignment}-alignment`;
        this.shapeClass = `shape--${this.cardImgRatio}`;
        this.products = [];
        this.container = (0, utils_1.$el)(containerAttribute, this);
    }
    async mountComponent() {
        await this.fetchItems();
        if (this.products.length > 0) {
            this.setItems();
            this.setVisible(true);
        }
    }
    fetchItems = async () => {
        const { origin } = window.location;
        const locale = window.Shopify.routes.root ?? '/';
        const currentSavedProducts = JSON.parse(localStorage.getItem(localStorageSelector))?.slice(0, this.cardLimit);
        if (!currentSavedProducts) {
            return;
        }
        try {
            for (const handle of currentSavedProducts) {
                const section = await fetch(`${origin}${locale}products/${handle}?sections=product-card-template`).then(res => res.json());
                const node = this.createNodeByString(section[cardTemplateSelector]);
                if (node) {
                    this.products.push(node);
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    };
    setItems = () => {
        this.container.replaceChildren(...this.products);
    };
    setVisible(isVisible) {
        this.classList.toggle('hidden', !isVisible);
    }
    createNodeByString(productString) {
        const html = new DOMParser().parseFromString(productString, 'text/html');
        const node = (0, utils_1.$el)(`.${cardTemplateSelector}`, html);
        (0, utils_1.$el)(cardSelector, node)?.classList.add(this.cardAlignmentClass);
        (0, utils_1.$el)(cardInnerSelector, node)?.classList.add(this.shapeClass);
        if (this.shapeClass.includes('fit')) {
            (0, utils_1.$el)(cardInnerSelector, node)?.classList.add('shape--fit');
        }
        const productCard = node.querySelector('product-card');
        if (productCard) {
            const slide = document.createElement('div');
            const cardToAdd = productCard.cloneNode(true);
            slide.classList.add('slider-grid__slide');
            slide.setAttribute('slider-grid-slide', '');
            slide.append(cardToAdd);
            return slide;
        }
        else {
            return null;
        }
    }
    static updateProductsInLocalStorage(handle) {
        if (!handle) {
            return;
        }
        const currentSavedProducts = JSON.parse(localStorage.getItem(localStorageSelector)) ?? [];
        const isExist = currentSavedProducts?.find((item) => item === handle);
        const newProducts = isExist
            ? currentSavedProducts
            : [handle, ...currentSavedProducts].slice(0, defaultCardsLimit);
        localStorage.setItem(localStorageSelector, JSON.stringify(newProducts));
    }
}
exports.RecentlyViewed = RecentlyViewed;


/***/ }),

/***/ 1796:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScrollingTextLine = exports.ScrollingText = void 0;
var scrolling_text_1 = __webpack_require__(2937);
Object.defineProperty(exports, "ScrollingText", ({ enumerable: true, get: function () { return scrolling_text_1.ScrollingText; } }));
var scrolling_text_line_1 = __webpack_require__(3355);
Object.defineProperty(exports, "ScrollingTextLine", ({ enumerable: true, get: function () { return scrolling_text_line_1.ScrollingTextLine; } }));


/***/ }),

/***/ 3355:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScrollingTextLine = void 0;
const debounce_1 = __webpack_require__(2731);
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const ANNOUNCEMENT_SELECTOR = '[data-scrolling-text-line]';
const LINE_LINK_SELECTOR = '[data-scrolling-text-anchor]';
const ANIMATION_CLASS = 'scrolling-text--animated';
const FONT_MIXED_ATTRIBUTE = 'with-font-mixed';
const FONT_OUTLINE_CLASS = 'scrolling-text__text--font-outline';
class ScrollingTextLine extends base_component_1.BaseComponent {
    announcement;
    initialScreenWidth = 0;
    isWithFontMixed;
    screenSizeMultiply = 2;
    resizeObserver;
    constructor() {
        super();
        this.isWithFontMixed = this.hasAttribute(FONT_MIXED_ATTRIBUTE);
    }
    mountComponent() {
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(document.body);
    }
    unmountComponent() {
        this.resizeObserver.disconnect();
    }
    getDimentions = () => {
        const announcement = (0, utils_1.$el)(ANNOUNCEMENT_SELECTOR, this);
        if (!announcement) {
            return;
        }
        const screenWidth = document.body.clientWidth;
        const announcementWidth = announcement.clientWidth;
        this.initialScreenWidth = screenWidth;
        return { screenWidth, announcementWidth };
    };
    calcQuantityToRender = (screenWidth, announcementWidth) => {
        const blocksToRender = Math.ceil((screenWidth * this.screenSizeMultiply) / announcementWidth);
        return blocksToRender % 2 === 0 ? blocksToRender : blocksToRender + 1;
    };
    renderNodes = (blocksNumberToRender) => {
        if (!this.announcement) {
            this.announcement = (0, utils_1.$el)(ANNOUNCEMENT_SELECTOR, this).cloneNode(true);
        }
        const announcement = this.announcement.cloneNode(true);
        const link = (0, utils_1.$el)(LINE_LINK_SELECTOR, this);
        if (!announcement) {
            return;
        }
        const nodes = this.isWithFontMixed
            ? this.getFragmentWithMixedFont(blocksNumberToRender, announcement)
            : this.getFragment(blocksNumberToRender, announcement);
        if (link) {
            nodes.appendChild(link);
        }
        this.replaceChildren(nodes);
    };
    getFragment = (blocksNumberToRender, announcement) => {
        const fragment = document.createDocumentFragment();
        const announcements = [];
        for (let i = 0; i < blocksNumberToRender; i++) {
            const clonedAnnouncement = announcement.cloneNode(true);
            let newClass = ANIMATION_CLASS;
            if (this.isWithFontMixed && i % 2 === 0) {
                newClass += ` ${FONT_OUTLINE_CLASS}`;
            }
            clonedAnnouncement.classList.add(newClass);
            announcements.push(clonedAnnouncement);
        }
        fragment.replaceChildren(...announcements);
        return fragment;
    };
    getFragmentWithMixedFont = (blocksNumberToRender, announcement) => {
        const fragment = document.createDocumentFragment();
        const announcements = [];
        for (let i = 0; i < blocksNumberToRender - 1; i++) {
            const clonedAnnouncement1 = announcement.cloneNode(true);
            const clonedAnnouncement2 = announcement.cloneNode(true);
            const div = document.createElement('div');
            clonedAnnouncement1.classList.add(FONT_OUTLINE_CLASS);
            div.replaceChildren(clonedAnnouncement1, clonedAnnouncement2);
            div.classList.add(ANIMATION_CLASS);
            announcements.push(div);
        }
        fragment.replaceChildren(...announcements);
        return fragment;
    };
    handleResize = (0, debounce_1.debounce)(() => {
        const screenWidth = document.body.clientWidth;
        if (screenWidth > this.initialScreenWidth) {
            this.render();
        }
        this.setAttribute('data-is-rendered', 'true');
    }, 100);
    render = () => {
        const { screenWidth, announcementWidth } = this.getDimentions();
        const blocksNumberToRender = this.calcQuantityToRender(screenWidth, announcementWidth);
        this.renderNodes(blocksNumberToRender);
    };
}
exports.ScrollingTextLine = ScrollingTextLine;


/***/ }),

/***/ 2937:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScrollingText = void 0;
const debounce_1 = __webpack_require__(2731);
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const CONTAINER_SELECTOR = '[data-scrolling-text-container]';
const LINE_SELECTOR = 'scrolling-text-line';
class ScrollingText extends base_component_1.BaseComponent {
    resizeObserver;
    paddings;
    mountComponent() {
        const container = (0, utils_1.$el)(CONTAINER_SELECTOR, this);
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(container);
    }
    unmountComponent() {
        this.resizeObserver.disconnect();
    }
    calcHeight = () => {
        const container = (0, utils_1.$el)(CONTAINER_SELECTOR, this);
        const styles = getComputedStyle(container);
        this.paddings = parseInt(styles.paddingTop) + parseInt(styles.paddingBottom);
        const lines = (0, utils_1.$list)(LINE_SELECTOR, this);
        let heightToSet;
        const firstLineRect = lines[0].getBoundingClientRect();
        if (lines.length > 1) {
            const coordsTop = [];
            const coordsBottom = [];
            const lastLineRect = lines[lines.length - 1].getBoundingClientRect();
            coordsTop.push(firstLineRect.top);
            coordsTop.push(lastLineRect.top);
            coordsBottom.push(firstLineRect.bottom);
            coordsBottom.push(lastLineRect.bottom);
            heightToSet =
                coordsBottom.sort((a, b) => b - a)[0] -
                    coordsTop.sort((a, b) => a - b)[0];
        }
        else {
            heightToSet = firstLineRect.height;
        }
        return heightToSet;
    };
    setHeight = () => {
        this.style.setProperty('--gsc-section-height', `${this.calcHeight()}px`);
    };
    handleResize = (0, debounce_1.debounce)(() => {
        this.setHeight();
    }, 100);
}
exports.ScrollingText = ScrollingText;


/***/ }),

/***/ 9728:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SearchSidebarFormWrapper = exports.SearchSidebar = void 0;
var search_sidebar_1 = __webpack_require__(989);
Object.defineProperty(exports, "SearchSidebar", ({ enumerable: true, get: function () { return search_sidebar_1.SearchSidebar; } }));
var search_sidebar_form_wrapper_1 = __webpack_require__(550);
Object.defineProperty(exports, "SearchSidebarFormWrapper", ({ enumerable: true, get: function () { return search_sidebar_form_wrapper_1.SearchSidebarFormWrapper; } }));


/***/ }),

/***/ 550:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SearchSidebarFormWrapper = void 0;
const base_component_1 = __webpack_require__(3608);
const search_api_1 = __webpack_require__(3191);
const dom_1 = __webpack_require__(3889);
const debounce_1 = __webpack_require__(2731);
const utils_1 = __webpack_require__(4083);
const SEARCH_FIELD_SELECTOR = `[data-sidebar-search-input-component]`;
const CONTENT_RESULTS_SELECTOR = `[data-sidebar-search-content-results]`;
const FOOTER_SELECTOR = `[data-sidebar-search-footer]`;
const ITEM_SELECTOR = `[data-sidebar-search-item]`;
const SEARCH_SIDEBAR_SELECTOR = '#SearchSidebar';
class SearchSidebarFormWrapper extends base_component_1.BaseComponent {
    predictiveSearchAPI = new search_api_1.PredictiveSearchAPI();
    mountComponent() {
        this.addListener(this, 'input', this.handleInputChange);
    }
    handleInputChange = (0, debounce_1.debounce)(() => {
        if (this.searchQuery) {
            this.renderResults();
        }
        else {
            this.resetResults();
        }
    }, 500);
    renderResults() {
        this.renderFromUrl(this.searchQuery);
    }
    resetResults() {
        const sidebar = (0, utils_1.$elParent)(SEARCH_SIDEBAR_SELECTOR, this);
        if (!sidebar) {
            return;
        }
        this.updateResultsFromHTML(sidebar.defaultStateElement);
    }
    renderFromUrl(queryKey) {
        const sidebar = (0, utils_1.$elParent)(SEARCH_SIDEBAR_SELECTOR, this);
        const sectionId = sidebar?.dataset.sectionId || 'search-sidebar';
        const limitParam = 'resources[limit]=999' || 0;
        const sectionParam = `section_id=${sectionId}` || '';
        const fieldsParam = sidebar?.hasAttribute('enable-extended-search')
            ? 'resources[options][fields]=author,body,product_type,tag,title,variants.barcode,variants.sku,variants.title,vendor'
            : 'resources[options][fields]=title,product_type,variants.title,vendor';
        this.predictiveSearchAPI
            .get({
            searchQuery: queryKey,
            limitParam,
            sectionParam,
            fieldsParam,
        })
            .then(text => {
            this.updateResultsFromHTML((0, dom_1.parseHTML)(text).body);
        })
            .catch(() => {
            console.log('Error in search component');
        });
    }
    updateResultsFromHTML(html) {
        const newSidebar = (0, utils_1.$el)(SEARCH_SIDEBAR_SELECTOR, html);
        let element;
        if (newSidebar) {
            const template = (0, utils_1.$el)('[data-sidebar-template="SearchSidebar"]', newSidebar);
            element = (0, dom_1.getTemplateFirstChild)(template);
        }
        else {
            element = html;
        }
        const sidebar = (0, utils_1.$elParent)(SEARCH_SIDEBAR_SELECTOR, this);
        const newResults = (0, utils_1.$el)(CONTENT_RESULTS_SELECTOR, element);
        const results = (0, utils_1.$el)(CONTENT_RESULTS_SELECTOR, sidebar?.element);
        (0, dom_1.replaceNodeChildren)(results, newResults);
        this.updateFooterVisible();
    }
    updateFooterVisible() {
        const sidebar = (0, utils_1.$elParent)(SEARCH_SIDEBAR_SELECTOR, this);
        if (sidebar) {
            const footer = (0, utils_1.$el)(FOOTER_SELECTOR, sidebar.element);
            if (footer) {
                const renderedItems = (0, utils_1.$list)(ITEM_SELECTOR, sidebar.element);
                footer.classList.toggle('hidden', renderedItems.length === 0);
            }
        }
    }
    get searchQuery() {
        const sidebar = (0, utils_1.$elParent)(SEARCH_SIDEBAR_SELECTOR, this);
        const searchField = (0, utils_1.$el)(SEARCH_FIELD_SELECTOR, sidebar);
        if (!searchField) {
            return '';
        }
        return searchField.value.trim();
    }
}
exports.SearchSidebarFormWrapper = SearchSidebarFormWrapper;


/***/ }),

/***/ 989:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SearchSidebar = void 0;
const check_media_1 = __webpack_require__(5580);
const sidebar_1 = __webpack_require__(4622);
const utils_1 = __webpack_require__(4083);
const SEARCH_INPUT_SELECTOR = `[data-sidebar-search-input]`;
const CONTENT_SELECTOR = `[data-sidebar-search-content]`;
const CONTENT_RESULTS_SELECTOR = `[data-sidebar-search-content-results]`;
class SearchSidebar extends sidebar_1.SidebarComponent {
    searchInput;
    resizeObserver;
    isInputFocused;
    defaultStateElement;
    constructor() {
        super();
        this.searchInput = (0, utils_1.$el)(SEARCH_INPUT_SELECTOR, this.element);
        this.defaultStateElement = this.element.cloneNode(true);
    }
    mountComponent() {
        super.mountComponent();
        const content = (0, utils_1.$el)(CONTENT_SELECTOR, this.element);
        const contentResults = (0, utils_1.$el)(CONTENT_RESULTS_SELECTOR, this.element);
        if (contentResults) {
            this.resizeObserver = new ResizeObserver(this.handleContentResultsResize);
            this.resizeObserver.observe(contentResults);
        }
        this.addListener(content, 'scroll', this.handleContentScroll);
        this.addListener(this, 'click', this.handleClick);
        this.addListener(this, 'touchend', this.handleSearchSidebarTouchEnd);
        this.addListener(this.searchInput, 'focus', this.handleInputFocus);
    }
    unmountComponent() {
        this.resizeObserver.disconnect();
        super.unmountComponent();
    }
    handleClick = (event) => {
        const target = event.target;
        const isInput = target === this.searchInput;
        const queryElement = (0, utils_1.$elParent)('[data-sidebar-search-query]', target);
        if (this.searchInput && queryElement) {
            const event = new Event('input', { bubbles: true });
            this.searchInput.value = `${queryElement.getAttribute('data-sidebar-search-query')}`;
            this.searchInput.dispatchEvent(event);
            this.searchInput.focus();
        }
        if ((0, check_media_1.isMobile)() && isInput) {
            this.isInputFocused = true;
        }
        if (!isInput && this.isInputFocused) {
            this.isInputFocused = false;
        }
    };
    handleInputFocus = () => {
        if ((0, check_media_1.isMobile)()) {
            this.isInputFocused = true;
        }
    };
    handleSearchSidebarTouchEnd = (event) => {
        const THRESHOLD = 12;
        const target = event.target;
        const distanceX = Math.abs(this.touchStartX - this.touchEndX);
        const distanceY = Math.abs(this.touchStartY - this.touchEndY);
        const isOverThreshold = distanceX > THRESHOLD || distanceY > THRESHOLD;
        if (this.isInputFocused && isOverThreshold && this.searchInput) {
            if (target.tagName === 'A') {
                event.preventDefault();
            }
            this.searchInput.blur();
            this.isInputFocused = false;
        }
        this.cleanTouchPoints();
    };
    handleContentResultsResize = () => {
        this.toggleAttribute('footer-shadow-visible', this.isContentOverlow());
    };
    handleContentScroll = () => {
        const content = (0, utils_1.$el)(CONTENT_SELECTOR, this.element);
        if (content) {
            this.toggleAttribute('header-shadow-visible', this.isContentOverlow() && content.scrollTop > 0);
        }
    };
    async open(event) {
        await super.open(event);
        if (this.searchInput && !this.isEditor) {
            this.searchInput.focus();
        }
    }
    isContentOverlow() {
        const content = (0, utils_1.$el)(CONTENT_SELECTOR, this.element);
        const contentResults = (0, utils_1.$el)(CONTENT_RESULTS_SELECTOR, this.element);
        if (!contentResults || !content) {
            return false;
        }
        return contentResults.offsetHeight > content.offsetHeight;
    }
}
exports.SearchSidebar = SearchSidebar;


/***/ }),

/***/ 6361:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SlideshowComponent = void 0;
var slideshow_1 = __webpack_require__(8715);
Object.defineProperty(exports, "SlideshowComponent", ({ enumerable: true, get: function () { return slideshow_1.SlideshowComponent; } }));


/***/ }),

/***/ 8715:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SlideshowComponent = void 0;
const base_component_1 = __webpack_require__(3608);
const utils_1 = __webpack_require__(4083);
const ANIMATE_IMAGES_ATTRIBUTE = 'data-animate-images';
const SLIDE_ANIMATED_CLASSNAME = 'slideshow__slide--animated';
class SlideshowComponent extends base_component_1.BaseComponent {
    withImagesAnimated;
    constructor() {
        super();
        this.withImagesAnimated = this.hasAttribute(ANIMATE_IMAGES_ATTRIBUTE);
    }
    mountComponent() {
        if (!this.withImagesAnimated) {
            return;
        }
        const carousel = (0, utils_1.$el)('carousel-component', this);
        if (carousel) {
            carousel.embla
                .slideNodes()[carousel.embla.selectedScrollSnap()].classList.add(SLIDE_ANIMATED_CLASSNAME);
            carousel.embla.on('select', this.handleCarouselSelect);
        }
    }
    handleCarouselSelect = (data) => {
        data
            .slideNodes()[data.previousScrollSnap()].classList.remove(SLIDE_ANIMATED_CLASSNAME);
        data
            .slideNodes()[data.selectedScrollSnap()].classList.add(SLIDE_ANIMATED_CLASSNAME);
    };
}
exports.SlideshowComponent = SlideshowComponent;


/***/ }),

/***/ 7121:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VideoBanner = void 0;
var video_banner_1 = __webpack_require__(5809);
Object.defineProperty(exports, "VideoBanner", ({ enumerable: true, get: function () { return video_banner_1.VideoBanner; } }));


/***/ }),

/***/ 5809:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VideoBanner = void 0;
const utils_1 = __webpack_require__(4083);
const base_component_1 = __webpack_require__(3608);
const BANNER_POSTER_SELECTOR = '[data-video-banner-poster]';
class VideoBanner extends base_component_1.BaseComponent {
    isControlsEnabled;
    isAutoplayEnabled;
    constructor() {
        super();
        this.isControlsEnabled = this.hasAttribute('data-enable-controls');
        this.isAutoplayEnabled = this.hasAttribute('data-enable-autoplay');
    }
    mountComponent() {
        if (this.isAutoplayEnabled) {
            this.loadContent();
        }
        this.addListener(this, 'click', this.handleClick);
    }
    handleClick = (event) => {
        const video = (0, utils_1.$elParent)('video', event.target);
        const poster = (0, utils_1.$elParent)(BANNER_POSTER_SELECTOR, event.target);
        if (video) {
            const video = event.target;
            if (!this.isControlsEnabled && video) {
                if (video.paused) {
                    video.play();
                }
                else {
                    video.pause();
                }
            }
        }
        if (poster) {
            this.loadContent();
        }
    };
    loadContent() {
        if (!this.getAttribute('loaded')) {
            this.addVideo();
            this.setAttribute('loaded', 'true');
        }
    }
    removeVideo() {
        const video = (0, utils_1.$el)('video,  iframe', this);
        if (video) {
            video.remove();
            this.removeAttribute('loaded');
        }
    }
    addVideo() {
        const content = document.createElement('div');
        const template = (0, utils_1.$el)('[data-video-banner-media-template]', this);
        const templateContent = template?.content;
        const container = (0, utils_1.$el)('[data-video-banner-container]', this);
        if (!templateContent || !templateContent.firstElementChild) {
            return;
        }
        const firstChild = templateContent.firstElementChild.cloneNode(true);
        content.appendChild(firstChild);
        const video = (0, utils_1.$el)('video, iframe', content);
        if (!video) {
            return;
        }
        const poster = (0, utils_1.$el)(BANNER_POSTER_SELECTOR, this);
        if (poster) {
            poster.remove();
        }
        container.appendChild(video);
        if (video.tagName === 'VIDEO') {
            video.play();
        }
    }
}
exports.VideoBanner = VideoBanner;


/***/ }),

/***/ 5580:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.checkAnimationReduce = exports.isMobile = void 0;
const isMobile = () => {
    return matchMedia('(max-width: 768px)').matches;
};
exports.isMobile = isMobile;
const checkAnimationReduce = () => {
    return matchMedia('(prefers-reduced-motion: reduce)').matches;
};
exports.checkAnimationReduce = checkAnimationReduce;


/***/ }),

/***/ 7734:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.hexToColorName = exports.colorNameToHex = void 0;
const colorNames = {
    aliceblue: '#f0f8ff',
    antiquewhite: '#faebd7',
    aqua: '#00ffff',
    aquamarine: '#7fffd4',
    azure: '#f0ffff',
    beige: '#f5f5dc',
    bisque: '#ffe4c4',
    black: '#000000',
    blanchedalmond: '#ffebcd',
    blue: '#0000ff',
    blueviolet: '#8a2be2',
    brown: '#a52a2a',
    burlywood: '#deb887',
    cadetblue: '#5f9ea0',
    chartreuse: '#7fff00',
    chocolate: '#d2691e',
    coral: '#ff7f50',
    cornflowerblue: '#6495ed',
    cornsilk: '#fff8dc',
    crimson: '#dc143c',
    cyan: '#00ffff',
    darkblue: '#00008b',
    darkcyan: '#008b8b',
    darkgoldenrod: '#b8860b',
    darkgray: '#a9a9a9',
    darkgreen: '#006400',
    darkkhaki: '#bdb76b',
    darkmagenta: '#8b008b',
    darkolivegreen: '#556b2f',
    darkorange: '#ff8c00',
    darkorchid: '#9932cc',
    darkred: '#8b0000',
    darksalmon: '#e9967a',
    darkseagreen: '#8fbc8f',
    darkslateblue: '#483d8b',
    darkslategray: '#2f4f4f',
    darkturquoise: '#00ced1',
    darkviolet: '#9400d3',
    deeppink: '#ff1493',
    deepskyblue: '#00bfff',
    dimgray: '#696969',
    dodgerblue: '#1e90ff',
    firebrick: '#b22222',
    floralwhite: '#fffaf0',
    forestgreen: '#228b22',
    fuchsia: '#ff00ff',
    gainsboro: '#dcdcdc',
    ghostwhite: '#f8f8ff',
    gold: '#ffd700',
    goldenrod: '#daa520',
    gray: '#808080',
    green: '#008000',
    greenyellow: '#adff2f',
    honeydew: '#f0fff0',
    hotpink: '#ff69b4',
    indianred: '#cd5c5c',
    indigo: '#4b0082',
    ivory: '#fffff0',
    khaki: '#f0e68c',
    lavender: '#e6e6fa',
    lavenderblush: '#fff0f5',
    lawngreen: '#7cfc00',
    lemonchiffon: '#fffacd',
    lightblue: '#add8e6',
    lightcoral: '#f08080',
    lightcyan: '#e0ffff',
    lightgoldenrodyellow: '#fafad2',
    lightgrey: '#d3d3d3',
    lightgreen: '#90ee90',
    lightpink: '#ffb6c1',
    lightsalmon: '#ffa07a',
    lightseagreen: '#20b2aa',
    lightskyblue: '#87cefa',
    lightslategray: '#778899',
    lightsteelblue: '#b0c4de',
    lightyellow: '#ffffe0',
    lime: '#00ff00',
    limegreen: '#32cd32',
    linen: '#faf0e6',
    magenta: '#ff00ff',
    maroon: '#800000',
    mediumaquamarine: '#66cdaa',
    mediumblue: '#0000cd',
    mediumorchid: '#ba55d3',
    mediumpurple: '#9370d8',
    mediumseagreen: '#3cb371',
    mediumslateblue: '#7b68ee',
    mediumspringgreen: '#00fa9a',
    mediumturquoise: '#48d1cc',
    mediumvioletred: '#c71585',
    midnightblue: '#191970',
    mintcream: '#f5fffa',
    mistyrose: '#ffe4e1',
    moccasin: '#ffe4b5',
    navajowhite: '#ffdead',
    navy: '#000080',
    oldlace: '#fdf5e6',
    olive: '#808000',
    olivedrab: '#6b8e23',
    orange: '#ffa500',
    orangered: '#ff4500',
    orchid: '#da70d6',
    palegoldenrod: '#eee8aa',
    palegreen: '#98fb98',
    paleturquoise: '#afeeee',
    palevioletred: '#d87093',
    papayawhip: '#ffefd5',
    peachpuff: '#ffdab9',
    peru: '#cd853f',
    pink: '#ffc0cb',
    plum: '#dda0dd',
    powderblue: '#b0e0e6',
    purple: '#800080',
    rebeccapurple: '#663399',
    red: '#ff0000',
    rosybrown: '#bc8f8f',
    royalblue: '#4169e1',
    saddlebrown: '#8b4513',
    salmon: '#fa8072',
    sandybrown: '#f4a460',
    seagreen: '#2e8b57',
    seashell: '#fff5ee',
    sienna: '#a0522d',
    silver: '#c0c0c0',
    skyblue: '#87ceeb',
    slateblue: '#6a5acd',
    slategray: '#708090',
    snow: '#fffafa',
    springgreen: '#00ff7f',
    steelblue: '#4682b4',
    tan: '#d2b48c',
    teal: '#008080',
    thistle: '#d8bfd8',
    tomato: '#ff6347',
    turquoise: '#40e0d0',
    violet: '#ee82ee',
    wheat: '#f5deb3',
    white: '#ffffff',
    whitesmoke: '#f5f5f5',
    yellow: '#ffff00',
    yellowgreen: '#9acd32',
};
const colorHexs = Object.keys(colorNames).reduce((acc, key) => {
    return { ...acc, [colorNames[key]]: key };
}, {});
const colorNameToHex = (color) => {
    return colorNames[color.toLowerCase()];
};
exports.colorNameToHex = colorNameToHex;
const hexToColorName = (hex) => {
    return colorHexs[hex];
};
exports.hexToColorName = hexToColorName;


/***/ }),

/***/ 3036:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.KEY_CONSTS = exports.SHOPIFY_EVENTS = void 0;
exports.SHOPIFY_EVENTS = {
    SECTION_LOAD: 'shopify:section:load',
    SECTION_UNLOAD: 'shopify:section:unload',
    SECTION_SELECT: 'shopify:section:select',
    SECTION_DESELECT: 'shopify:section:deselect',
    SECTION_REORDER: 'shopify:section:reorder',
    BLOCK_SELECT: 'shopify:block:select',
    BLOCK_DESELECT: 'shopify:block:deselect',
};
exports.KEY_CONSTS = {
    ARROW_LEFT_STRING_KEY: 'ArrowLeft',
    ARROW_RIGHT_STRING_KEY: 'ArrowRight',
    ARROW_LEFT_NUMBER_KEY: 37,
    ARROW_RIGHT_NUMBER_KEY: 39,
    ENTER_STRING_KEY: 'Enter',
    ENTER_NUMBER_KEY: 13,
    ESCAPE_STRING_KEY: 'Escape',
    ESCAPE_NUMBER_KEY: 27,
    SPACE_STRING_KEY: ' ',
    SPACE_NUMBER_KEY: 32,
    TAB_STRING_KEY: 'Tab',
    TAB_NUMBER_KEY: 9,
};


/***/ }),

/***/ 2731:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.throttle = exports.debounce = void 0;
const debounce = (fn, wait) => {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
};
exports.debounce = debounce;
const throttle = (callback, timeout) => {
    let timer = null;
    return (...args) => {
        if (timer)
            return;
        timer = setTimeout(() => {
            callback(...args);
            clearTimeout(timer);
            timer = null;
        }, timeout);
    };
};
exports.throttle = throttle;


/***/ }),

/***/ 3626:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defineComponents = void 0;
const featured_navigation_1 = __webpack_require__(8432);
const accordeon_1 = __webpack_require__(7606);
const accordeon_2 = __webpack_require__(4604);
const back_to_top_button_1 = __webpack_require__(1521);
const body_element_1 = __webpack_require__(3831);
const horizontal_product_card_1 = __webpack_require__(1058);
const product_card_1 = __webpack_require__(6978);
const product_card_color_swatches_1 = __webpack_require__(5705);
const product_card_media_tabs_1 = __webpack_require__(7195);
const vertical_product_card_1 = __webpack_require__(3505);
const carousel_1 = __webpack_require__(9691);
const slideshow_1 = __webpack_require__(6361);
const cart_count_1 = __webpack_require__(3492);
const cart_notification_1 = __webpack_require__(1070);
const clipboard_button_1 = __webpack_require__(9911);
const collapsed_tags_1 = __webpack_require__(3210);
const article_card_1 = __webpack_require__(8616);
const countdown_timer_1 = __webpack_require__(5950);
const deffered_media_1 = __webpack_require__(7230);
const float_element_1 = __webpack_require__(1279);
const free_shipping_bar_1 = __webpack_require__(8430);
const inputs_1 = __webpack_require__(1027);
const localization_selector_1 = __webpack_require__(758);
const max_lines_truncate_1 = __webpack_require__(436);
const modal_1 = __webpack_require__(1181);
const modal_2 = __webpack_require__(2549);
const notification_1 = __webpack_require__(4061);
const pagination_1 = __webpack_require__(6504);
const pagination_2 = __webpack_require__(3223);
const quantity_input_1 = __webpack_require__(4710);
const quantity_1 = __webpack_require__(1176);
const shape_swatch_1 = __webpack_require__(7317);
const share_1 = __webpack_require__(3533);
const sidebar_1 = __webpack_require__(6426);
const sidebar_2 = __webpack_require__(4622);
const sticky_cart_button_1 = __webpack_require__(5285);
const tabs_1 = __webpack_require__(1167);
const tab_1 = __webpack_require__(3722);
const tabs_2 = __webpack_require__(7812);
const before_after_images_1 = __webpack_require__(7126);
const cart_1 = __webpack_require__(1636);
const cart_drawer_1 = __webpack_require__(9223);
const cart_2 = __webpack_require__(1678);
const collection_page_1 = __webpack_require__(3389);
const sort_list_1 = __webpack_require__(8590);
const customer_1 = __webpack_require__(4570);
const faq_1 = __webpack_require__(8563);
const announcement_bar_1 = __webpack_require__(8121);
const header_1 = __webpack_require__(9300);
const hotspots_1 = __webpack_require__(3891);
const lookbook_1 = __webpack_require__(5374);
const map_1 = __webpack_require__(2262);
const map_component_1 = __webpack_require__(6942);
const password_page_1 = __webpack_require__(4504);
const popups_1 = __webpack_require__(4997);
const product_1 = __webpack_require__(9193);
const product_recommendations_1 = __webpack_require__(6368);
const product_modal_image_wrap_1 = __webpack_require__(5066);
const product_model_1 = __webpack_require__(2913);
const quick_view_1 = __webpack_require__(4218);
const recently_viewed_1 = __webpack_require__(766);
const scrolling_text_1 = __webpack_require__(1796);
const search_drawer_1 = __webpack_require__(9728);
const video_banner_1 = __webpack_require__(7121);
const utils_1 = __webpack_require__(4083);
const image_slider_1 = __webpack_require__(9239);
const close_cursor_1 = __webpack_require__(5370);
const quote_1 = __webpack_require__(1030);
const testimonials_1 = __webpack_require__(4736);
const lazy_video_1 = __webpack_require__(8659);
const header_float_element_btn_1 = __webpack_require__(4732);
const header_float_element_1 = __webpack_require__(6308);
const product_info_1 = __webpack_require__(5089);
const slider_grid_1 = __webpack_require__(7300);
const components = [
    announcement_bar_1.AnnouncementBar,
    header_float_element_btn_1.HeaderFloatElementBtn,
    header_float_element_1.HeaderFloatElement,
    lazy_video_1.LazyVideo,
    back_to_top_button_1.BackToTopButton,
    sticky_cart_button_1.StickyCartButton,
    quantity_1.QuantityComponent,
    quantity_input_1.QuantityBtn,
    localization_selector_1.LocalizationSelector,
    notification_1.NotificationComponent,
    tabs_2.TabsComponent,
    tab_1.TabComponent,
    collection_page_1.ListComponent,
    collection_page_1.ListBtn,
    float_element_1.FloatElement,
    hotspots_1.HotspotsFloatElement,
    hotspots_1.HotspotsComponent,
    float_element_1.FloatElementBtn,
    float_element_1.DropdownOpener,
    float_element_1.TooltipTrigger,
    faq_1.FaqSection,
    accordeon_2.AccordeonComponent,
    accordeon_1.AccordeonButton,
    product_card_media_tabs_1.ProductMediaTabs,
    product_card_color_swatches_1.ColorSwatches,
    modal_2.ModalComponent,
    password_page_1.PasswordModal,
    password_page_1.PasswordModalButton,
    cart_notification_1.CartNotificationPopup,
    modal_1.ModalButton,
    sidebar_1.SidebarButton,
    sidebar_2.SidebarComponent,
    search_drawer_1.SearchSidebar,
    search_drawer_1.SearchSidebarFormWrapper,
    quick_view_1.QuickView,
    carousel_1.CarouselComponent,
    carousel_1.CarouselPlayButton,
    carousel_1.CarouselDots,
    carousel_1.CarouselButton,
    carousel_1.CarouselProgress,
    slideshow_1.SlideshowComponent,
    header_1.HeaderComponent,
    header_1.DrawerMenu,
    header_1.DrawerMenuPage,
    header_1.DrawerMenuPageLink,
    pagination_2.PaginationComponent,
    pagination_1.PaginationLoadButton,
    pagination_1.PaginationLink,
    pagination_1.PaginationInfiniteScroll,
    deffered_media_1.DeferredMedia,
    product_1.PickupAvailability,
    product_1.ProductForm,
    product_1.ProductFormButton,
    product_1.ProductDetails,
    product_1.ProductBlock,
    product_model_1.ProductModel,
    cart_2.CartPage,
    cart_drawer_1.CartDrawer,
    cart_drawer_1.CartDrawerItemsBlock,
    cart_drawer_1.CartDrawerInCartBannerBlock,
    cart_drawer_1.CartDrawerRelatedProducts,
    cart_drawer_1.CartDrawerRelatedProductsBlock,
    cart_drawer_1.CartDrawerTimerBlock,
    cart_drawer_1.CartDrawerHeader,
    cart_drawer_1.CartDrawerFooter,
    cart_drawer_1.CartDrawerFreeShippingBarBlock,
    cart_drawer_1.CartDrawerButtonsBlock,
    free_shipping_bar_1.FreeShippingBar,
    product_1.ProductContent,
    product_1.ProductMedia,
    product_1.ProductMediaCarousel,
    product_1.VariantPicker,
    product_1.ColorSwatchesPicker,
    product_1.ProductModal,
    product_modal_image_wrap_1.ProductModalImageWrap,
    product_1.ProductModalButton,
    product_recommendations_1.ProductRecommendations,
    product_1.ProductRelatedBlock,
    recently_viewed_1.RecentlyViewed,
    clipboard_button_1.ClipboardButton,
    clipboard_button_1.ClipboardButtonTooltip,
    product_card_1.ProductCard,
    horizontal_product_card_1.HorizontalProductCard,
    vertical_product_card_1.VerticalProductCard,
    max_lines_truncate_1.MaxLinesComponent,
    inputs_1.SearchField,
    inputs_1.PasswordField,
    product_1.ZoomCursor,
    collection_page_1.ShopComponent,
    collection_page_1.ShopActiveFilters,
    collection_page_1.SidebarFiltersDesktop,
    collection_page_1.SidebarFiltersMobile,
    collection_page_1.FilterRemoveBtn,
    sort_list_1.SortList,
    collection_page_1.PriceRange,
    collection_page_1.ColumnSwitcher,
    collection_page_1.FiltersSubmitBtn,
    before_after_images_1.BeforeAfterImages,
    countdown_timer_1.CountdownTimer,
    product_1.ProductInformationDrawer,
    collection_page_1.SidebarFiltersStickyMobileButton,
    product_1.RecipientForm,
    shape_swatch_1.ShapeSwatch,
    customer_1.CountrySelector,
    customer_1.LoginComponent,
    customer_1.RegisterComponent,
    customer_1.AddressesComponent,
    tabs_1.TabWithDynamicHeight,
    video_banner_1.VideoBanner,
    cart_1.CartItem,
    cart_1.CartRemoveButton,
    cart_1.CartItemsBlock,
    cart_1.CartButtonsBlock,
    cart_1.CartCountdownBlock,
    cart_1.CartRelatedProductsBlock,
    cart_1.CartOrderNotesBlock,
    cart_1.CartNote,
    cart_1.CartAppBlock,
    cart_1.CartSubtotalBlock,
    cart_1.CartInCartBannerBlock,
    cart_1.CartFreeShippingBarBlock,
    cart_1.CartRelatedProducts,
    cart_count_1.CartCount,
    share_1.ShareWrapper,
    share_1.ShareComponent,
    scrolling_text_1.ScrollingText,
    scrolling_text_1.ScrollingTextLine,
    collapsed_tags_1.CollapsedTags,
    article_card_1.ArticleTags,
    popups_1.PopupAgeVerifier,
    popups_1.PopupPromo,
    popups_1.PopupSignup,
    popups_1.PopupTeaser,
    lookbook_1.LookbookComponent,
    lookbook_1.LookbookModal,
    map_component_1.MapComponent,
    map_1.StoreLocator,
    body_element_1.BodyElement,
    featured_navigation_1.FeaturedNavigation,
    image_slider_1.ImageSlider,
    close_cursor_1.CloseCursor,
    quote_1.QuoteComponent,
    testimonials_1.TestimonialsComponent,
    product_info_1.ProductInfo,
    slider_grid_1.SliderGrid,
];
// @ts-expect-error
window.recentlyViewed = recently_viewed_1.RecentlyViewed;
const defineComponents = () => {
    components.forEach(utils_1.registerComponent);
};
exports.defineComponents = defineComponents;


/***/ }),

/***/ 3889:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.replaceNodeChildren = exports.parseHTML = exports.skipTransition = exports.removeStyleVariable = exports.setStyleVariable = exports.getTemplateFirstChild = exports.getTemplateContent = exports.getStylePropValue = exports.hideElement = exports.showElement = void 0;
const showElement = (element) => {
    if (element) {
        element.classList.remove('hidden');
    }
};
exports.showElement = showElement;
const hideElement = (element) => {
    if (element) {
        element.classList.add('hidden');
    }
};
exports.hideElement = hideElement;
const getStylePropValue = (element, property) => {
    return getComputedStyle(element)[property];
};
exports.getStylePropValue = getStylePropValue;
const getTemplateContent = template => {
    return template.content.cloneNode(true);
};
exports.getTemplateContent = getTemplateContent;
const getTemplateFirstChild = (template) => {
    return template?.content.firstElementChild.cloneNode(true);
};
exports.getTemplateFirstChild = getTemplateFirstChild;
const setStyleVariable = (variable, value) => {
    document.documentElement.style.setProperty(`--gsc-${variable}`, value);
};
exports.setStyleVariable = setStyleVariable;
const removeStyleVariable = (variable) => {
    document.documentElement.style.removeProperty(`--gsc-${variable}`);
};
exports.removeStyleVariable = removeStyleVariable;
const skipTransition = (element, isForward) => {
    if (element) {
        element.classList.toggle('forward-transition', isForward);
    }
};
exports.skipTransition = skipTransition;
const parseHTML = (html) => {
    return new DOMParser().parseFromString(html, 'text/html');
};
exports.parseHTML = parseHTML;
const replaceNodeChildren = (node, newNode) => {
    if (newNode && node) {
        node.replaceChildren(...newNode.cloneNode(true).childNodes);
    }
};
exports.replaceNodeChildren = replaceNodeChildren;


/***/ }),

/***/ 8548:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fetchConfig = void 0;
const fetchConfig = (type = 'json') => {
    return {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: `application/${type}`,
        },
    };
};
exports.fetchConfig = fetchConfig;


/***/ }),

/***/ 9331:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IntervalTimer = void 0;
const STATE = {
    idle: 'idle',
    running: 'running',
    paused: 'paused',
    resumed: 'resumed',
};
class IntervalTimer {
    state = STATE.idle;
    pausedTime = 0;
    remainingTime = 0;
    lastFireTime;
    lastPauseTime;
    callback;
    interval;
    timerId;
    resumeId;
    constructor(callback, interval) {
        this.interval = interval;
        this.callback = callback;
    }
    proxyCallback() {
        this.lastFireTime = new Date().valueOf();
        this.callback();
    }
    start() {
        this.timerId = setInterval(() => this.proxyCallback(), this.interval);
        this.lastFireTime = new Date().valueOf();
        this.state = STATE.running;
    }
    pause() {
        if (this.state !== STATE.running && this.state !== STATE.resumed) {
            return;
        }
        this.remainingTime =
            this.interval -
                (new Date().valueOf() - this.lastFireTime) +
                this.pausedTime;
        this.lastPauseTime = new Date().valueOf();
        clearInterval(this.timerId);
        clearTimeout(this.resumeId);
        this.state = STATE.paused;
    }
    resume() {
        if (this.state !== STATE.paused) {
            return;
        }
        this.pausedTime += new Date().valueOf() - this.lastPauseTime;
        this.state = STATE.resumed;
        this.resumeId = setTimeout(() => this.timeoutCallback(), this.remainingTime);
    }
    timeoutCallback() {
        if (this.state !== STATE.resumed) {
            return;
        }
        this.pausedTime = 0;
        this.proxyCallback();
        this.start();
    }
    stop() {
        if (this.state === STATE.idle) {
            return;
        }
        clearInterval(this.timerId);
        clearTimeout(this.resumeId);
        this.state = STATE.idle;
    }
    setInterval(newInterval) {
        if (this.state === STATE.running) {
            this.pause();
            this.interval = newInterval;
            this.resume();
        }
        else {
            this.interval = newInterval;
        }
    }
}
exports.IntervalTimer = IntervalTimer;


/***/ }),

/***/ 9650:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isTabKey = exports.isLeftKey = exports.isRightKey = exports.isEscKey = exports.isSpaceKey = exports.isEnterKey = void 0;
const constants_1 = __webpack_require__(3036);
const isEnterKey = (event) => {
    const key = event.key || event.keyCode;
    return (key === constants_1.KEY_CONSTS.ENTER_NUMBER_KEY || key === constants_1.KEY_CONSTS.ENTER_STRING_KEY);
};
exports.isEnterKey = isEnterKey;
const isSpaceKey = (event) => {
    const key = event.key || event.keyCode;
    return (key === constants_1.KEY_CONSTS.SPACE_NUMBER_KEY || key === constants_1.KEY_CONSTS.SPACE_STRING_KEY);
};
exports.isSpaceKey = isSpaceKey;
const isEscKey = (event) => {
    const key = event.key || event.keyCode;
    return (key === constants_1.KEY_CONSTS.ESCAPE_STRING_KEY || key === constants_1.KEY_CONSTS.ESCAPE_NUMBER_KEY);
};
exports.isEscKey = isEscKey;
const isRightKey = (event) => {
    const key = event.key || event.keyCode;
    return (key === constants_1.KEY_CONSTS.ARROW_RIGHT_NUMBER_KEY ||
        key === constants_1.KEY_CONSTS.ARROW_RIGHT_STRING_KEY);
};
exports.isRightKey = isRightKey;
const isLeftKey = (event) => {
    const key = event.key || event.keyCode;
    return (key === constants_1.KEY_CONSTS.ARROW_LEFT_NUMBER_KEY ||
        key === constants_1.KEY_CONSTS.ARROW_LEFT_STRING_KEY);
};
exports.isLeftKey = isLeftKey;
const isTabKey = (event) => {
    const key = event.key || event.keyCode;
    return key === constants_1.KEY_CONSTS.TAB_NUMBER_KEY || key === constants_1.KEY_CONSTS.TAB_STRING_KEY;
};
exports.isTabKey = isTabKey;


/***/ }),

/***/ 7322:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getTransitionInfo = exports.whenTransitionEnds = void 0;
const TRANSITION = 'transition';
const ANIMATION = 'animation';
const transitionEndEvent = 'transitionend';
const animationEndEvent = 'animationend';
const animationFrameLength = Math.ceil(1000 / 60);
const noop = () => { };
function whenTransitionEnds(el, cb) {
    const { type, timeout, propCount } = getTransitionInfo(el);
    if (!type) {
        cb();
        return noop;
    }
    const eventType = type === TRANSITION ? transitionEndEvent : animationEndEvent;
    let ended = 0;
    let timeoutId = null;
    const cleanup = () => {
        if (timeoutId) {
            window.clearTimeout(timeoutId);
            timeoutId = null;
        }
        el.removeEventListener(eventType, onEnd);
    };
    const end = () => {
        cleanup();
        cb();
    };
    const onEnd = (e) => {
        if (e.target === el) {
            if (++ended >= propCount) {
                end();
            }
        }
    };
    timeoutId = window.setTimeout(() => {
        if (ended < propCount) {
            end();
        }
    }, timeout + animationFrameLength);
    el.addEventListener(eventType, onEnd);
    return () => cleanup();
}
exports.whenTransitionEnds = whenTransitionEnds;
function getTransitionInfo(el) {
    const styles = window.getComputedStyle(el);
    const transitionDelays = (styles.transitionDelay || '').split(', ');
    const transitionDurations = (styles.transitionDuration || '').split(', ');
    const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
    const animationDelays = (styles.animationDelay || '').split(', ');
    const animationDurations = (styles.animationDuration || '').split(', ');
    const animationTimeout = getTimeout(animationDelays, animationDurations);
    const timeout = Math.max(transitionTimeout, animationTimeout);
    const type = timeout > 0
        ? transitionTimeout > animationTimeout
            ? TRANSITION
            : ANIMATION
        : null;
    const propCount = type
        ? type === TRANSITION
            ? transitionDurations.length
            : animationDurations.length
        : 0;
    return { type, timeout, propCount };
}
exports.getTransitionInfo = getTransitionInfo;
function getTimeout(delays, durations) {
    while (delays.length < durations.length) {
        delays = delays.concat(delays);
    }
    return Math.max.apply(null, durations.map((d, i) => {
        return toMs(d) + toMs(delays[i]);
    }));
}
function toMs(s) {
    return Number(s.slice(0, -1).replace(',', '.')) * 1000;
}


/***/ }),

/***/ 4083:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.stripHtml = exports.isNotThemeStore = exports.isNotIframe = exports.$elParent = exports.$list = exports.$el = exports.transitionToPromise = exports.whenDefined = exports.registerComponent = exports.upperCamelCaseToSnakeCase = exports.createPrefetchLink = exports.isCurrentPageLink = exports.isExternalLink = exports.createPortal = exports.isSafari = exports.removeCustomElementFromBody = exports.appendElementToBody = exports.getTargets = exports.getFocusTargets = exports.viewportObserver = exports.delay = exports.capitalize = void 0;
const transition_util_1 = __webpack_require__(7322);
const capitalize = (word) => {
    const firstSymbol = word.slice(0, 1);
    const restWordPart = word.slice(1);
    return firstSymbol.toUpperCase() + restWordPart;
};
exports.capitalize = capitalize;
const delay = (delay = 0) => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, delay);
    });
};
exports.delay = delay;
exports.viewportObserver = new IntersectionObserver((entries, _) => {
    entries.forEach(entry => {
        const isInViewport = entry.isIntersecting;
        const isParentHidden = entry.target.closest('[aria-hidden="true"], .hidden');
        entry.target.classList.toggle('is-in-viewport', isInViewport && !isParentHidden);
    });
});
const getFocusTargets = () => {
    const targets = [
        'button:enabled',
        'input:not([type=hidden]):enabled',
        'textarea:enabled',
        'a[href]',
        '[data-focus-trap-target]',
        '[tabindex]:not([tabindex^="-"])',
    ];
    return targets
        .map(target => `${target}:not([data-color-swatches-hidden-count]:empty):not(.hidden)`)
        .join(',');
};
exports.getFocusTargets = getFocusTargets;
const getTargets = (element, withCarouselButtons = true) => {
    const targets = (0, exports.$list)((0, exports.getFocusTargets)(), element).filter(target => withCarouselButtons
        ? target.clientWidth > 0
        : target.clientWidth > 0 && !target.hasAttribute('data-direction'));
    const firstTarget = targets[0];
    const lastTarget = targets[targets.length - 1];
    return { targets, firstTarget, lastTarget };
};
exports.getTargets = getTargets;
const appendElementToBody = customElement => {
    const customElementContainer = document.createElement('div');
    customElementContainer.classList.add('hidden');
    document.body.appendChild(customElementContainer);
    customElementContainer.appendChild(customElement);
    return customElementContainer;
};
exports.appendElementToBody = appendElementToBody;
const removeCustomElementFromBody = customElementContainer => {
    customElementContainer.remove();
};
exports.removeCustomElementFromBody = removeCustomElementFromBody;
const isSafari = () => {
    // Chrome DevTools does not complain about navigator.vendor
    return /apple/i.test(navigator.vendor);
};
exports.isSafari = isSafari;
const createPortal = (children, parent) => {
    let element = (0, exports.$el)('#Portal');
    element.appendChild(children);
    const target = parent && parent.appendChild ? parent : document.body;
    target.appendChild(element);
};
exports.createPortal = createPortal;
const isExternalLink = (href) => {
    return !href.match(/^\//) && !href.includes(window.location.host);
};
exports.isExternalLink = isExternalLink;
const isCurrentPageLink = (href) => {
    return href === window.location.href;
};
exports.isCurrentPageLink = isCurrentPageLink;
const createPrefetchLink = (href) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'prefetch');
    link.setAttribute('href', href);
    document.head.appendChild(link);
};
exports.createPrefetchLink = createPrefetchLink;
const upperCamelCaseToSnakeCase = (value) => {
    return value
        .replace(/^([A-Z])/, $1 => $1.toLowerCase())
        .replace(/([A-Z])/g, $1 => '-' + $1.toLowerCase());
};
exports.upperCamelCaseToSnakeCase = upperCamelCaseToSnakeCase;
const registerComponent = (componentClass) => {
    try {
        const name = (0, exports.upperCamelCaseToSnakeCase)(componentClass.name);
        customElements.define(name, componentClass);
    }
    catch (error) {
        console.log(`${componentClass} has not been defined`);
    }
};
exports.registerComponent = registerComponent;
const whenDefined = (componentTag) => {
    return customElements.whenDefined(componentTag);
};
exports.whenDefined = whenDefined;
const transitionToPromise = el => {
    return new Promise(resolve => {
        (0, transition_util_1.whenTransitionEnds)(el, () => {
            resolve(null);
        });
    });
};
exports.transitionToPromise = transitionToPromise;
const $el = (selector, scope = document) => {
    return scope.querySelector(selector);
};
exports.$el = $el;
const $list = (selector, scope = document) => {
    return [...scope.querySelectorAll(selector)];
};
exports.$list = $list;
const $elParent = (selector, scope = document) => {
    return scope.closest(selector);
};
exports.$elParent = $elParent;
const isNotIframe = () => {
    return window.self === window.top;
};
exports.isNotIframe = isNotIframe;
const isNotThemeStore = () => {
    return window.self === window.top || Shopify.designMode;
};
exports.isNotThemeStore = isNotThemeStore;
const stripHtml = html => {
    let tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};
exports.stripHtml = stripHtml;


/***/ }),

/***/ 7582:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __addDisposableResource: function() { return /* binding */ __addDisposableResource; },
/* harmony export */   __assign: function() { return /* binding */ __assign; },
/* harmony export */   __asyncDelegator: function() { return /* binding */ __asyncDelegator; },
/* harmony export */   __asyncGenerator: function() { return /* binding */ __asyncGenerator; },
/* harmony export */   __asyncValues: function() { return /* binding */ __asyncValues; },
/* harmony export */   __await: function() { return /* binding */ __await; },
/* harmony export */   __awaiter: function() { return /* binding */ __awaiter; },
/* harmony export */   __classPrivateFieldGet: function() { return /* binding */ __classPrivateFieldGet; },
/* harmony export */   __classPrivateFieldIn: function() { return /* binding */ __classPrivateFieldIn; },
/* harmony export */   __classPrivateFieldSet: function() { return /* binding */ __classPrivateFieldSet; },
/* harmony export */   __createBinding: function() { return /* binding */ __createBinding; },
/* harmony export */   __decorate: function() { return /* binding */ __decorate; },
/* harmony export */   __disposeResources: function() { return /* binding */ __disposeResources; },
/* harmony export */   __esDecorate: function() { return /* binding */ __esDecorate; },
/* harmony export */   __exportStar: function() { return /* binding */ __exportStar; },
/* harmony export */   __extends: function() { return /* binding */ __extends; },
/* harmony export */   __generator: function() { return /* binding */ __generator; },
/* harmony export */   __importDefault: function() { return /* binding */ __importDefault; },
/* harmony export */   __importStar: function() { return /* binding */ __importStar; },
/* harmony export */   __makeTemplateObject: function() { return /* binding */ __makeTemplateObject; },
/* harmony export */   __metadata: function() { return /* binding */ __metadata; },
/* harmony export */   __param: function() { return /* binding */ __param; },
/* harmony export */   __propKey: function() { return /* binding */ __propKey; },
/* harmony export */   __read: function() { return /* binding */ __read; },
/* harmony export */   __rest: function() { return /* binding */ __rest; },
/* harmony export */   __runInitializers: function() { return /* binding */ __runInitializers; },
/* harmony export */   __setFunctionName: function() { return /* binding */ __setFunctionName; },
/* harmony export */   __spread: function() { return /* binding */ __spread; },
/* harmony export */   __spreadArray: function() { return /* binding */ __spreadArray; },
/* harmony export */   __spreadArrays: function() { return /* binding */ __spreadArrays; },
/* harmony export */   __values: function() { return /* binding */ __values; }
/* harmony export */ });
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */

var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
  return extendStatics(d, b);
};

function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() { this.constructor = d; }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
  __assign = Object.assign || function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
  }
  return __assign.apply(this, arguments);
}

function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
              t[p[i]] = s[p[i]];
      }
  return t;
}

function __decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
  return function (target, key) { decorator(target, key, paramIndex); }
}

function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
      var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
      if (kind === "accessor") {
          if (result === void 0) continue;
          if (result === null || typeof result !== "object") throw new TypeError("Object expected");
          if (_ = accept(result.get)) descriptor.get = _;
          if (_ = accept(result.set)) descriptor.set = _;
          if (_ = accept(result.init)) initializers.unshift(_);
      }
      else if (_ = accept(result)) {
          if (kind === "field") initializers.unshift(_);
          else descriptor[key] = _;
      }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};

function __runInitializers(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};

function __propKey(x) {
  return typeof x === "symbol" ? x : "".concat(x);
};

function __setFunctionName(f, name, prefix) {
  if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
  return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};

function __metadata(metadataKey, metadataValue) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
      function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

function __generator(thisArg, body) {
  var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (g && (g = 0, op[0] && (_ = 0)), _) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];
          switch (op[0]) {
              case 0: case 1: t = op; break;
              case 4: _.label++; return { value: op[1], done: false };
              case 5: _.label++; y = op[1]; op = [0]; continue;
              case 7: op = _.ops.pop(); _.trys.pop(); continue;
              default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                  if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                  if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                  if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                  if (t[2]) _.ops.pop();
                  _.trys.pop(); continue;
          }
          op = body.call(thisArg, _);
      } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
      if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
}

var __createBinding = Object.create ? (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
  }
  Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

function __exportStar(m, o) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}

function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
      next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
      }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  }
  catch (error) { e = { error: error }; }
  finally {
      try {
          if (r && !r.done && (m = i["return"])) m.call(i);
      }
      finally { if (e) throw e.error; }
  }
  return ar;
}

/** @deprecated */
function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++)
      ar = ar.concat(__read(arguments[i]));
  return ar;
}

/** @deprecated */
function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
  for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
          r[k] = a[j];
  return r;
}

function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
      }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}

function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
  function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
  function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
  function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
  function fulfill(value) { resume("next", value); }
  function reject(value) { resume("throw", value); }
  function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
  var i, p;
  return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
  function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
  function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
  function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
  if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
  return cooked;
};

var __setModuleDefault = Object.create ? (function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
  o["default"] = v;
};

function __importStar(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  __setModuleDefault(result, mod);
  return result;
}

function __importDefault(mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

function __classPrivateFieldIn(state, receiver) {
  if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function")) throw new TypeError("Cannot use 'in' operator on non-object");
  return typeof state === "function" ? receiver === state : state.has(receiver);
}

function __addDisposableResource(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose;
    if (async) {
        if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
        dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
        if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
        dispose = value[Symbol.dispose];
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    env.stack.push({ value: value, dispose: dispose, async: async });
  }
  else if (async) {
    env.stack.push({ async: true });
  }
  return value;
}

var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function __disposeResources(env) {
  function fail(e) {
    env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
    env.hasError = true;
  }
  function next() {
    while (env.stack.length) {
      var rec = env.stack.pop();
      try {
        var result = rec.dispose && rec.dispose.call(rec.value);
        if (rec.async) return Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
      }
      catch (e) {
          fail(e);
      }
    }
    if (env.hasError) throw env.error;
  }
  return next();
}

/* harmony default export */ __webpack_exports__["default"] = ({
  __extends,
  __assign,
  __rest,
  __decorate,
  __param,
  __metadata,
  __awaiter,
  __generator,
  __createBinding,
  __exportStar,
  __values,
  __read,
  __spread,
  __spreadArrays,
  __spreadArray,
  __await,
  __asyncGenerator,
  __asyncDelegator,
  __asyncValues,
  __makeTemplateObject,
  __importStar,
  __importDefault,
  __classPrivateFieldGet,
  __classPrivateFieldSet,
  __classPrivateFieldIn,
  __addDisposableResource,
  __disposeResources,
});


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
!function() {
"use strict";
var exports = __webpack_exports__;
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
__webpack_require__(5065);
__webpack_require__(7090);
__webpack_require__(1770);
const define_components_1 = __webpack_require__(3626);
__webpack_require__(29);
if (Shopify.designMode) {
    document.documentElement.className = `${document.documentElement.className} is-editor-mode`;
}
(0, define_components_1.defineComponents)();

}();
/******/ })()
;
//# sourceMappingURL=bundle.js.map