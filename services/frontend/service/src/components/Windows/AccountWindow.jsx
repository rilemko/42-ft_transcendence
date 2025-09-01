import React from 'react';

import BaseWindow from './BaseWindow';
import DeleteAccoutButton from '../Buttons/DeleteAccoutButton';
import SecurityForm from '../Forms/SecurityForm';
import ProfileForm from '../Forms/ProfileForm';
import TwoFactorUpdateForm from '../Forms/TwoFactorUpdateForm';
import Tab from '../Tabs/Tab';
import Tabs from '../Tabs/Tabs';

import './AccountWindow.css';

const AccountWindow = ({ onClose = () => {}, isOpen = false, title = 'Account', height = '635px', width = '500px' }) => {

    return (
        <BaseWindow
            onClose={onClose}
            isOpen={isOpen}
            title={title}
            height={height}
            width={width}
            className='account'
        >
            <Tabs>
                <Tab name='Profile' icon='person-fill' >
                    <ProfileForm />
                </Tab>
                <Tab name='Password' icon='shield-lock-fill' >
                    <div className='col' >
                        <SecurityForm />
                    </div>
                </Tab>
                <Tab name='Security' icon='shield-shaded' >
                    <div className='col' >
                        <TwoFactorUpdateForm />
                        <DeleteAccoutButton />
                    </div>
                </Tab>
            </Tabs>
        </BaseWindow>
    );
}

export default AccountWindow;
