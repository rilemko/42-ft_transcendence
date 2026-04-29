import React, { createContext, useEffect, useState, useCallback, useContext } from 'react';

import { UserContext } from './UserContext';
import BaseSocket from '../components/Sockets/BaseSocket';

const StatusContext = createContext();

export const StatusProvider = ({ children }) => {

    const { isLogged } = useContext(UserContext);

    return (
        <StatusContext.Provider>
            {isLogged &&
                <BaseSocket target='/wss/auth/status/' />
            }
            {children}
        </StatusContext.Provider>
    );
};
