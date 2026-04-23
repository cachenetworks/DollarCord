import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(32, "Username must be at most 32 characters")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Username can only contain letters, numbers, underscores, dots, and hyphens"),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(64, "Display name must be at most 64 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(64).optional(),
  bio: z.string().max(256, "Bio must be at most 256 characters").nullable().optional(),
  avatarUrl: z.string().url("Invalid URL").nullable().optional(),
});

export const createServerSchema = z.object({
  name: z
    .string()
    .min(1, "Server name is required")
    .max(100, "Server name must be at most 100 characters"),
  description: z.string().max(500).nullable().optional(),
  iconUrl: z.string().url().nullable().optional(),
});

export const updateServerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  iconUrl: z.string().url().nullable().optional(),
});

export const joinServerSchema = z.object({
  code: z.string().min(1, "Invite code is required"),
});

export const createChannelSchema = z.object({
  name: z
    .string()
    .min(1, "Channel name is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Channel name can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(256).nullable().optional(),
});

export const updateChannelSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().max(256).nullable().optional(),
});

export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(4000, "Message is too long"),
  replyToId: z.string().nullable().optional(),
});

export const editMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(4000, "Message is too long"),
});

export const createInviteSchema = z.object({
  maxUses: z.number().int().positive().nullable().optional(),
  expiresInHours: z.number().int().positive().nullable().optional(),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]),
});
