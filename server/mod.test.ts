import { serve, Server } from "./mod.ts";
import { assertEquals, assertMatch } from "std/testing/asserts.ts";

const { test } = Deno;

test("server starts and shuts down", async () => {
  const { listener, close } = await serve({
    port: 13579,
    importMap: "import_map.json",
  });
  close();
  await listener;
});

test("server serves app", async ({ step }) => {
  let server: Server | undefined;

  await step("test", async () => {
    server = await serve({
      port: 13579,
      importMap: "import_map.json",
    });

    const response = await fetch(`http://localhost:${server.port}`);
    assertEquals(response.status, 200);
    const body = await response.text();
    assertMatch(body, /^<!DOCTYPE html>/);
    server.close();
    await server.listener;
  });

  await step({
    name: "cleanup",
    fn: async () => {
      if (server) {
        server.close();
        await server.listener;
      }
    },
    sanitizeOps: false,
    sanitizeResources: false,
  });
});
