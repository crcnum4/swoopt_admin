import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Transaction, TransactionType, TransactionStatus, PayoutStatus } from '@/types/transaction';

interface UseTransactionsParams {
  type?: TransactionType | null;
  status?: TransactionStatus | null;
  payoutStatus?: PayoutStatus | null;
}

interface TransactionsResponse {
  transactions: Transaction[];
}

export function useTransactions({ type = null, status = null, payoutStatus = null }: UseTransactionsParams = {}) {
  return useInfiniteQuery({
    queryKey: ['transactions', 'list', type, status, payoutStatus],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set('limit', '20');
      if (type) params.set('type', type);
      if (status) params.set('status', status);
      if (payoutStatus) params.set('payoutStatus', payoutStatus);
      if (pageParam) params.set('cursor', pageParam);

      const { data, meta, error } = await api.getPaginated<TransactionsResponse>(
        `/admin/transactions?${params.toString()}`,
      );
      if (error || !data) throw new Error(error || 'Failed to fetch transactions');
      return { transactions: data.transactions, meta };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasMore ? lastPage.meta.cursor : undefined,
  });
}
