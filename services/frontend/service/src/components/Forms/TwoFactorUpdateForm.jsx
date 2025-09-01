import React, { useContext } from 'react';

import { UserContext } from '../../contexts/UserContext';
import { useToast } from '../../contexts/ToastContext';

import BaseForm from './BaseForm';
import BaseButton from '../Buttons/BaseButton';
import PasswordInput from '../Inputs/PasswordInput';
import SelectInput from '../Inputs/SelectInput';

import './TwoFactorUpdateForm.css'

const TwoFactorUpdateForm = ({ onSuccess = () => {}, onFailure = () => {}, disabled = false }) => {

    const { hasTwoFa, setHasTwoFa } = useContext(UserContext);
    const { addToast } = useToast();

    const handleValidation = (form) => {
        let valid = true;

        if (!/^(True|False)$/.test(form.twoFA_enabled.value)) {
            addToast('An error has occured.', 'failure', 10000)
            valid = false;
        }
        return valid;
    }

    const handleFailure = (json) => {
    }

    const handleSuccess = (json) => {
        addToast('2FA updated successfully.', 'success', 5000);
    }

    return (
        <BaseForm
            handleValidation={handleValidation}
            onSuccess={(json) => {handleSuccess(json); onSuccess(json)}}
            onFailure={(json) => {handleFailure(json); onFailure(json)}}
            target='/api/auth/me/update/twofa/'
            type='json'
            headers={{'Content-Type': 'application/json'}}
            disabled={disabled}
        >
            <SelectInput
                onChange={(event) => {setHasTwoFa(event.target.value == 'True' ? true : false);}}
                id='twoFA_enabled'
                name='twoFA_enabled'
                label='Enable 2FA'
                options={[{label: 'Enabled', value: 'True'}, {label: 'Disabled', value: 'False'}]}
                value={hasTwoFa ? 'True' : 'False'}
            />
            <BaseButton text='Update 2FA' className='primary' />
        </BaseForm>
    );
}

export default TwoFactorUpdateForm;
