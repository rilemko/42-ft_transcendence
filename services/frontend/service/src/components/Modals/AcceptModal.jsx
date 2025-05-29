import React from 'react';

import BaseButton from '../Buttons/BaseButton';
import BaseModal from './BaseModal';
import './AcceptModal.css'

const AcceptModal = ({ onAccept = () => {}, onDecline = () => {}, isOpen = false, isAcceptLoading = false, isCancelLoading = false, title, text, className = 'primary shine', acceptText = 'Accept', cancelText = 'Cancel' }) => {
    return (
        <BaseModal isOpen={isOpen}>
            <div className={`col content`}>
                {title && (
                <div className={`row`}>
                    <h2>{title}</h2>
                </div>
                )}
                {text && (
                <div className={`row`}>
                    <p>{text}</p>
                </div>
                )}
            </div>
            <div className={`row action`}>
                <BaseButton onClick={onDecline} className='secondary' text={cancelText} isLoading={isCancelLoading} ></BaseButton>
                <BaseButton onClick={onAccept} className={className} text={acceptText} isLoading={isAcceptLoading} ></BaseButton>
            </div>
        </BaseModal>
    );
}

export default AcceptModal;
