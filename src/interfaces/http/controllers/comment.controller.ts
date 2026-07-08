import type { Request, Response } from "express";
import { CreateCommentUseCase } from "../../../application/use-cases/comment/CreateCommentUseCase.js";
import { UpdateCommentUseCase } from "../../../application/use-cases/comment/UpdateCommentUseCase.js";
import { DeleteCommentUseCase } from "../../../application/use-cases/comment/DeleteCommentUseCase.js";
import { GetPostCommentsUseCase } from "../../../application/use-cases/comment/GetPostCommentsUseCase.js";
import { GetCommentRepliesUseCase } from "../../../application/use-cases/comment/GetCommentRepliesUseCase.js";
import type { CreateCommentRequest } from "../dtos/comment/CreateCommentRequest.js";
import type { UpdateCommentRequest } from "../dtos/comment/UpdateCommentRequest.js";
import {
  toCreateCommentInput,
  toUpdateCommentInput,
  toCommentResponse,
  toPaginatedCommentsResponse,
  extractCommentId,
  extractPostId
} from "../mappers/comment.mapper.js";

export class CommentController {
  constructor(
    private createCommentUseCase: CreateCommentUseCase,
    private updateCommentUseCase: UpdateCommentUseCase,
    private deleteCommentUseCase: DeleteCommentUseCase,
    private getPostCommentsUseCase: GetPostCommentsUseCase,
    private getCommentRepliesUseCase: GetCommentRepliesUseCase
  ) {}

  async create(req: Request, res: Response) {
    if (!req.user?.userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const postId = extractPostId(res.locals.validated.params as { id: string });
    const body = res.locals.validated.body as CreateCommentRequest;
    const input = toCreateCommentInput({ ...body, postId });
    const comment = await this.createCommentUseCase.execute(req.user.userId, input);
    res.status(201).json(toCommentResponse(comment));
  }

  async update(req: Request, res: Response) {
    if (!req.user?.userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const commentId = extractCommentId(res.locals.validated.params as { id: string });
    const body = res.locals.validated.body as UpdateCommentRequest;
    const input = toUpdateCommentInput(body);
    const comment = await this.updateCommentUseCase.execute(req.user.userId, commentId, input);
    res.json(toCommentResponse(comment));
  }

  async delete(req: Request, res: Response) {
    if (!req.user?.userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const commentId = extractCommentId(res.locals.validated.params as { id: string });
    const deleted = await this.deleteCommentUseCase.execute(req.user.userId, commentId);
    if (!deleted) {
      res.status(404).json({ error: "Comentario no encontrado" });
      return;
    }
    res.status(204).send();
  }

  async getByPost(req: Request, res: Response) {
    const postId = extractPostId(res.locals.validated.params as { id: string });
    const { page, limit } = res.locals.validated.query as { page: number; limit: number };
    const result = await this.getPostCommentsUseCase.execute(postId, page, limit);
    res.json(toPaginatedCommentsResponse(result));
  }

  async getReplies(req: Request, res: Response) {
    const commentId = extractCommentId(res.locals.validated.params as { id: string });
    const { page, limit } = res.locals.validated.query as { page: number; limit: number };
    const result = await this.getCommentRepliesUseCase.execute(commentId, page, limit);
    res.json(toPaginatedCommentsResponse(result));
  }
}
