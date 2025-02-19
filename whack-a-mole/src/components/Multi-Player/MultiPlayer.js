import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import axios from "axios";
const socket = io("http://localhost:4000");

function Multiplayer() {
  let navigate = useNavigate();
  let { currentUser } = useSelector((state) => state.userLogin);
  const username = currentUser?.username;

  const [moleIndex, setMoleIndex] = useState(null);
  const [score, setScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameId, setGameId] = useState(null);
  const [role, setRole] = useState(null);
  const [winner, setWinner] = useState(null);
  const [opponentName, setOpponentName] = useState("");
  const [countdown, setCountdown] = useState(null);
    useEffect(() => {
      if (isGameOver) {
        const updateScore = async () => {
          try {
            let userObj={
              user:currentUser,
              score:score
            }
  
            await axios.post("whack-a-mole-hu94.vercel.app/user-api/update-score", userObj);
          } catch (error) {
            console.error("Error updating score:", error);
          }
        };
        updateScore();
      }
    }, [isGameOver, score]);
  useEffect(() => {
    if (!username) {
      navigate("/");
      return;
    }

    socket.emit("joinGame", { username });

    socket.on("gameFound", ({ gameId, role, opponent }) => {
      setGameId(gameId);
      setRole(role);
      setOpponentName(opponent);
      setTimeLeft(30); // Reset timeLeft when a new game is found
    });

    socket.on("countdown", ({ countdown }) => {
      setCountdown(countdown);
    });

    socket.on("moleUpdated", ({ moleIndex }) => {
      setMoleIndex(moleIndex);
    });

    socket.on("scoreUpdated", ({ player, score }) => {
      if (player === role) {
        setScore(score);
      } else {
        setOpponentScore(score);
      }
    });

    socket.on("timeUpdated", ({ timeLeft }) => {
      setTimeLeft(timeLeft); // Update timeLeft from the server
    });

    socket.on("gameOver", ({ winner }) => {
      setWinner(winner);
      setIsGameOver(true);
    });

    return () => {
      socket.off("gameFound");
      socket.off("countdown");
      socket.off("moleUpdated");
      socket.off("scoreUpdated");
      socket.off("timeUpdated");
      socket.off("gameOver");
    };
  }, [username, navigate, role]);

  const handleClick = (index) => {
    if (index === moleIndex && !isGameOver) {
      socket.emit("score", { gameId, playerRole: role });
    }
  };

  return (
    <div className="text-center mt-3">
      <h2 className="text-light">Multiplayer Whack-a-Mole</h2>

      {gameId ? (
        <>
          {countdown !== null && (
            <h3 className="text-light">
              {countdown === "Start!" ? "Go!" : countdown}
            </h3>
          )}
          <h4 className="text-light">Time Left: {timeLeft}s</h4>
          <h4 className="text-light">You ({username}): {score}</h4>
          <h4 className="text-light">Opponent ({opponentName}): {opponentScore}</h4>

          <div className="d-flex flex-column align-items-center">
            {[0, 1, 2].map((row) => (
              <div key={row} className="d-flex">
                {[0, 1, 2].map((col) => {
                  const index = row * 3 + col;
                  return (
                    <div
                      key={index}
                      className={`card m-2 ${index === moleIndex ? "bg-danger" : "bg-warning"}`}
                      style={{ height: 50, width: 50, cursor: isGameOver ? "not-allowed" : "pointer" }}
                      onClick={() => handleClick(index)}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      ) : (
        <h4 className="text-light">Waiting for an opponent...</h4>
      )}

      <Modal show={isGameOver} centered>
        <Modal.Header>
          <Modal.Title>Game Over!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {winner === username ? "🎉 You won!" : winner === "It's a tie!" ? "🤝 It's a tie!" : `😢 You lost! ${winner} won.`}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => window.location.reload()}>Play Again</Button>
          <Button variant="primary" onClick={() => navigate("/game")}>Exit</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Multiplayer;