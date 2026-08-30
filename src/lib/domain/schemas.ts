import { z } from "zod";
import { componentTypes } from "./types";

export const savedNodeSchema = z.object({
  instanceId: z.string().min(1).max(100),
  componentId: z.string().min(1).max(100),
  position: z.object({ x: z.number().finite(), y: z.number().finite() }),
});
export const savedConnectionSchema = z.object({
  id: z.string().min(1).max(140),
  sourceNodeId: z.string().min(1).max(100),
  sourcePortId: z.string().min(1).max(100),
  targetNodeId: z.string().min(1).max(100),
  targetPortId: z.string().min(1).max(100),
});

export const savedBuildSchema = z.object({
  version: z.literal(1),
  name: z.string().min(1).max(120),
  nodes: z.array(savedNodeSchema).max(80),
  connections: z.array(savedConnectionSchema).max(160),
});

export type SavedBuild = z.infer<typeof savedBuildSchema>;

export const componentInputSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(2).max(160),
  componentType: z.enum(componentTypes),
  description: z.string().min(10).max(2000),
  officialWebsiteUrl: z.url().optional(),
  docsUrl: z.url().optional(),
  status: z.enum(["draft", "published", "deprecated"]),
});
