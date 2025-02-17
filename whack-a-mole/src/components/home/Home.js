import "./Home.css";

function Home() {
  return (
    <div className="container-fluid home-container">
      <h1 className="text-center text-light cinematic-text">
        {"Welcome To The World of Whack-a-Mole".split("").map((char, index) => (
          <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>
      <h2 className="text-center text-light">How to Play?</h2>
      <p className="text-center text-light">To play Whack-a-Mole, you use a mallet to hit plastic moles that randomly pop up from holes on a flat surface, aiming to hit as many as possible before they disappear back into their holes; the faster you react, the higher your score will be. 
Key points about Whack-a-Mole:
Objective:
Hit the moles that pop up from holes with the mallet as quickly as possible. 
Gameplay:
When a mole appears, quickly strike it with the mallet to score a point. 
Speed matters:
The game challenges your reaction time, as the moles pop up randomly and disappear quickly. 
Scoring:
Typically, each successful hit earns you a point, and the player with the highest score wins. </p>
    </div>
  );
}

export default Home;
