import React from 'react';

import './BaseModal.css'

const BaseModal = ({ isOpen = false, children }) => {
    
    return (
        <>
            {isOpen &&
                <div className={`modal-container`} style={{display: isOpen ? 'block' : 'none'}}>
                    <div className={`modal`} >
                        {children}
                    </div>
                </div>
            }
        </>
    );
}

export default BaseModal;
