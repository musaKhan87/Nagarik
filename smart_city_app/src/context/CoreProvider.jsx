import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ComplaintProvider } from '../context/ComplaintContext';

export function CoreProvider({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ComplaintProvider>
      {children}
    </ComplaintProvider>
  );
}
