"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

// Country Data (Flags, Landmarks, Hints)
const countryData = [
  {
    country: "United States",
    flag: "/images/flags/Usa.png",
    landmark: "Statue of Liberty",
    landmarkImage: "/images/landmarks/Statue.png",
    hints: ["🦅 National bird is a bald eagle", "📍 Capital: Washington, D.C."],
    emoji: "🇺🇸",
  },
  {
    country: "India",
    flag: "/images/flags/India.png",
    landmark: "Taj Mahal",
    landmarkImage: "/images/landmarks/Tajmahal.png",
    hints: ["🕌 The Taj Mahal changes color!", "📍 Capital: New Delhi"],
    emoji: "🇮🇳",
  },
  {
    country: "France",
    flag: "/images/flags/France.png",
    landmark: "Eiffel Tower",
    landmarkImage: "/images/landmarks/Effil.png",
    hints: ["🗼 It can be 15 cm taller in summer!", "📍 Capital: Paris"],
    emoji: "🇫🇷",
  },
  {
    country: "Brazil",
    flag: "/images/flags/Brazil.png",
    landmark: "Christ the Redeemer",
    landmarkImage: "/images/landmarks/Statue2.png",
    hints: ["🌳 Home to the Amazon Rainforest", "📍 Capital: Brasília"],
    emoji: "🇧🇷",
  },
  {
    country: "Japan",
    flag: "/images/flags/Japan.png",
    landmark: "Mount Fuji",
    landmarkImage: "/images/landmarks/Mount.png",
    hints: ["🐱 Has an island where cats outnumber people!", "📍 Capital: Tokyo"],
    emoji: "🇯🇵",
  },
]

// Function to shuffle an array
const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5)

const LandmarkAdventure = () => {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [hintsRevealed, setHintsRevealed] = useState(0)
  const [wrongAttempt, setWrongAttempt] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)
  const [options, setOptions] = useState([])
  const router = useRouter()

  // Get current country
  const currentCountry = countryData[questionIndex]

  // Initialize options when question changes
  useEffect(() => {
    const newOptions = shuffleArray([
      currentCountry.country,
      ...shuffleArray(countryData.map((c) => c.country).filter((c) => c !== currentCountry.country)).slice(0, 3),
    ])
    setOptions(newOptions)
    setSelectedOption(null)
    setIsCorrect(null)
    setHintsRevealed(0)
    setWrongAttempt(false)
    setHintsUsed(false)
  }, [questionIndex])

  // Progress calculation
  const progress = (questionIndex / countryData.length) * 100

  // Check answer
  const handleGuess = (selectedCountry) => {
    setSelectedOption(selectedCountry)
    setIsCorrect(selectedCountry === currentCountry.country)

    if (selectedCountry === currentCountry.country) {
      if (!hintsUsed) {
        setScore(score + 1)
      }
    } else {
      setWrongAttempt(true)
    }
  }

  // Reveal hint
  const revealHint = () => {
    if (hintsRevealed < currentCountry.hints.length) {
      setHintsRevealed(hintsRevealed + 1)
      setHintsUsed(true)
    }
  }

  const saveScore = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("User not authenticated")
        return
      }

      const response = await fetch("http://localhost:5000/game/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject_id: 3,
          game_id: 1,
          score: score,
        }),
      })

      const data = await response.json()
      console.log("Score saved:", data)
    } catch (error) {
      console.error("Error saving score:", error)
    }
  }

  // Move to next question
  const nextQuestion = () => {
    if (questionIndex + 1 < countryData.length) {
      setQuestionIndex(questionIndex + 1)
    } else {
      saveScore()
      setGameOver(true)
    }
  }

  // Display game over message
  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h1 className="text-4xl font-bold text-purple-600 mb-6">🎉 Adventure Complete! 🎉</h1>

          <div className="mb-6">
            <p className="text-2xl font-bold mb-2">Your Score:</p>
            <div className="text-5xl font-extrabold text-blue-600">
              {score} / {countryData.length}
            </div>
          </div>

          {score === countryData.length ? (
            <p className="text-xl text-green-600 font-bold">Perfect Score! You're amazing! 🌟</p>
          ) : score >= countryData.length / 2 ? (
            <p className="text-xl text-blue-600 font-bold">Great job! You know your landmarks! 🗺️</p>
          ) : (
            <p className="text-xl text-orange-500 font-bold">Keep exploring! You'll be a world traveler soon! 🧭</p>
          )}

          <div className="mt-6 flex flex-col space-y-3">
            <button
              onClick={() => {
                setQuestionIndex(0)
                setScore(0)
                setGameOver(false)
              }}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold"
            >
              Play Again
            </button>
            <button
              onClick={() => router.push("/learning_games/gk")}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-bold"
            >
              Back to Learning Games
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 p-4 sm:p-6">
      {/* Header with progress */}
      <div className="w-full max-w-3xl mb-4">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">🌍 World Landmark Adventure!</h1>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium">
            {questionIndex + 1} of {countryData.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* Left column: Flag and Landmark */}
        <div className="space-y-4">
          {/* Flag Card */}
          <div className="bg-white rounded-xl overflow-hidden border-2 border-blue-200 shadow-md">
            <div className="bg-blue-50 p-2 text-center font-bold text-blue-700">Can you guess this country's flag?</div>
            <div className="p-4 flex justify-center">
              <div className="relative w-[200px] h-[120px] shadow-sm rounded-md overflow-hidden">
                <Image
                  src={currentCountry.flag || "/placeholder.svg"}
                  alt="Flag"
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Landmark Card */}
          <div className="bg-white rounded-xl overflow-hidden border-2 border-purple-200 shadow-md">
            <div className="bg-purple-50 p-2 text-center font-bold text-purple-700">Famous Landmark</div>
            <div className="p-4 flex justify-center">
              <div className="relative w-full h-[180px] shadow-sm rounded-md overflow-hidden">
                <Image
                  src={currentCountry.landmarkImage || "/placeholder.svg"}
                  alt={currentCountry.landmark}
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-md"
                />
              </div>
            </div>
            <div className="px-4 pb-4 text-center text-gray-600">
              <p>{currentCountry.landmark}</p>
            </div>
          </div>
        </div>

        {/* Right column: Game controls */}
        <div className="space-y-4">
          {/* Question Card */}
          <div className="bg-white rounded-xl p-4 border-2 border-green-200 shadow-md">
            <h2 className="text-xl font-bold text-green-700 mb-4 text-center">Which country is this?</h2>

            {/* Multiple-Choice Options */}
            <div className="grid grid-cols-1 gap-3">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !selectedOption && handleGuess(option)}
                  className={`w-full py-3 text-lg font-bold text-white rounded-xl transition-all ${
                    selectedOption 
                      ? option === currentCountry.country
                        ? "bg-green-500"
                        : option === selectedOption
                          ? "bg-red-500"
                          : "bg-gray-400"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                  disabled={!!selectedOption}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Hints Card */}
          <div className="bg-white rounded-xl p-4 border-2 border-yellow-200 shadow-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-yellow-700">Need Help?</h3>
              {hintsRevealed < currentCountry.hints.length && !selectedOption && (
                <button
                  onClick={revealHint}
                  className="px-3 py-1 bg-yellow-100 border border-yellow-300 text-yellow-700 hover:bg-yellow-200 rounded-lg"
                >
                  Show Hint {hintsRevealed + 1}
                </button>
              )}
            </div>

            {/* Display Hints */}
            <div className="space-y-2 min-h-[80px]">
              {currentCountry.hints.slice(0, hintsRevealed).map((hint, index) => (
                <div key={index} className="p-2 bg-yellow-50 rounded-lg text-gray-700">
                  {hint}
                </div>
              ))}

              {/* Show Answer if wrong and all hints used */}
              {selectedOption && (
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className={`font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                    {isCorrect ? "✅ Correct!" : "❌ Incorrect!"}
                  </p>
                  {!isCorrect && (
                    <p className="text-blue-700 mt-1">
                      The correct answer is {currentCountry.emoji} {currentCountry.country}
                    </p>
                  )}
                  <button
                    onClick={nextQuestion}
                    className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  >
                    {questionIndex + 1 === countryData.length ? "See Results" : "Next Question"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Score Display */}
      <div className="mt-6 bg-white px-6 py-3 rounded-full shadow-md">
        <span className="text-xl font-bold text-blue-700">🎯 Score: {score}</span>
      </div>
    </div>
  )
}

export default LandmarkAdventure
