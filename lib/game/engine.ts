import { Level } from "./levels";
import { PlayerState, Input, updatePlayer } from "./player";
import { checkCollision, checkCollectible, collectItem, checkExit, checkEnemyCollision } from "./collisions";
import { TILE_SIZE_PX } from "./levels";

const TILE_SIZE = TILE_SIZE_PX;
const ENEMY_SPEED = 1.5;

export interface GameState {
  level: Level;
  player: PlayerState;
  enemies: Array<{ x: number; y: number; direction: number }>;
  score: number;
  time: number;
  gameOver: boolean;
  won: boolean;
  message: string;
}

export function createGameState(level: Level): GameState {
  return {
    level,
    player: {
      x: level.playerStart.x,
      y: level.playerStart.y,
      vx: 0,
      vy: 0,
      onGround: true,
      onLadder: false,
    },
    enemies: level.enemies.map(e => ({ x: e.x, y: e.y, direction: 1 })),
    score: 0,
    time: 0,
    gameOver: false,
    won: false,
    message: "",
  };
}

export function updateGameState(gameState: GameState, input: Input): void {
  if (gameState.gameOver || gameState.won) return;

  // Update player
  updatePlayer(gameState.player, input, (x, y, w, h) => {
    return checkCollision(gameState.level, x, y, w, h);
  });

  // Check collectibles
  if (checkCollectible(gameState.level, gameState.player.x, gameState.player.y, TILE_SIZE, TILE_SIZE)) {
    collectItem(gameState.level, gameState.player.x, gameState.player.y, TILE_SIZE, TILE_SIZE);
    gameState.score += 10;
  }

  // Update enemies
  for (const enemy of gameState.enemies) {
    enemy.x += enemy.direction * ENEMY_SPEED;

    // Bounce off walls
    if (enemy.x < 0 || enemy.x > gameState.level.width * TILE_SIZE - 32) {
      enemy.direction *= -1;
    }
  }

  // Check enemy collision
  if (
    checkEnemyCollision(
      gameState.player.x,
      gameState.player.y,
      TILE_SIZE,
      TILE_SIZE,
      gameState.enemies,
    )
  ) {
    gameState.gameOver = true;
    gameState.message = "Game Over! Hit by enemy";
  }

  // Check if fell off
  if (gameState.player.y > gameState.level.height * TILE_SIZE) {
    gameState.gameOver = true;
    gameState.message = "Game Over! Fell off map";
  }

  // Check exit
  if (checkExit(gameState.level, gameState.player.x, gameState.player.y, TILE_SIZE, TILE_SIZE)) {
    gameState.won = true;
    gameState.message = `Level Complete! Score: ${gameState.score}`;
  }

  gameState.time++;
}
