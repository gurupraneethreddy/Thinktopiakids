"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  Home,
  Award,
  Gamepad2Icon as GameController2,
  BarChart3,
  Headphones,
  BookText,
  Sparkles,
  ChevronRight,
  Star,
  Music,
  Rocket,
} from "lucide-react"

export default function Audiobooks() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeSubject, setActiveSubject] = useState(null)
  const [showSidebar, setShowSidebar] = useState(true)

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
        .finally(() => setLoading(false))
    } else {
      router.push("/register")
    }
  }, [router])

  const subjects = [
    {
      name: "Math",
      icon: "➗",
      path: "/audiobooks/math",
      color: "#FF6B6B",
      description: "Learn numbers, shapes, and fun math tricks!",
      character: "/placeholder.svg?height=80&width=80",
    },
    {
      name: "Science",
      icon: "🔬",
      path: "/audiobooks/science",
      color: "#4ECDC4",
      description: "Discover amazing facts about animals and nature!",
      character: "/placeholder.svg?height=80&width=80",
    },
    {
      name: "General Knowledge",
      icon: "🌍",
      path: "/audiobooks/gk",
      color: "#FFD166",
      description: "Explore the world and learn cool facts!",
      character: "/placeholder.svg?height=80&width=80",
    },
    {
      name: "English",
      icon: "📖",
      path: "/audiobooks/english",
      color: "#6A0572",
      description: "Enjoy stories and learn new words!",
      character: "/placeholder.svg?height=80&width=80",
    },
  ]

  const navItems = [
    { name: "Home", icon: <Home className="w-6 h-6" />, emoji: "🏡", path: "/home", color: "#FF9F1C" },
    { name: "Quizzes", icon: <Award className="w-6 h-6" />, emoji: "📜", path: "/quizzes", color: "#2EC4B6" },
    {
      name: "Audiobooks",
      icon: <Headphones className="w-6 h-6" />,
      emoji: "📖",
      path: "/audiobooks",
      color: "#E71D36",
      active: true,
    },
    {
      name: "Learning Games",
      icon: <GameController2 className="w-6 h-6" />,
      emoji: "🎮",
      path: "/learning_games",
      color: "#8338EC",
    },
    { name: "Progress", icon: <BarChart3 className="w-6 h-6" />, emoji: "📊", path: "/progress", color: "#3A86FF" },
  ]

  const handleSubjectClick = (subject) => {
    setActiveSubject(subject)
    setTimeout(() => {
      router.push(subject.path)
    }, 800)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 overflow-hidden">
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

      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-72 bg-gradient-to-b from-blue-600 to-purple-700 text-white p-6 fixed top-0 left-0 h-full z-50 shadow-xl rounded-tr-3xl"
          >
            <div className="flex items-center justify-between mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <BookOpen className="w-8 h-8 text-yellow-300" />
                <h2 className="text-2xl font-bold">Story World</h2>
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
                  <h3 className="font-bold text-lg">{user?.name || "Explorer"}</h3>
                  <p className="text-xs text-white/70">Adventure Level 5</p>
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
              <div className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <h3 className="font-bold">Daily Challenge</h3>
                </div>
                <p className="text-sm text-white/80 mb-3">Listen to a new story today and earn 50 stars!</p>
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

      {!showSidebar && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.1, x: 5 }}
          onClick={() => setShowSidebar(true)}
          className="fixed top-4 left-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg"
        >
          <ChevronRight className="w-6 h-6" />
        </motion.button>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`flex-1 flex flex-col p-6 ${showSidebar ? "ml-72" : "ml-0"} transition-all duration-300`}
      >
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="bg-white/80 backdrop-blur-md p-5 shadow-lg rounded-2xl mb-6 flex justify-between items-center"
        >
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
              className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl shadow-md"
            >
              <Headphones className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                Magic Audiobooks
              </h1>
              <p className="text-gray-600 text-sm">Listen, learn and have fun!</p>
            </div>
          </div>

          {user ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 bg-gradient-to-r from-blue-100 to-purple-100 py-2 px-4 rounded-xl cursor-pointer shadow-md"
              onClick={() => router.push("/profile")}
            >
              <div>
                <p className="text-sm text-gray-600">Hi there,</p>
                <p className="font-bold text-purple-700">{user.name}</p>
              </div>
              <div className="relative">
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full border-2 border-purple-400"
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
              className="bg-blue-100 py-2 px-4 rounded-xl"
            >
              <p className="text-blue-500">🔄 Loading your profile...</p>
            </motion.div>
          )}
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full md:w-1/2 bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white overflow-hidden relative"
          >
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white/10"
                  style={{
                    width: Math.random() * 40 + 10,
                    height: Math.random() * 40 + 10,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, Math.random() * 50 - 25],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: Math.random() * 5 + 5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                  className="bg-white/20 p-3 rounded-xl"
                >
                  <BookText className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold">Interactive Learning</h2>
              </div>

              <p className="text-white/80 mb-6">
                Listen to amazing stories and learn while having fun! Our audiobooks are designed to help you learn new
                things in an exciting way.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/20 backdrop-blur-sm p-4 rounded-xl flex flex-col items-center"
                >
                  <Music className="w-8 h-8 mb-2 text-yellow-300" />
                  <h3 className="font-medium">Listen Anywhere</h3>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/20 backdrop-blur-sm p-4 rounded-xl flex flex-col items-center"
                >
                  <Award className="w-8 h-8 mb-2 text-yellow-300" />
                  <h3 className="font-medium">Earn Rewards</h3>
                </motion.div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg"
                onClick={() => router.push("/games/solar-game")}
              >
                <Rocket className="w-5 h-5" />
                <span>Start Learning</span>
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full md:w-1/2 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 20,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-xl"
              >
                <Headphones className="w-6 h-6 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800">Choose a Subject</h2>
            </div>

            {error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-100 text-red-700 p-4 rounded-xl"
              >
                <p>{error}</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <AnimatePresence>
                  {subjects.map((subject, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{
                        scale: 1.05,
                        y: -5,
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      }}
                      style={{
                        backgroundColor: `${subject.color}20`,
                        borderTop: `3px solid ${subject.color}`,
                      }}
                      className={`p-5 rounded-xl cursor-pointer relative overflow-hidden ${
                        activeSubject === subject ? "opacity-50" : ""
                      }`}
                      onClick={() => handleSubjectClick(subject)}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 -mr-5 -mt-5 opacity-10">
                        <div className="w-full h-full rounded-full bg-white" />
                      </div>

                      <div className="flex flex-col items-center text-center">
                        <motion.div
                          animate={{
                            y: [0, -5, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                            delay: index * 0.2,
                          }}
                          className="text-5xl mb-3"
                        >
                          {subject.icon}
                        </motion.div>
                        <h3 className="text-xl font-bold mb-1" style={{ color: subject.color }}>
                          {subject.name}
                        </h3>
                        <p className="text-xs text-gray-600">{subject.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-6 bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl"
            >
              <div className="flex items-center gap-2 text-purple-700">
                <Sparkles className="w-5 h-5" />
                <p className="font-medium">Tip: Listen to a story every day to earn special badges!</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <span>Continue Listening</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03, y: -5 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-purple-100 flex gap-3"
              >
                <div className="w-16 h-16 bg-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookText className="w-8 h-8 text-purple-700" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-800">The Amazing Space Adventure</h3>
                  <p className="text-xs text-gray-600 mb-2">Chapter {i + 1} • 12 minutes left</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${65 - i * 15}%` }}></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
