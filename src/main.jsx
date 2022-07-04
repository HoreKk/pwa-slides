import React from "react";
import { App } from "./components/root/App";

import { createRoot } from 'react-dom/client';
import checkConnectivity from 'network-latency';

const container = document.getElementById("root");

const root = createRoot(container);

checkConnectivity({
  interval: 4000,
  threshold: 2000,
});

root.render(
  <>
    <App />
  </>
);
