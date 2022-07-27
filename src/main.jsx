import React from "react";
import { App } from "./components/root/App";

import { createRoot } from 'react-dom/client';
import checkConnectivity from 'network-latency';

import { registerSW } from 'virtual:pwa-register'
import { Toaster } from "react-hot-toast";

// const updateSW = registerSW({
//   onOfflineReady() {},
// })
if ("serviceWorker" in navigator) {
  // && !/localhost/.test(window.location) && !/lvh.me/.test(window.location)) {
  const updateSW = registerSW({
    onNeedRefresh() {
      Toaster({
        text: `<h4 style='display: inline'>An update is available!</h4>
               <br><br>
               <a class='do-sw-update'>Click to update and reload</a>  `,
        escapeMarkup: false,
        gravity: "bottom",
        onClick() {
          updateSW(true);
        }
      }).showToast();
    }
  });
}

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
