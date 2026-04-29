import React, { useContext, useState } from 'react';

import { useToast } from '../../contexts/ToastContext';
import { UserContext } from '../../contexts/UserContext';

import BaseForm from './BaseForm';
import BaseButton from '../Buttons/BaseButton';
import BaseInput from '../Inputs/BaseInput';
import EmailInput from '../Inputs/EmailInput';

import './ProfileForm.css'

const ProfileForm = ({ onSuccess = () => {}, onFailure = () => {}, disabled = false }) => {

    const { addToast } = useToast();
    const { username, setUsername, email, setEmail } = useContext(UserContext);

    const handleValidation = (form) => {
        let valid = true;

        if (!/^[A-Za-z0-9_-]{5,16}$/.test(form.username.value)) {
            addToast('Username can only contain alphanumeric characters and "_-" symbols, and be between 5 and 16 characters long.', 'failure', 10000)
            valid = false;
        }
        if (!/^[A-Za-z0-9+._-]{3,}@[A-Za-z0-9+._-]{3,}\.[A-Za-z0-9+._-]{2,}$/.test(form.email.value)) {
            addToast('Invalid email address.', 'failure', 10000)
            valid = false;
        }
        return valid;
    }

    const handleFailure = (json) => {
    }

    const handleSuccess = (json) => {
        setUsername(json.username);
        setEmail(json.email);
        addToast('Profile updated successfully.', 'success', 5000);
    }

    return (
        <BaseForm
            handleValidation={handleValidation}
            onSuccess={(json) => {handleSuccess(json); onSuccess(json)}}
            onFailure={(json) => {handleFailure(json); onFailure(json)}}
            target='/api/auth/me/update/info/'
            type='json'
            headers={{'Content-Type': 'application/json'}}
            disabled={disabled}
        >
            <BaseInput id='username' name='username' label='Username' value={username} />
            <EmailInput id='email' name='email' label='Email' value={email} />
            <BaseButton text='Update' className='primary' />
        </BaseForm>
    );
}

export default ProfileForm;
