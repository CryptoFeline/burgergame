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

const Screen = ({ score, startGame, isGameOver = false }) => {
    return (
        <>
            <div className="screen">
                {score > 0 || isGameOver ? (
                    <>
                        <BurgerGameTitle />
                        <h2 className="game-over-text">GAME OVER</h2>
                        <div className="final-score-section">
                            <h4 className="final-score-label">FINAL SCORE</h4>
                            <h3 className="final-score-value">{score}</h3>
                        </div>
                        <button className="play-again-btn" onClick={() => startGame()}>
                            Play Again
                        </button>
                    </>
                ) : (
                    <>
                        <BurgerGameTitle />
                        <p className="subtitle">Stack burgers like a boss!</p>
                        <button className="start-btn" onClick={() => startGame()}>
                            START GAME
                        </button>
                    </>
                )}
            </div>
        </>
    );
};

export default Screen;
