import React, { useContext, useState } from 'react';

import GameJoinWindow from './Windows/GameJoinWindow'

import './GameListCard.css';

const GameListCard = ({ game = {} }) => {
    const [joinGameWindowState, setJoinGameWindowState] = useState(false);

    return (
        <>
            <GameJoinWindow
                onClose={() => setJoinGameWindowState(false)}
                isOpen={joinGameWindowState}
                game={game}
            />
            <tr className='game-list-card' onClick={() => setJoinGameWindowState(true)} >
                <td className='elem' >
                    <div className={`status ${game?.status || ''}`} ></div>
                </td>
                <td className='elem' >
                    <p className={`main`} >{game?.custom_name || 'N/A'}</p>
                    <p className={`sub`} >{game?.creator || 'N/A'}</p>
                </td>
                <td className='elem type' >
                    <p className={`main`} >{(game?.tournament_id == 0 ? 'Normal' : 'Tournament') || 'N/A'}</p>
                    <p className={`sub`} >{game?.type || 'N/A'}</p>
                </td>
                <td className='elem score' >
                    <p className={`main`} >Score: {game?.score_to_win}</p>
                </td>
                <td className='elem count' >
                    <p className={`main`} >{game?.players_current}/{game?.players_maximum}</p>
                </td>
            </tr>
        </>
    );
}

export default GameListCard;
