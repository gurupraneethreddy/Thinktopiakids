"use client";

import { useState } from "react";

// Game scenarios with images
const gameData = [
  {
    scene: "🏃‍♂️ The Lion is Coming! What Should the Deer Do?",
    image: "/images/lion-chasing-deer.jpg", // Replace with your actual image path
    options: [
      { text: "Run to the river 🌊", correct: true },
      { text: "Hide behind a small rock 🪨", correct: false },
      { text: "Stand still and hope for the best 😨", correct: false },
    ],
  },
  {
    scene: "🌊 The River is in Front! What Should the Deer Do?",
    image: "/images/river-crossing.jpg", // Replace with your actual image path
    options: [
      { text: "Jump into the deep water 🌊", correct: false },
      { text: "Find a bridge to cross 🌉", correct: true },
      { text: "Go back to the lion! 😱", correct: false },
    ],
  },
  {
    scene: "🏕 The Deer Sees a Ranger’s Camp! What Next?",
    image: "/images/ranger-camp.jpg", // Replace with your actual image path
    options: [
      { text: "Run to the humans 👨‍👩‍👧", correct: true },
      { text: "Hide under a tree 🌳", correct: false },
      { text: "Go back into the jungle 🌲", correct: false },
    ],
  },
];

export default function DeerEscapeGame() {
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState("");
  const [completed, setCompleted] = useState(false);

  const handleChoice = (isCorrect) => {
    if (isCorrect) {
      if (step + 1 < gameData.length) {
        setStep(step + 1);
        setMessage("✅ Great choice! Keep going!");
      } else {
        setCompleted(true);
      }
    } else {
      setMessage("❌ Oops! Try again!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-200 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🦌 Deer’s Great Escape</h1>

      {!completed ? (
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-semibold">{gameData[step].scene}</h2>

          {/* Display Image for Current Scene */}
          <img
            src={gameData[step].image}
            alt="Game scene"
            className="w-64 h-40 object-cover mx-auto my-4 rounded-lg"
          />

          <div className="grid grid-cols-1 gap-4 mt-4">
            {gameData[step].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleChoice(option.correct)}
                className="px-6 py-3 rounded-lg text-lg transition bg-gray-300 hover:bg-blue-500"
              >
                {option.text}
              </button>
            ))}
          </div>

          {message && <p className="mt-4 text-lg font-semibold">{message}</p>}
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold">🎉 The Deer is Safe!</h2>
          <img src="/images/happy-deer.jpg" alt="Happy Deer" className="w-64 h-40 mx-auto my-4 rounded-lg" />
          <p className="text-lg mt-4">Fun Fact: Deer can jump really high, almost 10 feet in the air! 🦌</p>
          <button
            onClick={() => {
              setStep(0);
              setCompleted(false);
              setMessage("");
            }}
            className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg text-lg hover:bg-blue-700 transition"
          >
            🔄 Play Again
          </button>
        </div>
      )}
    </div>
  );
}
