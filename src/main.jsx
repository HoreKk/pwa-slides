import React from "react";
import { App } from "./components/root/App";

import { createRoot } from 'react-dom/client';
import checkConnectivity from 'network-latency';

const container = document.getElementById("root");

const root = createRoot(container);

document.addEventListener('db-updated', () => { 
  console.log('db updated')
})

checkConnectivity({
  interval: 3000,
  threshold: 2000,
});

root.render(
  <>
    <App />
  </>
);
