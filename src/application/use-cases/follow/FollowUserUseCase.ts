import type { FollowRepository } from "../../../domain/repositories/FollowRepository.js";
import type { FollowUserOutput } from "../../contracts/follow/FollowUserOutput.js";

export class FollowUserUseCase {
  constructor(
    private followRepository: FollowRepository
  ) {}

  async execute(followerId: string, followingId: string): Promise<FollowUserOutput> {
    if (followerId === followingId) {
      throw new Error("No puedes seguirte a ti mismo");
    }

    const alreadyFollowing = await this.followRepository.isFollowing(followerId, followingId);
    if (alreadyFollowing) {
      throw new Error("Ya sigues a este usuario");
    }

    await this.followRepository.follow(followerId, followingId);

    return {
      followerId,
      followingId,
      createdAt: new Date()
    };
  }
}
