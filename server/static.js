const path = require("path");
const config = require("./config.json");
const Koa = require("koa");
const serve = require("koa-static");
const consola = require("consola");

const app = new Koa();

app.use(serve("./dist"));

app.listen(config.port, "0.0.0.0", () => {
  consola.info(`Server running on port ${config.port}`);
});
