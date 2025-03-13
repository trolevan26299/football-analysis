import { ReactNode } from "react";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
}

export type UserRole = "admin" | "editor" | "analyst" | "viewer";
export type UserStatus = "active" | "inactive" | "pending" | "blocked";

export interface UserProfileProps {
  user: User;
  onUpdate?: (user: User) => Promise<void>;
}

export interface UserListItem {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface UserTableProps {
  users: UserListItem[];
  loading: boolean;
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
  onStatusChange: (userId: string, status: UserStatus) => void;
}

export interface UserFormValues {
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
}

export interface RoleOption {
  value: UserRole;
  label: string;
  icon?: ReactNode;
  color?: string;
}

export interface StatusOption {
  value: UserStatus;
  label: string;
  icon?: ReactNode;
  color?: string;
}
