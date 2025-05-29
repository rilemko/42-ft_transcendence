import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import BaseButton from './BaseButton';

import './NavButton.css';

const NavButton = ({ route, id, className = '', text = '', disabled = false }) => {
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleClick = () => {
        setIsLoading(true);
        navigate(route);
        setIsLoading(false);
    }

    return (
        <BaseButton
            onClick={handleClick}
            id={id}
            className={className}
            text={text}
            disabled={disabled}
            isLoading={isLoading}
        />
    );
}

export default NavButton;
