"use srict";

(function() {
  const { Worker, navigator, SharedWorker } = window || {};
  const { serviceWorker, storageQuota } = navigator || {};

  if (serviceWorker) {
    // Delay registration until after the page has loaded, to ensure that our
    // precaching requests don't degrade the first visit experience.
    // See https://developers.google.com/web/fundamentals/instant-and-offline/service-worker/registration
    window.addEventListener('load', () => {
      // Your service-worker.js *must* be located at the top-level directory relative to your site.
      // It won't be able to control pages unless it's located at the same level or higher than them.
      // *Don't* register service worker file in, e.g., a scripts/ sub-directory!
      // See https://github.com/slightlyoff/ServiceWorker/issues/468
      serviceWorker
        .register('/service.worker.recipe.prefetch.js', { scope: '/' })
        .then(serviceWorker.ready)
        .then(reg => {
          reg.update();

          // updatefound is fired if service-worker.js changes.
          // reg.addEventListener('updatefound', () => {
          reg.onupdatefound = () => {
            // The updatefound event implies that reg.installing is set; see
            // https://w3c.github.io/ServiceWorker/#service-worker-registration-updatefound-event
            var installingWorker = reg.installing;

            // installingWorker.addEventListener('statechange', () => {
            installingWorker.onstatechange = () => {
              switch (installingWorker.state) {
                case 'installed':
                  if (serviceWorker.controller) {
                    // At this point, the old content will have been purged and the fresh content will
                    // have been added to the cache.
                    // It's the perfect time to display a "New content is available; please refresh."
                    // message in the page's interface.
                    console.log('New or updated content is available.');
                  } else {
                    // At this point, everything has been precached.
                    // It's the perfect time to display a "Content is cached for offline use." message.
                    console.log('Content is now available offline!');
                  }
                  break;

                // case 'installed':
                // case 'activating':
                // case 'activated':
                case 'redundant':
                  console.error('The installing service worker became redundant.');
                  break;
              }
            };
          };
        }).catch((e) => {
          console.error('Error during service worker registration:', e);
        });
    });

    serviceWorker.addEventListener('controllerchange', () => {
      // This fires when the service worker controlling this page
      // changes, eg a new worker has skipped waiting and become
      // the new active worker.
    });
  }

}());
