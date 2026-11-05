export const categories = [
  "Action", "Puzzle", "Racing", "Adventure", "Arcade", "Strategy",
  "Shooting", "Casual", "Simulation", "Multiplayer", "Sports", "Idle & Clicker"
];

export const demoGames = [
  {
    id: "demo-1", slug: "neon-drift-demo", title: "Neon Drift", category: "Racing",
    description: "A fast-paced arcade racing experience with glowing tracks and tight turns.",
    instructions: "Use the arrow keys or WASD to steer. Avoid obstacles and chase your best time.",
    cover_url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&q=85",
    game_url: "", play_mode: "external", tags: ["Arcade", "Speed"], featured: true,
    is_trending: true, is_new: true, status: "demo", seo_title: "Neon Drift — PlayScout demo",
    seo_description: "A sample game card used to preview the PlayScout interface."
  },
  {
    id: "demo-2", slug: "the-last-puzzle-demo", title: "The Last Puzzle", category: "Puzzle",
    description: "A calm logic challenge built around patterns, timing, and clever moves.",
    instructions: "Read the board carefully and solve each level with as few moves as possible.",
    cover_url: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=900&q=85",
    game_url: "", play_mode: "external", tags: ["Logic", "Brain"], featured: true,
    is_trending: true, is_new: false, status: "demo"
  },
  {
    id: "demo-3", slug: "pixel-journey-demo", title: "Pixel Journey", category: "Adventure",
    description: "Explore a colorful pixel world in this sample indie adventure listing.",
    instructions: "Use the keyboard to move, explore the map, and discover hidden paths.",
    cover_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900&q=85",
    game_url: "", play_mode: "external", tags: ["Pixel", "Explore"], featured: false,
    is_trending: false, is_new: true, status: "demo"
  },
  {
    id: "demo-4", slug: "tiny-arcade-demo", title: "Tiny Arcade", category: "Arcade",
    description: "A quick pick-up-and-play arcade concept for short breaks.",
    instructions: "Follow the on-screen prompts and try to beat your personal high score.",
    cover_url: "https://images.unsplash.com/photo-1493711662062-fa5410bd8c1f?w=900&q=85",
    game_url: "", play_mode: "external", tags: ["Quick Play", "Score"], featured: false,
    is_trending: false, is_new: false, status: "demo"
  }
];
