import React, { useContext, useState } from 'react';

import { useToast } from '../../contexts/ToastContext';
import { UserContext } from '../../contexts/UserContext';

import BaseForm from './BaseForm';
import BaseButton from '../Buttons/BaseButton';
import ColorInput from '../Inputs/ColorInput';
import SliderInput from '../Inputs/SliderInput';

import './AstronautForm.css'

const AstronautForm = ({ onSuccess = () => {}, onFailure = () => {}, disabled = false }) => {

    const { bpColor, setBpColor, ringsColor, setRingsColor, suitColor, setSuitColor, visColor, setVisColor, flatness, setFlatness, horizontalPosition, setHorizontalPosition, verticalPosition, setVerticalPosition } = useContext(UserContext);
    const { addToast } = useToast();

    const handleValidation = (form) => {
        let valid = true;

        if (!/^#[A-Fa-f0-9]{6}$/.test(form.suitColor.value)
            || !/^#[A-Fa-f0-9]{6}$/.test(form.visColor.value)
            || !/^#[A-Fa-f0-9]{6}$/.test(form.ringsColor.value)
            || !/^#[A-Fa-f0-9]{6}$/.test(form.bpColor.value)
            || form.flatness.value < 1.5 || form.flatness.value > 4.2
            || form.horizontalPosition.value < 4.9 || form.horizontalPosition.value > 10
            || form.verticalPosition.value < -1.5 || form.verticalPosition.value > 1.5) {
            addToast('An error has occured.', 'failure', 10000)
            valid = false;
        }

        return valid;
    }

    const handleFailure = (json) => {
    }

    const handleSuccess = (json) => {
        setBpColor(json.bpColor);
        setRingsColor(json.ringsColor);
        setSuitColor(json.suitColor);
        setVisColor(json.visColor);
        setFlatness(json.flatness);
        setHorizontalPosition(json.horizontalPosition);
        setVerticalPosition(json.verticalPosition);
        addToast('Avatar updated successfully.', 'success', 5000);
    }

    return (
        <BaseForm
            handleValidation={handleValidation}
            onSuccess={(json) => {handleSuccess(json); onSuccess(json)}}
            onFailure={(json) => {handleFailure(json); onFailure(json)}}
            target='/api/auth/me/update/colors/'
            type='json'
            headers={{'Content-Type': 'application/json'}}
            disabled={disabled}
        >
            <div className={`row`} >
                <ColorInput onChange={(e) => setSuitColor(e.target.value)} id='suitColor' name='suitColor' label='Suit' value={suitColor} />
                <ColorInput onChange={(e) => setVisColor(e.target.value)} id='visColor' name='visColor' label='Visor' value={visColor} />
            </div>
            <div className={`row`} >
                <ColorInput onChange={(e) => setRingsColor(e.target.value)} id='ringsColor' name='ringsColor' label='Rings' value={ringsColor} />
                <ColorInput onChange={(e) => setBpColor(e.target.value)} id='bpColor' name='bpColor' label='Backpack' value={bpColor} />
            </div>
            <SliderInput onChange={(e) => setFlatness(e.target.value)} id='flatness' name='flatness' value={flatness || '2.8'} min={1.5} max={4.2} step={0.1} label='Flatness' />
            <SliderInput onChange={(e) => setHorizontalPosition(e.target.value)} id='horizontalPosition' name='horizontalPosition' value={horizontalPosition || '0.73'} min={4.9} max={10} step={0.1} label='Horizontal adjustement' />
            <SliderInput onChange={(e) => setVerticalPosition(e.target.value)} id='verticalPosition' name='verticalPosition' value={verticalPosition || '0.0'} min={-1.5} max={1.5} step={0.1} label='Vertical adjustement' />
            <BaseButton text='Update' className='primary' />
        </BaseForm>
    );
}

export default AstronautForm;
