import type { Request, Response } from "express";
import { LikePostUseCase } from "../../../application/use-cases/like/LikePostUseCase.js";
import { UnlikePostUseCase } from "../../../application/use-cases/like/UnlikePostUseCase.js";
import { GetPostLikesCountUseCase } from "../../../application/use-cases/like/GetPostLikesCountUseCase.js";
import type { LikePostRequest } from "../dtos/like/LikePostRequest.js";
import type { UnlikePostRequest } from "../dtos/like/UnlikePostRequest.js";
import {
  toLikePostInput,
  toUnlikePostInput,
  toLikeResponse,
  toLikeCountResponse
} from "../mappers/like.mapper.js";

export class LikeController {
  constructor(
    private likePostUseCase: LikePostUseCase,
    private unlikePostUseCase: UnlikePostUseCase,
    private getPostLikesCountUseCase: GetPostLikesCountUseCase
  ) {}

  async like(req: Request, res: Response) {
    if (!req.user?.userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const { id: postId } = res.locals.validated.params as { id: string };
    const input = toLikePostInput({ postId });
    const like = await this.likePostUseCase.execute(req.user.userId, input);
    res.status(201).json(toLikeResponse(like));
  }

  async unlike(req: Request, res: Response) {
    if (!req.user?.userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const { id: postId } = res.locals.validated.params as { id: string };
    const input = toUnlikePostInput({ postId });
    const deleted = await this.unlikePostUseCase.execute(req.user.userId, input);
    res.status(204).send();
  }

  async getLikes(req: Request, res: Response) {
    const { id: postId } = res.locals.validated.params as { id: string };
    const userId = req.user?.userId;
    const result = await this.getPostLikesCountUseCase.execute(postId, userId);
    const response = toLikeCountResponse({
      postId,
      likesCount: result.count,
      userHasLiked: result.userHasLiked
    });
    res.json(response);
  }
}
