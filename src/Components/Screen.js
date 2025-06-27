import React from "react";
import titleSvg from "../img/title.svg";

const BurgerGameTitle = () => (
    <img 
        src={titleSvg} 
        alt="Burger Stack" 
        className="burger-title"
        width="300"
        height="80"
    />
);

const Screen = ({ score, startGame, isGameOver = false, telegramUser = null, isTelegramEnvironment = false }) => {
    return (
        <>
            <div className="screen">
                {score > 0 || isGameOver ? (
                    <>
                        <BurgerGameTitle />
                        <h2 className="game-over-text">GAME OVER</h2>
                        {telegramUser && (
                            <p className="telegram-user">
                                👋 Hey {telegramUser.first_name}!
                            </p>
                        )}
                        <div className="final-score-section">
                            <h4 className="final-score-label">FINAL SCORE</h4>
                            <h3 className="final-score-value">{score}</h3>
                            {isTelegramEnvironment && score > 0 && (
                                <p className="telegram-status">🏆 Score automatically saved!</p>
                            )}
                        </div>
                        
                        <div className="game-over-buttons">
                            <button className="play-again-btn" onClick={() => startGame()}>
                                🎮 Play Again
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <BurgerGameTitle />
                        <p className="subtitle">Stack burgers like a boss! 🍔</p>
                        {telegramUser && (
                            <p className="telegram-welcome">
                                Welcome, {telegramUser.first_name}! 
                            </p>
                        )}
                        <button className="start-btn" onClick={() => startGame()}>
                            🎮 START GAME
                        </button>
                        {process.env.NODE_ENV === 'development' && (
                            <div className="dev-info">
                                {isTelegramEnvironment ? (
                                    <p className="debug-info">🤖 Telegram Mode</p>
                                ) : (
                                    <p className="debug-info">🔧 Local Dev Mode</p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default Screen;
