import { z } from 'zod';

export const FollowCreatedEventSchema = z.object({
  type: z.literal('FOLLOW_CREATED'),
  followerId: z.string().uuid(),
  followingId: z.string().uuid()
});

export type FollowCreatedEvent = z.infer<typeof FollowCreatedEventSchema>;
