import React, { useEffect } from 'react';

import BaseButton from '../Buttons/BaseButton';

import './BaseWindow.css';

const BaseWindow = ({ onClose = () => {}, isOpen = false, title = '', height = 'auto', width = 'auto', className = '', children }) => {

    useEffect(() => {

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose, isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className={`window-container`} style={{display: isOpen ? 'flex' : 'none'}} >
            <div className={`window ${className}`} style={{height: height, maxWidth: width}} >
                <header className={`row`} >
                    <div className={`col title`}>
                        {title &&
                            <h2>{title}</h2>
                        }
                    </div>
                    <div className={`col control`}>
                        <div className={`row`}>
                            <BaseButton onClick={onClose} className={`secondary round`} >
                                <i className="bi bi-x-lg"></i>
                            </BaseButton>
                        </div>
                    </div>
                </header>
                <div className={`col content`}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default BaseWindow;
