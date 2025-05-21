import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GAME_WIDTH = 600;
const GAME_HEIGHT = 180;
const GROUND_Y = 150;
const DINO_WIDTH = 40;
const DINO_HEIGHT = 40;
const OBSTACLE_WIDTH = 20;
const OBSTACLE_HEIGHT = 40;
const GRAVITY = 0.7;
const JUMP_VELOCITY = -11;

const Dino: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const navigate = useNavigate();

  // Dino state
  const dino = useRef({ x: 50, y: GROUND_Y - DINO_HEIGHT, vy: 0, jumping: false });
  // Obstacles
  const obstacles = useRef<{ x: number; y: number }[]>([]);
  // Animation frame
  const frame = useRef(0);

  useEffect(() => {
    if (!started || gameOver) return;
    let animationId: number;
    let lastTime = performance.now();

    const gameLoop = (time: number) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Draw ground
      ctx.fillStyle = "#888";
      ctx.fillRect(0, GROUND_Y, GAME_WIDTH, 4);

      // Cat physics
      dino.current.y += dino.current.vy;
      dino.current.vy += GRAVITY;
      if (dino.current.y >= GROUND_Y - DINO_HEIGHT) {
        dino.current.y = GROUND_Y - DINO_HEIGHT;
        dino.current.vy = 0;
        dino.current.jumping = false;
      }

      // Draw cat (simple emoji)
      ctx.font = "32px serif";
      ctx.textBaseline = "top";
      ctx.fillText("🐱", dino.current.x, dino.current.y);

      // Obstacles
      if (frame.current % 80 === 0) {
        obstacles.current.push({ x: GAME_WIDTH, y: GROUND_Y - OBSTACLE_HEIGHT });
      }
      for (let i = 0; i < obstacles.current.length; i++) {
        obstacles.current[i].x -= 6;
      }
      // Remove off-screen obstacles
      obstacles.current = obstacles.current.filter((obs) => obs.x + OBSTACLE_WIDTH > 0);

      // Draw cactus (simple emoji)
      obstacles.current.forEach((obs) => {
        ctx.font = "28px serif";
        ctx.fillText("🌵", obs.x, obs.y);
      });

      // Collision detection (adjusted for emoji size)
      obstacles.current.forEach((obs) => {
        if (
          dino.current.x < obs.x + OBSTACLE_WIDTH &&
          dino.current.x + DINO_WIDTH > obs.x &&
          dino.current.y < obs.y + OBSTACLE_HEIGHT &&
          dino.current.y + DINO_HEIGHT > obs.y
        ) {
          setGameOver(true);
        }
      });

      // Score
      setScore((prev) => prev + 1);
      frame.current++;
      if (!gameOver) animationId = requestAnimationFrame(gameLoop);
    };
    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
    // eslint-disable-next-line
  }, [started, gameOver]);

  // Keyboard & touch controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === "Space" || e.code === "ArrowUp") && !dino.current.jumping && !gameOver) {
        dino.current.vy = JUMP_VELOCITY;
        dino.current.jumping = true;
      }
      if (gameOver && (e.code === "Space" || e.code === "Enter")) {
        restart();
      }
    };
    const handleTouch = () => {
      if (!dino.current.jumping && !gameOver) {
        dino.current.vy = JUMP_VELOCITY;
        dino.current.jumping = true;
      }
      if (gameOver) {
        restart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    const canvas = canvasRef.current;
    canvas?.addEventListener("touchstart", handleTouch);
    canvas?.addEventListener("mousedown", handleTouch);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      canvas?.removeEventListener("touchstart", handleTouch);
      canvas?.removeEventListener("mousedown", handleTouch);
    };
    // eslint-disable-next-line
  }, [gameOver]);

  const startGame = () => {
    setScore(0);
    setGameOver(false);
    setStarted(true);
    dino.current = { x: 50, y: GROUND_Y - DINO_HEIGHT, vy: 0, jumping: false };
    obstacles.current = [];
    frame.current = 0;
  };

  const restart = () => {
    setStarted(false);
    setTimeout(() => startGame(), 100);
  };

  // Jump handler for button
  const handleJumpButton = () => {
    if (!dino.current.jumping && !gameOver) {
      dino.current.vy = JUMP_VELOCITY;
      dino.current.jumping = true;
    }
    if (gameOver) {
      restart();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-love-light to-love-cream p-4">
      {/* Header */}
      <div className="w-full max-w-md mb-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="mr-2">
          <ArrowLeft className="h-5 w-5 text-love-gray" />
        </Button>
        <h1 className="text-2xl font-bold text-love-gray flex items-center gap-2">
          Linda <span className="text-2xl">🐱</span>
        </h1>
      </div>
      {/* Game state text above game area */}
      <div className="w-full max-w-md flex flex-col items-center mb-2">
        {!started && !gameOver && (
          <Button className="mb-2 bg-love-pink text-white rounded-xl" onClick={startGame}>
            Başla
          </Button>
        )}
        {gameOver && (
          <>
            <div className="text-xl font-bold text-love-pink mb-2">Oyun Bitti!</div>
            <Button className="mb-2 bg-love-pink text-white rounded-xl" onClick={restart}>
              Tekrar Oyna
            </Button>
          </>
        )}
      </div>
      {/* Game area */}
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="rounded-xl border shadow-soft bg-white/80 backdrop-blur-sm"
        style={{ maxWidth: "100%" }}
      />
      <div className="mt-4 text-lg text-love-gray font-semibold">Skor: {score}</div>
      {/* Mobile jump button and info */}
      <div className="mt-4 flex flex-col items-center w-full max-w-md">
        <Button
          className="bg-love-pink text-white rounded-xl w-full py-3 text-lg"
          style={{ touchAction: 'manipulation' }}
          onClick={handleJumpButton}
        >
          Zıpla
        </Button>
        <div className="mt-2 text-sm text-muted-foreground text-center">
          Zıplamak için butona dokun
        </div>
      </div>
    </div>
  );
};

export default Dino; 