export interface FollowRepository {
  follow(followerId: string, followingId: string): Promise<void>;
  
  unfollow(followerId: string, followingId: string): Promise<void>;

  isFollowing(followerId: string, followingId: string): Promise<boolean>;

  isFollowingBatch(followerId: string, followingIds: string[]): Promise<Map<string, boolean>>;

  getFollowers(userId: string, page: number, limit: number): Promise<{
    followers: { id: string; username: string; displayName: string | null; avatarUrl: string | null }[];
    total: number;
  }>;

  getFollowing(userId: string, page: number, limit: number): Promise<{
    following: { id: string; username: string; displayName: string | null; avatarUrl: string | null }[];
    total: number;
  }>;

  getFollowersCount(userId: string): Promise<number>;

  getFollowingCount(userId: string): Promise<number>;

  getFollowingIds(userId: string): Promise<string[]>;
}
