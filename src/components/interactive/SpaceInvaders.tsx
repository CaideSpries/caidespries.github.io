import { useEffect, useRef, useState, useCallback } from "react";

interface Entity {
  x: number;
  y: number;
  w: number;
  h: number;
  alive: boolean;
}

interface Bullet {
  x: number;
  y: number;
  dy: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

interface ScoreEntry {
  name: string;
  score: number;
}

const STORAGE_KEY = "si_scores";

function loadScores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveScore(entry: ScoreEntry) {
  const scores = loadScores();
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores.slice(0, 10)));
}

export default function SpaceInvaders() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
  const [score, setScore] = useState(0);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [nameInput, setNameInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const gameRef = useRef<{
    player: Entity;
    invaders: Entity[];
    bullets: Bullet[];
    enemyBullets: Bullet[];
    stars: Star[];
    score: number;
    keys: Set<string>;
    animFrame: number;
    lastShot: number;
    invaderDir: number;
    invaderSpeed: number;
    enemyShootTimer: number;
    wave: number;
  } | null>(null);

  const initStars = useCallback((w: number, h: number): Star[] => {
    return Array.from({ length: 60 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.5 + 0.2,
    }));
  }, []);

  const spawnInvaders = useCallback((w: number, wave: number): Entity[] => {
    const rows = Math.min(3 + Math.floor(wave / 2), 5);
    const cols = Math.min(6 + wave, 10);
    const invW = 28;
    const invH = 20;
    const gapX = 14;
    const gapY = 12;
    const totalW = cols * (invW + gapX) - gapX;
    const startX = (w - totalW) / 2;
    const invaders: Entity[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        invaders.push({
          x: startX + c * (invW + gapX),
          y: 40 + r * (invH + gapY),
          w: invW,
          h: invH,
          alive: true,
        });
      }
    }
    return invaders;
  }, []);

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    gameRef.current = {
      player: { x: w / 2 - 16, y: h - 50, w: 32, h: 20, alive: true },
      invaders: spawnInvaders(w, 0),
      bullets: [],
      enemyBullets: [],
      stars: initStars(w, h),
      score: 0,
      keys: new Set(),
      animFrame: 0,
      lastShot: 0,
      invaderDir: 1,
      invaderSpeed: 0.4,
      enemyShootTimer: 0,
      wave: 0,
    };

    setScore(0);
    setSubmitted(false);
    setGameState("playing");
  }, [spawnInvaders, initStars]);

  // Idle starfield animation
  useEffect(() => {
    if (gameState !== "idle") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const stars = initStars(canvas.width, canvas.height);
    let frame = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const star of stars) {
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        ctx.fillStyle = `rgba(232, 93, 58, ${star.opacity * 0.6})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [gameState, initStars]);

  // Game loop
  useEffect(() => {
    if (gameState !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      if (gameRef.current) {
        gameRef.current.player.y = canvas.height - 50;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const handleKeyDown = (e: KeyboardEvent) => {
      gameRef.current?.keys.add(e.key);
      if (["ArrowLeft", "ArrowRight", " ", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      gameRef.current?.keys.delete(e.key);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const gameLoop = () => {
      const g = gameRef.current;
      if (!g) return;
      const w = canvas.width;
      const h = canvas.height;

      // Stars
      for (const star of g.stars) {
        star.y += star.speed;
        if (star.y > h) { star.y = 0; star.x = Math.random() * w; }
      }

      // Player movement
      const speed = 4;
      if (g.keys.has("ArrowLeft") || g.keys.has("a")) g.player.x = Math.max(0, g.player.x - speed);
      if (g.keys.has("ArrowRight") || g.keys.has("d")) g.player.x = Math.min(w - g.player.w, g.player.x + speed);

      // Shooting
      const now = Date.now();
      if ((g.keys.has(" ") || g.keys.has("ArrowUp")) && now - g.lastShot > 250) {
        g.bullets.push({ x: g.player.x + g.player.w / 2 - 1, y: g.player.y, dy: -5 });
        g.lastShot = now;
      }

      // Update bullets
      g.bullets = g.bullets.filter((b) => { b.y += b.dy; return b.y > -10; });
      g.enemyBullets = g.enemyBullets.filter((b) => { b.y += b.dy; return b.y < h + 10; });

      // Invader movement
      const aliveInvaders = g.invaders.filter((inv) => inv.alive);
      let hitEdge = false;
      for (const inv of aliveInvaders) {
        inv.x += g.invaderDir * g.invaderSpeed;
        if (inv.x <= 0 || inv.x + inv.w >= w) hitEdge = true;
      }
      if (hitEdge) {
        g.invaderDir *= -1;
        for (const inv of aliveInvaders) inv.y += 12;
      }

      // Enemy shooting
      g.enemyShootTimer++;
      if (g.enemyShootTimer > Math.max(60 - g.wave * 5, 20)) {
        g.enemyShootTimer = 0;
        if (aliveInvaders.length > 0) {
          const shooter = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
          g.enemyBullets.push({ x: shooter.x + shooter.w / 2, y: shooter.y + shooter.h, dy: 2.5 + g.wave * 0.3 });
        }
      }

      // Bullet-invader collision
      for (const bullet of g.bullets) {
        for (const inv of g.invaders) {
          if (!inv.alive) continue;
          if (bullet.x >= inv.x && bullet.x <= inv.x + inv.w && bullet.y >= inv.y && bullet.y <= inv.y + inv.h) {
            inv.alive = false;
            bullet.y = -100;
            g.score += 10 + g.wave * 5;
            setScore(g.score);
          }
        }
      }

      // Enemy bullet-player collision
      for (const bullet of g.enemyBullets) {
        if (
          bullet.x >= g.player.x && bullet.x <= g.player.x + g.player.w &&
          bullet.y >= g.player.y && bullet.y <= g.player.y + g.player.h
        ) {
          setGameState("gameover");
          setScores(loadScores());
          return;
        }
      }

      // Invaders reach player
      for (const inv of aliveInvaders) {
        if (inv.y + inv.h >= g.player.y) {
          setGameState("gameover");
          setScores(loadScores());
          return;
        }
      }

      // Wave cleared
      if (aliveInvaders.length === 0) {
        g.wave++;
        g.invaders = spawnInvaders(w, g.wave);
        g.invaderSpeed = 0.4 + g.wave * 0.15;
        g.enemyBullets = [];
      }

      // Draw
      ctx.clearRect(0, 0, w, h);

      // Stars
      for (const star of g.stars) {
        ctx.fillStyle = `rgba(232, 93, 58, ${star.opacity * 0.5})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      }

      // Player (triangle ship)
      ctx.fillStyle = "#e85d3a";
      ctx.beginPath();
      ctx.moveTo(g.player.x + g.player.w / 2, g.player.y);
      ctx.lineTo(g.player.x, g.player.y + g.player.h);
      ctx.lineTo(g.player.x + g.player.w, g.player.y + g.player.h);
      ctx.closePath();
      ctx.fill();

      // Invaders (pixel-art style blocks)
      for (const inv of g.invaders) {
        if (!inv.alive) continue;
        ctx.fillStyle = "rgba(232, 213, 192, 0.7)";
        // Body
        ctx.fillRect(inv.x + 4, inv.y, inv.w - 8, inv.h - 4);
        // Arms
        ctx.fillRect(inv.x, inv.y + 4, 4, inv.h - 8);
        ctx.fillRect(inv.x + inv.w - 4, inv.y + 4, 4, inv.h - 8);
        // Eyes
        ctx.fillStyle = "#080808";
        ctx.fillRect(inv.x + 8, inv.y + 4, 4, 4);
        ctx.fillRect(inv.x + inv.w - 12, inv.y + 4, 4, 4);
      }

      // Player bullets
      ctx.fillStyle = "#e85d3a";
      for (const b of g.bullets) ctx.fillRect(b.x, b.y, 2, 8);

      // Enemy bullets
      ctx.fillStyle = "rgba(232, 213, 192, 0.8)";
      for (const b of g.enemyBullets) ctx.fillRect(b.x, b.y, 2, 8);

      // Score HUD
      ctx.fillStyle = "rgba(232, 93, 58, 0.6)";
      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.fillText(`SCORE: ${g.score}`, 12, 20);
      ctx.fillText(`WAVE: ${g.wave + 1}`, 12, 36);

      g.animFrame = requestAnimationFrame(gameLoop);
    };

    gameRef.current!.animFrame = requestAnimationFrame(gameLoop);

    return () => {
      const g = gameRef.current;
      if (g) cancelAnimationFrame(g.animFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, spawnInvaders]);

  const handleSubmitScore = () => {
    if (!nameInput.trim()) return;
    saveScore({ name: nameInput.trim().substring(0, 12), score });
    setScores(loadScores());
    setSubmitted(true);
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        class="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />

      {/* Start prompt */}
      {gameState === "idle" && (
        <div
          class="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 text-center"
          style={{ color: "var(--text-faint)" }}
        >
          <button
            onClick={startGame}
            class="px-4 py-2 text-xs font-mono uppercase tracking-widest rounded-lg transition-all hover:scale-105"
            style={{
              background: "rgba(232, 93, 58, 0.1)",
              border: "1px solid rgba(232, 93, 58, 0.3)",
              color: "#e85d3a",
            }}
          >
            Press to play Space Invaders
          </button>
        </div>
      )}

      {/* Game over overlay */}
      {gameState === "gameover" && (
        <div
          class="absolute inset-0 z-30 flex items-center justify-center"
          style={{ background: "rgba(8, 8, 8, 0.85)" }}
        >
          <div class="text-center max-w-sm mx-auto px-4">
            <h3
              class="text-3xl font-black mb-2 neon-text"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Game Over
            </h3>
            <p class="text-4xl font-black mb-6" style={{ fontFamily: "var(--font-mono)", color: "#e85d3a" }}>
              {score}
            </p>

            {!submitted ? (
              <div class="mb-6">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitScore()}
                  placeholder="Your name"
                  maxLength={12}
                  class="px-3 py-2 text-sm rounded-lg w-full mb-3 focus:outline-none"
                  style={{
                    background: "rgba(232, 213, 192, 0.05)",
                    border: "1px solid rgba(232, 213, 192, 0.12)",
                    color: "#f2e8dc",
                  }}
                  autoFocus
                />
                <button
                  onClick={handleSubmitScore}
                  class="w-full px-4 py-2 text-sm font-bold rounded-lg transition-colors"
                  style={{ background: "#e85d3a", color: "#080808" }}
                >
                  Save Score
                </button>
              </div>
            ) : null}

            {scores.length > 0 && (
              <div class="mb-6">
                <p class="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                  Leaderboard
                </p>
                <div class="space-y-1">
                  {scores.slice(0, 5).map((s, i) => (
                    <div
                      key={i}
                      class="flex justify-between text-xs font-mono px-2 py-1 rounded"
                      style={{
                        background: i === 0 ? "rgba(232, 93, 58, 0.1)" : "transparent",
                        color: i === 0 ? "#e85d3a" : "var(--text-secondary)",
                      }}
                    >
                      <span>{i + 1}. {s.name}</span>
                      <span>{s.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={startGame}
              class="px-6 py-2 text-sm font-bold rounded-lg transition-colors"
              style={{ background: "rgba(232, 93, 58, 0.15)", color: "#e85d3a", border: "1px solid rgba(232, 93, 58, 0.3)" }}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </>
  );
}
