import { PrismaClient } from "@prisma/client";
import type { FollowRepository } from "../../domain/repositories/FollowRepository.js";

export class PrismaFollowRepository implements FollowRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async follow(followerId: string, followingId: string): Promise<void> {
    await this.prisma.follow.create({
      data: { followerId, followingId }
    });
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    await this.prisma.follow.delete({
      where: {
        followerId_followingId: { followerId, followingId }
      }
    });
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId }
      }
    });
    return follow !== null;
  }

  async getFollowers(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [follows, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followingId: userId },
        skip,
        take: limit,
        include: {
          follower: {
            select: { id: true, username: true, displayName: true, avatarUrl: true }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.follow.count({
        where: { followingId: userId }
      })
    ]);

    return {
      followers: follows.map(f => f.follower),
      total
    };
  }

  async getFollowing(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [follows, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: userId },
        skip,
        take: limit,
        include: {
          following: {
            select: { id: true, username: true, displayName: true, avatarUrl: true }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.follow.count({
        where: { followerId: userId }
      })
    ]);

    return {
      following: follows.map(f => f.following),
      total
    };
  }

  async getFollowersCount(userId: string): Promise<number> {
    return this.prisma.follow.count({
      where: { followingId: userId }
    });
  }

  async getFollowingCount(userId: string): Promise<number> {
    return this.prisma.follow.count({
      where: { followerId: userId }
    });
  }

  async getFollowingIds(userId: string): Promise<string[]> {
    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    });
    return follows.map(f => f.followingId);
  }
}
