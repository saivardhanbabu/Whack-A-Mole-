import { Outlet } from "react-router-dom";
import Header from './components/header/Header';
import { MusicButton } from "./components/music/MusicPlayer";

function RootLayout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      <div 
        style={{ 
          flexGrow: 1,  // Takes remaining space after header
          backgroundImage: "url('https://images.unsplash.com/photo-1631896928983-2c94ea6f97e8?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div className="container-fluid">
          <Outlet />
          <MusicButton/>
        </div>
      </div>
    </div>
  );
}

export default RootLayout;
