"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronRight,
  Award,
  Droplets,
  Beaker,
  HelpCircle,
  Volume2,
  VolumeX,
  Clock,
  Brain,
  BarChart3,
  Layers,
  Star,
  Zap,
  Droplet,
  FlaskRoundIcon as Flask,
  Lightbulb,
  ArrowLeft,
  Sparkles,
  Home,
  Trophy,
  Settings,
  Info,
} from "lucide-react"
import confetti from "canvas-confetti"

export default function ScienceGames() {
  const [currentGame, setCurrentGame] = useState("menu") // menu, sinkOrFloat, densityMatch
  const [muted, setMuted] = useState(false)
  const [highScore, setHighScore] = useState({
    sinkOrFloat: 0,
    densityMatch: 0,
  })

  // Sound effects
  const playSound = (sound) => {
    if (muted) return

    const sounds = {
      select: new Audio("/select.mp3"),
      correct: new Audio("/correct.mp3"),
      incorrect: new Audio("/incorrect.mp3"),
      splash: new Audio("/splash.mp3"),
      levelUp: new Audio("/level-up.mp3"),
      tick: new Audio("/tick.mp3"),
    }

    // This is a placeholder - in a real app, you'd need to add these sound files
    console.log(`Playing sound: ${sound}`)
    // sounds[sound].play()
  }

  const updateHighScore = (game, score) => {
    if (score > highScore[game]) {
      setHighScore((prev) => ({ ...prev, [game]: score }))
      return true
    }
    return false
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-100 to-pink-100">
      {currentGame === "menu" && (
        <GameMenu
          setCurrentGame={setCurrentGame}
          playSound={playSound}
          muted={muted}
          setMuted={setMuted}
          highScore={highScore}
        />
      )}
      {currentGame === "sinkOrFloat" && (
        <SinkOrFloatGame
          returnToMenu={() => setCurrentGame("menu")}
          playSound={playSound}
          muted={muted}
          setMuted={setMuted}
          updateHighScore={updateHighScore}
          highScore={highScore.sinkOrFloat}
        />
      )}
      {currentGame === "densityMatch" && (
        <DensityMatchGame
          returnToMenu={() => setCurrentGame("menu")}
          playSound={playSound}
          muted={muted}
          setMuted={setMuted}
          updateHighScore={updateHighScore}
          highScore={highScore.densityMatch}
        />
      )}
    </div>
  )
}

function GameMenu({ setCurrentGame, playSound, muted, setMuted, highScore }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden border-4 border-purple-300 relative">
        {/* Animated bubbles background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-purple-200 opacity-70"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 30 + 10}px`,
                height: `${Math.random() * 30 + 10}px`,
              }}
              animate={{
                y: [0, -100],
                x: [0, Math.random() * 40 - 20],
                opacity: [0.7, 0],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white text-center relative">
          <motion.h1
            className="text-3xl font-bold mb-2"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          >
            Science Explorer
          </motion.h1>
          <p className="text-lg">Fun games to learn about density & buoyancy!</p>

          <div className="absolute top-4 right-4">
            <button onClick={() => setMuted(!muted)} className="p-2 rounded-full bg-white/20 hover:bg-white/30">
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </div>

        <div className="p-6 relative">
          <h2 className="text-xl font-bold text-center mb-6 text-purple-700">Choose a Game!</h2>

          <div className="grid gap-4">
            <motion.button
              onClick={() => {
                playSound("select")
                setCurrentGame("sinkOrFloat")
              }}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-xl flex items-center relative"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)" }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="bg-white/20 p-3 rounded-lg mr-4">
                <Droplet size={30} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold">Sink or Float?</h3>
                <p className="text-sm opacity-90">Test objects in different liquids!</p>
              </div>
              {highScore.sinkOrFloat > 0 && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                  <Trophy size={12} className="mr-1" />
                  {highScore.sinkOrFloat}
                </div>
              )}
            </motion.button>

            <motion.button
              onClick={() => {
                playSound("select")
                setCurrentGame("densityMatch")
              }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-xl flex items-center relative"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.5)" }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="bg-white/20 p-3 rounded-lg mr-4">
                <Flask size={30} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold">Density Detective</h3>
                <p className="text-sm opacity-90">Match objects to their density!</p>
              </div>
              {highScore.densityMatch > 0 && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                  <Trophy size={12} className="mr-1" />
                  {highScore.densityMatch}
                </div>
              )}
            </motion.button>
          </div>

          <motion.div
            className="mt-8 bg-blue-50 rounded-lg p-4 border-2 border-blue-200"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="text-yellow-500" size={20} />
              <h3 className="font-bold text-blue-800">Did You Know?</h3>
            </div>
            <p className="text-sm text-blue-700">
              Density is how much "stuff" is packed into a space. It's why some things float and others sink!
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function SinkOrFloatGame({ returnToMenu, playSound, muted, setMuted, updateHighScore, highScore }) {
  // Game states
  const [gameState, setGameState] = useState("start") // start, playing, result, levelComplete
  const [currentObject, setCurrentObject] = useState(null)
  const [guess, setGuess] = useState(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [level, setLevel] = useState(1)
  const [showHint, setShowHint] = useState(false)
  const [currentLiquid, setCurrentLiquid] = useState("water")
  const [unlockedLiquids, setUnlockedLiquids] = useState(["water"])
  const [animation, setAnimation] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null)
  const [gameMode, setGameMode] = useState("normal") // normal, time, layers
  const [usedObjects, setUsedObjects] = useState([])
  const [layerGuess, setLayerGuess] = useState(null)
  const confettiRef = useRef(null)
  const timerRef = useRef(null)
  const [showTip, setShowTip] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  // Game objects with properties
  const gameObjects = {
    basic: [
      {
        id: "wood",
        name: "Wooden Block",
        image: "🪵",
        willFloat: true,
        density: 0.7,
        hint: "Wood is less dense than water, so it floats!",
      },
      {
        id: "rock",
        name: "Rock",
        image: "🪨",
        willFloat: false,
        density: 2.7,
        hint: "Rocks are denser than water, so they sink!",
      },
      {
        id: "balloon",
        name: "Balloon",
        image: "🎈",
        willFloat: true,
        density: 0.2,
        hint: "Balloons are filled with air, making them lighter than water!",
      },
      {
        id: "marble",
        name: "Marble",
        image: "🔮",
        willFloat: false,
        density: 2.5,
        hint: "Marbles are made of glass or stone, which is denser than water!",
      },
      {
        id: "apple",
        name: "Apple",
        image: "🍎",
        willFloat: true,
        density: 0.85,
        hint: "Apples have air pockets inside, helping them float!",
      },
      {
        id: "coin",
        name: "Coin",
        image: "🪙",
        willFloat: false,
        density: 8.9,
        hint: "Coins are made of metal, which is denser than water!",
      },
      {
        id: "leaf",
        name: "Leaf",
        image: "🍃",
        willFloat: true,
        density: 0.3,
        hint: "Leaves are very light and have a large surface area!",
      },
      {
        id: "paperclip",
        name: "Paperclip",
        image: "📎",
        willFloat: false,
        density: 7.8,
        hint: "Metal paperclips are small but dense!",
      },
      {
        id: "cork",
        name: "Cork",
        image: "🪶",
        willFloat: true,
        density: 0.24,
        hint: "Cork is very light and has tiny air pockets!",
      },
      {
        id: "key",
        name: "Key",
        image: "🔑",
        willFloat: false,
        density: 8.5,
        hint: "Keys are made of metal, which is denser than water!",
      },
      {
        id: "rubber_duck",
        name: "Rubber Duck",
        image: "🦆",
        willFloat: true,
        density: 0.3,
        hint: "Rubber ducks are hollow and made of light materials!",
      },
      {
        id: "pencil",
        name: "Pencil",
        image: "✏",
        willFloat: true,
        density: 0.9,
        hint: "Pencils are made of wood and contain air pockets!",
      },
    ],
    intermediate: [
      {
        id: "plastic_bottle",
        name: "Empty Plastic Bottle",
        image: "🍶",
        willFloat: true,
        density: 0.2,
        hint: "Empty bottles trap air inside, making them float!",
      },
      {
        id: "water_bottle",
        name: "Full Water Bottle",
        image: "💧🍶",
        willFloat: false,
        density: 1.1,
        hint: "When filled with water, bottles become slightly denser than water!",
      },
      {
        id: "aluminum_foil_ball",
        name: "Aluminum Foil Ball",
        image: "⚪",
        willFloat: false,
        density: 2.7,
        hint: "Even though aluminum foil is thin, when crumpled it becomes denser than water!",
      },
      {
        id: "aluminum_foil_boat",
        name: "Aluminum Foil Boat",
        image: "⛵",
        willFloat: true,
        density: 0.3,
        hint: "When shaped like a boat, aluminum foil can float due to its shape!",
      },
      {
        id: "orange_with_peel",
        name: "Orange with Peel",
        image: "🍊",
        willFloat: true,
        density: 0.8,
        hint: "Oranges float because their peels contain air pockets!",
      },
      {
        id: "peeled_orange",
        name: "Peeled Orange",
        image: "🍊➖",
        willFloat: false,
        density: 1.1,
        hint: "Without the air-filled peel, oranges sink!",
      },
      {
        id: "ice_cube",
        name: "Ice Cube",
        image: "🧊",
        willFloat: true,
        density: 0.92,
        hint: "Ice is slightly less dense than liquid water, so it floats!",
      },
      {
        id: "candle",
        name: "Candle",
        image: "🕯",
        willFloat: true,
        density: 0.9,
        hint: "Candles are made of wax, which is less dense than water!",
      },
    ],
    advanced: [
      {
        id: "egg",
        name: "Egg",
        image: "🥚",
        density: 1.03,
        willFloat: { water: false, saltWater: true, oil: false, alcohol: false, honey: false, layered: 2 },
        hint: "Eggs sink in regular water but float in salt water due to increased density of the liquid!",
      },
      {
        id: "grape",
        name: "Grape",
        image: "🍇",
        density: 1.1,
        willFloat: { water: false, saltWater: false, oil: false, alcohol: false, honey: true, layered: 3 },
        hint: "Grapes sink in water but float in thick honey!",
      },
      {
        id: "lemon",
        name: "Lemon",
        image: "🍋",
        density: 0.9,
        willFloat: { water: true, saltWater: true, oil: true, alcohol: false, honey: true, layered: 1 },
        hint: "Lemons float in most liquids due to their air-filled rind!",
      },
      {
        id: "strawberry",
        name: "Strawberry",
        image: "🍓",
        density: 1.05,
        willFloat: { water: false, saltWater: false, oil: false, alcohol: false, honey: true, layered: 3 },
        hint: "Strawberries sink in water but can float in honey!",
      },
      {
        id: "ping_pong",
        name: "Ping Pong Ball",
        image: "🏓",
        density: 0.08,
        willFloat: { water: true, saltWater: true, oil: true, alcohol: true, honey: true, layered: 0 },
        hint: "Ping pong balls are hollow and very light, so they float in all liquids!",
      },
      {
        id: "metal_bolt",
        name: "Metal Bolt",
        image: "🔩",
        density: 7.8,
        willFloat: { water: false, saltWater: false, oil: false, alcohol: false, honey: false, layered: 4 },
        hint: "Metal bolts are so dense they sink in all liquids!",
      },
      {
        id: "cherry",
        name: "Cherry",
        image: "🍒",
        density: 1.02,
        willFloat: { water: false, saltWater: true, oil: false, alcohol: false, honey: true, layered: 2 },
        hint: "Cherries are just slightly denser than water!",
      },
      {
        id: "plastic_bead",
        name: "Plastic Bead",
        image: "🔵",
        density: 0.9,
        willFloat: { water: true, saltWater: true, oil: true, alcohol: false, honey: true, layered: 1 },
        hint: "Most plastic beads are less dense than water!",
      },
      {
        id: "steel_ball",
        name: "Steel Ball",
        image: "⚫",
        density: 7.8,
        willFloat: { water: false, saltWater: false, oil: false, alcohol: false, honey: false, layered: 4 },
        hint: "Steel is much denser than any household liquid!",
      },
      {
        id: "wax_chunk",
        name: "Wax Chunk",
        image: "🟨",
        density: 0.9,
        willFloat: { water: true, saltWater: true, oil: true, alcohol: false, honey: true, layered: 1 },
        hint: "Wax is slightly less dense than water!",
      },
      {
        id: "rubber_eraser",
        name: "Rubber Eraser",
        image: "🧽",
        density: 1.2,
        willFloat: { water: false, saltWater: false, oil: false, alcohol: true, honey: true, layered: 3 },
        hint: "Most erasers are denser than water but less dense than honey!",
      },
      {
        id: "cork_ball",
        name: "Cork Ball",
        image: "🟤",
        density: 0.24,
        willFloat: { water: true, saltWater: true, oil: true, alcohol: true, honey: true, layered: 0 },
        hint: "Cork is one of the least dense solid materials!",
      },
    ],
  }

  // Liquid properties
  const liquids = {
    water: { name: "Water", color: "bg-blue-400", unlockScore: 0, density: 1.0 },
    saltWater: { name: "Salt Water", color: "bg-cyan-500", unlockScore: 5, density: 1.1 },
    oil: { name: "Vegetable Oil", color: "bg-yellow-300", unlockScore: 10, density: 0.92 },
    alcohol: { name: "Rubbing Alcohol", color: "bg-blue-200", unlockScore: 15, density: 0.8 },
    honey: { name: "Honey", color: "bg-amber-400", unlockScore: 20, density: 1.4 },
    layered: {
      name: "Layered Liquids",
      color: "bg-gradient-to-b from-blue-200 via-yellow-300 to-amber-400",
      unlockScore: 25,
      density: "multiple",
    },
  }

  // Layer positions for layered liquid mode
  const layerPositions = [
    { name: "Top (Alcohol)", position: "top-1/5", density: 0.8 },
    { name: "Upper Middle (Oil)", position: "top-2/5", density: 0.92 },
    { name: "Middle (Water)", position: "top-1/2", density: 1.0 },
    { name: "Lower Middle (Salt Water)", position: "top-3/4", density: 1.1 },
    { name: "Bottom (Honey)", position: "bottom-0", density: 1.4 },
  ]

  // Get objects for current level
  const getCurrentObjects = () => {
    if (level === 1) return gameObjects.basic
    if (level === 2) return [...gameObjects.basic, ...gameObjects.intermediate]
    return [...gameObjects.basic, ...gameObjects.intermediate, ...gameObjects.advanced]
  }

  // Get a new object that hasn't been used recently
  const getNewObject = () => {
    const availableObjects = getCurrentObjects()

    // Filter out recently used objects unless we've used all available objects
    let filteredObjects = availableObjects.filter((obj) => !usedObjects.includes(obj.id))

    // If we've used all objects, reset the used objects list but keep the current object out
    if (filteredObjects.length === 0) {
      const currentId = currentObject ? currentObject.id : null
      setUsedObjects(currentId ? [currentId] : [])
      filteredObjects = availableObjects.filter((obj) => obj.id !== currentId)
    }

    // Select a random object from the filtered list
    const randomIndex = Math.floor(Math.random() * filteredObjects.length)
    const newObject = filteredObjects[randomIndex]

    // Add the new object to the used objects list
    setUsedObjects([...usedObjects, newObject.id])

    return newObject
  }

  // Start a new round
  const startNewRound = () => {
    const newObject = getNewObject()
    setCurrentObject(newObject)
    setGuess(null)
    setLayerGuess(null)
    setShowHint(false)
    setShowExplanation(false)
    setAnimation(null)
    setGameState("playing")

    // Reset liquid to water if not in layers mode
    if (gameMode !== "layers") {
      setCurrentLiquid("water")
    }

    // Set timer for timed mode
    if (gameMode === "time") {
      const timeLimit = Math.max(8 - level, 4) // Decreases with level, minimum 4 seconds
      setTimeLeft(timeLimit)

      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            if (gameState === "playing") {
              // Time's up - count as incorrect
              setGameState("result")
              setStreak(0)
              playSound("incorrect")
              setShowExplanation(true)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }

  // Handle player's guess for sink or float
  const makeGuess = (floatGuess) => {
    setGuess(floatGuess)

    let isCorrect
    if (level <= 2) {
      isCorrect = floatGuess === currentObject.willFloat
    } else {
      isCorrect = floatGuess === currentObject.willFloat[currentLiquid]
    }

    handleGuessResult(isCorrect)
  }

  // Handle player's guess for layered liquid
  const makeLayerGuess = (layerIndex) => {
    setLayerGuess(layerIndex)

    // Make sure currentObject and currentObject.willFloat exist before accessing .layered
    const correctLayer =
      currentObject && currentObject.willFloat && typeof currentObject.willFloat === "object"
        ? currentObject.willFloat.layered
        : null

    const isCorrect = correctLayer !== null && layerIndex === correctLayer

    handleGuessResult(isCorrect)
  }

  // Common logic for handling guess results
  const handleGuessResult = (isCorrect) => {
    // Clear any running timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    if (isCorrect) {
      playSound("correct")
      setScore(score + (gameMode === "time" && timeLeft > 0 ? Math.ceil(timeLeft / 2) + 1 : 1))
      setStreak(streak + 1)
      setMaxStreak(Math.max(maxStreak, streak + 1))

      // Update high score if needed
      updateHighScore("sinkOrFloat", score + 1)

      // Trigger confetti for correct answers
      if (confettiRef.current && streak >= 3) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }

      // Check for liquid unlocks
      Object.keys(liquids).forEach((liquidKey) => {
        if (!unlockedLiquids.includes(liquidKey) && score + 1 >= liquids[liquidKey].unlockScore) {
          setUnlockedLiquids([...unlockedLiquids, liquidKey])
          playSound("levelUp")
        }
      })
    } else {
      playSound("incorrect")
      setStreak(0)
    }

    // Animate the object
    setAnimation(isCorrect ? "correct" : "incorrect")
    playSound("splash")

    // Show the result
    setGameState("result")
    setShowExplanation(true)

    // Check for level completion
    if (level === 1 && score >= 5) {
      setTimeout(() => setLevel(2), 1500)
    } else if (level === 2 && score >= 15) {
      setTimeout(() => setLevel(3), 1500)
    }
  }

  // Initialize the game
  useEffect(() => {
    if (gameState === "start") {
      startNewRound()
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameState, gameMode])

  // Handle level changes
  useEffect(() => {
    if (level > 1) {
      playSound("levelUp")
      setGameState("levelComplete")
      setTimeout(() => {
        startNewRound()
      }, 2500)
    }
  }, [level])

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Get the correct animation position for layered mode
  const getLayeredPosition = (objectDensity) => {
    if (objectDensity < 0.8) return "top-1/5" // Floats on alcohol
    if (objectDensity < 0.92) return "top-2/5" // Floats on oil
    if (objectDensity < 1.0) return "top-1/2" // Floats on water
    if (objectDensity < 1.1) return "top-3/4" // Floats on salt water
    return "bottom-0" // Sinks to honey
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Game header */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-4 mb-4 border-4 border-blue-300">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={returnToMenu}
              className="mr-3 p-2 rounded-full hover:bg-gray-100"
              aria-label="Return to menu"
            >
              <ArrowLeft size={20} className="text-blue-600" />
            </button>
            <h1 className="text-2xl font-bold text-blue-600">Sink or Float? 🌊</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowInfo(!showInfo)} className="p-2 rounded-full hover:bg-gray-100">
              <Info size={20} className="text-blue-600" />
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-full hover:bg-gray-100">
              <Settings size={20} className="text-blue-600" />
            </button>
            <button onClick={() => setMuted(!muted)} className="p-2 rounded-full hover:bg-gray-100">
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Score: {score}</span>
            <div className="flex items-center gap-1">
              <Award size={16} className="text-yellow-500" />
              <span className="text-sm font-medium">Streak: {streak}</span>
            </div>
            {highScore > 0 && (
              <div className="flex items-center gap-1">
                <Trophy size={16} className="text-yellow-500" />
                <span className="text-sm font-medium">Best: {highScore}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Beaker size={16} className="text-purple-500" />
            <span className="text-sm font-medium">Level {level}</span>
          </div>
        </div>

        {/* Game mode selector */}
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => setGameMode("normal")}
            className={`text-xs px-2 py-1 rounded-full ${gameMode === "normal" ? "bg-blue-100 text-blue-700" : "bg-gray-100"}`}
          >
            Normal
          </button>
          <button
            onClick={() => (level >= 2 ? setGameMode("time") : null)}
            className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 
              ${
                level >= 2
                  ? gameMode === "time"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            disabled={level < 2}
          >
            <Clock size={12} />
            Timed {level < 2 && <span>(Level 2)</span>}
          </button>
          <button
            onClick={() => {
              if (level >= 2) {
                setGameMode("layers")
                setCurrentLiquid("layered")
              }
            }}
            className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 
              ${
                level >= 2
                  ? gameMode === "layers"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            disabled={level < 2}
          >
            <Layers size={12} />
            Layers {level < 2 && <span>(Level 2)</span>}
          </button>
        </div>

        {/* Timer for timed mode */}
        {gameMode === "time" && timeLeft !== null && (
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${timeLeft > 3 ? "bg-green-500" : "bg-red-500"}`}
              style={{ width: `${(timeLeft / Math.max(8 - level, 4)) * 100}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/50 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 max-w-sm w-full mx-4"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Settings</h2>
                <button onClick={() => setShowSettings(false)} className="p-1 rounded-full hover:bg-gray-100">
                  <ArrowLeft size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Sound Effects</span>
                  <button
                    onClick={() => setMuted(!muted)}
                    className={`px-3 py-1 rounded-full ${muted ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                  >
                    {muted ? "Off" : "On"}
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={returnToMenu}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Home size={16} />
                    Return to Main Menu
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/50 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 max-w-sm w-full mx-4"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Game Info</h2>
                <button onClick={() => setShowInfo(false)} className="p-1 rounded-full hover:bg-gray-100">
                  <ArrowLeft size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">How to Play</h3>
                  <p className="text-sm">
                    Predict whether objects will sink or float in different liquids. As you progress, you'll unlock new
                    liquids and game modes!
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Scoring</h3>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    <li>+1 point for each correct answer</li>
                    <li>Bonus points for streaks of 3+ correct answers</li>
                    <li>Timed mode gives extra points for quick answers</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowInfo(false)}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 rounded-lg"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level complete screen */}
      <AnimatePresence>
        {gameState === "levelComplete" && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/50 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 max-w-sm text-center"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mb-4 mx-auto w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
              >
                <Star className="text-white w-12 h-12" />
              </motion.div>

              <h2 className="text-2xl font-bold text-purple-600 mb-2">Level {level} Unlocked! 🎉</h2>
              <p className="mb-4">
                {level === 2
                  ? "Great job! Now you'll see more complex objects and can try timed mode!"
                  : "Amazing! You've unlocked different liquids and the layered challenge mode!"}
              </p>
              <div className="flex justify-center">
                <motion.div
                  className="text-6xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  {level === 2 ? "🧪" : "🔬"}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main game container */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border-4 border-blue-300">
        {/* Liquid selection */}
        <div className="p-4 bg-blue-50">
          <h3 className="text-sm font-medium mb-2">Select Liquid:</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Object.keys(liquids)
              .filter((key) => key !== "layered" || gameMode === "layers")
              .map((liquidKey) => (
                <button
                  key={liquidKey}
                  onClick={() => unlockedLiquids.includes(liquidKey) && setCurrentLiquid(liquidKey)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1
                    ${
                      unlockedLiquids.includes(liquidKey)
                        ? currentLiquid === liquidKey
                          ? `${liquids[liquidKey].color} text-white`
                          : "bg-white border border-gray-200 hover:bg-gray-50"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  disabled={!unlockedLiquids.includes(liquidKey)}
                >
                  <Droplets size={14} />
                  {liquids[liquidKey].name}
                  {!unlockedLiquids.includes(liquidKey) && (
                    <span className="text-xs ml-1">(Score {liquids[liquidKey].unlockScore})</span>
                  )}
                </button>
              ))}
          </div>
        </div>

        {/* Water tank */}
        <div className="relative h-64 overflow-hidden">
          {/* Liquid visualization */}
          {gameMode === "layers" ? (
            // Layered liquids - Fixed to ensure all layers are visible
            <div className="absolute inset-0 w-full h-full">
              <div className="absolute bottom-0 w-full h-1/5 bg-amber-400 bg-opacity-80"></div>
              <div className="absolute bottom-1/5 w-full h-1/5 bg-cyan-500 bg-opacity-80"></div>
              <div className="absolute bottom-2/5 w-full h-1/5 bg-blue-400 bg-opacity-80"></div>
              <div className="absolute bottom-3/5 w-full h-1/5 bg-yellow-300 bg-opacity-80"></div>
              <div className="absolute bottom-4/5 w-full h-1/5 bg-blue-200 bg-opacity-80"></div>

              {/* Layer labels */}
              <div className="absolute right-2 top-[10%] text-xs text-blue-800 font-bold bg-white/50 px-1 rounded">
                Alcohol
              </div>
              <div className="absolute right-2 top-[30%] text-xs text-yellow-800 font-bold bg-white/50 px-1 rounded">
                Oil
              </div>
              <div className="absolute right-2 top-[50%] text-xs text-blue-800 font-bold bg-white/50 px-1 rounded">
                Water
              </div>
              <div className="absolute right-2 top-[70%] text-xs text-cyan-800 font-bold bg-white/50 px-1 rounded">
                Salt Water
              </div>
              <div className="absolute right-2 top-[90%] text-xs text-amber-800 font-bold bg-white/50 px-1 rounded">
                Honey
              </div>
            </div>
          ) : (
            // Single liquid - Fixed to ensure water is always visible
            <div
              className={`absolute bottom-0 w-full h-3/4 ${liquids[currentLiquid].color} bg-opacity-80`}
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 20, 50 10 T 100 10' stroke='rgba(255,255,255,0.5)' fill='none' strokeWidth='2'/%3E%3C/svg%3E\")",
                backgroundRepeat: "repeat-x",
                backgroundSize: "100px 20px",
                animation: "wave 3s linear infinite",
              }}
            />
          )}

          {/* Object */}
          {currentObject && (
            <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 text-7xl"
              initial={{ top: "10%" }}
              animate={
                gameMode === "layers" && animation === "correct"
                  ? { top: layerPositions[currentObject.willFloat.layered].position }
                  : animation === "correct"
                    ? guess
                      ? { top: ["10%", "40%", "40%"] } // Float
                      : { top: ["10%", "80%", "80%"] } // Sink
                    : animation === "incorrect"
                      ? guess
                        ? { top: ["10%", "80%", "80%"] } // Sink (wrong guess of float)
                        : { top: ["10%", "40%", "40%"] } // Float (wrong guess of sink)
                      : { top: "10%" }
              }
              transition={{ duration: 0.8, times: [0, 0.6, 1] }}
            >
              {currentObject.image}

              {/* Sparkle animation for correct answers */}
              {animation === "correct" && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, times: [0, 0.5, 1] }}
                >
                  <Sparkles className="text-yellow-400 w-12 h-12" />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Density meter (for advanced levels) */}
          {level >= 2 && currentObject && showExplanation && (
            <div className="absolute left-2 top-2 bottom-2 w-6 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="absolute w-full bottom-0 bg-gradient-to-t from-red-500 to-green-500"
                style={{ height: `${Math.min(100, (2 - currentObject.density) * 100)}%` }}
              ></div>
              <div
                className="absolute w-full h-1 bg-black left-0"
                style={{
                  bottom: `${Math.min(100, liquids[currentLiquid === "layered" ? "water" : currentLiquid].density * 50)}%`,
                }}
              ></div>
              <div
                className="absolute -left-1 text-xs font-bold"
                style={{
                  bottom: `${Math.min(100, liquids[currentLiquid === "layered" ? "water" : currentLiquid].density * 50)}%`,
                }}
              >
                {currentLiquid === "layered" ? "Water" : liquids[currentLiquid].name}
              </div>
              {animation && (
                <div
                  className="absolute -left-1 text-xs font-bold"
                  style={{ bottom: `${Math.min(100, currentObject.density * 50)}%` }}
                >
                  {currentObject.name}
                </div>
              )}
            </div>
          )}

          {/* Bubbles animation */}
          <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none">
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute bottom-0 rounded-full bg-white bg-opacity-70"
                style={{
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 15 + 5}px`,
                  height: `${Math.random() * 15 + 5}px`,
                }}
                initial={{ y: 0, opacity: 0.7 }}
                animate={{ y: -200, opacity: 0 }}
                transition={{
                  duration: Math.random() * 2 + 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: Math.random() * 5,
                }}
              />
            ))}
          </div>
        </div>

        {/* Game controls */}
        <div className="p-4">
          {gameState === "playing" && currentObject && (
            <>
              <h2 className="text-xl font-bold mb-2">{currentObject.name}</h2>

              {gameMode === "layers" ? (
                <>
                  <p className="mb-4">In which layer will this object settle?</p>
                  <div className="grid grid-cols-1 gap-2 mb-4">
                    {layerPositions.map((layer, index) => (
                      <motion.button
                        key={index}
                        onClick={() => makeLayerGuess(index)}
                        className={`bg-gradient-to-r ${
                          index === 0
                            ? "from-blue-200 to-blue-300"
                            : index === 1
                              ? "from-yellow-200 to-yellow-300"
                              : index === 2
                                ? "from-blue-300 to-blue-400"
                                : index === 3
                                  ? "from-cyan-400 to-cyan-500"
                                  : "from-amber-300 to-amber-400"
                        } 
                        text-white font-medium py-3 px-4 rounded-lg text-left pl-3`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {layer.name}
                      </motion.button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-4">Will this object sink or float in {liquids[currentLiquid].name}?</p>
                  <div className="flex gap-3 mb-4">
                    <motion.button
                      onClick={() => makeGuess(true)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-3 px-4 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Float 🌊
                    </motion.button>
                    <motion.button
                      onClick={() => makeGuess(false)}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium py-3 px-4 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sink 🔽
                    </motion.button>
                  </div>
                </>
              )}

              <div className="flex justify-center">
                <button
                  onClick={() => setShowHint(true)}
                  className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                >
                  <HelpCircle size={14} />
                  Need a hint?
                </button>
              </div>

              {showHint && (
                <motion.div
                  className="mt-2 p-3 bg-yellow-50 rounded-lg text-sm border-2 border-yellow-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p>{currentObject.hint}</p>
                </motion.div>
              )}
            </>
          )}

          {gameState === "result" && (
            <>
              <div
                className={`p-3 rounded-lg mb-4 ${
                  gameMode === "layers"
                    ? layerGuess === currentObject.willFloat.layered
                      ? "bg-green-100 text-green-800 border-2 border-green-300"
                      : "bg-red-100 text-red-800 border-2 border-red-300"
                    : guess === (level <= 2 ? currentObject.willFloat : currentObject.willFloat[currentLiquid])
                      ? "bg-green-100 text-green-800 border-2 border-green-300"
                      : "bg-red-100 text-red-800 border-2 border-red-300"
                }`}
              >
                <h3 className="font-bold">
                  {gameMode === "layers"
                    ? layerGuess === currentObject.willFloat.layered
                      ? "Correct! 🎉"
                      : "Not quite right! 🤔"
                    : guess === (level <= 2 ? currentObject.willFloat : currentObject.willFloat[currentLiquid])
                      ? "Correct! 🎉"
                      : "Not quite right! 🤔"}
                </h3>
                <p className="text-sm mt-1">
                  {gameMode === "layers" &&
                  currentObject &&
                  currentObject.willFloat &&
                  typeof currentObject.willFloat === "object" &&
                  "layered" in currentObject.willFloat &&
                  currentObject.willFloat.layered !== undefined
                    ? `${currentObject.name} settles in the ${layerPositions[currentObject.willFloat.layered]?.name || "unknown"} layer.`
                    : `${currentObject?.name || "This object"} does ${(level <= 2 ? currentObject?.willFloat : currentObject?.willFloat?.[currentLiquid]) ? "float" : "sink"} in ${liquids[currentLiquid]?.name || "the liquid"}.`}
                </p>
              </div>

              {showExplanation && (
                <motion.div
                  className="mb-4 p-3 bg-blue-50 rounded-lg text-sm border-2 border-blue-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h4 className="font-medium mb-1">Why?</h4>
                  <p>{currentObject.hint}</p>

                  <div className="mt-2 flex items-center gap-2">
                    <BarChart3 size={16} className="text-blue-700" />
                    <span className="font-medium">Density Comparison:</span>
                  </div>

                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-3 h-3 rounded-full ${currentObject.density < 1.0 ? "bg-green-500" : "bg-red-500"}`}
                      ></div>
                      <span>
                        {currentObject.name}: {currentObject.density}
                      </span>
                    </div>

                    {gameMode === "layers" ? (
                      <>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-blue-200"></div>
                          <span>Alcohol: 0.8</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
                          <span>Oil: 0.92</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                          <span>Water: 1.0</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                          <span>Salt Water: 1.1</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                          <span>Honey: 1.4</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className={`w-3 h-3 rounded-full ${liquids[currentLiquid].color}`}></div>
                        <span>
                          {liquids[currentLiquid].name}: {liquids[currentLiquid].density}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="mt-2 text-xs">
                    <strong>Remember:</strong> Objects float when they are less dense than the liquid they're in!
                  </p>
                </motion.div>
              )}

              <motion.button
                onClick={startNewRound}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next Object
                <ChevronRight size={18} />
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Confetti container */}
      <div ref={confettiRef} className="fixed inset-0 pointer-events-none" />

      {/* Game info */}
      <div className="w-full max-w-md mt-4 bg-white rounded-xl shadow-lg p-4 border-4 border-blue-300">
        <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Lightbulb className="text-yellow-500" size={18} />
          Science Facts
        </h3>

        {level === 1 && (
          <p className="text-sm text-gray-600">
            Whether an object sinks or floats depends on its density compared to the liquid. If an object is less dense
            than the liquid, it will float!
          </p>
        )}

        {level === 2 && (
          <>
            <p className="text-sm text-gray-600">
              The shape of an object can affect whether it floats. A ball of clay will sink, but if you shape it like a
              boat, it might float because of the air it displaces!
            </p>
            <p className="text-sm text-gray-600 mt-2">Try the timed mode for an extra challenge!</p>
          </>
        )}

        {level >= 3 && (
          <>
            <p className="text-sm text-gray-600">
              Different liquids have different densities. Oil floats on water because it's less dense, while honey sinks
              because it's more dense.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              In layered liquids, objects will settle at the level where their density matches the liquid's density. Try
              the layered mode to see this in action!
            </p>
          </>
        )}

        {streak >= 3 && (
          <div className="mt-2 p-2 bg-yellow-50 rounded-lg border-2 border-yellow-200">
            <p className="text-sm font-medium text-yellow-800 flex items-center gap-1">
              <Zap className="text-yellow-500" size={16} />🔥 You're on a streak of {streak}! Keep going!
            </p>
          </div>
        )}

        {showTip && level === 1 && (
          <div className="mt-2 p-2 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="flex justify-between items-start">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Try to unlock all the different liquids by earning points!
              </p>
              <button onClick={() => setShowTip(false)} className="text-blue-500 text-xs">
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes wave {
          0% { background-position: 0 0; }
          100% { background-position: 100px 0; }
        }
      `}</style>
    </div>
  )
}

function DensityMatchGame({ returnToMenu, playSound, muted, setMuted, updateHighScore, highScore }) {
  const [gameState, setGameState] = useState("playing") // playing, result, levelComplete
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [currentRound, setCurrentRound] = useState(1)
  const [objects, setObjects] = useState([])
  const [selectedObject, setSelectedObject] = useState(null)
  const [selectedDensity, setSelectedDensity] = useState(null)
  const [correctMatches, setCorrectMatches] = useState([])
  const [wrongAttempt, setWrongAttempt] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const confettiRef = useRef(null)
  const [attemptedMatches, setAttemptedMatches] = useState([]) // Track all attempted matches
  const [showSettings, setShowSettings] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  // Density ranges for the game
  const densityRanges = [
    { name: "Very Light", range: [0, 0.5], color: "bg-blue-200", examples: "cork, styrofoam" },
    { name: "Light", range: [0.5, 0.9], color: "bg-green-200", examples: "wood, oil" },
    { name: "Medium", range: [0.9, 1.1], color: "bg-yellow-200", examples: "water, ice" },
    { name: "Heavy", range: [1.1, 2.0], color: "bg-orange-200", examples: "honey, rubber" },
    { name: "Very Heavy", range: [2.0, 10.0], color: "bg-red-200", examples: "metal, rock" },
  ]

  // Game objects with properties
  const gameObjects = [
    { id: "cork", name: "Cork", image: "🪶", density: 0.24, hint: "Cork is very light and has tiny air pockets!" },
    { id: "styrofoam", name: "Styrofoam", image: "📦", density: 0.05, hint: "Styrofoam is mostly air!" },
    { id: "wood", name: "Wood", image: "🪵", density: 0.7, hint: "Wood is less dense than water!" },
    {
      id: "oil",
      name: "Vegetable Oil",
      image: "🫒",
      density: 0.92,
      hint: "Oil floats on water because it's slightly less dense!",
    },
    { id: "ice", name: "Ice", image: "🧊", density: 0.92, hint: "Ice is slightly less dense than liquid water!" },
    { id: "water", name: "Water", image: "💧", density: 1.0, hint: "Water is our reference point with density 1.0!" },
    { id: "milk", name: "Milk", image: "🥛", density: 1.03, hint: "Milk is slightly denser than water!" },
    { id: "honey", name: "Honey", image: "🍯", density: 1.4, hint: "Honey is thick and dense!" },
    {
      id: "rubber",
      name: "Rubber",
      image: "🧽",
      density: 1.2,
      hint: "Rubber is denser than water but less dense than metal!",
    },
    {
      id: "glass",
      name: "Glass",
      image: "🔮",
      density: 2.5,
      hint: "Glass is quite dense, which is why it sinks in water!",
    },
    {
      id: "aluminum",
      name: "Aluminum",
      image: "🥫",
      density: 2.7,
      hint: "Aluminum is a lightweight metal, but still denser than water!",
    },
    {
      id: "iron",
      name: "Iron",
      image: "⚙",
      density: 7.8,
      hint: "Iron is very dense, which makes it heavy for its size!",
    },
    { id: "gold", name: "Gold", image: "🏆", density: 19.3, hint: "Gold is one of the densest common materials!" },
  ]

  // Get density category for a given density value
  const getDensityCategory = (density) => {
    for (let i = 0; i < densityRanges.length; i++) {
      if (density >= densityRanges[i].range[0] && density < densityRanges[i].range[1]) {
        return i
      }
    }
    return 4 // Default to "Very Heavy" if out of all ranges
  }

  // Initialize a new round
  const initializeRound = () => {
    setSelectedObject(null)
    setSelectedDensity(null)
    setWrongAttempt(null)
    setShowHint(false)
    setAttemptedMatches([]) // Reset attempted matches for new round

    // Number of objects increases with level
    const numObjects = Math.min(3 + level, 5)

    // Select random objects for this round
    const availableObjects = [...gameObjects]
    const selectedObjects = []

    for (let i = 0; i < numObjects; i++) {
      if (availableObjects.length === 0) break

      const randomIndex = Math.floor(Math.random() * availableObjects.length)
      selectedObjects.push(availableObjects[randomIndex])
      availableObjects.splice(randomIndex, 1)
    }

    setObjects(selectedObjects)
    setCorrectMatches([])
  }

  // Check if the match is correct
  const checkMatch = () => {
    if (!selectedObject || selectedDensity === null) return

    const objectDensityCategory = getDensityCategory(selectedObject.density)
    const isCorrect = objectDensityCategory === selectedDensity

    // Add to attempted matches regardless of correctness
    setAttemptedMatches([
      ...attemptedMatches,
      {
        objectId: selectedObject.id,
        densityIndex: selectedDensity,
        isCorrect: isCorrect,
      },
    ])

    // Always add to correctMatches if the user has made a choice, regardless of correctness
    setCorrectMatches([...correctMatches, selectedObject.id])

    // Play appropriate sound and give feedback
    if (isCorrect) {
      playSound("correct")
      // Update high score if needed
      updateHighScore("densityMatch", score + 1)
      setScore(score + 1) // Increment score for correct matches
    } else {
      playSound("incorrect")
    }

    // If all objects are matched, end the round
    if (correctMatches.length + 1 === objects.length) {
      // Trigger confetti for completing a round
      if (confettiRef.current) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }

      // Check for level up
      if (currentRound % 3 === 0 && level < 3) {
        setLevel(level + 1)
        setGameState("levelComplete")
        playSound("levelUp")

        setTimeout(() => {
          setGameState("playing")
          setCurrentRound(currentRound + 1)
          initializeRound()
        }, 2500)
      } else {
        setTimeout(() => {
          setCurrentRound(currentRound + 1)
          initializeRound()
        }, 1500)
      }
    } else {
      setSelectedObject(null)
      setSelectedDensity(null)
    }
  }

  // Initialize the game
  useEffect(() => {
    initializeRound()
  }, [])

  // Check match when both selections are made
  useEffect(() => {
    if (selectedObject && selectedDensity !== null) {
      checkMatch()
    }
  }, [selectedObject, selectedDensity])

  // Check if an object has been attempted with a specific density
  const hasAttempted = (objectId, densityIndex) => {
    return attemptedMatches.some((match) => match.objectId === objectId && match.densityIndex === densityIndex)
  }

  // Get feedback color for attempted matches
  const getAttemptFeedback = (objectId, densityIndex) => {
    const attempt = attemptedMatches.find((match) => match.objectId === objectId && match.densityIndex === densityIndex)

    if (attempt) {
      return attempt.isCorrect ? "bg-green-100 border-green-300" : "bg-red-100 border-red-300"
    }
    return ""
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Game header */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-4 mb-4 border-4 border-amber-300">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={returnToMenu}
              className="mr-3 p-2 rounded-full hover:bg-gray-100"
              aria-label="Return to menu"
            >
              <ArrowLeft size={20} className="text-amber-600" />
            </button>
            <h1 className="text-2xl font-bold text-amber-600">Density Detective 🔍</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowInfo(!showInfo)} className="p-2 rounded-full hover:bg-gray-100">
              <Info size={20} className="text-amber-600" />
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-full hover:bg-gray-100">
              <Settings size={20} className="text-amber-600" />
            </button>
            <button onClick={() => setMuted(!muted)} className="p-2 rounded-full hover:bg-gray-100">
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Score: {score}</span>
            <div className="flex items-center gap-1">
              <Award size={16} className="text-yellow-500" />
              <span className="text-sm font-medium">Round: {currentRound}</span>
            </div>
            {highScore > 0 && (
              <div className="flex items-center gap-1">
                <Trophy size={16} className="text-yellow-500" />
                <span className="text-sm font-medium">Best: {highScore}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Beaker size={16} className="text-purple-500" />
            <span className="text-sm font-medium">Level {level}</span>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/50 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 max-w-sm w-full mx-4"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Settings</h2>
                <button onClick={() => setShowSettings(false)} className="p-1 rounded-full hover:bg-gray-100">
                  <ArrowLeft size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Sound Effects</span>
                  <button
                    onClick={() => setMuted(!muted)}
                    className={`px-3 py-1 rounded-full ${muted ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                  >
                    {muted ? "Off" : "On"}
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={returnToMenu}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Home size={16} />
                    Return to Main Menu
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/50 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 max-w-sm w-full mx-4"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Game Info</h2>
                <button onClick={() => setShowInfo(false)} className="p-1 rounded-full hover:bg-gray-100">
                  <ArrowLeft size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">How to Play</h3>
                  <p className="text-sm">
                    Match each object to its correct density category. Learn how different materials compare to each
                    other!
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Scoring</h3>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    <li>+1 point for each correct match</li>
                    <li>Complete all matches in a round for bonus points</li>
                    <li>Level up every 3 rounds</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowInfo(false)}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 rounded-lg"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level complete screen */}
      <AnimatePresence>
        {gameState === "levelComplete" && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/50 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 max-w-sm text-center"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mb-4 mx-auto w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center"
              >
                <Star className="text-white w-12 h-12" />
              </motion.div>

              <h2 className="text-2xl font-bold text-amber-600 mb-2">Level {level} Unlocked! 🎉</h2>
              <p className="mb-4">
                {level === 2
                  ? "Great job! Now you'll see more objects to match!"
                  : "Amazing! You're becoming a true density expert!"}
              </p>
              <div className="flex justify-center">
                <motion.div
                  className="text-6xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  {level === 2 ? "🧪" : "🔬"}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main game container */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border-4 border-amber-300">
        <div className="p-4 bg-amber-50">
          <h3 className="text-sm font-medium mb-2">Match each object to its density category!</h3>

          <div className="flex justify-center mb-2">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-amber-500 hover:text-amber-700 text-sm flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full hover:bg-amber-100 transition-colors"
            >
              <HelpCircle size={14} />
              {showHint ? "Hide Hint" : "Show Hint"}
            </button>
          </div>

          {showHint && (
            <motion.div
              className="mb-4 p-3 bg-yellow-50 rounded-lg text-sm border-2 border-yellow-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p>Density is measured in g/cm³. Water has a density of 1.0 g/cm³.</p>
              <p className="mt-1">
                Objects with density less than 1.0 float in water, while objects with density greater than 1.0 sink!
              </p>
            </motion.div>
          )}
        </div>

        {/* Objects section */}
        <div className="p-4 border-t border-amber-200">
          <h3 className="text-sm font-medium mb-2">Objects:</h3>
          <div className="grid grid-cols-5 gap-2">
            {objects.map((object) => {
              // Find if this object has been attempted
              const attempt = attemptedMatches.find((a) => a.objectId === object.id)
              const isCorrect = attempt?.isCorrect

              return (
                <motion.button
                  key={object.id}
                  onClick={() => !correctMatches.includes(object.id) && setSelectedObject(object)}
                  className={`p-2 rounded-lg flex flex-col items-center justify-center ${
                    correctMatches.includes(object.id)
                      ? isCorrect
                        ? "bg-green-100 border-2 border-green-300"
                        : "bg-red-100 border-2 border-red-300"
                      : selectedObject?.id === object.id
                        ? "bg-amber-100 border-2 border-amber-400"
                        : wrongAttempt?.object === object.id
                          ? "bg-red-100 border-2 border-red-300"
                          : "bg-white border-2 border-gray-200 hover:border-amber-300"
                  }`}
                  disabled={correctMatches.includes(object.id)}
                  whileHover={!correctMatches.includes(object.id) ? { scale: 1.05 } : {}}
                  whileTap={!correctMatches.includes(object.id) ? { scale: 0.95 } : {}}
                >
                  <span className="text-3xl mb-1">{object.image}</span>
                  <span className="text-xs text-center">{object.name}</span>
                  {correctMatches.includes(object.id) && (
                    <span className="text-xs mt-1">{isCorrect ? "✓ Correct!" : "✗ Wrong!"}</span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Density categories section */}
        <div className="p-4 border-t border-amber-200">
          <h3 className="text-sm font-medium mb-2">Density Categories:</h3>
          <div className="grid grid-cols-1 gap-2">
            {densityRanges.map((range, index) => (
              <motion.button
                key={index}
                onClick={() => selectedObject && setSelectedDensity(index)}
                className={`p-3 rounded-lg flex items-center ${
                  selectedDensity === index
                    ? `${range.color} border-2 border-amber-400`
                    : wrongAttempt?.density === index
                      ? "bg-red-100 border-2 border-red-300"
                      : `${range.color} border-2 border-transparent hover:border-amber-300`
                }`}
                disabled={!selectedObject}
                whileHover={selectedObject ? { scale: 1.02 } : {}}
                whileTap={selectedObject ? { scale: 0.98 } : {}}
              >
                <div className="flex-1">
                  <div className="font-medium">{range.name}</div>
                  <div className="text-xs">
                    Density: {range.range[0]} - {range.range[1]} g/cm³
                  </div>
                  <div className="text-xs text-gray-600">Examples: {range.examples}</div>
                </div>
                {correctMatches.some((id) => {
                  const obj = objects.find((o) => o.id === id)
                  return obj && getDensityCategory(obj.density) === index
                }) && (
                  <div className="ml-2 flex flex-wrap justify-end gap-1">
                    {objects
                      .filter((obj) => correctMatches.includes(obj.id) && getDensityCategory(obj.density) === index)
                      .map((obj) => (
                        <span key={obj.id} className="text-xl">
                          {obj.image}
                        </span>
                      ))}
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Feedback section for attempted matches */}
        {attemptedMatches.length > 0 && !correctMatches.includes(selectedObject?.id) && (
          <div className="p-4 border-t border-amber-200">
            <h3 className="text-sm font-medium mb-2">Your Attempts:</h3>
            <div className="grid grid-cols-1 gap-2">
              {attemptedMatches.map((attempt, idx) => {
                const obj = objects.find((o) => o.id === attempt.objectId)
                if (!obj || correctMatches.includes(obj.id)) return null

                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg flex items-center ${
                      attempt.isCorrect ? "bg-green-100 border border-green-300" : "bg-red-100 border border-red-300"
                    }`}
                  >
                    <span className="text-xl mr-2">{obj.image}</span>
                    <div className="flex-1">
                      <span className="text-sm">{obj.name}</span>
                      <span className="text-xs block">
                        {attempt.isCorrect
                          ? `✓ Correct! It belongs in ${densityRanges[attempt.densityIndex].name}`
                          : `✗ Not in ${densityRanges[attempt.densityIndex].name} category`}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Confetti container */}
      <div ref={confettiRef} className="fixed inset-0 pointer-events-none" />

      {/* Game info */}
      <div className="w-full max-w-md mt-4 bg-white rounded-xl shadow-lg p-4 border-4 border-amber-300">
        <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Lightbulb className="text-yellow-500" size={18} />
          Density Facts
        </h3>

        <p className="text-sm text-gray-600">
          Density tells us how much mass is packed into a given volume. It's calculated as mass divided by volume.
        </p>

        <p className="text-sm text-gray-600 mt-2">
          Water has a density of 1.0 g/cm³, which makes it a useful reference point. Objects with density less than 1.0
          float in water, while objects with density greater than 1.0 sink!
        </p>

        <div className="mt-3 p-2 bg-amber-50 rounded-lg border-2 border-amber-200">
          <p className="text-sm font-medium text-amber-800 flex items-center gap-1">
            <Brain className="text-amber-500" size={16} />
            The shape of an object can affect whether it floats, even if its material is denser than water. That's why
            ships made of steel can float!
          </p>
        </div>
      </div>
    </div>
  )
}

