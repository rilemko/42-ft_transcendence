import React, { useContext, useState } from 'react';

import { useToast } from '../../contexts/ToastContext';

import BaseButton from './BaseButton';

import './TwoFactorResendButton.css';

const TwoFactorResendButton = ({ id, className = 'secondary', text = 'Resend the code', disabled = false }) => {
    const [isLoading, setIsLoading] = useState(false);

    const { addToast } = useToast();

    const handleClick = async () => {
        setIsLoading(true);
        try {
			const response = await fetch('/api/auth/twofa/resend/', {
                method: 'GET',
				credentials: 'include'
			});
			if (response.ok) {
                addToast('A new code has been sent to you.', 'success', 5000);
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
            text={text}
            disabled={disabled}
        />
    );
}

export default TwoFactorResendButton;
