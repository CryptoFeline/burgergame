import React from 'react';
import titleSvg from '../img/title.svg';

const Preloader = ({ progress, isLoading }) => {
    if (!isLoading) return null;

    return (
        <div className="preloader">
            <div className="preloader-content">
                {/* Title SVG logo */}
                <div className="preloader-logo">
                    <img 
                        src={titleSvg} 
                        alt="Burger Builder" 
                        className="title-logo"
                    />
                </div>

                {/* Progress bar */}
                <div className="progress-container">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="progress-text">{Math.round(progress)}%</div>
                </div>
                
                {/* Loading subtext */}
                <div className="loading-tips">
                    <p>Cooking the ingredients...</p>
                </div>
            </div>
        </div>
    );
};

export default Preloader;
