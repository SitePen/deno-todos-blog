import * as path from "std/path/mod.ts";
import { expandGlob } from "std/fs/mod.ts";
import { createRouter } from "./routes.tsx";
import { Application } from "oak";
import { openDb } from "./database.ts";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// The path to the client files relative to the proect root
const clientDir = path.join(__dirname, "..", "client");

export type ServerConfig = {
  port?: number;
  devMode?: boolean;
  importMap?: string;
};

async function buildStyles(): Promise<string> {
  // Build and cache the styles
  let styles = "";
  for await (
    const entry of expandGlob(
      path.join(__dirname, "..", "client", "**", "*.css"),
    )
  ) {
    const text = await Deno.readTextFile(entry.path);
    styles += `${text}\n`;
  }

  return styles;
}

async function buildClient(config?: ServerConfig): Promise<string> {
  const emitOptions: Deno.EmitOptions = {
    bundle: "module",
    check: false,
    importMapPath: path.join(__dirname, "..", "import_map.json"),
    compilerOptions: {
      target: "esnext",
      lib: ["dom", "dom.iterable", "dom.asynciterable", "deno.ns"],
    },
  };

  if (config?.devMode) {
    emitOptions.compilerOptions!.inlineSourceMap = true;
    emitOptions.importMapPath = path.join(
      __dirname,
      "..",
      "import_map_dev.json",
    );
  }

  const { files, diagnostics } = await Deno.emit(
    path.join(clientDir, "mod.tsx"),
    emitOptions,
  );

  if (diagnostics.length > 0) {
    console.warn(Deno.formatDiagnostics(diagnostics));
  }

  return files["deno:///bundle.js"];
}

/**
 * Watch styles. Live update them.
 */
async function watchStyles(
  updateStyles: (newStyles: string) => void,
  signal: AbortSignal,
) {
  const watcher = Deno.watchFs(clientDir);
  let timer: number | undefined;

  signal.addEventListener("abort", () => watcher.close());

  for await (const event of watcher) {
    if (event.paths.some((p) => /\.css$/.test(p))) {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        updateStyles(await buildStyles());
      }, 250);
    }
  }
}

export async function serve(config?: ServerConfig) {
  const [styles, client] = await Promise.all([
    buildStyles(),
    buildClient(config ?? {}),
  ]);

  const db = openDb();
  const { router, updateStyles } = createRouter({
    client,
    styles,
    db,
    devMode: config?.devMode,
  });
  const app = new Application();

  app.use(router.routes());
  app.use(router.allowedMethods());

  // serve assets in the public directory
  app.use(async (ctx) => {
    await ctx.send({
      root: path.join(__dirname, "..", "public"),
    });
  });

  const port = config?.port ?? 8765;

  // The abort signal can be used to gracefully shutdown a listening server and
  // style watcher
  const controller = new AbortController();
  const { signal } = controller;

  const listener = app.listen({ port, signal });

  if (config?.devMode) {
    watchStyles(updateStyles, signal);
  }

  listener.finally(() => db.close());

  return {
    listener,
    port,
    close: () => controller.abort(),
  };
}

export type Server = Awaited<ReturnType<typeof serve>>;
