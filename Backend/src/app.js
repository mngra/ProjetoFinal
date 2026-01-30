require("dotenv").config();
const express = require("express");
const app = express();

const port = process.env.PORT || 9000;
const host = process.env.HOST || "0.0.0.0";

require("./init/db")(app, () => {
  require("./init/middleware")(app);
  require("./init/router")(app);

  app.listen(port, host, (err) => {
    if (err) throw err;
    console.log(`API a correr em http://${host}:${port}`);
  });
});
module.exports = app;
