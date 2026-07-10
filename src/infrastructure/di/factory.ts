import { prisma } from "@infrastructure/database/prisma.js";

// Imagenes
import type { PostImageRepository } from "@domain/repositories/PostImageRepository.js";
import type { StorageService } from "@domain/services/StorageService.js";
import type { ImageProcessingService } from "@domain/services/ImageProcessingService.js";
import { PrismaPostImageRepository } from "@infrastructure/repositories/PrismaPostImageRepository.js";
import { S3StorageService } from "@infrastructure/storage/S3StorageService.js";
import { SharpImageProcessingService } from "@infrastructure/services/SharpImageProcessingService.js";

import { PresignUploadUseCase } from "@application/use-cases/post/PresignUploadUseCase.js";
import { ConfirmUploadUseCase } from "@application/use-cases/post/ConfirmUploadUseCase.js";
import { DeletePostImageUseCase } from "@application/use-cases/post/DeletePostImageUseCase.js";
import { ReorderPostImagesUseCase } from "@application/use-cases/post/ReorderPostImagesUseCase.js";
import { GetPostImagesUseCase } from "@application/use-cases/post/GetPostImagesUseCase.js";

// Domain Types
import type { PostRepository } from "@domain/repositories/PostRepository.js";
import type { LikeRepository } from "@domain/repositories/LikeRepository.js";
import type { UserRepository } from "@domain/repositories/UserRepository.js";
import type { CommentRepository } from "@domain/repositories/CommentRepository.js";
import type { NotificationRepository } from "@domain/repositories/NotificationRepository.js";
import type { FollowRepository } from "@domain/repositories/FollowRepository.js";

// Infrastructure Implementations
import { PrismaPostRepository } from "@infrastructure/repositories/PrismaPostRepository.js";
import { PrismaLikeRepository } from "@infrastructure/repositories/PrismaLikeRepository.js";
import { PrismaUserRepository } from "@infrastructure/repositories/PrismaUserRepository.js";
import { PrismaCommentRepository } from "@infrastructure/repositories/PrismaCommentRepository.js";
import { PrismaNotificationRepository } from "@infrastructure/repositories/PrismaNotificationRepository.js";
import { PrismaFollowRepository } from "@infrastructure/repositories/PrismaFollowRepository.js";

// Application Use Cases — Posts
import { CreatePostUseCase } from "@application/use-cases/post/CreatePostUseCase.js";
import { GetPostsUseCase } from "@application/use-cases/post/GetPostsUseCase.js";
import { GetMyPostsUseCase } from "@application/use-cases/post/GetMyPostsUseCase.js";
import { DeletePostUseCase } from "@application/use-cases/post/DeletePostUseCase.js";
import { UpdatePostUseCase } from "@application/use-cases/post/UpdatePostUseCase.js";
import { GetPostsByUserUseCase } from "@application/use-cases/post/GetPostsByUserUseCase.js";
import { GetPostByIdUseCase } from "@application/use-cases/post/GetPostByIdUseCase.js";

// Application Use Cases — User
import { RegisterUserUseCase } from "@application/use-cases/user/RegisterUserUseCase.js";
import { LoginUserUseCase } from "@application/use-cases/user/LoginUserUseCase.js";
import { GetMyProfileUseCase } from "@application/use-cases/user/GetMyProfileUseCase.js";
import { UpdateUserProfileUseCase } from "@application/use-cases/user/UpdateUserProfileUseCase.js";
import { GetUserPublicProfileUseCase } from "@application/use-cases/user/GetUserPublicProfileUseCase.js";

// Application Use Cases — Like
import { LikePostUseCase } from "@application/use-cases/like/LikePostUseCase.js";
import { UnlikePostUseCase } from "@application/use-cases/like/UnlikePostUseCase.js";
import { GetPostLikesCountUseCase } from "@application/use-cases/like/GetPostLikesCountUseCase.js";

// Application Use Cases — Comment
import { CreateCommentUseCase } from "@application/use-cases/comment/CreateCommentUseCase.js";
import { UpdateCommentUseCase } from "@application/use-cases/comment/UpdateCommentUseCase.js";
import { DeleteCommentUseCase } from "@application/use-cases/comment/DeleteCommentUseCase.js";
import { GetPostCommentsUseCase } from "@application/use-cases/comment/GetPostCommentsUseCase.js";
import { GetCommentRepliesUseCase } from "@application/use-cases/comment/GetCommentRepliesUseCase.js";

// Application Use Cases — Notification
import { GetNotificationsUseCase } from "@application/use-cases/notification/GetNotificationsUseCase.js";
import { GetUnreadCountUseCase } from "@application/use-cases/notification/GetUnreadCountUseCase.js";
import { MarkAsReadUseCase } from "@application/use-cases/notification/MarkAsReadUseCase.js";
import { MarkAllAsReadUseCase } from "@application/use-cases/notification/MarkAllAsReadUseCase.js";

// Application Use Cases — Follow
import { FollowUserUseCase } from "@application/use-cases/follow/FollowUserUseCase.js";
import { UnfollowUserUseCase } from "@application/use-cases/follow/UnfollowUserUseCase.js";
import { GetFollowersUseCase } from "@application/use-cases/follow/GetFollowersUseCase.js";
import { GetFollowingUseCase } from "@application/use-cases/follow/GetFollowingUseCase.js";
import { GetFollowCountsUseCase } from "@application/use-cases/follow/GetFollowCountsUseCase.js";
import { IsFollowingUseCase } from "@application/use-cases/follow/IsFollowingUseCase.js";

// Services
import { NotificationService } from "@application/services/NotificationService.js";
import type { AIService } from "@domain/services/AIService.js";
import { GeminiAIService } from "@infrastructure/services/GeminiAIService.js";

// Controllers
import { PostController } from "@interfaces/http/controllers/post.controller.js";
import { PostImagesController } from "@interfaces/http/controllers/postImages.controller.js";
import { UserController } from "@interfaces/http/controllers/user.controllers.js";
import { LikeController } from "@interfaces/http/controllers/like.controller.js";
import { CommentController } from "@interfaces/http/controllers/comment.controller.js";
import { NotificationController } from "@interfaces/http/controllers/notification.controller.js";
import { FollowController } from "@interfaces/http/controllers/follow.controller.js";

// Events
import { eventBus } from "@config/eventBus.js";

export function createPostImageRepository(): PostImageRepository {
  return new PrismaPostImageRepository(getPrismaClient());
}

export function createStorageService(): StorageService {
  return new S3StorageService();
}

export function createImageProcessingService(): ImageProcessingService {
  return new SharpImageProcessingService();
}

export function getPrismaClient() {
  return prisma;
}

// Repositories Factory
export function createPostRepository(): PostRepository {
  return new PrismaPostRepository(getPrismaClient());
}

export function createLikeRepository(): LikeRepository {
  return new PrismaLikeRepository(getPrismaClient());
}

export function createUserRepository(): UserRepository {
  return new PrismaUserRepository(getPrismaClient());
}

export function createCommentRepository(): CommentRepository {
  return new PrismaCommentRepository(getPrismaClient());
}

export function createNotificationRepository(): NotificationRepository {
  return new PrismaNotificationRepository(getPrismaClient());
}

export function createFollowRepository(): FollowRepository {
  return new PrismaFollowRepository(getPrismaClient());
}

// Use Cases Factory
export function createCreatePostUseCase(): CreatePostUseCase {
  return new CreatePostUseCase(createPostRepository(), eventBus);
}

export function createGetPostsUseCase(): GetPostsUseCase {
  return new GetPostsUseCase(createPostRepository(), createLikeRepository());
}

export function createGetMyPostsUseCase(): GetMyPostsUseCase {
  return new GetMyPostsUseCase(createPostRepository(), createLikeRepository());
}

export function createDeletePostUseCase(): DeletePostUseCase {
  return new DeletePostUseCase(createPostRepository(), eventBus);
}

export function createUpdatePostUseCase(): UpdatePostUseCase {
  return new UpdatePostUseCase(createPostRepository());
}

export function createGetPostsByUserUseCase(): GetPostsByUserUseCase {
  return new GetPostsByUserUseCase(createPostRepository(), createLikeRepository());
}

export function createGetPostByIdUseCase(): GetPostByIdUseCase {
  return new GetPostByIdUseCase(createPostRepository(), createLikeRepository());
}

export function createGetPostLikesCountUseCase(): GetPostLikesCountUseCase {
  return new GetPostLikesCountUseCase(createLikeRepository());
}

// ─── Use Cases: User ───────────────────────────────────────────────────────

export function createRegisterUserUseCase(): RegisterUserUseCase {
  return new RegisterUserUseCase(createUserRepository());
}

export function createLoginUserUseCase(): LoginUserUseCase {
  return new LoginUserUseCase(createUserRepository());
}

export function createGetMyProfileUseCase(): GetMyProfileUseCase {
  return new GetMyProfileUseCase(createUserRepository());
}

export function createUpdateUserProfileUseCase(): UpdateUserProfileUseCase {
  return new UpdateUserProfileUseCase(createUserRepository());
}

export function createGetUserPublicProfileUseCase(): GetUserPublicProfileUseCase {
  return new GetUserPublicProfileUseCase(createUserRepository());
}

// ─── Use Cases: Like ───────────────────────────────────────────────────────

export function createLikePostUseCase(): LikePostUseCase {
  return new LikePostUseCase(createLikeRepository(), createPostRepository(), eventBus);
}

export function createUnlikePostUseCase(): UnlikePostUseCase {
  return new UnlikePostUseCase(createLikeRepository(), createPostRepository(), eventBus);
}

// ─── Use Cases: Comment ────────────────────────────────────────────────────

export function createCreateCommentUseCase(): CreateCommentUseCase {
  return new CreateCommentUseCase(createCommentRepository(), createPostRepository(), eventBus);
}

export function createUpdateCommentUseCase(): UpdateCommentUseCase {
  return new UpdateCommentUseCase(createCommentRepository());
}

export function createDeleteCommentUseCase(): DeleteCommentUseCase {
  return new DeleteCommentUseCase(createCommentRepository(), createPostRepository());
}

export function createGetPostCommentsUseCase(): GetPostCommentsUseCase {
  return new GetPostCommentsUseCase(createCommentRepository());
}

export function createGetCommentRepliesUseCase(): GetCommentRepliesUseCase {
  return new GetCommentRepliesUseCase(createCommentRepository());
}

// ─── Use Cases: Notification ───────────────────────────────────────────────

export function createGetNotificationsUseCase(): GetNotificationsUseCase {
  return new GetNotificationsUseCase(createNotificationRepository());
}

export function createGetUnreadCountUseCase(): GetUnreadCountUseCase {
  return new GetUnreadCountUseCase(createNotificationRepository());
}

export function createMarkAsReadUseCase(): MarkAsReadUseCase {
  return new MarkAsReadUseCase(createNotificationRepository());
}

export function createMarkAllAsReadUseCase(): MarkAllAsReadUseCase {
  return new MarkAllAsReadUseCase(createNotificationRepository());
}

// ─── Use Cases: Follow ──────────────────────────────────────────────────────

export function createFollowUserUseCase(): FollowUserUseCase {
  return new FollowUserUseCase(createFollowRepository());
}

export function createUnfollowUserUseCase(): UnfollowUserUseCase {
  return new UnfollowUserUseCase(createFollowRepository());
}

export function createGetFollowersUseCase(): GetFollowersUseCase {
  return new GetFollowersUseCase(createFollowRepository());
}

export function createGetFollowingUseCase(): GetFollowingUseCase {
  return new GetFollowingUseCase(createFollowRepository());
}

export function createGetFollowCountsUseCase(): GetFollowCountsUseCase {
  return new GetFollowCountsUseCase(createFollowRepository());
}

export function createIsFollowingUseCase(): IsFollowingUseCase {
  return new IsFollowingUseCase(createFollowRepository());
}

// Services Factory
export function createAIService(): AIService {
  return new GeminiAIService();
}

export function createNotificationService(): NotificationService {
  return new NotificationService(createNotificationRepository(), createCommentRepository());
}

// Controllers Factory
export function createPostController(): PostController {
  return new PostController(
    createCreatePostUseCase(),
    createGetPostsUseCase(),
    createGetMyPostsUseCase(),
    createDeletePostUseCase(),
    createUpdatePostUseCase(),
    createGetPostsByUserUseCase(),
    createGetPostByIdUseCase(),
    createGetUserPublicProfileUseCase()
  );
}

export function createPostImagesController(): PostImagesController {
  return new PostImagesController(
    createPresignUploadUseCase(),
    createConfirmUploadUseCase(),
    createDeletePostImageUseCase(),
    createReorderPostImagesUseCase(),
    createGetPostImagesUseCase()
  );
}

export function createUserController(): UserController {
  return new UserController(
    createRegisterUserUseCase(),
    createLoginUserUseCase(),
    createGetMyProfileUseCase(),
    createUpdateUserProfileUseCase(),
    createGetUserPublicProfileUseCase()
  );
}

export function createLikeController(): LikeController {
  return new LikeController(
    createLikePostUseCase(),
    createUnlikePostUseCase(),
    createGetPostLikesCountUseCase()
  );
}

export function createCommentController(): CommentController {
  return new CommentController(
    createCreateCommentUseCase(),
    createUpdateCommentUseCase(),
    createDeleteCommentUseCase(),
    createGetPostCommentsUseCase(),
    createGetCommentRepliesUseCase()
  );
}

export function createNotificationController(): NotificationController {
  return new NotificationController(
    createGetNotificationsUseCase(),
    createGetUnreadCountUseCase(),
    createMarkAsReadUseCase(),
    createMarkAllAsReadUseCase()
  );
}

export function createFollowController(): FollowController {
  return new FollowController(
    createFollowUserUseCase(),
    createUnfollowUserUseCase(),
    createGetFollowersUseCase(),
    createGetFollowingUseCase(),
    createGetFollowCountsUseCase(),
    createIsFollowingUseCase()
  );
}

// Clean shutdown
export async function shutdownContainer(): Promise<void> {
  const client = getPrismaClient();
  await client.$disconnect();
}


export function createPresignUploadUseCase(): PresignUploadUseCase {
  return new PresignUploadUseCase(createStorageService(), createUserRepository());
}

export function createConfirmUploadUseCase(): ConfirmUploadUseCase {
  return new ConfirmUploadUseCase(
    createStorageService(),
    createImageProcessingService(),
    createPostImageRepository()
  );
}

export function createDeletePostImageUseCase(): DeletePostImageUseCase {
  return new DeletePostImageUseCase(createPostImageRepository(), createPostRepository());
}

export function createReorderPostImagesUseCase(): ReorderPostImagesUseCase {
  return new ReorderPostImagesUseCase(createPostImageRepository(), createPostRepository());
}

export function createGetPostImagesUseCase(): GetPostImagesUseCase {
  return new GetPostImagesUseCase(createPostImageRepository());
}
