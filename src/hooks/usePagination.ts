import { useState } from 'react';

interface UsePaginationReturn<T> {
  items: T[];
  currentPage: number;
  loadingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
}

export const usePagination = <T>(
  fetchFunction: (page: number, limit: number) => Promise<T[]>,
  limit: number = 15
): UsePaginationReturn<T> => {
  const [items, setItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const newItems = await fetchFunction(nextPage, limit);

      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...newItems]);
        setCurrentPage(nextPage);
        if (newItems.length < limit) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Error loading more items:", err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  return {
    items,
    currentPage,
    loadingMore,
    hasMore,
    loadMore,
    setItems,
    setCurrentPage,
    setHasMore
  };
};
