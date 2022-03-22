import React from "react";
import App from "./App.tsx";
import { assertEquals, assertThrows } from "std/testing/asserts.ts";
import {
  mockFetch,
  render,
  resetDom,
  userEvent,
  waitFor,
} from "../support/util.ts";

const { test } = Deno;

const testConfig = {
  permissions: { net: true, env: true },
  sanitizeOps: false,
  sanitizeResources: false,
};

test("renders", testConfig, async ({ step }) => {
  let resetFetch: () => void;

  await step('test', async () => {
    resetDom();
    resetFetch = mockFetch({
      path: "GET@/todos",
      handler: () => {
        return new Response(JSON.stringify([]));
      },
    });
    const { findByTestId, getByTestId } = render(<App />);
    await findByTestId("input");
    assertThrows(() => getByTestId("todo-item"));
  });

  await step('cleanup', () => {
    resetFetch();
  });
});

test("renders with initial todos", testConfig, async () => {
  resetDom();
  const { findByText, getAllByTestId } = render(
    <App
      initialState={{
        todos: [
          { id: 1, label: "Milk" },
        ],
      }}
    />,
  );
  await findByText("todos");
  assertEquals(getAllByTestId("todo-item").length, 1);
});

test("adds a todo", testConfig, async ({ step }) => {
  let resetFetch: () => void;

  await step('test', async () => {
    resetDom();
    resetFetch = mockFetch({
      path: "GET@/todos",
      handler: () => {
        return new Response(JSON.stringify([]));
      },
    }, {
      path: 'POST@/todos',
      handler: async (req) => {
        // Give the todo item an ID and return it
        const body = await req.json();
        body.id = 1;
        return new Response(JSON.stringify(body));
      }
    });
    const result = render(<App />);
    const { getAllByTestId, findByRole } = result;

    assertThrows(() => getAllByTestId("todo-item"), Error, 'Unable to find');

    const input = await findByRole("textbox");
    userEvent.type(input, "Clean house{enter}");

    await waitFor(() => {
      const items = getAllByTestId("todo-item-label");
      assertEquals(items.length, 1)
      assertEquals(items[0].textContent, "Clean house");
    });
  });

  await step('cleanup', () => {
    resetFetch();
  });
});

test("completes a todo", testConfig, async ({ step }) => {
  let resetFetch: () => void;

  await step('test', async () => {
    resetDom();
    resetFetch = mockFetch({
      path: 'PATCH@/todos/:id',
      handler: async (req) => {
        const body = await req.json();
        // Return the patched todo item
        return new Response(JSON.stringify(body));
      }
    });

    const { findByRole, getByTestId } = render(
      <App
        initialState={{
          todos: [
            { id: 1, label: "Milk", complete: false },
          ],
        }}
      />,
    );

    assertThrows(() => getByTestId('todo-item-checked'));

    const item = await findByRole("checkbox");
    userEvent.click(item);

    await waitFor(() => getByTestId('todo-item-checked'));
  });

  await step('cleanup', () => {
    resetFetch();
  });
});
