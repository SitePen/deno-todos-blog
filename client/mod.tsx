import React from "react";
import ReactDOM from "react-dom";
import App from "./App.tsx";
import "../shared/types.ts";

ReactDOM.hydrate(
  <App initialState={globalThis.__INITIAL_STATE__} />,
  document.getElementById("root"),
);

delete globalThis.__INITIAL_STATE__;
