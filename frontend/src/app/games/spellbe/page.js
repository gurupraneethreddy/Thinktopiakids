"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import confetti from "canvas-confetti"
import { motion, AnimatePresence } from "framer-motion"

const words = {
  easy: [
    { word: "cat", emoji: "🐱" },
    { word: "dog", emoji: "🐶" },
    { word: "sun", emoji: "☀️" },
    { word: "hat", emoji: "👒" },
    { word: "bat", emoji: "🦇" },
    { word: "pen", emoji: "🖊️" },
    { word: "egg", emoji: "🥚" },
    { word: "box", emoji: "📦" },
    { word: "car", emoji: "🚗" },
    { word: "fan", emoji: "🌀" },
    { word: "tree", emoji: "🌳" },
    { word: "fish", emoji: "🐟" },
  ],
  medium: [
    { word: "apple", emoji: "🍎" },
    { word: "grape", emoji: "🍇" },
    { word: "table", emoji: "🪑" },
    { word: "chair", emoji: "🪑" },
    { word: "snake", emoji: "🐍" },
    { word: "pencil", emoji: "✏️" },
    { word: "window", emoji: "🪟" },
    { word: "rocket", emoji: "🚀" },
    { word: "planet", emoji: "🪐" },
    { word: "garden", emoji: "🏡" },
    { word: "bridge", emoji: "🌉" },
    { word: "tunnel", emoji: "🚇" },
  ],
  hard: [
    { word: "elephant", emoji: "🐘" },
    { word: "computer", emoji: "💻" },
    { word: "airplane", emoji: "✈️" },
    { word: "umbrella", emoji: "☂️" },
    { word: "sandwich", emoji: "🥪" },
    { word: "mountain", emoji: "⛰️" },
    { word: "blueprint", emoji: "📜" },
    { word: "television", emoji: "📺" },
    { word: "microwave", emoji: "🌡️" },
    { word: "adventure", emoji: "🌍" },
    { word: "helicopter", emoji: "🚁" },
    { word: "laboratory", emoji: "🔬" },
  ],
}

export default function SpellingBeeGame() {
  const router = useRouter()
  const [difficulty, setDifficulty] = useState(null)
  const [wordIndex, setWordIndex] = useState(0)
  const [selectedWords, setSelectedWords] = useState([])
  const [hiddenWord, setHiddenWord] = useState([])
  const [choices, setChoices] = useState([])
  const [selectedLetters, setSelectedLetters] = useState([])
  const [message, setMessage] = useState("")
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    if (difficulty) {
      const shuffledWords = shuffleArray([...words[difficulty]]).slice(0, 5)
      setSelectedWords(shuffledWords)
      setWordIndex(0)
      setScore(0)
      setGameOver(false)
      startNewGame(0, shuffledWords)
    }
  }, [difficulty])

  const startNewGame = (index, wordList) => {
    if (index >= wordList.length) return
    const randomWordObj = wordList[index]
    const randomWord = randomWordObj.word
    const hiddenIndexes = generateHiddenIndexes(randomWord.length)
    const wordWithBlanks = randomWord.split("").map((char, i) => (hiddenIndexes.includes(i) ? "_" : char))

    setHiddenWord(wordWithBlanks)
    setChoices(shuffleArray([...new Set([...hiddenIndexes.map((i) => randomWord[i]), ...generateRandomLetters(3)])]))
    setSelectedLetters([])
    setMessage("")
    setFeedback(null)
  }

  const generateHiddenIndexes = (length) => {
    const hideCount = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3
    const indexes = new Set()
    while (indexes.size < hideCount) {
      indexes.add(Math.floor(Math.random() * length))
    }
    return Array.from(indexes)
  }

  const generateRandomLetters = (count) => {
    const letters = "abcdefghijklmnopqrstuvwxyz"
    return Array.from({ length: count }, () => letters[Math.floor(Math.random() * letters.length)])
  }

  const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5)

  const selectLetter = (letter) => {
    if (gameOver) return
    const newHiddenWord = [...hiddenWord]
    const blankIndex = newHiddenWord.indexOf("_")
    if (blankIndex !== -1) {
      newHiddenWord[blankIndex] = letter
      setHiddenWord(newHiddenWord)
      setSelectedLetters([...selectedLetters, letter])
      setChoices(choices.filter((l) => l !== letter))
    }
  }

  const submitScore = async (score) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setAuthError("Please login to save your scores")
        return
      }

      const response = await fetch("http://localhost:5000/game/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject_id: 4,
          game_id: 2,
          score: score,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save score")
      }
    } catch (error) {
      console.error("Score submission error:", error)
      setAuthError(error.message)
    }
  }

  const checkAnswer = async () => {
    if (gameOver) return

    const isAnswerCorrect = hiddenWord.join("") === selectedWords[wordIndex].word
    let newScore = score

    if (isAnswerCorrect) {
      newScore += 1
      setScore(newScore)
      setFeedback("correct")
      setIsCorrect(true)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    } else {
      setFeedback("incorrect")
      setIsCorrect(false)
    }

    setTimeout(() => {
      if (wordIndex + 1 < selectedWords.length) {
        setWordIndex(wordIndex + 1)
        startNewGame(wordIndex + 1, selectedWords)
      } else {
        setMessage(`Game Over! Your score: ${newScore} / 5`)
        setGameOver(true)
        submitScore(newScore)

        if (newScore >= 3) {
          const duration = 3 * 1000
          const animationEnd = Date.now() + duration
          const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

          const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now()
            if (timeLeft <= 0) return clearInterval(interval)
            const particleCount = 50 * (timeLeft / duration)
            confetti({
              ...defaults,
              particleCount,
              origin: { x: Math.random(), y: Math.random() - 0.2 },
            })
          }, 250)
        }
      }
    }, 1500)
  }

  const difficultyColors = {
    easy: "from-green-400 to-green-600",
    medium: "from-yellow-400 to-yellow-600",
    hard: "from-red-400 to-red-600",
  }

  const difficultyEmojis = {
    easy: "🌟",
    medium: "🚀",
    hard: "🔥",
  }

  const getBackgroundColor = () => {
    if (!difficulty) return "bg-gradient-to-b from-blue-400 to-purple-500"
    return `bg-gradient-to-b ${difficultyColors[difficulty]}`
  }

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen ${getBackgroundColor()} p-4 font-rounded transition-all duration-500`}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-yellow-200 rounded-full opacity-50"></div>
        <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-pink-200 rounded-full opacity-50"></div>

        <h1 className="text-4xl font-bold mb-4 text-center text-purple-600 tracking-wide">
          Spelling Bee
          <span className="ml-2">🐝</span>
        </h1>

        {difficulty && !gameOver && (
          <div className="w-full bg-gray-200 h-4 rounded-full mb-6 overflow-hidden">
            <div
              className={`h-full ${difficulty === "easy" ? "bg-green-500" : difficulty === "medium" ? "bg-yellow-500" : "bg-red-500"}`}
              style={{ width: `${(wordIndex / 5) * 100}%` }}
            ></div>
          </div>
        )}

        {difficulty && selectedWords[wordIndex] && !gameOver && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-8xl mb-6 text-center"
          >
            {selectedWords[wordIndex].emoji}
          </motion.div>
        )}

        {!difficulty ? (
          <div className="mb-8 space-y-4">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">Choose a Level:</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDifficulty("easy")}
              className="w-full py-4 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-2xl text-xl font-bold shadow-lg flex items-center justify-center"
            >
              <span className="mr-2">{difficultyEmojis.easy}</span> Easy
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDifficulty("medium")}
              className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-2xl text-xl font-bold shadow-lg flex items-center justify-center"
            >
              <span className="mr-2">{difficultyEmojis.medium}</span> Medium
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDifficulty("hard")}
              className="w-full py-4 bg-gradient-to-r from-red-400 to-red-600 text-white rounded-2xl text-xl font-bold shadow-lg flex items-center justify-center"
            >
              <span className="mr-2">{difficultyEmojis.hard}</span> Hard
            </motion.button>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              {feedback === "correct" && (
                <motion.div
                  key="correct"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-20 left-0 right-0 text-center text-green-500 text-2xl font-bold"
                >
                  Correct! 🎉
                </motion.div>
              )}
              {feedback === "incorrect" && (
                <motion.div
                  key="incorrect"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-20 left-0 right-0 text-center text-red-500 text-2xl font-bold"
                >
                  Try again! 💪
                </motion.div>
              )}
            </AnimatePresence>

            {!gameOver ? (
              <>
                <div className="flex justify-center mb-8">
                  {hiddenWord.map((letter, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className={`w-12 h-12 mx-1 flex items-center justify-center text-2xl font-bold rounded-lg border-4 
                        ${letter === "_" ? "border-dashed border-gray-400 bg-gray-100" : "border-purple-500 bg-purple-100"}`}
                    >
                      {letter}
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  {choices.map((letter, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => selectLetter(letter)}
                      className="h-16 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl text-2xl font-bold shadow-md"
                      disabled={gameOver}
                    >
                      {letter}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={checkAnswer}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl text-xl font-bold shadow-lg"
                  disabled={gameOver || hiddenWord.includes("_")}
                >
                  {wordIndex === 4 ? "Finish Game!" : "Check Answer"}
                </motion.button>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <h2 className="text-3xl font-bold mb-4 text-purple-600">
                  {score >= 4 ? "Amazing Job! 🏆" : score >= 2 ? "Good Work! 🌟" : "Keep Practicing! 💪"}
                </h2>
                <p className="text-2xl mb-6">
                  Your score: <span className="font-bold text-pink-500">{score} / 5</span>
                </p>

                {authError && (
                  <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
                    {authError}
                  </div>
                )}

                <div className="flex flex-col gap-3 items-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDifficulty(null)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl text-xl font-bold shadow-lg w-full max-w-xs"
                  >
                    Play Again
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push("/learning_games/english")}
                    className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-xl text-xl font-bold shadow-lg w-full max-w-xs"
                  >
                    Back to English Games
                  </motion.button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
