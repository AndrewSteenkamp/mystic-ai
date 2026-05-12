import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export interface MysticUser {
  id: number;
  openId: string;
  email: string;
  name: string;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: MysticUser | null;
};

// Standalone mode — dummy user for local development
const DUMMY_USER: MysticUser = {
  id: 1,
  openId: "mystic-local-user",
  email: "seeker@mystic-ai.com",
  name: "Mystic Seeker",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  return {
    req: opts.req,
    res: opts.res,
    user: DUMMY_USER,
  };
}
