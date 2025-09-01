import React from 'react';

import './SpaceBackground.css';

const SpaceBackground = React.memo(() => {

	const generateStarStyles = (n) => {
		return Array.from({ length: n }, () => ({
			top: `${Math.random() * 100}vh`,
			left: `${Math.random() * 100}vw`,
			animationDuration: `${Math.random() * 10 + 5}s`,
		}));
	};

	const generateStars = () => {
		return generateStarStyles(400).map((style, index) => (
			<div key={index} className={`star`} style={style}></div>
		));
	};

	return (
		<div id={`space-background`}>
			{generateStars()}
		</div>
	);
});

export default SpaceBackground;
