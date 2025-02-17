import React from 'react';
import { useNavigate } from 'react-router-dom';

function GameDashboard() {
    let navigate = useNavigate();

    function navSingle() {
        navigate("/single-player");
    }

    function navBoard() {
        navigate("/leader-board");
    }

    function nav() {
        navigate("/multi-player");
    }

    return (
        <div className="container justify-content-center">
            <div className="row justify-content-center">
                <div className="col-lg-4 col-md-6 col-sm-8">
                    <div className="card text-center p-4">
                    <h2 className="text-light mb-4">Whack-a-Mole</h2>
                        <div className="card-body">
                            <div className="d-flex gap-2">
                                <button onClick={navSingle} className="btn text-light">Single Player</button>
                                <button onClick={nav} className="btn text-light">Multi Player</button>
                                <button onClick={navBoard} className="btn text-light">Leader Board</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GameDashboard;
