import app from "./app.js";
import { env } from "./config/env.js";
import dotenv from "dotenv";

dotenv.config();

app.listen(env.PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${env.PORT}`);
});