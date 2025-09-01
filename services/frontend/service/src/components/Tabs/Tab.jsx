import React from 'react';

const Tab = ({ onClick = () => {}, name = 'Tab', icon, disabled = false, children }) => {
    return (
        <>
            {children}
        </>
    );
}

export default Tab;
