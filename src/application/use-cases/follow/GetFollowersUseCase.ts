import type { FollowRepository } from "../../../domain/repositories/FollowRepository.js";
import type { FollowUserListOutput } from "../../contracts/follow/FollowUserListOutput.js";

export class GetFollowersUseCase {
  constructor(
    private followRepository: FollowRepository
  ) {}

  async execute(userId: string, page: number, limit: number): Promise<FollowUserListOutput> {
    const { followers, total } = await this.followRepository.getFollowers(userId, page, limit);

    return {
      data: followers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
