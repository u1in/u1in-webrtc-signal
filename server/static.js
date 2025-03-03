const CONFIG = require("./config.json");
const path = require("path");
const Koa = require("koa");
const serve = require("koa-static");
const consola = require("consola");

const app = new Koa();

app.use(serve(path.join(__dirname, "./dist")));

app.listen(CONFIG.port, "0.0.0.0", () => {
  consola.info(`Static server running on port ${CONFIG.port}`);
});
