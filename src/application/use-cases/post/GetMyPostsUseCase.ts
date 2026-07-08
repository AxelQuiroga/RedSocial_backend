import type { PostRepository } from "../../../domain/repositories/PostRepository.js";
import type { PostWithAuthorOutput } from "../../contracts/post/PostWithAuthorOutput.js";
import type { LikeRepository } from "../../../domain/repositories/LikeRepository.js";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError.js";

export class GetMyPostsUseCase {
  constructor(private postRepository: PostRepository,
    private likeRepository: LikeRepository
  ) {}

  async execute(userId: string): Promise<PostWithAuthorOutput[]> {
    
    if (!userId) {
      throw new UnauthorizedError("Usuario no autenticado");
    }

    const posts = await this.postRepository.findByAuthorId(userId);

    // Batch queries: 2 queries en vez de N*2
    const postIds = posts.map(p => p.id);

    const [likesCountMap, userLikedMap] = await Promise.all([
      this.likeRepository.countByPostIdsBatch(postIds),
      this.likeRepository.existsBatch(userId, postIds)
    ]);

    // Mapear resultados (sin async, sin queries)
    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      likesCount: likesCountMap.get(post.id) ?? 0,
      userHasLiked: userLikedMap.get(post.id) ?? false,
      author: {
        id: post.author.id,
        username: post.author.username
      }
    }));
  }
}
