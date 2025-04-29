"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import confetti from "canvas-confetti"
import { motion, AnimatePresence } from "framer-motion"

export default function CountingGame() {
  const router = useRouter()
  const [authError, setAuthError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Game themes with vibrant colors and fun characters
  const gameThemes = [
    { name: "Space", emoji: "🚀", bgClass: "from-indigo-400 to-purple-600", accent: "purple-500" },
    { name: "Ocean", emoji: "🐠", bgClass: "from-blue-400 to-cyan-600", accent: "blue-500" },
    { name: "Jungle", emoji: "🦁", bgClass: "from-green-400 to-emerald-600", accent: "green-500" },
    { name: "Candy", emoji: "🍭", bgClass: "from-pink-400 to-rose-600", accent: "pink-500" },
  ]

  // Fun question types with kid-friendly objects
  const questionTypes = [
    { icon: "🦄", text: "How many unicorns do you see?" },
    { icon: "🍦", text: "Count the ice cream cones!" },
    { icon: "🦖", text: "How many dinosaurs are there?" },
    { icon: "🚗", text: "Count the cars!" },
    { icon: "🎈", text: "How many balloons can you find?" },
    { icon: "🐶", text: "Count the puppies!" },
    { icon: "🌟", text: "How many stars can you see?" },
    { icon: "🍎", text: "Count the apples!" },
  ]

  // State variables
  const [theme, setTheme] = useState(gameThemes[0])
  const [difficulty, setDifficulty] = useState("easy")
  const [showSettings, setShowSettings] = useState(false)
  const [gameState, setGameState] = useState(null)
  const [message, setMessage] = useState("")
  const [score, setScore] = useState(0)
  const [questionCount, setQuestionCount] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [streak, setStreak] = useState(0)
  const [achievements, setAchievements] = useState([
    { id: "perfect", title: "Perfect Score!", description: "Get all answers correct", unlocked: false },
    { id: "streak", title: "On Fire!", description: "Get 3 correct answers in a row", unlocked: false },
  ])
  const [showAchievement, setShowAchievement] = useState(null)

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      setAuthError("Please login to save your scores")
    }
  }, [])

  // Generate a new question based on difficulty
  const generateNewQuestion = () => {
    const maxNumber = difficulty === "easy" ? 5 : difficulty === "medium" ? 10 : 15
    const minNumber = difficulty === "easy" ? 1 : difficulty === "medium" ? 3 : 5

    const targetNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)]

    const positions = []
    for (let i = 0; i < targetNumber; i++) {
      positions.push({
        x: Math.random() * 80,
        y: Math.random() * 80,
        rotation: Math.random() * 30 - 15,
        scale: 0.8 + Math.random() * 0.4,
      })
    }

    return {
      targetNumber,
      question: questionType,
      positions,
    }
  }

  // Initialize game
  useEffect(() => {
    if (gameStarted && !gameState) {
      startNewQuestion()
    }
  }, [gameStarted, gameState])

  // Start a new question
  const startNewQuestion = () => {
    const newQuestion = generateNewQuestion()
    setGameState(newQuestion)
    setMessage("")
    setSelectedAnswer(null)
    setQuestionCount((prev) => prev + 1)
  }

  // Enhanced score submission with retry logic
  const submitScore = async () => {
    setIsSubmitting(true)
    setAuthError(null)
    
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch("http://localhost:5000/game/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject_id: 1, // Math subject
          game_id: 2,    // Counting game
          score: score,
        }),
      })

      if (!response.ok) {
        // If unauthorized, try refreshing token once
        if (response.status === 401 || response.status === 403) {
          const refreshResponse = await fetch("http://localhost:5000/auth/refresh", {
            method: "POST",
            credentials: 'include',
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          })
          
          if (refreshResponse.ok) {
            const { accessToken } = await refreshResponse.json()
            localStorage.setItem("token", accessToken)
            
            // Retry with new token
            const retryResponse = await fetch("http://localhost:5000/game/submit", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                subject_id: 1,
                game_id: 2,
                score: score,
              }),
            })

            if (!retryResponse.ok) {
              throw new Error(`Server responded with ${retryResponse.status}`)
            }

            const data = await retryResponse.json()
            console.log("Score saved successfully after refresh:", data)
            return data
          } else {
            throw new Error("Session expired - please log in again")
          }
        } else {
          throw new Error(`Server responded with ${response.status}`)
        }
      }

      const data = await response.json()
      console.log("Score saved successfully:", data)
      return data
      
    } catch (error) {
      console.error("Failed to save score:", error)
      setAuthError(error.message)
      
      if (error.message.includes("Session expired") || 
          error.message.includes("No authentication")) {
        localStorage.removeItem("token")
      }
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check the selected answer
  const checkAnswer = async (num) => {
    setSelectedAnswer(num)

    const isCorrect = num === gameState.targetNumber
    if (isCorrect) {
      setMessage("✅ Correct! Great job!")
      setScore(score + 1)
      setStreak(streak + 1)
      checkAchievements()
    } else {
      setMessage(`❌ Oops! The correct answer was ${gameState.targetNumber}.`)
      setStreak(0)
    }

    const isLastQuestion = questionCount >= (difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 10)
    
    if (isLastQuestion) {
      setTimeout(async () => {
        setGameOver(true)
        
        try {
          await submitScore()
          
          // Check for perfect score achievement
          const finalScore = score + (isCorrect ? 1 : 0)
          const totalQuestions = difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 10
          
          if (finalScore === totalQuestions) {
            unlockAchievement("perfect")
          }

          // Trigger confetti for good scores (70% or above)
          const scorePercentage = finalScore / totalQuestions
          if (scorePercentage >= 0.7) {
            triggerConfetti()
          }
        } catch (error) {
          console.error("Score submission error:", error)
        }
      }, 1500)
    }
  }

  // Check for achievements
  const checkAchievements = () => {
    if (streak + 1 >= 3 && !achievements.find((a) => a.id === "streak").unlocked) {
      unlockAchievement("streak")
    }
  }

  // Unlock an achievement
  const unlockAchievement = (id) => {
    setAchievements((prev) => prev.map((a) => (a.id === id ? { ...a, unlocked: true } : a)))
    setShowAchievement(achievements.find((a) => a.id === id))
    setTimeout(() => setShowAchievement(null), 3000)
  }

  // Trigger confetti animation
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }

  // Move to next question
  const handleNextQuestion = () => {
    startNewQuestion()
  }

  // Restart the game
  const restartGame = () => {
    setScore(0)
    setQuestionCount(0)
    setGameOver(false)
    setGameState(null)
    setMessage("")
    setSelectedAnswer(null)
    setStreak(0)
    setGameStarted(true)
    setShowIntro(false)
    setAuthError(null)
  }

  // Start the game
  const startGame = () => {
    setGameStarted(true)
    setShowIntro(false)
  }

  // Toggle settings modal
  const toggleSettings = () => {
    setShowSettings(!showSettings)
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-r ${theme.bgClass} p-6 transition-all duration-500`}>
      {/* Game Title with Bouncing Animation */}
      <div className="flex items-center mb-6">
        <motion.span
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className="text-5xl mr-3"
        >
          {theme.emoji}
        </motion.span>
        <h1 className="text-4xl font-bold text-white drop-shadow-lg">Counting Adventure</h1>
      </div>

      {/* Settings Button */}
      <button
        onClick={toggleSettings}
        className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/30 transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h2 className="text-2xl font-bold mb-4">Game Settings</h2>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Choose Theme:</h3>
              <div className="grid grid-cols-2 gap-2">
                {gameThemes.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setTheme(t)}
                    className={`p-3 rounded-lg flex items-center ${
                      theme.name === t.name ? `ring-2 ring-offset-2 ring-${t.accent} bg-${t.accent}/10` : "bg-gray-100"
                    }`}
                  >
                    <span className="text-2xl mr-2">{t.emoji}</span>
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Difficulty:</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setDifficulty("easy")}
                  className={`px-4 py-2 rounded-lg ${difficulty === "easy" ? "bg-green-500 text-white" : "bg-gray-200"}`}
                >
                  Easy
                </button>
                <button
                  onClick={() => setDifficulty("medium")}
                  className={`px-4 py-2 rounded-lg ${difficulty === "medium" ? "bg-yellow-500 text-white" : "bg-gray-200"}`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setDifficulty("hard")}
                  className={`px-4 py-2 rounded-lg ${difficulty === "hard" ? "bg-red-500 text-white" : "bg-gray-200"}`}
                >
                  Hard
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={toggleSettings} className={`px-4 py-2 rounded-lg text-white bg-${theme.accent}`}>
                Save Settings
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Achievement Notification */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full shadow-lg z-50"
          >
            <div className="flex items-center">
              <span className="text-2xl mr-2">🏆</span>
              <div>
                <p className="font-bold">{showAchievement.title}</p>
                <p className="text-sm">{showAchievement.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intro Screen */}
      {showIntro && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl text-center max-w-md"
        >
          <div className="relative h-32 mb-4">
            {gameThemes.map((char, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  x: (i - 1.5) * 40,
                }}
                transition={{
                  delay: i * 0.1,
                  type: "spring",
                }}
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 10, 0, -10, 0],
                  }}
                  transition={{
                    duration: 2 + i * 0.5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                  className="text-6xl"
                >
                  {char.emoji}
                </motion.div>
              </motion.div>
            ))}
          </div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold mb-4"
          >
            Counting Adventure
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-6 text-gray-700"
          >
            Count the objects and select the correct answer! Earn achievements and beat your high score!
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-3"
          >
            <button
              onClick={startGame}
              className={`w-full px-6 py-3 rounded-xl text-white font-bold text-lg bg-${theme.accent} transition-transform transform hover:scale-105`}
            >
              Start Game
            </button>
            <button
              onClick={toggleSettings}
              className="w-full px-6 py-3 rounded-xl bg-gray-200 text-gray-800 font-bold text-lg transition-transform transform hover:scale-105"
            >
              Settings
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Main Game */}
      {gameStarted && !gameOver && !showIntro && gameState && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl text-center max-w-2xl w-full"
        >
          {/* Progress Bar */}
          <div className="mb-4 bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
              style={{
                width: `${(questionCount / (difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 10)) * 100}%`,
              }}
            ></div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <p className="text-xl font-bold">
              Question {questionCount} of {difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 10}
            </p>
            <div className="flex items-center">
              <span className="text-xl mr-2">💯</span>
              <span className="text-xl font-bold">{score}</span>
            </div>
          </div>

          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-bold mb-6"
          >
            {gameState.question.text}
          </motion.h2>

          {/* Display Objects for Counting */}
          <div className="relative h-48 mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border-4 border-white">
            {gameState.positions.map((pos, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: 0 }}
                animate={{
                  scale: pos.scale,
                  rotate: pos.rotation,
                  x: `${pos.x}%`,
                  y: `${pos.y}%`,
                }}
                whileHover={{
                  scale: pos.scale * 1.3,
                  rotate: pos.rotation + 15,
                  transition: { duration: 0.2 },
                }}
                transition={{
                  type: "spring",
                  delay: i * 0.05,
                  duration: 0.5,
                }}
                className="absolute text-4xl transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                {gameState.question.icon}
              </motion.div>
            ))}
          </div>

          {/* Answer Buttons */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {Array.from({ length: difficulty === "easy" ? 5 : difficulty === "medium" ? 10 : 15 }, (_, i) => i + 1)
              .filter((num) => difficulty === "easy" || num <= (difficulty === "medium" ? 10 : 15))
              .map((num) => (
                <motion.button
                  key={num}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selectedAnswer === null && checkAnswer(num)}
                  disabled={selectedAnswer !== null}
                  className={`p-3 rounded-lg text-lg font-bold transition ${
                    selectedAnswer === null
                      ? `bg-${theme.accent} bg-opacity-90 text-white shadow-lg`
                      : selectedAnswer === num && num === gameState.targetNumber
                        ? "bg-green-500 text-white"
                        : selectedAnswer === num
                          ? "bg-red-500 text-white"
                          : num === gameState.targetNumber && selectedAnswer !== null
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {num}
                </motion.button>
              ))}
          </div>

          {/* Result Message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mt-4 p-3 rounded-lg text-lg font-bold ${
                  message.includes("Correct")
                    ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-l-4 border-green-500"
                    : "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-l-4 border-red-500"
                }`}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Question Button */}
          {selectedAnswer !== null &&
            questionCount < (difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 10) && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
                onClick={handleNextQuestion}
                className={`mt-4 px-6 py-3 rounded-xl text-white font-bold text-lg bg-${theme.accent}`}
              >
                <div className="flex items-center justify-center">
                  <span>Next Question</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
                    className="ml-2"
                  >
                    →
                  </motion.span>
                </div>
              </motion.button>
            )}
        </motion.div>
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="text-6xl mb-2"
          >
            🎉
          </motion.div>

          <h2 className="text-3xl font-bold mb-2">Game Complete!</h2>

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

          <div className="mb-6">
            <p className="text-2xl">Your score:</p>
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="text-5xl font-bold my-4"
            >
              {score} / {difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 10}
            </motion.p>
            <p className="text-lg">
              {score === (difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 10)
                ? "Perfect score! Amazing job! 🌟"
                : score >= (difficulty === "easy" ? 4 : difficulty === "medium" ? 6 : 8)
                  ? "Great job! You're a counting master! 🏆"
                  : score >= (difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5)
                    ? "Good effort! Keep practicing! 👍"
                    : "You can do better! Try again! 💪"}
            </p>
          </div>

          {/* Achievements */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">Achievements:</h3>
            <div className="grid grid-cols-1 gap-2">
              {achievements.map((achievement, i) => (
                <motion.div
                  key={achievement.id}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.2 }}
                  className={`p-3 rounded-lg flex items-center ${
                    achievement.unlocked
                      ? "bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-300"
                      : "bg-gray-100 opacity-70"
                  }`}
                >
                  <span className="text-2xl mr-2">{achievement.unlocked ? "🏆" : "🔒"}</span>
                  <div className="text-left">
                    <p className="font-bold">{achievement.title}</p>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={restartGame}
              className={`w-full px-6 py-3 rounded-xl text-white font-bold text-lg bg-${theme.accent}`}
            >
              Play Again
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/learning_games/math")}
              className="w-full px-6 py-3 rounded-xl bg-gray-200 text-gray-800 font-bold text-lg"
            >
              Back to Math Games
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
