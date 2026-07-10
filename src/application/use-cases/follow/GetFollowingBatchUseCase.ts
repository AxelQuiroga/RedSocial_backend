import type { FollowRepository } from "../../../domain/repositories/FollowRepository.js";

export class GetFollowingBatchUseCase {
  constructor(
    private followRepository: FollowRepository
  ) {}

  async execute(followerId: string, targetUserIds: string[]): Promise<Map<string, boolean>> {
    return this.followRepository.isFollowingBatch(followerId, targetUserIds);
  }
}
