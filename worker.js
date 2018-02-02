// The SW will be shutdown when not in use to save memory,
// be aware that any global state is likely to disappear
console.log("SW startup");

self.addEventListener('install', (event) => {
  console.log("SW installed");
  console.log("event Object", event);
});

self.addEventListener('activate', (event) => {
  console.log("SW activated");
  console.log("event Object", event);
});

self.addEventListener('fetch', (event) => {
  console.log("Caught a fetch!");
  console.log("event Object", event);
  event.respondWith(new Response("Hello world!"));
});