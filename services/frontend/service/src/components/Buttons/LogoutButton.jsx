import React, { useContext, useState } from 'react';

import { useToast } from '../../contexts/ToastContext';
import { UserContext } from '../../contexts/UserContext';

import BaseButton from './BaseButton';

import './LogoutButton.css';

const LogoutButton = ({ id, className = 'alert', text = 'Logout', disabled = false }) => {
    const [isLoading, setIsLoading] = useState(false);

    const { logout } = useContext(UserContext);
    const { addToast } = useToast();

    const handleClick = async () => {
        setIsLoading(true);
        try {
			const response = await fetch('/api/auth/account/logout/', {
                method: 'GET',
				credentials: 'include'
			});
			if (response.ok) {
                logout();
			} else {
				addToast('An error has occurred.', 'failure', 5000);
			}
		} catch (error) {
			addToast('An error has occurred.', 'failure', 5000);
		}
        setIsLoading(false);
    }

    return (
        <BaseButton
            onClick={handleClick}
            isLoading={isLoading}
            id={id}
            className={className}
            text='Logout'
            icon='box-arrow-right'
            disabled={disabled}
        />
    );
}

export default LogoutButton;
