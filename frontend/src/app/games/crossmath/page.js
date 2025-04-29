"use client";
import { useState, useEffect } from "react";

const generatePuzzle = () => {
  const size = 3; // 3x3 grid of numbers
  let numbers = Array(size).fill(null).map(() => Array(size).fill(null));
  let rowResults = Array(size).fill(0);
  let colResults = Array(size).fill(0);
  let operators = ['+', '-', '*', '/'];
  let opsGrid = Array(size).fill(null).map(() => Array(size - 1).fill(null));
  let opsCol = Array(size - 1).fill(null).map(() => Array(size).fill(null));

  // Generate numbers
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      numbers[i][j] = Math.floor(Math.random() * 9) + 1;
    }
  }

  // Generate operators and calculate row results
  for (let i = 0; i < size; i++) {
    let result = numbers[i][0];
    for (let j = 1; j < size; j++) {
      let op = operators[Math.floor(Math.random() * operators.length)];
      opsGrid[i][j - 1] = op;
      result = eval(`${result} ${op} ${numbers[i][j]}`);
    }
    rowResults[i] = Math.floor(result);
  }

  // Generate operators and calculate column results
  for (let j = 0; j < size; j++) {
    let result = numbers[0][j];
    for (let i = 1; i < size; i++) {
      let op = operators[Math.floor(Math.random() * operators.length)];
      opsCol[i - 1][j] = op;
      result = eval(`${result} ${op} ${numbers[i][j]}`);
    }
    colResults[j] = Math.floor(result);
  }

  return { numbers, rowResults, colResults, opsGrid, opsCol };
};

export default function CrossMathGame() {
  const [puzzle, setPuzzle] = useState(null);

  useEffect(() => {
    setPuzzle(generatePuzzle());
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Cross Math Game</h1>
      {puzzle && (
        <div className="grid grid-cols-7 gap-2 bg-white p-4 shadow-lg rounded-lg">
          {puzzle.numbers.map((row, rowIndex) => (
            <div key={rowIndex} className="flex items-center">
              {row.map((num, colIndex) => (
                <>
                  <div key={colIndex} className="w-16 h-16 border flex items-center justify-center text-xl font-bold bg-gray-200">
                    {num}
                  </div>
                  {colIndex < puzzle.numbers[0].length - 1 && (
                    <div className="w-16 h-16 flex items-center justify-center text-xl font-bold text-red-500">
                      {puzzle.opsGrid[rowIndex][colIndex]}
                    </div>
                  )}
                </>
              ))}
              <div className="w-16 h-16 flex items-center justify-center font-bold text-xl text-blue-500">
                = {puzzle.rowResults[rowIndex]}
              </div>
            </div>
          ))}
          {puzzle.colResults.map((res, index) => (
            <div key={index} className="w-16 h-16 flex items-center justify-center font-bold text-xl text-green-500">
              = {res}
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setPuzzle(generatePuzzle())} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">
        Generate New Puzzle
      </button>
    </div>
  );
}
