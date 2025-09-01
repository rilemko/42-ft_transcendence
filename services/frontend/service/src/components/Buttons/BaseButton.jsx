import React from 'react';

import Loader from '../Loader';

import './BaseButton.css';

const BaseButton = ({ onClick = () => {}, onTouchStart = () => {}, onTouchEnd = () => {}, isLoading = false, id, className = '', text, icon, disabled = false, children }) => {
    return (
        <div className={`button ${className}`} >
            {isLoading && (
                <div className={`loading`} >
                    <Loader size='16px' />
                </div>
            )}
            <button
                onClick={onClick}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                id={id}
                disabled={disabled}
            >
                {text || icon ? (
                    <>
                        {icon && <i className={`bi bi-${icon}`} ></i>}
                        {text && <span class="text">{text}</span>}
                    </>
                ) : (
                    children
                )}
            </button>
        </div>
    );
}

export default BaseButton;
