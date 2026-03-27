import type { PostRepository } from "../../../domain/repositories/PostRepository.js";
import type { PostWithAuthorDTO } from "../../dtos/PostWithAuthorDTO.js";

export class GetPostsUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(): Promise<PostWithAuthorDTO[]> {
    
    const posts = await this.postRepository.findAll();

    return posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,

      author: {
        id: post.author.id,
        username: post.author.username
      }
    }));
  }
}