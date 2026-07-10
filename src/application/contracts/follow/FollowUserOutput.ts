export interface FollowUserOutput {
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface UnfollowUserOutput {
  success: boolean;
}
