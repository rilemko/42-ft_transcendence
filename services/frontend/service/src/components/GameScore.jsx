import React from 'react';

import './GameScore.css';

const GameScore = ({ players = [], score = [0, 0] }) => {
    return (
        <div className={`game-score row`} >
            <div className={`player one row`} >
                <div className={`avatar`} style={{backgroundImage: `url("${players[0]?.info.profile_picture_url}")` }} ></div>
                <div className={`info`} >
                    <p className={`sub`} >{players[0]?.nickname || '...'}</p>
                    <p className={`main`} >{score[0]}</p>
                </div>
            </div>
            <div className={`player two row`} >
                <div className={`info`} >
                    <p className={`sub`} >{players[1]?.nickname || '...'}</p>
                    <p className={`main`} >{score[1]}</p>
                </div>
                <div className={`avatar`} style={{backgroundImage: `url("${players[1]?.info.profile_picture_url}")` }} ></div>
            </div>
        </div>
    );
}

export default GameScore;
