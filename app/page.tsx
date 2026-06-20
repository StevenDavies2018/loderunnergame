"use client";

import { useState } from "react";
import GameCanvas from "@/components/GameCanvas";
import { LEVELS } from "@/lib/game/levels";

export default function Home() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [scores, setScores] = useState<Array<{ level: number; score: number; time: number }>>([]);

  const handleGameEnd = (won: boolean, score: number, time: number) => {
    if (won) {
      setScores([...scores, { level: currentLevel + 1, score, time }]);

      if (currentLevel < LEVELS.length - 1) {
        alert(`Level Complete! Score: ${score}, Time: ${time}s\n\nMoving to next level...`);
        setCurrentLevel(currentLevel + 1);
      } else {
        alert(`You won! Final Score: ${score}, Time: ${time}s`);
      }
    }
  };

  const resetLevel = () => {
    setCurrentLevel(0);
    setScores([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">Lode Runner</h1>
        <p className="text-gray-400 text-center mb-6">
          Level {currentLevel + 1} of {LEVELS.length}
        </p>

        <GameCanvas level={LEVELS[currentLevel]} onGameEnd={handleGameEnd} />

        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Session Scores</h2>
          {scores.length === 0 ? (
            <p className="text-gray-400">No scores yet. Complete a level!</p>
          ) : (
            <div className="space-y-2">
              {scores.map((s, i) => (
                <p key={i} className="text-white">
                  Level {s.level}: {s.score} points ({s.time}s)
                </p>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={resetLevel}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Reset Game
        </button>
      </div>
    </div>
  );
}
