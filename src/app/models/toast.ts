export type Toast = {
  iconClass?: string;
  title: string;
  message?: string;
  duration?: number;
  id: number;
  type: 'info' | 'success' | 'error';
};
