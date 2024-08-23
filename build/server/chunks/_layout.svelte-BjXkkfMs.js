import { h as head, c as slot, a as pop, d as copy_payload, e as assign_payload, f as ensure_array_like, g as attr, i as spread_attributes, p as push, j as rest_props, v as value_or_fallback, k as store_get, u as unsubscribe_stores, l as bind_props, s as setContext, m as sanitize_props, n as spread_props, o as getContext, q as store_set } from './index2-DBlbVEXJ.js';
import { r as readable, g as get_store_value, d as derived, w as writable, a as readonly } from './index-DVbaZPnI.js';
import { d as dialogOpenState, o as onDestroy, t as tick } from './drawer.state.svelte-DY-yu2Pz.js';

let urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
let nanoid = (size = 21) => {
  let id = '';
  let i = size;
  while (i--) {
    id += urlAlphabet[(Math.random() * 64) | 0];
  }
  return id
};

/*!
* tabbable 6.2.0
* @license MIT, https://github.com/focus-trap/tabbable/blob/master/LICENSE
*/
// NOTE: separate `:not()` selectors has broader browser support than the newer
//  `:not([inert], [inert] *)` (Feb 2023)
// CAREFUL: JSDom does not support `:not([inert] *)` as a selector; using it causes
//  the entire query to fail, resulting in no nodes found, which will break a lot
//  of things... so we have to rely on JS to identify nodes inside an inert container
var candidateSelectors = ['input:not([inert])', 'select:not([inert])', 'textarea:not([inert])', 'a[href]:not([inert])', 'button:not([inert])', '[tabindex]:not(slot):not([inert])', 'audio[controls]:not([inert])', 'video[controls]:not([inert])', '[contenteditable]:not([contenteditable="false"]):not([inert])', 'details>summary:first-of-type:not([inert])', 'details:not([inert])'];
var candidateSelector = /* #__PURE__ */candidateSelectors.join(',');
var NoElement = typeof Element === 'undefined';
var matches = NoElement ? function () {} : Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
var getRootNode = !NoElement && Element.prototype.getRootNode ? function (element) {
  var _element$getRootNode;
  return element === null || element === void 0 ? void 0 : (_element$getRootNode = element.getRootNode) === null || _element$getRootNode === void 0 ? void 0 : _element$getRootNode.call(element);
} : function (element) {
  return element === null || element === void 0 ? void 0 : element.ownerDocument;
};

/**
 * Determines if a node is inert or in an inert ancestor.
 * @param {Element} [node]
 * @param {boolean} [lookUp] If true and `node` is not inert, looks up at ancestors to
 *  see if any of them are inert. If false, only `node` itself is considered.
 * @returns {boolean} True if inert itself or by way of being in an inert ancestor.
 *  False if `node` is falsy.
 */
var isInert = function isInert(node, lookUp) {
  var _node$getAttribute;
  if (lookUp === void 0) {
    lookUp = true;
  }
  // CAREFUL: JSDom does not support inert at all, so we can't use the `HTMLElement.inert`
  //  JS API property; we have to check the attribute, which can either be empty or 'true';
  //  if it's `null` (not specified) or 'false', it's an active element
  var inertAtt = node === null || node === void 0 ? void 0 : (_node$getAttribute = node.getAttribute) === null || _node$getAttribute === void 0 ? void 0 : _node$getAttribute.call(node, 'inert');
  var inert = inertAtt === '' || inertAtt === 'true';

  // NOTE: this could also be handled with `node.matches('[inert], :is([inert] *)')`
  //  if it weren't for `matches()` not being a function on shadow roots; the following
  //  code works for any kind of node
  // CAREFUL: JSDom does not appear to support certain selectors like `:not([inert] *)`
  //  so it likely would not support `:is([inert] *)` either...
  var result = inert || lookUp && node && isInert(node.parentNode); // recursive

  return result;
};

/**
 * Determines if a node's content is editable.
 * @param {Element} [node]
 * @returns True if it's content-editable; false if it's not or `node` is falsy.
 */
var isContentEditable = function isContentEditable(node) {
  var _node$getAttribute2;
  // CAREFUL: JSDom does not support the `HTMLElement.isContentEditable` API so we have
  //  to use the attribute directly to check for this, which can either be empty or 'true';
  //  if it's `null` (not specified) or 'false', it's a non-editable element
  var attValue = node === null || node === void 0 ? void 0 : (_node$getAttribute2 = node.getAttribute) === null || _node$getAttribute2 === void 0 ? void 0 : _node$getAttribute2.call(node, 'contenteditable');
  return attValue === '' || attValue === 'true';
};

/**
 * @param {Element} el container to check in
 * @param {boolean} includeContainer add container to check
 * @param {(node: Element) => boolean} filter filter candidates
 * @returns {Element[]}
 */
var getCandidates = function getCandidates(el, includeContainer, filter) {
  // even if `includeContainer=false`, we still have to check it for inertness because
  //  if it's inert, all its children are inert
  if (isInert(el)) {
    return [];
  }
  var candidates = Array.prototype.slice.apply(el.querySelectorAll(candidateSelector));
  if (includeContainer && matches.call(el, candidateSelector)) {
    candidates.unshift(el);
  }
  candidates = candidates.filter(filter);
  return candidates;
};

/**
 * @callback GetShadowRoot
 * @param {Element} element to check for shadow root
 * @returns {ShadowRoot|boolean} ShadowRoot if available or boolean indicating if a shadowRoot is attached but not available.
 */

/**
 * @callback ShadowRootFilter
 * @param {Element} shadowHostNode the element which contains shadow content
 * @returns {boolean} true if a shadow root could potentially contain valid candidates.
 */

/**
 * @typedef {Object} CandidateScope
 * @property {Element} scopeParent contains inner candidates
 * @property {Element[]} candidates list of candidates found in the scope parent
 */

/**
 * @typedef {Object} IterativeOptions
 * @property {GetShadowRoot|boolean} getShadowRoot true if shadow support is enabled; falsy if not;
 *  if a function, implies shadow support is enabled and either returns the shadow root of an element
 *  or a boolean stating if it has an undisclosed shadow root
 * @property {(node: Element) => boolean} filter filter candidates
 * @property {boolean} flatten if true then result will flatten any CandidateScope into the returned list
 * @property {ShadowRootFilter} shadowRootFilter filter shadow roots;
 */

/**
 * @param {Element[]} elements list of element containers to match candidates from
 * @param {boolean} includeContainer add container list to check
 * @param {IterativeOptions} options
 * @returns {Array.<Element|CandidateScope>}
 */
var getCandidatesIteratively = function getCandidatesIteratively(elements, includeContainer, options) {
  var candidates = [];
  var elementsToCheck = Array.from(elements);
  while (elementsToCheck.length) {
    var element = elementsToCheck.shift();
    if (isInert(element, false)) {
      // no need to look up since we're drilling down
      // anything inside this container will also be inert
      continue;
    }
    if (element.tagName === 'SLOT') {
      // add shadow dom slot scope (slot itself cannot be focusable)
      var assigned = element.assignedElements();
      var content = assigned.length ? assigned : element.children;
      var nestedCandidates = getCandidatesIteratively(content, true, options);
      if (options.flatten) {
        candidates.push.apply(candidates, nestedCandidates);
      } else {
        candidates.push({
          scopeParent: element,
          candidates: nestedCandidates
        });
      }
    } else {
      // check candidate element
      var validCandidate = matches.call(element, candidateSelector);
      if (validCandidate && options.filter(element) && (includeContainer || !elements.includes(element))) {
        candidates.push(element);
      }

      // iterate over shadow content if possible
      var shadowRoot = element.shadowRoot ||
      // check for an undisclosed shadow
      typeof options.getShadowRoot === 'function' && options.getShadowRoot(element);

      // no inert look up because we're already drilling down and checking for inertness
      //  on the way down, so all containers to this root node should have already been
      //  vetted as non-inert
      var validShadowRoot = !isInert(shadowRoot, false) && (!options.shadowRootFilter || options.shadowRootFilter(element));
      if (shadowRoot && validShadowRoot) {
        // add shadow dom scope IIF a shadow root node was given; otherwise, an undisclosed
        //  shadow exists, so look at light dom children as fallback BUT create a scope for any
        //  child candidates found because they're likely slotted elements (elements that are
        //  children of the web component element (which has the shadow), in the light dom, but
        //  slotted somewhere _inside_ the undisclosed shadow) -- the scope is created below,
        //  _after_ we return from this recursive call
        var _nestedCandidates = getCandidatesIteratively(shadowRoot === true ? element.children : shadowRoot.children, true, options);
        if (options.flatten) {
          candidates.push.apply(candidates, _nestedCandidates);
        } else {
          candidates.push({
            scopeParent: element,
            candidates: _nestedCandidates
          });
        }
      } else {
        // there's not shadow so just dig into the element's (light dom) children
        //  __without__ giving the element special scope treatment
        elementsToCheck.unshift.apply(elementsToCheck, element.children);
      }
    }
  }
  return candidates;
};

/**
 * @private
 * Determines if the node has an explicitly specified `tabindex` attribute.
 * @param {HTMLElement} node
 * @returns {boolean} True if so; false if not.
 */
var hasTabIndex = function hasTabIndex(node) {
  return !isNaN(parseInt(node.getAttribute('tabindex'), 10));
};

/**
 * Determine the tab index of a given node.
 * @param {HTMLElement} node
 * @returns {number} Tab order (negative, 0, or positive number).
 * @throws {Error} If `node` is falsy.
 */
var getTabIndex = function getTabIndex(node) {
  if (!node) {
    throw new Error('No node provided');
  }
  if (node.tabIndex < 0) {
    // in Chrome, <details/>, <audio controls/> and <video controls/> elements get a default
    // `tabIndex` of -1 when the 'tabindex' attribute isn't specified in the DOM,
    // yet they are still part of the regular tab order; in FF, they get a default
    // `tabIndex` of 0; since Chrome still puts those elements in the regular tab
    // order, consider their tab index to be 0.
    // Also browsers do not return `tabIndex` correctly for contentEditable nodes;
    // so if they don't have a tabindex attribute specifically set, assume it's 0.
    if ((/^(AUDIO|VIDEO|DETAILS)$/.test(node.tagName) || isContentEditable(node)) && !hasTabIndex(node)) {
      return 0;
    }
  }
  return node.tabIndex;
};

/**
 * Determine the tab index of a given node __for sort order purposes__.
 * @param {HTMLElement} node
 * @param {boolean} [isScope] True for a custom element with shadow root or slot that, by default,
 *  has tabIndex -1, but needs to be sorted by document order in order for its content to be
 *  inserted into the correct sort position.
 * @returns {number} Tab order (negative, 0, or positive number).
 */
var getSortOrderTabIndex = function getSortOrderTabIndex(node, isScope) {
  var tabIndex = getTabIndex(node);
  if (tabIndex < 0 && isScope && !hasTabIndex(node)) {
    return 0;
  }
  return tabIndex;
};
var sortOrderedTabbables = function sortOrderedTabbables(a, b) {
  return a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex;
};
var isInput$1 = function isInput(node) {
  return node.tagName === 'INPUT';
};
var isHiddenInput = function isHiddenInput(node) {
  return isInput$1(node) && node.type === 'hidden';
};
var isDetailsWithSummary = function isDetailsWithSummary(node) {
  var r = node.tagName === 'DETAILS' && Array.prototype.slice.apply(node.children).some(function (child) {
    return child.tagName === 'SUMMARY';
  });
  return r;
};
var getCheckedRadio = function getCheckedRadio(nodes, form) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].checked && nodes[i].form === form) {
      return nodes[i];
    }
  }
};
var isTabbableRadio = function isTabbableRadio(node) {
  if (!node.name) {
    return true;
  }
  var radioScope = node.form || getRootNode(node);
  var queryRadios = function queryRadios(name) {
    return radioScope.querySelectorAll('input[type="radio"][name="' + name + '"]');
  };
  var radioSet;
  if (typeof window !== 'undefined' && typeof window.CSS !== 'undefined' && typeof window.CSS.escape === 'function') {
    radioSet = queryRadios(window.CSS.escape(node.name));
  } else {
    try {
      radioSet = queryRadios(node.name);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s', err.message);
      return false;
    }
  }
  var checked = getCheckedRadio(radioSet, node.form);
  return !checked || checked === node;
};
var isRadio = function isRadio(node) {
  return isInput$1(node) && node.type === 'radio';
};
var isNonTabbableRadio = function isNonTabbableRadio(node) {
  return isRadio(node) && !isTabbableRadio(node);
};

// determines if a node is ultimately attached to the window's document
var isNodeAttached = function isNodeAttached(node) {
  var _nodeRoot;
  // The root node is the shadow root if the node is in a shadow DOM; some document otherwise
  //  (but NOT _the_ document; see second 'If' comment below for more).
  // If rootNode is shadow root, it'll have a host, which is the element to which the shadow
  //  is attached, and the one we need to check if it's in the document or not (because the
  //  shadow, and all nodes it contains, is never considered in the document since shadows
  //  behave like self-contained DOMs; but if the shadow's HOST, which is part of the document,
  //  is hidden, or is not in the document itself but is detached, it will affect the shadow's
  //  visibility, including all the nodes it contains). The host could be any normal node,
  //  or a custom element (i.e. web component). Either way, that's the one that is considered
  //  part of the document, not the shadow root, nor any of its children (i.e. the node being
  //  tested).
  // To further complicate things, we have to look all the way up until we find a shadow HOST
  //  that is attached (or find none) because the node might be in nested shadows...
  // If rootNode is not a shadow root, it won't have a host, and so rootNode should be the
  //  document (per the docs) and while it's a Document-type object, that document does not
  //  appear to be the same as the node's `ownerDocument` for some reason, so it's safer
  //  to ignore the rootNode at this point, and use `node.ownerDocument`. Otherwise,
  //  using `rootNode.contains(node)` will _always_ be true we'll get false-positives when
  //  node is actually detached.
  // NOTE: If `nodeRootHost` or `node` happens to be the `document` itself (which is possible
  //  if a tabbable/focusable node was quickly added to the DOM, focused, and then removed
  //  from the DOM as in https://github.com/focus-trap/focus-trap-react/issues/905), then
  //  `ownerDocument` will be `null`, hence the optional chaining on it.
  var nodeRoot = node && getRootNode(node);
  var nodeRootHost = (_nodeRoot = nodeRoot) === null || _nodeRoot === void 0 ? void 0 : _nodeRoot.host;

  // in some cases, a detached node will return itself as the root instead of a document or
  //  shadow root object, in which case, we shouldn't try to look further up the host chain
  var attached = false;
  if (nodeRoot && nodeRoot !== node) {
    var _nodeRootHost, _nodeRootHost$ownerDo, _node$ownerDocument;
    attached = !!((_nodeRootHost = nodeRootHost) !== null && _nodeRootHost !== void 0 && (_nodeRootHost$ownerDo = _nodeRootHost.ownerDocument) !== null && _nodeRootHost$ownerDo !== void 0 && _nodeRootHost$ownerDo.contains(nodeRootHost) || node !== null && node !== void 0 && (_node$ownerDocument = node.ownerDocument) !== null && _node$ownerDocument !== void 0 && _node$ownerDocument.contains(node));
    while (!attached && nodeRootHost) {
      var _nodeRoot2, _nodeRootHost2, _nodeRootHost2$ownerD;
      // since it's not attached and we have a root host, the node MUST be in a nested shadow DOM,
      //  which means we need to get the host's host and check if that parent host is contained
      //  in (i.e. attached to) the document
      nodeRoot = getRootNode(nodeRootHost);
      nodeRootHost = (_nodeRoot2 = nodeRoot) === null || _nodeRoot2 === void 0 ? void 0 : _nodeRoot2.host;
      attached = !!((_nodeRootHost2 = nodeRootHost) !== null && _nodeRootHost2 !== void 0 && (_nodeRootHost2$ownerD = _nodeRootHost2.ownerDocument) !== null && _nodeRootHost2$ownerD !== void 0 && _nodeRootHost2$ownerD.contains(nodeRootHost));
    }
  }
  return attached;
};
var isZeroArea = function isZeroArea(node) {
  var _node$getBoundingClie = node.getBoundingClientRect(),
    width = _node$getBoundingClie.width,
    height = _node$getBoundingClie.height;
  return width === 0 && height === 0;
};
var isHidden = function isHidden(node, _ref) {
  var displayCheck = _ref.displayCheck,
    getShadowRoot = _ref.getShadowRoot;
  // NOTE: visibility will be `undefined` if node is detached from the document
  //  (see notes about this further down), which means we will consider it visible
  //  (this is legacy behavior from a very long way back)
  // NOTE: we check this regardless of `displayCheck="none"` because this is a
  //  _visibility_ check, not a _display_ check
  if (getComputedStyle(node).visibility === 'hidden') {
    return true;
  }
  var isDirectSummary = matches.call(node, 'details>summary:first-of-type');
  var nodeUnderDetails = isDirectSummary ? node.parentElement : node;
  if (matches.call(nodeUnderDetails, 'details:not([open]) *')) {
    return true;
  }
  if (!displayCheck || displayCheck === 'full' || displayCheck === 'legacy-full') {
    if (typeof getShadowRoot === 'function') {
      // figure out if we should consider the node to be in an undisclosed shadow and use the
      //  'non-zero-area' fallback
      var originalNode = node;
      while (node) {
        var parentElement = node.parentElement;
        var rootNode = getRootNode(node);
        if (parentElement && !parentElement.shadowRoot && getShadowRoot(parentElement) === true // check if there's an undisclosed shadow
        ) {
          // node has an undisclosed shadow which means we can only treat it as a black box, so we
          //  fall back to a non-zero-area test
          return isZeroArea(node);
        } else if (node.assignedSlot) {
          // iterate up slot
          node = node.assignedSlot;
        } else if (!parentElement && rootNode !== node.ownerDocument) {
          // cross shadow boundary
          node = rootNode.host;
        } else {
          // iterate up normal dom
          node = parentElement;
        }
      }
      node = originalNode;
    }
    // else, `getShadowRoot` might be true, but all that does is enable shadow DOM support
    //  (i.e. it does not also presume that all nodes might have undisclosed shadows); or
    //  it might be a falsy value, which means shadow DOM support is disabled

    // Since we didn't find it sitting in an undisclosed shadow (or shadows are disabled)
    //  now we can just test to see if it would normally be visible or not, provided it's
    //  attached to the main document.
    // NOTE: We must consider case where node is inside a shadow DOM and given directly to
    //  `isTabbable()` or `isFocusable()` -- regardless of `getShadowRoot` option setting.

    if (isNodeAttached(node)) {
      // this works wherever the node is: if there's at least one client rect, it's
      //  somehow displayed; it also covers the CSS 'display: contents' case where the
      //  node itself is hidden in place of its contents; and there's no need to search
      //  up the hierarchy either
      return !node.getClientRects().length;
    }

    // Else, the node isn't attached to the document, which means the `getClientRects()`
    //  API will __always__ return zero rects (this can happen, for example, if React
    //  is used to render nodes onto a detached tree, as confirmed in this thread:
    //  https://github.com/facebook/react/issues/9117#issuecomment-284228870)
    //
    // It also means that even window.getComputedStyle(node).display will return `undefined`
    //  because styles are only computed for nodes that are in the document.
    //
    // NOTE: THIS HAS BEEN THE CASE FOR YEARS. It is not new, nor is it caused by tabbable
    //  somehow. Though it was never stated officially, anyone who has ever used tabbable
    //  APIs on nodes in detached containers has actually implicitly used tabbable in what
    //  was later (as of v5.2.0 on Apr 9, 2021) called `displayCheck="none"` mode -- essentially
    //  considering __everything__ to be visible because of the innability to determine styles.
    //
    // v6.0.0: As of this major release, the default 'full' option __no longer treats detached
    //  nodes as visible with the 'none' fallback.__
    if (displayCheck !== 'legacy-full') {
      return true; // hidden
    }
    // else, fallback to 'none' mode and consider the node visible
  } else if (displayCheck === 'non-zero-area') {
    // NOTE: Even though this tests that the node's client rect is non-zero to determine
    //  whether it's displayed, and that a detached node will __always__ have a zero-area
    //  client rect, we don't special-case for whether the node is attached or not. In
    //  this mode, we do want to consider nodes that have a zero area to be hidden at all
    //  times, and that includes attached or not.
    return isZeroArea(node);
  }

  // visible, as far as we can tell, or per current `displayCheck=none` mode, we assume
  //  it's visible
  return false;
};

// form fields (nested) inside a disabled fieldset are not focusable/tabbable
//  unless they are in the _first_ <legend> element of the top-most disabled
//  fieldset
var isDisabledFromFieldset = function isDisabledFromFieldset(node) {
  if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(node.tagName)) {
    var parentNode = node.parentElement;
    // check if `node` is contained in a disabled <fieldset>
    while (parentNode) {
      if (parentNode.tagName === 'FIELDSET' && parentNode.disabled) {
        // look for the first <legend> among the children of the disabled <fieldset>
        for (var i = 0; i < parentNode.children.length; i++) {
          var child = parentNode.children.item(i);
          // when the first <legend> (in document order) is found
          if (child.tagName === 'LEGEND') {
            // if its parent <fieldset> is not nested in another disabled <fieldset>,
            // return whether `node` is a descendant of its first <legend>
            return matches.call(parentNode, 'fieldset[disabled] *') ? true : !child.contains(node);
          }
        }
        // the disabled <fieldset> containing `node` has no <legend>
        return true;
      }
      parentNode = parentNode.parentElement;
    }
  }

  // else, node's tabbable/focusable state should not be affected by a fieldset's
  //  enabled/disabled state
  return false;
};
var isNodeMatchingSelectorFocusable = function isNodeMatchingSelectorFocusable(options, node) {
  if (node.disabled ||
  // we must do an inert look up to filter out any elements inside an inert ancestor
  //  because we're limited in the type of selectors we can use in JSDom (see related
  //  note related to `candidateSelectors`)
  isInert(node) || isHiddenInput(node) || isHidden(node, options) ||
  // For a details element with a summary, the summary element gets the focus
  isDetailsWithSummary(node) || isDisabledFromFieldset(node)) {
    return false;
  }
  return true;
};
var isNodeMatchingSelectorTabbable = function isNodeMatchingSelectorTabbable(options, node) {
  if (isNonTabbableRadio(node) || getTabIndex(node) < 0 || !isNodeMatchingSelectorFocusable(options, node)) {
    return false;
  }
  return true;
};
var isValidShadowRootTabbable = function isValidShadowRootTabbable(shadowHostNode) {
  var tabIndex = parseInt(shadowHostNode.getAttribute('tabindex'), 10);
  if (isNaN(tabIndex) || tabIndex >= 0) {
    return true;
  }
  // If a custom element has an explicit negative tabindex,
  // browsers will not allow tab targeting said element's children.
  return false;
};

/**
 * @param {Array.<Element|CandidateScope>} candidates
 * @returns Element[]
 */
var sortByOrder = function sortByOrder(candidates) {
  var regularTabbables = [];
  var orderedTabbables = [];
  candidates.forEach(function (item, i) {
    var isScope = !!item.scopeParent;
    var element = isScope ? item.scopeParent : item;
    var candidateTabindex = getSortOrderTabIndex(element, isScope);
    var elements = isScope ? sortByOrder(item.candidates) : element;
    if (candidateTabindex === 0) {
      isScope ? regularTabbables.push.apply(regularTabbables, elements) : regularTabbables.push(element);
    } else {
      orderedTabbables.push({
        documentOrder: i,
        tabIndex: candidateTabindex,
        item: item,
        isScope: isScope,
        content: elements
      });
    }
  });
  return orderedTabbables.sort(sortOrderedTabbables).reduce(function (acc, sortable) {
    sortable.isScope ? acc.push.apply(acc, sortable.content) : acc.push(sortable.content);
    return acc;
  }, []).concat(regularTabbables);
};
var tabbable = function tabbable(container, options) {
  options = options || {};
  var candidates;
  if (options.getShadowRoot) {
    candidates = getCandidatesIteratively([container], options.includeContainer, {
      filter: isNodeMatchingSelectorTabbable.bind(null, options),
      flatten: false,
      getShadowRoot: options.getShadowRoot,
      shadowRootFilter: isValidShadowRootTabbable
    });
  } else {
    candidates = getCandidates(container, options.includeContainer, isNodeMatchingSelectorTabbable.bind(null, options));
  }
  return sortByOrder(candidates);
};
var focusable = function focusable(container, options) {
  options = options || {};
  var candidates;
  if (options.getShadowRoot) {
    candidates = getCandidatesIteratively([container], options.includeContainer, {
      filter: isNodeMatchingSelectorFocusable.bind(null, options),
      flatten: true,
      getShadowRoot: options.getShadowRoot
    });
  } else {
    candidates = getCandidates(container, options.includeContainer, isNodeMatchingSelectorFocusable.bind(null, options));
  }
  return candidates;
};
var isTabbable = function isTabbable(node, options) {
  options = options || {};
  if (!node) {
    throw new Error('No node provided');
  }
  if (matches.call(node, candidateSelector) === false) {
    return false;
  }
  return isNodeMatchingSelectorTabbable(options, node);
};
var focusableCandidateSelector = /* #__PURE__ */candidateSelectors.concat('iframe').join(',');
var isFocusable = function isFocusable(node, options) {
  options = options || {};
  if (!node) {
    throw new Error('No node provided');
  }
  if (matches.call(node, focusableCandidateSelector) === false) {
    return false;
  }
  return isNodeMatchingSelectorFocusable(options, node);
};

/*!
* focus-trap 7.5.4
* @license MIT, https://github.com/focus-trap/focus-trap/blob/master/LICENSE
*/

function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}

var activeFocusTraps = {
  activateTrap: function activateTrap(trapStack, trap) {
    if (trapStack.length > 0) {
      var activeTrap = trapStack[trapStack.length - 1];
      if (activeTrap !== trap) {
        activeTrap.pause();
      }
    }
    var trapIndex = trapStack.indexOf(trap);
    if (trapIndex === -1) {
      trapStack.push(trap);
    } else {
      // move this existing trap to the front of the queue
      trapStack.splice(trapIndex, 1);
      trapStack.push(trap);
    }
  },
  deactivateTrap: function deactivateTrap(trapStack, trap) {
    var trapIndex = trapStack.indexOf(trap);
    if (trapIndex !== -1) {
      trapStack.splice(trapIndex, 1);
    }
    if (trapStack.length > 0) {
      trapStack[trapStack.length - 1].unpause();
    }
  }
};
var isSelectableInput = function isSelectableInput(node) {
  return node.tagName && node.tagName.toLowerCase() === 'input' && typeof node.select === 'function';
};
var isEscapeEvent = function isEscapeEvent(e) {
  return (e === null || e === void 0 ? void 0 : e.key) === 'Escape' || (e === null || e === void 0 ? void 0 : e.key) === 'Esc' || (e === null || e === void 0 ? void 0 : e.keyCode) === 27;
};
var isTabEvent = function isTabEvent(e) {
  return (e === null || e === void 0 ? void 0 : e.key) === 'Tab' || (e === null || e === void 0 ? void 0 : e.keyCode) === 9;
};

// checks for TAB by default
var isKeyForward = function isKeyForward(e) {
  return isTabEvent(e) && !e.shiftKey;
};

// checks for SHIFT+TAB by default
var isKeyBackward = function isKeyBackward(e) {
  return isTabEvent(e) && e.shiftKey;
};
var delay = function delay(fn) {
  return setTimeout(fn, 0);
};

// Array.find/findIndex() are not supported on IE; this replicates enough
//  of Array.findIndex() for our needs
var findIndex = function findIndex(arr, fn) {
  var idx = -1;
  arr.every(function (value, i) {
    if (fn(value)) {
      idx = i;
      return false; // break
    }

    return true; // next
  });

  return idx;
};

/**
 * Get an option's value when it could be a plain value, or a handler that provides
 *  the value.
 * @param {*} value Option's value to check.
 * @param {...*} [params] Any parameters to pass to the handler, if `value` is a function.
 * @returns {*} The `value`, or the handler's returned value.
 */
var valueOrHandler = function valueOrHandler(value) {
  for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    params[_key - 1] = arguments[_key];
  }
  return typeof value === 'function' ? value.apply(void 0, params) : value;
};
var getActualTarget = function getActualTarget(event) {
  // NOTE: If the trap is _inside_ a shadow DOM, event.target will always be the
  //  shadow host. However, event.target.composedPath() will be an array of
  //  nodes "clicked" from inner-most (the actual element inside the shadow) to
  //  outer-most (the host HTML document). If we have access to composedPath(),
  //  then use its first element; otherwise, fall back to event.target (and
  //  this only works for an _open_ shadow DOM; otherwise,
  //  composedPath()[0] === event.target always).
  return event.target.shadowRoot && typeof event.composedPath === 'function' ? event.composedPath()[0] : event.target;
};

// NOTE: this must be _outside_ `createFocusTrap()` to make sure all traps in this
//  current instance use the same stack if `userOptions.trapStack` isn't specified
var internalTrapStack = [];
var createFocusTrap$1 = function createFocusTrap(elements, userOptions) {
  // SSR: a live trap shouldn't be created in this type of environment so this
  //  should be safe code to execute if the `document` option isn't specified
  var doc = (userOptions === null || userOptions === void 0 ? void 0 : userOptions.document) || document;
  var trapStack = (userOptions === null || userOptions === void 0 ? void 0 : userOptions.trapStack) || internalTrapStack;
  var config = _objectSpread2({
    returnFocusOnDeactivate: true,
    escapeDeactivates: true,
    delayInitialFocus: true,
    isKeyForward: isKeyForward,
    isKeyBackward: isKeyBackward
  }, userOptions);
  var state = {
    // containers given to createFocusTrap()
    // @type {Array<HTMLElement>}
    containers: [],
    // list of objects identifying tabbable nodes in `containers` in the trap
    // NOTE: it's possible that a group has no tabbable nodes if nodes get removed while the trap
    //  is active, but the trap should never get to a state where there isn't at least one group
    //  with at least one tabbable node in it (that would lead to an error condition that would
    //  result in an error being thrown)
    // @type {Array<{
    //   container: HTMLElement,
    //   tabbableNodes: Array<HTMLElement>, // empty if none
    //   focusableNodes: Array<HTMLElement>, // empty if none
    //   posTabIndexesFound: boolean,
    //   firstTabbableNode: HTMLElement|undefined,
    //   lastTabbableNode: HTMLElement|undefined,
    //   firstDomTabbableNode: HTMLElement|undefined,
    //   lastDomTabbableNode: HTMLElement|undefined,
    //   nextTabbableNode: (node: HTMLElement, forward: boolean) => HTMLElement|undefined
    // }>}
    containerGroups: [],
    // same order/length as `containers` list

    // references to objects in `containerGroups`, but only those that actually have
    //  tabbable nodes in them
    // NOTE: same order as `containers` and `containerGroups`, but __not necessarily__
    //  the same length
    tabbableGroups: [],
    nodeFocusedBeforeActivation: null,
    mostRecentlyFocusedNode: null,
    active: false,
    paused: false,
    // timer ID for when delayInitialFocus is true and initial focus in this trap
    //  has been delayed during activation
    delayInitialFocusTimer: undefined,
    // the most recent KeyboardEvent for the configured nav key (typically [SHIFT+]TAB), if any
    recentNavEvent: undefined
  };
  var trap; // eslint-disable-line prefer-const -- some private functions reference it, and its methods reference private functions, so we must declare here and define later

  /**
   * Gets a configuration option value.
   * @param {Object|undefined} configOverrideOptions If true, and option is defined in this set,
   *  value will be taken from this object. Otherwise, value will be taken from base configuration.
   * @param {string} optionName Name of the option whose value is sought.
   * @param {string|undefined} [configOptionName] Name of option to use __instead of__ `optionName`
   *  IIF `configOverrideOptions` is not defined. Otherwise, `optionName` is used.
   */
  var getOption = function getOption(configOverrideOptions, optionName, configOptionName) {
    return configOverrideOptions && configOverrideOptions[optionName] !== undefined ? configOverrideOptions[optionName] : config[configOptionName || optionName];
  };

  /**
   * Finds the index of the container that contains the element.
   * @param {HTMLElement} element
   * @param {Event} [event] If available, and `element` isn't directly found in any container,
   *  the event's composed path is used to see if includes any known trap containers in the
   *  case where the element is inside a Shadow DOM.
   * @returns {number} Index of the container in either `state.containers` or
   *  `state.containerGroups` (the order/length of these lists are the same); -1
   *  if the element isn't found.
   */
  var findContainerIndex = function findContainerIndex(element, event) {
    var composedPath = typeof (event === null || event === void 0 ? void 0 : event.composedPath) === 'function' ? event.composedPath() : undefined;
    // NOTE: search `containerGroups` because it's possible a group contains no tabbable
    //  nodes, but still contains focusable nodes (e.g. if they all have `tabindex=-1`)
    //  and we still need to find the element in there
    return state.containerGroups.findIndex(function (_ref) {
      var container = _ref.container,
        tabbableNodes = _ref.tabbableNodes;
      return container.contains(element) || ( // fall back to explicit tabbable search which will take into consideration any
      //  web components if the `tabbableOptions.getShadowRoot` option was used for
      //  the trap, enabling shadow DOM support in tabbable (`Node.contains()` doesn't
      //  look inside web components even if open)
      composedPath === null || composedPath === void 0 ? void 0 : composedPath.includes(container)) || tabbableNodes.find(function (node) {
        return node === element;
      });
    });
  };

  /**
   * Gets the node for the given option, which is expected to be an option that
   *  can be either a DOM node, a string that is a selector to get a node, `false`
   *  (if a node is explicitly NOT given), or a function that returns any of these
   *  values.
   * @param {string} optionName
   * @returns {undefined | false | HTMLElement | SVGElement} Returns
   *  `undefined` if the option is not specified; `false` if the option
   *  resolved to `false` (node explicitly not given); otherwise, the resolved
   *  DOM node.
   * @throws {Error} If the option is set, not `false`, and is not, or does not
   *  resolve to a node.
   */
  var getNodeForOption = function getNodeForOption(optionName) {
    var optionValue = config[optionName];
    if (typeof optionValue === 'function') {
      for (var _len2 = arguments.length, params = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        params[_key2 - 1] = arguments[_key2];
      }
      optionValue = optionValue.apply(void 0, params);
    }
    if (optionValue === true) {
      optionValue = undefined; // use default value
    }

    if (!optionValue) {
      if (optionValue === undefined || optionValue === false) {
        return optionValue;
      }
      // else, empty string (invalid), null (invalid), 0 (invalid)

      throw new Error("`".concat(optionName, "` was specified but was not a node, or did not return a node"));
    }
    var node = optionValue; // could be HTMLElement, SVGElement, or non-empty string at this point

    if (typeof optionValue === 'string') {
      node = doc.querySelector(optionValue); // resolve to node, or null if fails
      if (!node) {
        throw new Error("`".concat(optionName, "` as selector refers to no known node"));
      }
    }
    return node;
  };
  var getInitialFocusNode = function getInitialFocusNode() {
    var node = getNodeForOption('initialFocus');

    // false explicitly indicates we want no initialFocus at all
    if (node === false) {
      return false;
    }
    if (node === undefined || !isFocusable(node, config.tabbableOptions)) {
      // option not specified nor focusable: use fallback options
      if (findContainerIndex(doc.activeElement) >= 0) {
        node = doc.activeElement;
      } else {
        var firstTabbableGroup = state.tabbableGroups[0];
        var firstTabbableNode = firstTabbableGroup && firstTabbableGroup.firstTabbableNode;

        // NOTE: `fallbackFocus` option function cannot return `false` (not supported)
        node = firstTabbableNode || getNodeForOption('fallbackFocus');
      }
    }
    if (!node) {
      throw new Error('Your focus-trap needs to have at least one focusable element');
    }
    return node;
  };
  var updateTabbableNodes = function updateTabbableNodes() {
    state.containerGroups = state.containers.map(function (container) {
      var tabbableNodes = tabbable(container, config.tabbableOptions);

      // NOTE: if we have tabbable nodes, we must have focusable nodes; focusable nodes
      //  are a superset of tabbable nodes since nodes with negative `tabindex` attributes
      //  are focusable but not tabbable
      var focusableNodes = focusable(container, config.tabbableOptions);
      var firstTabbableNode = tabbableNodes.length > 0 ? tabbableNodes[0] : undefined;
      var lastTabbableNode = tabbableNodes.length > 0 ? tabbableNodes[tabbableNodes.length - 1] : undefined;
      var firstDomTabbableNode = focusableNodes.find(function (node) {
        return isTabbable(node);
      });
      var lastDomTabbableNode = focusableNodes.slice().reverse().find(function (node) {
        return isTabbable(node);
      });
      var posTabIndexesFound = !!tabbableNodes.find(function (node) {
        return getTabIndex(node) > 0;
      });
      return {
        container: container,
        tabbableNodes: tabbableNodes,
        focusableNodes: focusableNodes,
        /** True if at least one node with positive `tabindex` was found in this container. */
        posTabIndexesFound: posTabIndexesFound,
        /** First tabbable node in container, __tabindex__ order; `undefined` if none. */
        firstTabbableNode: firstTabbableNode,
        /** Last tabbable node in container, __tabindex__ order; `undefined` if none. */
        lastTabbableNode: lastTabbableNode,
        // NOTE: DOM order is NOT NECESSARILY "document position" order, but figuring that out
        //  would require more than just https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
        //  because that API doesn't work with Shadow DOM as well as it should (@see
        //  https://github.com/whatwg/dom/issues/320) and since this first/last is only needed, so far,
        //  to address an edge case related to positive tabindex support, this seems like a much easier,
        //  "close enough most of the time" alternative for positive tabindexes which should generally
        //  be avoided anyway...
        /** First tabbable node in container, __DOM__ order; `undefined` if none. */
        firstDomTabbableNode: firstDomTabbableNode,
        /** Last tabbable node in container, __DOM__ order; `undefined` if none. */
        lastDomTabbableNode: lastDomTabbableNode,
        /**
         * Finds the __tabbable__ node that follows the given node in the specified direction,
         *  in this container, if any.
         * @param {HTMLElement} node
         * @param {boolean} [forward] True if going in forward tab order; false if going
         *  in reverse.
         * @returns {HTMLElement|undefined} The next tabbable node, if any.
         */
        nextTabbableNode: function nextTabbableNode(node) {
          var forward = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
          var nodeIdx = tabbableNodes.indexOf(node);
          if (nodeIdx < 0) {
            // either not tabbable nor focusable, or was focused but not tabbable (negative tabindex):
            //  since `node` should at least have been focusable, we assume that's the case and mimic
            //  what browsers do, which is set focus to the next node in __document position order__,
            //  regardless of positive tabindexes, if any -- and for reasons explained in the NOTE
            //  above related to `firstDomTabbable` and `lastDomTabbable` properties, we fall back to
            //  basic DOM order
            if (forward) {
              return focusableNodes.slice(focusableNodes.indexOf(node) + 1).find(function (el) {
                return isTabbable(el);
              });
            }
            return focusableNodes.slice(0, focusableNodes.indexOf(node)).reverse().find(function (el) {
              return isTabbable(el);
            });
          }
          return tabbableNodes[nodeIdx + (forward ? 1 : -1)];
        }
      };
    });
    state.tabbableGroups = state.containerGroups.filter(function (group) {
      return group.tabbableNodes.length > 0;
    });

    // throw if no groups have tabbable nodes and we don't have a fallback focus node either
    if (state.tabbableGroups.length <= 0 && !getNodeForOption('fallbackFocus') // returning false not supported for this option
    ) {
      throw new Error('Your focus-trap must have at least one container with at least one tabbable node in it at all times');
    }

    // NOTE: Positive tabindexes are only properly supported in single-container traps because
    //  doing it across multiple containers where tabindexes could be all over the place
    //  would require Tabbable to support multiple containers, would require additional
    //  specialized Shadow DOM support, and would require Tabbable's multi-container support
    //  to look at those containers in document position order rather than user-provided
    //  order (as they are treated in Focus-trap, for legacy reasons). See discussion on
    //  https://github.com/focus-trap/focus-trap/issues/375 for more details.
    if (state.containerGroups.find(function (g) {
      return g.posTabIndexesFound;
    }) && state.containerGroups.length > 1) {
      throw new Error("At least one node with a positive tabindex was found in one of your focus-trap's multiple containers. Positive tabindexes are only supported in single-container focus-traps.");
    }
  };

  /**
   * Gets the current activeElement. If it's a web-component and has open shadow-root
   * it will recursively search inside shadow roots for the "true" activeElement.
   *
   * @param {Document | ShadowRoot} el
   *
   * @returns {HTMLElement} The element that currently has the focus
   **/
  var getActiveElement = function getActiveElement(el) {
    var activeElement = el.activeElement;
    if (!activeElement) {
      return;
    }
    if (activeElement.shadowRoot && activeElement.shadowRoot.activeElement !== null) {
      return getActiveElement(activeElement.shadowRoot);
    }
    return activeElement;
  };
  var tryFocus = function tryFocus(node) {
    if (node === false) {
      return;
    }
    if (node === getActiveElement(document)) {
      return;
    }
    if (!node || !node.focus) {
      tryFocus(getInitialFocusNode());
      return;
    }
    node.focus({
      preventScroll: !!config.preventScroll
    });
    // NOTE: focus() API does not trigger focusIn event so set MRU node manually
    state.mostRecentlyFocusedNode = node;
    if (isSelectableInput(node)) {
      node.select();
    }
  };
  var getReturnFocusNode = function getReturnFocusNode(previousActiveElement) {
    var node = getNodeForOption('setReturnFocus', previousActiveElement);
    return node ? node : node === false ? false : previousActiveElement;
  };

  /**
   * Finds the next node (in either direction) where focus should move according to a
   *  keyboard focus-in event.
   * @param {Object} params
   * @param {Node} [params.target] Known target __from which__ to navigate, if any.
   * @param {KeyboardEvent|FocusEvent} [params.event] Event to use if `target` isn't known (event
   *  will be used to determine the `target`). Ignored if `target` is specified.
   * @param {boolean} [params.isBackward] True if focus should move backward.
   * @returns {Node|undefined} The next node, or `undefined` if a next node couldn't be
   *  determined given the current state of the trap.
   */
  var findNextNavNode = function findNextNavNode(_ref2) {
    var target = _ref2.target,
      event = _ref2.event,
      _ref2$isBackward = _ref2.isBackward,
      isBackward = _ref2$isBackward === void 0 ? false : _ref2$isBackward;
    target = target || getActualTarget(event);
    updateTabbableNodes();
    var destinationNode = null;
    if (state.tabbableGroups.length > 0) {
      // make sure the target is actually contained in a group
      // NOTE: the target may also be the container itself if it's focusable
      //  with tabIndex='-1' and was given initial focus
      var containerIndex = findContainerIndex(target, event);
      var containerGroup = containerIndex >= 0 ? state.containerGroups[containerIndex] : undefined;
      if (containerIndex < 0) {
        // target not found in any group: quite possible focus has escaped the trap,
        //  so bring it back into...
        if (isBackward) {
          // ...the last node in the last group
          destinationNode = state.tabbableGroups[state.tabbableGroups.length - 1].lastTabbableNode;
        } else {
          // ...the first node in the first group
          destinationNode = state.tabbableGroups[0].firstTabbableNode;
        }
      } else if (isBackward) {
        // REVERSE

        // is the target the first tabbable node in a group?
        var startOfGroupIndex = findIndex(state.tabbableGroups, function (_ref3) {
          var firstTabbableNode = _ref3.firstTabbableNode;
          return target === firstTabbableNode;
        });
        if (startOfGroupIndex < 0 && (containerGroup.container === target || isFocusable(target, config.tabbableOptions) && !isTabbable(target, config.tabbableOptions) && !containerGroup.nextTabbableNode(target, false))) {
          // an exception case where the target is either the container itself, or
          //  a non-tabbable node that was given focus (i.e. tabindex is negative
          //  and user clicked on it or node was programmatically given focus)
          //  and is not followed by any other tabbable node, in which
          //  case, we should handle shift+tab as if focus were on the container's
          //  first tabbable node, and go to the last tabbable node of the LAST group
          startOfGroupIndex = containerIndex;
        }
        if (startOfGroupIndex >= 0) {
          // YES: then shift+tab should go to the last tabbable node in the
          //  previous group (and wrap around to the last tabbable node of
          //  the LAST group if it's the first tabbable node of the FIRST group)
          var destinationGroupIndex = startOfGroupIndex === 0 ? state.tabbableGroups.length - 1 : startOfGroupIndex - 1;
          var destinationGroup = state.tabbableGroups[destinationGroupIndex];
          destinationNode = getTabIndex(target) >= 0 ? destinationGroup.lastTabbableNode : destinationGroup.lastDomTabbableNode;
        } else if (!isTabEvent(event)) {
          // user must have customized the nav keys so we have to move focus manually _within_
          //  the active group: do this based on the order determined by tabbable()
          destinationNode = containerGroup.nextTabbableNode(target, false);
        }
      } else {
        // FORWARD

        // is the target the last tabbable node in a group?
        var lastOfGroupIndex = findIndex(state.tabbableGroups, function (_ref4) {
          var lastTabbableNode = _ref4.lastTabbableNode;
          return target === lastTabbableNode;
        });
        if (lastOfGroupIndex < 0 && (containerGroup.container === target || isFocusable(target, config.tabbableOptions) && !isTabbable(target, config.tabbableOptions) && !containerGroup.nextTabbableNode(target))) {
          // an exception case where the target is the container itself, or
          //  a non-tabbable node that was given focus (i.e. tabindex is negative
          //  and user clicked on it or node was programmatically given focus)
          //  and is not followed by any other tabbable node, in which
          //  case, we should handle tab as if focus were on the container's
          //  last tabbable node, and go to the first tabbable node of the FIRST group
          lastOfGroupIndex = containerIndex;
        }
        if (lastOfGroupIndex >= 0) {
          // YES: then tab should go to the first tabbable node in the next
          //  group (and wrap around to the first tabbable node of the FIRST
          //  group if it's the last tabbable node of the LAST group)
          var _destinationGroupIndex = lastOfGroupIndex === state.tabbableGroups.length - 1 ? 0 : lastOfGroupIndex + 1;
          var _destinationGroup = state.tabbableGroups[_destinationGroupIndex];
          destinationNode = getTabIndex(target) >= 0 ? _destinationGroup.firstTabbableNode : _destinationGroup.firstDomTabbableNode;
        } else if (!isTabEvent(event)) {
          // user must have customized the nav keys so we have to move focus manually _within_
          //  the active group: do this based on the order determined by tabbable()
          destinationNode = containerGroup.nextTabbableNode(target);
        }
      }
    } else {
      // no groups available
      // NOTE: the fallbackFocus option does not support returning false to opt-out
      destinationNode = getNodeForOption('fallbackFocus');
    }
    return destinationNode;
  };

  // This needs to be done on mousedown and touchstart instead of click
  // so that it precedes the focus event.
  var checkPointerDown = function checkPointerDown(e) {
    var target = getActualTarget(e);
    if (findContainerIndex(target, e) >= 0) {
      // allow the click since it ocurred inside the trap
      return;
    }
    if (valueOrHandler(config.clickOutsideDeactivates, e)) {
      // immediately deactivate the trap
      trap.deactivate({
        // NOTE: by setting `returnFocus: false`, deactivate() will do nothing,
        //  which will result in the outside click setting focus to the node
        //  that was clicked (and if not focusable, to "nothing"); by setting
        //  `returnFocus: true`, we'll attempt to re-focus the node originally-focused
        //  on activation (or the configured `setReturnFocus` node), whether the
        //  outside click was on a focusable node or not
        returnFocus: config.returnFocusOnDeactivate
      });
      return;
    }

    // This is needed for mobile devices.
    // (If we'll only let `click` events through,
    // then on mobile they will be blocked anyways if `touchstart` is blocked.)
    if (valueOrHandler(config.allowOutsideClick, e)) {
      // allow the click outside the trap to take place
      return;
    }

    // otherwise, prevent the click
    e.preventDefault();
  };

  // In case focus escapes the trap for some strange reason, pull it back in.
  // NOTE: the focusIn event is NOT cancelable, so if focus escapes, it may cause unexpected
  //  scrolling if the node that got focused was out of view; there's nothing we can do to
  //  prevent that from happening by the time we discover that focus escaped
  var checkFocusIn = function checkFocusIn(event) {
    var target = getActualTarget(event);
    var targetContained = findContainerIndex(target, event) >= 0;

    // In Firefox when you Tab out of an iframe the Document is briefly focused.
    if (targetContained || target instanceof Document) {
      if (targetContained) {
        state.mostRecentlyFocusedNode = target;
      }
    } else {
      // escaped! pull it back in to where it just left
      event.stopImmediatePropagation();

      // focus will escape if the MRU node had a positive tab index and user tried to nav forward;
      //  it will also escape if the MRU node had a 0 tab index and user tried to nav backward
      //  toward a node with a positive tab index
      var nextNode; // next node to focus, if we find one
      var navAcrossContainers = true;
      if (state.mostRecentlyFocusedNode) {
        if (getTabIndex(state.mostRecentlyFocusedNode) > 0) {
          // MRU container index must be >=0 otherwise we wouldn't have it as an MRU node...
          var mruContainerIdx = findContainerIndex(state.mostRecentlyFocusedNode);
          // there MAY not be any tabbable nodes in the container if there are at least 2 containers
          //  and the MRU node is focusable but not tabbable (focus-trap requires at least 1 container
          //  with at least one tabbable node in order to function, so this could be the other container
          //  with nothing tabbable in it)
          var tabbableNodes = state.containerGroups[mruContainerIdx].tabbableNodes;
          if (tabbableNodes.length > 0) {
            // MRU tab index MAY not be found if the MRU node is focusable but not tabbable
            var mruTabIdx = tabbableNodes.findIndex(function (node) {
              return node === state.mostRecentlyFocusedNode;
            });
            if (mruTabIdx >= 0) {
              if (config.isKeyForward(state.recentNavEvent)) {
                if (mruTabIdx + 1 < tabbableNodes.length) {
                  nextNode = tabbableNodes[mruTabIdx + 1];
                  navAcrossContainers = false;
                }
                // else, don't wrap within the container as focus should move to next/previous
                //  container
              } else {
                if (mruTabIdx - 1 >= 0) {
                  nextNode = tabbableNodes[mruTabIdx - 1];
                  navAcrossContainers = false;
                }
                // else, don't wrap within the container as focus should move to next/previous
                //  container
              }
              // else, don't find in container order without considering direction too
            }
          }
          // else, no tabbable nodes in that container (which means we must have at least one other
          //  container with at least one tabbable node in it, otherwise focus-trap would've thrown
          //  an error the last time updateTabbableNodes() was run): find next node among all known
          //  containers
        } else {
          // check to see if there's at least one tabbable node with a positive tab index inside
          //  the trap because focus seems to escape when navigating backward from a tabbable node
          //  with tabindex=0 when this is the case (instead of wrapping to the tabbable node with
          //  the greatest positive tab index like it should)
          if (!state.containerGroups.some(function (g) {
            return g.tabbableNodes.some(function (n) {
              return getTabIndex(n) > 0;
            });
          })) {
            // no containers with tabbable nodes with positive tab indexes which means the focus
            //  escaped for some other reason and we should just execute the fallback to the
            //  MRU node or initial focus node, if any
            navAcrossContainers = false;
          }
        }
      } else {
        // no MRU node means we're likely in some initial condition when the trap has just
        //  been activated and initial focus hasn't been given yet, in which case we should
        //  fall through to trying to focus the initial focus node, which is what should
        //  happen below at this point in the logic
        navAcrossContainers = false;
      }
      if (navAcrossContainers) {
        nextNode = findNextNavNode({
          // move FROM the MRU node, not event-related node (which will be the node that is
          //  outside the trap causing the focus escape we're trying to fix)
          target: state.mostRecentlyFocusedNode,
          isBackward: config.isKeyBackward(state.recentNavEvent)
        });
      }
      if (nextNode) {
        tryFocus(nextNode);
      } else {
        tryFocus(state.mostRecentlyFocusedNode || getInitialFocusNode());
      }
    }
    state.recentNavEvent = undefined; // clear
  };

  // Hijack key nav events on the first and last focusable nodes of the trap,
  // in order to prevent focus from escaping. If it escapes for even a
  // moment it can end up scrolling the page and causing confusion so we
  // kind of need to capture the action at the keydown phase.
  var checkKeyNav = function checkKeyNav(event) {
    var isBackward = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    state.recentNavEvent = event;
    var destinationNode = findNextNavNode({
      event: event,
      isBackward: isBackward
    });
    if (destinationNode) {
      if (isTabEvent(event)) {
        // since tab natively moves focus, we wouldn't have a destination node unless we
        //  were on the edge of a container and had to move to the next/previous edge, in
        //  which case we want to prevent default to keep the browser from moving focus
        //  to where it normally would
        event.preventDefault();
      }
      tryFocus(destinationNode);
    }
    // else, let the browser take care of [shift+]tab and move the focus
  };

  var checkKey = function checkKey(event) {
    if (isEscapeEvent(event) && valueOrHandler(config.escapeDeactivates, event) !== false) {
      event.preventDefault();
      trap.deactivate();
      return;
    }
    if (config.isKeyForward(event) || config.isKeyBackward(event)) {
      checkKeyNav(event, config.isKeyBackward(event));
    }
  };
  var checkClick = function checkClick(e) {
    var target = getActualTarget(e);
    if (findContainerIndex(target, e) >= 0) {
      return;
    }
    if (valueOrHandler(config.clickOutsideDeactivates, e)) {
      return;
    }
    if (valueOrHandler(config.allowOutsideClick, e)) {
      return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();
  };

  //
  // EVENT LISTENERS
  //

  var addListeners = function addListeners() {
    if (!state.active) {
      return;
    }

    // There can be only one listening focus trap at a time
    activeFocusTraps.activateTrap(trapStack, trap);

    // Delay ensures that the focused element doesn't capture the event
    // that caused the focus trap activation.
    state.delayInitialFocusTimer = config.delayInitialFocus ? delay(function () {
      tryFocus(getInitialFocusNode());
    }) : tryFocus(getInitialFocusNode());
    doc.addEventListener('focusin', checkFocusIn, true);
    doc.addEventListener('mousedown', checkPointerDown, {
      capture: true,
      passive: false
    });
    doc.addEventListener('touchstart', checkPointerDown, {
      capture: true,
      passive: false
    });
    doc.addEventListener('click', checkClick, {
      capture: true,
      passive: false
    });
    doc.addEventListener('keydown', checkKey, {
      capture: true,
      passive: false
    });
    return trap;
  };
  var removeListeners = function removeListeners() {
    if (!state.active) {
      return;
    }
    doc.removeEventListener('focusin', checkFocusIn, true);
    doc.removeEventListener('mousedown', checkPointerDown, true);
    doc.removeEventListener('touchstart', checkPointerDown, true);
    doc.removeEventListener('click', checkClick, true);
    doc.removeEventListener('keydown', checkKey, true);
    return trap;
  };

  //
  // MUTATION OBSERVER
  //

  var checkDomRemoval = function checkDomRemoval(mutations) {
    var isFocusedNodeRemoved = mutations.some(function (mutation) {
      var removedNodes = Array.from(mutation.removedNodes);
      return removedNodes.some(function (node) {
        return node === state.mostRecentlyFocusedNode;
      });
    });

    // If the currently focused is removed then browsers will move focus to the
    // <body> element. If this happens, try to move focus back into the trap.
    if (isFocusedNodeRemoved) {
      tryFocus(getInitialFocusNode());
    }
  };

  // Use MutationObserver - if supported - to detect if focused node is removed
  // from the DOM.
  var mutationObserver = typeof window !== 'undefined' && 'MutationObserver' in window ? new MutationObserver(checkDomRemoval) : undefined;
  var updateObservedNodes = function updateObservedNodes() {
    if (!mutationObserver) {
      return;
    }
    mutationObserver.disconnect();
    if (state.active && !state.paused) {
      state.containers.map(function (container) {
        mutationObserver.observe(container, {
          subtree: true,
          childList: true
        });
      });
    }
  };

  //
  // TRAP DEFINITION
  //

  trap = {
    get active() {
      return state.active;
    },
    get paused() {
      return state.paused;
    },
    activate: function activate(activateOptions) {
      if (state.active) {
        return this;
      }
      var onActivate = getOption(activateOptions, 'onActivate');
      var onPostActivate = getOption(activateOptions, 'onPostActivate');
      var checkCanFocusTrap = getOption(activateOptions, 'checkCanFocusTrap');
      if (!checkCanFocusTrap) {
        updateTabbableNodes();
      }
      state.active = true;
      state.paused = false;
      state.nodeFocusedBeforeActivation = doc.activeElement;
      onActivate === null || onActivate === void 0 || onActivate();
      var finishActivation = function finishActivation() {
        if (checkCanFocusTrap) {
          updateTabbableNodes();
        }
        addListeners();
        updateObservedNodes();
        onPostActivate === null || onPostActivate === void 0 || onPostActivate();
      };
      if (checkCanFocusTrap) {
        checkCanFocusTrap(state.containers.concat()).then(finishActivation, finishActivation);
        return this;
      }
      finishActivation();
      return this;
    },
    deactivate: function deactivate(deactivateOptions) {
      if (!state.active) {
        return this;
      }
      var options = _objectSpread2({
        onDeactivate: config.onDeactivate,
        onPostDeactivate: config.onPostDeactivate,
        checkCanReturnFocus: config.checkCanReturnFocus
      }, deactivateOptions);
      clearTimeout(state.delayInitialFocusTimer); // noop if undefined
      state.delayInitialFocusTimer = undefined;
      removeListeners();
      state.active = false;
      state.paused = false;
      updateObservedNodes();
      activeFocusTraps.deactivateTrap(trapStack, trap);
      var onDeactivate = getOption(options, 'onDeactivate');
      var onPostDeactivate = getOption(options, 'onPostDeactivate');
      var checkCanReturnFocus = getOption(options, 'checkCanReturnFocus');
      var returnFocus = getOption(options, 'returnFocus', 'returnFocusOnDeactivate');
      onDeactivate === null || onDeactivate === void 0 || onDeactivate();
      var finishDeactivation = function finishDeactivation() {
        delay(function () {
          if (returnFocus) {
            tryFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation));
          }
          onPostDeactivate === null || onPostDeactivate === void 0 || onPostDeactivate();
        });
      };
      if (returnFocus && checkCanReturnFocus) {
        checkCanReturnFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation)).then(finishDeactivation, finishDeactivation);
        return this;
      }
      finishDeactivation();
      return this;
    },
    pause: function pause(pauseOptions) {
      if (state.paused || !state.active) {
        return this;
      }
      var onPause = getOption(pauseOptions, 'onPause');
      var onPostPause = getOption(pauseOptions, 'onPostPause');
      state.paused = true;
      onPause === null || onPause === void 0 || onPause();
      removeListeners();
      updateObservedNodes();
      onPostPause === null || onPostPause === void 0 || onPostPause();
      return this;
    },
    unpause: function unpause(unpauseOptions) {
      if (!state.paused || !state.active) {
        return this;
      }
      var onUnpause = getOption(unpauseOptions, 'onUnpause');
      var onPostUnpause = getOption(unpauseOptions, 'onPostUnpause');
      state.paused = false;
      onUnpause === null || onUnpause === void 0 || onUnpause();
      updateTabbableNodes();
      addListeners();
      updateObservedNodes();
      onPostUnpause === null || onPostUnpause === void 0 || onPostUnpause();
      return this;
    },
    updateContainerElements: function updateContainerElements(containerElements) {
      var elementsAsArray = [].concat(containerElements).filter(Boolean);
      state.containers = elementsAsArray.map(function (element) {
        return typeof element === 'string' ? doc.querySelector(element) : element;
      });
      if (state.active) {
        updateTabbableNodes();
      }
      updateObservedNodes();
      return this;
    }
  };

  // initialize container elements
  trap.updateContainerElements(elements);
  return trap;
};

function last(array) {
  return array[array.length - 1];
}
function styleToString$1(style) {
  return Object.keys(style).reduce((str, key) => {
    if (style[key] === void 0)
      return str;
    return str + `${key}:${style[key]};`;
  }, "");
}
({
  type: "hidden",
  "aria-hidden": true,
  hidden: true,
  tabIndex: -1,
  style: styleToString$1({
    position: "absolute",
    opacity: 0,
    "pointer-events": "none",
    margin: 0,
    transform: "translateX(-100%)"
  })
});
function lightable(value) {
  function subscribe(run) {
    run(value);
    return () => {
    };
  }
  return { subscribe };
}
const hiddenAction = (obj) => {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      return Reflect.get(target, prop, receiver);
    },
    ownKeys(target) {
      return Reflect.ownKeys(target).filter((key) => key !== "action");
    }
  });
};
const isFunctionWithParams = (fn) => {
  return typeof fn === "function";
};
function builder(name2, args) {
  const { stores, action, returned } = args ?? {};
  const derivedStore = (() => {
    if (stores && returned) {
      return derived(stores, (values) => {
        const result = returned(values);
        if (isFunctionWithParams(result)) {
          const fn = (...args2) => {
            return hiddenAction({
              ...result(...args2),
              [`data-melt-${name2}`]: "",
              action: action ?? noop$1
            });
          };
          fn.action = action ?? noop$1;
          return fn;
        }
        return hiddenAction({
          ...result,
          [`data-melt-${name2}`]: "",
          action: action ?? noop$1
        });
      });
    } else {
      const returnedFn = returned;
      const result = returnedFn?.();
      if (isFunctionWithParams(result)) {
        const resultFn = (...args2) => {
          return hiddenAction({
            ...result(...args2),
            [`data-melt-${name2}`]: "",
            action: action ?? noop$1
          });
        };
        resultFn.action = action ?? noop$1;
        return lightable(resultFn);
      }
      return lightable(hiddenAction({
        ...result,
        [`data-melt-${name2}`]: "",
        action: action ?? noop$1
      }));
    }
  })();
  const actionFn = action ?? (() => {
  });
  actionFn.subscribe = derivedStore.subscribe;
  return actionFn;
}
function createElHelpers(prefix) {
  const name2 = (part) => part ? `${prefix}-${part}` : prefix;
  const attribute = (part) => `data-melt-${prefix}${part ? `-${part}` : ""}`;
  const selector = (part) => `[data-melt-${prefix}${part ? `-${part}` : ""}]`;
  const getEl = (part) => document.querySelector(selector(part));
  return {
    name: name2,
    attribute,
    selector,
    getEl
  };
}
const isBrowser$1 = typeof document !== "undefined";
const isFunction = (v) => typeof v === "function";
function isHTMLElement$1(element) {
  return element instanceof HTMLElement;
}
function isObject(value) {
  return value !== null && typeof value === "object";
}
function isReadable(value) {
  return isObject(value) && "subscribe" in value;
}
function executeCallbacks(...callbacks) {
  return (...args) => {
    for (const callback of callbacks) {
      if (typeof callback === "function") {
        callback(...args);
      }
    }
  };
}
function noop$1() {
}
function addEventListener$1(target, event, handler, options) {
  const events = Array.isArray(event) ? event : [event];
  events.forEach((_event) => target.addEventListener(_event, handler, options));
  return () => {
    events.forEach((_event) => target.removeEventListener(_event, handler, options));
  };
}
function addMeltEventListener(target, event, handler, options) {
  const events = Array.isArray(event) ? event : [event];
  if (typeof handler === "function") {
    const handlerWithMelt = withMelt((_event) => handler(_event));
    events.forEach((_event) => target.addEventListener(_event, handlerWithMelt, options));
    return () => {
      events.forEach((_event) => target.removeEventListener(_event, handlerWithMelt, options));
    };
  }
  return () => noop$1();
}
function dispatchMeltEvent(originalEvent) {
  const node = originalEvent.currentTarget;
  if (!isHTMLElement$1(node))
    return null;
  const customMeltEvent = new CustomEvent(`m-${originalEvent.type}`, {
    detail: {
      originalEvent
    },
    cancelable: true
  });
  node.dispatchEvent(customMeltEvent);
  return customMeltEvent;
}
function withMelt(handler) {
  return (event) => {
    const customEvent = dispatchMeltEvent(event);
    if (customEvent?.defaultPrevented)
      return;
    return handler(event);
  };
}
function omit$1(obj, ...keys) {
  const result = {};
  for (const key of Object.keys(obj)) {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}
const overridable$1 = (store, onChange) => {
  const update = (updater, sideEffect) => {
    store.update((curr) => {
      const next = updater(curr);
      let res = next;
      if (onChange) {
        res = onChange({ curr, next });
      }
      sideEffect?.(res);
      return res;
    });
  };
  const set2 = (curr) => {
    update(() => curr);
  };
  return {
    ...store,
    update,
    set: set2
  };
};
function sleep$1(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function generateId() {
  return nanoid(10);
}
function generateIds(args) {
  return args.reduce((acc, curr) => {
    acc[curr] = generateId();
    return acc;
  }, {});
}
const kbd = {
  ALT: "Alt",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  ARROW_UP: "ArrowUp",
  BACKSPACE: "Backspace",
  CAPS_LOCK: "CapsLock",
  CONTROL: "Control",
  DELETE: "Delete",
  END: "End",
  ENTER: "Enter",
  ESCAPE: "Escape",
  F1: "F1",
  F10: "F10",
  F11: "F11",
  F12: "F12",
  F2: "F2",
  F3: "F3",
  F4: "F4",
  F5: "F5",
  F6: "F6",
  F7: "F7",
  F8: "F8",
  F9: "F9",
  HOME: "Home",
  META: "Meta",
  PAGE_DOWN: "PageDown",
  PAGE_UP: "PageUp",
  SHIFT: "Shift",
  SPACE: " ",
  TAB: "Tab",
  CTRL: "Control",
  ASTERISK: "*",
  A: "a",
  P: "p"
};
const isDom = () => typeof window !== "undefined";
function getPlatform() {
  const agent = navigator.userAgentData;
  return agent?.platform ?? navigator.platform;
}
const pt = (v) => isDom() && v.test(getPlatform().toLowerCase());
const isTouchDevice = () => isDom() && !!navigator.maxTouchPoints;
const isMac$1 = () => pt(/^mac/) && !isTouchDevice();
const isApple = () => pt(/mac|iphone|ipad|ipod/i);
const isIos = () => isApple() && !isMac$1();
const LOCK_CLASSNAME = "data-melt-scroll-lock";
function assignStyle(el, style) {
  if (!el)
    return;
  const previousStyle = el.style.cssText;
  Object.assign(el.style, style);
  return () => {
    el.style.cssText = previousStyle;
  };
}
function setCSSProperty$1(el, property, value) {
  if (!el)
    return;
  const previousValue = el.style.getPropertyValue(property);
  el.style.setProperty(property, value);
  return () => {
    if (previousValue) {
      el.style.setProperty(property, previousValue);
    } else {
      el.style.removeProperty(property);
    }
  };
}
function getPaddingProperty$1(documentElement) {
  const documentLeft = documentElement.getBoundingClientRect().left;
  const scrollbarX = Math.round(documentLeft) + documentElement.scrollLeft;
  return scrollbarX ? "paddingLeft" : "paddingRight";
}
function removeScroll(_document) {
  const doc = document;
  const win = doc.defaultView ?? window;
  const { documentElement, body } = doc;
  const locked = body.hasAttribute(LOCK_CLASSNAME);
  if (locked)
    return noop$1;
  body.setAttribute(LOCK_CLASSNAME, "");
  const scrollbarWidth = win.innerWidth - documentElement.clientWidth;
  const setScrollbarWidthProperty = () => setCSSProperty$1(documentElement, "--scrollbar-width", `${scrollbarWidth}px`);
  const paddingProperty = getPaddingProperty$1(documentElement);
  const scrollbarSidePadding = win.getComputedStyle(body)[paddingProperty];
  const setStyle2 = () => assignStyle(body, {
    overflow: "hidden",
    [paddingProperty]: `calc(${scrollbarSidePadding} + ${scrollbarWidth}px)`
  });
  const setIOSStyle = () => {
    const { scrollX, scrollY, visualViewport: visualViewport2 } = win;
    const offsetLeft = visualViewport2?.offsetLeft ?? 0;
    const offsetTop = visualViewport2?.offsetTop ?? 0;
    const restoreStyle = assignStyle(body, {
      position: "fixed",
      overflow: "hidden",
      top: `${-(scrollY - Math.floor(offsetTop))}px`,
      left: `${-(scrollX - Math.floor(offsetLeft))}px`,
      right: "0",
      [paddingProperty]: `calc(${scrollbarSidePadding} + ${scrollbarWidth}px)`
    });
    return () => {
      restoreStyle?.();
      win.scrollTo(scrollX, scrollY);
    };
  };
  const cleanups = [setScrollbarWidthProperty(), isIos() ? setIOSStyle() : setStyle2()];
  return () => {
    cleanups.forEach((fn) => fn?.());
    body.removeAttribute(LOCK_CLASSNAME);
  };
}
const safeOnDestroy$1 = (fn) => {
  try {
    onDestroy(fn);
  } catch {
    return fn();
  }
};
function derivedWithUnsubscribe$1(stores, fn) {
  let unsubscribers = [];
  const onUnsubscribe = (cb) => {
    unsubscribers.push(cb);
  };
  const unsubscribe = () => {
    unsubscribers.forEach((fn2) => fn2());
    unsubscribers = [];
  };
  const derivedStore = derived(stores, ($storeValues) => {
    unsubscribe();
    return fn($storeValues, onUnsubscribe);
  });
  safeOnDestroy$1(unsubscribe);
  const subscribe = (...args) => {
    const unsub = derivedStore.subscribe(...args);
    return () => {
      unsub();
      unsubscribe();
    };
  };
  return {
    ...derivedStore,
    subscribe
  };
}
function effect$1(stores, fn) {
  const unsub = derivedWithUnsubscribe$1(stores, (stores2, onUnsubscribe) => {
    return {
      stores: stores2,
      onUnsubscribe
    };
  }).subscribe(({ stores: stores2, onUnsubscribe }) => {
    const returned = fn(stores2);
    if (returned) {
      onUnsubscribe(returned);
    }
  });
  safeOnDestroy$1(unsub);
  return unsub;
}
function toWritableStores$1(properties) {
  const result = {};
  Object.keys(properties).forEach((key) => {
    const propertyKey = key;
    const value = properties[propertyKey];
    result[propertyKey] = writable(value);
  });
  return result;
}
function getPortalParent(node) {
  let parent = node.parentElement;
  while (isHTMLElement$1(parent) && !parent.hasAttribute("data-portal")) {
    parent = parent.parentElement;
  }
  return parent || "body";
}
function getPortalDestination(node, portalProp) {
  const portalParent = getPortalParent(node);
  if (portalProp !== void 0)
    return portalProp;
  if (portalParent === "body")
    return document.body;
  return null;
}
async function handleFocus(args) {
  const { prop, defaultEl } = args;
  await Promise.all([sleep$1(1), tick]);
  if (prop === void 0) {
    defaultEl?.focus();
    return;
  }
  const returned = isFunction(prop) ? prop(defaultEl) : prop;
  if (typeof returned === "string") {
    const el = document.querySelector(returned);
    if (!isHTMLElement$1(el))
      return;
    el.focus();
  } else if (isHTMLElement$1(returned)) {
    returned.focus();
  }
}
const documentClickStore = readable(void 0, (set2) => {
  function clicked(event) {
    set2(event);
    set2(void 0);
  }
  const unsubscribe = addEventListener$1(document, "pointerup", clicked, {
    passive: false,
    capture: true
  });
  return unsubscribe;
});
const useClickOutside = (node, config = {}) => {
  let options = { enabled: true, ...config };
  function isEnabled() {
    return typeof options.enabled === "boolean" ? options.enabled : get_store_value(options.enabled);
  }
  const unsubscribe = documentClickStore.subscribe((e) => {
    if (!isEnabled() || !e || e.target === node) {
      return;
    }
    const composedPath = e.composedPath();
    if (composedPath.includes(node))
      return;
    if (options.ignore) {
      if (isFunction(options.ignore)) {
        if (options.ignore(e))
          return;
      } else if (Array.isArray(options.ignore)) {
        if (options.ignore.length > 0 && options.ignore.some((ignoreEl) => {
          return ignoreEl && (e.target === ignoreEl || composedPath.includes(ignoreEl));
        }))
          return;
      }
    }
    options.handler?.(e);
  });
  return {
    update(params) {
      options = { ...options, ...params };
    },
    destroy() {
      unsubscribe();
    }
  };
};
const documentEscapeKeyStore$1 = readable(void 0, (set2) => {
  function keydown(event) {
    if (event && event.key === kbd.ESCAPE) {
      set2(event);
    }
    set2(void 0);
  }
  const unsubscribe = addEventListener$1(document, "keydown", keydown, {
    passive: false
  });
  return unsubscribe;
});
const useEscapeKeydown = (node, config = {}) => {
  let unsub = noop$1;
  function update(config2 = {}) {
    unsub();
    const options = { enabled: true, ...config2 };
    const enabled = isReadable(options.enabled) ? options.enabled : readable(options.enabled);
    unsub = executeCallbacks(
      // Handle escape keydowns
      documentEscapeKeyStore$1.subscribe((e) => {
        if (!e || !get_store_value(enabled))
          return;
        const target = e.target;
        if (!isHTMLElement$1(target) || target.closest("[data-escapee]") !== node) {
          return;
        }
        e.preventDefault();
        if (options.ignore) {
          if (isFunction(options.ignore)) {
            if (options.ignore(e))
              return;
          } else if (Array.isArray(options.ignore)) {
            if (options.ignore.length > 0 && options.ignore.some((ignoreEl) => {
              return ignoreEl && target === ignoreEl;
            }))
              return;
          }
        }
        options.handler?.(e);
      }),
      effect$1(enabled, ($enabled) => {
        if ($enabled) {
          node.dataset.escapee = "";
        } else {
          delete node.dataset.escapee;
        }
      })
    );
  }
  update(config);
  return {
    update,
    destroy() {
      node.removeAttribute("data-escapee");
      unsub();
    }
  };
};
function createFocusTrap(config = {}) {
  let trap;
  const { immediate, ...focusTrapOptions } = config;
  const hasFocus = writable(false);
  const isPaused = writable(false);
  const activate = (opts) => trap?.activate(opts);
  const deactivate = (opts) => {
    trap?.deactivate(opts);
  };
  const pause = () => {
    if (trap) {
      trap.pause();
      isPaused.set(true);
    }
  };
  const unpause = () => {
    if (trap) {
      trap.unpause();
      isPaused.set(false);
    }
  };
  const useFocusTrap = (node) => {
    trap = createFocusTrap$1(node, {
      ...focusTrapOptions,
      onActivate() {
        hasFocus.set(true);
        config.onActivate?.();
      },
      onDeactivate() {
        hasFocus.set(false);
        config.onDeactivate?.();
      }
    });
    if (immediate) {
      activate();
    }
    return {
      destroy() {
        deactivate();
        trap = void 0;
      }
    };
  };
  return {
    useFocusTrap,
    hasFocus: readonly(hasFocus),
    isPaused: readonly(isPaused),
    activate,
    deactivate,
    pause,
    unpause
  };
}
const usePortal = (el, target = "body") => {
  let targetEl;
  if (!isHTMLElement$1(target) && typeof target !== "string") {
    return {
      destroy: noop$1
    };
  }
  async function update(newTarget) {
    target = newTarget;
    if (typeof target === "string") {
      targetEl = document.querySelector(target);
      if (targetEl === null) {
        await tick();
        targetEl = document.querySelector(target);
      }
      if (targetEl === null) {
        throw new Error(`No element found matching css selector: "${target}"`);
      }
    } else if (target instanceof HTMLElement) {
      targetEl = target;
    } else {
      throw new TypeError(`Unknown portal target type: ${target === null ? "null" : typeof target}. Allowed types: string (CSS selector) or HTMLElement.`);
    }
    el.dataset.portal = "";
    targetEl.appendChild(el);
    el.hidden = false;
  }
  function destroy() {
    el.remove();
  }
  update(target);
  return {
    update,
    destroy
  };
};
const { name } = createElHelpers("dialog");
const defaults = {
  preventScroll: true,
  closeOnEscape: true,
  closeOnOutsideClick: true,
  role: "dialog",
  defaultOpen: false,
  portal: "body",
  forceVisible: false,
  openFocus: void 0,
  closeFocus: void 0,
  onOutsideClick: void 0
};
const openDialogIds = writable([]);
const dialogIdParts = ["content", "title", "description"];
function createDialog(props) {
  const withDefaults = { ...defaults, ...props };
  const options = toWritableStores$1(omit$1(withDefaults, "ids"));
  const { preventScroll: preventScroll2, closeOnEscape, closeOnOutsideClick, role, portal, forceVisible, openFocus, closeFocus, onOutsideClick } = options;
  const activeTrigger = writable(null);
  const ids = toWritableStores$1({
    ...generateIds(dialogIdParts),
    ...withDefaults.ids
  });
  const openWritable = withDefaults.open ?? writable(withDefaults.defaultOpen);
  const open = overridable$1(openWritable, withDefaults?.onOpenChange);
  const isVisible = derived([open, forceVisible], ([$open, $forceVisible]) => {
    return $open || $forceVisible;
  });
  let unsubScroll = noop$1;
  function handleOpen(e) {
    const el = e.currentTarget;
    const triggerEl = e.currentTarget;
    if (!isHTMLElement$1(el) || !isHTMLElement$1(triggerEl))
      return;
    open.set(true);
    activeTrigger.set(triggerEl);
  }
  function handleClose() {
    open.set(false);
    handleFocus({
      prop: get_store_value(closeFocus),
      defaultEl: get_store_value(activeTrigger)
    });
  }
  effect$1([open], ([$open]) => {
    sleep$1(100).then(() => {
      if ($open) {
        openDialogIds.update((prev) => {
          prev.push(get_store_value(ids.content));
          return prev;
        });
      } else {
        openDialogIds.update((prev) => prev.filter((id) => id !== get_store_value(ids.content)));
      }
    });
  });
  const trigger = builder(name("trigger"), {
    stores: [open],
    returned: ([$open]) => {
      return {
        "aria-haspopup": "dialog",
        "aria-expanded": $open,
        type: "button"
      };
    },
    action: (node) => {
      const unsub = executeCallbacks(addMeltEventListener(node, "click", (e) => {
        handleOpen(e);
      }), addMeltEventListener(node, "keydown", (e) => {
        if (e.key !== kbd.ENTER && e.key !== kbd.SPACE)
          return;
        e.preventDefault();
        handleOpen(e);
      }));
      return {
        destroy: unsub
      };
    }
  });
  const overlay = builder(name("overlay"), {
    stores: [isVisible],
    returned: ([$isVisible]) => {
      return {
        hidden: $isVisible ? void 0 : true,
        tabindex: -1,
        style: styleToString$1({
          display: $isVisible ? void 0 : "none"
        }),
        "aria-hidden": true,
        "data-state": $isVisible ? "open" : "closed"
      };
    },
    action: (node) => {
      let unsubEscapeKeydown = noop$1;
      if (get_store_value(closeOnEscape)) {
        const escapeKeydown = useEscapeKeydown(node, {
          handler: () => {
            handleClose();
          }
        });
        if (escapeKeydown && escapeKeydown.destroy) {
          unsubEscapeKeydown = escapeKeydown.destroy;
        }
      }
      return {
        destroy() {
          unsubEscapeKeydown();
        }
      };
    }
  });
  const content = builder(name("content"), {
    stores: [isVisible, ids.content, ids.description, ids.title],
    returned: ([$isVisible, $contentId, $descriptionId, $titleId]) => {
      return {
        id: $contentId,
        role: get_store_value(role),
        "aria-describedby": $descriptionId,
        "aria-labelledby": $titleId,
        "aria-modal": $isVisible ? "true" : void 0,
        "data-state": $isVisible ? "open" : "closed",
        tabindex: -1,
        hidden: $isVisible ? void 0 : true,
        style: styleToString$1({
          display: $isVisible ? void 0 : "none"
        })
      };
    },
    action: (node) => {
      let activate = noop$1;
      let deactivate = noop$1;
      const destroy = executeCallbacks(effect$1([open], ([$open]) => {
        if (!$open)
          return;
        const focusTrap = createFocusTrap({
          immediate: false,
          escapeDeactivates: true,
          clickOutsideDeactivates: true,
          returnFocusOnDeactivate: false,
          fallbackFocus: node
        });
        activate = focusTrap.activate;
        deactivate = focusTrap.deactivate;
        const ac = focusTrap.useFocusTrap(node);
        if (ac && ac.destroy) {
          return ac.destroy;
        } else {
          return focusTrap.deactivate;
        }
      }), effect$1([closeOnOutsideClick, open], ([$closeOnOutsideClick, $open]) => {
        return useClickOutside(node, {
          enabled: $open,
          handler: (e) => {
            get_store_value(onOutsideClick)?.(e);
            if (e.defaultPrevented)
              return;
            const $openDialogIds = get_store_value(openDialogIds);
            const isLast = last($openDialogIds) === get_store_value(ids.content);
            if ($closeOnOutsideClick && isLast) {
              handleClose();
            }
          }
        }).destroy;
      }), effect$1([closeOnEscape], ([$closeOnEscape]) => {
        if (!$closeOnEscape)
          return noop$1;
        const escapeKeydown = useEscapeKeydown(node, {
          handler: () => {
            handleClose();
          }
        });
        if (escapeKeydown && escapeKeydown.destroy) {
          return escapeKeydown.destroy;
        }
        return noop$1;
      }), effect$1([isVisible], ([$isVisible]) => {
        tick().then(() => {
          if (!$isVisible) {
            deactivate();
          } else {
            activate();
          }
        });
      }));
      return {
        destroy: () => {
          unsubScroll();
          destroy();
        }
      };
    }
  });
  const portalled = builder(name("portalled"), {
    stores: portal,
    returned: ($portal) => ({
      "data-portal": $portal ? "" : void 0
    }),
    action: (node) => {
      const unsubPortal = effect$1([portal], ([$portal]) => {
        if (!$portal)
          return noop$1;
        const portalDestination = getPortalDestination(node, $portal);
        if (portalDestination === null)
          return noop$1;
        const portalAction = usePortal(node, portalDestination);
        if (portalAction && portalAction.destroy) {
          return portalAction.destroy;
        } else {
          return noop$1;
        }
      });
      return {
        destroy() {
          unsubPortal();
        }
      };
    }
  });
  const title = builder(name("title"), {
    stores: [ids.title],
    returned: ([$titleId]) => ({
      id: $titleId
    })
  });
  const description = builder(name("description"), {
    stores: [ids.description],
    returned: ([$descriptionId]) => ({
      id: $descriptionId
    })
  });
  const close = builder(name("close"), {
    returned: () => ({
      type: "button"
    }),
    action: (node) => {
      const unsub = executeCallbacks(addMeltEventListener(node, "click", () => {
        handleClose();
      }), addMeltEventListener(node, "keydown", (e) => {
        if (e.key !== kbd.SPACE && e.key !== kbd.ENTER)
          return;
        e.preventDefault();
        handleClose();
      }));
      return {
        destroy: unsub
      };
    }
  });
  effect$1([open, preventScroll2], ([$open, $preventScroll]) => {
    if (!isBrowser$1)
      return;
    if ($preventScroll && $open)
      unsubScroll = removeScroll();
    if ($open) {
      const contentEl = document.getElementById(get_store_value(ids.content));
      handleFocus({ prop: get_store_value(openFocus), defaultEl: contentEl });
    }
    return () => {
      if (!get_store_value(forceVisible)) {
        unsubScroll();
      }
    };
  });
  return {
    ids,
    elements: {
      content,
      trigger,
      title,
      description,
      overlay,
      close,
      portalled
    },
    states: {
      open
    },
    options
  };
}
function createBitAttrs(bit, parts) {
  const attrs = {};
  parts.forEach((part) => {
    attrs[part] = {
      [`data-${bit}-${part}`]: ""
    };
  });
  return (part) => attrs[part];
}
function removeUndefined$1(obj) {
  const result = {};
  for (const key in obj) {
    const value = obj[key];
    if (value !== void 0) {
      result[key] = value;
    }
  }
  return result;
}
function getOptionUpdater$1(options) {
  return function(key, value) {
    if (value === void 0)
      return;
    const store = options[key];
    if (store) {
      store.set(value);
    }
  };
}
function getDialogData() {
  const NAME = "dialog";
  const PARTS = [
    "close",
    "content",
    "description",
    "overlay",
    "portal",
    "title",
    "trigger"
  ];
  return {
    NAME,
    PARTS
  };
}
function setCtx$1(props) {
  const { NAME, PARTS } = getDialogData();
  const getAttrs = createBitAttrs(NAME, PARTS);
  const dialog = {
    ...createDialog({ ...removeUndefined$1(props), role: "dialog", forceVisible: true }),
    getAttrs
  };
  setContext(NAME, dialog);
  return {
    ...dialog,
    updateOption: getOptionUpdater$1(dialog.options)
  };
}
function getCtx$1() {
  const { NAME } = getDialogData();
  return getContext(NAME);
}
function Dialog($$payload, $$props) {
  push();
  var $$store_subs;
  let preventScroll2 = value_or_fallback($$props["preventScroll"], () => void 0);
  let closeOnEscape = value_or_fallback($$props["closeOnEscape"], () => void 0);
  let closeOnOutsideClick = value_or_fallback($$props["closeOnOutsideClick"], () => void 0);
  let portal = value_or_fallback($$props["portal"], () => void 0);
  let open = value_or_fallback($$props["open"], () => void 0);
  let onOpenChange = value_or_fallback($$props["onOpenChange"], () => void 0);
  let openFocus = value_or_fallback($$props["openFocus"], () => void 0);
  let closeFocus = value_or_fallback($$props["closeFocus"], () => void 0);
  let onOutsideClick = value_or_fallback($$props["onOutsideClick"], () => void 0);
  const {
    states: { open: localOpen },
    updateOption,
    ids
  } = setCtx$1({
    closeOnEscape,
    preventScroll: preventScroll2,
    closeOnOutsideClick,
    portal,
    forceVisible: true,
    defaultOpen: open,
    openFocus,
    closeFocus,
    onOutsideClick,
    onOpenChange: ({ next }) => {
      if (open !== next) {
        onOpenChange?.(next);
        open = next;
      }
      return next;
    }
  });
  const idValues = derived([ids.content, ids.description, ids.title], ([$contentId, $descriptionId, $titleId]) => ({
    content: $contentId,
    description: $descriptionId,
    title: $titleId
  }));
  open !== void 0 && localOpen.set(open);
  updateOption("preventScroll", preventScroll2);
  updateOption("closeOnEscape", closeOnEscape);
  updateOption("closeOnOutsideClick", closeOnOutsideClick);
  updateOption("portal", portal);
  updateOption("openFocus", openFocus);
  updateOption("closeFocus", closeFocus);
  updateOption("onOutsideClick", onOutsideClick);
  $$payload.out += `<!--[-->`;
  slot(
    $$payload,
    $$props.children,
    {
      get ids() {
        return store_get($$store_subs ??= {}, "$idValues", idValues);
      }
    },
    null
  );
  $$payload.out += `<!--]-->`;
  if ($$store_subs)
    unsubscribe_stores($$store_subs);
  bind_props($$props, {
    preventScroll: preventScroll2,
    closeOnEscape,
    closeOnOutsideClick,
    portal,
    open,
    onOpenChange,
    openFocus,
    closeFocus,
    onOutsideClick
  });
  pop();
}
function Dialog_portal($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["asChild", "el"]);
  push();
  var $$store_subs;
  let builder2;
  let asChild = value_or_fallback($$props["asChild"], () => false);
  let el = value_or_fallback($$props["el"], () => void 0);
  const { elements: { portalled }, getAttrs } = getCtx$1();
  const attrs = getAttrs("portal");
  builder2 = store_get($$store_subs ??= {}, "$portalled", portalled);
  Object.assign(builder2, attrs);
  $$payload.out += `<!--[-->`;
  if (asChild) {
    $$payload.out += `<!--[-->`;
    slot(
      $$payload,
      $$props.children,
      {
        get builder() {
          return builder2;
        }
      },
      null
    );
    $$payload.out += `<!--]-->`;
    $$payload.out += "<!--]-->";
  } else {
    $$payload.out += `<div${spread_attributes([builder2, $$restProps], true, true)}><!--[-->`;
    slot(
      $$payload,
      $$props.children,
      {
        get builder() {
          return builder2;
        }
      },
      null
    );
    $$payload.out += `<!--]--></div>`;
    $$payload.out += "<!--]!-->";
  }
  if ($$store_subs)
    unsubscribe_stores($$store_subs);
  bind_props($$props, { asChild, el });
  pop();
}
function Dialog_content($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "transition",
    "transitionConfig",
    "inTransition",
    "inTransitionConfig",
    "outTransition",
    "outTransitionConfig",
    "asChild",
    "id",
    "el"
  ]);
  push();
  var $$store_subs;
  let builder2;
  let transition = value_or_fallback($$props["transition"], () => void 0);
  let transitionConfig = value_or_fallback($$props["transitionConfig"], () => void 0);
  let inTransition = value_or_fallback($$props["inTransition"], () => void 0);
  let inTransitionConfig = value_or_fallback($$props["inTransitionConfig"], () => void 0);
  let outTransition = value_or_fallback($$props["outTransition"], () => void 0);
  let outTransitionConfig = value_or_fallback($$props["outTransitionConfig"], () => void 0);
  let asChild = value_or_fallback($$props["asChild"], () => false);
  let id = value_or_fallback($$props["id"], () => void 0);
  let el = value_or_fallback($$props["el"], () => void 0);
  const {
    elements: { content },
    states: { open },
    ids,
    getAttrs
  } = getCtx$1();
  const attrs = getAttrs("content");
  if (id) {
    ids.content.set(id);
  }
  builder2 = store_get($$store_subs ??= {}, "$content", content);
  Object.assign(builder2, attrs);
  $$payload.out += `<!--[-->`;
  if (asChild && store_get($$store_subs ??= {}, "$open", open)) {
    $$payload.out += `<!--[-->`;
    slot(
      $$payload,
      $$props.children,
      {
        get builder() {
          return builder2;
        }
      },
      null
    );
    $$payload.out += `<!--]-->`;
    $$payload.out += "<!--]-->";
  } else {
    $$payload.out += `<!--[-->`;
    if (transition && store_get($$store_subs ??= {}, "$open", open)) {
      $$payload.out += `<div${spread_attributes([builder2, $$restProps], true, true)}><!--[-->`;
      slot(
        $$payload,
        $$props.children,
        {
          get builder() {
            return builder2;
          }
        },
        null
      );
      $$payload.out += `<!--]--></div>`;
      $$payload.out += "<!--]-->";
    } else {
      $$payload.out += `<!--[-->`;
      if (inTransition && outTransition && store_get($$store_subs ??= {}, "$open", open)) {
        $$payload.out += `<div${spread_attributes([builder2, $$restProps], true, true)}><!--[-->`;
        slot(
          $$payload,
          $$props.children,
          {
            get builder() {
              return builder2;
            }
          },
          null
        );
        $$payload.out += `<!--]--></div>`;
        $$payload.out += "<!--]-->";
      } else {
        $$payload.out += `<!--[-->`;
        if (inTransition && store_get($$store_subs ??= {}, "$open", open)) {
          $$payload.out += `<div${spread_attributes([builder2, $$restProps], true, true)}><!--[-->`;
          slot(
            $$payload,
            $$props.children,
            {
              get builder() {
                return builder2;
              }
            },
            null
          );
          $$payload.out += `<!--]--></div>`;
          $$payload.out += "<!--]-->";
        } else {
          $$payload.out += `<!--[-->`;
          if (outTransition && store_get($$store_subs ??= {}, "$open", open)) {
            $$payload.out += `<div${spread_attributes([builder2, $$restProps], true, true)}><!--[-->`;
            slot(
              $$payload,
              $$props.children,
              {
                get builder() {
                  return builder2;
                }
              },
              null
            );
            $$payload.out += `<!--]--></div>`;
            $$payload.out += "<!--]-->";
          } else {
            $$payload.out += `<!--[-->`;
            if (store_get($$store_subs ??= {}, "$open", open)) {
              $$payload.out += `<div${spread_attributes([builder2, $$restProps], true, true)}><!--[-->`;
              slot(
                $$payload,
                $$props.children,
                {
                  get builder() {
                    return builder2;
                  }
                },
                null
              );
              $$payload.out += `<!--]--></div>`;
              $$payload.out += "<!--]-->";
            } else {
              $$payload.out += "<!--]!-->";
            }
            $$payload.out += "<!--]!-->";
          }
          $$payload.out += "<!--]!-->";
        }
        $$payload.out += "<!--]!-->";
      }
      $$payload.out += "<!--]!-->";
    }
    $$payload.out += "<!--]!-->";
  }
  if ($$store_subs)
    unsubscribe_stores($$store_subs);
  bind_props($$props, {
    transition,
    transitionConfig,
    inTransition,
    inTransitionConfig,
    outTransition,
    outTransitionConfig,
    asChild,
    id,
    el
  });
  pop();
}
function Dialog_overlay($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "transition",
    "transitionConfig",
    "inTransition",
    "inTransitionConfig",
    "outTransition",
    "outTransitionConfig",
    "asChild",
    "el"
  ]);
  push();
  var $$store_subs;
  let builder2;
  let transition = value_or_fallback($$props["transition"], () => void 0);
  let transitionConfig = value_or_fallback($$props["transitionConfig"], () => void 0);
  let inTransition = value_or_fallback($$props["inTransition"], () => void 0);
  let inTransitionConfig = value_or_fallback($$props["inTransitionConfig"], () => void 0);
  let outTransition = value_or_fallback($$props["outTransition"], () => void 0);
  let outTransitionConfig = value_or_fallback($$props["outTransitionConfig"], () => void 0);
  let asChild = value_or_fallback($$props["asChild"], () => false);
  let el = value_or_fallback($$props["el"], () => void 0);
  const {
    elements: { overlay },
    states: { open },
    getAttrs
  } = getCtx$1();
  const attrs = getAttrs("overlay");
  builder2 = store_get($$store_subs ??= {}, "$overlay", overlay);
  Object.assign(builder2, attrs);
  $$payload.out += `<!--[-->`;
  if (asChild && store_get($$store_subs ??= {}, "$open", open)) {
    $$payload.out += `<!--[-->`;
    slot(
      $$payload,
      $$props.children,
      {
        get builder() {
          return builder2;
        }
      },
      null
    );
    $$payload.out += `<!--]-->`;
    $$payload.out += "<!--]-->";
  } else {
    $$payload.out += `<!--[-->`;
    if (transition && store_get($$store_subs ??= {}, "$open", open)) {
      $$payload.out += `<div${spread_attributes([builder2, $$restProps], true, true)}></div>`;
      $$payload.out += "<!--]-->";
    } else {
      $$payload.out += `<!--[-->`;
      if (inTransition && outTransition && store_get($$store_subs ??= {}, "$open", open)) {
        $$payload.out += `<div${spread_attributes([builder2, $$restProps], true, true)}></div>`;
        $$payload.out += "<!--]-->";
      } else {
        $$payload.out += `<!--[-->`;
        if (inTransition && store_get($$store_subs ??= {}, "$open", open)) {
          $$payload.out += `<div${spread_attributes([builder2, $$restProps], true, true)}></div>`;
          $$payload.out += "<!--]-->";
        } else {
          $$payload.out += `<!--[-->`;
          if (outTransition && store_get($$store_subs ??= {}, "$open", open)) {
            $$payload.out += `<div${spread_attributes([builder2, $$restProps], true, true)}></div>`;
            $$payload.out += "<!--]-->";
          } else {
            $$payload.out += `<!--[-->`;
            if (store_get($$store_subs ??= {}, "$open", open)) {
              $$payload.out += `<div${spread_attributes([builder2, $$restProps], true, true)}></div>`;
              $$payload.out += "<!--]-->";
            } else {
              $$payload.out += "<!--]!-->";
            }
            $$payload.out += "<!--]!-->";
          }
          $$payload.out += "<!--]!-->";
        }
        $$payload.out += "<!--]!-->";
      }
      $$payload.out += "<!--]!-->";
    }
    $$payload.out += "<!--]!-->";
  }
  if ($$store_subs)
    unsubscribe_stores($$store_subs);
  bind_props($$props, {
    transition,
    transitionConfig,
    inTransition,
    inTransitionConfig,
    outTransition,
    outTransitionConfig,
    asChild,
    el
  });
  pop();
}
function getOptionUpdater(options) {
  return function(key, value) {
    if (value === void 0)
      return;
    const store = options[key];
    if (store) {
      store.set(value);
    }
  };
}
const TRANSITIONS = {
  DURATION: 0.5,
  EASE: [0.32, 0.72, 0, 1]
};
const VELOCITY_THRESHOLD = 0.4;
function effect(stores, fn) {
  if (typeof document === "undefined") {
    return () => {
    };
  }
  const unsub = derivedWithUnsubscribe(stores, (stores2, onUnsubscribe) => {
    return {
      stores: stores2,
      onUnsubscribe
    };
  }).subscribe(({ stores: stores2, onUnsubscribe }) => {
    const returned = fn(stores2);
    if (returned) {
      onUnsubscribe(returned);
    }
  });
  safeOnDestroy(unsub);
  return unsub;
}
function derivedWithUnsubscribe(stores, fn) {
  let unsubscribers = [];
  const onUnsubscribe = (cb) => {
    unsubscribers.push(cb);
  };
  const unsubscribe = () => {
    unsubscribers.forEach((fn2) => fn2());
    unsubscribers = [];
  };
  const derivedStore = derived(stores, ($storeValues) => {
    unsubscribe();
    return fn($storeValues, onUnsubscribe);
  });
  safeOnDestroy(unsubscribe);
  const subscribe = (...args) => {
    const unsub = derivedStore.subscribe(...args);
    return () => {
      unsub();
      unsubscribe();
    };
  };
  return {
    ...derivedStore,
    subscribe
  };
}
const safeOnDestroy = (fn) => {
  try {
    onDestroy(fn);
  } catch {
    return fn();
  }
};
const overridable = (store, onChange) => {
  const update = (updater, sideEffect) => {
    store.update((curr) => {
      const next = updater(curr);
      let res = next;
      if (onChange) {
        res = onChange({ curr, next });
      }
      sideEffect?.(res);
      return res;
    });
  };
  const set2 = (curr) => {
    update(() => curr);
  };
  return {
    ...store,
    update,
    set: set2
  };
};
function toWritableStores(properties) {
  const result = {};
  Object.keys(properties).forEach((key) => {
    const propertyKey = key;
    const value = properties[propertyKey];
    result[propertyKey] = writable(value);
  });
  return result;
}
function omit(obj, ...keys) {
  const result = {};
  for (const key of Object.keys(obj)) {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}
function removeUndefined(obj) {
  const result = {};
  for (const key in obj) {
    const value = obj[key];
    if (value !== void 0) {
      result[key] = value;
    }
  }
  return result;
}
const cache = /* @__PURE__ */ new WeakMap();
function set(el, styles, ignoreCache = false) {
  if (!el || !(el instanceof HTMLElement) || !styles)
    return;
  const originalStyles = {};
  Object.entries(styles).forEach(([key, value]) => {
    if (key.startsWith("--")) {
      el.style.setProperty(key, value);
      return;
    }
    originalStyles[key] = el.style[key];
    el.style[key] = value;
  });
  if (ignoreCache)
    return;
  cache.set(el, originalStyles);
}
function reset(el, prop) {
  if (!el || !(el instanceof HTMLElement))
    return;
  const originalStyles = cache.get(el);
  if (!originalStyles) {
    return;
  }
  if (prop) {
    el.style[prop] = originalStyles[prop];
  } else {
    Object.entries(originalStyles).forEach(([key, value]) => {
      el.style[key] = value;
    });
  }
}
function getTranslate(element, direction) {
  const style = window.getComputedStyle(element);
  const transform = (
    // @ts-expect-error - vendor prefix
    style.transform || style.webkitTransform || style.mozTransform
  );
  let mat = transform.match(/^matrix3d\((.+)\)$/);
  if (mat) {
    return parseFloat(mat[1].split(", ")[isVertical(direction) ? 13 : 12]);
  }
  mat = transform.match(/^matrix\((.+)\)$/);
  return mat ? parseFloat(mat[1].split(", ")[isVertical(direction) ? 5 : 4]) : null;
}
function styleToString(style) {
  return Object.keys(style).reduce((str, key) => {
    if (style[key] === void 0)
      return str;
    return str + `${key}:${style[key]};`;
  }, "");
}
function noop() {
}
function addEventListener(target, event, handler, options) {
  const events = Array.isArray(event) ? event : [event];
  events.forEach((_event) => target.addEventListener(_event, handler, options));
  return () => {
    events.forEach((_event) => target.removeEventListener(_event, handler, options));
  };
}
const nonTextInputTypes = /* @__PURE__ */ new Set([
  "checkbox",
  "radio",
  "range",
  "color",
  "file",
  "image",
  "button",
  "submit",
  "reset"
]);
const isBrowser = typeof document !== "undefined";
function isInput(target) {
  return target instanceof HTMLInputElement && !nonTextInputTypes.has(target.type) || target instanceof HTMLTextAreaElement || target instanceof HTMLElement && target.isContentEditable;
}
function isVertical(direction) {
  if (direction === "top" || direction === "bottom")
    return true;
  return false;
}
function isBottomOrRight(direction) {
  if (direction === "bottom" || direction === "right")
    return true;
  return false;
}
function chain(...callbacks) {
  return (...args) => {
    for (const callback of callbacks) {
      if (typeof callback === "function") {
        callback(...args);
      }
    }
  };
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function handleSnapPoints({ activeSnapPoint, snapPoints, drawerRef, overlayRef, fadeFromIndex, openTime, direction }) {
  const isLastSnapPoint = derived([snapPoints, activeSnapPoint], ([$snapPoints, $activeSnapPoint]) => {
    return $activeSnapPoint === $snapPoints?.[$snapPoints.length - 1];
  });
  const shouldFade = derived([snapPoints, fadeFromIndex, activeSnapPoint], ([$snapPoints, $fadeFromIndex, $activeSnapPoint]) => {
    return $snapPoints && $snapPoints.length > 0 && ($fadeFromIndex || $fadeFromIndex === 0) && !Number.isNaN($fadeFromIndex) && $snapPoints[$fadeFromIndex] === $activeSnapPoint || !$snapPoints;
  });
  const activeSnapPointIndex = derived([snapPoints, activeSnapPoint], ([$snapPoints, $activeSnapPoint]) => $snapPoints?.findIndex((snapPoint) => snapPoint === $activeSnapPoint) ?? null);
  const snapPointsOffset = derived(snapPoints, ($snapPoints) => {
    if ($snapPoints) {
      return $snapPoints.map((snapPoint) => {
        const hasWindow = typeof window !== "undefined";
        const isPx = typeof snapPoint === "string";
        let snapPointAsNumber = 0;
        if (isPx) {
          snapPointAsNumber = parseInt(snapPoint, 10);
        }
        const $direction = get_store_value(direction);
        if (isVertical($direction)) {
          const height = isPx ? snapPointAsNumber : hasWindow ? snapPoint * window.innerHeight : 0;
          if (hasWindow) {
            return $direction === "bottom" ? window.innerHeight - height : window.innerHeight + height;
          }
          return height;
        }
        const width = isPx ? snapPointAsNumber : hasWindow ? snapPoint * window.innerWidth : 0;
        if (hasWindow) {
          return $direction === "right" ? window.innerWidth - width : window.innerWidth + width;
        }
        return width;
      });
    }
    return [];
  });
  const activeSnapPointOffset = derived([snapPointsOffset, activeSnapPointIndex], ([$snapPointsOffset, $activeSnapPointIndex]) => $activeSnapPointIndex !== null ? $snapPointsOffset?.[$activeSnapPointIndex] : null);
  effect([activeSnapPoint, drawerRef], ([$activeSnapPoint, $drawerRef]) => {
    if ($activeSnapPoint && $drawerRef) {
      const $snapPoints = get_store_value(snapPoints);
      const $snapPointsOffset = get_store_value(snapPointsOffset);
      const newIndex = $snapPoints?.findIndex((snapPoint) => snapPoint === $activeSnapPoint) ?? -1;
      if ($snapPointsOffset && newIndex !== -1 && typeof $snapPointsOffset[newIndex] === "number") {
        snapToPoint($snapPointsOffset[newIndex]);
      }
    }
  });
  function snapToPoint(dimension) {
    tick().then(() => {
      const $snapPointsOffset = get_store_value(snapPointsOffset);
      const newSnapPointIndex = $snapPointsOffset?.findIndex((snapPointDim) => snapPointDim === dimension) ?? null;
      const $drawerRef = get_store_value(drawerRef);
      const $direction = get_store_value(direction);
      onSnapPointChange(newSnapPointIndex);
      set($drawerRef, {
        transition: `transform ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(",")})`,
        transform: isVertical($direction) ? `translate3d(0, ${dimension}px, 0)` : `translate3d(${dimension}px, 0, 0)`
      });
      const $fadeFromIndex = get_store_value(fadeFromIndex);
      const $overlayRef = get_store_value(overlayRef);
      if (snapPointsOffset && newSnapPointIndex !== $snapPointsOffset.length - 1 && newSnapPointIndex !== $fadeFromIndex) {
        set($overlayRef, {
          transition: `opacity ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(",")})`,
          opacity: "0"
        });
      } else {
        set($overlayRef, {
          transition: `opacity ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(",")})`,
          opacity: "1"
        });
      }
      activeSnapPoint.update(() => {
        const $snapPoints = get_store_value(snapPoints);
        if (newSnapPointIndex === null || !$snapPoints)
          return null;
        return $snapPoints[newSnapPointIndex];
      });
    });
  }
  function onRelease({ draggedDistance, closeDrawer, velocity, dismissible }) {
    const $fadeFromIndex = get_store_value(fadeFromIndex);
    if ($fadeFromIndex === void 0)
      return;
    const $activeSnapPointOffset = get_store_value(activeSnapPointOffset);
    const $activeSnapPointIndex = get_store_value(activeSnapPointIndex);
    const $overlayRef = get_store_value(overlayRef);
    const $snapPointsOffset = get_store_value(snapPointsOffset);
    const $snapPoints = get_store_value(snapPoints);
    const $direction = get_store_value(direction);
    const currentPosition = $direction === "bottom" || $direction === "right" ? ($activeSnapPointOffset ?? 0) - draggedDistance : ($activeSnapPointOffset ?? 0) + draggedDistance;
    const isOverlaySnapPoint = $activeSnapPointIndex === $fadeFromIndex - 1;
    const isFirst = $activeSnapPointIndex === 0;
    const hasDraggedUp = draggedDistance > 0;
    if (isOverlaySnapPoint) {
      set($overlayRef, {
        transition: `opacity ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(",")})`
      });
    }
    if (velocity > 2 && !hasDraggedUp) {
      if (dismissible)
        closeDrawer();
      else
        snapToPoint($snapPointsOffset[0]);
      return;
    }
    if (velocity > 2 && hasDraggedUp && $snapPointsOffset && $snapPoints) {
      snapToPoint($snapPointsOffset[$snapPoints.length - 1]);
      return;
    }
    const closestSnapPoint = $snapPointsOffset?.reduce((prev, curr) => {
      if (typeof prev !== "number" || typeof curr !== "number")
        return prev;
      return Math.abs(curr - currentPosition) < Math.abs(prev - currentPosition) ? curr : prev;
    });
    const dim = isVertical($direction) ? window.innerHeight : window.innerWidth;
    if (velocity > VELOCITY_THRESHOLD && Math.abs(draggedDistance) < dim * 0.4) {
      const dragDirection = hasDraggedUp ? 1 : -1;
      if (dragDirection > 0 && get_store_value(isLastSnapPoint) && $snapPoints) {
        snapToPoint($snapPointsOffset[$snapPoints.length - 1]);
        return;
      }
      if (isFirst && dragDirection < 0 && dismissible) {
        closeDrawer();
      }
      if ($activeSnapPointIndex === null)
        return;
      snapToPoint($snapPointsOffset[$activeSnapPointIndex + dragDirection]);
      return;
    }
    snapToPoint(closestSnapPoint);
  }
  function onDrag({ draggedDistance }) {
    const $drawerRef = get_store_value(drawerRef);
    const $activeSnapPointOffset = get_store_value(activeSnapPointOffset);
    if ($activeSnapPointOffset === null)
      return;
    const $snapPointsOffset = get_store_value(snapPointsOffset);
    const $direction = get_store_value(direction);
    const newValue = $direction === "bottom" || $direction === "right" ? $activeSnapPointOffset - draggedDistance : $activeSnapPointOffset + draggedDistance;
    const lastSnapPoint = $snapPointsOffset[$snapPointsOffset.length - 1];
    if (isBottomOrRight($direction) && newValue < lastSnapPoint) {
      return;
    }
    if (!isBottomOrRight($direction) && newValue > lastSnapPoint) {
      return;
    }
    set($drawerRef, {
      transform: isVertical($direction) ? `translate3d(0, ${newValue}px, 0)` : `translate3d(${newValue}px, 0, 0)`
    });
  }
  function getPercentageDragged(absDraggedDistance, isDraggingDown) {
    const $activeSnapPointIndex = get_store_value(activeSnapPointIndex);
    const $snapPointsOffset = get_store_value(snapPointsOffset);
    const $snapPoints = get_store_value(snapPoints);
    const $fadeFromIndex = get_store_value(fadeFromIndex);
    if (!$snapPoints || typeof $activeSnapPointIndex !== "number" || !$snapPointsOffset || $fadeFromIndex === void 0)
      return null;
    const isOverlaySnapPoint = $activeSnapPointIndex === $fadeFromIndex - 1;
    const isOverlaySnapPointOrHigher = $activeSnapPointIndex >= $fadeFromIndex;
    if (isOverlaySnapPointOrHigher && isDraggingDown) {
      return 0;
    }
    if (isOverlaySnapPoint && !isDraggingDown)
      return 1;
    if (!get_store_value(shouldFade) && !isOverlaySnapPoint)
      return null;
    const targetSnapPointIndex = isOverlaySnapPoint ? $activeSnapPointIndex + 1 : $activeSnapPointIndex - 1;
    const snapPointDistance = isOverlaySnapPoint ? $snapPointsOffset[targetSnapPointIndex] - $snapPointsOffset[targetSnapPointIndex - 1] : $snapPointsOffset[targetSnapPointIndex + 1] - $snapPointsOffset[targetSnapPointIndex];
    const percentageDragged = absDraggedDistance / Math.abs(snapPointDistance);
    if (isOverlaySnapPoint) {
      return 1 - percentageDragged;
    } else {
      return percentageDragged;
    }
  }
  function onSnapPointChange(activeSnapPointIndex2) {
    const $snapPoints = get_store_value(snapPoints);
    const $snapPointsOffset = get_store_value(snapPointsOffset);
    if ($snapPoints && activeSnapPointIndex2 === $snapPointsOffset.length - 1) {
      openTime.set(/* @__PURE__ */ new Date());
    }
  }
  return {
    isLastSnapPoint,
    shouldFade,
    getPercentageDragged,
    activeSnapPointIndex,
    onRelease,
    onDrag,
    snapPointsOffset
  };
}
function isMac() {
  return testPlatform(/^Mac/);
}
function isIPhone() {
  return testPlatform(/^iPhone/);
}
function isIPad() {
  return testPlatform(/^iPad/) || // iPadOS 13 lies and says it's a Mac, but we can distinguish by detecting touch support.
  isMac() && navigator.maxTouchPoints > 1;
}
function isIOS() {
  return isIPhone() || isIPad();
}
function testPlatform(re) {
  return typeof window !== "undefined" && window.navigator != null ? re.test(window.navigator.platform) : void 0;
}
const visualViewport = typeof document !== "undefined" && window.visualViewport;
function isScrollable(node) {
  const style = window.getComputedStyle(node);
  return /(auto|scroll)/.test(style.overflow + style.overflowX + style.overflowY);
}
function getScrollParent(node) {
  if (isScrollable(node)) {
    node = node.parentElement;
  }
  while (node && !isScrollable(node)) {
    node = node.parentElement;
  }
  return node || document.scrollingElement || document.documentElement;
}
let preventScrollCount = 0;
let restore;
function preventScroll() {
  if (typeof document === "undefined")
    return () => {
    };
  preventScrollCount++;
  if (preventScrollCount === 1) {
    if (isIOS()) {
      restore = preventScrollMobileSafari();
    } else {
      restore = preventScrollStandard();
    }
  }
  return () => {
    preventScrollCount--;
    if (preventScrollCount === 0) {
      restore();
    }
  };
}
function getPaddingProperty(documentElement) {
  const documentLeft = documentElement.getBoundingClientRect().left;
  const scrollbarX = Math.round(documentLeft) + documentElement.scrollLeft;
  return scrollbarX ? "paddingLeft" : "paddingRight";
}
function setCSSProperty(el, property, value) {
  if (!el)
    return;
  const previousValue = el.style.getPropertyValue(property);
  el.style.setProperty(property, value);
  return () => {
    if (previousValue) {
      el.style.setProperty(property, previousValue);
    } else {
      el.style.removeProperty(property);
    }
  };
}
function preventScrollStandard() {
  if (typeof document === "undefined")
    return () => {
    };
  const win = document.defaultView ?? window;
  const { documentElement, body } = document;
  const scrollbarWidth = win.innerWidth - documentElement.clientWidth;
  const setScrollbarWidthProperty = () => setCSSProperty(documentElement, "--scrollbar-width", `${scrollbarWidth}px`);
  const paddingProperty = getPaddingProperty(documentElement);
  const scrollbarSidePadding = win.getComputedStyle(body)[paddingProperty];
  return chain(setScrollbarWidthProperty(), setStyle(body, paddingProperty, `calc(${scrollbarSidePadding} + ${scrollbarWidth}px)`), setStyle(body, "overflow", "hidden"));
}
function preventScrollMobileSafari() {
  let scrollable;
  let lastY = 0;
  const { documentElement, body, activeElement } = document;
  function onTouchStart(e) {
    scrollable = getScrollParent(e.target);
    if (scrollable === documentElement && scrollable === body)
      return;
    lastY = e.changedTouches[0].pageY;
  }
  function onTouchMove(e) {
    if (!scrollable || scrollable === documentElement || scrollable === body) {
      e.preventDefault();
      return;
    }
    const y = e.changedTouches[0].pageY;
    const scrollTop = scrollable.scrollTop;
    const bottom = scrollable.scrollHeight - scrollable.clientHeight;
    if (bottom === 0)
      return;
    if (scrollTop <= 0 && y > lastY || scrollTop >= bottom && y < lastY) {
      e.preventDefault();
    }
    lastY = y;
  }
  function onTouchEnd(e) {
    const target = e.target;
    if (!(isInput(target) && target !== activeElement))
      return;
    e.preventDefault();
    target.style.transform = "translateY(-2000px)";
    target.focus();
    requestAnimationFrame(() => {
      target.style.transform = "";
    });
  }
  function onFocus(e) {
    const target = e.target;
    if (!isInput(target))
      return;
    target.style.transform = "translateY(-2000px)";
    requestAnimationFrame(() => {
      target.style.transform = "";
      if (visualViewport) {
        if (visualViewport.height < window.innerHeight) {
          requestAnimationFrame(() => {
            scrollIntoView(target);
          });
        } else {
          visualViewport.addEventListener("resize", () => scrollIntoView(target), { once: true });
        }
      }
    });
  }
  function onWindowScroll() {
    window.scrollTo(0, 0);
  }
  const scrollX = window.pageXOffset;
  const scrollY = window.pageYOffset;
  const restoreStyles = chain(
    setStyle(documentElement, "paddingRight", `${window.innerWidth - documentElement.clientWidth}px`),
    setStyle(documentElement, "overflow", "hidden")
    // setStyle(document.body, 'marginTop', `-${scrollY}px`),
  );
  window.scrollTo(0, 0);
  const removeEvents = chain(addEventListener(document, "touchstart", onTouchStart, { passive: false, capture: true }), addEventListener(document, "touchmove", onTouchMove, { passive: false, capture: true }), addEventListener(document, "touchend", onTouchEnd, { passive: false, capture: true }), addEventListener(document, "focus", onFocus, true), addEventListener(window, "scroll", onWindowScroll));
  return () => {
    restoreStyles();
    removeEvents();
    window.scrollTo(scrollX, scrollY);
  };
}
function setStyle(element, style, value) {
  const cur = element.style[style];
  element.style[style] = value;
  return () => {
    element.style[style] = cur;
  };
}
function scrollIntoView(target) {
  const { documentElement, body, scrollingElement } = document;
  const root = scrollingElement || documentElement;
  while (target && target !== root) {
    const scrollable = getScrollParent(target);
    if (scrollable !== documentElement && scrollable !== body && scrollable !== target) {
      const scrollableTop = scrollable.getBoundingClientRect().top;
      const targetTop = target.getBoundingClientRect().top;
      const targetBottom = target.getBoundingClientRect().bottom;
      const keyboardHeight = scrollable.getBoundingClientRect().bottom;
      if (targetBottom > keyboardHeight) {
        scrollable.scrollTop += targetTop - scrollableTop;
      }
    }
    target = scrollable.parentElement;
  }
}
const documentEscapeKeyStore = readable(void 0, (set2) => {
  function keydown(event) {
    if (event && event.key === "Escape") {
      set2(event);
    }
    set2(void 0);
  }
  const unsubscribe = addEventListener(document, "keydown", keydown, {
    passive: false
  });
  return unsubscribe;
});
function handleEscapeKeydown(node, handler) {
  let unsub = noop;
  function update(handler2) {
    unsub();
    unsub = chain(
      // Handle escape keydowns
      documentEscapeKeyStore.subscribe((e) => {
        if (!e)
          return;
        const target = e.target;
        if (!isHTMLElement(target) || target.closest("[data-escapee]") !== node) {
          return;
        }
        e.preventDefault();
        handler2(e);
      })
    );
    node.setAttribute("data-escapee", "");
  }
  update(handler);
  return () => {
    unsub();
    node.removeAttribute("data-escapee");
  };
}
function isHTMLElement(el) {
  return el instanceof HTMLElement;
}
let previousBodyPosition = null;
function handlePositionFixed({ isOpen, modal, nested, hasBeenOpened }) {
  const activeUrl = writable(typeof window !== "undefined" ? window.location.href : "");
  let scrollPos = 0;
  function setPositionFixed(open) {
    if (!(previousBodyPosition === null && open))
      return;
    previousBodyPosition = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      height: document.body.style.height
    };
    const { scrollX, innerHeight } = window;
    document.body.style.setProperty("position", "fixed", "important");
    document.body.style.top = `${-scrollPos}px`;
    document.body.style.left = `${-scrollX}px`;
    document.body.style.right = "0px";
    document.body.style.height = "auto";
    setTimeout(() => requestAnimationFrame(() => {
      const bottomBarHeight = innerHeight - window.innerHeight;
      if (bottomBarHeight && scrollPos >= innerHeight) {
        document.body.style.top = `${-(scrollPos + bottomBarHeight)}px`;
      }
    }), 300);
  }
  function restorePositionSetting() {
    if (previousBodyPosition === null)
      return;
    const $activeUrl = get_store_value(activeUrl);
    const y = -parseInt(document.body.style.top, 10);
    const x = -parseInt(document.body.style.left, 10);
    document.body.style.position = previousBodyPosition.position;
    document.body.style.top = previousBodyPosition.top;
    document.body.style.left = previousBodyPosition.left;
    document.body.style.height = previousBodyPosition.height;
    document.body.style.right = "unset";
    requestAnimationFrame(() => {
      if ($activeUrl !== window.location.href) {
        activeUrl.set(window.location.href);
        return;
      }
      window.scrollTo(x, y);
    });
    previousBodyPosition = null;
  }
  effect([isOpen, activeUrl], ([$isOpen, _]) => {
    if (typeof document === "undefined")
      return;
    if (get_store_value(nested) || !get_store_value(hasBeenOpened))
      return;
    if ($isOpen) {
      setPositionFixed($isOpen);
      if (!get_store_value(modal)) {
        setTimeout(() => {
          restorePositionSetting();
        }, 500);
      }
    } else {
      restorePositionSetting();
    }
  });
  return { restorePositionSetting };
}
const CLOSE_THRESHOLD = 0.25;
const SCROLL_LOCK_TIMEOUT = 100;
const BORDER_RADIUS = 8;
const NESTED_DISPLACEMENT = 16;
const WINDOW_TOP_OFFSET = 26;
const DRAG_CLASS = "vaul-dragging";
const openDrawerIds = writable([]);
const defaultProps = {
  closeThreshold: CLOSE_THRESHOLD,
  shouldScaleBackground: true,
  scrollLockTimeout: SCROLL_LOCK_TIMEOUT,
  onDrag: void 0,
  onRelease: void 0,
  snapPoints: void 0,
  fadeFromIndex: void 0,
  defaultActiveSnapPoint: void 0,
  onActiveSnapPointChange: void 0,
  defaultOpen: false,
  onOpenChange: void 0,
  fixed: void 0,
  dismissible: true,
  modal: true,
  nested: false,
  onClose: void 0,
  direction: "bottom"
};
const omittedOptions = [
  "defaultOpen",
  "onOpenChange",
  "defaultActiveSnapPoint",
  "onActiveSnapPointChange",
  "onDrag",
  "onRelease",
  "onClose"
];
function createVaul(props) {
  const { snapPoints: snapPointsProp, fadeFromIndex: fadeFromIndexProp = snapPointsProp && snapPointsProp.length - 1, ...withDefaults } = { ...defaultProps, ...removeUndefined(props) };
  const options = toWritableStores(omit({
    ...withDefaults,
    snapPoints: snapPointsProp,
    fadeFromIndex: fadeFromIndexProp
  }, ...omittedOptions));
  const triggerRef = writable(void 0);
  const { onDrag: onDragProp, onRelease: onReleaseProp, onClose, onOpenChange } = withDefaults;
  const { snapPoints, fadeFromIndex, fixed, dismissible, modal, nested, shouldScaleBackground, scrollLockTimeout, closeThreshold, direction } = options;
  const openStore = writable(withDefaults.defaultOpen);
  const isOpen = overridable(openStore, withDefaults.onOpenChange);
  const hasBeenOpened = writable(false);
  const visible = writable(false);
  const justReleased = writable(false);
  const overlayRef = writable(void 0);
  const openTime = writable(null);
  const keyboardIsOpen = writable(false);
  const drawerRef = writable(void 0);
  const drawerId = writable(void 0);
  let isDragging = false;
  let dragStartTime = null;
  let isClosing = false;
  let pointerStart = 0;
  let dragEndTime = null;
  let lastTimeDragPrevented = null;
  let isAllowedToDrag = false;
  let drawerHeightRef = get_store_value(drawerRef)?.getBoundingClientRect().height || 0;
  let previousDiffFromInitial = 0;
  let initialDrawerHeight = 0;
  let nestedOpenChangeTimer = null;
  const activeSnapPoint = overridable(writable(withDefaults.defaultActiveSnapPoint), withDefaults.onActiveSnapPointChange);
  const { activeSnapPointIndex, getPercentageDragged: getSnapPointsPercentageDragged, onDrag: onDragSnapPoints, onRelease: onReleaseSnapPoints, shouldFade, snapPointsOffset } = handleSnapPoints({
    snapPoints,
    activeSnapPoint,
    drawerRef,
    fadeFromIndex,
    overlayRef,
    openTime,
    direction
  });
  const getContentStyle = derived([snapPointsOffset], ([$snapPointsOffset]) => {
    return (style = "") => {
      if ($snapPointsOffset && $snapPointsOffset.length > 0) {
        const styleProp = styleToString({
          "--snap-point-height": `${$snapPointsOffset[0]}px`
        });
        return style + styleProp;
      }
      return style;
    };
  });
  effect([drawerRef], ([$drawerRef]) => {
    if ($drawerRef) {
      drawerId.set($drawerRef.id);
    }
  });
  effect([isOpen], ([$open]) => {
    sleep(100).then(() => {
      const id = get_store_value(drawerId);
      if ($open && id) {
        openDrawerIds.update((prev) => {
          if (prev.includes(id)) {
            return prev;
          }
          prev.push(id);
          return prev;
        });
      } else {
        openDrawerIds.update((prev) => prev.filter((id2) => id2 !== id2));
      }
    });
  });
  effect([isOpen], ([$isOpen]) => {
    if (!$isOpen && get_store_value(shouldScaleBackground)) {
      const id = setTimeout(() => {
        reset(document.body, "background");
      }, 200);
      return () => clearTimeout(id);
    }
  });
  effect([isOpen], ([$isOpen]) => {
    let unsub = () => {
    };
    if ($isOpen) {
      unsub = preventScroll();
    }
    return unsub;
  });
  const { restorePositionSetting } = handlePositionFixed({ isOpen, modal, nested, hasBeenOpened });
  effect([drawerRef], ([$drawerRef]) => {
    let unsub = noop;
    if ($drawerRef) {
      unsub = handleEscapeKeydown($drawerRef, () => {
        closeDrawer(true);
      });
    }
    return () => {
      unsub();
    };
  });
  function openDrawer() {
    if (isClosing)
      return;
    hasBeenOpened.set(true);
    isOpen.set(true);
  }
  function onPress(event) {
    const $drawerRef = get_store_value(drawerRef);
    if (!get_store_value(dismissible) && !get_store_value(snapPoints))
      return;
    if ($drawerRef && !$drawerRef.contains(event.target))
      return;
    drawerHeightRef = $drawerRef?.getBoundingClientRect().height || 0;
    isDragging = true;
    dragStartTime = /* @__PURE__ */ new Date();
    if (isIOS()) {
      window.addEventListener("touchend", () => isAllowedToDrag = false, { once: true });
    }
    event.target.setPointerCapture(event.pointerId);
    pointerStart = isVertical(get_store_value(direction)) ? event.screenY : event.screenX;
  }
  function shouldDrag(el, isDraggingInDirection) {
    const $drawerRef = get_store_value(drawerRef);
    let element = el;
    const highlightedText = window.getSelection()?.toString();
    const $direction = get_store_value(direction);
    const swipeAmount = $drawerRef ? getTranslate($drawerRef, $direction) : null;
    const date = /* @__PURE__ */ new Date();
    if (element.hasAttribute("data-vaul-no-drag") || element.closest("[data-vaul-no-drag]")) {
      return false;
    }
    const $openTime = get_store_value(openTime);
    if ($openTime && date.getTime() - $openTime.getTime() < 500) {
      return false;
    }
    if (swipeAmount !== null) {
      if ($direction === "bottom" || $direction === "right" ? swipeAmount > 0 : swipeAmount < 0) {
        return true;
      }
    }
    if (swipeAmount !== null && swipeAmount > 0) {
      return true;
    }
    if (highlightedText && highlightedText.length > 0) {
      return false;
    }
    const $scrollLockTimeout = get_store_value(scrollLockTimeout);
    if (lastTimeDragPrevented && date.getTime() - lastTimeDragPrevented.getTime() < $scrollLockTimeout && swipeAmount === 0) {
      lastTimeDragPrevented = date;
      return false;
    }
    if (isDraggingInDirection) {
      lastTimeDragPrevented = date;
      return false;
    }
    while (element) {
      if (element.scrollHeight > element.clientHeight) {
        if (element.scrollTop !== 0) {
          lastTimeDragPrevented = /* @__PURE__ */ new Date();
          return false;
        }
        if (element.getAttribute("role") === "dialog") {
          return true;
        }
      }
      element = element.parentNode;
    }
    return true;
  }
  function onDrag(event) {
    const $drawerRef = get_store_value(drawerRef);
    if (!$drawerRef || !isDragging)
      return;
    const $direction = get_store_value(direction);
    const directionMultiplier = getDirectionMultiplier($direction);
    const draggedDistance = getDistanceMoved(pointerStart, $direction, event) * directionMultiplier;
    const isDraggingInDirection = draggedDistance > 0;
    const $activeSnapPointIndex = get_store_value(activeSnapPointIndex);
    const $snapPoints = get_store_value(snapPoints);
    if ($snapPoints && $activeSnapPointIndex === 0 && !get_store_value(dismissible))
      return;
    if (!isAllowedToDrag && !shouldDrag(event.target, isDraggingInDirection)) {
      return;
    }
    $drawerRef.classList.add(DRAG_CLASS);
    isAllowedToDrag = true;
    set($drawerRef, {
      transition: "none"
    });
    const $overlayRef = get_store_value(overlayRef);
    set($overlayRef, {
      transition: "none"
    });
    if ($snapPoints) {
      onDragSnapPoints({ draggedDistance });
    }
    if (isDraggingInDirection && !$snapPoints) {
      const dampenedDraggedDistance = dampenValue(draggedDistance);
      const translateValue = Math.min(dampenedDraggedDistance * -1, 0) * directionMultiplier;
      set($drawerRef, {
        transform: isVertical($direction) ? `translate3d(0, ${translateValue}px, 0)` : `translate3d(${translateValue}px, 0, 0)`
      });
      return;
    }
    const absDraggedDistance = Math.abs(draggedDistance);
    let percentageDragged = absDraggedDistance / drawerHeightRef;
    const snapPointPercentageDragged = getSnapPointsPercentageDragged(absDraggedDistance, isDraggingInDirection);
    if (snapPointPercentageDragged !== null) {
      percentageDragged = snapPointPercentageDragged;
    }
    const opacityValue = 1 - percentageDragged;
    const $fadeFromIndex = get_store_value(fadeFromIndex);
    const $shouldFade = get_store_value(shouldFade);
    if ($shouldFade || $fadeFromIndex && $activeSnapPointIndex === $fadeFromIndex - 1) {
      onDragProp?.(event, percentageDragged);
      set($overlayRef, {
        opacity: `${opacityValue}`,
        transition: "none"
      }, true);
    }
    const wrapper = document.querySelector("[data-vaul-drawer-wrapper]");
    if (wrapper && $overlayRef && get_store_value(shouldScaleBackground)) {
      const scaleValue = Math.min(getScale() + percentageDragged * (1 - getScale()), 1);
      const borderRadiusValue = 8 - percentageDragged * 8;
      const translateValue = Math.max(0, 14 - percentageDragged * 14);
      set(wrapper, {
        borderRadius: `${borderRadiusValue}px`,
        transform: isVertical($direction) ? `scale(${scaleValue}) translate3d(0, ${translateValue}px, 0)` : `scale(${scaleValue}) translate3d(${translateValue}px, 0, 0)`,
        transition: "none"
      }, true);
    }
    if (!$snapPoints) {
      const translateValue = absDraggedDistance * directionMultiplier;
      set($drawerRef, {
        transform: isVertical($direction) ? `translate3d(0, ${translateValue}px, 0)` : `translate3d(${translateValue}px, 0, 0)`
      });
    }
  }
  function scaleBackground(open, backgroundColor = "black") {
    const wrapper = document.querySelector("[data-vaul-drawer-wrapper]");
    if (!wrapper || !get_store_value(shouldScaleBackground))
      return;
    const $direction = get_store_value(direction);
    if (open) {
      set(document.body, {
        background: document.body.style.backgroundColor || document.body.style.background
      });
      set(document.body, {
        background: backgroundColor
      }, true);
      set(wrapper, {
        borderRadius: `${BORDER_RADIUS}px`,
        overflow: "hidden",
        ...isVertical($direction) ? {
          transform: `scale(${getScale()}) translate3d(0, calc(env(safe-area-inset-top) + 14px), 0)`,
          transformOrigin: "top"
        } : {
          transform: `scale(${getScale()}) translate3d(calc(env(safe-area-inset-top) + 14px), 0, 0)`,
          transformOrigin: "left"
        },
        transitionProperty: "transform, border-radius",
        transitionDuration: `${TRANSITIONS.DURATION}s`,
        transitionTimingFunction: `cubic-bezier(${TRANSITIONS.EASE.join(",")})`
      });
    } else {
      reset(wrapper, "overflow");
      reset(wrapper, "transform");
      reset(wrapper, "borderRadius");
      set(wrapper, {
        transitionProperty: "transform, border-radius",
        transitionDuration: `${TRANSITIONS.DURATION}s`,
        transitionTimingFunction: `cubic-bezier(${TRANSITIONS.EASE.join(",")})`
      });
    }
  }
  effect([activeSnapPointIndex, snapPoints, snapPointsOffset], ([$activeSnapPointIndex, $snapPoints, $snapPointsOffset]) => {
    function onVisualViewportChange() {
      const $drawerRef = get_store_value(drawerRef);
      if (!$drawerRef)
        return;
      const $keyboardIsOpen = get_store_value(keyboardIsOpen);
      const focusedElement = document.activeElement;
      if (isInput(focusedElement) || $keyboardIsOpen) {
        const visualViewportHeight = window.visualViewport?.height || 0;
        let diffFromInitial = window.innerHeight - visualViewportHeight;
        const drawerHeight = $drawerRef.getBoundingClientRect().height || 0;
        if (!initialDrawerHeight) {
          initialDrawerHeight = drawerHeight;
        }
        const offsetFromTop = $drawerRef.getBoundingClientRect().top;
        if (Math.abs(previousDiffFromInitial - diffFromInitial) > 60) {
          keyboardIsOpen.set(!$keyboardIsOpen);
        }
        if ($snapPoints && $snapPoints.length > 0 && $snapPointsOffset && $activeSnapPointIndex) {
          const activeSnapPointHeight = $snapPointsOffset[$activeSnapPointIndex] || 0;
          diffFromInitial += activeSnapPointHeight;
        }
        previousDiffFromInitial = diffFromInitial;
        if (drawerHeight > visualViewportHeight || $keyboardIsOpen) {
          const height = $drawerRef.getBoundingClientRect().height;
          let newDrawerHeight = height;
          if (height > visualViewportHeight) {
            newDrawerHeight = visualViewportHeight - WINDOW_TOP_OFFSET;
          }
          if (get_store_value(fixed)) {
            $drawerRef.style.height = `${height - Math.max(diffFromInitial, 0)}px`;
          } else {
            $drawerRef.style.height = `${Math.max(newDrawerHeight, visualViewportHeight - offsetFromTop)}px`;
          }
        } else {
          $drawerRef.style.height = `${initialDrawerHeight}px`;
        }
        if ($snapPoints && $snapPoints.length > 0 && !$keyboardIsOpen) {
          $drawerRef.style.bottom = `0px`;
        } else {
          $drawerRef.style.bottom = `${Math.max(diffFromInitial, 0)}px`;
        }
      }
    }
    let removeListener = noop;
    if (window.visualViewport) {
      removeListener = addEventListener(window.visualViewport, "resize", onVisualViewportChange);
    }
    return () => {
      removeListener();
    };
  });
  function closeDrawer(withKeyboard = false) {
    if (isClosing)
      return;
    const $drawerRef = get_store_value(drawerRef);
    if (!$drawerRef)
      return;
    const $direction = get_store_value(direction);
    onClose?.();
    set($drawerRef, {
      transform: isVertical($direction) ? `translate3d(0, ${$direction === "bottom" ? "100%" : "-100%"}, 0)` : `translate3d(${$direction === "right" ? "100%" : "-100%"}, 0, 0)`,
      transition: `transform ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(",")})`
    });
    set(get_store_value(overlayRef), {
      opacity: "0",
      transition: `opacity ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(",")})`
    });
    scaleBackground(false);
    isClosing = true;
    setTimeout(() => {
      visible.set(false);
      isOpen.set(false);
      isClosing = false;
      if (withKeyboard) {
        get_store_value(triggerRef)?.focus();
      }
    }, 300);
    const $snapPoints = get_store_value(snapPoints);
    setTimeout(() => {
      reset(document.documentElement, "scrollBehavior");
      if ($snapPoints) {
        activeSnapPoint.set($snapPoints[0]);
      }
    }, TRANSITIONS.DURATION * 1e3);
  }
  effect([isOpen], ([$isOpen]) => {
    if ($isOpen) {
      hasBeenOpened.set(true);
    } else {
      closeDrawer();
    }
  });
  function resetDrawer() {
    const $drawerRef = get_store_value(drawerRef);
    if (!$drawerRef)
      return;
    const $overlayRef = get_store_value(overlayRef);
    const wrapper = document.querySelector("[data-vaul-drawer-wrapper]");
    const $direction = get_store_value(direction);
    const currentSwipeAmount = getTranslate($drawerRef, $direction);
    set($drawerRef, {
      transform: "translate3d(0, 0, 0)",
      transition: `transform ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(",")})`
    });
    set($overlayRef, {
      transition: `opacity ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(",")})`,
      opacity: "1"
    });
    const $shouldScaleBackground = get_store_value(shouldScaleBackground);
    const $isOpen = get_store_value(isOpen);
    if ($shouldScaleBackground && currentSwipeAmount && currentSwipeAmount > 0 && $isOpen) {
      set(wrapper, {
        borderRadius: `${BORDER_RADIUS}px`,
        overflow: "hidden",
        ...isVertical($direction) ? {
          transform: `scale(${getScale()}) translate3d(0, calc(env(safe-area-inset-top) + 14px), 0)`,
          transformOrigin: "top"
        } : {
          transform: `scale(${getScale()}) translate3d(calc(env(safe-area-inset-top) + 14px), 0, 0)`,
          transformOrigin: "left"
        },
        transitionProperty: "transform, border-radius",
        transitionDuration: `${TRANSITIONS.DURATION}s`,
        transitionTimingFunction: `cubic-bezier(${TRANSITIONS.EASE.join(",")})`
      }, true);
    }
  }
  function onRelease(event) {
    const $drawerRef = get_store_value(drawerRef);
    if (!isDragging || !$drawerRef)
      return;
    if (isAllowedToDrag && isInput(event.target)) {
      event.target.blur();
    }
    $drawerRef.classList.remove(DRAG_CLASS);
    isAllowedToDrag = false;
    isDragging = false;
    dragEndTime = /* @__PURE__ */ new Date();
    const $direction = get_store_value(direction);
    const swipeAmount = getTranslate($drawerRef, $direction);
    if (event.target && !shouldDrag(event.target, false) || !swipeAmount || Number.isNaN(swipeAmount))
      return;
    if (dragStartTime === null)
      return;
    const timeTaken = dragEndTime.getTime() - dragStartTime.getTime();
    const distMoved = getDistanceMoved(pointerStart, $direction, event);
    const velocity = Math.abs(distMoved) / timeTaken;
    if (velocity > 0.05) {
      justReleased.set(true);
      setTimeout(() => {
        justReleased.set(false);
      }, 200);
    }
    if (get_store_value(snapPoints)) {
      onReleaseSnapPoints({
        draggedDistance: distMoved * getDirectionMultiplier($direction),
        closeDrawer,
        velocity,
        dismissible: get_store_value(dismissible)
      });
      onReleaseProp?.(event, true);
      return;
    }
    if ($direction === "bottom" || $direction === "right" ? distMoved > 0 : distMoved < 0) {
      resetDrawer();
      onReleaseProp?.(event, true);
      return;
    }
    if (velocity > VELOCITY_THRESHOLD) {
      closeDrawer();
      onReleaseProp?.(event, false);
      return;
    }
    const visibleDrawerHeight = Math.min(get_store_value(drawerRef)?.getBoundingClientRect().height ?? 0, window.innerHeight);
    if (swipeAmount >= visibleDrawerHeight * get_store_value(closeThreshold)) {
      closeDrawer();
      onReleaseProp?.(event, false);
      return;
    }
    onReleaseProp?.(event, true);
    resetDrawer();
  }
  effect([isOpen], ([$isOpen]) => {
    if (!$isOpen)
      return;
    if (isBrowser) {
      set(document.documentElement, {
        scrollBehavior: "auto"
      });
    }
    openTime.set(/* @__PURE__ */ new Date());
    scaleBackground(true, props.backgroundColor);
  });
  effect([visible], ([$visible]) => {
    if (!$visible)
      return;
    const $drawerRef = get_store_value(drawerRef);
    if (!$drawerRef)
      return;
    const children = $drawerRef.querySelectorAll("*");
    children.forEach((child) => {
      const htmlChild = child;
      if (htmlChild.scrollHeight > htmlChild.clientHeight || htmlChild.scrollWidth > htmlChild.clientWidth) {
        htmlChild.classList.add("vaul-scrollable");
      }
    });
  });
  function onNestedOpenChange(o) {
    const $drawerRef = get_store_value(drawerRef);
    const scale = o ? (window.innerWidth - NESTED_DISPLACEMENT) / window.innerWidth : 1;
    const y = o ? -NESTED_DISPLACEMENT : 0;
    if (nestedOpenChangeTimer) {
      window.clearTimeout(nestedOpenChangeTimer);
    }
    set($drawerRef, {
      transition: `transform ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(",")})`,
      transform: `scale(${scale}) translate3d(0, ${y}px, 0)`
    });
    if (!o && $drawerRef) {
      nestedOpenChangeTimer = setTimeout(() => {
        const $direction = get_store_value(direction);
        const translateValue = getTranslate($drawerRef, $direction);
        set($drawerRef, {
          transition: "none",
          transform: isVertical($direction) ? `translate3d(0, ${translateValue}px, 0)` : `translate3d(${translateValue}px, 0, 0)`
        });
      }, 500);
    }
  }
  function onNestedDrag(_, percentageDragged) {
    if (percentageDragged < 0)
      return;
    const initialScale = (window.innerWidth - NESTED_DISPLACEMENT) / window.innerWidth;
    const newScale = initialScale + percentageDragged * (1 - initialScale);
    const newTranslate = -NESTED_DISPLACEMENT + percentageDragged * NESTED_DISPLACEMENT;
    const $direction = get_store_value(direction);
    set(get_store_value(drawerRef), {
      transform: isVertical($direction) ? `scale(${newScale}) translate3d(0, ${newTranslate}px, 0)` : `scale(${newScale}) translate3d(${newTranslate}px, 0, 0)`,
      transition: "none"
    });
  }
  function onNestedRelease(_, o) {
    const $direction = get_store_value(direction);
    const dim = isVertical($direction) ? window.innerHeight : window.innerWidth;
    const scale = o ? (dim - NESTED_DISPLACEMENT) / dim : 1;
    const translate = o ? -NESTED_DISPLACEMENT : 0;
    if (o) {
      set(get_store_value(drawerRef), {
        transition: `transform ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(",")})`,
        transform: isVertical($direction) ? `scale(${scale}) translate3d(0, ${translate}px, 0)` : `scale(${scale}) translate3d(${translate}px, 0, 0)`
      });
    }
  }
  return {
    states: {
      isOpen,
      hasBeenOpened,
      snapPoints,
      activeSnapPoint,
      snapPointsOffset,
      keyboardIsOpen,
      shouldFade,
      visible,
      drawerId,
      openDrawerIds
    },
    helpers: {
      getContentStyle
    },
    methods: {
      closeDrawer,
      onOpenChange,
      onPress,
      onRelease,
      onDrag,
      scaleBackground,
      onNestedDrag,
      onNestedOpenChange,
      onNestedRelease,
      restorePositionSetting,
      openDrawer
    },
    refs: {
      drawerRef,
      overlayRef,
      triggerRef
    },
    options
  };
}
function dampenValue(v) {
  return 8 * (Math.log(v + 1) - 2);
}
function getScale() {
  return (window.innerWidth - WINDOW_TOP_OFFSET) / window.innerWidth;
}
function getDistanceMoved(pointerStart, direction, event) {
  if (event.type.startsWith("touch")) {
    return getDistanceMovedForTouch(pointerStart, direction, event);
  } else {
    return getDistanceMovedForPointer(pointerStart, direction, event);
  }
}
function getDistanceMovedForPointer(pointerStart, direction, event) {
  return pointerStart - (isVertical(direction) ? event.screenY : event.screenX);
}
function getDistanceMovedForTouch(pointerStart, direction, event) {
  return pointerStart - (isVertical(direction) ? event.changedTouches[0].screenY : event.changedTouches[0].screenX);
}
function getDirectionMultiplier(direction) {
  return direction === "bottom" || direction === "right" ? 1 : -1;
}
const VAUL_ROOT = Symbol("VAUL_ROOT");
function setCtx(props = {}) {
  const vaul = createVaul(props);
  const updateOption = getOptionUpdater(vaul.options);
  setContext(VAUL_ROOT, { ...vaul, updateOption });
  return {
    ...vaul,
    updateOption
  };
}
function getCtx() {
  return getContext(VAUL_ROOT);
}
function Root($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "open",
    "onOpenChange",
    "closeThreshold",
    "scrollLockTimeout",
    "snapPoints",
    "fadeFromIndex",
    "openFocus",
    "onOutsideClick",
    "closeOnOutsideClick",
    "backgroundColor",
    "nested",
    "shouldScaleBackground",
    "activeSnapPoint",
    "onActiveSnapPointChange",
    "onRelease",
    "onDrag",
    "onClose",
    "dismissible",
    "direction"
  ]);
  push();
  var $$store_subs;
  let open = value_or_fallback($$props["open"], () => false);
  let onOpenChange = value_or_fallback($$props["onOpenChange"], () => void 0);
  let closeThreshold = value_or_fallback($$props["closeThreshold"], () => void 0);
  let scrollLockTimeout = value_or_fallback($$props["scrollLockTimeout"], () => void 0);
  let snapPoints = value_or_fallback($$props["snapPoints"], () => void 0);
  let fadeFromIndex = value_or_fallback($$props["fadeFromIndex"], () => void 0);
  let openFocus = value_or_fallback($$props["openFocus"], () => void 0);
  let onOutsideClick = value_or_fallback($$props["onOutsideClick"], () => void 0);
  let closeOnOutsideClick = value_or_fallback($$props["closeOnOutsideClick"], () => true);
  let backgroundColor = value_or_fallback($$props["backgroundColor"], () => "black");
  let nested = value_or_fallback($$props["nested"], () => false);
  let shouldScaleBackground = value_or_fallback($$props["shouldScaleBackground"], () => false);
  let activeSnapPoint = value_or_fallback($$props["activeSnapPoint"], () => void 0);
  let onActiveSnapPointChange = value_or_fallback($$props["onActiveSnapPointChange"], () => void 0);
  let onRelease = value_or_fallback($$props["onRelease"], () => void 0);
  let onDrag = value_or_fallback($$props["onDrag"], () => void 0);
  let onClose = value_or_fallback($$props["onClose"], () => void 0);
  let dismissible = value_or_fallback($$props["dismissible"], () => void 0);
  let direction = value_or_fallback($$props["direction"], () => "bottom");
  const {
    states: {
      keyboardIsOpen,
      activeSnapPoint: localActiveSnapPoint,
      drawerId,
      openDrawerIds: openDrawerIds2,
      isOpen
    },
    methods: { closeDrawer, openDrawer },
    options: { dismissible: localDismissible },
    updateOption
  } = setCtx({
    defaultOpen: open,
    defaultActiveSnapPoint: activeSnapPoint,
    onOpenChange: ({ next }) => {
      if (open !== next) {
        onOpenChange?.(next);
        open = next;
      }
      return next;
    },
    onActiveSnapPointChange: ({ next }) => {
      if (next === void 0 && snapPoints && activeSnapPoint !== next) {
        const newNext = snapPoints[0];
        onActiveSnapPointChange?.(newNext);
        activeSnapPoint = newNext;
        return newNext;
      }
      if (activeSnapPoint !== next) {
        onActiveSnapPointChange?.(next);
        activeSnapPoint = next;
      }
      return next;
    },
    closeThreshold,
    scrollLockTimeout,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    snapPoints,
    fadeFromIndex,
    nested,
    onDrag,
    onClose,
    onRelease,
    shouldScaleBackground,
    backgroundColor,
    dismissible,
    direction
  });
  activeSnapPoint !== void 0 && localActiveSnapPoint.set(activeSnapPoint);
  updateOption("closeThreshold", closeThreshold);
  updateOption("scrollLockTimeout", scrollLockTimeout);
  updateOption("snapPoints", snapPoints);
  updateOption("fadeFromIndex", fadeFromIndex);
  updateOption("openFocus", openFocus);
  updateOption("shouldScaleBackground", shouldScaleBackground);
  updateOption("backgroundColor", backgroundColor);
  updateOption("dismissible", dismissible);
  updateOption("direction", direction);
  open && !store_get($$store_subs ??= {}, "$isOpen", isOpen) && openDrawer();
  !open && store_get($$store_subs ??= {}, "$isOpen", isOpen) && closeDrawer();
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!--[-->`;
    Dialog($$payload2, spread_props([
      {
        closeOnOutsideClick,
        closeOnEscape: false,
        get open() {
          return open;
        },
        set open($$value) {
          open = $$value;
          $$settled = false;
        },
        preventScroll: false,
        onOpenChange: (o) => {
          onOpenChange?.(o);
          if (!o) {
            closeDrawer();
          } else if (o) {
            openDrawer();
          }
        },
        onOutsideClick: (e) => {
          if (!closeOnOutsideClick)
            return;
          onOutsideClick?.(e);
          if (e?.defaultPrevented)
            return;
          if (store_get($$store_subs ??= {}, "$keyboardIsOpen", keyboardIsOpen)) {
            keyboardIsOpen.set(false);
          }
          e.preventDefault();
          if (!store_get($$store_subs ??= {}, "$localDismissible", localDismissible)) {
            return;
          }
          const $openDialogIds = get_store_value(openDrawerIds2);
          const isLast = $openDialogIds[$openDialogIds.length - 1] === get_store_value(drawerId);
          if (isLast) {
            onOpenChange?.(false);
            closeDrawer();
          }
        }
      },
      $$restProps,
      {
        children: ($$payload3, $$slotProps) => {
          $$payload3.out += `<!--[-->`;
          slot($$payload3, $$props.children, {}, null);
          $$payload3.out += `<!--]-->`;
        }
      }
    ]));
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs)
    unsubscribe_stores($$store_subs);
  bind_props($$props, {
    open,
    onOpenChange,
    closeThreshold,
    scrollLockTimeout,
    snapPoints,
    fadeFromIndex,
    openFocus,
    onOutsideClick,
    closeOnOutsideClick,
    backgroundColor,
    nested,
    shouldScaleBackground,
    activeSnapPoint,
    onActiveSnapPointChange,
    onRelease,
    onDrag,
    onClose,
    dismissible,
    direction
  });
  pop();
}
function Visible($$payload, $$props) {
  push();
  getCtx();
  pop();
}
function Content($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["style"]);
  push();
  var $$store_subs;
  const {
    refs: { drawerRef },
    states: { visible },
    helpers: { getContentStyle },
    methods: { onPress, onDrag, onRelease },
    options: { direction }
  } = getCtx();
  let style = value_or_fallback($$props["style"], () => "");
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!--[-->`;
    Dialog_content($$payload2, spread_props([
      {
        get el() {
          return store_get($$store_subs ??= {}, "$drawerRef", drawerRef);
        },
        set el($$value) {
          store_set(drawerRef, $$value);
          $$settled = false;
        },
        style: store_get($$store_subs ??= {}, "$getContentStyle", getContentStyle)(style),
        "data-vaul-drawer": "",
        "data-vaul-drawer-direction": store_get($$store_subs ??= {}, "$direction", direction),
        "data-vaul-drawer-visible": store_get($$store_subs ??= {}, "$visible", visible) ? "true" : "false"
      },
      $$restProps,
      {
        children: ($$payload3, $$slotProps) => {
          $$payload3.out += `<!--[-->`;
          Visible();
          $$payload3.out += `<!--]--> <!--[-->`;
          slot($$payload3, $$props.children, {}, null);
          $$payload3.out += `<!--]-->`;
        }
      }
    ]));
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs)
    unsubscribe_stores($$store_subs);
  bind_props($$props, { style });
  pop();
}
function Overlay($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, []);
  push();
  var $$store_subs;
  let hasSnapPoints;
  const {
    refs: { overlayRef },
    states: { isOpen, visible, snapPoints, shouldFade },
    methods: { onRelease }
  } = getCtx();
  hasSnapPoints = store_get($$store_subs ??= {}, "$snapPoints", snapPoints) && store_get($$store_subs ??= {}, "$snapPoints", snapPoints).length > 0;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!--[-->`;
    Dialog_overlay($$payload2, spread_props([
      {
        get el() {
          return store_get($$store_subs ??= {}, "$overlayRef", overlayRef);
        },
        set el($$value) {
          store_set(overlayRef, $$value);
          $$settled = false;
        },
        "data-vaul-drawer-visible": store_get($$store_subs ??= {}, "$visible", visible) ? "true" : "false",
        "data-vaul-overlay": "",
        "data-vaul-snap-points": store_get($$store_subs ??= {}, "$isOpen", isOpen) && hasSnapPoints ? "true" : "false",
        "data-vaul-snap-points-overlay": store_get($$store_subs ??= {}, "$isOpen", isOpen) && store_get($$store_subs ??= {}, "$shouldFade", shouldFade) ? "true" : "false"
      },
      $$restProps
    ]));
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs)
    unsubscribe_stores($$store_subs);
  pop();
}
const Portal = Dialog_portal;
function DrawerWrapper($$payload, $$props) {
  push();
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!--[-->`;
    Root($$payload2, {
      shouldScaleBackground: true,
      get open() {
        return dialogOpenState.dialogOpen;
      },
      set open($$value) {
        dialogOpenState.dialogOpen = $$value;
        $$settled = false;
      },
      children: ($$payload3, $$slotProps) => {
        $$payload3.out += `<!--[-->`;
        Portal($$payload3, {
          children: ($$payload4, $$slotProps2) => {
            $$payload4.out += `<!--[-->`;
            Overlay($$payload4, { class: "fixed inset-0 bg-black/40" });
            $$payload4.out += `<!--]--> <!--[-->`;
            Content($$payload4, {
              class: "fixed bottom-0 left-0 right-0 mt-24 flex h-[96%] flex-col rounded-t-[10px] bg-neutral",
              children: ($$payload5, $$slotProps3) => {
                $$payload5.out += `<!--[-->`;
                slot($$payload5, $$props.$$slots?.["content"], {}, () => {
                  $$payload5.out += `<!--[-->`;
                  if (dialogOpenState.componentToRender) {
                    $$payload5.out += `<!--[-->`;
                    dialogOpenState.componentToRender?.($$payload5, {});
                    $$payload5.out += `<!--]-->`;
                    $$payload5.out += "<!--]-->";
                  } else {
                    $$payload5.out += "<!--]!-->";
                  }
                });
                $$payload5.out += `<!--]-->`;
              }
            });
            $$payload4.out += `<!--]-->`;
          }
        });
        $$payload3.out += `<!--]-->`;
      }
    });
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  pop();
}
const pwaInfo = { "pwaInDevEnvironment": false, "webManifest": { "href": "/manifest.webmanifest", "useCredentials": false, "linkTag": '<link rel="manifest" href="/manifest.webmanifest">' } };
const pwaAssetsHead = { "links": [] };
function _layout($$payload, $$props) {
  push();
  let webManifestLink;
  webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : "";
  head($$payload, ($$payload2) => {
    const each_array = ensure_array_like(pwaAssetsHead.links);
    $$payload2.out += `<!--[-->${webManifestLink}<!--]--> <!--[-->`;
    if (pwaAssetsHead.themeColor) {
      $$payload2.out += `<meta name="theme-color"${attr("content", pwaAssetsHead.themeColor.content, false)}>`;
      $$payload2.out += "<!--]-->";
    } else {
      $$payload2.out += "<!--]!-->";
    }
    $$payload2.out += ` <!--[-->`;
    for (let $$index = 0; $$index < each_array.length; $$index++) {
      const link = each_array[$$index];
      $$payload2.out += "<!--[-->";
      $$payload2.out += `<link${spread_attributes([link], true, true)}>`;
      $$payload2.out += "<!--]-->";
    }
    $$payload2.out += "<!--]-->";
  });
  $$payload.out += `<!--[-->`;
  slot($$payload, $$props.children, {}, null);
  $$payload.out += `<!--]--> <!--[-->`;
  DrawerWrapper($$payload, {});
  $$payload.out += `<!--]-->`;
  pop();
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-BjXkkfMs.js.map
