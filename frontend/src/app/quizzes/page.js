"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Home, BookOpen, GamepadIcon, BarChart2, Award, Loader2, ChevronRight, Star, Trophy } from 'lucide-react'

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [quizLoading, setQuizLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const res = await fetch("http://localhost:5000/quizzes")
        if (!res.ok) throw new Error("Failed to load quizzes")

        const data = await res.json()
        setQuizzes(data.quizzes)
      } catch (err) {
        setError("⚠ Failed to load quizzes. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  // Fetch User Profile
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetch("http://localhost:5000/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((userData) => {
          if (userData.user) {
            setUser({
              ...userData.user,
              avatar: userData.user.avatar ? `/avatars/${userData.user.avatar}` : "/avatars/default-avatar.png",
            })
          }
        })
        .catch(() => setError("⚠ Failed to load profile data"))
    } else {
      router.push("/register") // Redirect if not logged in
    }
  }, [router])

  //  Modified to redirect to a new page instead of fetching questions here
  async function startQuiz(quizId) {
    router.push(`/quizzes/${quizId}`)
  }

  // Get random pastel color for quiz cards
  const getRandomColor = () => {
    const colors = [
      "from-pink-200 to-pink-300 border-pink-400",
      "from-purple-200 to-purple-300 border-purple-400",
      "from-blue-200 to-blue-300 border-blue-400",
      "from-green-200 to-green-300 border-green-400",
      "from-yellow-200 to-yellow-300 border-yellow-400",
      "from-orange-200 to-orange-300 border-orange-400",
      "from-red-200 to-red-300 border-red-400",
      "from-teal-200 to-teal-300 border-teal-400",
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Get random emoji for quiz cards
  const getRandomEmoji = () => {
    const emojis = ["🧩", "🎯", "🎮", "🧠", "⭐", "🔍", "🎪", "🎨", "🎭", "🎪"]
    return emojis[Math.floor(Math.random() * emojis.length)]
  }

  // Navigation items with enhanced details
  const navItems = [
    { name: "Home", icon: <Home className="w-6 h-6" />, emoji: "🏡", path: "/home", color: "#FF9F1C" },
    { name: "Quizzes", icon: <Award className="w-6 h-6" />, emoji: "📜", path: "/quizzes", color: "#2EC4B6", active: true },
    {
      name: "Audiobooks",
      icon: <BookOpen className="w-6 h-6" />,
      emoji: "📖",
      path: "/audiobooks",
      color: "#E71D36",
    },
    {
      name: "Learning Games",
      icon: <GamepadIcon className="w-6 h-6" />,
      emoji: "🎮",
      path: "/learning_games",
      color: "#8338EC",
    },
    { name: "Progress", icon: <BarChart2 className="w-6 h-6" />, emoji: "📊", path: "/progress", color: "#3A86FF" },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 overflow-hidden">
      {/* Floating Decorative Elements */}
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

      {/* 📌 Sidebar Menu - Now with animations */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-72 bg-gradient-to-b from-indigo-600 to-purple-700 text-white p-6 fixed top-0 left-0 h-full z-50 shadow-xl rounded-tr-3xl"
          >
            <div className="flex items-center justify-between mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <Award className="w-8 h-8 text-yellow-300" />
                <h2 className="text-2xl font-bold">Quiz World</h2>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSidebar(false)}
                className="text-white/80 hover:text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </div>

            {user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-8 flex items-center gap-4"
              >
                <div className="relative">
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt="User Avatar"
                    className="w-14 h-14 rounded-full border-2 border-yellow-300"
                    onError={(e) => (e.target.src = "/avatars/default-avatar.png")}
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1"
                  >
                    <Star className="w-3 h-3 text-white" />
                  </motion.div>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{user?.name || "Quizzer"}</h3>
                  <p className="text-xs text-white/70">Quiz Level 5</p>
                </div>
              </motion.div>
            )}

            <ul className="space-y-3">
              {navItems.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05, x: 5 }}
                  className={`cursor-pointer rounded-xl overflow-hidden ${
                    item.active ? "bg-white/20 shadow-lg" : "hover:bg-white/10"
                  }`}
                  onClick={() => router.push(item.path)}
                >
                  <div className="flex items-center p-3 gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.icon}
                    </div>
                    <span className="text-lg font-medium">{item.name}</span>
                    {item.active && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                        <div className="w-2 h-2 rounded-full bg-yellow-300" />
                      </motion.div>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-auto pt-6"
            >
              <div className="bg-gradient-to-r from-indigo-500/30 to-purple-500/30 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-300" />
                  <h3 className="font-bold">Daily Challenge</h3>
                </div>
                <p className="text-sm text-white/80 mb-3">Complete a quiz today and earn 50 points!</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/20 hover:bg-white/30 w-full py-2 rounded-lg text-sm font-medium"
                >
                  Start Challenge
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle sidebar button when hidden */}
      {!showSidebar && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.1, x: 5 }}
          onClick={() => setShowSidebar(true)}
          className="fixed top-4 left-4 z-50 bg-indigo-600 text-white p-3 rounded-full shadow-lg"
        >
          <ChevronRight className="w-6 h-6" />
        </motion.button>
      )}

      {/* Main Content Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`flex-1 flex flex-col p-6 ${showSidebar ? "ml-72" : "ml-0"} transition-all duration-300`}
      >
        {/* Top Header with fun elements */}
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="bg-white/80 backdrop-blur-md p-5 shadow-lg rounded-2xl mb-6 flex justify-between items-center"
        >
          {/* Page Title with animation */}
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                repeatDelay: 5,
              }}
              className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-xl shadow-md"
            >
              <Award className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Quiz Adventure Time!
              </h1>
              <p className="text-gray-600 text-sm">Test your knowledge and have fun!</p>
            </div>
          </div>

          {/* Profile Section with animation */}
          {user ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 bg-gradient-to-r from-indigo-100 to-purple-100 py-2 px-4 rounded-xl cursor-pointer shadow-md"
              onClick={() => router.push("/profile")}
            >
              <div>
                <p className="text-sm text-gray-600">Hi there,</p>
                <p className="font-bold text-indigo-700">{user.name}</p>
              </div>
              <div className="relative">
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full border-2 border-indigo-400"
                  onError={(e) => (e.target.src = "/avatars/default-avatar.png")}
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1"
                >
                  <Star className="w-3 h-3 text-white" />
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              className="bg-indigo-100 py-2 px-4 rounded-xl"
            >
              <p className="text-indigo-500">🔄 Loading your profile...</p>
            </motion.div>
          )}
        </motion.div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg animate-bounce-once">
            <div className="flex items-center">
              <span className="text-2xl mr-2">⚠️</span>
              <p>{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-8 border-purple-200 border-t-purple-500 animate-spin"></div>
              <div className="absolute inset-4 rounded-full border-8 border-pink-200 border-t-pink-500 animate-spin-reverse"></div>
            </div>
            <p className="mt-6 text-xl font-medium text-purple-700">Loading fun quizzes for you...</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-purple-700 mb-2">Ready for a Challenge?</h2>
              <p className="text-purple-600">Pick a quiz below and test your knowledge! 🧠✨</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
              {quizzes.length > 0 ? (
                quizzes.map((quiz, index) => {
                  const colorClass = getRandomColor()
                  const emoji = getRandomEmoji()

                  return (
                    <div
                      key={quiz.id}
                      className={`bg-gradient-to-br ${colorClass} rounded-3xl p-6 shadow-lg border-4 transform transition-all duration-300 hover:scale-105 hover:shadow-xl relative overflow-hidden group`}
                    >
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full"></div>
                      <div className="absolute -left-6 -bottom-6 w-20 h-20 bg-white/20 rounded-full"></div>

                      <div className="flex items-start mb-4">
                        <span className="text-4xl mr-3">{emoji}</span>
                        <h2 className="text-2xl font-bold text-gray-800">{quiz.title}</h2>
                      </div>

                      <p className="text-gray-700 mt-2 mb-6">{quiz.description}</p>

                      <button
                        className="w-full bg-white text-purple-700 font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 group-hover:bg-purple-700 group-hover:text-white"
                        onClick={() => startQuiz(quiz.id)}
                      >
                        <span className="text-xl">🚀</span>
                        <span>Start Quiz!</span>
                      </button>

                      <div className="mt-4 flex justify-between items-center text-sm text-gray-700">
                        <span>Questions: {quiz.questionCount || "???"}</span>
                        <span>Difficulty: {quiz.difficulty || "Fun"}</span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="col-span-3 bg-white rounded-3xl p-8 shadow-lg text-center">
                  <div className="text-6xl mb-4">🧩</div>
                  <p className="text-2xl font-bold text-purple-700 mb-2">No Quizzes Yet!</p>
                  <p className="text-gray-600">Check back soon for awesome quizzes!</p>
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
