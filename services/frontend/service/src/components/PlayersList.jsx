import React, { useEffect, useState } from 'react';

import { useToast } from '../contexts/ToastContext';

import PlayerCard from './PlayerCard';
import BaseButton from './Buttons/BaseButton';

import './PlayersList.css';

const PlayersList = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState([]);

    const { addToast } = useToast();

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 10000);
        return () => clearInterval(interval);
    }, []);

    const refresh = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/user/list/', {
            method: 'GET',
            credentials: 'include'
            });
            const json = await response.json();
            if (response.ok) {
                if (json?.success === true) {
                    setUsers(json.users);
                }
            } else {
                addToast('Failed to retrieve player list.', 'failure', 5000);
            }
        } catch (error) {
            addToast('Failed to retrieve player list.', 'failure', 5000);
        }
        setIsLoading(false);
    };

    const onChange = (userId, isFriend) => {
        setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user.user_id === userId ? { ...user, is_friend: isFriend } : user
            )
        );
    };

    return (
        <div className='players-list col'>
            <header>
                <h3>Players</h3>
                <BaseButton
                    onClick={refresh}
                    className='secondary round refresh'
                >
                    <i class="bi bi-arrow-clockwise"></i>
                </BaseButton>
            </header>
            <div className={`content col`} >
                {users
                    .sort((a, b) => Number(b.is_friend) - Number(a.is_friend))
                    .map((user, index) => (
                        <PlayerCard
                            key={index}
                            onChange={onChange}
                            userId={user.user_id}
                            username={user.username}
                            avatarUrl={user.profile_picture_url}
                            isFriend={user.is_friend}
                            isOnline={user.is_online === 'online' ? true : false}
                        />
                ))}
            </div>
        </div>
    );
}

export default PlayersList;
