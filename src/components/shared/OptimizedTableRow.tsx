import React, { useMemo } from 'react';
import { TableRow, TableCell, IconButton, Tooltip, SxProps, Theme } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

// Props chung cho tất cả các loại row
interface OptimizedRowProps<T> {
  item: T;                                     // Item data
  onEdit?: (id: string) => void;               // Edit handler
  onDelete?: (id: string) => void;             // Delete handler
  getItemId: (item: T) => string;              // Function to get item ID
  renderCells: (item: T) => React.ReactNode[]; // Function to render cells
  disableEdit?: boolean;                       // Disable edit button
  disableDelete?: boolean;                     // Disable delete button
  rowSx?: SxProps<Theme>;                      // Additional styles
  onClick?: (item: T) => void;                 // Row click handler
}

/**
 * Optimized table row component that prevents unnecessary re-renders
 * by using React.memo and useMemo for expensive operations
 */
function OptimizedTableRow<T>({
  item,
  onEdit,
  onDelete,
  getItemId,
  renderCells,
  disableEdit = false,
  disableDelete = false,
  rowSx,
  onClick
}: OptimizedRowProps<T>): React.ReactElement {
  // Lấy ID từ item
  const id = useMemo(() => getItemId(item), [item, getItemId]);
  
  // Tạo handler với useCallback
  const handleEdit = React.useCallback(() => {
    if (onEdit) onEdit(id);
  }, [id, onEdit]);
  
  const handleDelete = React.useCallback(() => {
    if (onDelete) onDelete(id);
  }, [id, onDelete]);
  
  const handleClick = React.useCallback(() => {
    if (onClick) onClick(item);
  }, [item, onClick]);
  
  // Render cells với useMemo
  const cells = useMemo(() => renderCells(item), [item, renderCells]);
  
  // Base styles for the row
  const baseStyles: SxProps<Theme> = {
    transition: "background-color 0.15s ease",
    "&:hover": {
      backgroundColor: (theme) =>
        theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.04)",
    },
    cursor: onClick ? 'pointer' : 'default'
  };
  
  return (
    <TableRow 
      sx={{ ...baseStyles, ...(rowSx || {}) }}
      onClick={onClick ? handleClick : undefined}
    >
      {cells.map((cell, index) => (
        <TableCell key={index}>{cell}</TableCell>
      ))}
      
      {(onEdit || onDelete) && (
        <TableCell align="right">
          {onEdit && !disableEdit && (
            <Tooltip title="Sửa">
              <IconButton onClick={handleEdit} size="small">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && !disableDelete && (
            <Tooltip title="Xóa">
              <IconButton color="error" onClick={handleDelete} size="small">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </TableCell>
      )}
    </TableRow>
  );
}

// Export with React.memo để tránh re-render không cần thiết
export default React.memo(OptimizedTableRow) as typeof OptimizedTableRow; 