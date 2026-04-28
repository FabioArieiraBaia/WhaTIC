import "./bootstrap";
import "reflect-metadata";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as Sentry from "@sentry/node";

import "./database";
import path from "path";
import fs from "fs";
import uploadConfig from "./config/upload";
import AppError from "./errors/AppError";
import routes from "./routes";
import { logger } from "./utils/logger";
import { messageQueue, sendScheduledMessages } from "./queues";
import { corsOrigin } from "./helpers/corsOrigin";

class SystemError extends Error {
  code?: string;
}

Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();

app.set("queues", {
  messageQueue,
  sendScheduledMessages
});

app.use(
  cors({
    credentials: true,
    origin: corsOrigin,
    exposedHeaders: ["Content-Range", "X-Content-Range", "Date"]
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(Sentry.Handlers.requestHandler());
app.get("/public/*", (req, res) => {
  const storageType = process.env.STORAGE_TYPE || "local";
  const bucketName = process.env.GCS_BUCKET;

  if (storageType === "gcs" && bucketName) {
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${req.params[0]}`;
    return res.redirect(publicUrl);
  }

  const filePath = path.join(uploadConfig.directory, req.params[0]);
  console.log(`[PublicDebug] Request: ${req.params[0]} | Path: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    console.log(`[PublicDebug] File found! Sending...`);
    res.sendFile(filePath, (err) => {
      if (err) console.error(`[PublicDebug] Error sending file:`, err);
    });
  } else {
    console.error(`[PublicDebug] File NOT found: ${filePath}`);
    res.status(404).send("File not found");
  }
});

app.use((req, _res, next) => {
  const { method, url, query, body, headers } = req;
  logger.trace(
    { method, url, query, body, headers },
    `Incoming request: ${req.method} ${req.url}`
  );
  next();
});

app.get("/ping-portal", (req, res) => res.send("Portal Online!"));
app.use(routes);

app.use(Sentry.Handlers.errorHandler());
app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    logger[err.level](err);
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

export default app;
