import React, { useEffect, useState } from 'react';
import './Toast.css';

const Toast = ({ onClose = () => {}, message, className = '', duration = 3000 }) => {
    const [visible, setVisible] = useState(true);

    return (
        <div className={`toast ${className}`}>
            {message}
        </div>
    );
};

export default Toast;
