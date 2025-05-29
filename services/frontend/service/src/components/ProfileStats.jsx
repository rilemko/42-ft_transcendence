import React, { useEffect, useState } from 'react';

import { useToast } from '../contexts/ToastContext';

import BaseButton from './Buttons/BaseButton';
import BarChart from './Charts/BarChart';
import PieChart from './Charts/PieChart';


import './ProfileStats.css';

const ProfileStats = ({ targetId = 0 }) => {
    const [isLoading, setisLoading] = useState(false);
    const [history, setHistory] = useState([]);

    const [tData, setTData] = useState([]);
    const [mData, setMData] = useState([]);
    const [wData, setWData] = useState([]);

    const { addToast } = useToast();

    useEffect(() => {
        refresh();
    }, []);

    useEffect(() => {
        setMData([
            {
                name: '1v1',
                value: ((history.filter(game => game.type === '1v1').length / history.length) * 100).toFixed(0),
                color: '#2980b9'
            },
            {
                name: '2v2',
                value: ((history.filter(game => game.type === '2v2').length / history.length) * 100).toFixed(0),
                color: '#16a085'
            }
        ]);

        setTData([
            {
            name: 'Normal',
            value: ((history.filter(game => game.tournament_id === 0).length / history.length) * 100).toFixed(0),
            color: 'var(--color-primary)'
            },
            {
            name: 'Tournament',
            value: ((history.filter(game => game.tournament_id > 0).length / history.length) * 100).toFixed(0),
            color: '#d35400'
            }
        ]);

        setWData([
            {
                name: 'Victories',
                value: ((history.filter(game => game.has_won).length / history.length) * 100).toFixed(0),
                color: 'var(--color-success)'
            },
            {
                name: 'Losses',
                value: ((history.filter(game => !game.has_won).length / history.length) * 100).toFixed(0),
                color: 'var(--color-alert)'
            }
        ]);
    }, [history]);

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
                addToast('Failed to retrieve statistics.', 'failure', 5000);
            }
        } catch (error) {
            addToast('Failed to retrieve statistics.', 'failure', 5000);
        }
        setisLoading(false);
    };

    return (
        <div className='profile-stats col' >
            <header>
                <h3>Statistics</h3>
                <BaseButton
                    onClick={refresh}
                    className='secondary round refresh'
                >
                    <i class="bi bi-arrow-clockwise"></i>
                </BaseButton>
            </header>
            <div className={`col content`}>
                {history.length > 0 &&
                    <>
                        <div className='line' >
                            <BarChart data={wData} />
                        </div>
                        <div className='line' >
                            <PieChart data={tData} />
                        </div>
                        <div className='line' >
                            <PieChart data={mData} />
                        </div>
                    </>
                }
            </div>
        </div>
    );
}

export default ProfileStats;
