(function bootstrapDoubanMovieEnhancer(globalObject, factory) {
  "use strict";

  const api = factory();

  const isNodeCommonJs =
    typeof module === "object" &&
    module.exports &&
    typeof process === "object" &&
    process.versions?.node;

  if (isNodeCommonJs) {
    module.exports = api;
    return;
  }

  api.start(globalObject);
})(typeof globalThis === "object" ? globalThis : this, function createDoubanMovieEnhancer() {
  "use strict";

  const VERSION = "1.0.0";
  const DRAMA_TAG = "剧情";
  const ALL_TAG = "全部";
  const GENRE_SIGNATURE = Object.freeze(["全部", "喜剧", "爱情", "动作"]);
  const TYPE_SELECTOR =
    ".explore-all-selectors-main > .explore-all-selector-item:first-child";
  const FIBER_PREFIXES = Object.freeze([
    "__reactFiber$",
    "__reactInternalInstance$"
  ]);
  const MAX_FIBER_DEPTH = 48;
  const MAX_HOOK_DEPTH = 32;

  function isExplorePath(pathname) {
    return pathname === "/explore" || pathname === "/explore/";
  }

  function isGenreArray(value) {
    return (
      Array.isArray(value) &&
      GENRE_SIGNATURE.every((tag) => value.includes(tag))
    );
  }

  function insertDramaTag(tags) {
    if (!isGenreArray(tags) || tags.includes(DRAMA_TAG)) {
      return false;
    }

    const allIndex = tags.indexOf(ALL_TAG);
    tags.splice(allIndex + 1, 0, DRAMA_TAG);
    return true;
  }

  function getReactFiber(element) {
    if (!element) {
      return null;
    }

    const fiberKey = Object.keys(element).find((key) =>
      FIBER_PREFIXES.some((prefix) => key.startsWith(prefix))
    );

    return fiberKey ? element[fiberKey] : null;
  }

  function addGenreArray(candidate, arrays) {
    if (isGenreArray(candidate)) {
      arrays.add(candidate);
    }
  }

  function collectArraysFromProps(props, arrays) {
    if (!props || typeof props !== "object") {
      return;
    }

    addGenreArray(props.tags, arrays);
  }

  function collectArraysFromHooks(firstHook, arrays) {
    let hook = firstHook;
    let hookDepth = 0;
    const visitedHooks = new Set();

    while (
      hook &&
      typeof hook === "object" &&
      hookDepth < MAX_HOOK_DEPTH &&
      !visitedHooks.has(hook)
    ) {
      visitedHooks.add(hook);
      addGenreArray(hook.memoizedState, arrays);
      hook = hook.next;
      hookDepth += 1;
    }
  }

  function collectGenreArrays(fiber) {
    const arrays = new Set();
    const visitedFibers = new Set();
    let current = fiber;
    let fiberDepth = 0;

    while (
      current &&
      typeof current === "object" &&
      fiberDepth < MAX_FIBER_DEPTH &&
      !visitedFibers.has(current)
    ) {
      visitedFibers.add(current);

      for (const candidate of [current, current.alternate]) {
        if (!candidate || typeof candidate !== "object") {
          continue;
        }

        collectArraysFromProps(candidate.memoizedProps, arrays);
        collectArraysFromProps(candidate.pendingProps, arrays);
        collectArraysFromHooks(candidate.memoizedState, arrays);
      }

      current = current.return;
      fiberDepth += 1;
    }

    return arrays;
  }

  function patchTypeSelector(selector) {
    if (!selector || typeof selector.querySelector !== "function") {
      return {
        foundFiber: false,
        genreArrays: 0,
        patchedArrays: 0
      };
    }

    const title = selector.querySelector(".base-selector-title");
    const fiber = getReactFiber(title);

    if (!fiber) {
      return {
        foundFiber: false,
        genreArrays: 0,
        patchedArrays: 0
      };
    }

    const arrays = collectGenreArrays(fiber);
    let patchedArrays = 0;

    for (const tags of arrays) {
      if (insertDramaTag(tags)) {
        patchedArrays += 1;
      }
    }

    return {
      foundFiber: true,
      genreArrays: arrays.size,
      patchedArrays
    };
  }

  function start(runtime) {
    const location = runtime && runtime.location;
    const documentObject = runtime && runtime.document;
    const MutationObserverObject = runtime && runtime.MutationObserver;

    if (
      !location ||
      !isExplorePath(location.pathname) ||
      !documentObject ||
      typeof documentObject.querySelector !== "function" ||
      typeof MutationObserverObject !== "function"
    ) {
      return { started: false, reason: "unsupported-environment" };
    }

    let patchScheduled = false;
    let warnedAboutCompatibility = false;

    function warnOnce() {
      if (warnedAboutCompatibility) {
        return;
      }

      warnedAboutCompatibility = true;
      runtime.console?.warn?.(
        `[豆瓣选电影增强 v${VERSION}] 未找到兼容的 React 类型数据；` +
          "已安全停止本次注入，豆瓣原页面不会受到影响。"
      );
    }

    function patchNow() {
      patchScheduled = false;
      const selector = documentObject.querySelector(TYPE_SELECTOR);

      if (!selector) {
        return;
      }

      const result = patchTypeSelector(selector);
      if (!result.foundFiber || result.genreArrays === 0) {
        warnOnce();
      }
    }

    function schedulePatch() {
      if (patchScheduled) {
        return;
      }

      patchScheduled = true;
      const enqueue =
        typeof runtime.queueMicrotask === "function"
          ? runtime.queueMicrotask.bind(runtime)
          : (callback) => Promise.resolve().then(callback);
      enqueue(patchNow);
    }

    const observer = new MutationObserverObject(schedulePatch);

    function observe() {
      const root = documentObject.documentElement;
      if (!root) {
        return false;
      }

      observer.observe(root, { childList: true, subtree: true });
      schedulePatch();
      return true;
    }

    if (!observe()) {
      documentObject.addEventListener?.("DOMContentLoaded", observe, {
        once: true
      });
    }

    return { started: true, observer };
  }

  return Object.freeze({
    ALL_TAG,
    DRAMA_TAG,
    GENRE_SIGNATURE,
    TYPE_SELECTOR,
    collectGenreArrays,
    getReactFiber,
    insertDramaTag,
    isExplorePath,
    isGenreArray,
    patchTypeSelector,
    start
  });
});
