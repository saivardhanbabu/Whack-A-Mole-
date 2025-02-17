import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useSelector } from "react-redux";
import Signup from "./components/signup/Signup";
import Home from "./components/home/Home";
import Login from "./components/login/Login";
import RootLayout from "./RootLayout";
import { MusicProvider, MusicButton } from "./components/music/MusicPlayer";
import GameDashboard from "./components/Game-Dashboard/GameDashboard";
import SinglePlayer from "./components/Single-player/SinglePlayer";
import TwoPlayer from "./components/Two-Player/TwoPlayer";
import Multiplayer from "./components/Multi-Player/MultiPlayer";
import LeaderBoard from "./components/Leaderboard/LeaderBoard";

function App() {
  let { currentUser } = useSelector((state) => state.userLogin);

  const browserRouter = createBrowserRouter([
    {
      path: "",
      element: <RootLayout />,
      children: [
        { path: "", element: <Home /> },
        { path: "/signup", element: <Signup /> },
        { path: "/signin", element: <Login /> },
        {path:'/game',element:<GameDashboard/>},
        {path:'/single-player',element:<SinglePlayer/>},
        {path:'/multi-player',element:<Multiplayer/>},
        {path:'/leader-board',element:<LeaderBoard/>}
      ],
    },
  ]);

  return (
    <MusicProvider>
      <RouterProvider router={browserRouter} />
    </MusicProvider>
  );
}

export default App;
