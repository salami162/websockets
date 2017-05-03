var express = require('express');
var websocket = require('ws');
var router = express.Router();

const wss = new websocket('wss://s1.ripple.com:443');

// When receive a message from the server, log the message data, and flag
wss.on('message', function incoming(data, flags) {
  console.log("============");
  jsonData = JSON.parse(data);
  if (jsonData["type"] == "ledgerClosed") {
    console.log("ledgerClosed =", jsonData);
    console.log("flags =", flags);
  } else {
    console.log("NOT a ledgerClosed message. TYPE =", jsonData["type"]);
    console.log("data =", jsonData);
    console.log("flags =", flags);
  }
});

wss.on('open', function open() {
  console.log("ripple client connectioned");
  // send the "subscribe" command to the websocket server.
  // specify "streams" as "ledger".
  // The "ledger" stream only sends "ledgerClosed" messages
  // when the consensus process declares a new validated ledger.
});

wss.on('close', function close() {
  console.log('ripple client disconnected');
});

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time - ripple: ', Date.now());
  next();
});

// define the home page route
router.post('/', function (req, res) {
  wss.send(JSON.stringify({
    "id": 1,
    "command": "subscribe",
    "streams": [
      "ledger"
    ]
  }));
  console.log(req.body);
  res.json(req.body);
});

router.delete('/', function (req, res) {
  wss.send(JSON.stringify({
    "id": 6,
    "command": "unsubscribe",
    "streams": [
      "ledger"
    ]
  }));
  res.json("ack");
});

module.exports = router;
