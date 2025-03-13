"use client";
import { useState, useEffect } from "react";
import { Alert, AlertTitle, Snackbar, IconButton, Collapse, Box, Typography } from "@mui/material";
import {
  Close as CloseIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
} from "@mui/icons-material";

export type ErrorSeverity = "error" | "warning" | "info" | "success";

interface ErrorAlertProps {
  // Các props chính
  message: string;
  title?: string;
  severity?: ErrorSeverity;

  // Props cho kiểu hiển thị
  variant?: "simple" | "detailed" | "toast";

  // Props cho toast
  autoHideDuration?: number;
  position?: {
    vertical: "top" | "bottom";
    horizontal: "left" | "center" | "right";
  };

  // Props cho detailed
  details?: string | string[];

  // Callbacks
  onClose?: () => void;
  afterClose?: () => void;
}

const getIcon = (severity: ErrorSeverity) => {
  switch (severity) {
    case "error":
      return <ErrorIcon />;
    case "warning":
      return <WarningIcon />;
    case "info":
      return <InfoIcon />;
    case "success":
      return <SuccessIcon />;
    default:
      return <ErrorIcon />;
  }
};

export default function ErrorAlert({
  message,
  title,
  severity = "error",
  variant = "simple",
  autoHideDuration = 6000,
  position = { vertical: "top", horizontal: "right" },
  details,
  onClose,
  afterClose,
}: ErrorAlertProps) {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, [message]);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
    onClose?.();
  };

  const handleExited = () => {
    afterClose?.();
  };

  const renderDetails = () => {
    if (!details) return null;

    const detailItems = Array.isArray(details) ? details : [details];

    return (
      <Collapse in={expanded}>
        <Box sx={{ mt: 1 }}>
          {detailItems.map((detail, index) => (
            <Typography key={index} variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {detail}
            </Typography>
          ))}
        </Box>
      </Collapse>
    );
  };

  const alertContent = (
    <Alert
      severity={severity}
      icon={getIcon(severity)}
      action={
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {details && (
            <IconButton aria-label="show more" color="inherit" size="small" onClick={() => setExpanded(!expanded)}>
              {expanded ? <CloseIcon fontSize="inherit" /> : <InfoIcon fontSize="inherit" />}
            </IconButton>
          )}
          <IconButton aria-label="close" color="inherit" size="small" onClick={handleClose}>
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </Box>
      }
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
      {variant === "detailed" && renderDetails()}
    </Alert>
  );

  if (variant === "toast") {
    return (
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        anchorOrigin={position}
        TransitionProps={{ onExited: handleExited }}
      >
        {alertContent}
      </Snackbar>
    );
  }

  return open ? alertContent : null;
}

// Các helper functions để dễ sử dụng
export const SimpleError = (props: Omit<ErrorAlertProps, "variant">) => <ErrorAlert {...props} variant="simple" />;

export const DetailedError = (props: Omit<ErrorAlertProps, "variant">) => <ErrorAlert {...props} variant="detailed" />;

export const ToastError = (props: Omit<ErrorAlertProps, "variant">) => <ErrorAlert {...props} variant="toast" />;
