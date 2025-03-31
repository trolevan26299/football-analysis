import React, { useCallback } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { Box, CircularProgress, useTheme, useMediaQuery } from '@mui/material';

interface InfiniteScrollProps<T> {
  items: T[];               // Danh sách items hiện tại
  hasNextPage: boolean;     // Còn trang tiếp theo không
  isNextPageLoading: boolean; // Đang load trang tiếp theo
  loadNextPage: () => void; // Callback để load trang tiếp theo
  height?: number;          // Chiều cao của danh sách
  width?: number | string;   // Chiều rộng của danh sách
  itemHeight?: number;      // Chiều cao của mỗi item
  renderItem: ({ item, index, style }: { 
    item: T; 
    index: number; 
    style: React.CSSProperties 
  }) => React.ReactNode; // Render function cho mỗi item
}

// Interface cho InfiniteLoader props
interface InfiniteLoaderProps {
  onItemsRendered: (props: {
    overscanStartIndex: number;
    overscanStopIndex: number;
    visibleStartIndex: number;
    visibleStopIndex: number;
  }) => void;
  ref: React.Ref<List>;
}

/**
 * Component hỗ trợ infinite scrolling với virtualization
 * Tối ưu hiệu suất bằng cách chỉ render các items hiện đang hiển thị
 */
function InfiniteScrollComponent<T>({
  items,
  hasNextPage,
  isNextPageLoading,
  loadNextPage,
  height = 400,
  width = '100%',
  itemHeight = 60,
  renderItem
}: InfiniteScrollProps<T>): React.ReactElement {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Tính toán tổng số items bao gồm cả items đang loading
  const itemCount = hasNextPage ? items.length + 1 : items.length;
  
  // Kiểm tra item đã load hay chưa
  const isItemLoaded = useCallback((index: number) => {
    return !hasNextPage || index < items.length;
  }, [hasNextPage, items.length]);
  
  // Xử lý khi cần load thêm items
  const loadMoreItems = useCallback(() => {
    if (!isNextPageLoading) {
      loadNextPage();
    }
    return Promise.resolve();
  }, [isNextPageLoading, loadNextPage]);

  // Render từng item
  const itemRenderer = useCallback(({ index, style }: ListChildComponentProps) => {
    // Nếu item chưa load, hiển thị loading
    if (!isItemLoaded(index)) {
      return (
        <Box
          style={style}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress size={24} />
        </Box>
      );
    }

    // Nếu đã load, render item thật
    return renderItem({ item: items[index], index, style });
  }, [isItemLoaded, items, renderItem]);

  // Điều chỉnh chiều cao và chiều rộng dựa trên kích thước màn hình
  const responsiveHeight = isMobile ? 300 : height;
  const responsiveWidth = isMobile ? '100%' : width;

  return (
    <Box sx={{ height: responsiveHeight, width: responsiveWidth }}>
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={loadMoreItems}
        threshold={5} // Load thêm khi còn 5 items
      >
        {({ onItemsRendered, ref }: InfiniteLoaderProps) => (
          <List
            height={responsiveHeight}
            width={responsiveWidth}
            itemCount={itemCount}
            itemSize={itemHeight}
            onItemsRendered={onItemsRendered}
            ref={ref}
          >
            {itemRenderer}
          </List>
        )}
      </InfiniteLoader>
    </Box>
  );
}

export default React.memo(InfiniteScrollComponent) as typeof InfiniteScrollComponent; 