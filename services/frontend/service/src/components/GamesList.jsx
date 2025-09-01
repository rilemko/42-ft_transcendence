import React, { useEffect, useState } from 'react';

import { useToast } from '../contexts/ToastContext';

import GameListCard from './GameListCard';
import BaseButton from './Buttons/BaseButton';
import GameCreateWindow from './Windows/GameCreateWindow';

import './GamesList.css';

const GamesList = () => {
    const [isLoading, setisLoading] = useState(false);
    const [createGameWindowState, setCreateGameWindowState] = useState(false);
    const [games, setGames] = useState([]);

    const { addToast } = useToast();

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 10000);
        return () => clearInterval(interval);
    }, []);

    const refresh = async () => {
        setisLoading(true);
        try {
            const response = await fetch('/api/game/list/', {
            method: 'GET',
            credentials: 'include'
            });
            const json = await response.json();
            if (response.ok) {
                if (json?.success == true) {
                    setGames(json?.games);
                }
            } else {
                addToast('Failed to retrieve game list.', 'failure', 5000);
            }
        } catch (error) {
            addToast('Failed to retrieve game list.', 'failure', 5000);
        }
        setisLoading(false);
    };

    return (
        <div className={`games-list col`} >
            <GameCreateWindow onClose={() => setCreateGameWindowState(false)} isOpen={createGameWindowState} />
            <header className={`row`} >
                <div className={`col title`}>
                        <h2>Games</h2>
                    </div>
                <div className={`col control`}>
                    <div className={`row`}>
                        <BaseButton onClick={refresh} className={`secondary refresh`} >
                            <i class="bi bi-arrow-clockwise"></i>
                        </BaseButton>
                        <BaseButton
                            onClick={() => setCreateGameWindowState(true)}
                            className={`primary shine create`}
                            text='Create'
                        />
                    </div>
                </div>
            </header>
            <div className='col content'>
                <table>
                    <tbody>
                        {games.map((game) => (
                            <GameListCard
                                key={game.id}
                                game={game}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default GamesList;
