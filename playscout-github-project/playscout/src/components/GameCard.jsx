import { ArrowUpRight, Play, Sparkles } from "lucide-react";

export default function GameCard({ game, onOpen }) {
  return (
    <button className="game-card" onClick={() => onOpen(game)} aria-label={`View ${game.title}`}>
      <div className="cover-wrap">
        {game.cover_url ? <img src={game.cover_url} alt={`${game.title} game cover`} loading="lazy" /> : <div className="cover-fallback">PLAY</div>}
        <span className="card-play"><Play size={17} fill="currentColor" /></span>
        {game.is_new && <span className="corner-tag"><Sparkles size={11}/> NEW</span>}
      </div>
      <div className="game-card-meta">
        <div><h3>{game.title}</h3><p>{game.category}</p></div>
        <ArrowUpRight size={17} className="card-arrow"/>
      </div>
    </button>
  );
}
