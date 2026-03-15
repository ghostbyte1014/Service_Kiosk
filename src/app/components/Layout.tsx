import React from 'react';
import { Outlet } from 'react-router';
import { DevNavigation } from './DevNavigation';

export const Layout: React.FC = () => {
  return (
    <>
      <Outlet />
      <DevNavigation />
    </>
  );
};
