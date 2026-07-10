import type { Request, Response } from "express";
import { FollowUserUseCase } from "../../../application/use-cases/follow/FollowUserUseCase.js";
import { UnfollowUserUseCase } from "../../../application/use-cases/follow/UnfollowUserUseCase.js";
import { GetFollowersUseCase } from "../../../application/use-cases/follow/GetFollowersUseCase.js";
import { GetFollowingUseCase } from "../../../application/use-cases/follow/GetFollowingUseCase.js";
import { GetFollowCountsUseCase } from "../../../application/use-cases/follow/GetFollowCountsUseCase.js";
import { IsFollowingUseCase } from "../../../application/use-cases/follow/IsFollowingUseCase.js";
import { GetFollowingBatchUseCase } from "../../../application/use-cases/follow/GetFollowingBatchUseCase.js";

export class FollowController {
  constructor(
    private followUserUseCase: FollowUserUseCase,
    private unfollowUserUseCase: UnfollowUserUseCase,
    private getFollowersUseCase: GetFollowersUseCase,
    private getFollowingUseCase: GetFollowingUseCase,
    private getFollowCountsUseCase: GetFollowCountsUseCase,
    private isFollowingUseCase: IsFollowingUseCase,
    private getFollowingBatchUseCase: GetFollowingBatchUseCase
  ) {}

  async follow(req: Request, res: Response) {
    const { userId: followingId } = res.locals.validated.params as { userId: string };
    const followerId = req.user!.userId;

    const result = await this.followUserUseCase.execute(followerId, followingId);
    res.status(201).json(result);
  }

  async unfollow(req: Request, res: Response) {
    const { userId: followingId } = res.locals.validated.params as { userId: string };
    const followerId = req.user!.userId;

    const result = await this.unfollowUserUseCase.execute(followerId, followingId);
    res.json(result);
  }

  async getFollowers(req: Request, res: Response) {
    const { userId } = res.locals.validated.params as { userId: string };
    const { page, limit } = res.locals.validated.query as { page: number; limit: number };

    const result = await this.getFollowersUseCase.execute(userId, page, limit);
    res.json(result);
  }

  async getFollowing(req: Request, res: Response) {
    const { userId } = res.locals.validated.params as { userId: string };
    const { page, limit } = res.locals.validated.query as { page: number; limit: number };

    const result = await this.getFollowingUseCase.execute(userId, page, limit);
    res.json(result);
  }

  async getCounts(req: Request, res: Response) {
    const { userId } = res.locals.validated.params as { userId: string };

    const result = await this.getFollowCountsUseCase.execute(userId);
    res.json(result);
  }

  async status(req: Request, res: Response) {
    const { userId: followingId } = res.locals.validated.params as { userId: string };
    const followerId = req.user!.userId;

    const isFollowing = await this.isFollowingUseCase.execute(followerId, followingId);
    res.json({ isFollowing });
  }

  async statusBatch(req: Request, res: Response) {
    const { userIds } = res.locals.validated.body as { userIds: string[] };
    const followerId = req.user!.userId;

    const result = await this.getFollowingBatchUseCase.execute(followerId, userIds);
    const statusMap: Record<string, boolean> = {};
    for (const [id, isFollowing] of result) {
      statusMap[id] = isFollowing;
    }
    res.json({ status: statusMap });
  }
}
