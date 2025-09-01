import React from 'react';
import * as ReactDOM from "react-dom/client";
import { Navigate, BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { GameProvider } from './contexts/GameContext';
import { StatusProvider } from './contexts/StatusContext';
import { ToastProvider } from './contexts/ToastContext';
import { UserProvider } from './contexts/UserContext';

import PrivateRoute from './routes/PrivateRoute';
import PublicRoute from './routes/PublicRoute';

import Home from './pages/Home';
import Index from "./pages/Index";
import Game from './pages/Game';

import 'bootstrap-icons/font/bootstrap-icons.css';

const App = () => {
    return (
        <UserProvider>
            <StatusProvider>
                <ToastProvider>
                    <GameProvider>
                        <Router>
                            <Routes>
                                <Route element={<PublicRoute />} >
                                    <Route path="/" element={<Index />} />
                                </Route>
                                <Route element={<PrivateRoute />}>
                                    <Route path="/home" element={<Home />} />
                                    <Route path="/game" element={<Game />} />
                                </Route>
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </Router>
                    </GameProvider>
                </ToastProvider>
            </StatusProvider>
        </UserProvider>
    );
};

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
