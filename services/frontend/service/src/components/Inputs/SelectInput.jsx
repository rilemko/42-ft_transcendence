import React, { useState } from 'react';

import './SelectInput.css'

const SelectInput = ({ onChange = () => {}, id, name, options = [], value = '', label, disabled = false }) => {
    const [inputValue, setInputValue] = useState(value);

    const handleChange = (event) => {
        setInputValue(event.target.value);
    };

    return (
        <div className={`input state_0`}>
            {label && <label htmlFor={id}>{label}</label>}
            <select
                onChange={(event) => {handleChange(event); onChange(event)}}
                id={id}
                name={name}
                value={inputValue || options[0].value}
                disabled={disabled}
            >
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default SelectInput;
