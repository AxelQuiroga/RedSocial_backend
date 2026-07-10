import type { FollowRepository } from "../../../domain/repositories/FollowRepository.js";
import type { FollowUserListOutput } from "../../contracts/follow/FollowUserListOutput.js";

export class GetFollowingUseCase {
  constructor(
    private followRepository: FollowRepository
  ) {}

  async execute(userId: string, page: number, limit: number): Promise<FollowUserListOutput> {
    const { following, total } = await this.followRepository.getFollowing(userId, page, limit);

    return {
      data: following,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
