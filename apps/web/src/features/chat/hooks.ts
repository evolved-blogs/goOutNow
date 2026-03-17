import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../../lib/api-config';
import { fetchGlobalMessages, sendGlobalMessage } from './api';
import type { GlobalMessage } from './types';

export const chatKeys = {
  all: ['global-chat'] as const,
};

export function useGlobalMessages() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: chatKeys.all,
    queryFn: fetchGlobalMessages,
  });

  useEffect(() => {
    const es = new EventSource(API_ENDPOINTS.chat.stream);

    es.onmessage = (event: MessageEvent) => {
      const msg: GlobalMessage = JSON.parse(event.data as string);
      queryClient.setQueryData<GlobalMessage[]>(chatKeys.all, (prev) =>
        prev ? [...prev, msg] : [msg],
      );
    };

    return () => es.close();
  }, [queryClient]);

  return query;
}

export function useSendGlobalMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, text }: { userId: string; text: string }) =>
      sendGlobalMessage(userId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}
