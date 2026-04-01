import type { Request, Response } from "express";
import { CreatePostUseCase } from "../../../application/use-cases/post/CreatePostUseCase.js";
import { PrismaPostRepository } from "../../../infrastructure/repositories/PrismaPostRepository.js";
import { GetPostsUseCase } from "../../../application/use-cases/post/GetPostsUseCase.js";
import { GetMyPostsUseCase } from "../../../application/use-cases/post/GetMyPostsUseCase.js";
import { DeletePostUseCase } from "../../../application/use-cases/post/DeletePostUseCase.js";
import { UpdatePostUseCase } from "../../../application/use-cases/post/UpdatePostUseCase.js";
import type { CreatePostRequest } from "../dtos/post/CreatePostRequest.js";
import type { UpdatePostRequest } from "../dtos/post/UpdatePostRequest.js";
import type { GetPostsResponse } from "../dtos/post/GetPostsResponse.js";
import {
  toCreatePostInput,
  toPostResponse,
  toPostWithAuthorResponse,
  toUpdatePostInput
} from "../mappers/post.mapper.js";

export class CreatePostController {
  constructor(private createPostUseCase: CreatePostUseCase) { }

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId; //  viene del middleware

      if (!userId) {
        return res.status(401).json({ error: "No autorizado" });
      }

      const input = toCreatePostInput(req.body as CreatePostRequest);
      const post = await this.createPostUseCase.execute(userId, input);

      return res.status(201).json(toPostResponse(post));
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || "Error creando post"
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      // Extraer y validar query params
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
      
      const postRepo = new PrismaPostRepository();
      const useCase = new GetPostsUseCase(postRepo);
      
      const { posts, total } = await useCase.execute(page, limit);
      const response: GetPostsResponse = {
        data: posts.map(toPostWithAuthorResponse),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };

      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || "Error obteniendo posts"
      });
    }
  }

  async getMyPosts(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: "No autorizado" });
      }

      const postRepo = new PrismaPostRepository();
      const useCase = new GetMyPostsUseCase(postRepo);

      const posts = await useCase.execute(userId);

      return res.json(posts.map(toPostWithAuthorResponse));
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error obteniendo posts"
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const postId = req.params.id;

      if (!userId) {
        return res.status(401).json({ error: "No autorizado" });
      }

      if (!postId || Array.isArray(postId)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const postRepo = new PrismaPostRepository();
      const deleteUseCase = new DeletePostUseCase(postRepo); // o crear en constructor
      await deleteUseCase.execute(postId, userId);

      return res.status(204).send(); // 204 = No Content (éxito sin body)
    } catch (error: any) {
      const status = error.message === "Post no encontrado" ? 404 :
        error.message === "No autorizado" ? 403 : 500;
      return res.status(status).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const postId = req.params.id;
      const data = toUpdatePostInput(req.body as UpdatePostRequest);

      if (!userId) {
        return res.status(401).json({ error: "No autorizado" });
      }

      if (!postId || Array.isArray(postId)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const postRepo = new PrismaPostRepository();
      const updateUseCase = new UpdatePostUseCase(postRepo);
      const post = await updateUseCase.execute(postId, userId, data);

      return res.json(toPostResponse(post));
    } catch (error: any) {
      const status = error.message === "Post no encontrado" ? 404 :
        error.message === "No autorizado" ? 403 : 500;
      return res.status(status).json({ error: error.message });
    }
  }
}
