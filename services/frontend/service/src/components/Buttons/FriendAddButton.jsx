import React, { useState } from 'react';

import { useToast } from '../../contexts/ToastContext';

import BaseButton from './BaseButton';

import './FriendAddButton.css';

const FriendAddbutton = ({ onSuccess = () => {}, onFailure = () => {}, userId, id, className = 'secondary', disabled = false }) => {
    const [isLoading, setIsLoading] = useState(false);

    const { addToast } = useToast();

    const handleClick = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/auth/friend/add/${userId}/`, {
                method: 'GET',
                credentials: 'include'
            });
            const json = await response.json();
            if (response.ok) {
                if (json?.success === true) {
                    addToast('Friend added.', 'success', 5000);
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
            icon='plus-circle'
            disabled={disabled}
            isLoading={isLoading}
        />
    );
}

export default FriendAddbutton;
