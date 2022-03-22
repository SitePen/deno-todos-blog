import { type Database, openDb } from "./database.ts";
import { assertEquals } from "std/testing/asserts.ts";

const { test, remove } = Deno;

test("opens and closes", async ({ step }) => {
  let db: Database | undefined;

  await step({
    name: "test",
    fn: () => {
      db = openDb("test.db");
      const todos = db.getTodos();
      assertEquals(todos, []);
      // db.close();
    },
    sanitizeResources: false,
  });

  await step({
    name: "cleanup",
    fn: async () => {
      try {
        db?.close();
      } catch { /* ignore */ }
      try {
        await remove("test.db");
      } catch { /* ignore */ }
    },
    sanitizeResources: false,
  });
});

test("adds and retrieves a todo", async ({ step }) => {
  let db: Database | undefined;

  await step({
    name: "test",
    fn: () => {
      db = openDb("test.db");
      db.addTodo({ label: "Clean house" });
      const todos = db.getTodos();
      assertEquals(todos, [{ id: 1, label: "Clean house", complete: false }]);
    },
    sanitizeResources: false,
  });

  await step({
    name: "cleanup",
    fn: async () => {
      try {
        db?.close();
      } catch { /* ignore */ }
      try {
        await remove("test.db");
      } catch { /* ignore */ }
    },
    sanitizeResources: false,
  });
});
