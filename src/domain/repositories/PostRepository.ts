import type { Post } from "../entities/Post.js";
import type { PostWithAuthor } from "../entities/PostWithAuthor.js";

export interface PostRepository {
  create(data: {
    title: string;
    content: string;
    authorId: string;
  }): Promise<Post>;

  findAll(): Promise<PostWithAuthor[]>;
}