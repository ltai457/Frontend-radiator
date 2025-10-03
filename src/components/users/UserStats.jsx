// src/components/users/UserStats.jsx
import React from 'react';
import { Users, Shield, User, CheckCircle } from 'lucide-react';
import { StatsGrid } from '../common/layout/StatsGrid';

const UserStats = ({ users }) => {
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const adminUsers = users.filter(u => 
    u.role === 'Admin' || u.role === 1 || u.role === '1'
  ).length;
  const staffUsers = users.filter(u => 
    u.role === 'Staff' || u.role === 2 || u.role === '2'
  ).length;

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers.toString(),
      color: 'blue',
      icon: Users
    },
    {
      title: 'Active Users',
      value: activeUsers.toString(),
      color: 'green',
      icon: CheckCircle
    },
    {
      title: 'Administrators',
      value: adminUsers.toString(),
      color: 'purple',
      icon: Shield
    },
    {
      title: 'Staff Members',
      value: staffUsers.toString(),
      color: 'indigo',
      icon: User
    }
  ];

  return <StatsGrid stats={stats} columns={4} />;
};

export default UserStats;