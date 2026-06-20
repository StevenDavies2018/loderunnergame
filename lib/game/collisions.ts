import { Level, TILE_SIZE_PX } from "./levels";

const TILE_SIZE = TILE_SIZE_PX;

export function getTileAt(level: Level, x: number, y: number): number {
  const tx = Math.floor(x / TILE_SIZE);
  const ty = Math.floor(y / TILE_SIZE);

  if (tx < 0 || tx >= level.width || ty < 0 || ty >= level.height) {
    return 0;
  }

  return level.tiles[ty * level.width + tx].type;
}

export function checkCollision(
  level: Level,
  x: number,
  y: number,
  w: number,
  h: number,
): number {
  // Check all 4 corners of the player box
  const corners = [
    { x, y },
    { x: x + w - 1, y },
    { x, y: y + h - 1 },
    { x: x + w - 1, y: y + h - 1 },
  ];

  for (const corner of corners) {
    const tile = getTileAt(level, corner.x, corner.y);
    if (tile === 1 || tile === 2) {
      return tile;
    }
  }

  return 0;
}

export function checkCollectible(level: Level, x: number, y: number, w: number, h: number): boolean {
  const corners = [
    { x, y },
    { x: x + w - 1, y },
    { x, y: y + h - 1 },
    { x: x + w - 1, y: y + h - 1 },
  ];

  for (const corner of corners) {
    if (getTileAt(level, corner.x, corner.y) === 3) {
      return true;
    }
  }

  return false;
}

export function collectItem(level: Level, x: number, y: number, w: number, h: number): void {
  const tx = Math.floor(x / TILE_SIZE);
  const ty = Math.floor(y / TILE_SIZE);

  if (tx >= 0 && tx < level.width && ty >= 0 && ty < level.height) {
    const idx = ty * level.width + tx;
    if (level.tiles[idx].type === 3) {
      level.tiles[idx].type = 0;
    }
  }

  // Check other corners too
  const corners = [
    Math.floor((x + w - 1) / TILE_SIZE),
    Math.floor(y / TILE_SIZE),
    Math.floor(x / TILE_SIZE),
    Math.floor((y + h - 1) / TILE_SIZE),
  ];

  const tx2 = Math.floor((x + w - 1) / TILE_SIZE);
  const ty2 = Math.floor((y + h - 1) / TILE_SIZE);

  if (tx2 >= 0 && tx2 < level.width && ty2 >= 0 && ty2 < level.height) {
    const idx = ty2 * level.width + tx2;
    if (level.tiles[idx].type === 3) {
      level.tiles[idx].type = 0;
    }
  }
}

export function checkExit(level: Level, x: number, y: number, w: number, h: number): boolean {
  const corners = [
    { x, y },
    { x: x + w - 1, y },
    { x, y: y + h - 1 },
    { x: x + w - 1, y: y + h - 1 },
  ];

  for (const corner of corners) {
    if (getTileAt(level, corner.x, corner.y) === 6) {
      return true;
    }
  }

  return false;
}

export function checkEnemyCollision(
  playerX: number,
  playerY: number,
  playerW: number,
  playerH: number,
  enemies: Array<{ x: number; y: number }>,
): boolean {
  for (const enemy of enemies) {
    if (
      playerX < enemy.x + 32 &&
      playerX + playerW > enemy.x &&
      playerY < enemy.y + 32 &&
      playerY + playerH > enemy.y
    ) {
      return true;
    }
  }
  return false;
}
