import React, { useState } from 'react';

import './ColorInput.css'

const ColorInput = ({ onChange = () => {}, id, name, value = '#e59324', label, disabled = false }) => {
    const [inputValue, setInputValue] = useState(value);

    const handleChange = (event) => {
        setInputValue(event.target.value);
    }

    return (
        <div className={`input state_0`} >
            {label && <label htmlFor={id}>{label}</label>}
            <input
                onChange={event => { handleChange(event); onChange(event); }}
                type='color'
                id={id}
                name={name}
                value={inputValue}
                disabled={disabled}
            />
        </div>
    );
}

export default ColorInput;
