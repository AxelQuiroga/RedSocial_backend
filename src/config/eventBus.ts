import { RabbitMQEventBus } from "../infrastructure/events/RabbitMQEventBus.js";

const retryConfig = {
  maxRetries: 10,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitterFactor: 0.1
};

export const eventBus = new RabbitMQEventBus(retryConfig);
