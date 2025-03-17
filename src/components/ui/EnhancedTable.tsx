/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  IconButton,
  TextField,
  Toolbar,
  Typography,
  alpha,
  Tooltip,
  LinearProgress,
  useTheme,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Alert,
  Stack,
  Divider,
} from "@mui/material";
import {
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { TableColumn, PaginationOptions, FilterOption } from "@/types/dashboard";

type Order = "asc" | "desc";

interface EnhancedTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  initialOrderBy?: string;
  initialOrder?: Order;
  rowKey: keyof T | ((row: T) => string);
  loading?: boolean;
  pagination?: PaginationOptions;
  error?: string;
  searchPlaceholder?: string;
  searchFields?: string[];
  filters?: {
    [key: string]: {
      label: string;
      options: FilterOption[];
    };
  };
  selectable?: boolean;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  refreshData?: () => void;
  actionButtons?: React.ReactNode;
  emptyStateMessage?: string;
  hideToolbar?: boolean;
}

export default function EnhancedTable<T>({
  columns,
  data,
  initialOrderBy = "",
  initialOrder = "asc",
  rowKey,
  loading = false,
  pagination,
  error,
  searchPlaceholder = "Tìm kiếm...",
  searchFields = [],
  filters,
  selectable = false,
  onRowClick,
  onSelectionChange,
  refreshData,
  actionButtons,
  emptyStateMessage = "Không có dữ liệu",
  hideToolbar = false,
}: EnhancedTableProps<T>) {
  const theme = useTheme();
  const [order, setOrder] = useState<Order>(initialOrder);
  const [orderBy, setOrderBy] = useState<string>(initialOrderBy);
  const [selected, setSelected] = useState<T[]>([]);
  const [page, setPage] = useState(pagination?.page || 0);
  const [rowsPerPage, setRowsPerPage] = useState(pagination?.pageSize || 10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState<{ [key: string]: string }>({});
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Handle search and filter
  const filteredData = React.useMemo(() => {
    let filtered = [...data];

    // Apply search term if provided
    if (searchTerm && searchFields.length > 0) {
      const lowercasedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((row) => {
        return searchFields.some((field) => {
          const value = getNestedValue(row, field);
          return value && String(value).toLowerCase().includes(lowercasedSearch);
        });
      });
    }

    // Apply filters if provided
    if (filters && Object.keys(filterValues).length > 0) {
      filtered = filtered.filter((row) => {
        return Object.entries(filterValues).every(([key, value]) => {
          if (!value) return true;
          const rowValue = getNestedValue(row, key);
          return rowValue === value || String(rowValue) === value;
        });
      });
    }

    return filtered;
  }, [data, searchTerm, filterValues, searchFields]);

  // Handle sorting
  const sortedData = React.useMemo(() => {
    if (!orderBy) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, orderBy);
      const bValue = getNestedValue(b, orderBy);

      if (aValue === null || aValue === undefined) return order === "asc" ? -1 : 1;
      if (bValue === null || bValue === undefined) return order === "asc" ? 1 : -1;

      if (aValue < bValue) return order === "asc" ? -1 : 1;
      if (aValue > bValue) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, order, orderBy]);

  // Handle pagination
  const displayData = React.useMemo(() => {
    if (!pagination) return sortedData;
    const startIndex = page * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, page, rowsPerPage, pagination]);

  // Reset page when data or filtering changes
  useEffect(() => {
    setPage(0);
  }, [searchTerm, JSON.stringify(filterValues)]);

  // Update external pagination state if controlled
  useEffect(() => {
    if (pagination?.onPageChange && page !== pagination.page) {
      pagination.onPageChange(page);
    }
  }, [page, pagination]);

  useEffect(() => {
    if (pagination?.onPageSizeChange && rowsPerPage !== pagination.pageSize) {
      pagination.onPageSizeChange(rowsPerPage);
    }
  }, [rowsPerPage, pagination]);

  // Update selection change callback
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selected);
    }
  }, [selected, onSelectionChange]);

  // Helper to get nested values using dot notation (e.g. "user.name")
  function getNestedValue(obj: unknown, path: string): unknown {
    if (!obj || typeof obj !== "object") return null;

    return path.split(".").reduce<unknown>((o, key) => {
      if (o && typeof o === "object" && key in o) {
        return (o as Record<string, unknown>)[key];
      }
      return null;
    }, obj);
  }

  // Get row key for unique identification
  const getRowId = (row: T): string => {
    if (typeof rowKey === "function") {
      return rowKey(row);
    }
    const key = row[rowKey];
    return key != null ? String(key) : "";
  };

  // Sort handling
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Selection handling
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(displayData);
    } else {
      setSelected([]);
    }
  };

  const handleClick = (row: T) => {
    if (onRowClick) {
      onRowClick(row);
      return;
    }

    if (!selectable) return;

    const rowId = getRowId(row);
    const selectedIndex = selected.findIndex((r) => getRowId(r) === rowId);
    let newSelected: T[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, row];
    } else {
      newSelected = selected.filter((_, i) => i !== selectedIndex);
    }

    setSelected(newSelected);
  };

  const isSelected = (row: T) => selected.some((r) => getRowId(r) === getRowId(row));

  // Pagination handling
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Search handling
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // Filter handling
  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilterValues({});
    setSearchTerm("");
  };

  // Empty row to display when no data
  const emptyRows = rowsPerPage - displayData.length;

  return (
    <Box
      sx={{
        width: "100%",
        animation: "fadeIn 0.5s ease-in-out",
        "@keyframes fadeIn": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      }}
    >
      {/* Error alert */}
      <Collapse in={Boolean(error)}>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            refreshData && (
              <IconButton aria-label="retry" color="inherit" size="small" onClick={refreshData}>
                <RefreshIcon fontSize="inherit" />
              </IconButton>
            )
          }
        >
          {error}
        </Alert>
      </Collapse>

      {/* Table toolbar */}
      {!hideToolbar && (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            ...(selected.length > 0 && {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            }),
            borderTopLeftRadius: theme.shape.borderRadius,
            borderTopRightRadius: theme.shape.borderRadius,
          }}
        >
          {selected.length > 0 ? (
            <Typography sx={{ flex: "1 1 100%" }} color="inherit" variant="subtitle1" component="div">
              Đã chọn {selected.length} mục
            </Typography>
          ) : (
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: "1 1 100%" }}>
              {/* Search field */}
              {searchFields.length > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", maxWidth: 300 }}>
                  <TextField
                    size="small"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder={searchPlaceholder}
                    InputProps={{
                      startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />,
                      endAdornment: searchTerm ? (
                        <IconButton size="small" onClick={handleClearSearch}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      ) : null,
                    }}
                    sx={{
                      transition: "width 0.2s",
                      width: "100%",
                    }}
                  />
                </Box>
              )}

              {/* Custom action buttons */}
              {actionButtons}
            </Stack>
          )}

          {/* Filter button */}
          {filters && Object.keys(filters).length > 0 && (
            <Tooltip title="Bộ lọc">
              <IconButton
                onClick={() => setFiltersOpen(!filtersOpen)}
                color={Object.keys(filterValues).some((k) => filterValues[k]) ? "primary" : "default"}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Refresh button */}
          {refreshData && (
            <Tooltip title="Làm mới">
              <IconButton onClick={refreshData}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      )}

      {/* Filters */}
      <Collapse in={filtersOpen && filters && Object.keys(filters).length > 0}>
        <Box
          sx={{
            p: 2,
            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.7),
          }}
        >
          <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
            {filters &&
              Object.entries(filters).map(([key, filter]) => (
                <FormControl key={key} variant="outlined" size="small" sx={{ minWidth: 150, mb: 1 }}>
                  <InputLabel id={`filter-${key}-label`}>{filter.label}</InputLabel>
                  <Select
                    labelId={`filter-${key}-label`}
                    id={`filter-${key}`}
                    value={filterValues[key] || ""}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    label={filter.label}
                  >
                    <MenuItem value="">
                      <em>Tất cả</em>
                    </MenuItem>
                    {filter.options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}

            <Tooltip title="Xóa tất cả">
              <IconButton onClick={handleResetFilters} size="small">
                <ClearIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
        <Divider />
      </Collapse>

      <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: theme.shape.borderRadius }}>
        {/* Loading indicator */}
        {loading && (
          <Box sx={{ width: "100%", height: 4 }}>
            <LinearProgress />
          </Box>
        )}

        {/* Table */}
        <TableContainer>
          <Table aria-labelledby="tableTitle" size="medium">
            <TableHead>
              <TableRow>
                {selectable && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={selected.length > 0 && selected.length < displayData.length}
                      checked={displayData.length > 0 && selected.length === displayData.length}
                      onChange={handleSelectAllClick}
                      inputProps={{ "aria-label": "select all" }}
                    />
                  </TableCell>
                )}

                {columns.map((column) => (
                  <TableCell
                    key={String(column.id)}
                    align={column.align || "left"}
                    style={{
                      minWidth: column.minWidth,
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                    sortDirection={orderBy === column.id ? order : false}
                  >
                    {column.sortable !== false ? (
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : "asc"}
                        onClick={() => handleRequestSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading && displayData.length === 0 ? (
                // Loading skeleton rows
                Array.from(new Array(3)).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {selectable && <TableCell padding="checkbox"></TableCell>}
                    {columns.map((column, colIndex) => (
                      <TableCell key={`skeleton-cell-${colIndex}`}>
                        <Box
                          sx={{
                            height: 16,
                            borderRadius: 0.5,
                            width: column.minWidth || "100%",
                            maxWidth: "100%",
                            backgroundColor: (theme) => alpha(theme.palette.text.disabled, 0.1),
                            animation: "pulse 1.5s infinite ease-in-out",
                            "@keyframes pulse": {
                              "0%": {
                                opacity: 0.6,
                              },
                              "50%": {
                                opacity: 0.3,
                              },
                              "100%": {
                                opacity: 0.6,
                              },
                            },
                          }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : displayData.length > 0 ? (
                // Data rows
                displayData.map((row, index) => {
                  const isItemSelected = isSelected(row);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <Fade key={getRowId(row)} in timeout={(index % rowsPerPage) * 50}>
                      <TableRow
                        hover
                        onClick={() => handleClick(row)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        selected={isItemSelected}
                        sx={{ cursor: onRowClick || selectable ? "pointer" : "default" }}
                      >
                        {selectable && (
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                              inputProps={{ "aria-labelledby": labelId }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                        )}

                        {columns.map((column) => {
                          const value = getNestedValue(row, column.id);
                          return (
                            <TableCell key={`${getRowId(row)}-${column.id}`} align={column.align}>
                              {column.renderCell
                                ? column.renderCell(row)
                                : column.format
                                ? column.format(value)
                                : value !== null && value !== undefined
                                ? String(value)
                                : ""}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </Fade>
                  );
                })
              ) : (
                // Empty state
                <TableRow>
                  <TableCell colSpan={columns.length + (selectable ? 1 : 0)} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary">
                      {emptyStateMessage}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {/* Empty rows to maintain height */}
              {pagination && emptyRows > 0 && !loading && displayData.length > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={columns.length + (selectable ? 1 : 0)} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {pagination && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={pagination.totalItems || sortedData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} của ${count !== -1 ? count : `nhiều hơn ${to}`}`
            }
          />
        )}
      </Paper>
    </Box>
  );
}
