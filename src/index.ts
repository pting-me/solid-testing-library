import { getQueriesForElement, prettyDOM } from "@testing-library/dom";
import { createRoot, getOwner, JSXElement, Owner, runWithOwner } from "solid-js";
import { hydrate as solidHydrate, insert, render as solidRender } from "solid-js/web";

import type { Ui, Result, Options, Ref, RenderHookResult, RenderHookOptions } from "./types";

/* istanbul ignore next */
if (!process.env.STL_SKIP_AUTO_CLEANUP) {
  if (typeof afterEach === "function") {
    afterEach(async () => {
      await cleanup();
    });
  }
}

const mountedContainers = new Set<Ref>();

export function oldRender(ui: Ui, options: Options = {}): Result {
  let { container, baseElement = container, queries, hydrate = false, wrapper } = options;

  if (!baseElement) {
    // Default to document.body instead of documentElement to avoid output of potentially-large
    // head elements (such as JSS style blocks) in debug output.
    baseElement = document.body;
  }

  if (!container) {
    container = baseElement.appendChild(document.createElement("div"));
  }

  const wrappedUi: Ui = typeof wrapper === "function" ? () => wrapper!({ children: ui() }) : ui;

  const dispose = hydrate
    ? (solidHydrate(wrappedUi, container) as unknown as () => void)
    : solidRender(wrappedUi, container);

  // We'll add it to the mounted containers regardless of whether it's actually
  // added to document.body so the cleanup method works regardless of whether
  // they're passing us a custom container or not.
  mountedContainers.add({ container, dispose });

  const queryHelpers = getQueriesForElement(container, queries);

  return {
    asFragment: () => container?.innerHTML as string,
    container,
    baseElement,
    debug: (el = baseElement, maxLength, options) =>
      Array.isArray(el)
        ? el.forEach(e => console.log(prettyDOM(e, maxLength, options)))
        : console.log(prettyDOM(el, maxLength, options)),
    unmount: dispose,
    ...queryHelpers
  } as Result;
}

function renderAttempt1(ui: JSXElement, options: Options = {}): Result {
  let { container, baseElement = container, queries, hydrate = false, wrapper } = options;

  if (!baseElement) {
    // Default to document.body instead of documentElement to avoid output of potentially-large
    // head elements (such as JSS style blocks) in debug output.
    baseElement = document.body;
  }

  if (!container) {
    container = baseElement.appendChild(document.createElement("div"));
  }

  const uiFn: Ui = () => ui;

  const wrappedUi: Ui = typeof wrapper === "function" ? () => wrapper!({ children: uiFn() }) : uiFn;

  const dispose = hydrate
    ? (solidHydrate(wrappedUi, container) as unknown as () => void)
    : solidRender(wrappedUi, container);

  // We'll add it to the mounted containers regardless of whether it's actually
  // added to document.body so the cleanup method works regardless of whether
  // they're passing us a custom container or not.
  mountedContainers.add({ container, dispose });

  const queryHelpers = getQueriesForElement(container, queries);

  return {
    asFragment: () => container?.innerHTML as string,
    container,
    baseElement,
    debug: (el = baseElement, maxLength, options) =>
      Array.isArray(el)
        ? el.forEach(e => console.log(prettyDOM(e, maxLength, options)))
        : console.log(prettyDOM(el, maxLength, options)),
    unmount: dispose,
    ...queryHelpers
  } as Result;
}

function solidRenderWithOwner(code: Ui, element: HTMLElement) {
  const [dispose, owner] = createRoot(dispose => {
    insert(element, code());
    return [dispose, getOwner()];
  });
  return { dispose, owner };
}

function renderAttempt2(ui: JSXElement, options: Options = {}): Result {
  let { container, baseElement = container, queries, hydrate = false, wrapper } = options;

  if (!baseElement) {
    // Default to document.body instead of documentElement to avoid output of potentially-large
    // head elements (such as JSS style blocks) in debug output.
    baseElement = document.body;
  }

  if (!container) {
    container = baseElement.appendChild(document.createElement("div"));
  }

  const uiFn: Ui = () => ui;

  const wrappedUi: Ui = typeof wrapper === "function" ? () => wrapper!({ children: uiFn() }) : uiFn;

  // Will need to rewrite this portion to include hydrate

  // const dispose = hydrate
  //   ? (solidHydrate(wrappedUi, container) as unknown as () => void)
  //   : solidRender(wrappedUi, container);

  const { dispose, owner } = solidRenderWithOwner(wrappedUi, container);

  // We'll add it to the mounted containers regardless of whether it's actually
  // added to document.body so the cleanup method works regardless of whether
  // they're passing us a custom container or not.
  mountedContainers.add({ container, dispose, owner });

  const queryHelpers = getQueriesForElement(container, queries);

  return {
    asFragment: () => container?.innerHTML as string,
    container,
    baseElement,
    debug: (el = baseElement, maxLength, options) =>
      Array.isArray(el)
        ? el.forEach(e => console.log(prettyDOM(e, maxLength, options)))
        : console.log(prettyDOM(el, maxLength, options)),
    unmount: dispose,
    ...queryHelpers
  } as Result;
}

function renderAttempt3(ui: JSXElement, options: Options = {}): Result {
  let { container, baseElement = container, queries, hydrate = false, wrapper } = options;

  if (!baseElement) {
    // Default to document.body instead of documentElement to avoid output of potentially-large
    // head elements (such as JSS style blocks) in debug output.
    baseElement = document.body;
  }

  if (!container) {
    container = baseElement.appendChild(document.createElement("div"));
  }

  let owner: Owner | null = null;

  const uiFn: Ui = () => {
    owner = getOwner();
    return ui;
  };

  const wrappedUi: Ui = typeof wrapper === "function" ? () => wrapper!({ children: uiFn() }) : uiFn;

  const dispose = hydrate
    ? (solidHydrate(wrappedUi, container) as unknown as () => void)
    : solidRender(wrappedUi, container);

  // We'll add it to the mounted containers regardless of whether it's actually
  // added to document.body so the cleanup method works regardless of whether
  // they're passing us a custom container or not.
  mountedContainers.add({ container, dispose, owner });

  const queryHelpers = getQueriesForElement(container, queries);

  return {
    asFragment: () => container?.innerHTML as string,
    container,
    baseElement,
    debug: (el = baseElement, maxLength, options) =>
      Array.isArray(el)
        ? el.forEach(e => console.log(prettyDOM(e, maxLength, options)))
        : console.log(prettyDOM(el, maxLength, options)),
    unmount: dispose,
    ...queryHelpers
  } as Result;
}

export function renderHook<A extends any[], R>(
  hook: (...args: A) => R,
  options?: RenderHookOptions<A>
): RenderHookResult<R> {
  const initialProps: A | [] = Array.isArray(options) ? options : options?.initialProps || [];
  const [dispose, owner, result] = createRoot(dispose => [
    dispose,
    getOwner(),
    hook(...(initialProps as A))
  ]);

  mountedContainers.add({ dispose });

  return { result, cleanup: dispose, owner };
}

function cleanupAtContainer(ref: Ref) {
  const { container, dispose, owner } = ref;

  if (dispose) {
    owner ? runWithOwner(owner, dispose) : dispose();
  } else {
    console.warn("dispose was null during cleanup");
  }

  if (container?.parentNode === document.body) {
    document.body.removeChild(container);
  }

  mountedContainers.delete(ref);
}

function cleanup() {
  mountedContainers.forEach(cleanupAtContainer);
}

export * from "@testing-library/dom";
export { renderAttempt3 as render, cleanup };
