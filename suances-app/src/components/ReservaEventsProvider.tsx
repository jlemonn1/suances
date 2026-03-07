import React from 'react';
import { useReservaEvents } from '../hooks/useReservaEvents';

interface Props {
  children: React.ReactNode;
}

export const ReservaEventsProvider: React.FC<Props> = ({ children }) => {
  useReservaEvents({
    enabled: true,
  });

  return <>{children}</>;
};
