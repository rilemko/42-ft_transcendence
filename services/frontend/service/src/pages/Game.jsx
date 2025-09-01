import React, { useContext, useEffect, useState } from 'react';

import { GameContext } from '../contexts/GameContext';

import Gameplay from '../components/Gameplay';
import GameScore from '../components/GameScore';
import MatchList from '../components/MatchList';
import SpaceBackground from '../components/SpaceBackground';


import './Game.css';

const Game = () => {
	const [showOverviewState, setShowOverviewState] = useState(false);

	const { tournamentId, isStarted, players, score } = useContext(GameContext);

	useEffect(() => {

		const handleKeyDown = (event) => {
			if (event.key.toLowerCase() === 's') {
				setShowOverviewState((prev) => !prev);
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, []);

	return (
		<div className={`page`} id={`page-game`} >
			<SpaceBackground />
			<section className={`view`} >
				<Gameplay />
				<div className='info col'>
					<div className='score'>
						<GameScore
							players={players}
							score={score}
						/>
					</div>
					{((tournamentId > 0 && !isStarted) || showOverviewState) && (
						<div className='overview' >
							<MatchList tournamentId={tournamentId} />
						</div>
					)}
				</div>
			</section>
		</div>
	);
};

export default Game;

