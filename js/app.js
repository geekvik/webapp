"use srict";

(function() {
  const getJSON = url => fetch(url).then(res => res.json(), err => new Error(`Some Error Occurred ${err}`));

  const { Worker, navigator, SharedWorker } = window || {};
  const { serviceWorker, storageQuota } = navigator || {};

  const loadJS = file => {
    const elem = document.createElement("script");
    elem.type = "application/javascript";
    elem.src = file;
    document.body.appendChild(elem);
  };

  var loadDynamically = [
    'DS/LinkedList.js',
    'DS/DoublyLinkedList.js',
    'DS/CircularLinkedList.js',
    'DS/SinglyList.js',
    'DS/DoublyList.js',
    'DS/Stack.js',
    'DS/Queue.js',
    'SWRegistration.js',
  ];

  loadDynamically.map(item => loadJS(item));

  if (Worker) {
    const importScriptWorker = new Worker('importScriptWorker.js');
    // importScriptWorker.postMessage(loadDynamically);
    // loadDynamically.map(item => importScriptWorker.postMessage(item));
  }

  if (storageQuota) {
    storageQuota.queryInfo("temporary").then(info => {
      console.log('quota', info.quota);
      // Result: <quota in bytes>
      console.log('usage', info.usage);
      // Result: <used data in bytes>
    });
  }


  // Using Web Worker

  if (Worker) {
    var myWorker = new Worker('web-Worker.js');
    console.log('Web Worker:', myWorker);
    myWorker.postMessage('Hello From main Thread');
    myWorker.addEventListener('message', e => {
      console.log('Worker said: ', e.data);
    }, false);

    myWorker.onmessage = e => {
      console.log('Message received from worker', e);
    }
  }

  //Using Shared Worker

  if (SharedWorker) {
    mySharedWorker = new SharedWorker('shared-Worker.js');
    mySharedWorker.port.start();
    mySharedWorker.port.postMessage('From Shared Worker');
  }

  /*
  document
    .querySelector('.cache-article')
    .addEventListener('click', (event) => {
      event.preventDefault();
      var id = this.dataset.articleId;
      caches.open('mysite-article-' + id).then((cache) => {
        fetch('/get-article-urls?id=' + id).then((response) => {
          // /get-article-urls returns a JSON-encoded array of
          // resource URLs that a given article depends on
          return response.json();
        }).then((urls) => {
          cache.addAll(urls);
        });
      });
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

  const createAsyncFunction = fn => {
    return () => {
      var gen = fn.apply(this, arguments);
      return new Promise((resolve, reject) => {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }
          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(value => step("next", value), err => step("throw", err));
          }
        }
        return step("next");
      });
    };
  }

  spawn(function*() {
    try {
      // 'yield' effectively does an async wait,
      // returning the result of the promise
      //let story = yield getJSON('https://api.github.com/users/aasifrasul');
      /*
      return [
        "https://api.github.com/users/aasifrasul/followers",
        "https://api.github.com/users/aasifrasul/following",
        "https://api.github.com/users/aasifrasul/gists",
        "https://api.github.com/users/aasifrasul/subscriptions",
        "https://api.github.com/users/aasifrasul/repos",
      ].reduce((sequence, url) => {
        // Once the last chapter's promise is done…
        return sequence.then(() => {
          // …fetch the next chapter
          return getJSON(url);
        }).then((chapter) => {
          // and add it to the page
          console.log(chapter);
        });
      }, Promise.resolve());
      */
    } catch (err) {
      // try/catch just works, rejected promises are thrown here
      console.log("Argh, broken: " + err.message);
    }
  });


  const createInlineWorker = () => {
    var blob = new Blob([
      //"onmessage = function(e) { postMessage('msg from worker'); }"
      "self.addEventListener('message', (e) => { self.postMessage(e.data); }, false);"
    ]);

    // Obtain a blob URL reference to our worker 'file'.
    var blobURL = window.URL.createObjectURL(blob);

    var worker = new Worker(blobURL);
    worker.onmessage = e => console.info(e.data);
    worker.postMessage('Msg From Main');
    window.URL.revokeObjectURL(blobURL);
  };

  // createInlineWorker();

}());
