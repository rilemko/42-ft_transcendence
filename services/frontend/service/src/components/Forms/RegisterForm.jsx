import React, { useContext, useState } from 'react';

import { useToast } from '../../contexts/ToastContext';
import { UserContext } from '../../contexts/UserContext';

import BaseForm from './BaseForm';
import TwoFactorForm from './TwoFactorForm'
import BaseButton from '../Buttons/BaseButton';
import EmailInput from '../Inputs/EmailInput';
import PasswordInput from '../Inputs/PasswordInput';
import UsernameInput from '../Inputs/UsernameInput';

import './RegisterForm.css'

const RegisterForm = ({ onSuccess = () => {}, onFailure = () => {}, disabled = false }) => {
    const [twoFactorState, setTwoFactorState] = useState(false);

    const { addToast } = useToast();
    const { login } = useContext(UserContext);

    const handleValidation = (form) => {
        let valid = true;

        if (!/^[A-Za-z0-9_-]{5,16}$/.test(form.username.value)) {
            addToast('Username can only contain alphanumeric characters and "_-" symbols, and be between 5 and 24 characters long.', 'failure', 10000)
            valid = false;
        }
        if (!/^[A-Za-z0-9+._-]{3,}@[A-Za-z0-9+._-]{3,}\.[A-Za-z0-9+._-]{2,}$/.test(form.email.value)) {
            addToast('Invalid email address.', 'failure', 10000)
            valid = false;
        }
        if (!/^[A-Za-z\d_@.!?-]{8,24}$/.test(form.password.value)) {
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
        if (json.twoFA_enabled === true) setTwoFactorState(true)
        else login();
    }

    return (
        <>
            {!twoFactorState ? (
                <BaseForm
                    handleValidation={handleValidation}
                    onSuccess={(json) => {handleSuccess(json); onSuccess(json)}}
                    onFailure={(json) => {handleFailure(json); onFailure(json)}}
                    target='/api/auth/account/register/'
                    type='json'
                    headers={{'Content-Type': 'application/json'}}
                    disabled={disabled}
                >
                    <UsernameInput id='username' name='username' label='Username' placeholder='Username' />
                    <EmailInput id='email' name='email' label='Email' placeholder='Email' />
                    <PasswordInput id='password' name='password' label='Password' placeholder='••••••••' strength={true} />
                    <PasswordInput id='password2' name='password2' label='Confirm password' placeholder='••••••••' />
                    <BaseButton text='Create my account' className='primary shine' />
                </BaseForm>
            ) : (
                <TwoFactorForm />
            )}
    </>
    );
}

export default RegisterForm;
