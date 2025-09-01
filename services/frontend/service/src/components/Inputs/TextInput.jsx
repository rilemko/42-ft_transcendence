import React, { useState } from 'react';

import BaseInput from './BaseInput';
import './TextInput.css';

const TextInput = ({ onBlur = () => {}, onChange = () => {}, onFocus = () => {}, id, name, label, value = '', placeholder, disabled = false, regex = /.*/ }) => {
    return (
        <BaseInput
            onBlur={onBlur}
            onChange={onChange}
            onFocus={onFocus}
            type='text'
            id={id}
            name={name}
            value={value}
            label={label}
            placeholder={placeholder}
            disabled={disabled}
            regex={regex}
        />
    );
}

export default TextInput;
