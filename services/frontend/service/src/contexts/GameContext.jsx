import React, { createContext, useContext, useState } from 'react';

import { useToast } from '../contexts/ToastContext';
import { UserContext } from './UserContext';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [gameId, setGameId] = useState(0);
    const [listId, setListId] = useState([]);
    const [tournamentId, setTournamentId] = useState(0);

    const [isStarted, setIsStarted] = useState(false);

    const [playerIndex, setPlayerIndex] = useState(1);

    const [cameraPosition, setCameraPosition] = useState([0, 0, 0]);

    const [ballPosition, setBallPosition] = useState([0, 0.6, 0]);
    const [playerOnePosition, setPlayerOnePosition] = useState([0, -1, -20.2]);
    const [playerTwoPosition, setPlayerTwoPosition] = useState([0, -1, +20.2]);

    const [players, setPlayers] = useState({});

    const [lCommand, setLCommand] = useState('l');
    const [rCommand, setRCommand] = useState('r');

    const [score, setScore] = useState([0, 0]);

    const [ballColor, setBallColor] = useState('#e48d2d');
    const [wallColor, setWallColor] = useState('#e48d2d');
    const [floorColor, setFloorColor] = useState('#ffffff');
    const [paddleColor, setPaddleColor] = useState('#ffffff');

    const { userId } = useContext(UserContext);

    const { addToast } = useToast();

    const fetchGameData = async (gameId) => {
        try {
            const response = await fetch(`/api/game/game-details/${gameId}/`, {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                const json = await response.json();
                if (json?.success == true) {
                    setGameId(gameId);
                    setTournamentId(json.game.tournament_id);
                    const index = json.game.players.findIndex(player => player.user_id === userId);
                    setPlayerIndex(index);
                    setCameraPosition(index == 0 ? [0, 10, -40] : [0, 10, +40]);
                    setPlayers(json.game.players);
                    setLCommand(index == 0 ? 'l' : 'r');
                    setRCommand(index == 0 ? 'r' : 'l');
                    setFloorColor(json.game.color_board);
                    setWallColor(json.game.color_wall);
                    setBallColor(json.game.color_ball);
                    setPaddleColor(json.game.color_paddle);
                }
            } else {
                addToast('Failed to fetch game data.', 'failure', 5000);
                clear();
            }
        } catch (error) {
            addToast('Failed to fetch game data.', 'failure', 5000);
            clear();
        }
    };

    const update = async () => {
        fetchGameData(gameId);
    }

    const join = (gameId, listId) => {
        setIsLoading(true);
        setGameId(0);
        setListId(listId.filter(id => id !== gameId));
        setTournamentId(0);
        setIsStarted(false);
        setScore([0, 0]);
        setBallPosition([0, 0.6, 0]);
        setPlayerOnePosition([0, -1, -20.2]);
        setPlayerTwoPosition([0, -1, +20.2]);
        setPlayers({});
        setLCommand('l');
        setRCommand('r');
        setScore([0, 0]);
        setFloorColor('#ffffff');
        setWallColor('#ffffff');
        setBallColor('#ffffff');
        setPaddleColor('#ffffff');
        fetchGameData(gameId);
        setIsLoading(false);
    };

    const clear = async () => {
        setGameId(0);
        setListId([]);
        setTournamentId(0);
        setIsStarted(false);
        setPlayerIndex(1);
        setCameraPosition([0, 0, 0]);
        setBallPosition([0, 0.6, 0]);
        setPlayerOnePosition([0, -1, -20.2]);
        setPlayerTwoPosition([0, -1, +20.2]);
        setPlayers({});
        setLCommand('l');
        setRCommand('r');
        setScore([0, 0]);
        setFloorColor('#ffffff');
        setWallColor('#ffffff');
        setBallColor('#ffffff');
        setPaddleColor('#ffffff');
    };

    return (
        <GameContext.Provider value={{
            isLoading, setIsLoading,
            gameId, setGameId,
            listId, setListId,
            tournamentId, setTournamentId,

            isStarted, setIsStarted,

            playerIndex, setPlayerIndex,

            players, setPlayers,

            lCommand, setLCommand,
            rCommand, setRCommand,

            score, setScore,

            cameraPosition, setCameraPosition,
            ballPosition, setBallPosition,
            playerOnePosition, setPlayerOnePosition,
            playerTwoPosition, setPlayerTwoPosition,

            ballColor, setBallColor,
            wallColor, setWallColor,
            floorColor, setFloorColor,
            paddleColor, setPaddleColor,

            join, update, clear
        }} >
            {children}
        </GameContext.Provider>
    );
};
