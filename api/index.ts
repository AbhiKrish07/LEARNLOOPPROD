import express, { Request, Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { apiV1Router } from "../server/apiV1";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Healthcheck
app.get(["/health", "/api/health"], (_req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    service: "learnloop-vercel-serverless",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// REST API v1
app.use("/api/v1", apiV1Router);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
