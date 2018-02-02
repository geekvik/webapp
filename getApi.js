(function() {
  "use srict";

  const getJSON = url => fetch(url).then(res => res.json(), err => new Error(`Some Error Occurred ${err}`));

  const getApi = url => {
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

  /*
    getJSON('story.json').then((story) => {
      addHtmlToPage(story.heading);
      return story.chapterUrls.reduce((sequence, chapterUrl) => {
        // Once the last chapter's promise is done…
        return sequence.then(() => {
          // …fetch the next chapter
          return getJSON(chapterUrl);
        }).then((chapter) => {
          // and add it to the page
          addHtmlToPage(chapter.html);
        });
      }, Promise.resolve());
    }).then(() => {
      // And we're all done!
      addTextToPage("All done");
    }).catch((err) => {
      // Catch any error that happened along the way
      addTextToPage("Argh, broken: " + err.message);
    }).then(() => {
      // Always hide the spinner
      document.querySelector('.spinner').style.display = 'none';
    });
  */

  const spawn = (generatorFunc) => {
    const continuer = (verb, arg) => {
      var result;
      try {
        result = generator[verb](arg);
      } catch (err) {
        return Promise.reject(err);
      }
      if (result.done) {
        return result.value;
      } else {
        return Promise.resolve(result.value).then(onFulfilled, onRejected);
      }
    }
    var generator = generatorFunc();
    var onFulfilled = continuer.bind(continuer, "next");
    var onRejected = continuer.bind(continuer, "throw");
    return onFulfilled();
  }

  spawn(function*() {
    try {
      // 'yield' effectively does an async wait,
      // returning the result of the promise
      let story = yield getJSON('https://api.github.com/users/aasifrasul');
      console.log(story);
    } catch (err) {
      // try/catch just works, rejected promises are thrown here
      console.log("Argh, broken: " + err.message);
    }
  })

  class HttpError extends Error {
    constructor(response) {
      super(`${response.status} for ${response.url}`);
      this.name = 'HttpError';
      this.response = response;
    }
  }

  const loadJSON = path => {
    return fetch(path).then(response => {
      if (response.status == 200) {
        return response.json();
      } else {
        throw new HttpError(response);
      }
    });
  }

  loadJSON('https://api.github.com/users/aasifrasul')
    .then(res => console.log(res))
    .catch(error => console.log(error));

}());
