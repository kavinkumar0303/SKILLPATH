import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from './LoadingSkeleton';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7E8] p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <LoadingSkeleton rows={5} />
        </div>
      </div>
    );
  }

  // If no session exists, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
