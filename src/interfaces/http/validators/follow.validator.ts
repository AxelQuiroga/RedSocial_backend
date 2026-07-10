import { z } from "zod";
import { paginationQuery } from "./common.js";

export const followUserSchema = {
  params: z.object({
    userId: z.string().min(1)
  })
};

export const unfollowUserSchema = {
  params: z.object({
    userId: z.string().min(1)
  })
};

export const getFollowersSchema = {
  params: z.object({
    userId: z.string().min(1)
  }),
  query: paginationQuery
};

export const getFollowingSchema = {
  params: z.object({
    userId: z.string().min(1)
  }),
  query: paginationQuery
};

export const getFollowCountsSchema = {
  params: z.object({
    userId: z.string().min(1)
  })
};

export const followStatusSchema = {
  params: z.object({
    userId: z.string().min(1)
  })
};

export const followStatusBatchSchema = {
  body: z.object({
    userIds: z.array(z.string().min(1)).min(1).max(100)
  }).strict()
};
