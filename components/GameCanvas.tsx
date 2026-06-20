"use client";

import { useEffect, useRef, useState } from "react";
import { Level, TILE_SIZE_PX } from "@/lib/game/levels";
import { GameState, createGameState, updateGameState } from "@/lib/game/engine";
import { Input } from "@/lib/game/player";

interface GameCanvasProps {
  level: Level;
  onGameEnd: (won: boolean, score: number, time: number) => void;
}

const TILE_SIZE = TILE_SIZE_PX;
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

export default function GameCanvas({ level, onGameEnd }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(() => createGameState(level));
  const inputRef = useRef<Input>({
    left: false,
    right: false,
    up: false,
    down: false,
  });

  // Reset game state when level changes
  useEffect(() => {
    setGameState(createGameState(level));
  }, [level]);

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") inputRef.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d") inputRef.current.right = true;
      if (e.key === "ArrowUp" || e.key === "w") inputRef.current.up = true;
      if (e.key === "ArrowDown" || e.key === "s") inputRef.current.down = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") inputRef.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d") inputRef.current.right = false;
      if (e.key === "ArrowUp" || e.key === "w") inputRef.current.up = false;
      if (e.key === "ArrowDown" || e.key === "s") inputRef.current.down = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let lastGameState = gameState;

    const gameLoop = () => {
      const newState = { ...gameState };
      const prevWon = newState.won;
      const prevGameOver = newState.gameOver;

      updateGameState(newState, inputRef.current);

      // Check end condition
      if ((newState.won || newState.gameOver) && (!prevWon && !prevGameOver)) {
        const timeInSeconds = Math.floor(newState.time / 60);
        onGameEnd(newState.won, newState.score, timeInSeconds);
      }

      setGameState(newState);
      lastGameState = newState;

      // Render
      render(ctx, canvas, newState);
      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animationId);
  }, [onGameEnd]);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-gray-800 bg-black"
      />
      <div className="text-white text-lg">
        <p>Score: {gameState.score}</p>
        <p>Time: {Math.floor(gameState.time / 60)}s</p>
        {gameState.message && <p className="text-yellow-400 font-bold">{gameState.message}</p>}
      </div>
      <div className="text-sm text-gray-400">
        <p>Arrow Keys / WASD to move, Up/W to jump/climb</p>
      </div>
    </div>
  );
}

function render(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, gameState: GameState) {
  // Clear
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const level = gameState.level;

  // Draw tiles
  for (let i = 0; i < level.tiles.length; i++) {
    const tile = level.tiles[i];
    const tx = i % level.width;
    const ty = Math.floor(i / level.width);
    const px = tx * TILE_SIZE;
    const py = ty * TILE_SIZE;

    if (tile.type === 1) {
      // Platform
      ctx.fillStyle = "#666";
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = "#999";
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
    } else if (tile.type === 2) {
      // Ladder
      ctx.strokeStyle = "#ff9800";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px + 8, py);
      ctx.lineTo(px + 8, py + TILE_SIZE);
      ctx.moveTo(px + TILE_SIZE - 8, py);
      ctx.lineTo(px + TILE_SIZE - 8, py + TILE_SIZE);
      ctx.stroke();
      for (let j = 0; j < 4; j++) {
        const rung = py + (j * TILE_SIZE) / 4;
        ctx.beginPath();
        ctx.moveTo(px + 8, rung);
        ctx.lineTo(px + TILE_SIZE - 8, rung);
        ctx.stroke();
      }
    } else if (tile.type === 3) {
      // Collectible
      ctx.fillStyle = "#ffeb3b";
      ctx.beginPath();
      ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (tile.type === 6) {
      // Exit
      ctx.fillStyle = "#4caf50";
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = "#fff";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("E", px + TILE_SIZE / 2, py + TILE_SIZE / 2);
    }
  }

  // Draw enemies
  ctx.fillStyle = "#f44336";
  for (const enemy of gameState.enemies) {
    ctx.fillRect(enemy.x, enemy.y, 32, 32);
  }

  // Draw player
  ctx.fillStyle = "#2196f3";
  ctx.fillRect(gameState.player.x, gameState.player.y, TILE_SIZE, TILE_SIZE);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(gameState.player.x + 12, gameState.player.y + 12, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(gameState.player.x + 28, gameState.player.y + 12, 4, 0, Math.PI * 2);
  ctx.fill();
}
