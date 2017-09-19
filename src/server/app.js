"use strict";

const app = require("express")();

const routes = require("./routes");

const port = process.env.PORT || 3000;

routes(app);

app.listen(port);
console.log(`Listening on port ${port}`);

