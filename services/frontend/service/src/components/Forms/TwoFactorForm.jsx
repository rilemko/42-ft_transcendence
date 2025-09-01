import React, { useContext, useState } from 'react';

import { UserContext } from '../../contexts/UserContext';

import BaseForm from './BaseForm';
import BaseButton from '../Buttons/BaseButton';
import TwoFactorResendButton from '../Buttons/TwoFactorResendButton';
import TwoFactorInput from '../Inputs/TwoFactorInput'

import './TwoFactorForm.css'

const TwoFactorForm = ({ onSuccess = () => {}, onFailure = () => {}, disabled = false }) => {

    const { login } = useContext(UserContext);

    const handleValidation = (form) => {
        return true;
    }

    const handleFailure = (json) => {
    }

    const handleSuccess = (json) => {
        login();
    }

    return (
        <div className='col' >
            <BaseForm
                handleValidation={handleValidation}
                onSuccess={(json) => {handleSuccess(json); onSuccess(json)}}
                onFailure={(json) => {handleFailure(json); onFailure(json)}}
                target='/api/auth/twofa/validate/'
                type='json'
                headers={{'Content-Type': 'application/json'}}
                disabled={disabled}
            >
                <p>An email with a verification code has been sent to you.</p>
                <TwoFactorInput
                    id='twofa'
                    name='twofa'
                    label='Verification code'
                />
                <BaseButton text='Verify' className='primary shine' />
            </BaseForm>
            <TwoFactorResendButton />
        </div>
    );
}

export default TwoFactorForm;
