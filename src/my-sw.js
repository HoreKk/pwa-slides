import { registerSW } from 'virtual:pwa-register';
import { Toaster } from 'react-hot-toast';

if ('serviceWorker' in navigator) {
  // && !/localhost/.test(window.location) && !/lvh.me/.test(window.location)) {
  const updateSW = registerSW({
    onNeedRefresh() {
      Toaster({
        text: `<h4 style='display: inline'>An update is available!</h4>
               <br><br>
               <a class='do-sw-update'>Click to update and reload</a>  `,
        escapeMarkup: false,
        gravity: 'bottom',
        onClick() {
          updateSW(true);
        },
      }).showToast();
    },
  });
  self.addEventListener('fetch', function (event) {
    console.log(event.request.url);
    event.respondWith(
      caches.match(event.request).then(function (response) {
        return response || fetch(event.request);
      })
    );
  });
}
