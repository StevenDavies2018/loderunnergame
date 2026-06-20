import { TILE_SIZE_PX } from "./levels";

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  onLadder: boolean;
}

export interface Input {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

const GRAVITY = 0.6;
const MOVE_SPEED = 3;
const JUMP_POWER = 12;
const TILE_SIZE = TILE_SIZE_PX;

export function createPlayer(x: number, y: number): PlayerState {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    onGround: false,
    onLadder: false,
  };
}

export function updatePlayer(
  player: PlayerState,
  input: Input,
  checkCollision: (x: number, y: number, w: number, h: number) => number,
): void {
  const w = TILE_SIZE;
  const h = TILE_SIZE;

  // Horizontal movement
  if (input.left) player.vx = -MOVE_SPEED;
  else if (input.right) player.vx = MOVE_SPEED;
  else player.vx = 0;

  // Apply gravity (unless on ladder)
  if (!player.onLadder) {
    player.vy += GRAVITY;
  } else {
    // Climbing
    if (input.up) player.vy = -MOVE_SPEED;
    else if (input.down) player.vy = MOVE_SPEED;
    else player.vy = 0;
  }

  // Jumping from ground
  if (player.onGround && input.up && !player.onLadder) {
    player.vy = -JUMP_POWER;
    player.onGround = false;
  }

  // Apply velocity
  player.x += player.vx;
  player.y += player.vy;

  // Collision detection
  player.onGround = false;
  player.onLadder = false;

  const tile = checkCollision(player.x, player.y, w, h);

  // Landing on platform
  if (tile === 1 && player.vy > 0) {
    player.vy = 0;
    player.onGround = true;
    // Snap to one tile above platform
    const platformTileY = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
    player.y = platformTileY - TILE_SIZE;
  }

  // Hitting head on platform
  if (tile === 1 && player.vy < 0) {
    player.vy = 0;
  }

  // On ladder
  if (tile === 2) {
    player.onLadder = true;
    if (!input.up && !input.down) {
      player.vy = 0;
    }
  }

  // Keep in bounds
  if (player.x < 0) player.x = 0;
  if (player.y < 0) player.y = 0;
  if (player.y > 600) {
    // Fell off map - lose
    player.y = -TILE_SIZE;
  }
}
