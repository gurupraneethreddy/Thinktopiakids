"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Sparkles, Award, Gift, MessageCircle, Home, BookOpen, GamepadIcon, BarChart2, ChevronRight, Trophy } from 'lucide-react'

export default function HomePage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState("")
  const [user, setUser] = useState(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false) // State to manage chatbot visibility
  const router = useRouter()

  useEffect(() => {
    // Fetch home page data
    fetch("http://localhost:5000/home")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch(() => setError("⚠ Failed to load home data"))

    // Fetch user profile
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
      router.push("/register")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/register")
  }

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  // Navigation items with enhanced details
  const navItems = [
    { name: "Home", icon: <Home className="w-6 h-6" />, emoji: "🏡", path: "/home", color: "#FF9F1C", active: true },
    { name: "Quizzes", icon: <Award className="w-6 h-6" />, emoji: "📜", path: "/quizzes", color: "#2EC4B6" },
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
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 overflow-hidden relative">
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
                <Home className="w-8 h-8 text-yellow-300" />
                <h2 className="text-2xl font-bold">Adventure Hub</h2>
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
              <div className="bg-gradient-to-r from-indigo-500/30 to-purple-500/30 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-300" />
                  <h3 className="font-bold">Daily Challenge</h3>
                </div>
                <p className="text-sm text-white/80 mb-3">Explore a new activity today and earn 50 points!</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/20 hover:bg-white/30 w-full py-2 rounded-lg text-sm font-medium"
                >
                  Start Challenge
                </motion.button>
              </div>
            </motion.div>

            {/* Logout button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="mt-6 bg-gradient-to-r from-red-400/80 to-pink-500/80 hover:from-red-400 hover:to-pink-500 w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
            >
              <span>👋</span>
              <span>Bye for now!</span>
            </motion.button>
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

      {/* Main Content */}
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
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Welcome to Your Adventure!
              </h1>
              <p className="text-gray-600 text-sm">Explore, learn and have fun!</p>
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

        {/* Welcome Message Card */}
        <div className="mt-8 bg-white p-8 rounded-3xl shadow-xl border-4 border-yellow-300 text-center relative overflow-hidden transform transition-all duration-500 hover:scale-[1.02]">
          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-200 rounded-full opacity-70"></div>
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-pink-200 rounded-full opacity-70"></div>

          {error ? (
            <div className="relative z-10 bg-red-100 p-4 rounded-xl border-2 border-red-300 animate-pulse">
              <p className="text-red-500 font-bold text-xl">{error}</p>
            </div>
          ) : data ? (
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <Award className="w-16 h-16 text-yellow-500" />
              </div>
              <h2 className="text-3xl font-extrabold text-purple-600 mb-4">{data.message}</h2>
              <div className="inline-block bg-gradient-to-r from-indigo-100 to-purple-100 p-4 rounded-2xl shadow-inner">
                <div className="flex items-center justify-center space-x-3">
                  <Gift className="w-8 h-8 text-purple-500" />
                  <p className="text-xl font-bold text-purple-700">
                    <span className="text-2xl">👨‍👩‍👧‍👦</span> Friends Learning:{" "}
                    <span className="text-2xl text-pink-600">{data.totalStudents}</span>
                  </p>
                </div>
              </div>

              {/* Activity cards */}
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="bg-gradient-to-br from-green-100 to-teal-100 p-6 rounded-2xl shadow-md border-2 border-green-200 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <h3 className="text-xl font-bold text-green-600 mb-2">Today's Challenge</h3>
                  <p className="text-green-700">Complete a new brain teaser and earn stars! ⭐⭐⭐</p>
                </div>

                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-6 rounded-2xl shadow-md border-2 border-blue-200 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <h3 className="text-xl font-bold text-blue-600 mb-2">New Stories</h3>
                  <p className="text-blue-700">Discover magical new adventures in Story Time! 📚✨</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex space-x-4">
                <div className="w-5 h-5 rounded-full bg-purple-500 animate-bounce"></div>
                <div className="w-5 h-5 rounded-full bg-pink-500 animate-bounce delay-100"></div>
                <div className="w-5 h-5 rounded-full bg-blue-500 animate-bounce delay-200"></div>
                <div className="w-5 h-5 rounded-full bg-green-500 animate-bounce delay-300"></div>
              </div>
              <p className="text-xl font-bold text-purple-600">Preparing your adventure...</p>
            </div>
          )}
        </div>

        {/* Additional content section */}
        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-pink-100 to-red-100 p-6 rounded-2xl shadow-lg border-2 border-pink-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <h3 className="text-xl font-bold text-pink-600 mb-3">Fun Facts</h3>
            <p className="text-pink-700">Did you know? Octopuses have three hearts and blue blood! 🐙💙</p>
          </div>

          <div className="bg-gradient-to-br from-purple-100 to-indigo-100 p-6 rounded-2xl shadow-lg border-2 border-purple-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <h3 className="text-xl font-bold text-purple-600 mb-3">Daily Riddle</h3>
            <p className="text-purple-700">
              What has keys but no locks, space but no room, and you can enter but not go in? 🤔
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-100 to-amber-100 p-6 rounded-2xl shadow-lg border-2 border-yellow-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <h3 className="text-xl font-bold text-yellow-600 mb-3">Word of the Day</h3>
            <p className="text-yellow-700">Serendipity: Finding something good without looking for it! ✨</p>
          </div>
        </div>
      </motion.div>

      {/* Chatbot */}
      <div className="fixed bottom-8 right-8 z-50">
        {isChatOpen ? (
          <div className="w-96 h-[500px] bg-white rounded-2xl shadow-2xl border-2 border-purple-200 overflow-hidden flex flex-col">
            {/* Chatbot Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Adventure Buddy</h3>
              </div>
              <button
                onClick={toggleChat}
                className="text-white hover:text-yellow-300 transition-all duration-300"
              >
                ✕
              </button>
            </div>

            {/* Chatbot Body */}
            <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-purple-50 to-indigo-50">
              <div className="space-y-4">
                {/* Example Chat Messages */}
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-3 rounded-xl max-w-[80%]">
                    Hi! How can I help you today?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-3 rounded-xl max-w-[80%]">
                    What's the answer to today's riddle?
                  </div>
                </div>
              </div>
            </div>

            {/* Chatbot Input */}
            <div className="p-4 bg-white border-t-2 border-purple-100">
              <input
                type="text"
                placeholder="Type your question..."
                className="w-full p-3 rounded-xl border-2 border-purple-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        ) : (
          <button
            onClick={toggleChat}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-110"
          >
            <MessageCircle className="w-8 h-8 text-white" />
          </button>
        )}
      </div>
    </div>
  )
}
