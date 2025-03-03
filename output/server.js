/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 86:
/***/ ((module) => {

"use strict";
module.exports = require("ws");

/***/ }),

/***/ 101:
/***/ ((module) => {

"use strict";
module.exports = require("koa");

/***/ }),

/***/ 178:
/***/ ((module) => {

"use strict";
module.exports = require("randomstring");

/***/ }),

/***/ 572:
/***/ ((module) => {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('{"port":3123,"ws":{"port":3124}}');

/***/ }),

/***/ 694:
/***/ ((module) => {

"use strict";
module.exports = require("koa-static");

/***/ }),

/***/ 791:
/***/ ((__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) => {

"use strict";

;// external "core-js/modules/es.array.iterator.js"
const es_array_iterator_js_namespaceObject = require("core-js/modules/es.array.iterator.js");
;// external "core-js/modules/es.date.to-json.js"
const es_date_to_json_js_namespaceObject = require("core-js/modules/es.date.to-json.js");
;// external "core-js/modules/es.map.js"
const es_map_js_namespaceObject = require("core-js/modules/es.map.js");
;// external "core-js/modules/es.object.keys.js"
const es_object_keys_js_namespaceObject = require("core-js/modules/es.object.keys.js");
;// external "core-js/modules/es.object.to-string.js"
const es_object_to_string_js_namespaceObject = require("core-js/modules/es.object.to-string.js");
;// external "core-js/modules/es.string.iterator.js"
const es_string_iterator_js_namespaceObject = require("core-js/modules/es.string.iterator.js");
;// external "core-js/modules/web.dom-collections.iterator.js"
const web_dom_collections_iterator_js_namespaceObject = require("core-js/modules/web.dom-collections.iterator.js");
;// ./server/signal.js







var path = __webpack_require__(928);
var Koa = __webpack_require__(101);
var CONFIG = __webpack_require__(572);
var _require = __webpack_require__(86),
  WebSocketServer = _require.WebSocketServer;
var randomstring = __webpack_require__(178);
var consola = __webpack_require__(797);
var wss = new WebSocketServer({
  port: CONFIG.ws.port
});
var clients = new Map();
var signal = function signal(senderId, data) {
  var type = data.type,
    targetId = data.targetId,
    payload = data.payload;
  switch (type) {
    case "offer":
    case "answer":
    case "candidate":
    case "puase":
    case "resume":
    case "bye":
      if (clients.has(targetId)) {
        clients.get(targetId).send(JSON.stringify({
          type: type,
          senderId: senderId,
          payload: payload
        }));
      }
      break;
  }
};
wss.on("connection", function (ws) {
  var id = randomstring.generate(10);
  clients.set(id, ws);
  consola.info("Client ".concat(id, " connected"));
  ws.on("message", function (message) {
    signal(id, JSON.parse(message));
  });
  ws.on("close", function () {
    clients["delete"](id);
    consola.info("Client ".concat(id, " disconnected"));
  });
  ws.send(JSON.stringify({
    type: "welcome",
    senderId: null,
    payload: id
  }));
});
consola.info("Websocket server running on port ".concat(CONFIG.ws.port));

/***/ }),

/***/ 797:
/***/ ((module) => {

"use strict";
module.exports = require("consola");

/***/ }),

/***/ 830:
/***/ ((__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) => {

"use strict";

;// external "core-js/modules/es.array.join.js"
const es_array_join_js_namespaceObject = require("core-js/modules/es.array.join.js");
;// ./server/static.js

var CONFIG = __webpack_require__(572);
var path = __webpack_require__(928);
var Koa = __webpack_require__(101);
var serve = __webpack_require__(694);
var consola = __webpack_require__(797);
var app = new Koa();
app.use(serve(path.join(__dirname, "./dist")));
app.listen(CONFIG.port, "0.0.0.0", function () {
  consola.info("Static server running on port ".concat(CONFIG.port));
});

/***/ }),

/***/ 928:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
console.clear();
__webpack_require__(830);
__webpack_require__(791);
/******/ })()
;