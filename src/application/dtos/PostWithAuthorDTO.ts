export interface PostWithAuthorDTO {
  id: string;
  title: string;
  content: string;
  createdAt: Date;

  author: {
    id: string;
    username: string;
  };
}