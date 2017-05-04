Websockets
===========
### Author: 
  Limin Shen

### Description:
  Build a distributed network on your local computer. 

  Instantiating a series of nodes that can all talk to each other. Each node behaves as a client as well as a server and has to connect to other nodes. The nodes connect to each other over websockets, so each node needs to run a websocket server as well as the ability to connect to other nodes using websocket clients.

  Two parameters can be passed in to start the Node:
  - PORT_LISTEN: port to listen on, e.g. 5000
  - PORT_CONNECT: port to connect, e.g. 5001 (optional)


### Technologies:
#### Server
- NodeJS as server
- Express middleware
- WS

### How to get started?
- checkout the repo.
- run ```npm install```to download all the node modules that are used in this project.
- start 1st server that listens on the given PORT_LISTEN: ```PORT_LISTEN=5000 node server.js```
- start 2nd server that provides both a PORT_LISTEN as well as a PORT_CONNECT: ```PORT_LISTEN=5001 PORT_CONNECT=5000 node server.js```
- start 3rd server that provides both a PORT_LISTEN as well as a PORT_CONNECT: ```PORT_LISTEN=5002 PORT_CONNECT=5000 node server.js```
- establish connection between 2nd and 3rd, run ```curl -X POST -H "Content-Type:application/json" http://localhost:5001/connections -d '{"port_connect":5002}'```
- close all connections on 1st server, run ```curl -X DELETE http://localhost:5000/connections```
- list all connections on 1st server, run ```curl -X GET http://localhost:5000/connections```
- subscribe ripple ledger stream, run ```curl -X POST -H "Content-Type:application/json" http://localhost:5000/ripple```
- unsubscribe ripple ledger stream, run ```curl -X DELETE http://localhost:5000/ripple```

