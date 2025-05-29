import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GameContext } from '../../contexts/GameContext';
import { UserContext } from '../../contexts/UserContext';
import { useToast } from '../../contexts/ToastContext';

import BaseForm from './BaseForm';
import BaseButton from '../Buttons/BaseButton';
import BaseInput from '../Inputs/BaseInput';
import ColorInput from '../Inputs/ColorInput';
import SelectInput from '../Inputs/SelectInput';
import SliderInput from '../Inputs/SliderInput';
import Tabs from '../Tabs/Tabs';
import Tab from '../Tabs/Tab';

import './GameCreateForm.css'

const GameCreateForm = ({ onSuccess = () => {}, onFailure = () => {}, disabled = false }) => {
    const [isTournament, setIsTournament] = useState(false);

    const { join } = useContext(GameContext);
    const { username } = useContext(UserContext);
    const { addToast } = useToast();

    const navigate = useNavigate();

    const handleValidation = (form) => {
        let valid = true;

        if (!/^pong$/.test(form.game.value)
            || !/^(1v1|2v2)$/.test(form.type.value)
            || !/^#[A-Fa-f0-9]{6}$/.test(form.color_board.value)
            || !/^#[A-Fa-f0-9]{6}$/.test(form.color_ball.value)
            || !/^#[A-Fa-f0-9]{6}$/.test(form.color_wall.value)
            || !/^#[A-Fa-f0-9]{6}$/.test(form.color_paddle.value)
            || form.score_to_win.value < 3 || form.score_to_win.value > 15
            || form.speed.value < 0.5 || form.speed.value > 2.5
            || form.players_maximum && (form.players_maximum < 3 ||  form.players_maximum > 10)) {
            addToast('An error has occured.', 'failure', 10000)
            valid = false;
        }
        if (!/^[A-Za-z0-9 _.+'"$#@)(\][)-]{4,24}$/.test(form.custom_name.value)) {
            addToast('Room name can only contain alphanumeric characters and " _-.+$#@\'()[]"" symbols, and be between 5 and 24 characters long.', 'failure', 10000)
            valid = false;
        }
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
            target={isTournament ? '/api/game/tournament/create/' : '/api/game/create/'}
            type='json'
            headers={{'Content-Type': 'application/json'}}
            disabled={disabled}
        >
            <Tabs destructive={false} >
                <Tab name='Game' icon='controller' >
                    <SelectInput id='game' name='game' label='Game' options={[{label: 'Pong', value: 'pong'}]} value='pong' />
                    <div className={`row`} >
                        <BaseInput id='custom_name' name='custom_name' label='Room' value={`${username}'s game`} regex={/^[A-Za-z0-9 _.+'"$#@)(\][)-]{4,24}$/} />
                        <BaseInput id='nickname' name='nickname' label='Nickname' value={username} regex={/^[A-Za-z0-9_#-]{5,16}$/} />
                    </div>
                    <div className={`row`} >
                        <SelectInput
                            onChange={(event) => {setIsTournament(event.target.value === 'normal' ? false : true)}}
                            label='Mode'
                            options={[{label: 'Normal', value: 'normal'}, {label: 'Tournament', value: 'tournament'}]}
                            value='normal'
                        />
                        <SelectInput id='type' name='type' label='Type' options={[{label: '1v1', value: '1v1'}]} value='1v1' />
                    </div>
                    {isTournament &&
                        <SliderInput id='players_maximum' name='players_maximum' label='Players' value={4} min={3} max={10} step={1} />
                    }
                    <BaseButton text='Create' className='primary' />
                </Tab>
                <Tab name='Customization' icon='sliders2' >
                    <div className={`row`} >
                        <SliderInput id='score_to_win' name='score_to_win' label='Score' value={5} min={3} max={15} step={1} />
                        <SliderInput id='speed' name='speed' label='Speed' value={1} min={0.5} max={2.5} step={0.25} />
                    </div>
                    <div className={`row`} >
                        <ColorInput id='color_board' name='color_board' label='Board' value='#000000' />
                        <ColorInput id='color_ball' name='color_ball' label='Ball' value='#e48d2d' />
                    </div>
                    <div className={`row`} >
                        <ColorInput id='color_wall' name='color_wall' label='Walls' value='#e48d2d' />
                        <ColorInput id='color_paddle' name='color_paddle' label='Paddles' value='#ffffff' />
                    </div>
                </Tab>
            </Tabs>
        </BaseForm>
    );
}

export default GameCreateForm;
