import type { PostWithAuthorResponse } from "./PostWithAuthorResponse.js";

export interface GetPostsResponse {
  data: PostWithAuthorResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}