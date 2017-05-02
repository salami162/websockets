/**
 * Module dependencies.
 */

var express = require('express')
  , bodyParser = require('body-parser')
  , http = require('http')
  , path = require('path')
  , url = require('url')
  , redis = require('redis')
  , _ = require('underscore');

// var routes_connections = require('./server/routes/connections')
// var routes_ripple = require('./server/routes/ripple')

var app = express();

app.enable("jsonp callback");

// all environments
app.set('port', process.env.PORT_LISTEN || 3000);

app.use(express.static( path.join(__dirname, 'public') ));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// app.use('/connections', routes_connections);
// app.use('/ripple', routes_ripple);

var port_listen = process.env.PORT_LISTEN;
var port_connect = process.env.PORT_CONNECT;
var websocket = require('ws');
var server = http.createServer(app);
var wss = new websocket.Server({ server: server, clientTracking: true });
var connections = {};
var serverLog = "[Server:" + port_listen + "] - ";
var clientLog = "[Client:" + port_listen + "] - ";

wss.on('connection', function connection(ws) {
  console.log(serverLog + 'connected');
  console.log(ws.uuid);

  ws.on('message', function incoming(message) {
    console.log(serverLog + 'received: ' + message);

    setTimeout(function timeout() {
      try {
        ws.send(JSON.stringify({
          "server_id": "server_" + port_listen,
          "timestamp": Date.now(),
          "message": "Yo!"
        }));
      } catch (e) {
        console.log(serverLog + "Error occurred " + e);
        ws.close();
      }
    }, 500);
  });
});

server.listen(port_listen, function() {
  console.log('Express server running @ http://127.0.0.1 on port ' + port_listen);
});

if (port_connect) {
  console.log("Connecting to port %s", port_connect);

  var wss_out = new websocket('ws://127.0.0.1:' + port_connect);
  wss_out.uuid = "1234";
  wss_out.on('open', function open() {
    console.log(clientLog + "connected");
    wss_out.send(JSON.stringify({
      "client_id": "client_" + port_listen,
      "timestamp": Date.now(),
      "message": "Hello"
    }));
  });

  wss_out.on('close', function close() {
    console.log(clientLog + "disconnected");
  });

  wss_out.on('message', function incoming(message) {
    console.log(clientLog + "received: " + message);

    setTimeout(function timeout() {
      try {
        wss_out.send(JSON.stringify({
          "client_id": "client_" + port_listen,
          "timestamp": Date.now(),
          "message": "Sup!"
        }));
      } catch (e) {
        console.log(clientLog + "Error occurred " + e);
        wss_out.close();
      }
    }, 500);

  });

}

