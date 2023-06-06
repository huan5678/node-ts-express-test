import path from 'path';
import express, { NextFunction, Request, Response } from "express";
import "dotenv/config";

import cors from 'cors';
import EnvVars from "./constants/EnvVars";
import HttpStatusCodes from "./constants/HttpStatusCodes";

import { NodeEnvs } from "./constants/misc";
import { RouteError } from "./other/classes";
import ApiRouter from "./routers";


const app = express();
const port = 3000;

// Set views directory (html)
const viewsDir = path.join(__dirname, "views");
app.set("views", viewsDir);
app.set("view engine", "ejs");



// Set static directory (js and css).
// const staticDir = path.join(__dirname, './public');
// app.use(express.static(staticDir));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(cors());
app.use(ApiRouter);

// Add error handler
app.use(
  (
    err: Error,
    _: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
  ) => {
    if (EnvVars.NodeEnv !== NodeEnvs.Test) {
      console.error(err);
    }
    let status = HttpStatusCodes.BAD_REQUEST;
    if (err instanceof RouteError) {
      status = err.status;
    }
    return res.status(status).json({ error: err.message });
  }
);







app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
