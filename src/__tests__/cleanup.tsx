import "@testing-library/jest-dom/extend-expect";
import { onCleanup } from "solid-js";
import { cleanup, oldRender, render } from "..";

test("old render cleans up the document", () => {
  const spy = vi.fn();
  const divId = "my-div";

  function Test() {
    onCleanup(() => {
      expect(document.getElementById(divId)).toBeInTheDocument();
      spy();
    });
    return <div id={divId} />;
  }

  oldRender(() => <Test />);
  cleanup();
  expect(document.body.innerHTML).toBe("");
  expect(spy).toHaveBeenCalledTimes(1);
});

test("cleans up the document", () => {
  const spy = vi.fn();
  const divId = "my-div";

  function Test() {
    onCleanup(() => {
      expect(document.getElementById(divId)).toBeInTheDocument();
      spy();
    });
    return <div id={divId} />;
  }

  render(<Test />);
  cleanup();
  expect(document.body.innerHTML).toBe("");
  expect(spy).toHaveBeenCalledTimes(1);
});

test.skip("cleanup does not error when an element is not a child", () => {
  render(<div />, { container: document.createElement("div") });
  cleanup();
});
