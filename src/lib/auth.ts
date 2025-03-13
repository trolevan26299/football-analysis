/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "./mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

// Định nghĩa các types
export type UserRole = "admin" | "ktv";

export interface UserSession {
  id: string;
  username: string;
  role: UserRole;
}

declare module "next-auth" {
  interface Session {
    user: UserSession;
  }
  interface User extends UserSession {}
}

declare module "next-auth/jwt" {
  interface JWT extends UserSession {}
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await connectDB();

          const user = await User.findOne({ username: credentials?.username });

          if (!user) {
            throw new Error("Tài khoản không tồn tại");
          }

          const isPasswordValid = await bcrypt.compare(credentials?.password || "", user.password);

          if (!isPasswordValid) {
            throw new Error("Mật khẩu không chính xác");
          }

          return {
            id: user._id.toString(),
            username: user.username,
            role: user.role as UserRole,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        username: token.username,
        role: token.role,
      };
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/unauthorized",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper function để lấy session ở server side
export const getServerAuthSession = () => getServerSession(authOptions);

// Helper functions để kiểm tra quyền
export const isAdmin = (session: any) => session?.user?.role === "admin";
export const isKTV = (session: any) => session?.user?.role === "ktv";

// Helper function để hash password
export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Helper function để verify password
export const verifyPassword = async (password: string, hashedPassword: string) => {
  return bcrypt.compare(password, hashedPassword);
};

// Custom hook để kiểm tra và redirect nếu không có quyền
export const checkUserRole = async (session: any, allowedRoles: UserRole[]): Promise<boolean> => {
  if (!session || !session.user) {
    return false;
  }

  const userRole = session.user.role;
  return allowedRoles.includes(userRole);
};

// Helper function để tạo user mới
export const createUser = async (username: string, password: string, role: UserRole = "ktv") => {
  try {
    await connectDB();

    // Kiểm tra user đã tồn tại
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new Error("Username đã tồn tại");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Tạo user mới
    const newUser = await User.create({
      username,
      password: hashedPassword,
      role,
    });

    return {
      id: newUser._id.toString(),
      username: newUser.username,
      role: newUser.role,
    };
  } catch (error) {
    console.error("Create user error:", error);
    throw error;
  }
};

// Helper function để update user
export const updateUser = async (
  userId: string,
  updateData: {
    username?: string;
    password?: string;
    role?: UserRole;
  }
) => {
  try {
    await connectDB();

    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true });

    if (!updatedUser) {
      throw new Error("User không tồn tại");
    }

    return {
      id: updatedUser._id.toString(),
      username: updatedUser.username,
      role: updatedUser.role,
    };
  } catch (error) {
    console.error("Update user error:", error);
    throw error;
  }
};
