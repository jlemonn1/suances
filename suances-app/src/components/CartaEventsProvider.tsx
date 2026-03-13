import React from 'react';
import { useCartaSSE } from '../hooks/useCartaSSE';

interface Props {
  children: React.ReactNode;
}

export const CartaEventsProvider: React.FC<Props> = ({ children }) => {
  useCartaSSE({
    enabled: true,
  });

  return <>{children}</>;
};
