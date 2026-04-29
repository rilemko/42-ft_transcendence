import React, { useState } from 'react';

import FriendAddButton from './Buttons/FriendAddButton';
import FriendDeleteButton from './Buttons/FriendDeleteButton';
import BaseButton from './Buttons/BaseButton';
import ProfileWindow from './Windows/ProfileWindow';

import './PlayerCard.css';

const PlayerCard = ({ onChange = () => {}, userId = 0, username = '', avatarUrl = '', isFriend, isOnline = false, disabled = false }) => {
    const [profileWindowState, setProfileWindowState] = useState(false);

    return (
        <div className={`player-card ${isFriend && 'is_friend'}`} >
            <ProfileWindow
                isOpen={profileWindowState}
                onClose={() => setProfileWindowState(false)}
                targetId={userId}
                username={username}
                avatarUrl={avatarUrl}
                isFriend={isFriend}
            />
            <BaseButton
                onClick={() => setProfileWindowState(true)}
                className='secondary player'
            >
                <div className={`avatar`} style={{backgroundImage: `url("${avatarUrl}")` }} >
                    {isFriend &&
                        <div className={`status ${isOnline ? 'online' : ''}`} ></div>
                    }
                </div>
                <div class={`info`} >
                    <p class={`username`} >{username}</p>
                </div>
            </BaseButton>
            {!isFriend ? (
                <FriendAddButton
                    onSuccess={() => {onChange(userId, true)}}
                    userId={userId}
                    className='secondary friend'
                />
            ) : (
                <FriendDeleteButton
                    onSuccess={() => {onChange(userId, false)}}
                    userId={userId}
                    className='secondary friend'
                />
            )}
        </div>
    );
}

export default PlayerCard;
