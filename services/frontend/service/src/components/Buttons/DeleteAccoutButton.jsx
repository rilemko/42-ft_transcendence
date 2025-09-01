import React, { useContext, useState } from 'react';

import { useToast } from '../../contexts/ToastContext';
import { UserContext } from '../../contexts/UserContext';

import BaseButton from './BaseButton';
import AcceptModal from '../Modals/AcceptModal';

import './DeleteAccoutButton.css';

const DeleteAccoutButton = ({ id, className = 'alert', text = 'Delete my account', disabled = false }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalIsLoading, setModalIsLoading] = useState(false);

    const { logout } = useContext(UserContext)
    const { addToast } = useToast();

    const handleClick = async () => {
        setIsLoading(true);
        setModalIsOpen(true);
        setIsLoading(false);
    }

    const handleAccept = async () => {
        setModalIsLoading(true);
        try {
			const response = await fetch('/api/auth/account/delete/', {
                method: 'GET',
				credentials: 'include'
			});
            const json = await response.json();
			if (response.ok) {
                if (json?.success === true) {
                    logout();
                    addToast('Account deleted successfully.', 'success', 5000);
                } else {
                    addToast(json?.message || 'An error has occured.', 'failure', 5000);
                }
			} else {
				addToast(json?.message || 'An error has occured.', 'failure', 5000);
			}
		} catch (error) {
			addToast('An error has occured.', 'failure', 5000);
		}
        setModalIsLoading(false);
    }

    const handleDecline = async () => {
        setIsLoading(false);
        setModalIsOpen(false);
    }

    return (
        <div>
            <AcceptModal
                onAccept={handleAccept}
                onDecline={handleDecline}
                isOpen={modalIsOpen}
                text={`You are about to delete your account. This action is irreversible.`}
                className='alert'
                acceptText='Delete'
                isAcceptLoading={modalIsLoading}
            />
            <BaseButton
                onClick={handleClick}
                id={id}
                className={className}
                text={text}
                icon='trash3-fill'
                disabled={disabled}
                isLoading={isLoading}
            />
        </div>
    );
}

export default DeleteAccoutButton;
