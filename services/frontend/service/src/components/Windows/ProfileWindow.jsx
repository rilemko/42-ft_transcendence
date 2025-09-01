import React, { useContext, useEffect, useState } from 'react';

import BaseWindow from './BaseWindow';
import ProfileStats from '../ProfileStats';
import GameHistoryList from '../GameHistoryList';
import Tabs from '../Tabs/Tabs';
import Tab from '../Tabs/Tab';

import './ProfileWindow.css';

const ProfileWindow = ({ onClose = () => {}, isOpen = false, targetId, username = '', avatarUrl = '', height = '625px', width = '900px' }) => {

    useEffect(() => {
    }, []);

    return (
        <BaseWindow
            onClose={onClose}
            isOpen={isOpen}
            title={username}
            height={height}
            width={width}
            className='profile'
        >
            <div className={`row content`}>
                <div className={`col preview`}>
                    <div className={`avatar`} style={{backgroundImage: `url("${avatarUrl}")`}} >
                    </div>
                </div>
                <div className={`col action`}>
                    <Tabs >
                        <Tab name='History' icon='clock-history' >
                            <div className={`history`} >
                                <GameHistoryList
                                    targetId={targetId}
                                />
                            </div>
                        </Tab>
                        <Tab name='Statistics' icon='bar-chart-fill' >
                            <div className={`statistics`}>
                                <ProfileStats
                                    targetId={targetId}
                                />
                            </div>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        </BaseWindow>
    );
}

export default ProfileWindow;
