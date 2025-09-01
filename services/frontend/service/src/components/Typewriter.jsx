import React from 'react';

import './Typewriter.css';

const Typewriter = ({ text }) => {

    return (
        <div id={`typewriter`} >
        {text.split("").map((letter, index) => (
            <span key={index} className={`letter`} style={{ animationDelay: `${index * 0.1}s` }} >
                {letter}
            </span>
        ))}
        </div>
    );
};

export default Typewriter;
