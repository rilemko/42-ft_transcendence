import React, { useState } from 'react';

import './BaseInput.css'

const BaseInput = ({ onBlur = () => {}, onChange = () => {}, onFocus = () => {}, type = 'text', id, name, value = '', label, placeholder, disabled = false, regex, children }) => {
    const [inputValue, setInputValue] = useState(value);
    const [inputState, setInputState] = useState(0);

    const handleChange = (event) => {
        if (event.target.value === "" || !regex) setInputState(0);
        else if (event.target.value !== "" &&  regex.test(event.target.value)) setInputState(1);
        else if (event.target.value !== "" && !regex.test(event.target.value)) setInputState(2);
        setInputValue(event.target.value);
    }

    return (
        <div className={`input state_${inputState}`}>
            {label && <label htmlFor={id}>{label}</label>}
            <input
                onBlur={onBlur}
                onChange={event => { handleChange(event); onChange(event); }}
                onFocus={onFocus}
                type={type}
                id={id}
                name={name}
                placeholder={placeholder}
                value={inputValue}
                disabled={disabled}
            />
            {children}
        </div>
    );
}

export default BaseInput;
