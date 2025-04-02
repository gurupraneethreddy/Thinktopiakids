"use client";

import { useState } from "react";
import { motion } from "framer-motion";

// Animal Data
const environments = {
  jungle: {
    name: "Jungle",
    animals: ["Tiger", "Monkey", "Elephant", "Snake"],
    options: ["Tiger", "Monkey", "Elephant", "Snake", "Giraffe", "Lion"],
    background: "🌳🌴🌿 Jungle Adventure! 🐒",
    image: "/images/jungle.jpg",
  },
  ocean: {
    name: "Ocean",
    animals: ["Dolphin", "Shark", "Octopus", "Whale"],
    options: ["Dolphin", "Shark", "Octopus", "Whale", "Seal", "Turtle"],
    background: "🌊🐠 Ocean World! 🦑",
    image: "/images/ocean.jpg",
  },
  savannah: {
    name: "Savannah",
    animals: ["Lion", "Zebra", "Giraffe", "Elephant"],
    options: ["Lion", "Zebra", "Giraffe", "Elephant", "Cheetah", "Hyena"],
    background: "🏜️🦓 Savannah Safari! 🦒",
    image: "/images/savannah.jpg",
  },
};

export default function SpotTheAnimals() {
  const [selectedEnv, setSelectedEnv] = useState(null);
  const [selectedAnimals, setSelectedAnimals] = useState([]);
  const [feedback, setFeedback] = useState("");

  const handleEnvironmentSelect = (env) => {
    setSelectedEnv(env);
    setSelectedAnimals([]);
    setFeedback("");
  };

  const handleAnimalSelect = (animal) => {
    let updatedSelection = selectedAnimals.includes(animal)
      ? selectedAnimals.filter((a) => a !== animal)
      : [...selectedAnimals, animal];

    setSelectedAnimals(updatedSelection);
  };

  const checkSelection = () => {
  if (!selectedEnv) return;
  const correctAnimals = environments[selectedEnv].animals;
  const isCorrect =
    correctAnimals.every((animal) => selectedAnimals.includes(animal)) &&
    selectedAnimals.length === correctAnimals.length;

  if (isCorrect) {
    setFeedback("🎉 You found all the animals! Great job! 🎊");
    saveScore(100);  // Send a score of 100 if correct
  } else {
    setFeedback("❌ Oops! You missed some animals. Try again!");
    saveScore(50);  // Send a score of 50 if incorrect
  }
};



const saveScore = async (finalScore) => {
  const requestBody = {
    student_id: 1,  // Replace with actual student ID
    subject_id: 1,  // Replace with actual subject ID
    game_id: 2,     // Replace with actual game ID
    score: finalScore,
  };

  console.log("📤 Sending score:", JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch("http://localhost:5000/game/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text(); // Read response as text for debugging
    let responseData;
    try {
      responseData = JSON.parse(responseText); // Try parsing as JSON
    } catch (e) {
      console.error("❌ Invalid JSON response:", responseText);
      throw new Error("Server returned invalid JSON");
    }

    console.log("📥 Server Response:", responseData);

    if (response.ok) {
      console.log("✅ Score successfully saved in database:", responseData);
    } else {
      console.error("❌ Failed to save score. Status:", response.status, responseData);
    }
  } catch (error) {
    console.error("❌ Network or Fetch Error:", error);
  }
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-yellow-200 to-blue-200 p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">🐾 Spot the Animals! 🦁</h1>

      {/* Environment Selection */}
      {!selectedEnv ? (
        <div className="grid grid-cols-3 gap-6">
          {Object.keys(environments).map((env) => (
            <motion.button
              key={env}
              onClick={() => handleEnvironmentSelect(env)}
              className="bg-white p-6 rounded-xl shadow-lg text-lg font-semibold hover:bg-green-300 transition"
              whileHover={{ scale: 1.1 }}
            >
              {environments[env].background}
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="text-center">
          {/* Image */}
          <img
            src={environments[selectedEnv].image}
            alt={environments[selectedEnv].name}
            className="w-80 h-52 object-cover rounded-lg shadow-lg mb-4"
          />

          <h2 className="text-2xl font-bold my-4">{environments[selectedEnv].background}</h2>

          {/* Animal Options */}
          <div className="grid grid-cols-3 gap-4">
            {environments[selectedEnv].options.map((animal) => (
              <motion.button
                key={animal}
                onClick={() => handleAnimalSelect(animal)}
                className={`px-6 py-3 rounded-lg text-lg transition ${
                  selectedAnimals.includes(animal)
                    ? "bg-green-600 text-white"
                    : "bg-gray-300 hover:bg-blue-400"
                }`}
                whileTap={{ scale: 0.9 }}
              >
                {animal}
              </motion.button>
            ))}
          </div>

          {/* Check Button */}
          <button
            onClick={checkSelection}
            className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg text-lg hover:bg-purple-800 transition"
          >
            ✅ Check Answers
          </button>

          {/* Feedback */}
          {feedback && (
            <motion.p className="mt-4 text-xl font-bold" animate={{ scale: [1, 1.1, 1] }}>
              {feedback}
            </motion.p>
          )}

          {/* Play Again Button */}
          <button
            onClick={() => setSelectedEnv(null)}
            className="mt-4 px-6 py-3 bg-red-500 text-white rounded-lg text-lg hover:bg-red-700 transition"
          >
            🔄 Choose Another Environment
          </button>
        </div>
      )}
    </div>
  );
}
