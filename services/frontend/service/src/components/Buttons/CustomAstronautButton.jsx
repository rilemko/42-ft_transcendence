import React, { useState } from 'react';

import BaseButton from './BaseButton';
import AstronautWindow from '../Windows/AstronautWindow';

import './CustomAstronautButton.css';

const CustomAstronautButton = ({ id, text = '', className = '', disabled = false }) => {
    const [astronautWindowState, setAstronautWindowState] = useState(false);

    return (
        <div>
            <AstronautWindow
                isOpen={astronautWindowState}
                onClose={() => setAstronautWindowState(false)}
            />
            <BaseButton
                onClick={() => setAstronautWindowState(true)}
                className='secondary'
                text='Customize'
                icon='droplet-half'
                disabled={disabled}
            />
        </div>
    );
}

export default CustomAstronautButton;
