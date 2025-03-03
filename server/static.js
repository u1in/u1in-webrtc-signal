const path = require("path");
const CONFIG = require("./config.json");
const Koa = require("koa");
const serve = require("koa-static");
const consola = require("consola");

const app = new Koa();

app.use(serve("./dist"));

app.listen(config.port, "0.0.0.0", () => {
  consola.info(`Static server running on port ${CONFIG.port}`);
});
