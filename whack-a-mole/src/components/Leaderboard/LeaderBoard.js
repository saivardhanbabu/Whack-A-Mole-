import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux'; // Import useSelector
import './LeaderBoard.css'
function LeaderBoard() {
    const [users, setUsers] = useState([]);

    // Get the current user from Redux store
    let { currentUser } = useSelector((state) => state.userLogin);
    const username = currentUser?.username;

    useEffect(() => {
        async function getLeaderBoard() {
            try {
                const res = await axios.get("https://whack-a-mole-server-zyja.onrender.com/user-api/get-leaderboard");
                setUsers(res.data.payload);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            }
        }
        getLeaderBoard();
    }, []);

    return (
        <div className="container mt-4">
            <h2 className="text-center text-light">Leaderboard</h2>
            <table className="table table-dark table-striped text-center">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Username</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr 
                            key={index} 
                            className={user.username === username ? 'table-warning' : ''}
                        >
                            <td>{index + 1}</td>
                            <td>{user.username}</td>
                            <td>{user.score}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default LeaderBoard;