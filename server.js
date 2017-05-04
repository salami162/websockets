/**
 * Module dependencies.
 */

var express = require('express')
  , bodyParser = require('body-parser')
  , http = require('http')
  , path = require('path')
  , url = require('url')
  , websocket = require('ws')
  , _ = require('underscore');


var app = express();
app.enable("jsonp callback");

app.use(express.static( path.join(__dirname, 'public') ));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// set routes
var routes_connections = require('./server/routes/connections');
var routes_ripple = require('./server/routes/ripple');
app.use('/connections', routes_connections);
app.use('/ripple', routes_ripple);

// all environments
const PORT_LISTEN = process.env.PORT_LISTEN;
const PORT_CONNECT = process.env.PORT_CONNECT;
const MAX_CONNECTION = 5;

app.set('PORT_LISTEN', PORT_LISTEN);
app.set('PORT_CONNECT', PORT_CONNECT);
app.set('MAX_CONNECTION', MAX_CONNECTION);

// log consts
const SERVER_LOG = "[Server:" + PORT_LISTEN + "] - ";
const CLIENT_LOG = "[Client:" + PORT_LISTEN + "] - ";
app.set('SERVER_LOG', SERVER_LOG);
app.set('CLIENT_LOG', CLIENT_LOG);

// websocket server
const server = http.createServer(app);
const wss = new websocket.Server({ server: server, clientTracking: true });

// connected websocket clients
// { PORT: LAST_UPDATED_AT }
app.set('connectedClients', {});
connectedClients = app.get('connectedClients');

// triggered when other clients open a connection to "me" (server)
wss.on('connection', function connection(ws) {
  totalConnections = Object.keys(connectedClients).length;
  console.log(SERVER_LOG + 'connected. Total=' + totalConnections);
  if (totalConnections > MAX_CONNECTION - 1) {
    console.log(SERVER_LOG + "Maximum connections reached! Reject!");
    ws.close();
    return;
  }

  // triggered when clients send a message to "me" (server)
  ws.on('message', function incoming(message) {
    console.log(SERVER_LOG + 'received: ' + message);
    jsonMessage = JSON.parse(message);
    if (!'uuid' in jsonMessage) {
      console.log(SERVER_LOG + "Invalid message received! Reject!");
      ws.close();
      return;
    }

    // update connectedClients
    if (jsonMessage['uuid'] in Object.keys(connectedClients)) {
      console.log("Duplicated client skip");
    } else {
      connectedClients[jsonMessage['uuid']] = ws;
      app.set('connectedClients', connectedClients);
    }

    console.log(SERVER_LOG + 'connectedClients = ' + Object.keys(connectedClients));
    
    // ack a message to the client after 1 sec
    setTimeout(function timeout() {
      try {
        ws.send(JSON.stringify({
          "uuid": PORT_LISTEN,
          "timestamp": Date.now(),
          "message": "Yo! from Server:" + PORT_LISTEN
        }));
      } catch (e) {
        console.log(SERVER_LOG + "Error occurred " + e);
        delete connectedClients[jsonMessage['uuid']];
        app.set('connectedClients', connectedClients);
        ws.close();
      }
    }, 1000);
  });
});

// start the websocket server on PORT_LISTEN
server.listen(PORT_LISTEN, function() {
  console.log('Express server running @ http://127.0.0.1 on port ' + PORT_LISTEN);
});

// if PORT_CONNECT is given, establish connection to the connect port.
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
