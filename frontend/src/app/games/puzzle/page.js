"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NumberOrderingGame() {
  const router = useRouter();
  const [numbers, setNumbers] = useState([]);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [message, setMessage] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [authError, setAuthError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    resetGame();
  }, [difficulty]);

  const generateNumbers = () => {
    if (difficulty === "easy") {
      return Array.from({ length: 10 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    } else if (difficulty === "medium") {
      return Array.from({ length: 15 }, () => Math.floor(Math.random() * 100) + 1).sort(() => Math.random() - 0.5);
    } else {
      const expressions = [
        "5+3", "10-4", "6*2", "12/3", "7+5", "9-2", "8*1", "15/5", "4+6", "3*3"
      ];
      return expressions.sort(() => Math.random() - 0.5);
    }
  };

  const resetGame = () => {
    setNumbers(generateNumbers());
    setStartTime(Date.now());
    setElapsedTime(null);
    setGameCompleted(false);
    setSelectedIndexes([]);
    setMessage("");
    setAuthError(null);
  };

  const evaluateExpression = (exp) => {
    return eval(exp);
  };

  const swapTiles = (index) => {
    if (gameCompleted) return;
    
    setSelectedIndexes((prev) => {
      if (prev.length === 1) {
        const newNumbers = [...numbers];
        [newNumbers[prev[0]], newNumbers[index]] = [newNumbers[index], newNumbers[prev[0]]];
        setNumbers(newNumbers);
        return [];
      }
      return [index];
    });
  };

  const submitScore = async (completionTime) => {
    setIsSubmitting(true);
    setAuthError(null);
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Please login to save your scores");
      }

      const roundedTime = Math.ceil(completionTime);
      
      const response = await fetch("http://localhost:5000/game/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject_id: 1,
          game_id: 1,
          score: roundedTime,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        const refreshResponse = await fetch("http://localhost:5000/auth/refresh", {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (refreshResponse.ok) {
          const { accessToken } = await refreshResponse.json();
          localStorage.setItem("token", accessToken);
          
          const retryResponse = await fetch("http://localhost:5000/game/submit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              subject_id: 1,
              game_id: 1,
              score: roundedTime,
            }),
          });

          if (!retryResponse.ok) {
            throw new Error(`Server responded with ${retryResponse.status}`);
          }
          return await retryResponse.json();
        } else {
          throw new Error("Session expired - please log in again");
        }
      }

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to save score:", error);
      setAuthError(error.message);
      
      if (error.message.includes("Session expired") || 
          error.message.includes("Please login")) {
        localStorage.removeItem("token");
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkOrder = async () => {
    if (gameCompleted) return;
    
    const sortedNumbers = difficulty === "hard" 
      ? [...numbers].sort((a, b) => evaluateExpression(a) - evaluateExpression(b))
      : [...numbers].sort((a, b) => a - b);
  
    if (JSON.stringify(numbers) === JSON.stringify(sortedNumbers)) {
      const completionTime = (Date.now() - startTime) / 1000;
      setElapsedTime(completionTime);
      setGameCompleted(true);
      
      const roundedTime = Math.ceil(completionTime);
      setMessage(`✅ Correct! You completed in ${roundedTime} seconds!`);
  
      try {
        await submitScore(completionTime);
      } catch (error) {
        console.error("Score submission error:", error);
      }
    } else {
      setMessage("❌ Try Again! The order is incorrect.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Number Ordering Game</h1>
      
      <div className="mb-4">
        <label className="mr-2 font-semibold">Select Difficulty:</label>
        <select 
          onChange={(e) => setDifficulty(e.target.value)} 
          value={difficulty} 
          className="p-2 border rounded"
          disabled={gameCompleted}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      
      <div className="flex gap-4 bg-white p-6 shadow-lg rounded-lg flex-wrap justify-center">
        {numbers.map((num, index) => (
          <button
            key={index}
            onClick={() => swapTiles(index)}
            className={`w-16 h-16 flex items-center justify-center text-white text-xl font-bold rounded cursor-pointer shadow-lg transition-all ${
              selectedIndexes.includes(index) 
                ? "bg-red-500 transform scale-110" 
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={gameCompleted}
          >
            {num}
          </button>
        ))}
      </div>
      
      {authError && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
          {authError}
          <button 
            onClick={() => router.push("/login")} 
            className="ml-2 text-blue-600 underline"
          >
            Go to Login
          </button>
        </div>
      )}
      
      {isSubmitting && (
        <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded-lg">
          Saving your score...
        </div>
      )}
      
      <p className="mt-4 text-xl font-semibold min-h-8">
        {message}
      </p>
      
      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="flex gap-2">
          <button 
            onClick={checkOrder} 
            className={`px-4 py-2 text-white rounded-lg ${
              gameCompleted ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            }`}
            disabled={gameCompleted}
          >
            Submit
          </button>
          <button 
            onClick={resetGame} 
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            {gameCompleted ? "Play Again" : "Restart"}
          </button>
        </div>
        
        {/* Back Button positioned below the other buttons */}
        <button 
          onClick={() => router.push("/learning_games/math")}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg flex items-center mt-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Games
        </button>
      </div>
    </div>
  );
}
