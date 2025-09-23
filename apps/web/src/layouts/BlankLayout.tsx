import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSWUpdate } from './hooks';

const Layout: React.FC = () => {
    // ---------- SW update confirm ----------
    useSWUpdate();

    return (
        <div className="ms-layout">
            <Outlet />
        </div>
    );
};

export default Layout;
