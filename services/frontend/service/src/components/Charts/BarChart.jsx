import React from 'react';

import './BarChart.css';

const BarChart = ({ data = {} }) => {

    return (
        <div className={`barchart row`}>
            <div className={`chart`} >
                {
                    Object.keys(data).map((segment) => {
                        return (
                            <div
                                className={`bar`}
                                style={{backgroundColor: data[segment].color, height: `${data[segment].value}%`}}
                            >
                            </div>
                        )
                    })
                }
            </div>
            <div className='data col' >
                {Object.keys(data).map((segment) => {
                    return (
                        <div className='row'>
                            <p>{data[segment].name} ({data[segment].value}%)</p>
                            <div
                                className='indicator'
                                style={{backgroundColor: data[segment].color}}
                            >
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

export default BarChart;
