import { NotificationListeners } from "../infrastructure/events/NotificationListeners.js";
import { ImageCleanupListener } from "../infrastructure/events/ImageCleanupListener.js";
import { createNotificationService, createStorageService, createPostImageRepository } from "../infrastructure/di/factory.js";
import { eventBus } from "./eventBus.js";

let notificationListeners: NotificationListeners | null = null;
let imageCleanupListener: ImageCleanupListener | null = null;

function initializeEventListeners(): void {
  if (!notificationListeners) {
    const notificationService = createNotificationService();
    notificationListeners = new NotificationListeners(notificationService, eventBus);
  }

  if (!imageCleanupListener) {
    const storageService = createStorageService();
    const postImageRepository = createPostImageRepository();
    imageCleanupListener = new ImageCleanupListener(storageService, postImageRepository, eventBus);
  }
}

// 4. Conectar a RabbitMQ (llamar antes de app.listen)
export async function connectEventBus(): Promise<void> {
  initializeEventListeners();
  await eventBus.connect();
}

/**
 * Obtiene el estado actual del EventBus para monitoreo.
 */
export function getEventBusStatus() {
  return eventBus.getStatus();
}

/**
 * Desconecta el EventBus gracefulmente.
 * Útil para shutdown de la aplicación.
 */
export async function disconnectEventBus(): Promise<void> {
  await eventBus.disconnect();
}

/**
 * Configura graceful shutdown del EventBus.
 */
export function setupEventBusGracefulShutdown(): void {
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n📡 Recibido ${signal}, iniciando shutdown del EventBus...`);
    
    try {
      await disconnectEventBus();
      console.log('✅ EventBus desconectado exitosamente');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error en shutdown del EventBus:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}