import React from 'react';

const Preloader = ({ progress, isLoading }) => {
    if (!isLoading) return null;

    return (
        <div className="preloader">
            <div className="preloader-content">
                {/* Burger icon made with CSS */}
                <div className="burger-icon">
                    <div className="bun-top"></div>
                    <div className="lettuce"></div>
                    <div className="patty"></div>
                    <div className="cheese"></div>
                    <div className="bun-bottom"></div>
                </div>
                
                <h2 className="loading-title">Cooking Ingredients</h2>
                
                <div className="progress-container">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="progress-text">{Math.round(progress)}%</div>
                </div>
                
                <div className="loading-tips">
                    <p>Be patient while we cook your ingredients!</p>
                </div>
            </div>
        </div>
    );
};

export default Preloader;
