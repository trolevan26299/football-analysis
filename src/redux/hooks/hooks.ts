import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { shallowEqual } from 'react-redux';
import { useCallback } from 'react';
import type { RootState, AppDispatch } from '../store';

// Sử dụng trong suốt ứng dụng thay vì useDispatch và useSelector thông thường
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Selector thông thường
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Selector với shallowEqual để tránh re-render khi giá trị reference thay đổi nhưng giá trị thực tế không đổi
export const useAppShallowSelector: TypedUseSelectorHook<RootState> = (selector) => 
  useSelector(selector, shallowEqual);

// Hook để lấy dữ liệu từ selector và memoize kết quả
export function useMemoizedSelector<Selected>(
  selector: (state: RootState) => Selected,
  dependencies: unknown[] = []
): Selected {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedSelector = useCallback(selector, dependencies);
  return useAppSelector(memoizedSelector);
}

// Hook sử dụng cho các action phức tạp
export function useActionCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  dependencies: unknown[] = []
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, dependencies) as T;
} 