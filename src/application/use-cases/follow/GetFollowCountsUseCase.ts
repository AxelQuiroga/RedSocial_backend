import type { FollowRepository } from "../../../domain/repositories/FollowRepository.js";
import type { FollowCountsOutput } from "../../contracts/follow/FollowCountsOutput.js";

export class GetFollowCountsUseCase {
  constructor(
    private followRepository: FollowRepository
  ) {}

  async execute(userId: string): Promise<FollowCountsOutput> {
    const [followersCount, followingCount] = await Promise.all([
      this.followRepository.getFollowersCount(userId),
      this.followRepository.getFollowingCount(userId)
    ]);

    return { followersCount, followingCount };
  }
}
