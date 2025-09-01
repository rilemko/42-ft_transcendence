import React, { useContext, useState } from 'react';

import { UserContext } from '../../contexts/UserContext';

import BaseForm from './BaseForm';
import BaseButton from '../Buttons/BaseButton';
import BaseInput from '../Inputs/BaseInput';
import PasswordInput from '../Inputs/PasswordInput';

import './LoginForm.css'
import TwoFactorForm from './TwoFactorForm';

const LoginForm = ({ onSuccess = () => {}, onFailure = () => {}, disabled = false }) => {
    const [twoFactorState, setTwoFactorState] = useState(false);

    const { login } = useContext(UserContext);

    const handleValidation = (form) => {
        return true;
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
                    target='/api/auth/account/login/'
                    type='json'
                    headers={{'Content-Type': 'application/json'}}
                    disabled={disabled}
                >
                    <BaseInput id='sername' name='username' label='Username' placeholder='Username' />
                    <PasswordInput id='password' name='password' label='Password' placeholder='••••••••' />
                    <BaseButton className='primary shine' text='Login' />
                </BaseForm>
            ) : (
                <TwoFactorForm />
            )}
        </>
    );
}

export default LoginForm;
