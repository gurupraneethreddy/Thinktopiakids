
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star, Sparkles, RefreshCw, ArrowLeft } from "lucide-react"
import confetti from "canvas-confetti"
import { useRouter } from "next/navigation"

export default function WordHunt() {
  const router = useRouter()
  // Game configuration
  const gridSize = 10
  const themes = {
    animals: ["CAT", "DOG", "LION", "TIGER", "BEAR", "ZEBRA", "MONKEY", "GIRAFFE"],
    colors: ["RED", "BLUE", "GREEN", "YELLOW", "PURPLE", "ORANGE", "PINK", "WHITE"],
    fruits: ["APPLE", "BANANA", "ORANGE", "GRAPE", "MANGO", "CHERRY", "LEMON", "KIWI"],
  }

  // Game state
  const [theme, setTheme] = useState("animals")
  const [grid, setGrid] = useState(() => 
    Array.from({ length: gridSize }, () => Array(gridSize).fill(""))
  )
  const [words, setWords] = useState([])
  const [foundWords, setFoundWords] = useState([])
  const [score, setScore] = useState(0)
  const [hints, setHints] = useState({})
  const [attempts, setAttempts] = useState({})
  const [selection, setSelection] = useState({
    start: [-1, -1],
    end: [-1, -1],
    cells: [],
  })
  const [isDragging, setIsDragging] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)

  const gridRef = useRef(null)

  // Initialize game
  useEffect(() => {
    generateNewPuzzle()
  }, [theme])

  // Generate a new puzzle
  const generateNewPuzzle = useCallback(() => {
    const themeWords = themes[theme]
    setWords(themeWords)
    setFoundWords([])
    setScore(0)
    setHints({})
    setAttempts({})
    setGameComplete(false)

    // Create empty grid
    const newGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(""))

    // Place words in grid
    const placedWords = placeWordsInGrid(themeWords, newGrid)

    // Fill remaining cells with random letters
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (newGrid[i][j] === "") {
          newGrid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26))
        }
      }
    }

    setGrid(newGrid)
    setWords(placedWords)
  }, [theme])

  // Place words in grid
  const placeWordsInGrid = (wordList, grid) => {
    const directions = [
      [0, 1], // right
      [1, 0], // down
      [1, 1], // diagonal down-right
      [0, -1], // left
      [-1, 0], // up
      [-1, -1], // diagonal up-left
      [1, -1], // diagonal down-left
      [-1, 1], // diagonal up-right
    ]

    const placedWords = []

    for (const word of wordList) {
      let placed = false
      let attempts = 0

      while (!placed && attempts < 100) {
        attempts++

        const direction = directions[Math.floor(Math.random() * directions.length)]
        const row = Math.floor(Math.random() * gridSize)
        const col = Math.floor(Math.random() * gridSize)

        if (canPlaceWord(word, row, col, direction, grid)) {
          for (let i = 0; i < word.length; i++) {
            const r = row + i * direction[0]
            const c = col + i * direction[1]
            grid[r][c] = word[i]
          }
          placed = true
          placedWords.push(word)
        }
      }

      if (!placed) {
        console.warn(`Failed to place word: ${word}`)
      }
    }

    return placedWords
  }

  // Check if a word can be placed at a specific position and direction
  const canPlaceWord = (word, row, col, direction, grid) => {
    for (let i = 0; i < word.length; i++) {
      const r = row + i * direction[0]
      const c = col + i * direction[1]

      // Check if position is out of bounds
      if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) {
        return false
      }

      // Check if cell is already filled with a different letter
      if (grid[r][c] !== "" && grid[r][c] !== word[i]) {
        return false
      }
    }

    return true
  }

  // Handle mouse/touch events for word selection
  const handleMouseDown = (row, col) => {
    setIsDragging(true)
    setSelection({
      start: [row, col],
      end: [row, col],
      cells: [[row, col]],
    })
  }

  const handleMouseMove = (row, col) => {
    if (!isDragging) return

    const [startRow, startCol] = selection.start
    const rowDiff = row - startRow
    const colDiff = col - startCol

    let cells = []

    if (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) {
      const rowDir = rowDiff === 0 ? 0 : rowDiff > 0 ? 1 : -1
      const colDir = colDiff === 0 ? 0 : colDiff > 0 ? 1 : -1

      const length = Math.max(Math.abs(rowDiff), Math.abs(colDiff))
      cells = Array.from({ length: length + 1 }, (_, i) => [
        startRow + i * rowDir,
        startCol + i * colDir,
      ])
    } else {
      cells = [selection.start]
    }

    setSelection({
      ...selection,
      end: [row, col],
      cells,
    })
  }

  const handleMouseUp = () => {
    if (!isDragging) return

    setIsDragging(false)

    const selectedWord = selection.cells.map(([r, c]) => grid[r][c]).join("")

    if (words.includes(selectedWord) && !foundWords.includes(selectedWord)) {
      setFoundWords([...foundWords, selectedWord])
      const wordScore = selectedWord.length * 10
      setScore(score + wordScore)
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 2000)

      // Small confetti for each word found
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      })
    } else {
      const newAttempts = { ...attempts }
      words.forEach((word) => {
        if (!foundWords.includes(word)) {
          newAttempts[word] = (newAttempts[word] || 0) + 1

          if (newAttempts[word] >= 3) {
            setHints((prev) => ({ ...prev, [word]: true }))
          }
        }
      })
      setAttempts(newAttempts)
    }

    setSelection({
      start: [-1, -1],
      end: [-1, -1],
      cells: [],
    })
  }

  // Check if a cell is in the current selection
  const isCellSelected = (row, col) => {
    return selection.cells.some(([r, c]) => r === row && c === col)
  }

  // Check if a cell is part of a found word
  const isCellInFoundWord = (row, col) => {
    // This is a simplified implementation - you might want to track exact positions
    return false
  }

  // Submit score to backend
  const submitScore = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("No token found. User must be logged in to submit score.")
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
          game_id: 1,  // Word Hunt game ID is 1
          score: score,
        }),
      })

      const data = await response.json()
      console.log("Score submission response:", data)
    } catch (error) {
      console.error("Error submitting score:", error)
    }
  }

  // Check if all words are found and submit score
  useEffect(() => {
    if (foundWords.length === words.length && words.length > 0 && !gameComplete) {
      setGameComplete(true)
      submitScore()

      // Big celebration when all words are found
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
  }, [foundWords, words, score, gameComplete])

  // Handle global mouse up event
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp()
      }
    }

    document.addEventListener("mouseup", handleGlobalMouseUp)
    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [isDragging, handleMouseUp])

  // Change theme
  const changeTheme = (newTheme) => {
    setTheme(newTheme)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <h1 className="text-4xl font-bold text-center mb-2 text-purple-600">Word Hunt</h1>
      <p className="text-lg text-center mb-6 text-purple-500">Find all the hidden words!</p>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <Button
          variant={theme === "animals" ? "default" : "outline"}
          onClick={() => changeTheme("animals")}
          className="rounded-full"
        >
          Animals
        </Button>
        <Button
          variant={theme === "colors" ? "default" : "outline"}
          onClick={() => changeTheme("colors")}
          className="rounded-full"
        >
          Colors
        </Button>
        <Button
          variant={theme === "fruits" ? "default" : "outline"}
          onClick={() => changeTheme("fruits")}
          className="rounded-full"
        >
          Fruits
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
        {/* Game grid */}
        <Card className="p-4 flex-grow relative">
          <div
            ref={gridRef}
            className="grid gap-1 relative"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              touchAction: "none",
            }}
            onMouseLeave={handleMouseUp}
            onTouchEnd={handleMouseUp}
          >
            {grid.map((row, rowIndex) =>
              row.map((letter, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center 
                    rounded-md font-bold text-sm sm:text-lg transition-all
                    ${
                      isCellSelected(rowIndex, colIndex)
                        ? "bg-yellow-300 scale-110 z-10"
                        : isCellInFoundWord(rowIndex, colIndex)
                          ? "bg-green-200"
                          : "bg-white"
                    }
                    border-2 border-purple-200 cursor-pointer
                  `}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseMove={() => handleMouseMove(rowIndex, colIndex)}
                  onMouseUp={handleMouseUp}
                  onTouchStart={() => handleMouseDown(rowIndex, colIndex)}
                  onTouchMove={(e) => {
                    if (gridRef.current) {
                      const rect = gridRef.current.getBoundingClientRect()
                      const touch = e.touches[0]
                      const x = touch.clientX - rect.left
                      const y = touch.clientY - rect.top
                      const cellWidth = rect.width / gridSize
                      const cellHeight = rect.height / gridSize
                      const col = Math.floor(x / cellWidth)
                      const row = Math.floor(y / cellHeight)
                      if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
                        handleMouseMove(row, col)
                      }
                    }
                  }}
                >
                  {letter}
                </div>
              ))
            )}
          </div>

          {/* Celebration animation */}
          {showCelebration && (
            <div className="absolute inset-0 pointer-events-none">
              {Array(20)
                .fill(0)
                .map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    initial={{
                      x: `${Math.random() * 100}%`,
                      y: `${Math.random() * 100}%`,
                      scale: 0,
                      opacity: 1,
                    }}
                    animate={{
                      y: `${Math.random() * 100}%`,
                      scale: [0, 1 + Math.random()],
                      opacity: [1, 0],
                    }}
                    transition={{ duration: 1 + Math.random() }}
                  >
                    <Star className="text-yellow-400" size={16 + Math.random() * 16} />
                  </motion.div>
                ))}
            </div>
          )}
        </Card>

        {/* Word list and score */}
        <div className="flex flex-col gap-4 w-full md:w-64">
          <Card className="p-4">
            <h2 className="text-xl font-bold mb-2 text-purple-600 flex items-center">
              <Sparkles className="mr-2 h-5 w-5" /> Score: {score}
            </h2>

            <div className="flex flex-col gap-2">
              {words.map((word) => (
                <div
                  key={word}
                  className={`
                    p-2 rounded-lg font-medium transition-all
                    ${
                      foundWords.includes(word)
                        ? "bg-green-100 text-green-700 line-through"
                        : "bg-purple-50 text-purple-700"
                    }
                  `}
                >
                  {hints[word] && !foundWords.includes(word) ? (
                    <span>
                      <span className="text-red-500 font-bold">{word[0]}</span>
                      {word.slice(1)}
                    </span>
                  ) : (
                    word
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Button onClick={generateNewPuzzle} className="w-full" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> New Puzzle
          </Button>

          {gameComplete && (
            <Card className="p-4 bg-yellow-100 border-yellow-300">
              <h3 className="text-lg font-bold text-yellow-700">Congratulations!</h3>
              <p className="text-yellow-700">You found all the words!</p>
              <p className="text-yellow-700 font-bold">Final Score: {score}</p>
              <Button 
                onClick={generateNewPuzzle}
                className="mt-2 w-full"
                variant="outline"
              >
                Play Again
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Back button that appears when game is complete */}
      {gameComplete && (
        <Button 
          onClick={() => router.push('/learning_games/english')}
          className="mt-6"
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to English Games
        </Button>
      )}
    </div>
  )
}
