import React from 'react';

import { useToast } from '../../contexts/ToastContext';

import BaseForm from './BaseForm';
import BaseButton from '../Buttons/BaseButton';
import PasswordInput from '../Inputs/PasswordInput';

import './SecurityForm.css'

const SecurityForm = ({ onSuccess = () => {}, onFailure = () => {}, disabled = false }) => {

    const { addToast } = useToast();

    const handleValidation = (form) => {
        let valid = true;

        if (!/^[A-Za-z\d_@*#.!?-]{8,24}$/.test(form.password.value)) {
            addToast('Password can only contain alphanumeric characters and "_@.!?-" symbols, and be between 8 and 24 characters long.', 'failure', 10000)
            valid = false;
        }
        if (form.password.value !== form.password2.value) {
            addToast('Confirmation password does not match.', 'failure', 10000)
            valid = false;
        }
        return valid;
    }

    const handleFailure = (json) => {
    }

    const handleSuccess = (json) => {
        addToast('Password updated successfully.', 'success', 5000);
    }

    return (
        <BaseForm
            handleValidation={handleValidation}
            onSuccess={(json) => {handleSuccess(json); onSuccess(json)}}
            onFailure={(json) => {handleFailure(json); onFailure(json)}}
            target='/api/auth/me/update/password/'
            type='json'
            headers={{'Content-Type': 'application/json'}}
            disabled={disabled}
        >
            <PasswordInput id='password' name='password' label='Password' placeholder='••••••••' strength={true} />
            <PasswordInput id='password2' name='password2' label='Confirm password' placeholder='••••••••' />
            <BaseButton text='Change password' className='primary' />
        </BaseForm>
    );
}

export default SecurityForm;
