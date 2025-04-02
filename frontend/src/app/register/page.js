"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Sparkles, Star, Rocket, BookOpen, Home, Key, Mail, User, Lock, Award, Gift } from "lucide-react"

export default function Auth() {
  const [authState, setAuthState] = useState("login")
  const [theme, setTheme] = useState("space")

  const themes = {
    space: {
      bgClass: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
      icon: <Rocket className="h-8 w-8 text-yellow-300" />,
      name: "Space Adventure",
    },
    ocean: {
      bgClass: "bg-gradient-to-r from-cyan-500 to-blue-500",
      icon: <Sparkles className="h-8 w-8 text-white" />,
      name: "Ocean Explorer",
    },
    jungle: {
      bgClass: "bg-gradient-to-r from-green-400 to-emerald-500",
      icon: <BookOpen className="h-8 w-8 text-yellow-200" />,
      name: "Jungle Safari",
    },
  }

  const cycleTheme = () => {
    const themeKeys = Object.keys(themes)
    const currentIndex = themeKeys.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeKeys.length
    setTheme(themeKeys[nextIndex])
  }

  return (
    <div className={`min-h-screen ${themes[theme].bgClass} transition-all duration-500`}>
      <div className="absolute top-4 right-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={cycleTheme}
          className="bg-white/20 backdrop-blur-sm p-3 rounded-full shadow-lg"
        >
          {themes[theme].icon}
        </motion.button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="bg-white/30 backdrop-blur-md px-6 py-2 rounded-full shadow-lg">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              {themes[theme].icon}
              <span>Kid's Learning Adventure</span>
            </h1>
          </div>
        </motion.div>

        {authState === "login" && (
          <Login
            goToRegister={() => setAuthState("register")}
            goToForgotPassword={() => setAuthState("forgot")}
            theme={theme}
          />
        )}
        {authState === "register" && <Register goToLogin={() => setAuthState("login")} theme={theme} />}
        {authState === "forgot" && <ForgotPassword goToLogin={() => setAuthState("login")} theme={theme} />}
      </div>
    </div>
  )
}

function ForgotPassword({ goToLogin, theme }) {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [step, setStep] = useState(1)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const sendOtp = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      setMessage(data.message)
      if (res.ok) setStep(2)
    } catch (error) {
      setMessage("Oops! Something went wrong. Try again!")
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("http://localhost:5000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      })
      const data = await res.json()
      setMessage(data.message)
      if (res.ok) {
        setMessage("Password reset successful! You can now login.")
        setTimeout(() => goToLogin(), 3000)
      }
    } catch (error) {
      setMessage("Oops! Something went wrong. Try again!")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center"
    >
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden w-full max-w-md">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-purple-100 p-3 rounded-full">
              <Key className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-6 text-purple-700">Find Your Magic Key!</h2>

          {step === 1 ? (
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="pl-10 w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={sendOtp}
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    <span>Send Magic Code</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
              <div className="relative">
                <Star className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter Magic Code"
                  className="pl-10 w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Secret Password"
                  className="pl-10 w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetPassword}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Key className="h-5 w-5" />
                    <span>Create New Password</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-xl bg-blue-50 text-blue-700 text-center"
            >
              {message}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={goToLogin}
            className="mt-6 text-purple-600 hover:text-purple-800 font-medium flex items-center justify-center gap-1 w-full"
          >
            <Home className="h-4 w-4" />
            <span>Back to Login Adventure</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

function Login({ goToRegister, goToForgotPassword, theme }) {
  const [formData, setFormData] = useState({ email: "", password: "", role: "student" })
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [showSuccess, setShowSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("Preparing for takeoff...")

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (res.ok) {
        localStorage.setItem("token", data.token)
        setShowSuccess(true)
        setMessage("Yay! Login successful!")

        setTimeout(() => {
          if (formData.role === "student") {
            router.push("/home")
          } else {
            router.push("/parent_home")
          }
        }, 2000)
      } else {
        setMessage(data.error || "Oops! Login failed. Try again!")
      }
    } catch (error) {
      setMessage("Oops! Something went wrong. Try again!")
    } finally {
      setIsLoading(false)
    }
  }

  const characterVariants = {
    student: {
      image: "/logo.png?height=120&width=120",
      alt: "Student Character",
      message: "Ready for an adventure?",
    },
    parent: {
      image: "/logo.png?height=120&width=120",
      alt: "Parent Character",
      message: "Welcome back!",
    },
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center"
    >
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden w-full max-w-md">
        {showSuccess ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, times: [0, 0.2, 0.5, 1] }}
            className="p-8 flex flex-col items-center justify-center min-h-[400px]"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Award className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Hooray!</h2>
            <p className="text-center text-gray-600 mb-4">You're all set for your learning adventure!</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5 }}
                className="bg-green-600 h-2.5 rounded-full"
              />
            </div>
            <p className="text-sm text-gray-500">Taking you to your dashboard...</p>
          </motion.div>
        ) : (
          <div className="p-8">
            <div className="flex justify-center mb-2">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
                className="relative"
              >
                <Image
                  src={characterVariants[formData.role].image || "/placeholder.svg"}
                  alt={characterVariants[formData.role].alt}
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-white shadow-lg"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="absolute -right-2 -bottom-2 bg-yellow-400 rounded-full p-1"
                >
                  <Star className="h-5 w-5 text-white" />
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-blue-50 p-3 rounded-xl text-center mb-6"
            >
              <p className="text-blue-700">{characterVariants[formData.role].message}</p>
            </motion.div>

            <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">Start Your Adventure!</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-gray-50 p-2 rounded-xl flex items-center justify-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "student" })}
                  className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    formData.role === "student" ? "bg-blue-500 text-white shadow-md" : "bg-transparent text-gray-500"
                  }`}
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Student</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "parent" })}
                  className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    formData.role === "parent" ? "bg-blue-500 text-white shadow-md" : "bg-transparent text-gray-500"
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span>Parent</span>
                </motion.button>
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-10 w-full p-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="Your secret password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pl-10 w-full p-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Rocket className="h-5 w-5" />
                    <span>Blast Off!</span>
                  </>
                )}
              </motion.button>
            </form>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-3 rounded-xl ${
                  message.includes("successful") ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
                } text-center`}
              >
                {message}
              </motion.div>
            )}

            <div className="mt-6 flex flex-col gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={goToRegister}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1"
              >
                <Gift className="h-4 w-4" />
                <span>Create a New Account</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={goToForgotPassword}
                className="text-purple-600 hover:text-purple-800 font-medium flex items-center justify-center gap-1"
              >
                <Key className="h-4 w-4" />
                <span>Forgot Your Password?</span>
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function Register({ goToLogin, theme }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    grade: "",
    parentName: "",
    parentEmail: "",
  })
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const nextStep = () => {
    setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("Creating your adventure profile...")

    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (res.ok) {
        setMessage("Hooray! Your adventure profile is ready!")
        setTimeout(() => goToLogin(), 3000)
      } else {
        setMessage(data.error || "Oops! Something went wrong. Try again!")
      }
    } catch (error) {
      setMessage("Oops! Something went wrong. Try again!")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium text-blue-700 mb-4">Tell us about yourself!</h3>

            <div className="relative">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="name"
                placeholder="Your awesome name"
                value={formData.name}
                onChange={handleChange}
                required
                className="pl-10 w-full p-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Your email address"
                value={formData.email}
                onChange={handleChange}
                required
                className="pl-10 w-full p-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Create a secret password"
                value={formData.password}
                onChange={handleChange}
                required
                className="pl-10 w-full p-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-400">🎂</span>
                <input
                  type="number"
                  name="age"
                  placeholder="Your age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  className="pl-10 w-full p-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-400">📚</span>
                <input
                  type="number"
                  name="grade"
                  placeholder="Your grade"
                  value={formData.grade}
                  onChange={handleChange}
                  required
                  className="pl-10 w-full p-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={nextStep}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <span>Continue to Parent Info</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>
          </motion.div>
        )
      case 2:
        return (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium text-blue-700 mb-4">Parent Information</h3>

            <div className="relative">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="parentName"
                placeholder="Parent's name"
                value={formData.parentName}
                onChange={handleChange}
                required
                className="pl-10 w-full p-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="parentEmail"
                placeholder="Parent's email address"
                value={formData.parentEmail}
                onChange={handleChange}
                required
                className="pl-10 w-full p-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={prevStep}
                className="flex-1 border-2 border-blue-500 text-blue-600 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Back</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Rocket className="h-5 w-5" />
                    <span>Start Adventure!</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center"
    >
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden w-full max-w-md">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            >
              <div className="bg-blue-100 p-3 rounded-full">
                <Star className="h-8 w-8 text-blue-500" />
              </div>
            </motion.div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">Join the Adventure!</h2>

          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Your Info</span>
              <span>Parent Info</span>
            </div>
          </div>

          {renderStepContent()}

          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-xl ${
                message.includes("Hooray") ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
              } text-center`}
            >
              {message}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={goToLogin}
            className="mt-6 text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1 w-full"
          >
            <Home className="h-4 w-4" />
            <span>Already have an account? Login</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

