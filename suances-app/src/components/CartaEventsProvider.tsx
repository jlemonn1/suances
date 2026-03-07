import React from 'react';
import { useCartaEvents } from '../hooks/useCartaEvents';

interface Props {
  children: React.ReactNode;
}

export const CartaEventsProvider: React.FC<Props> = ({ children }) => {
  useCartaEvents({
    enabled: true,
  });

  return <>{children}</>;
};
