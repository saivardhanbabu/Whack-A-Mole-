import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function TwoPlayer() {
  let navigate=useNavigate();
  const [moleIndex, setMoleIndex] = useState(null);
  const [mole,setMole]=useState(null);
  const [score, setScore] = useState(0);
  const [sc,setSc]=useState(0)
  const [timeLeft, setTimeLeft] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  function navGame(){
    navigate("/game")
  }
  // Function to randomly place the mole
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const interval = setInterval(() => {
        setMoleIndex(Math.floor(Math.random() * 9));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const interval = setInterval(() => {
        setMole(Math.floor(Math.random() * 9));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeLeft]);

  // Countdown Timer
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setIsGameOver(true);
    }
  }, [timeLeft]);

  // Handle clicking on a box
  const handleClick = (index) => {
    if (index === moleIndex) {
      setScore(score + 1);
    }
  };
  const handleClick1 = (index) => {
    if (index === mole) {
      setSc(sc + 1);
    }
  };

  // Start game when user selects time
  const startGame = (time) => {
    setSelectedTime(time);
    setTimeLeft(time);
    setScore(0);
    setIsGameOver(false);
  };

  // Restart game
  const restartGame = () => {
    setSelectedTime(null);
    setTimeLeft(null);
    setScore(0);
    setIsGameOver(false);
  };

  return (
    <div className="text-center mt-3">
      <h2 className="text-light">Whack-a-Mole</h2>

      {/* Time Selection */}
      {!selectedTime && (
        <div className="mt-3">
          <h4 className="text-light">Select Game Duration:</h4>
          <Button variant="primary" className="m-2" onClick={() => startGame(30)}>30s</Button>
          <Button variant="success" className="m-2" onClick={() => startGame(60)}>60s</Button>
          <Button variant="danger" className="m-2" onClick={() => startGame(120)}>120s</Button>
        </div>
      )}

      {/* Game Info */}
      {selectedTime && (
        <>
          <h4 className="text-light">Time Left: {timeLeft}s</h4>
        <span className='d-flex justify-content-center gap-5'>
          {/* Grid for Whack-a-Mole */}
          <div className="d-flex flex-column align-items-center">
          <h4 className="text-light">Score: {score}</h4>
            {[0, 1, 2].map((row) => (
              <div key={row} className="d-flex">
                {[0, 1, 2].map((col) => {
                  const index = row * 3 + col;
                  return (
                    <div
                      key={index}
                      className={`card m-2 ${index === moleIndex ? 'bg-danger' : 'bg-warning'}`}
                      style={{ height: 50, width: 50, cursor: 'pointer' }}
                      onClick={() => handleClick(index)}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="d-flex flex-column align-items-center">
          <h4 className="text-light">Score: {sc}</h4>
            {[0, 1, 2].map((row) => (
              <div key={row} className="d-flex">
                {[0, 1, 2].map((col) => {
                  const index = row * 3 + col;
                  return (
                    <div
                      key={index}
                      className={`card m-2 ${index === mole ? 'bg-danger' : 'bg-warning'}`}
                      style={{ height: 50, width: 50, cursor: 'pointer' }}
                      onClick={() => handleClick1(index)}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
          </span>
        </>
      )}

      {/* Game Over Modal */}
      <Modal show={isGameOver} centered>
        <Modal.Header>
          <Modal.Title>Game Over!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Your Score: {score}</h4>
          <p>Time's up! Want to play again?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={restartGame}>
            Play Again
          </Button>
          <Button variant='primary' onClick={navGame}>Go to Dashboard</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default TwoPlayer;
