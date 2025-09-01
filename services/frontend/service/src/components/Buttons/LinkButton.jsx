import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';

import BaseButton from './BaseButton';
import AcceptModal from '../Modals/AcceptModal';

import './LinkButton.css';

const LinkButton = ({ route, id, className = '', text = '', disabled = false }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalIsLoading, setModalIsLoading] = useState(false);

    const navigate = useNavigate();

    const url = new URL(route, window.location.origin);

    const handleClick = () => {
        setIsLoading(true);
        if (url.hostname === window.location.hostname) navigate(route);
        else setModalIsOpen(true);
        setIsLoading(false);
    }

    const handleAccept = async () => {
        setModalIsLoading(true);
        window.location.href = route;
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
                text={`You will be redirected to '${url.hostname}'. Continue ?`}
                acceptText='Continue'
                isAcceptLoading={modalIsLoading}
            />
            <BaseButton
                onClick={handleClick}
                id={id}
                className={className}
                text={text}
                disabled={disabled}
                isLoading={isLoading}
            />
        </div>
    );
}

export default LinkButton;
