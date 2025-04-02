"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Gamepad2Icon as GameController2 } from "lucide-react"

export default function SudokuGame() {
  const router = useRouter()
  // Game states
  const [gameStarted, setGameStarted] = useState(false)
  const [difficulty, setDifficulty] = useState(null)
  const [board, setBoard] = useState([])
  const [solution, setSolution] = useState([])
  const [userBoard, setUserBoard] = useState([])
  const [selectedCell, setSelectedCell] = useState(null)
  const [timer, setTimer] = useState(0)
  const [lives, setLives] = useState(3)
  const [isCompleted, setIsCompleted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [stars, setStars] = useState(0)
  const [showCongrats, setShowCongrats] = useState(false)
  const timerRef = useRef(null)
  const wrongCellRef = useRef(null)

  // Constants for different grid sizes
  const GRID_SIZES = {
    easy: 9,
    medium: 9,
    hard: 9,
    extreme: 9,
    giant: 16,
  }

  // Time thresholds for star ratings (in seconds)
  const TIME_THRESHOLDS = {
    easy: { three: 180, two: 300 },
    medium: { three: 300, two: 480 },
    hard: { three: 480, two: 720 },
    extreme: { three: 720, two: 1080 },
    giant: { three: 1200, two: 1800 },
  }

  // Generate a Sudoku puzzle based on difficulty
  const generateSudoku = (level) => {
    const gridSize = GRID_SIZES[level]
    const boxSize = gridSize === 9 ? 3 : 4

    const solvedBoard = generateSolvedSudoku(gridSize, boxSize)
    let removedCells
    if (level === "easy") removedCells = 40
    else if (level === "medium") removedCells = 50
    else if (level === "hard") removedCells = 55
    else if (level === "extreme") removedCells = 60
    else if (level === "giant") removedCells = 180

    const puzzle = createPuzzle(solvedBoard, gridSize, removedCells)
    const initialUserBoard = puzzle.map((row) => [...row])

    setBoard(puzzle)
    setSolution(solvedBoard)
    setUserBoard(initialUserBoard)
    setSelectedCell(null)
    setDifficulty(level)
    setGameStarted(true)
    setTimer(0)
    setLives(3)
    setIsCompleted(false)
    setGameOver(false)
    setStars(0)
    setShowCongrats(false)

    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1)
    }, 1000)
  }

  const generateSolvedSudoku = (gridSize, boxSize) => {
    if (gridSize === 9) {
      const base = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9],
      ]
      return shuffleSudoku(base, gridSize, boxSize)
    } else {
      const base = Array(16)
        .fill()
        .map(() => Array(16).fill(0))
      for (let i = 0; i < 16; i++) {
        base[0][i] = i + 1 <= 9 ? i + 1 : String.fromCharCode(55 + (i + 1))
      }
      for (let i = 1; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
          const val = (j + i * 4) % 16
          base[i][j] = base[0][val]
        }
      }
      return base
    }
  }

  const shuffleSudoku = (board, gridSize, boxSize) => {
    return board
  }

  const createPuzzle = (solvedBoard, gridSize, removedCells) => {
    const puzzle = solvedBoard.map((row) => [...row])
    const positions = []
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        positions.push([i, j])
      }
    }
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[positions[i], positions[j]] = [positions[j], positions[i]]
    }
    for (let i = 0; i < removedCells && i < positions.length; i++) {
      const [row, col] = positions[i]
      puzzle[row][col] = null
    }
    return puzzle
  }

  const handleCellClick = (row, col) => {
    if (isCompleted || gameOver) return
    if (board[row][col] === null) {
      setSelectedCell({ row, col })
    }
  }

  const handleNumberInput = (value) => {
    if (!selectedCell || isCompleted || gameOver) return
    const { row, col } = selectedCell
    if (board[row][col] !== null) return

    const newUserBoard = [...userBoard]
    if (value === solution[row][col]) {
      newUserBoard[row][col] = value
      setUserBoard(newUserBoard)
      if (isBoardComplete(newUserBoard)) {
        handleGameCompletion()
      }
    } else {
      setLives((prev) => prev - 1)
      wrongCellRef.current = { row, col }
      setTimeout(() => {
        wrongCellRef.current = null
      }, 1000)
      if (lives - 1 <= 0) {
        handleGameOver()
      }
    }
  }

  const isBoardComplete = (board) => {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === null) return false
      }
    }
    return true
  }

  const handleGameCompletion = () => {
    setIsCompleted(true)
    clearInterval(timerRef.current)
    let earnedStars = 1
    if (lives === 3) {
      if (timer <= TIME_THRESHOLDS[difficulty].three) earnedStars = 3
      else if (timer <= TIME_THRESHOLDS[difficulty].two) earnedStars = 2
    } else if (lives === 2) {
      if (timer <= TIME_THRESHOLDS[difficulty].two) earnedStars = 2
    }
    setStars(earnedStars)
    setShowCongrats(true)
  }

  const handleGameOver = () => {
    setGameOver(true)
    clearInterval(timerRef.current)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted || isCompleted || gameOver || !selectedCell) return
      const gridSize = GRID_SIZES[difficulty]
      if (e.key >= "1" && e.key <= "9") {
        handleNumberInput(Number.parseInt(e.key))
      } else if (gridSize === 16 && e.key.match(/^[a-gA-G]$/)) {
        handleNumberInput(e.key.toUpperCase())
      } else if (e.key === "ArrowUp" && selectedCell.row > 0) {
        setSelectedCell((prev) => ({ row: prev.row - 1, col: prev.col }))
      } else if (e.key === "ArrowDown" && selectedCell.row < gridSize - 1) {
        setSelectedCell((prev) => ({ row: prev.row + 1, col: prev.col }))
      } else if (e.key === "ArrowLeft" && selectedCell.col > 0) {
        setSelectedCell((prev) => ({ row: prev.row, col: prev.col - 1 }))
      } else if (e.key === "ArrowRight" && selectedCell.col < gridSize - 1) {
        setSelectedCell((prev) => ({ row: prev.row, col: prev.col + 1 }))
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [gameStarted, isCompleted, gameOver, selectedCell, difficulty])

  const renderGameBoard = () => {
    if (!board.length) return null
    const gridSize = board.length
    const boxSize = gridSize === 9 ? 3 : 4

    return (
      <div className="mb-6 overflow-x-auto">
        <div
          className="grid gap-0.5 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(${gridSize === 16 ? "30px" : "40px"}, 1fr))`,
            maxWidth: `${gridSize * (gridSize === 16 ? 35 : 45)}px`,
          }}
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isOriginal = board[rowIndex][colIndex] !== null
              const userValue = userBoard[rowIndex][colIndex]
              const isSelected = selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex
              const isWrong =
                wrongCellRef.current && wrongCellRef.current.row === rowIndex && wrongCellRef.current.col === colIndex
              const boxRow = Math.floor(rowIndex / boxSize)
              const boxCol = Math.floor(colIndex / boxSize)
              const isShaded = (boxRow + boxCol) % 2 === 1

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    w-full aspect-square flex items-center justify-center 
                    ${gridSize === 16 ? "text-sm" : "text-xl"} font-bold 
                    border border-gray-300
                    ${isOriginal ? "bg-blue-100 text-blue-800" : "bg-white cursor-pointer hover:bg-gray-50"}
                    ${isShaded ? "bg-opacity-70" : ""}
                    ${isSelected ? "ring-4 ring-blue-500" : ""}
                    ${isWrong ? "bg-red-200 animate-pulse" : ""}
                    transition-all duration-200
                  `}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {userValue !== null ? userValue : ""}
                </div>
              )
            }),
          )}
        </div>
      </div>
    )
  }

  const renderInputSelection = () => {
    const gridSize = GRID_SIZES[difficulty]
    const inputs =
      gridSize === 9
        ? Array.from({ length: 9 }, (_, i) => i + 1)
        : [...Array.from({ length: 9 }, (_, i) => i + 1), ..."ABCDEFG".split("")]

    return (
      <div className="mb-6">
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
          {inputs.map((value) => (
            <button
              key={value}
              className={`
                ${gridSize === 16 ? "w-9 h-9" : "w-12 h-12"} 
                flex items-center justify-center 
                ${gridSize === 16 ? "text-base" : "text-xl"} font-bold 
                bg-blue-100 text-blue-800 rounded-lg 
                hover:bg-blue-200 active:bg-blue-300 
                transition-colors
              `}
              onClick={() => handleNumberInput(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const handleBackClick = () => {
    if (gameStarted) {
      setGameStarted(false)
      if (timerRef.current) clearInterval(timerRef.current)
    } else {
      router.push("/learning_games")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-8 px-4 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/30 backdrop-blur-sm"
            style={{
              width: Math.random() * 60 + 20,
              height: Math.random() * 60 + 20,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              scale: [1, Math.random() * 0.5 + 0.8, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-6">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
          >
            Sudoku Challenge
          </motion.h1>
          <motion.button
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="py-2 px-4 bg-white/80 backdrop-blur-sm text-purple-700 font-bold rounded-lg hover:bg-white/90 transition-colors shadow-md"
            onClick={handleBackClick}
          >
            Back
          </motion.button>
        </div>

        {!gameStarted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 text-center"
          >
            <div className="flex items-center gap-3 justify-center mb-6">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                }}
                className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl"
              >
                <GameController2 className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-purple-800">Choose Difficulty:</h2>
            </div>
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 px-6 bg-gradient-to-r from-green-400 to-green-500 text-white text-xl font-bold rounded-lg shadow-md transition-transform"
                onClick={() => generateSudoku("easy")}
              >
                Easy (9×9)
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 px-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xl font-bold rounded-lg shadow-md transition-transform"
                onClick={() => generateSudoku("medium")}
              >
                Medium (9×9)
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 px-6 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xl font-bold rounded-lg shadow-md transition-transform"
                onClick={() => generateSudoku("hard")}
              >
                Hard (9×9)
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 px-6 bg-gradient-to-r from-red-400 to-red-500 text-white text-xl font-bold rounded-lg shadow-md transition-transform"
                onClick={() => generateSudoku("extreme")}
              >
                Extreme (9×9)
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-400 to-purple-500 text-white text-xl font-bold rounded-lg shadow-md transition-transform"
                onClick={() => generateSudoku("giant")}
              >
                Giant (16×16)
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-4 md:p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2 rounded-full text-blue-800 font-semibold shadow-sm"
              >
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </motion.div>
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-purple-100 to-purple-200 px-4 py-2 rounded-full text-purple-800 font-semibold shadow-sm"
              >
                Time: {formatTime(timer)}
              </motion.div>
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex">
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`w-8 h-8 mx-0.5 rounded-full flex items-center justify-center ${
                      i < lives ? "bg-gradient-to-r from-red-400 to-pink-400 text-white shadow-md" : "bg-gray-200"
                    }`}
                  >
                    ❤️
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {isCompleted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                  className="text-6xl mb-4"
                >
                  🎉
                </motion.div>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-2xl font-bold text-green-600 mb-2"
                >
                  Puzzle Completed!
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg text-gray-700 mb-4"
                >
                  You solved it in <span className="font-bold">{formatTime(timer)}</span>
                </motion.p>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-center mb-6"
                >
                  {Array.from({ length: 3 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: i < stars ? 1 : 0.7, rotate: 0 }}
                      transition={{ delay: 0.3 + i * 0.2 }}
                      className={`text-4xl mx-1 ${i < stars ? "text-yellow-400" : "text-gray-300"}`}
                    >
                      ⭐
                    </motion.div>
                  ))}
                </motion.div>
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg shadow-lg"
                  onClick={() => setGameStarted(false)}
                >
                  Play Again
                </motion.button>
              </motion.div>
            ) : gameOver ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                  className="text-6xl mb-4"
                >
                  😢
                </motion.div>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-2xl font-bold text-red-600 mb-2"
                >
                  Game Over!
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg text-gray-700 mb-6"
                >
                  You've used all your lives. Better luck next time!
                </motion.p>
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg shadow-lg"
                  onClick={() => setGameStarted(false)}
                >
                  Try Again
                </motion.button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mb-4 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200 shadow-sm"
                >
                  <p className="text-center text-gray-700">
                    Fill in the empty cells with numbers that don't repeat in any row, column, or box.
                    {difficulty === "giant" && " Use numbers 1-9 and letters A-G for the 16×16 grid."}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6 overflow-x-auto"
                >
                  <div
                    className="grid gap-0.5 mx-auto bg-white/50 p-3 rounded-lg shadow-md"
                    style={{
                      gridTemplateColumns: `repeat(${board.length}, minmax(${board.length === 16 ? "30px" : "40px"}, 1fr))`,
                      maxWidth: `${board.length * (board.length === 16 ? 35 : 45)}px`,
                    }}
                  >
                    {board.map((row, rowIndex) =>
                      row.map((cell, colIndex) => {
                        const isOriginal = board[rowIndex][colIndex] !== null
                        const userValue = userBoard[rowIndex][colIndex]
                        const isSelected =
                          selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex
                        const isWrong =
                          wrongCellRef.current &&
                          wrongCellRef.current.row === rowIndex &&
                          wrongCellRef.current.col === colIndex
                        const boxSize = board.length === 9 ? 3 : 4
                        const boxRow = Math.floor(rowIndex / boxSize)
                        const boxCol = Math.floor(colIndex / boxSize)
                        const isShaded = (boxRow + boxCol) % 2 === 1

                        return (
                          <motion.div
                            key={`${rowIndex}-${colIndex}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: (rowIndex * board.length + colIndex) * 0.001 }}
                            whileHover={!isOriginal ? { scale: 1.05, zIndex: 10 } : {}}
                            whileTap={!isOriginal ? { scale: 0.95 } : {}}
                            className={`
                              w-full aspect-square flex items-center justify-center 
                              ${board.length === 16 ? "text-sm" : "text-xl"} font-bold 
                              border border-purple-200 rounded-sm
                              ${
                                isOriginal
                                  ? "bg-gradient-to-br from-blue-100 to-purple-100 text-purple-800"
                                  : "bg-white/80 cursor-pointer hover:bg-white"
                              }
                              ${isShaded ? "bg-opacity-70" : ""}
                              ${isSelected ? "ring-4 ring-purple-500 shadow-lg z-10" : ""}
                              ${isWrong ? "bg-red-200 animate-pulse" : ""}
                              transition-all duration-200
                            `}
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                          >
                            {userValue !== null ? userValue : ""}
                          </motion.div>
                        )
                      }),
                    )}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                    {(board.length === 9
                      ? Array.from({ length: 9 }, (_, i) => i + 1)
                      : [...Array.from({ length: 9 }, (_, i) => i + 1), ..."ABCDEFG".split("")]
                    ).map((value, index) => (
                      <motion.button
                        key={value}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.03 }}
                        className={`
                          ${board.length === 16 ? "w-9 h-9" : "w-12 h-12"} 
                          flex items-center justify-center 
                          ${board.length === 16 ? "text-base" : "text-xl"} font-bold 
                          bg-gradient-to-br from-blue-100 to-purple-200 text-purple-800 rounded-lg 
                          hover:from-blue-200 hover:to-purple-300 active:from-blue-300 active:to-purple-400
                          shadow-md
                          transition-all duration-200
                        `}
                        onClick={() => handleNumberInput(value)}
                      >
                        {value}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

