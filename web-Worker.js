(function() {
  "use srict";

	importScripts('js/states.json');

  async function getJSON(url) {
    return await get(url).then(JSON.parse);
  }

  function get(url) {
    // Return a new promise.
    return new Promise((resolve, reject) => {
      // Do the usual XHR stuff
      var req = new XMLHttpRequest();
      req.open('GET', url);

      req.onload = () => {
        // This is called even on 404 etc
        // so check the status
        if (req.status == 200) {
          // Resolve the promise with the response text
          resolve(req.response);
        } else {
          // Otherwise reject with the status text
          // which will hopefully be a meaningful error
          reject(Error(req.statusText));
        }
      };

      // Handle network errors
      req.onerror = () => {
        reject(Error("Network Error"));
      };

      // Make the request
      req.send();
    });
  }

  self.addEventListener('message', e =>
    getJSON('https://api.github.com/users/aasifrasul')
      .then(result => self.postMessage(result)), false);

}());
