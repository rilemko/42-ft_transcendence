import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { UserContext } from '../contexts/UserContext';

import Loading from '../pages/Loading';

const PublicRoute = () => {
    const { isLogged, isLoading } = useContext(UserContext);

    if (isLoading) {
        return <Loading />;
    }

    return isLogged
        ? <Navigate to="/home" />
        : <Outlet />;
};

export default PublicRoute;
