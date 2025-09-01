import React, { useState } from 'react';

import Loader from '../components/Loader';
import SpaceBackground from '../components/SpaceBackground';
import './Loading.css'

const Loading = () => {

	return (
        <div className={`page`} id={`page-loading`}>
            <Loader size='128px'/>
        </div>
	);
}

export default Loading
