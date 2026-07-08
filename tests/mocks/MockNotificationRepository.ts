import type { NotificationRepository } from "../../src/domain/repositories/NotificationRepository.js";
import type { Notification } from "../../src/domain/entities/Notification.js";

export class MockNotificationRepository implements NotificationRepository {
  private notifications: Map<string, Notification> = new Map();

  seed(notifications: Notification[]): void {
    for (const n of notifications) {
      this.notifications.set(n.id, n);
    }
  }

  clear(): void {
    this.notifications.clear();
  }

  async create(data: Omit<Notification, "id" | "createdAt">): Promise<Notification> {
    const notification: Notification = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async findByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ notifications: Notification[]; total: number }> {
    const userNotifications = Array.from(this.notifications.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = userNotifications.length;
    const start = (page - 1) * limit;
    const paginated = userNotifications.slice(start, start + limit);

    return { notifications: paginated, total };
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    if (!notification || notification.userId !== userId) return false;

    notification.read = true;
    return true;
  }

  async markAllAsRead(userId: string): Promise<number> {
    let count = 0;
    for (const notification of this.notifications.values()) {
      if (notification.userId === userId && !notification.read) {
        notification.read = true;
        count++;
      }
    }
    return count;
  }

  async countUnread(userId: string): Promise<number> {
    let count = 0;
    for (const notification of this.notifications.values()) {
      if (notification.userId === userId && !notification.read) {
        count++;
      }
    }
    return count;
  }

  async findByCriteria(criteria: {
    userId?: string;
    actorId?: string;
    postId?: string;
    type?: Notification["type"];
  }): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter((n) => {
      if (criteria.userId && n.userId !== criteria.userId) return false;
      if (criteria.actorId && n.actorId !== criteria.actorId) return false;
      if (criteria.postId && n.postId !== criteria.postId) return false;
      if (criteria.type && n.type !== criteria.type) return false;
      return true;
    });
  }

  async deleteByCriteria(criteria: {
    userId?: string;
    actorId?: string;
    postId?: string;
    type?: Notification["type"];
  }): Promise<number> {
    const toDelete = await this.findByCriteria(criteria);
    for (const n of toDelete) {
      this.notifications.delete(n.id);
    }
    return toDelete.length;
  }
}
