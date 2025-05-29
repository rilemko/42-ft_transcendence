import React from 'react';

import BaseWindow from './BaseWindow';
import GameJoinForm from '../Forms/GameJoinForm';

import './GameJoinWindow.css';

const GameJoinWindow = ({ onClose = () => {}, isOpen = false, game = {}, title = 'Join a game', height = 'auto', width = '500px' }) => {

    return (
        <BaseWindow
            onClose={onClose}
            isOpen={isOpen}
            title={title}
            height={height}
            width={width}
            className='join-game'
        >
            <GameJoinForm game={game} />
        </BaseWindow>
    );
}

export default GameJoinWindow;
