import React, { useEffect, useState } from 'react';

import { useToast } from '../contexts/ToastContext';

import './GameHistoryCard.css';

const GameHistoryCard = ({ game = {} }) => {
    const [isLoading, setisLoading] = useState(false);
    const [players, setPlayers] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [duration, setDuration] = useState('');

    const { addToast } = useToast();

    useEffect(() => {
        refresh();
    }, []);

    const refresh = async () => {
        setisLoading(true);

        const date = new Date(game.started_at);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(2);

        setStartDate(`${day}/${month}/${year}`);

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        setStartTime(`${hours}:${minutes}:${seconds}`);

        const durationMs = new Date(game.stopped_at) - date;
        const durationHours = String(Math.floor(durationMs / (1000 * 60 * 60))).padStart(2, '0');
        const durationMinutes = String(Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        const durationSeconds = String(Math.floor((durationMs % (1000 * 60)) / 1000)).padStart(2, '0');
        setDuration(`${durationHours}:${durationMinutes}:${durationSeconds}`);

        setPlayers(await Promise.all(
            game?.players.map(async (player) => {
                try {
                    const response = await fetch(`/api/auth/user/${player?.user_id}/`, {
                        method: 'GET',
                        credentials: 'include'
                    });
                    const json = await response.json();
                    if (response.ok) {
                        return { ...player, ...json };
                    }
                } catch (error) {}
            })
        ));

        setisLoading(false);
    };

    return (
        <tr className='game-history-card' >
            {!isLoading && (
                <>
                    <td className='elem' >
                        <div className={`status ${game?.has_won === true ? 'win' : 'lose'}`} >
                            {game?.has_won === true &&
                                <i class="bi bi-trophy-fill"></i>
                            }
                        </div>
                    </td>
                    <td className='elem' >
                        <p className={`main`} >{startDate}</p>
                        <p className={`sub`} >{startTime}</p>
                    </td>
                    <td className='elem' >
                        <p className={`main`} >{(game?.tournament_id === 0 ? 'Normal' : 'Tournament') || 'N/A'}</p>
                        <p className={`sub`} >{game?.type || 'N/A'}</p>
                    </td>
                    <td className='elem duration' >
                        <p className={`main`} >{duration}</p>
                    </td>
                    <td className='elem players' >
                        <div className='elem list'>
                            {players.map((player) => (
                                <div key={player?.user_id} className={`avatar`} style={{backgroundImage: `url("${player?.profile_picture_url || null}")` }} ></div>
                            ))}
                        </div>
                    </td>
                </>
            )}
        </tr>
    );
}

export default GameHistoryCard;
