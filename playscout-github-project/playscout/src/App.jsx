import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Search, Gamepad2, Compass, Flame, Sparkles, Menu, X, Heart, Shield, LogIn, LogOut, Plus, Pencil, Trash2, LayoutDashboard, ChevronDown } from "lucide-react";
import { categories, demoGames } from "./data/categories";
import { hasSupabaseConfig, supabase } from "./lib/supabase";
import { getGames, getAllGamesForAdmin, saveGame, deleteGame } from "./lib/games";
import GameCard from "./components/GameCard";
import GameModal from "./components/GameModal";
import GameForm from "./components/GameForm";
import AdSlot from "./components/AdSlot";

const hashRoute = () => window.location.hash.replace("#", "") || "/";
const safeError = e => e?.message || "Something went wrong. Please try again.";

export default function App() {
  const [route, setRoute] = useState(hashRoute());
  const [games, setGames] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("playscout-favorites") || "[]"));
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [session, setSession] = useState(null);
  const [adminGames, setAdminGames] = useState([]);
  const [editing, setEditing] = useState(undefined);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const handler = () => { setRoute(hashRoute()); setSelected(null); };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  useEffect(() => {
    loadGames();
    if (hasSupabaseConfig) {
      supabase.auth.getSession().then(({ data }) => setSession(data.session));
      const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
      return () => listener.subscription.unsubscribe();
    }
  }, []);

  useEffect(() => { localStorage.setItem("playscout-favorites", JSON.stringify(favorites)); }, [favorites]);

  async function loadGames() {
    setLoading(true);
    try { setGames(await getGames()); }
    catch (e) { setNotice(safeError(e)); setGames([]); }
    finally { setLoading(false); }
  }

  async function loadAdminGames() {
    if (!hasSupabaseConfig || !session) return;
    try { setAdminGames(await getAllGamesForAdmin()); }
    catch (e) { setNotice(safeError(e)); }
  }

  useEffect(() => { if (route === "/admin" && session) loadAdminGames(); }, [route, session]);

  const published = games.filter(g => g.status === "published" || g.status === "demo");
  const filtered = useMemo(() => published.filter(g => {
    const q = query.toLowerCase();
    return (category === "All" || g.category === category) &&
      (!q || `${g.title} ${g.category} ${(g.tags || []).join(" ")} ${g.description}`.toLowerCase().includes(q));
  }), [published, query, category]);

  const featured = published.filter(g => g.featured);
  const trending = published.filter(g => g.is_trending);
  const newest = published.filter(g => g.is_new);
  const favoriteGames = published.filter(g => favorites.includes(g.id));
  const go = path => { window.location.hash = path; setMobileMenu(false); window.scrollTo(0, 0); };
  const toggleFavorite = id => setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  async function signIn(e) {
    e.preventDefault();
    if (!hasSupabaseConfig) return setNotice("Add your Supabase URL and anon key to .env.local first.");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setNotice(error.message);
    else { setNotice("Signed in."); go("/admin"); }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setAdminGames([]);
    go("/");
  }

  async function handleSave(game) {
    setBusy(true);
    try {
      await saveGame(game);
      setEditing(undefined);
      setNotice("Game saved successfully.");
      await loadAdminGames();
      await loadGames();
    } catch (e) { setNotice(safeError(e)); }
    finally { setBusy(false); }
  }

  async function handleDelete(game) {
    if (!window.confirm(`Delete "${game.title}"? This cannot be undone.`)) return;
    try {
      await deleteGame(game.id);
      setNotice("Game deleted.");
      await loadAdminGames();
      await loadGames();
    } catch (e) { setNotice(safeError(e)); }
  }

  const title = route.startsWith("/admin") ? "Admin dashboard" : "Discover Games Worth Playing";
  const currentGame = route.startsWith("/game/") ? published.find(g => g.slug === route.split("/")[2]) : null;

  return <>
    <Helmet>
      <title>{currentGame ? `${currentGame.seo_title || currentGame.title} | PlayScout` : `${title} | PlayScout`}</title>
      <meta name="description" content={currentGame?.seo_description || currentGame?.description || "Discover indie browser games, hidden gems, and free games you can play instantly on PlayScout."}/>
      <meta property="og:title" content={`${currentGame?.title || "PlayScout"} | Discover indie games`}/>
      <meta property="og:description" content={currentGame?.description || "Find hidden gems and play browser games instantly."}/>
      {currentGame?.cover_url && <meta property="og:image" content={currentGame.cover_url}/>}
    </Helmet>
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#/" onClick={() => setCategory("All")}><span className="brand-mark"><Gamepad2 size={22}/></span><span>play<span>scout</span></span></a>
        <nav className={mobileMenu ? "main-nav open" : "main-nav"}>
          <a href="#/" className={route === "/" ? "active" : ""}>Discover</a>
          <a href="#/trending">Trending</a>
          <a href="#/new">New Games</a>
          <a href="#/favorites">Favorites</a>
        </nav>
        <div className="header-actions">
          <button className="admin-link" onClick={() => go("/admin")}><Shield size={15}/> Admin</button>
          <button className="icon-button mobile-toggle" onClick={() => setMobileMenu(v => !v)} aria-label="Menu">{mobileMenu ? <X/> : <Menu/>}</button>
        </div>
      </div>
    </header>

    {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice("")}><X size={14}/></button></div>}

    {route === "/admin" ? (
      <main className="admin-page">
        {!session ? <section className="login-card">
          <span className="brand-mark"><Shield size={23}/></span><span className="eyebrow">PRIVATE AREA</span><h1>Welcome back.</h1>
          <p>Sign in to manage your game library.</p>
          <form onSubmit={signIn}>
            <label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com"/></label>
            <label>Password<input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password"/></label>
            <button className="primary-button full-button"><LogIn size={17}/> Sign in</button>
          </form>
          {!hasSupabaseConfig && <p className="config-warning">Supabase is not configured yet. Follow SETUP.md to connect your project.</p>}
        </section> : <section className="admin-dashboard">
          <div className="admin-top"><div><span className="eyebrow">PLAYSCOUT CONTROL ROOM</span><h1>Game library</h1><p>Manage listings, categories, and publishing status.</p></div><button className="secondary-button" onClick={signOut}><LogOut size={16}/> Sign out</button></div>
          <div className="stats-row"><div className="stat-card"><span>Total listings</span><strong>{adminGames.length}</strong></div><div className="stat-card"><span>Published</span><strong>{adminGames.filter(g => g.status === "published").length}</strong></div><div className="stat-card"><span>Drafts</span><strong>{adminGames.filter(g => g.status === "draft").length}</strong></div></div>
          <div className="table-heading"><h2>All games</h2><button className="primary-button" onClick={() => setEditing(null)}><Plus size={17}/> Add game</button></div>
          <div className="admin-table-wrap"><table><thead><tr><th>Game</th><th>Category</th><th>Status</th><th>Flags</th><th>Actions</th></tr></thead><tbody>
            {adminGames.map(g => <tr key={g.id}><td><div className="table-game">{g.cover_url && <img src={g.cover_url} alt=""/>}<strong>{g.title}</strong></div></td><td>{g.category}</td><td><span className={`status-pill ${g.status}`}>{g.status}</span></td><td>{[g.featured && "Featured",g.is_trending && "Trending",g.is_new && "New"].filter(Boolean).join(" · ") || "—"}</td><td><div className="table-actions"><button onClick={() => setEditing(g)} aria-label="Edit"><Pencil size={16}/></button><button onClick={() => handleDelete(g)} aria-label="Delete"><Trash2 size={16}/></button></div></td></tr>)}
          </tbody></table>{adminGames.length === 0 && <p className="empty-state">No games yet. Add your first discovery.</p>}</div>
        </section>}
      </main>
    ) : route.startsWith("/game/") && currentGame ? (
      <main className="detail-page"><button className="back-link" onClick={() => go("/")}>← Back to discover</button><div className="detail-layout"><div><img className="detail-cover" src={currentGame.cover_url} alt={currentGame.title}/></div><div><span className="eyebrow">{currentGame.category}</span><h1>{currentGame.title}</h1><p className="detail-description">{currentGame.description}</p><div className="instruction-box"><strong><Gamepad2 size={16}/> How to play</strong><p>{currentGame.instructions}</p></div><button className="primary-button" onClick={() => setSelected(currentGame)}>View game & play <ArrowRight size={17}/></button></div></div><AdSlot className="detail-ad"/></main>
    ) : (
      <main>
        {route === "/" && <>
          <section className="hero container">
            <div className="hero-copy"><span className="hero-kicker"><Sparkles size={14}/> YOUR NEXT FAVORITE GAME IS OUT THERE</span><h1>Discover games<br/><span>worth playing.</span></h1><p>Hidden gems, indie favorites, and brilliant browser games — handpicked for your next break.</p>
              <div className="hero-search"><Search size={19}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search games, genres, or tags..."/><kbd>↵</kbd></div>
              <div className="hero-proof"><span><i/> Free to discover</span><span><i/> No downloads needed</span></div>
            </div>
            <div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-controller"><Gamepad2 size={118} strokeWidth={1.1}/></div><span className="float-chip chip-one">✦ HIDDEN GEMS</span><span className="float-chip chip-two">PLAY SOMETHING NEW</span><span className="float-dot dot-one"/><span className="float-dot dot-two"/></div>
          </section>
          <div className="container"><AdSlot className="top-ad"/></div>
          <section className="container section-block">
            <div className="section-heading"><div><span className="eyebrow"><Flame size={14}/> WHAT'S HOT</span><h2>Trending now</h2></div><a href="#/trending">Explore all <ArrowRight size={15}/></a></div>
            <GameGrid games={trending.length ? trending : published.slice(0,4)} onOpen={setSelected} loading={loading}/>
          </section>
          <section className="container section-block category-section"><div className="section-heading"><div><span className="eyebrow"><Compass size={14}/> FIND YOUR VIBE</span><h2>Explore categories</h2></div></div><div className="category-grid">{categories.map((c,i)=><button key={c} className="category-tile" onClick={()=>{setCategory(c);document.getElementById("all-games")?.scrollIntoView({behavior:"smooth"});}}><span className="category-icon">{["⚔","🧩","🏎","🗺","🕹","♟","🎯","☀","🏡","🌐","🏆","🖱"][i]}</span><strong>{c}</strong><ArrowRight size={15}/></button>)}</div></section>
          <section className="container section-block"><div className="section-heading"><div><span className="eyebrow"><Sparkles size={14}/> FRESH FINDS</span><h2>Recently discovered</h2></div><a href="#/new">See new games <ArrowRight size={15}/></a></div><GameGrid games={newest.length ? newest : published.slice(-4)} onOpen={setSelected} loading={loading}/></section>
          <section className="container section-block" id="all-games"><div className="section-heading"><div><span className="eyebrow"><LayoutDashboard size={14}/> THE COLLECTION</span><h2>{category === "All" ? "Explore all games" : category}</h2></div><button className="text-button" onClick={()=>setCategory("All")}>Clear filter <X size={14}/></button></div><div className="filter-row"><button className={category === "All" ? "filter-chip selected" : "filter-chip"} onClick={()=>setCategory("All")}>All games</button>{categories.map(c=><button key={c} className={category === c ? "filter-chip selected" : "filter-chip"} onClick={()=>setCategory(c)}>{c}</button>)}</div><GameGrid games={filtered} onOpen={setSelected} loading={loading}/></section>
          <section className="container newsletter"><div><span className="eyebrow">THE GOOD STUFF, FIRST</span><h2>Find your next little obsession.</h2><p>Bookmark PlayScout and come back for fresh discoveries.</p></div><button className="secondary-button" onClick={()=>toggleFavorite(published[0]?.id)}><Heart size={16}/> Save a favorite</button></section>
        </>}
        {route === "/trending" && <ListingPage title="Trending games" eyebrow="PLAYER FAVORITES" games={trending.length ? trending : published} onOpen={setSelected} loading={loading}/>}
        {route === "/new" && <ListingPage title="New discoveries" eyebrow="FRESH ON PLAYSCOUT" games={newest.length ? newest : published} onOpen={setSelected} loading={loading}/>}
        {route === "/favorites" && <ListingPage title="Your favorites" eyebrow="SAVED FOR LATER" games={favoriteGames} onOpen={setSelected} loading={loading}/>}
        {route === "/about" && <InfoPage title="About PlayScout" eyebrow="WHY WE EXIST"><p>PlayScout is a discovery guide for browser games, indie projects, and overlooked games worth your time. Our goal is to help players find interesting experiences and help independent creators reach new audiences.</p><p>Game names, trademarks, and game content remain the property of their respective owners. A listing on PlayScout does not imply ownership or endorsement.</p></InfoPage>}
        {route === "/privacy" && <InfoPage title="Privacy policy" eyebrow="YOUR PRIVACY MATTERS"><p>This starter policy must be reviewed and customized before launch. Describe the data your deployed site actually collects, including hosting logs, analytics, cookies, favorites stored in the visitor's browser, contact messages, and any advertising technologies you later enable.</p><p>When you enable Google AdSense or analytics, update this page to explain the relevant third-party providers, cookies, personalized advertising choices, and applicable user rights. Do not publish this template as legal advice.</p></InfoPage>}
        {route === "/terms" && <InfoPage title="Terms of use" eyebrow="PLAY FAIR"><p>PlayScout is a game discovery directory. Visitors use third-party games and websites at their own discretion and are subject to the terms and privacy policies of those providers.</p><p>Before launch, add your business contact details, content submission rules, intellectual property notice-and-takedown process, liability terms, and governing-law provisions. This starter text is not legal advice.</p></InfoPage>}
      </main>
    )}

    <footer className="site-footer"><div className="container footer-inner"><a className="brand" href="#/"><span className="brand-mark"><Gamepad2 size={20}/></span><span>play<span>scout</span></span></a><p>Discover something worth playing.</p><div><a href="#/about">About</a><a href="mailto:hello@playscout.example">Contact</a><a href="#/privacy">Privacy</a><a href="#/terms">Terms</a></div><small>© {new Date().getFullYear()} PlayScout. Game trademarks belong to their respective owners.</small></div></footer>
    {selected && <GameModal game={selected} onClose={()=>setSelected(null)}/>}
    {editing !== undefined && <GameForm initial={editing} busy={busy} onSave={handleSave} onCancel={()=>setEditing(undefined)}/>}
  </>;
}

function GameGrid({ games, onOpen, loading }) {
  if (loading) return <div className="loading-grid">{Array.from({length:4}).map((_,i)=><div className="skeleton" key={i}/>)}</div>;
  if (!games.length) return <div className="empty-state">No games found. Try another category or search.</div>;
  return <div className="game-grid">{games.map(g=><GameCard key={g.id} game={g} onOpen={onOpen}/>)}</div>;
}

function ListingPage({ title, eyebrow, games, onOpen, loading }) {
  return <section className="container listing-page"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p className="listing-intro">Handpicked browser games to help you discover your next favorite.</p><GameGrid games={games} onOpen={onOpen} loading={loading}/><AdSlot className="listing-ad"/></section>;
}

function InfoPage({ title, eyebrow, children }) {
  return <section className="container listing-page info-page"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><div className="info-copy">{children}</div></section>;
}
