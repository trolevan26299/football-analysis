import { ReactNode } from "react";

export interface Theme {
  mode: "light" | "dark";
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  errorColor: string;
  warningColor: string;
  successColor: string;
  infoColor: string;
}

export interface ButtonProps {
  children: ReactNode;
  variant?: "contained" | "outlined" | "text";
  color?: "primary" | "secondary" | "success" | "error" | "warning" | "info";
  size?: "small" | "medium" | "large";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export interface CardProps {
  children: ReactNode;
  title?: string | ReactNode;
  subtitle?: string;
  headerAction?: ReactNode;
  elevation?: number;
  variant?: "outlined" | "elevation";
  className?: string;
  onClick?: () => void;
  fullHeight?: boolean;
}

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: ReactNode;
  actions?: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
}

export interface AlertProps {
  severity: "error" | "warning" | "info" | "success";
  message: string;
  onClose?: () => void;
  action?: ReactNode;
  variant?: "standard" | "filled" | "outlined";
}

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  severity?: "error" | "warning" | "info" | "success";
}

export interface LoadingProps {
  size?: "small" | "medium" | "large";
  color?: "primary" | "secondary" | "success" | "error" | "warning" | "info";
  variant?: "circular" | "linear" | "dots";
  message?: string;
  fullPage?: boolean;
}

export interface MenuItemProps {
  label: string;
  icon?: ReactNode;
  path?: string;
  onClick?: () => void;
  isActive?: boolean;
  children?: MenuItemProps[];
  expandable?: boolean;
  expanded?: boolean;
  disabled?: boolean;
}
