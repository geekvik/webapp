onconnect = (e) => {
  var port = e.ports[0];

  port.onmessage = (e) => {
    var workerResult = 'Result: ' + (e.data[0] * e.data[1]);
    port.postMessage(workerResult);
  }
}
