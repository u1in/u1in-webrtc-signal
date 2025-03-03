const Koa = require("koa");
const path = require("path");
const serve = require("koa-static");
const consola = require("consola");

const app = new Koa();

app.use(serve(path.join(__dirname, "./dist")));

app.listen(3125, "0.0.0.0", () => {
  consola.info(`Demo server running on http://localhost:3125`);
});
