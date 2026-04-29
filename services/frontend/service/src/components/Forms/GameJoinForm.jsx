import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { GameContext } from '../../contexts/GameContext';
import { UserContext } from '../../contexts/UserContext';
import { useToast } from '../../contexts/ToastContext';

import BaseForm from './BaseForm';
import BaseButton from '../Buttons/BaseButton';
import BaseInput from '../Inputs/BaseInput';

import './GameJoinForm.css'

const GameJoinForm = ({ onSuccess = () => {}, onFailure = () => {}, game = {}, disabled = false }) => {

    const { join } = useContext(GameContext);
    const { username } = useContext(UserContext);
    const { addToast } = useToast();

    const navigate = useNavigate();

    const handleValidation = (form) => {
        let valid = true;

        if (!/^[A-Za-z0-9_#-]{5,16}$/.test(form.nickname.value)) {
            addToast('Nickname can only contain alphanumeric characters and "_#-" symbols, and be between 5 and 16 characters long.', 'failure', 10000)
            valid = false;
        }
        return valid;
    }

    const handleFailure = (json) => {
    }

    const handleSuccess = (json) => {
        join(json.list_id[0], json.list_id);
        navigate('/game');
    }

    return (
        <BaseForm
            handleValidation={handleValidation}
            onSuccess={(json) => {handleSuccess(json); onSuccess(json)}}
            onFailure={(json) => {handleFailure(json); onFailure(json)}}
            target={game?.tournament_id == 0 ? `/api/game/join/${game?.id}/` : `/api/game/tournament/join/${game?.id}/`}
            method='PUT'
            type='json'
            headers={{'Content-Type': 'application/json'}}
            disabled={disabled}
        >
            <BaseInput id='nickname' name='nickname' label='Nickname' value={username} regex={/^[A-Za-z0-9_#-]{5,16}$/} />
            <BaseButton text='Join' className='primary' />
        </BaseForm>
    );
}

export default GameJoinForm;
