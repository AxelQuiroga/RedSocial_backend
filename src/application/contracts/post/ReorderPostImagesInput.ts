export interface ReorderPostImagesInput {
  postId: string;
  images: { 
    imageId: string; 
    order: number; 
  }[];
}