import type { Request, Response } from "express";
import { CreatePostUseCase } from "../../../application/use-cases/post/CreatePostUseCase.js";
import { GetPostsUseCase } from "../../../application/use-cases/post/GetPostsUseCase.js";
import { GetMyPostsUseCase } from "../../../application/use-cases/post/GetMyPostsUseCase.js";
import { DeletePostUseCase } from "../../../application/use-cases/post/DeletePostUseCase.js";
import { UpdatePostUseCase } from "../../../application/use-cases/post/UpdatePostUseCase.js";
import { GetPostsByUserUseCase } from "../../../application/use-cases/post/GetPostsByUserUseCase.js";
import { GetPostByIdUseCase } from "../../../application/use-cases/post/GetPostByIdUseCase.js";
import { GetFeedUseCase } from "../../../application/use-cases/post/GetFeedUseCase.js";
import { GetUserPublicProfileUseCase } from "../../../application/use-cases/user/GetUserPublicProfileUseCase.js";
import type { CreatePostRequest } from "../dtos/post/CreatePostRequest.js";
import type { UpdatePostRequest } from "../dtos/post/UpdatePostRequest.js";
import type { GetPostsResponse } from "../dtos/post/GetPostsResponse.js";
import {
  toCreatePostInput,
  toPostResponse,
  toPostWithAuthorResponse,
  toUpdatePostInput
} from "../mappers/post.mapper.js";

export class PostController {
  constructor(
    private createPostUseCase: CreatePostUseCase,
    private getPostsUseCase: GetPostsUseCase,
    private getMyPostsUseCase: GetMyPostsUseCase,
    private deletePostUseCase: DeletePostUseCase,
    private updatePostUseCase: UpdatePostUseCase,
    private getPostsByUserUseCase: GetPostsByUserUseCase,
    private getPostByIdUseCase: GetPostByIdUseCase,
    private getFeedUseCase: GetFeedUseCase,
    private getUserPublicProfileUseCase: GetUserPublicProfileUseCase
  ) { }

  async handle(req: Request, res: Response) {
    if (!req.user?.userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const input = toCreatePostInput(res.locals.validated.body as CreatePostRequest);
    const post = await this.createPostUseCase.execute(req.user.userId, input);
    res.status(201).json(toPostResponse(post));
  }

  async getAll(req: Request, res: Response) {
    const { page, limit } = res.locals.validated.query as { page: number; limit: number };
    const userId = req.user?.userId;
    const { posts, total } = await this.getPostsUseCase.execute(page, limit, userId);
    const response: GetPostsResponse = {
      data: posts.map(toPostWithAuthorResponse),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
    res.json(response);
  }

  async getMyPosts(req: Request, res: Response) {
    if (!req.user?.userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const posts = await this.getMyPostsUseCase.execute(req.user.userId);
    res.json(posts.map(toPostWithAuthorResponse));
  }

  async delete(req: Request, res: Response) {
    if (!req.user?.userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const { id: postId } = res.locals.validated.params as { id: string };
    await this.deletePostUseCase.execute(postId, req.user.userId);
    res.status(204).send();
  }

  async update(req: Request, res: Response) {
    if (!req.user?.userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const { id: postId } = res.locals.validated.params as { id: string };
    const data = toUpdatePostInput(
      res.locals.validated.body as UpdatePostRequest
    );
    const post = await this.updatePostUseCase.execute(postId, req.user.userId, data);
    res.json(toPostResponse(post));
  }

  async getById(req: Request, res: Response) {
    const { id } = res.locals.validated.params as { id: string };
    const userId = req.user?.userId;

    const post = await this.getPostByIdUseCase.execute(id, userId);
    res.json(toPostWithAuthorResponse(post));
  }

  async getFeed(req: Request, res: Response) {
    if (!req.user?.userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const { page, limit } = res.locals.validated.query as { page: number; limit: number };

    const { posts, total, fromFollowed } = await this.getFeedUseCase.execute(
      req.user.userId, page, limit
    );

    res.json({
      data: posts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        fromFollowed
      }
    });
  }

  async getPostsByUser(req: Request, res: Response) {
    const { username } = res.locals.validated.params as { username: string };
    const { page, limit } = res.locals.validated.query as { page: number; limit: number };
    const currentUserId = req.user?.userId;

    const user = await this.getUserPublicProfileUseCase.execute(username);
    const { data: posts, total } = await this.getPostsByUserUseCase.execute(
      user.id,
      currentUserId,
      page,
      limit
    );

    res.json({
      data: posts.map(toPostWithAuthorResponse),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  }
}
