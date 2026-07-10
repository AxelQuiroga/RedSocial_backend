import type { FollowRepository } from "../../../domain/repositories/FollowRepository.js";

export class IsFollowingUseCase {
  constructor(
    private followRepository: FollowRepository
  ) {}

  async execute(followerId: string, followingId: string): Promise<boolean> {
    return this.followRepository.isFollowing(followerId, followingId);
  }
}
