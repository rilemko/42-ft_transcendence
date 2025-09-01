import React, { useState } from 'react';

import './SliderInput.css'

const SliderInput = ({ onChange = () => {}, id, name, value = 0, min = 0, max = 100, step = 1, label, disabled = false }) => {
    const [inputValue, setInputValue] = useState(value);

    const handleChange = (event) => {
        setInputValue(event.target.value);
    }

    return (
        <div className={`input`}>
            {label && <label htmlFor={id}>{label} ({inputValue})</label>}
            <input
                onChange={event => { handleChange(event); onChange(event); }}
                type='range'
                id={id}
                name={name}
                value={inputValue}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
            />
        </div>
    );
}

export default SliderInput;
