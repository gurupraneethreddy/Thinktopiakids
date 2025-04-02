"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Star, Award, Sparkles, CheckCircle, XCircle, Clock, ChevronRight } from "lucide-react"

export default function QuizPage() {
  const { quizId } = useParams()
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [feedback, setFeedback] = useState([])
  const [quizKey, setQuizKey] = useState(0)
  const [studentId, setStudentId] = useState(null)
  const [studentGrade, setStudentGrade] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isCorrect, setIsCorrect] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()

  // Fetch Student ID & Grade
  useEffect(() => {
    async function fetchStudentData() {
      try {
        const token = localStorage.getItem("token")
        if (!token) return console.error("No token found!")

        const res = await fetch("http://localhost:5000/dashboard", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Failed to fetch student data")
        const data = await res.json()
        setStudentId(data.user.id)
        setStudentGrade(data.user.grade)
      } catch (err) {
        console.error("Error fetching student data:", err)
      }
    }

    fetchStudentData()
  }, [])

  // Fetch Questions Based on quizId and Student ID
  useEffect(() => {
    if (!quizId || !studentId) return
    setIsLoading(true)

    async function fetchQuizQuestions() {
      try {
        const res = await fetch(`http://localhost:5000/quiz/start/${quizId}/${studentId}`)
        if (!res.ok) throw new Error("Failed to load questions")
        const data = await res.json()

        if (data.questions.length === 0) {
          console.warn("No questions found for this quiz.")
        }

        setQuestions(data.questions)
        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching quiz questions:", err)
        setIsLoading(false)
      }
    }

    fetchQuizQuestions()
  }, [quizId, studentId])

  // Timer Logic
  useEffect(() => {
    if (submitted || currentQuestionIndex >= questions.length || isLoading) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          handleNext()
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentQuestionIndex, submitted, questions.length, isLoading])

  // Handle Answer Selection
  function handleAnswer(option) {
    setAnswers({ ...answers, [questions[currentQuestionIndex].id]: option })

    // Show brief feedback animation
    const correctOption = questions[currentQuestionIndex].correct_option
    if (correctOption) {
      setIsCorrect(option.toUpperCase() === correctOption.toUpperCase())
      setTimeout(() => setIsCorrect(null), 1000)
    }
  }

  // Move to Next Question
  function handleNext() {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setTimeLeft(30)
    }
  }

  async function handleSubmit() {
    console.log("Submitting Quiz...")
    console.log("quizId:", quizId)
    console.log("answers:", answers)
    console.log("studentId:", studentId)

    setSubmitted(true)
    try {
      const res = await fetch("http://localhost:5000/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz_id: quizId,
          answers: Object.entries(answers).map(([question_id, selected_option]) => ({
            question_id,
            selected_option,
          })),
        }),
      })

      if (!res.ok) throw new Error("Failed to submit quiz")

      const result = await res.json()
      console.log("Quiz Result:", result)

      setScore(result.score)
      setFeedback(result.feedback)

      // Show confetti for good scores (over 70%)
      if (result.score / questions.length >= 0.7) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 5000)
      }

      if (!studentId) {
        console.error("Error: studentId is undefined")
        return
      }

      await fetch("http://localhost:5000/submit-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          quiz_id: quizId,
          score: result.score,
        }),
      })
    } catch (error) {
      console.error("Error submitting quiz:", error)
    }
  }

  // Calculate progress percentage
  const progressPercentage = (currentQuestionIndex / (questions.length - 1)) * 100

  return (
    <div
      key={quizKey}
      className="min-h-screen flex flex-col items-center bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-200 p-6 relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-20 right-40 w-24 h-24 rounded-full bg-yellow-300 opacity-30 animate-float"></div>
      <div className="absolute bottom-40 left-1/4 w-32 h-32 rounded-full bg-pink-300 opacity-30 animate-float-delay"></div>
      <div className="absolute top-1/3 left-1/3 w-16 h-16 rounded-full bg-blue-300 opacity-30 animate-float-slow"></div>
      <div className="absolute bottom-20 right-1/4 w-20 h-20 rounded-full bg-green-300 opacity-30 animate-float-delay-slow"></div>

      {/* Confetti effect */}
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            ></div>
          ))}
        </div>
      )}

      <div className="w-full max-w-4xl z-10">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push("/quizzes")}
            className="bg-white text-purple-600 px-4 py-2 rounded-full font-bold shadow-md hover:bg-purple-100 transition-all duration-300 flex items-center space-x-2"
          >
            <span>🏠</span>
            <span>Back to Quizzes</span>
          </button>

          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500">
            ✨ Brain Power Quiz! ✨
          </h1>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-10 bg-white rounded-3xl shadow-xl border-4 border-purple-300">
            <div className="flex space-x-3 mb-4">
              <div className="w-5 h-5 rounded-full bg-purple-500 animate-bounce"></div>
              <div className="w-5 h-5 rounded-full bg-pink-500 animate-bounce delay-100"></div>
              <div className="w-5 h-5 rounded-full bg-blue-500 animate-bounce delay-200"></div>
              <div className="w-5 h-5 rounded-full bg-green-500 animate-bounce delay-300"></div>
            </div>
            <p className="text-2xl font-bold text-purple-600">Loading your quiz adventure...</p>
          </div>
        ) : !submitted && questions.length === 0 ? (
          <div className="p-10 bg-white rounded-3xl shadow-xl border-4 border-yellow-300 text-center">
            <div className="w-24 h-24 mx-auto mb-4">
              <XCircle className="w-full h-full text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600">Oops! No questions found for this quiz.</p>
            <button
              onClick={() => router.push("/quizzes")}
              className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Try Another Quiz
            </button>
          </div>
        ) : !submitted ? (
          <>
            {/* Progress bar */}
            <div className="w-full bg-white rounded-full h-6 mb-6 shadow-md overflow-hidden border-2 border-purple-300">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-500 flex items-center justify-center"
                style={{ width: `${progressPercentage}%` }}
              >
                <span className="text-xs font-bold text-white">
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>
            </div>

            {/* Timer */}
            <div className="flex justify-center mb-6">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="absolute" width="100%" height="100%" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={timeLeft > 10 ? "#4ade80" : timeLeft > 5 ? "#fbbf24" : "#ef4444"}
                    strokeWidth="8"
                    strokeDasharray="283"
                    strokeDashoffset={(283 * (30 - timeLeft)) / 30}
                    transform="rotate(-90 50 50)"
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="flex flex-col items-center justify-center">
                  <Clock
                    className={`w-6 h-6 ${timeLeft > 10 ? "text-green-500" : timeLeft > 5 ? "text-amber-500" : "text-red-500"}`}
                  />
                  <span
                    className={`text-2xl font-bold ${timeLeft > 10 ? "text-green-500" : timeLeft > 5 ? "text-amber-500" : "text-red-500"}`}
                  >
                    {timeLeft}
                  </span>
                </div>
              </div>
            </div>

            {/* Question card */}
            <div className="p-8 bg-white rounded-3xl shadow-xl border-4 border-purple-300 mb-6 transform transition-all duration-500">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl mr-4">
                  {currentQuestionIndex + 1}
                </div>
                <h2 className="text-2xl font-extrabold text-purple-800 flex-1">
                  {questions[currentQuestionIndex].question_text}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {["a", "b", "c", "d"].map((opt) => (
                  <button
                    key={opt}
                    className={`p-4 rounded-2xl text-lg font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center ${
                      answers[questions[currentQuestionIndex].id] === opt.toUpperCase()
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                        : "bg-gradient-to-r from-blue-100 to-purple-100 text-purple-800 hover:from-blue-200 hover:to-purple-200"
                    }`}
                    onClick={() => handleAnswer(opt.toUpperCase())}
                  >
                    <div className="w-10 h-10 rounded-full bg-white text-purple-600 flex items-center justify-center mr-3 shadow-inner">
                      {opt.toUpperCase()}
                    </div>
                    <span className="flex-1 text-left">{questions[currentQuestionIndex][`option_${opt}`]}</span>
                  </button>
                ))}
              </div>

              {/* Feedback animation */}
              {isCorrect !== null && (
                <div className={`fixed inset-0 flex items-center justify-center z-50 pointer-events-none`}>
                  <div
                    className={`text-9xl transition-all duration-300 transform ${isCorrect ? "text-green-500 scale-150" : "text-red-500 scale-150"}`}
                  >
                    {isCorrect ? "✓" : "✗"}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-center space-x-6">
              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                  onClick={handleNext}
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-6 h-6" />
                </button>
              ) : (
                <button
                  className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-8 py-4 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                  onClick={handleSubmit}
                >
                  <span>Finish Quiz</span>
                  <CheckCircle className="w-6 h-6" />
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border-4 border-yellow-300 p-8 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-200 rounded-full opacity-70"></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-pink-200 rounded-full opacity-70"></div>

            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <Award className="w-20 h-20 text-yellow-500" />
              </div>

              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-6">
                Quiz Adventure Complete!
              </h2>

              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl shadow-inner mb-8">
                <div className="flex items-center justify-center space-x-4">
                  <Sparkles className="w-8 h-8 text-purple-500" />
                  <p className="text-2xl font-bold text-purple-800">
                    Your Score: <span className="text-3xl text-pink-600">{score}</span> /{" "}
                    <span>{questions.length}</span>
                  </p>
                  <Sparkles className="w-8 h-8 text-purple-500" />
                </div>

                {/* Score stars visualization */}
                <div className="flex justify-center mt-4 space-x-2">
                  {[...Array(questions.length)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-8 h-8 ${i < score ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                    />
                  ))}
                </div>

                {/* Motivational message based on score */}
                <p className="mt-4 text-xl font-bold text-purple-700">
                  {score === questions.length
                    ? "Perfect score! You're a genius! 🧠✨"
                    : score >= questions.length * 0.7
                      ? "Great job! You're super smart! 🌟"
                      : score >= questions.length * 0.5
                        ? "Good effort! Keep practicing! 💪"
                        : "Keep trying! You'll get better! 🌈"}
                </p>
              </div>

              {/* Feedback Section */}
              <h3 className="text-2xl font-bold text-purple-800 mb-4 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 mr-2 text-purple-600" />
                Let's Review Your Answers
              </h3>

              <div className="space-y-6 mb-8">
                {questions.map((question, index) => {
                  const fb = feedback.find((f) => f.question_id == question.id)
                  const isAttempted = fb !== undefined
                  const isCorrect = fb?.is_correct
                  const correctAnswer = question[`option_${fb?.correct_option?.toLowerCase()}`]
                  const selectedAnswer = isAttempted ? question[`option_${fb.selected_option.toLowerCase()}`] : null

                  return (
                    <div
                      key={question.id}
                      className={`p-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                        isAttempted
                          ? isCorrect
                            ? "bg-gradient-to-r from-green-100 to-teal-100 border-l-8 border-green-500 shadow-md"
                            : "bg-gradient-to-r from-red-100 to-pink-100 border-l-8 border-red-500 shadow-md"
                          : "bg-gradient-to-r from-gray-100 to-blue-100 border-l-8 border-gray-500 shadow-md"
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-purple-800 mr-3 shadow-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-bold text-purple-900 mb-3">{question.question_text}</p>

                          {isAttempted ? (
                            <div className="space-y-2">
                              <div className="flex items-center">
                                {isCorrect ? (
                                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                                )}
                                <p className={`font-bold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                                  Your Answer: {selectedAnswer}
                                </p>
                              </div>

                              {!isCorrect && (
                                <div className="flex items-center">
                                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                                  <p className="font-bold text-blue-700">Correct Answer: {correctAnswer}</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-white p-3 rounded-lg shadow-inner">
                              <p className="font-bold text-gray-600 flex items-center">
                                <XCircle className="w-5 h-5 mr-2 text-gray-500" />
                                Not Attempted
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  onClick={() => router.push("/quizzes")}
                >
                  <span>🔙</span>
                  <span>Back to Quizzes</span>
                </button>

                <button
                  className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  onClick={() => {
                    setQuizKey((prevKey) => prevKey + 1)
                    setSubmitted(false)
                    setCurrentQuestionIndex(0)
                    setAnswers({})
                    setScore(null)
                    setFeedback([])
                    setTimeLeft(30)
                  }}
                >
                  <span>🔄</span>
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delay-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float-delay 7s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-delay-slow {
          animation: float-delay-slow 9s ease-in-out infinite;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        /* Confetti animation */
        .confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 100;
          overflow: hidden;
        }
        
        .confetti {
          position: absolute;
          top: -10px;
          border-radius: 0%;
          animation: confetti-fall linear forwards;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

