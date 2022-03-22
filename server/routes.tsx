import React from "react";
import { Router } from "oak";
import type { Todo } from "../shared/types.ts";
import type { Database } from "./database.ts";
import ReactDOMServer from "react-dom-server";
import App from "../client/App.tsx";

export type RouterConfig = {
  client: string;
  styles: string;
  db: Database;
  devMode?: boolean;
};

const sockets: Set<WebSocket> = new Set();

type RouterInfo = {
  router: Router;
  updateStyles: (styles: string) => void;
};

// Used with the live-reload route to tell when a client is using the mostly
// recently built client code
const serverId = crypto.randomUUID();

// Injected into the client to allow live-reloading
const liveReloadSnippet = `
  <script type="module">
    function connect() {
      const url = window.location.origin.replace("http", "ws")
        + '/livereload/${serverId}';
      const socket = new WebSocket(url);
      let reconnectTimer;

      socket.addEventListener("open", () => {
        console.log("live-reload socket connected");
      });

      socket.addEventListener("message", (event) => {
        if (event.data === "loadStyles") {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "/styles.css";
          const existing = document.head.querySelector('link[rel="stylesheet"]');
          existing.replaceWith(link);
        } else if (event.data === "reload") {
          window.location.reload();
        }
      });

      socket.addEventListener("close", () => {
        console.log("reconnecting live-reload socket...");
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
          connect();
        }, 1000);
      });
    }

    connect();
  </script>
`;

export function createRouter(config: RouterConfig): RouterInfo {
  const { db } = config;
  const router = new Router();

  let { client, styles } = config;

  function updateStyles(newStyles: string) {
    styles = newStyles;
    for (const socket of sockets) {
      socket.send("loadStyles");
    }
  }

  router.get("/client.js", ({ response }) => {
    response.type = "application/javascript";
    response.body = client;
  });

  router.get("/styles.css", ({ response }) => {
    response.type = "text/css";
    response.body = styles;
  });

  router.get("/todos", ({ response }) => {
    response.type = "application/json";
    response.body = db.getTodos();
  });

  router.post("/todos", async ({ request, response }) => {
    if (!request.hasBody) {
      response.status = 400;
      response.body = { error: "Missing request body" };
    }

    const body = request.body();
    const data = await body.value as Todo;

    response.type = "application/json";
    response.body = db.addTodo({
      label: data.label,
      complete: data.complete,
    });
  });

  router.patch("/todos/:id", async ({ params, request, response }) => {
    if (!request.hasBody) {
      response.status = 400;
      response.body = { error: "Missing request body" };
    }

    const { id } = params;
    const body = request.body();
    const data = await body.value as Todo;

    response.type = "application/json";
    response.body = db.updateTodo({
      id: Number(id),
      label: data.label,
      complete: data.complete,
    });
  });

  router.delete("/todos/:id", ({ params, response }) => {
    const { id } = params;
    db.removeTodo(Number(id));
    response.status = 204;
  });

  router.get("/livereload/:id", (ctx) => {
    const id = ctx.params.id;
    const socket = ctx.upgrade();
    sockets.add(socket);
    socket.onclose = () => {
      sockets.delete(socket);
    };
    socket.onopen = () => {
      if (id !== serverId) {
        socket.send("reload");
      }
    };
  });

  router.get("/", ({ response }) => {
    const initialState = { todos: db.getTodos() };
    const renderedApp = ReactDOMServer.renderToString(
      <App initialState={initialState} />,
    );
    const globalState = `globalThis.__INITIAL_STATE__ = ${
      JSON.stringify(initialState)
    };`;

    const liveReload = config.devMode ? liveReloadSnippet : "";

    response.type = "text/html";
    response.body = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Todos</title>
          <link rel="stylesheet" href="/styles.css">
          <script type="module" async src="/client.js"></script>
          ${liveReload}
        </head>
        <body>
          <div id="root">${renderedApp}</div>
          <script>
            ${globalState}
          </script>
        </body>
      </html>`;
  });

  return {
    router,
    updateStyles,
  };
}
