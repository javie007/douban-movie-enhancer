"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const enhancer = require("../extension/content.js");

const GENRES = [
  "全部",
  "喜剧",
  "爱情",
  "动作",
  "科幻",
  "动画"
];

function createSelector(fiber) {
  const title = {};
  if (fiber) {
    title.__reactFiber$test = fiber;
  }

  return {
    querySelector(selector) {
      return selector === ".base-selector-title" ? title : null;
    }
  };
}

test("recognizes only the exact Douban explore path", () => {
  assert.equal(enhancer.isExplorePath("/explore"), true);
  assert.equal(enhancer.isExplorePath("/explore/"), true);
  assert.equal(enhancer.isExplorePath("/explore-old"), false);
  assert.equal(enhancer.isExplorePath("/tv/explore"), false);
});

test("inserts 剧情 immediately after 全部", () => {
  const tags = [...GENRES];

  assert.equal(enhancer.insertDramaTag(tags), true);
  assert.deepEqual(tags.slice(0, 4), ["全部", "剧情", "喜剧", "爱情"]);
});

test("does not duplicate an existing 剧情 tag", () => {
  const tags = ["全部", "剧情", "喜剧", "爱情", "动作"];

  assert.equal(enhancer.insertDramaTag(tags), false);
  assert.equal(tags.filter((tag) => tag === "剧情").length, 1);
});

test("does not modify region, year, or unrelated tag arrays", () => {
  const region = ["全部", "华语", "欧美", "韩国", "日本"];
  const years = ["全部", "2020年代", "2026", "2025"];
  const editableTags = ["温情", "女性", "成长"];

  for (const tags of [region, years, editableTags]) {
    const original = [...tags];
    assert.equal(enhancer.insertDramaTag(tags), false);
    assert.deepEqual(tags, original);
  }
});

test("patches genre arrays on the current and alternate fibers", () => {
  const currentTags = [...GENRES];
  const alternateTags = [...GENRES];
  const fiber = {
    memoizedProps: { tags: currentTags },
    alternate: {
      pendingProps: { tags: alternateTags }
    },
    return: null
  };

  const result = enhancer.patchTypeSelector(createSelector(fiber));

  assert.deepEqual(result, {
    foundFiber: true,
    genreArrays: 2,
    patchedArrays: 2
  });
  assert.equal(currentTags[1], "剧情");
  assert.equal(alternateTags[1], "剧情");
});

test("patches a genre array stored in React hook state", () => {
  const hookTags = [...GENRES];
  const fiber = {
    memoizedState: {
      memoizedState: false,
      next: {
        memoizedState: hookTags,
        next: null
      }
    },
    return: null
  };

  const result = enhancer.patchTypeSelector(createSelector(fiber));

  assert.equal(result.patchedArrays, 1);
  assert.equal(hookTags[1], "剧情");
});

test("deduplicates shared array references before patching", () => {
  const tags = [...GENRES];
  const fiber = {
    memoizedProps: { tags },
    pendingProps: { tags },
    memoizedState: { memoizedState: tags, next: null },
    return: null
  };

  const result = enhancer.patchTypeSelector(createSelector(fiber));

  assert.equal(result.genreArrays, 1);
  assert.equal(result.patchedArrays, 1);
  assert.equal(tags.filter((tag) => tag === "剧情").length, 1);
});

test("repeated patches remain idempotent", () => {
  const tags = [...GENRES];
  const selector = createSelector({ memoizedProps: { tags }, return: null });

  assert.equal(enhancer.patchTypeSelector(selector).patchedArrays, 1);
  assert.equal(enhancer.patchTypeSelector(selector).patchedArrays, 0);
  assert.equal(tags.filter((tag) => tag === "剧情").length, 1);
});

test("fails safely when React Fiber is unavailable", () => {
  assert.deepEqual(enhancer.patchTypeSelector(createSelector(null)), {
    foundFiber: false,
    genreArrays: 0,
    patchedArrays: 0
  });
  assert.deepEqual(enhancer.patchTypeSelector(null), {
    foundFiber: false,
    genreArrays: 0,
    patchedArrays: 0
  });
});

test("start refuses unrelated pages without observing the DOM", () => {
  let observerCreated = false;
  const result = enhancer.start({
    location: { pathname: "/chart" },
    document: { querySelector() {} },
    MutationObserver: class {
      constructor() {
        observerCreated = true;
      }
    }
  });

  assert.equal(result.started, false);
  assert.equal(observerCreated, false);
});
