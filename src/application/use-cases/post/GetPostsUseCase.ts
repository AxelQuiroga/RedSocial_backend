import type { PostRepository } from "../../../domain/repositories/PostRepository.js";
import type { LikeRepository } from "../../../domain/repositories/LikeRepository.js";
import type { PostWithAuthorOutput } from "../../contracts/post/PostWithAuthorOutput.js";

export class GetPostsUseCase {
  constructor(
    private postRepository: PostRepository,
    private likeRepository: LikeRepository
  ) {}

  async execute(
    page: number,
    limit: number,
    userId?: string
  ): Promise<{ posts: PostWithAuthorOutput[]; total: number }> {
    const { posts, total } = await this.postRepository.findAll(page, limit);

    // Batch queries: 2 queries en vez de N*2
    const postIds = posts.map(p => p.id);

    const [likesCountMap, userLikedMap] = await Promise.all([
      this.likeRepository.countByPostIdsBatch(postIds),
      userId
        ? this.likeRepository.existsBatch(userId, postIds)
        : Promise.resolve(new Map<string, boolean>())
    ]);

    // Mapear resultados (sin async, sin queries)
    const postsWithLikes = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      author: {
        id: post.author.id,
        username: post.author.username
      },
      likesCount: likesCountMap.get(post.id) ?? 0,
      userHasLiked: userLikedMap.get(post.id) ?? false
    }));

    return {
      posts: postsWithLikes,
      total
    };
  }
}
