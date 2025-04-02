"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import {
  BookOpen,
  Home,
  Award,
  Gamepad2Icon as GameController2,
  BarChart3,
  Headphones,
  ChevronRight,
  Star,
  Trophy,
  Rocket,
  Brain,
  Sparkles,
  Medal,
  TrendingUp,
  Target,
  Lightbulb,
  Flame,
} from "lucide-react";

export default function ProgressTracker() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [subjectProgress, setSubjectProgress] = useState([]);
  const [historicalSubjectProgress, setHistoricalSubjectProgress] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showSidebar, setShowSidebar] = useState(true);
  const router = useRouter();

  const navItems = [
    { name: "Home", icon: <Home className="w-6 h-6" />, emoji: "🏡", path: "/home", color: "#FF9F1C" },
    { name: "Quizzes", icon: <Award className="w-6 h-6" />, emoji: "📜", path: "/quizzes", color: "#2EC4B6" },
    { name: "Audiobooks", icon: <Headphones className="w-6 h-6" />, emoji: "📖", path: "/audiobooks", color: "#E71D36" },
    { name: "Learning Games", icon: <GameController2 className="w-6 h-6" />, emoji: "🎮", path: "/learning_games", color: "#8338EC" },
    { name: "Progress", icon: <BarChart3 className="w-6 h-6" />, emoji: "📊", path: "/progress", color: "#3A86FF", active: true },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/register");
      return;
    }

    const fetchData = async () => {
      try {
        const userResponse = await fetch("http://localhost:5000/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userResponse.json();
        if (userData.user) {
          setUser({
            ...userData.user,
            avatar: userData.user.avatar ? `/avatars/${userData.user.avatar}` : "/avatars/default-avatar.png",
          });
        }

        const progressResponse = await fetch("http://localhost:5000/progress", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const progressData = await progressResponse.json();
        if (progressData.progress && Array.isArray(progressData.progress)) {
          setProgress(
            progressData.progress.map((quiz) => ({
              ...quiz,
              latestScore: quiz.latestScore * 10,
              highestScore: quiz.highestScore * 10,
            }))
          );
        } else {
          setProgress([]);
        }

        const weeklyResponse = await fetch("http://localhost:5000/weekly_progress", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const weeklyData = await weeklyResponse.json();
        if (weeklyData.weeklyProgress) {
          setWeeklyProgress(weeklyData.weeklyProgress);
        } else {
          setWeeklyProgress([]);
        }

        const gameScoresResponse = await fetch("http://localhost:5000/game_scores_by_subject", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const gameScoresData = await gameScoresResponse.json();
        if (gameScoresData.subjectProgress) {
          setSubjectProgress(
            gameScoresData.subjectProgress.map((item, index) => ({
              ...item,
              avgScore: Math.min(item.avgScore * 10, 70),
              color: COLORS[index % COLORS.length],
              icon: ["➗", "🔬", "📖", "🌍", "🎲"][index % 5],
            }))
          );
        } else {
          setSubjectProgress([]);
        }
        if (gameScoresData.historicalProgress) {
          setHistoricalSubjectProgress(gameScoresData.historicalProgress);
        } else {
          setHistoricalSubjectProgress([]);
        }
      } catch (err) {
        setError("⚠ Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const COLORS = ["#FF6B6B", "#4ECDC4", "#FFD166", "#6A0572", "#8338EC"];

  // Calculate skills data from quiz and game progress
  const quizSubjects = progress.map(quiz => ({
    skill: quiz.quiz_name,
    value: quiz.highestScore || 0
  }));
  const gameAverage = subjectProgress.length > 0
    ? subjectProgress.reduce((sum, subj) => sum + subj.avgScore, 0) / subjectProgress.length
    : 0;
  const skillsData = [...quizSubjects, { skill: "Game Skills", value: Math.round(gameAverage) }];

  // Calculate overall quiz and game scores for achievements
  const overallQuizScore = progress.length > 0
    ? Math.round(progress.reduce((sum, quiz) => sum + quiz.highestScore, 0) / progress.length)
    : 0;
  const overallGameScore = gameAverage;

  const achievements = [
    { name: "Quiz Master", icon: <Trophy className="w-6 h-6" />, progress: overallQuizScore, color: "#FFD700" },
    { name: "Game Champion", icon: <GameController2 className="w-6 h-6" />, progress: overallGameScore, color: "#2196F3" },
  ];

  const badges = [
    { name: "Math Whiz", icon: "🧮", unlockThreshold: 80, type: "game", color: "#FF6B6B" },
    { name: "Science Explorer", icon: "🔬", unlockThreshold: 75, type: "game", color: "#4ECDC4" },
    { name: "Reading Star", icon: "📚", unlockThreshold: 70, type: "quiz", color: "#6A0572" },
    { name: "Quiz Champion", icon: "🏆", unlockThreshold: 85, type: "quiz", color: "#FFD166" },
    { name: "Perfect Score", icon: "💯", unlockThreshold: 95, type: "quiz", color: "#8338EC" },
    { name: "Fast Learner", icon: "⚡", unlockThreshold: 70, type: "game", color: "#FF6B6B" },
    { name: "Consistent Player", icon: "📅", unlockThreshold: 65, type: "game", color: "#4ECDC4" },
    { name: "Creative Thinker", icon: "🎨", unlockThreshold: 80, type: "quiz", color: "#6A0572" },
    { name: "Team Player", icon: "👥", unlockThreshold: 75, type: "game", color: "#FFD166" },
    { name: "Problem Solver", icon: "🧩", unlockThreshold: 85, type: "quiz", color: "#8338EC" },
  ].map(badge => ({
    ...badge,
    unlocked: badge.type === "quiz" 
      ? overallQuizScore >= badge.unlockThreshold 
      : overallGameScore >= badge.unlockThreshold
  }));

  const recommendedActivities = [
    { name: "Logic Puzzles", skill: "Logic", icon: "🧩", color: "#4ECDC4", search: "logic puzzles" },
    { name: "Memory Games", skill: "Memory", icon: "🎯", color: "#FF6B6B", search: "memory games" },
    { name: "Creative Writing", skill: "Creativity", icon: "✏️", color: "#6A0572", search: "creative writing exercises" },
    { name: "Math Challenges", skill: "Problem Solving", icon: "🔢", color: "#FFD166", search: "math challenges" },
    { name: "Concentration Games", skill: "Focus", icon: "🎮", color: "#8338EC", search: "concentration games" },
    { name: "Science Experiments", skill: "Logic", icon: "🔬", color: "#4ECDC4", search: "science experiments for kids" },
  ];

  const handleActivityClick = (searchTerm) => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`, "_blank");
  };

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
            className="w-72 bg-gradient-to-b from-purple-600 to-indigo-700 text-white p-6 fixed top-0 left-0 h-full z-50 shadow-xl rounded-tr-3xl"
          >
            <div className="flex items-center justify-between mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <BarChart3 className="w-8 h-8 text-yellow-300" />
                <h2 className="text-2xl font-bold">Progress Hub</h2>
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
                  <p className="text-xs text-white/70">Learning Level 5</p>
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
              <div className="bg-gradient-to-r from-purple-500/30 to-indigo-500/30 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-300" />
                  <h3 className="font-bold">Weekly Challenge</h3>
                </div>
                <p className="text-sm text-white/80 mb-3">Complete 5 quizzes this week to earn a special badge!</p>
                <div className="w-full bg-white/10 h-2.5 rounded-full mb-2">
                  <motion.div
                    className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "60%" }}
                    transition={{ duration: 1, delay: 1 }}
                  />
                </div>
                <p className="text-xs text-white/70 text-right">3/5 completed</p>
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
          className="fixed top-4 left-4 z-50 bg-purple-600 text-white p-3 rounded-full shadow-lg"
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
              className="bg-gradient-to-br from-purple-500 to-indigo-500 p-3 rounded-xl shadow-md"
            >
              <BarChart3 className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                Your Learning Journey
              </h1>
              <p className="text-gray-600 text-sm">Track your progress and achievements!</p>
            </div>
          </div>

          {user ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 bg-gradient-to-r from-purple-100 to-indigo-100 py-2 px-4 rounded-xl cursor-pointer shadow-md"
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
              className="bg-purple-100 py-2 px-4 rounded-xl"
            >
              <p className="text-purple-500">🔄 Loading your profile...</p>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-md p-2 rounded-xl shadow-md mb-6 flex justify-center"
        >
          <div className="flex space-x-2">
            {[
              { id: "overview", label: "Overview", icon: <TrendingUp className="w-4 h-4" /> },
              { id: "subjects", label: "Subjects", icon: <Brain className="w-4 h-4" /> },
              { id: "skills", label: "Skills", icon: <Target className="w-4 h-4" /> },
              { id: "achievements", label: "Achievements", icon: <Medal className="w-4 h-4" /> },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-purple-100"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab.icon}
                {tab.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "overview" && (
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Weekly Quiz Progress</h2>
                  </div>

                  {loading ? (
                    <p className="text-center text-gray-500">Loading...</p>
                  ) : weeklyProgress.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={weeklyProgress}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" tick={{ fill: "#6b21a8" }} />
                        <YAxis tick={{ fill: "#6b21a8" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="url(#colorScore)"
                          strokeWidth={3}
                          dot={{ fill: "#6b21a8", r: 6 }}
                          activeDot={{ r: 8, fill: "#9333ea" }}
                        />
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#6b21a8" />
                            <stop offset="100%" stopColor="#9333ea" />
                          </linearGradient>
                        </defs>
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-500">No quiz attempts this week.</p>
                  )}

                  <div className="mt-4 bg-purple-100 p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <p className="text-purple-700 font-medium">
                        {weeklyProgress.some((day) => day.score > 0)
                          ? "Great job! You're making progress this week."
                          : "No quiz attempts this week yet. Start a quiz!"}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {progress.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                  >
                    {progress.map((quiz, index) => (
                      <motion.div
                        key={quiz.quiz_id}
                        whileHover={{ scale: 1.03, y: -5 }}
                        className="bg-gradient-to-br p-5 rounded-2xl shadow-lg text-white overflow-hidden relative"
                        style={{
                          background: `linear-gradient(135deg, ${COLORS[index % COLORS.length]}80, ${COLORS[index % COLORS.length]})`,
                        }}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 opacity-10">
                          <div className="w-full h-full rounded-full bg-white" />
                        </div>

                        <h3 className="text-xl font-bold mb-3">{quiz.quiz_name}</h3>

                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-white/80">Latest Score</span>
                              <span className="font-bold">{quiz.latestScore}%</span>
                            </div>
                            <div className="w-full bg-white/20 h-2 rounded-full">
                              <motion.div
                                className="h-full bg-white rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${quiz.latestScore}%` }}
                                transition={{ duration: 1, delay: 0.1 * index }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-white/80">Highest Score</span>
                              <span className="font-bold">{quiz.highestScore}%</span>
                            </div>
                            <div className="w-full bg-white/20 h-2 rounded-full">
                              <motion.div
                                className="h-full bg-white/80 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${quiz.highestScore}%` }}
                                transition={{ duration: 1, delay: 0.2 + 0.1 * index }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                          <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                            {quiz.totalAttempts} attempts
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-white/20 hover:bg-white/30 p-2 rounded-full"
                          >
                            <Rocket className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {progress.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-800">Score & Attempts Analysis</h2>
                    </div>

                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={progress} className="rounded-xl">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="quiz_name"
                          tick={{ fontSize: 12, fill: "#4A148C" }}
                          axisLine={{ stroke: "#e0e0e0" }}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#4A148C" }}
                          axisLine={{ stroke: "#e0e0e0" }}
                          domain={[0, (dataMax) => Math.max(dataMax, Math.max(...progress.map(p => p.totalAttempts)))]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
                        <Bar
                          dataKey="totalAttempts"
                          fill="url(#gradientYellow)"
                          name="Total Attempts"
                          radius={[10, 10, 0, 0]}
                          barSize={30}
                        />
                        <Bar
                          dataKey="highestScore"
                          fill="url(#gradientBlue)"
                          name="Highest Score"
                          radius={[10, 10, 0, 0]}
                          barSize={30}
                        />
                        <Bar
                          dataKey="latestScore"
                          fill="url(#gradientGreen)"
                          name="Latest Score"
                          radius={[10, 10, 0, 0]}
                          barSize={30}
                        />
                        <defs>
                          <linearGradient id="gradientYellow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ffcc00" />
                            <stop offset="100%" stopColor="#ff9900" />
                          </linearGradient>
                          <linearGradient id="gradientBlue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00C9FF" />
                            <stop offset="100%" stopColor="#0088FE" />
                          </linearGradient>
                          <linearGradient id="gradientGreen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00F260" />
                            <stop offset="100%" stopColor="#0575E6" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === "subjects" && (
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-pink-500 to-orange-500 p-2 rounded-lg">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Game Subject Progress</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 flex flex-col justify-center">
                      {subjectProgress.map((subject, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ scale: 1.03 }}
                          className="bg-white/50 p-4 rounded-xl shadow-sm flex items-center gap-4"
                        >
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                            style={{ backgroundColor: `${subject.color}30` }}
                          >
                            {subject.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-bold" style={{ color: subject.color }}>
                                {subject.subject}
                              </h3>
                              <span className="font-bold">{subject.avgScore}%</span>
                            </div>
                            <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: subject.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${subject.avgScore}%` }}
                                transition={{ duration: 1, delay: 0.2 + 0.1 * index }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div>
                      {loading ? (
                        <p className="text-center text-gray-500">Loading...</p>
                      ) : subjectProgress.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={subjectProgress}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="avgScore"
                              nameKey="subject"
                              label={({ subject, avgScore }) => `${subject}: ${avgScore}%`}
                            >
                              {subjectProgress.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-center text-gray-500">No game data available.</p>
                      )}
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 bg-gradient-to-r from-pink-100 to-orange-100 p-4 rounded-xl"
                  >
                    <div className="flex items-center gap-2 text-pink-700">
                      <Flame className="w-5 h-5" />
                      <p className="font-medium">
                        {subjectProgress.length > 0
                          ? `${
                              subjectProgress.reduce((max, curr) =>
                                curr.avgScore > max.avgScore ? curr : max
                              ).subject
                            } is your strongest subject! Keep it up!`
                          : "No game data yet. Play some games!"}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-green-500 to-teal-500 p-2 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Game Subject Progress Over Time</h2>
                  </div>

                  {loading ? (
                    <p className="text-center text-gray-500">Loading...</p>
                  ) : historicalSubjectProgress.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart
                        data={historicalSubjectProgress.reduce((acc, curr) => {
                          const monthData = acc.find((item) => item.month === curr.month) || {
                            month: curr.month,
                          };
                          monthData[curr.subject_name] = parseFloat(curr.score);
                          if (!acc.find((item) => item.month === curr.month)) acc.push(monthData);
                          return acc;
                        }, [])}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fill: "#4A148C" }} />
                        <YAxis tick={{ fill: "#4A148C" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Legend iconType="circle" />
                        {subjectProgress.map((subject, index) => (
                          <Line
                            key={subject.subject}
                            type="monotone"
                            dataKey={subject.subject}
                            stroke={subject.color}
                            strokeWidth={3}
                            dot={{ fill: subject.color, r: 5 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-500">No historical game data available.</p>
                  )}
                </motion.div>
              </div>
            )}

            {activeTab === "skills" && (
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-lg">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Skills Analysis</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart outerRadius={90} data={skillsData}>
                          <PolarGrid stroke="#e0e0e0" />
                          <PolarAngleAxis dataKey="skill" tick={{ fill: "#4A148C" }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar name="Skills" dataKey="value" stroke="#8338EC" fill="#8338EC" fillOpacity={0.6} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.9)",
                              borderRadius: "12px",
                              border: "none",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-4">
                      {skillsData.map((skill, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="bg-white/50 p-4 rounded-xl shadow-sm"
                        >
                          <div className="flex justify-between mb-2">
                            <h3 className="font-bold text-indigo-800">{skill.skill}</h3>
                            <span className="font-bold text-indigo-800">{skill.value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2.5 rounded-full">
                            <motion.div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.value}%` }}
                              transition={{ duration: 1, delay: 0.2 + 0.1 * index }}
                            />
                          </div>
                          <p className="mt-2 text-sm text-gray-600">
                            {skill.skill === "Game Skills" 
                              ? "Your overall performance across all games!"
                              : "Your highest score in this quiz subject!"}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 bg-gradient-to-r from-blue-100 to-indigo-100 p-4 rounded-xl"
                  >
                    <div className="flex items-center gap-2 text-indigo-700">
                      <Sparkles className="w-5 h-5" />
                      <p className="font-medium">
                        {skillsData.length > 0 
                          ? `${skillsData.reduce((max, curr) => curr.value > max.value ? curr : max).skill} is your strongest area!`
                          : "Start some quizzes and games to see your skills!"}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-2 rounded-lg">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Recommended Activities</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {recommendedActivities.map((activity, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-white/50 p-4 rounded-xl shadow-md border-t-4 cursor-pointer"
                        style={{ borderColor: activity.color }}
                        onClick={() => handleActivityClick(activity.search)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{activity.icon}</div>
                          <div>
                            <h3 className="font-bold" style={{ color: activity.color }}>
                              {activity.name}
                            </h3>
                            <p className="text-xs text-gray-600">Improves {activity.skill}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === "achievements" && (
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-yellow-500 to-amber-500 p-2 rounded-lg">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Your Achievements</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.03 }}
                        className="bg-white/50 p-5 rounded-xl shadow-md border border-gray-100 relative overflow-hidden"
                      >
                        <div
                          className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 rounded-full opacity-10"
                          style={{ backgroundColor: achievement.color }}
                        />

                        <div className="flex items-center gap-4">
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${achievement.color}30` }}
                          >
                            <div className="text-2xl" style={{ color: achievement.color }}>
                              {achievement.icon}
                            </div>
                          </div>

                          <div className="flex-1">
                            <h3 className="text-lg font-bold mb-1" style={{ color: achievement.color }}>
                              {achievement.name}
                            </h3>

                            <div className="w-full bg-gray-200 h-2.5 rounded-full">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: achievement.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${achievement.progress}%` }}
                                transition={{ duration: 1, delay: 0.2 + 0.1 * index }}
                              />
                            </div>

                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-gray-500">Progress</span>
                              <span className="text-xs font-medium" style={{ color: achievement.color }}>
                                {achievement.progress}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {achievement.progress >= 80 && (
                          <div className="mt-3 bg-yellow-100 p-2 rounded-lg flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <p className="text-xs text-yellow-700">Almost there! Keep going!</p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                      <Medal className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Your Badge Collection</h2>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {badges.map((badge, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.1, y: -5 }}
                        className={`flex flex-col items-center p-4 rounded-xl ${
                          badge.unlocked ? "bg-white shadow-md" : "bg-gray-100 opacity-50"
                        }`}
                      >
                        <motion.div
                          animate={
                            badge.unlocked
                              ? {
                                  y: [0, -5, 0],
                                  rotate: [0, 5, 0, -5, 0],
                                }
                              : {}
                          }
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                            delay: index * 0.2,
                          }}
                          className="text-4xl mb-2"
                        >
                          {badge.icon}
                        </motion.div>
                        <h3
                          className="text-sm font-bold text-center"
                          style={{ color: badge.unlocked ? badge.color : "#9ca3af" }}
                        >
                          {badge.name}
                        </h3>
                        {badge.unlocked ? (
                          <span className="mt-1 text-xs text-green-600">Unlocked</span>
                        ) : (
                          <span className="mt-1 text-xs text-gray-500">Locked ({badge.unlockThreshold}%)</span>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl"
                  >
                    <div className="flex items-center gap-2 text-purple-700">
                      <Sparkles className="w-5 h-5" />
                      <p className="font-medium">
                        You've unlocked {badges.filter(b => b.unlocked).length} out of {badges.length} badges!
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="fixed bottom-10 right-10 z-0">
          {["🏆", "⭐", "📊", "🎯"].map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl"
              initial={{ opacity: 0.7, x: 0, y: 0 }}
              animate={{
                opacity: [0.7, 1, 0.7],
                x: [0, Math.random() * 40 - 20],
                y: [0, Math.random() * -50],
                rotate: [0, Math.random() * 40 - 20],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                delay: i * 0.5,
              }}
              style={{
                left: `${i * 30}px`,
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
