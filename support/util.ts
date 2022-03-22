import "./raf.ts";
import { JSDOM } from "jsdom";
export { fireEvent, waitFor } from "@testing-library/dom";
export { default as userEvent } from "@testing-library/user-event";
import * as mock_fetch from "mock_fetch";
import { MatchHandler } from "mock_fetch";

const dom = new JSDOM();
globalThis.document = dom.window.document;
globalThis.HTMLIFrameElement = dom.window.HTMLIFrameElement;

// Import these _after_ a DOM has been setup so that React will see a DOM when
// it initializes. Otherwise you'll get "activeElement.attachEvent is not a
// function" errors.
const { act, render } = await import("@testing-library/react");
export { act, render };

export function resetDom() {
  const dom = new JSDOM();
  globalThis.document = dom.window.document;
  globalThis.HTMLIFrameElement = dom.window.HTMLIFrameElement;
}

type Route = {
  path: string;
  handler: MatchHandler;
};

export function mockFetch(...routes: Route[]) {
  mock_fetch.install();
  mock_fetch.reset();

  for (const route of routes) {
    mock_fetch.mock(route.path, route.handler);
  }

  return () => {
    mock_fetch.uninstall();
  };
}
