import React, { useEffect, useState } from 'react';

import { useToast } from '../contexts/ToastContext';

import GameHistoryCard from './GameHistoryCard';
import BaseButton from './Buttons/BaseButton';

import './GameHistoryList.css';

const GameHistoryList = ({ targetId = 0 }) => {
    const [isLoading, setisLoading] = useState(false);
    const [history, setHistory] = useState([]);

    const { addToast } = useToast();

    useEffect(() => {
        refresh();
    }, [targetId]);

    const refresh = async () => {
        setisLoading(true);
        try {
            const response = await fetch(`/api/game/user-history/${targetId}/`, {
                method: 'GET',
                credentials: 'include'
            });
            const json = await response.json();
            if (response.ok) {
                if (json?.success == true) {
                    setHistory(json?.games);
                }
            } else {
                addToast('Failed to retrieve game history.', 'failure', 5000);
            }
        } catch (error) {
            addToast('Failed to retrieve game history.', 'failure', 5000);
        }
        setisLoading(false);
    };

    return (
        <div className='game-history col'>
            <header>
                <h3>History</h3>
                <BaseButton
                    onClick={refresh}
                    className='secondary round refresh'
                >
                    <i class="bi bi-arrow-clockwise"></i>
                </BaseButton>
            </header>
            <div className={`col content`}>
                <table>
                    <tbody>
                        {history.map((game) => (
                            <GameHistoryCard
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

export default GameHistoryList;
