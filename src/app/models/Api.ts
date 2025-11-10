export type ListApi<T> = {
  list: T[];
  pagination: {
    total_pages: number;
    current_page: number;
    total_items: number;
    total_count: number;
  };
};
