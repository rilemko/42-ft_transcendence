import React, { useState } from 'react';

import './Tabs.css'

const Tabs = ({ index = 0, destructive = true, children }) => {
    const [activeTab, setActiveTab] = useState(children[index].props.name);

    const handleTabChange = (name) => {
        setActiveTab(name);
    };

    return (
        <div className={`tabs`} >
            <header>
                {children.map((child) => (
                    <button
                        key={child.props.name}
                        className={`${child.props.name === activeTab ? 'active' : ''}`}
                        onClick={ (event) => { if (child.props.onClick) child.props.onClick(event); handleTabChange(child.props.name) }}
                        type='button'
                        disabled={child.props.disabled || false}
                    >
                        {child.props.icon &&
                            <i className={`bi bi-${child.props.icon}`} ></i>
                        }
                        <span className={`text`} >
                        {child.props.name}
                        </span>
                    </button>
                ))}
            </header>
            <div className={`content`}>
                {children.map((child) =>
                    destructive ? (
                        child.props.name === activeTab ? (
                            <div
                                key={child.props.name}
                                className={`tab ${child.props.name === activeTab ? 'active' : ''}`}
                            >
                                {child}
                            </div>
                        ) : null
                    ) : (
                        <div
                            key={child.props.name}
                            className={`tab ${child.props.name === activeTab ? 'active' : ''}`}
                        >
                            {child}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export default Tabs;
