import type { PostRepository } from "../../../domain/repositories/PostRepository.js";
import type { PostWithAuthorOutput } from "../../contracts/post/PostWithAuthorOutput.js";

export class GetPostsUseCase {
  constructor(private postRepository: PostRepository) {}
  
  async execute(
    page: number,
    limit: number
  ): Promise<{ posts: PostWithAuthorOutput[]; total: number }> {
    const { posts, total } = await this.postRepository.findAll(page, limit);

    return {
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        author: {
          id: post.author.id,
          username: post.author.username
        }
      })),
      total
    };
  }
}
