import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { UserContext } from '../contexts/UserContext';

import Loading from '../pages/Loading';

const PrivateRoute = () => {
    const { isLogged, isLoading } = useContext(UserContext);

    if (isLoading) {
        return <Loading />;
    }

    return isLogged
        ? <Outlet />
        : <Navigate to="/" />;
};

export default PrivateRoute;
