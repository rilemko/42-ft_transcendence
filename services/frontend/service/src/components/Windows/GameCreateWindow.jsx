import React from 'react';

import BaseWindow from './BaseWindow';
import GameCreateForm from '../Forms/GameCreateForm';

import './GameCreateWindow.css';

const GameCreateWindow = ({ onClose = () => {}, isOpen = false, title = 'Create a game', height = '635px', width = '500px' }) => {

    return (
        <BaseWindow
            onClose={onClose}
            isOpen={isOpen}
            title={title}
            height={height}
            width={width}
            className='create-game'
        >
            <GameCreateForm />
        </BaseWindow>
    );
}

export default GameCreateWindow;
