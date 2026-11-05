import { useState } from "react";
import { ArrowUpRight, Gamepad2, X, ExternalLink, Maximize2 } from "lucide-react";

export default function GameModal({ game, onClose }) {
  const [playing, setPlaying] = useState(false);
  if (!game) return null;
  const canEmbed = (game.play_mode === "embed" || game.play_mode === "both") && game.embed_url;
  const openExternal = () => window.open(game.game_url, "_blank", "noopener,noreferrer");

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="game-modal" onMouseDown={e => e.stopPropagation()}>
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close"><X/></button>
        <div className="modal-cover">
          {game.cover_url && <img src={game.cover_url} alt="" />}
          <div className="modal-cover-shade"/>
          <div className="modal-cover-title"><span className="eyebrow">{game.category}</span><h2>{game.title}</h2></div>
        </div>
        <div className="modal-content">
          <p className="modal-description">{game.description}</p>
          <div className="instruction-box"><strong><Gamepad2 size={16}/> How to play</strong><p>{game.instructions || "Follow the on-screen instructions to get started."}</p></div>
          {playing && canEmbed ? (
            <div className="game-frame-wrap">
              <iframe src={game.embed_url} title={game.title} allow="fullscreen; gamepad; autoplay" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>
            </div>
          ) : (
            <div className="modal-actions">
              {canEmbed && <button className="primary-button" onClick={() => setPlaying(true)}><Gamepad2 size={17}/> Play here</button>}
              {game.game_url && <button className={canEmbed ? "secondary-button" : "primary-button"} onClick={openExternal}>Play game <ExternalLink size={16}/></button>}
              {!game.game_url && !canEmbed && <p className="muted-note">This is a preview listing. Add a playable URL in the admin dashboard.</p>}
            </div>
          )}
          {game.tags?.length > 0 && <div className="tag-row">{game.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
        </div>
      </section>
    </div>
  );
}
