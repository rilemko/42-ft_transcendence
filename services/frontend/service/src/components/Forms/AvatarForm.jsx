import React, { useContext, useState } from 'react';

import { useToast } from '../../contexts/ToastContext';
import { UserContext } from '../../contexts/UserContext';

import BaseForm from './BaseForm';
import BaseButton from '../Buttons/BaseButton';
import ImageInput from '../Inputs/ImageInput';

import './AvatarForm.css'

const AvatarForm = ({ onSuccess = () => {}, onFailure = () => {}, disabled = false }) => {

    const { profilePicture, setProfilePicture } = useContext(UserContext);
    const { addToast } = useToast();

    const handleValidation = (form) => {
        let valid = true;

        return valid;
    }

    const handleFailure = (json) => {
    }

    const handleSuccess = (json) => {
        setProfilePicture(json.profile_picture_url);
        addToast('Avatar updated successfully.', 'success', 5000);
    }

    return (
        <BaseForm
            handleValidation={handleValidation}
            onSuccess={(json) => {handleSuccess(json); onSuccess(json)}}
            onFailure={(json) => {handleFailure(json); onFailure(json)}}
            target='/api/auth/me/update/avatar/'
            type='file'
            disabled={disabled}
        >
            <ImageInput id='avatar' name='avatar' label='Avatar' source={profilePicture} />
            <BaseButton text='Save' className='primary' />
        </BaseForm>
    );
}

export default AvatarForm;
