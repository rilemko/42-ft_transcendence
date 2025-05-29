import React, { useState } from 'react';

import FileInput from './FileInput';

import "./ImageInput.css"

const ImagePreviewInput = ({ onBlur = () => {}, onChange = () => {}, onFocus = () => {}, id, name, label, source = null, disabled = false }) => {
    const [image, setImage] = useState(source);

    const handleChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }

    return (
        <div className={`image-preview`} >
            {label && <label htmlFor={id}>{label}</label>}
            <div className={`col`} >
                <div className={`img`} style={{backgroundImage: `url("${image}")` }} ></div>
                <FileInput
                    onBlur={onBlur}
                    onChange={event => { handleChange(event); onChange(event); }}
                    onFocus={onFocus}
                    id={id}
                    name={name}
                    disabled={disabled}
                />
            </div>
        </div>
    );
}

export default ImagePreviewInput;
