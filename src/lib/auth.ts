import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import type { Adapter } from "next-auth/adapters";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// 簡化版帳號鎖定功能（內存存儲）
const failedAttempts: { [email: string]: { count: number; lastAttempt: number } } = {};
const LOCK_DURATION = 15 * 60 * 1000; // 15 分鐘
const MAX_ATTEMPTS = 5;

function isAccountLocked(email: string) {
  const attempt = failedAttempts[email];
  if (!attempt) return { locked: false };

  const now = Date.now();
  if (attempt.count >= MAX_ATTEMPTS && now - attempt.lastAttempt < LOCK_DURATION) {
    return {
      locked: true,
      remainingMs: LOCK_DURATION - (now - attempt.lastAttempt),
    };
  }
  return { locked: false };
}

function recordFailedAttempt(email: string) {
  const now = Date.now();
  if (!failedAttempts[email]) {
    failedAttempts[email] = { count: 1, lastAttempt: now };
  } else {
    failedAttempts[email].count++;
    failedAttempts[email].lastAttempt = now;
  }
  
  const remainingAttempts = MAX_ATTEMPTS - failedAttempts[email].count;
  return {
    locked: failedAttempts[email].count >= MAX_ATTEMPTS,
    remainingAttempts: Math.max(0, remainingAttempts),
  };
}

function clearFailedAttempts(email: string) {
  delete failedAttempts[email];
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
    CredentialsProvider({
      id: "email-password",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("請輸入電子郵件和密碼");
        }

        const email = credentials.email.toLowerCase().trim();

        // 檢查帳號是否被鎖定
        const lockStatus = isAccountLocked(email);
        if (lockStatus.locked) {
          const remainingMinutes = Math.ceil((lockStatus.remainingMs || 0) / 60000);
          throw new Error(`帳號已被暫時鎖定，請 ${remainingMinutes} 分鐘後再試`);
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: { accounts: true },
        });

        if (!user) {
          recordFailedAttempt(email);
          throw new Error("電子郵件或密碼錯誤");
        }

        // 檢查用戶是否有設定密碼
        if (!user.password) {
          const hasGoogleAccount = user.accounts.some(acc => acc.provider === "google");
          if (hasGoogleAccount) {
            throw new Error("此帳號是透過 Google 登入，請使用 Google 登入");
          }
          throw new Error("此帳號尚未設定密碼");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          const result = recordFailedAttempt(email);
          if (result.locked) {
            throw new Error("登入失敗次數過多，帳號已被暫時鎖定 15 分鐘");
          }
          throw new Error(`密碼錯誤，剩餘 ${result.remainingAttempts} 次嘗試機會`);
        }

        // 登入成功，清除失敗記錄
        clearFailedAttempts(email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 4 * 60 * 60, // 4 小時
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};