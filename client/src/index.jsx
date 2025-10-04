import React from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";

import AppWrapper from "./AppWrapper";
import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <AppWrapper>
    <HelmetProvider>
      <App />
    </HelmetProvider>
    ,
  </AppWrapper>,
);
