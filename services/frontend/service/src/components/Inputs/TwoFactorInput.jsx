import React, { useEffect, useRef, useState } from 'react';

import './TwoFactorInput.css'

const TwoFactorInput = ({ onBlur = () => {}, onChange = () => {}, onFocus = () => {}, id, name, label, disabled = false, regex = /^[0-9]$/ }) => {
    const [inputState, setInputState] = useState(0);
    const [values, setValues] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);

    const handleChange = (event, index) => {
        const { value } = event.target;

        if (value === "" || !regex) setInputState(0);
        else if (value !== "" &&  regex.test(value)) setInputState(1);
        else if (value !== "" && !regex.test(value)) setInputState(2);

        const newValues = [...values];
        newValues[index] = value.slice(-1);
        setValues(newValues);


        if (value && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, event) => {
        const { key } = event;
        if (key === 'Backspace' && !values[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    return (
        <div className={`input state_${inputState}`} >
            {label && <label htmlFor={id}>{label}</label>}
            <div style={{display: 'flex', gap: '8px'}} >
                {values.map((value, index) => (
                    <input
                        key={index}
                        onBlur={onBlur}
                        onChange={(event) => { handleChange(event, index); onChange(event); }}
                        onKeyDown={(event) => handleKeyDown(index, event)}
                        onFocus={onFocus}
                        type="text"
                        name={`${name}_${index}`}
                        value={value}
                        maxLength="1"
                        ref={(ref) => inputRefs.current[index] = ref}
                        disabled={disabled}
                        className={`twofa`}
                    />
                ))}
            </div>
        </div>
    );
}

export default TwoFactorInput;
