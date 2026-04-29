import React, { useState } from 'react';

import BaseButton from '../components/Buttons/BaseButton';
import LinkButton from '../components/Buttons/LinkButton';
import LoginWindow from '../components/Windows/LoginWindow';
import SpaceBackground from '../components/SpaceBackground';
import Typewriter from '../components/Typewriter';

import './Index.css'

const Index = () => {
    const [loginWindowState, setLoginWindowState] = useState(false);

    const authorizeURL = new URL("https://api.intra.42.fr/oauth/authorize");
	authorizeURL.searchParams.append("client_id", `${import.meta.env.VITE_API_42_PUBLIC_KEY}`)
	authorizeURL.searchParams.append("redirect_uri", `https://${window.location.host}/api/auth/callback/42/`)
	authorizeURL.searchParams.append("response_type", "code")

	return (
        <div className={`page`} id={`page-index`}>
            <SpaceBackground />
            <section className={`view`}>
                <LoginWindow onClose={() => setLoginWindowState(false)} isOpen={loginWindowState} />
                <div className={`wrapper`}>
                    <Typewriter text='ft_transcendence' />
                    <nav>
                        <BaseButton onClick={() => setLoginWindowState(true)} text='JOIN THE GAME' className='space' />
                        <LinkButton route={authorizeURL} text='LOGIN WITH 42' className='space' />
                    </nav>
                </div>
            </section>
        </div>
	);
}

export default Index
