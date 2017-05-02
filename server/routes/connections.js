var express = require('express');
var router = express.Router();

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time - connections: ', Date.now());
  next();
});

// define the home page route
router.get('/', function (req, res) {
  res.json({"message": "Birds home page"});
});

router.post('/', function (req, res) {
  const WebSocket = require('ws');

  const wss = new WebSocket.Server({
    perMessageDeflate: false,
    port: 8080
  });    
  
  wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      console.log('received: %s', message);
    });

    ws.send('something');
  });


  console.log(req.body);
  res.json(req.body);
});

module.exports = router;
