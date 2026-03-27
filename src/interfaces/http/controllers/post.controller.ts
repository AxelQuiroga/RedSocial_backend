import type { Request, Response } from "express";
import { CreatePostUseCase } from "../../../application/use-cases/post/CreatePostUseCase.js";
import { PrismaPostRepository } from "../../../infrastructure/repositories/PrismaPostRepository.js";
import { GetPostsUseCase } from "../../../application/use-cases/post/GetPostsUseCase.js";

export class CreatePostController {
  constructor(private createPostUseCase: CreatePostUseCase) {}

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId; //  viene del middleware

      if (!userId) {
        return res.status(401).json({ error: "No autorizado" });
      }

      const post = await this.createPostUseCase.execute(userId, req.body);

      return res.status(201).json(post);
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || "Error creando post"
      });
    }
  }
  async getAll(req: Request, res: Response) {
    try {
      const postRepo = new PrismaPostRepository();
      const useCase = new GetPostsUseCase(postRepo);

      const posts = await useCase.execute();

      res.json(posts);
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Error obteniendo posts"
      });
    }
  }
}