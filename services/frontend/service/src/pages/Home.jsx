import React, { useState } from 'react';

import BurgerMenu from '../components/BurgerMenu';
import GamesList from '../components/GamesList';
import SpaceshipScene from '../scenes/SpaceshipScene';

import './Home.css'

const Home = () => {
    const [showSpaceshipScene, setShowSpaceshipScene] = useState(true);

	return (
        <div className={`page`} id={`page-home`}>
            {showSpaceshipScene ? (
                <SpaceshipScene onFinish={() => setShowSpaceshipScene(false)} />
            ) : (
                <section className={`view`}>
                    <BurgerMenu />
                    <div className={`games`} >
                        <GamesList />
                    </div>
                </section>
            )}
        </div>
	);
}

export default Home
