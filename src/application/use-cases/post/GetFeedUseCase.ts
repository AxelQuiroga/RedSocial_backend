import type { PostRepository } from "../../../domain/repositories/PostRepository.js";
import type { FollowRepository } from "../../../domain/repositories/FollowRepository.js";
import type { LikeRepository } from "../../../domain/repositories/LikeRepository.js";
import type { PostWithAuthorOutput } from "../../contracts/post/PostWithAuthorOutput.js";

export class GetFeedUseCase {
  constructor(
    private postRepository: PostRepository,
    private followRepository: FollowRepository,
    private likeRepository: LikeRepository
  ) {}

  async execute(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ posts: PostWithAuthorOutput[]; total: number; fromFollowed: number }> {
    const followingIds = await this.followRepository.getFollowingIds(userId);

    let posts = await this.postRepository.findAll(page, limit);
    let total = posts.total;
    let fromFollowed = 0;

    if (followingIds.length > 0) {
      const followedResult = await this.postRepository.findByAuthorIds(followingIds, page, limit);
      fromFollowed = followedResult.posts.length;
      total = followedResult.total;

      if (followedResult.posts.length >= limit) {
        // Feed lleno solo con seguidos
        posts = followedResult;
      } else {
        // Rellenar con posts de no-seguidos
        const remaining = limit - followedResult.posts.length;
        const otherResult = await this.postRepository.findAllExcept(followingIds, 1, remaining);
        posts = {
          posts: [...followedResult.posts, ...otherResult.posts],
          total: followedResult.total + otherResult.total
        };
      }
    }

    // Enriquecer con likes en batch
    const postIds = posts.posts.map(p => p.id);
    const [likesCountMap, userLikedMap] = await Promise.all([
      this.likeRepository.countByPostIdsBatch(postIds),
      this.likeRepository.existsBatch(userId, postIds)
    ]);

    const postsWithLikes: PostWithAuthorOutput[] = posts.posts.map((post) => ({
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
      total,
      fromFollowed
    };
  }
}
