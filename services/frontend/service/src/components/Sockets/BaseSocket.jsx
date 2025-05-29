import { useEffect, useState } from 'react';

import './BaseSocket.css';

const BaseSocket = ({ onOpen = () => {}, onClose = () => {}, onMessage = () => {}, onError = () => {}, target = '' }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = new WebSocket(target);

        newSocket.onopen = () => {
            onOpen();
        };
        newSocket.onmessage = (event) => {
            onMessage(event);
        };
        newSocket.onclose = () => {
            onClose();
        };
        newSocket.onerror = (error) => {
            onError(error);
        }
        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    return (
        null
    );
};

export default BaseSocket;
