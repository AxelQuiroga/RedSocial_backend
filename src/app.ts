import express from "express";
import userRoutes from "./interfaces/http/routes/user.routes.js";
import { logger } from "./middlewares/logger.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import postRoutes from "./interfaces/http/routes/post.routes.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,  
}));
 


app.use(express.json());
app.use(logger);

app.use("/users", userRoutes);
app.use("/posts", postRoutes);
// SIEMPRE al final
app.use(errorHandler);

export default app;