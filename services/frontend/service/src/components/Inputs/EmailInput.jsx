import React, { useState } from 'react';

import BaseInput from './BaseInput';
import './EmailInput.css'

const EmailInput = ({ onBlur = () => {}, onChange = () => {}, onFocus = () => {}, id, name, label, value = '', placeholder, disabled = false }) => {
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
            regex={/^[A-Za-z0-9+._-]{3,}@[A-Za-z0-9+._-]{3,}\.[A-Za-z0-9+._-]{2,}$/}
        />
    );
}

export default EmailInput;
