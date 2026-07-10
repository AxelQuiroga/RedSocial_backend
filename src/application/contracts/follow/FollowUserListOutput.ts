export interface FollowUserItem {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface FollowUserListOutput {
  data: FollowUserItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
