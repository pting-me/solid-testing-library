import "@testing-library/jest-dom/extend-expect";
import { createSignal, createEffect } from "solid-js";
import { render, renderHook, screen } from "..";
import userEvent from "@testing-library/user-event";

declare global {
  var _$HY: Record<string, any>;
}

globalThis._$HY = {};

test("render calls createEffect immediately", () => {
  const cb = vi.fn();

  function Comp() {
    createEffect(cb);
    return null;
  }

  render(<Comp />);

  expect(cb).toHaveBeenCalledTimes(1);
});

test("findByTestId returns the element", async () => {
  let ref!: HTMLDivElement;

  render(<div ref={ref} data-testid="foo" />);

  expect(await screen.findByTestId("foo")).toBe(ref);
});

test("userEvent triggers createEffect calls", async () => {
  const cb = vi.fn();

  function Counter() {
    const [count, setCount] = createSignal(0);
    createEffect(() => (count(), cb()));

    return <button onClick={() => setCount(count() + 1)}>{count()}</button>;
  }

  const {
    container: { firstChild: buttonNode }
  } = render(<Counter />);

  cb.mockClear();
  await userEvent.click(buttonNode! as Element);
  expect(buttonNode).toHaveTextContent("1");
  expect(cb).toHaveBeenCalledTimes(1);
});

test("calls to hydrate will run createEffects", () => {
  const cb = vi.fn();

  function Comp() {
    createEffect(cb);
    return null;
  }

  render(<Comp />, { hydrate: true });

  expect(cb).toHaveBeenCalledTimes(1);
});

test("queries should not return elements outside of the container", () => {
  const { container, getAllByText } = render(<div>Some text...</div>);
  const falseContainer = document.createElement("p");
  falseContainer.textContent = "Some text...";
  container.parentNode!.insertBefore(falseContainer, getAllByText("Some text...")[0].parentNode);
  expect(getAllByText("Some text...")[0] === container.childNodes[0]).toBe(true);
});

test("wrapper option works correctly", () => {
  const { asFragment } = render(<div>Component</div>, {
    wrapper: props => <div>Wrapper {props.children}</div>
  });
  expect(asFragment()).toBe("<div>Wrapper <div>Component</div></div>");
});

test("renderHook works correctly", () => {
  const createDate = () => {
    const [date, setDate] = createSignal(new Date());    
    return [date, (d: Date) => d ? setDate(d) : setDate(new Date())] as const;
  }
  const { result: [ date, setDate ] } = renderHook(createDate);
  expect(date()).toBeInstanceOf(Date);
  const newDate = new Date();
  setDate(newDate);
  expect(date()).toBe(newDate);
});
