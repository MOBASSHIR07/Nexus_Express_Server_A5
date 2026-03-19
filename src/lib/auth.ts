import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";

export const auth = betterAuth({
     baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

trustedOrigins: [
  process.env.TRUSTED_AUTH_URL!,
  "http://localhost:5000",
  "http://localhost:3000",
],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const data = user as any;
          if (data.role === "ADMIN") {
            throw new Error("UNAUTHORIZED_ROLE_REGISTRATION");
          }
        },
      },
    },

    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
          });
          if (user?.status === "BANNED") {
            throw new Error("ACCOUNT_BANNED");
          }
        },
      },
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false,
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "ACTIVE",
        input: false,
      },
    },
  },
});