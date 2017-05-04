var express = require('express')
  , websocket = require('ws')
  , _ = require('underscore');
var router = express.Router();


// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time - connections: ', Date.now());
  next();
});

// define the home page route
router.get('/', function (req, res) {
  var connectedClients = req.app.get('connectedClients');
  res.json({
    "connected_clients": Object.keys(connectedClients)
  });
});

router.post('/', function (req, res) {
  var PORT_LISTEN = req.app.get('PORT_LISTEN');
  var PORT_CONNECT = req.app.get('PORT_CONNECT');
  var CLIENT_LOG = req.app.get('CLIENT_LOG');

  if (req.body['port_connect']) {
    PORT_CONNECT = req.body['port_connect'];
  }

  if (PORT_CONNECT) {
    console.log("Connecting to port %s", PORT_CONNECT);

    // websocket client
    var wsc = new websocket('ws://127.0.0.1:' + PORT_CONNECT);

    // triggered when me (as client) create a connection to another server
    wsc.on('open', function open() {
      console.log(CLIENT_LOG + "connected");
      wsc.send(JSON.stringify({
        "uuid": PORT_LISTEN,
        "timestamp": Date.now(),
        "message": "Hello from Client:" + PORT_LISTEN
      }));
    });

    // triggered when me (as client) close a connection
    wsc.on('close', function close() {
      console.log(CLIENT_LOG + "disconnected");
    });

    // triggered when me (as a client) receives a message 
    wsc.on('message', function incoming(message) {
      console.log(CLIENT_LOG + "received: " + message);

      // ack a message to the server after 1 sec
      setTimeout(function timeout() {
        try {
          wsc.send(JSON.stringify({
            "uuid": PORT_LISTEN,
            "timestamp": Date.now(),
            "message": "Sup! from Client:" + PORT_LISTEN
          }));
        } catch (e) {
          console.log(CLIENT_LOG + "Error occurred " + e);
          wsc.close();
        }
      }, 1000);
    });
  }

  res.json({"action": "reconnect"});
});

router.delete('/', function (req, res) {
  var connectedClients = req.app.get('connectedClients');
  _.forEach(connectedClients, function(wsc) {
    wsc.close();
  });
  req.app.set('connectedClients', {});
  res.json({"action": "disconnected_all"});
});

module.exports = router;
