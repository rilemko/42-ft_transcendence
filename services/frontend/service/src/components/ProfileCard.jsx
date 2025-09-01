import React, { useContext, useState } from 'react';

import { UserContext } from '../contexts/UserContext';

import AccountWindow from './Windows/AccountWindow';
import ProfileWindow from './Windows/ProfileWindow';

import './ProfileCard.css';
import BaseButton from './Buttons/BaseButton';

const ProfileCard = () => {
    const [accountWindowState, setAccountWindowState] = useState(false);
    const [profileWindowState, setProfileWindowState] = useState(false);

    const { userId, profilePicture, username } = useContext(UserContext);

    return (
        <div className={`profile-card`} >
            <AccountWindow
                isOpen={accountWindowState}
                onClose={() => setAccountWindowState(false)}
            />
            <ProfileWindow
                isOpen={profileWindowState}
                onClose={() => setProfileWindowState(false)}
                targetId={userId}
                username={username}
                avatarUrl={profilePicture}
            />
            <BaseButton
                onClick={() => setProfileWindowState(true)}
                className='secondary profile'
            >
                <div className={`avatar`} style={{backgroundImage: `url("${profilePicture}")` }} >
                    <div className={`status`} ></div>
                </div>
                <div className={`info`} >
                    <p className={`username`} >{username}</p>
                    <p className={`status`} >Online</p>
                </div>
            </BaseButton>
            <BaseButton
                onClick={() => setAccountWindowState(true)}
                className='secondary account'
            >
                <i class="bi bi-gear-fill"></i>
            </BaseButton>
        </div>
    );
}

export default ProfileCard;
