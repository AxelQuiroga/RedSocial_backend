import moduleAlias from "module-alias";
moduleAlias.addAliases({
  "@domain": "./dist/domain",
  "@application": "./dist/application", 
  "@infrastructure": "./dist/infrastructure",
  "@interfaces": "./dist/interfaces",
  "@config": "./dist/config",
  "@middlewares": "./dist/middlewares"
});

import app from "./app.js";
import { env } from "./config/env.js";
import { connectEventBus } from "./config/events.config.js";

async function bootstrap() {
  // No bloqueamos el arranque si RabbitMQ no está listo aún.
  // El ReconnectionManager lo reintentará en background automáticamente.
  await connectEventBus().catch(err => {
    console.warn('[Bootstrap] RabbitMQ no disponible, se reconectará en background:', err.message);
  });
  app.listen(env.PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${env.PORT}`);
  });
}

bootstrap();
