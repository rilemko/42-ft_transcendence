import React, { useContext, useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GameContext } from '../contexts/GameContext';
import { useToast } from '../contexts/ToastContext';

import Loader from './Loader';
import BaseButton from './Buttons/BaseButton';
import GameScene from '../scenes/GameScene';

import './Gameplay.css';

const Gameplay = () => {
	const [hasFocus, setHasFocus] = useState(true);

	const { addToast } = useToast();
	const { gameId, listId, isStarted, setIsStarted, setBallPosition, setPlayerOnePosition, setPlayerTwoPosition, lCommand, rCommand, setScore, update, join, clear } = useContext(GameContext);

	const socketRef = useRef(null);
	const currentKeyPressedRef = useRef(null);
	const navigate = useNavigate();

	const send = (direction) => {
		if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
			socketRef.current.send(`{"event": "on_move", "data": { "direction": "${direction}"}}`);
		}
	};

	useEffect(() => {
		const handleKeyDown = (event) => {
			if (!currentKeyPressedRef.current) {
				currentKeyPressedRef.current = event.key;
				if (event.key === 'ArrowLeft') send(lCommand);
				else if (event.key === 'ArrowRight') send(rCommand);
			}
		};

		const handleKeyUp = (event) => {
			if (currentKeyPressedRef.current === event.key) {
				currentKeyPressedRef.current = null;
				if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') send('off');
			}
		};

		const handleBlur = () => {
			setHasFocus(false);
			currentKeyPressedRef.current = null;
		};

		const handleFocus = () => {
			setHasFocus(true);
		};

		window.addEventListener('focus', handleFocus);
		window.addEventListener('blur', handleBlur);
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		return () => {
			window.removeEventListener('blur', handleBlur);
			window.removeEventListener('focus', handleFocus);
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, [lCommand, rCommand, hasFocus]);

	useEffect(() => {

		if (gameId == 0) return;

		const socket = new WebSocket(`/wss/game/${gameId}/`);
		socketRef.current = socket;

		socket.onopen = () => {
			//addToast('Connected.', 'success', 3000);
		};

		const normalize = (value, offset) => value / 9.9 + offset;

		socket.onmessage = (event) => {

			const data = JSON.parse(event.data);

			switch (data.event) {
				case 'on_move':
					const ballPosition = data.data.b;
					const ballX = normalize(ballPosition[1], -15.2) + 0.5;
					const ballZ = normalize(ballPosition[0], -20.2) + 0.5;
					setBallPosition([ballX, 0.6, ballZ]);
					const playerOneX = normalize(data.data['1'][1], -15) + 3.5;
					setPlayerOnePosition([playerOneX, -1, -20.2]);
					const playerTwoX = normalize(data.data['2'][1], -15) + 3.5;
					setPlayerTwoPosition([playerTwoX, -1, 20.2]);
					break;
				case 'on_score':
					const scores = data.data.s;
					setScore([scores[0], scores[1]]);
					break;
				case 'on_wait':
					setIsStarted(false);
					break;
				case 'on_ready':
					setIsStarted(true);
					break;
				case 'on_finish':
					setIsStarted(false);
					if (socket.readyState === WebSocket.OPEN) {
						socket.close();
					}
					if (listId && listId.length > 0) {
						join(listId[0], listId);
					} else {
						clear();
						navigate('/home');
					}
					break;
				case 'on_abandon':
					setIsStarted(false);
					if (socket.readyState === WebSocket.OPEN) {
						socket.close();
					}
					clear();
					addToast('The game has been abandoned.', 'failure', 3000);
					navigate('/home');
					break;
				case 'on_join':
					addToast(`${data.data.nickname} joined the game.`, 'info', 3000);
					update();
					break;
				case 'on_connect':
					addToast('Connected.', 'success', 3000);
					break;
				case 'on_left':
					addToast(`${data.data.nickname} left the game.`, 'info', 3000);
					update();
					break;
			}

			/*switch (data.game_data.status) {
				case 'playing':
					const playerPositions = data.game_data.player_positions;
					if (playerPositions) {
						const ballPosition = data.game_data.ball_position;
						const dscore = data.game_data.scores;
						const ballX = normalize(ballPosition[1], -15.2) + 0.5;
						const ballZ = normalize(ballPosition[0], -20.2) + 0.5;
						setBallPosition([ballX, 0.6, ballZ]);
						const playerOneX = normalize(playerPositions['1'][1], -15) + 3.5;
						setPlayerOnePosition([playerOneX, -1, -20.2]);
						const playerTwoX = normalize(playerPositions['2'][1], -15) + 3.5;
						setPlayerTwoPosition([playerTwoX, -1, 20.2]);
						setScore([dscore['1'], dscore['2']]);
					}
					break;
				case 'ready_to_play':
					if (!isStarted) {
						update();
						setIsStarted(true);
					}
					break;
				case 'finished':
					socket.close();
					if (listId && listId.length > 0) {
						setIsStarted(false);
						join(listId[0], listId);
					} else {
						clear();
						navigate('/home');
					}
					break;
				case 'abandoned':
					socket.close();
					clear();
					addToast('The game was abandoned by a player.', 'failure', 5000);
					navigate('/home');
					break;
			}*/
		};

		socket.onerror = (error) => {
			addToast('Connection lost.', 'failure', 3000);
			clear();
			navigate('/home');
		};

		return () => {
			if (socketRef.current) {
				if (socketRef.current.readyState === WebSocket.OPEN) {
					socketRef.current.close();
				}
			}
		};
	}, [gameId]);

	return (
		<div className={`gameplay`} >
			{!isStarted &&
				<div className={`loading`} >
					<Loader size='128px' />
					<p>Waiting for players...</p>
				</div>
			}
			<div className="game">
				<GameScene />
			</div>
			<div className="controls row">
				<div className="col">
					<BaseButton
						onTouchStart={() => send(lCommand)}
						onTouchEnd={() => send('off')}
						className='secondary round'
						icon='arrow-left'
					/>
				</div>
				<div className="col">
					<BaseButton
						onTouchStart={() => send(rCommand)}
						onTouchEnd={() => send('off')}
						className='secondary round'
						icon='arrow-right'
					/>
				</div>
			</div>
		</div>
	);
};

export default Gameplay;

