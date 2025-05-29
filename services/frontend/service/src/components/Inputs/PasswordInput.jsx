import React, { useState } from 'react';

import BaseInput from './BaseInput';
import "./PasswordInput.css"

const PasswordInput = ({ onBlur = () => {}, onChange = () => {}, onFocus = () => {}, id, name, label, placeholder = '••••••••', disabled = false, strength = false }) => {
    const [inputStrength, setInputStrength] = useState(0);
    const [strengthColor, setStrengthColor] = useState('#c0392b');

    const handleChange = (event) => {
        const password = event.target.value;

        if (!strength || password.length === 0 || !/^[A-Za-z\d_@.!?-]+$/.test(password)) {
            setInputStrength(0);
        } else {
            let strength = 0;

            const lengthScore = Math.min((password.length - 8) / (24 - 8), 1);
            strength += lengthScore * 60; // 60% de la puissance totale

            const hasLower = /[a-z]/.test(password);
            const hasUpper = /[A-Z]/.test(password);
            const hasDigit = /\d/.test(password);
            const hasSpecial = /[_@.!?-]/.test(password);

            const typesCount = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;
            strength += typesCount * 15; // 15% pour chaque type de caractère (jusqu'à 60%)

            const uniqueChars = new Set(password).size;
            const diversityScore = Math.min(uniqueChars / password.length, 1);
            strength += diversityScore * 20; // 20% de la puissance totale

            setInputStrength(Math.min(Math.round(strength), 100));
        }
        if (inputStrength < 20) setStrengthColor('#c0392b')
        else if (inputStrength < 60) setStrengthColor('#e67e22')
        else setStrengthColor('#27ae60')
    }

    return (
        <BaseInput
            onBlur={onBlur}
            onChange={event => { handleChange(event); onChange(event); }}
            onFocus={onFocus}
            type='password'
            id={id}
            name={name}
            label={label}
            placeholder={placeholder}
            disabled={disabled}
            regex={/^[A-Za-z\d_@#.!?-]{8,24}$/}
        >
            {strength && (
            <div className='password-strength'>
                <div className="progress" style={{width: inputStrength + '%', backgroundColor: strengthColor}}></div>
            </div>
            )}
        </BaseInput>
    );
}

export default PasswordInput;
