// src/hooks/useUsers.js
import { useState, useEffect } from 'react';
import userService from '../api/userService';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const result = await userService.getAllUsers();
    if (result.success) {
      setUsers(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (userData) => {
    const result = await userService.createUser(userData);
    if (result.success) {
      await fetchUsers();
    }
    return result;
  };

  const updateUser = async (userId, userData) => {
    const result = await userService.updateUser(userId, userData);
    if (result.success) {
      await fetchUsers();
    }
    return result;
  };

  const deleteUser = async (userId) => {
    const result = await userService.deleteUser(userId);
    if (result.success) {
      await fetchUsers();
    }
    return result;
  };

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers
  };
};