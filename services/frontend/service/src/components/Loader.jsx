import React from 'react';

import './Loader.css'

const Loader = ({size = '24px'}) => {
    return (
        <span className={`loader`} style={{width: size, height: size}}></span>
    );
}

export default Loader;
