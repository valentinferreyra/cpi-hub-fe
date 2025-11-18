import { getSpacesByUpdatedAt, getSpacesByCreatedAt } from '../api';
import type { Space } from '../types/space';
import { usePagination } from './usePagination';

export const useUpdatedSpacesPagination = () => {
  return usePagination<Space>(getSpacesByUpdatedAt, 15);
};

export const useCreatedSpacesPagination = () => {
  return usePagination<Space>(getSpacesByCreatedAt, 15);
};
