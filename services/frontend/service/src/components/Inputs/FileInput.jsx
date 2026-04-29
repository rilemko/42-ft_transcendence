import React from 'react';

import BaseInput from './BaseInput';
import "./FileInput.css"

const FileInput = ({ onBlur = () => {}, onChange = () => {}, onFocus = () => {}, id, name, label, disabled = false, regex = /^.*$/ }) => {
    return (
        <BaseInput
            onBlur={onBlur}
            onChange={onChange}
            onFocus={onFocus}
            type='file'
            id={id}
            name={name}
            label={label}
            disabled={disabled}
            regex={regex}
        />
    );
}

export default FileInput;
