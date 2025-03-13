"use client";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from "@mui/material";
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
} from "@mui/icons-material";
import { ConfirmDialogProps } from "@/types/ui";

const iconMap = {
  error: <ErrorIcon color="error" sx={{ fontSize: 40 }} />,
  warning: <WarningIcon color="warning" sx={{ fontSize: 40 }} />,
  info: <InfoIcon color="info" sx={{ fontSize: 40 }} />,
  success: <SuccessIcon color="success" sx={{ fontSize: 40 }} />,
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
  severity = "warning",
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderTop: (theme) => `4px solid ${theme.palette[severity].main}`,
          borderRadius: 1,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>{title}</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {iconMap[severity]}
          <Typography variant="body1">{message}</Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onCancel} sx={{ minWidth: 100 }}>
          {cancelText}
        </Button>
        <Button variant="contained" onClick={onConfirm} color={severity} sx={{ minWidth: 100 }}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
