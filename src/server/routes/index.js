"use strict";

module.exports = (app) => {
  app.get("/", (req, res) => {
    res.status(200).send("Hello World!");
  });

  {
    const fs = require("fs");
    const path = require("path");
    const files = fs.readdirSync("src/server/routes");
    files.forEach((file) => {
      if (file === "index.js") return;
      if (path.extname(file) !== ".js") return;

      console.log(`loading routes in ${file}`);
      const routes = require("./" + path.basename(file));

      if (typeof routes === "function") {
        routes(app);
      }
    });
  }
};

