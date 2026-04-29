import React, { useState } from 'react';

import { useToast } from '../../contexts/ToastContext';

import BaseButton from './BaseButton';

import './FriendDeleteButton.css';

const FriendDeleteButton = ({ onSuccess = () => {}, onFailure = () => {}, userId, id, className = 'secondary', disabled = false }) => {
    const [isLoading, setIsLoading] = useState(false);

    const { addToast } = useToast();

    const handleClick = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/auth/friend/remove/${userId}/`, {
                method: 'GET',
                credentials: 'include'
            });
            const json = await response.json();
            if (response.ok) {
                if (json?.success === true) {
                    addToast('Friend removed.', 'success', 5000);
                    onSuccess();
                } else {
                    addToast(json?.message || 'An error has occured.', 'failure', 5000);
                    onFailure();
                }
            } else {
                addToast(json?.message || 'An error has occured.', 'failure', 5000);
                onFailure();
            }
        } catch (error) {
            addToast('An error has occured.', 'failure', 5000);
            onFailure();
        }
        setIsLoading(false);
    }

    return (
        <BaseButton
            onClick={handleClick}
            id={id}
            className={className}
            icon='dash-circle'
            disabled={disabled}
            isLoading={isLoading}
        />
    );
}

export default FriendDeleteButton;
