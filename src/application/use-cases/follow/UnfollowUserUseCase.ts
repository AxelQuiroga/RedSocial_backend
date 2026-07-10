import type { FollowRepository } from "../../../domain/repositories/FollowRepository.js";
import type { UnfollowUserOutput } from "../../contracts/follow/FollowUserOutput.js";

export class UnfollowUserUseCase {
  constructor(
    private followRepository: FollowRepository
  ) {}

  async execute(followerId: string, followingId: string): Promise<UnfollowUserOutput> {
    if (followerId === followingId) {
      throw new Error("No puedes dejarte de seguir a ti mismo");
    }

    await this.followRepository.unfollow(followerId, followingId);

    return { success: true };
  }
}
