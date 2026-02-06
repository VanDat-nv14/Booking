import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export default function useAuth() {
  const { user, loading, login, register, logout, forgotPassword, resetPassword, externalLogin, isAuthenticated, isAdmin } = useContext(AuthContext);

  return {
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    externalLogin,
    isAuthenticated,
    isAdmin
  };
}