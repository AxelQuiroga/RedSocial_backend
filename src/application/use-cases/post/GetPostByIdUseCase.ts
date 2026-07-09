import type { PostRepository } from "../../../domain/repositories/PostRepository.js";
import type { LikeRepository } from "../../../domain/repositories/LikeRepository.js";
import type { PostWithAuthor } from "../../../domain/entities/PostWithAuthor.js";
import type { PostWithAuthorOutput } from "../../contracts/post/PostWithAuthorOutput.js";

export class GetPostByIdUseCase {
  constructor(
    private postRepository: PostRepository,
    private likeRepository: LikeRepository
  ) {}

  async execute(postId: string, userId?: string): Promise<PostWithAuthorOutput> {
    const post = await this.postRepository.findById(postId) as PostWithAuthor | null;
    if (!post) {
      throw new Error("Post no encontrado");
    }

    const likesCount = await this.likeRepository.countByPostId(post.id);
    const userHasLiked = userId
      ? await this.likeRepository.exists(userId, post.id)
      : false;

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      author: {
        id: post.author.id,
        username: post.author.username,
      },
      likesCount,
      userHasLiked,
    };
  }
}
