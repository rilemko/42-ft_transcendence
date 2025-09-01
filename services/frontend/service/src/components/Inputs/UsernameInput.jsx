import React, { useState } from 'react';

import BaseInput from './BaseInput';
import './UsernameInput.css';

const UsernameInput = ({ onBlur = () => {}, onChange = () => {}, onFocus = () => {}, id, name, label, value = '', placeholder, disabled = false}) => {
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
            regex={/^[A-Za-z0-9_-]{5,16}$/}
        />
    );
}

export default UsernameInput;
