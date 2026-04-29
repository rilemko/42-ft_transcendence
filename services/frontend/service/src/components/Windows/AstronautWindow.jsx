import React from 'react';

import BaseWindow from './BaseWindow';
import AstronautForm from '../Forms/AstronautForm';
import AvatarForm from '../Forms/AvatarForm'
import AstronautScene from '../../scenes/AstronautScene';
import Tab from '../Tabs/Tab';
import Tabs from '../Tabs/Tabs';

import './AstronautWindow.css';

const AstronautWindow = ({ onClose = () => {}, isOpen = false, title = 'Customization', height = '625px', width = '900px' }) => {

    return (
        <BaseWindow
            onClose={onClose}
            isOpen={isOpen}
            title={title}
            height={height}
            width={width}
            className='astronaut'
        >
            <div className={`row content`}>
                <div className={`col preview`}>
                    <AstronautScene />
                </div>
                <div className={`col action`}>
                    <Tabs>
                        <Tab name='Colors' icon='droplet-half' >
                            <AstronautForm />
                        </Tab>
                        <Tab name='Avatar' icon='image' >
                            <AvatarForm />
                        </Tab>
                    </Tabs>
                </div>
            </div>
        </BaseWindow>
    );
}

export default AstronautWindow;
