"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Home, BarChart, FileText, BookOpen, LogOut, Menu, X, PieChart, BarChart2 } from "lucide-react"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js"
import { Bar, Pie } from "react-chartjs-2"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

export default function ParentComparePage() {
  const [user, setUser] = useState(null)
  const [error, setError] = useState("")
  const [quizData, setQuizData] = useState(null)
  const [gameData, setGameData] = useState(null)
  const [viewType, setViewType] = useState("quiz") // "quiz" or "game"
  const [chartType, setChartType] = useState("combined") // "combined", "subject", "pie"
  const [selectedSubject, setSelectedSubject] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/register")
      return
    }

    // Fetch Parent Profile Data
    fetch("http://localhost:5000/parent_dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((userData) => {
        if (userData.user) {
          setUser({
            id: userData.user.id,
            name: userData.user.name || "Parent",
            email: userData.user.email || "No Email Found",
            avatar: userData.user.avatar ? `/avatars/${userData.user.avatar}` : "/avatars/default-avatar.png",
          })
        } else {
          setError("Failed to load parent profile.")
        }
      })
      .catch(() => setError("Error fetching profile data"))

    // Fetch Quiz Comparison Data
    fetch("http://localhost:5000/compare_students", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.students) {
          setQuizData(data)
          if (data.students[0]?.subjects?.length > 0) {
            setSelectedSubject(data.students[0].subjects[0].subject)
          }
        } else {
          setError("Failed to load quiz comparison data.")
        }
      })
      .catch(() => setError("Error fetching quiz comparison data"))

    // Fetch Game Comparison Data
    fetch("http://localhost:5000/compare_students_games", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.students) {
          // Ensure game data has the same structure as quiz data
          const formattedGameData = {
            ...data,
            students: data.students.map(student => ({
              ...student,
              subjects: student.subjects || [] // Ensure subjects array exists
            }))
          }
          setGameData(formattedGameData)
          if (formattedGameData.students[0]?.subjects?.length > 0) {
            setSelectedSubject(formattedGameData.students[0].subjects[0].subject)
          }
        } else {
          setError("Failed to load game comparison data.")
        }
      })
      .catch(() => setError("Error fetching game comparison data"))
  }, [router])

  // Update selectedSubject when viewType changes
  useEffect(() => {
    const currentData = viewType === "quiz" ? quizData : gameData
    if (currentData?.students[0]?.subjects?.length > 0) {
      setSelectedSubject(currentData.students[0].subjects[0].subject)
    }
  }, [viewType, quizData, gameData])

  const getInitials = (name) => {
    if (!name) return "P"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/register")
  }

  const renderChart = (data) => {
    if (!data) return null

    const rankedStudents = [...data.students].sort((a, b) => b.combined.average_score - a.combined.average_score)

    switch (chartType) {
      case "combined":
        return (
          <div className="h-[400px]">
            <Bar
              data={{
                labels: data.students.map((student) => student.name),
                datasets: [
                  {
                    label: viewType === "quiz" ? "Quiz Scores" : "Game Scores",
                    data: data.students.map((student) => student.combined.average_score),
                    backgroundColor: "rgba(37, 99, 235, 0.6)",
                    borderColor: "rgba(37, 99, 235, 1)",
                    borderWidth: 1,
                  },
                  {
                    label: viewType === "quiz" ? "Quiz Attempts" : "Game Attempts",
                    data: data.students.map((student) => student.combined.quiz_attempts),
                    backgroundColor: "rgba(220, 38, 38, 0.6)",
                    borderColor: "rgba(220, 38, 38, 1)",
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
                plugins: {
                  legend: { position: "top" },
                  title: {
                    display: true,
                    text: viewType === "quiz" ? "Overall Quiz Performance" : "Overall Game Performance",
                    font: { size: 16 },
                  },
                },
              }}
            />
          </div>
        )

      case "subject":
        if (!selectedSubject) return <p className="text-gray-500 py-4">Please select a subject.</p>

        return (
          <div className="h-[400px]">
            <Bar
              data={{
                labels: data.students.map((student) => student.name),
                datasets: [
                  {
                    label: viewType === "quiz" ? `Quiz Scores (${selectedSubject})` : `Game Scores (${selectedSubject})`,
                    data: data.students.map((student) => {
                      const subjectData = student.subjects.find((sub) => sub.subject === selectedSubject)
                      return subjectData ? subjectData.average_score : 0
                    }),
                    backgroundColor: "rgba(16, 185, 129, 0.6)",
                    borderColor: "rgba(16, 185, 129, 1)",
                    borderWidth: 1,
                  },
                  {
                    label: viewType === "quiz" ? `Quiz Attempts (${selectedSubject})` : `Game Attempts (${selectedSubject})`,
                    data: data.students.map((student) => {
                      const subjectData = student.subjects.find((sub) => sub.subject === selectedSubject)
                      return subjectData ? subjectData.quiz_attempts : 0
                    }),
                    backgroundColor: "rgba(139, 92, 246, 0.6)",
                    borderColor: "rgba(139, 92, 246, 1)",
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
                plugins: {
                  legend: { position: "top" },
                  title: {
                    display: true,
                    text: `${selectedSubject} ${viewType === "quiz" ? "Quiz" : "Game"} Performance`,
                    font: { size: 16 },
                  },
                },
              }}
            />
          </div>
        )

      case "pie":
        return (
          <div className="flex flex-col h-full">
            <div className="h-[400px]">
              <Pie
                data={{
                  labels: data.students.map((student) => student.name),
                  datasets: [
                    {
                      label: viewType === "quiz" ? "Quiz Scores" : "Game Scores",
                      data: data.students.map((student) => student.combined.average_score),
                      backgroundColor: [
                        "rgba(220, 38, 38, 0.6)",
                        "rgba(37, 99, 235, 0.6)",
                        "rgba(16, 185, 129, 0.6)",
                        "rgba(139, 92, 246, 0.6)",
                        "rgba(245, 158, 11, 0.6)",
                      ],
                      borderColor: [
                        "rgba(220, 38, 38, 1)",
                        "rgba(37, 99, 235, 1)",
                        "rgba(16, 185, 129, 1)",
                        "rgba(139, 92, 246, 1)",
                        "rgba(245, 158, 11, 1)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "right" },
                    title: {
                      display: true,
                      text: viewType === "quiz" ? "Quiz Score Distribution" : "Game Score Distribution",
                      font: { size: 16 },
                    },
                  },
                }}
              />
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Ranking Based on Average {viewType === "quiz" ? "Quiz" : "Game"} Scores
              </h3>
              <div className="bg-gray-50 rounded-md border border-gray-200">
                <div className="grid grid-cols-12 bg-gray-100 p-3 rounded-t-md border-b border-gray-200">
                  <div className="col-span-1 font-medium text-gray-700">Rank</div>
                  <div className="col-span-9 font-medium text-gray-700">Student</div>
                  <div className="col-span-2 font-medium text-gray-700 text-right">Score</div>
                </div>
                <div className="divide-y divide-gray-200">
                  {rankedStudents.map((student, index) => (
                    <div key={student.id} className="grid grid-cols-12 p-3">
                      <div className="col-span-1 text-gray-700">{index + 1}</div>
                      <div className="col-span-9 text-gray-700">{student.name}</div>
                      <div className="col-span-2 text-gray-700 text-right font-medium">
                        {student.combined.average_score}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`bg-slate-800 text-white w-64 fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              <h2 className="text-xl font-semibold">Parent Portal</h2>
              <button
                className="ml-auto lg:hidden text-slate-400 hover:text-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/parent_home")
                }}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/parent_progress")
                }}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                <BarChart className="h-5 w-5" />
                <span>Child's Progress</span>
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/parent_quizz")
                }}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                <FileText className="h-5 w-5" />
                <span>Assessments</span>
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/parent_compare")
                }}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-slate-700 text-white"
              >
                <BookOpen className="h-5 w-5" />
                <span>Learning Insights</span>
              </a>
            </nav>
          </div>
          <div className="p-4 border-t border-slate-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex h-16 items-center px-4">
            <button className="lg:hidden mr-2 text-gray-600 hover:text-gray-900" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-slate-800" />
              <h2 className="text-xl font-semibold text-slate-800">Parent Portal</h2>
            </div>
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-slate-800 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">Learning Insights</h1>
            </div>
            <div className="ml-auto flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div
                    className="relative w-10 h-10 rounded-full overflow-hidden cursor-pointer border border-gray-200"
                    onClick={() => router.push("/parent_profile")}
                  >
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none"
                        e.target.nextSibling.style.display = "flex"
                      }}
                    />
                    <div className="absolute inset-0 bg-slate-700 text-white flex items-center justify-center text-sm font-medium hidden">
                      {getInitials(user.name)}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Loading profile...</p>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Student Performance Comparison</h1>
          </div>

          {/* View Type Toggle */}
          <div className="flex items-center gap-4 mb-6">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                viewType === "quiz" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setViewType("quiz")}
            >
              Quiz Comparison
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                viewType === "game" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setViewType("game")}
            >
              Game Comparison
            </button>
          </div>

          {/* Chart Box */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label htmlFor="chart-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Chart Type
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                        chartType === "combined"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => setChartType("combined")}
                    >
                      <BarChart2 className="h-4 w-4 mr-1" />
                      Combined
                    </button>
                    <button
                      type="button"
                      className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                        chartType === "subject"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => setChartType("subject")}
                    >
                      <BarChart className="h-4 w-4 mr-1" />
                      Subject
                    </button>
                    <button
                      type="button"
                      className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                        chartType === "pie"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => setChartType("pie")}
                    >
                      <PieChart className="h-4 w-4 mr-1" />
                      Pie Chart
                    </button>
                  </div>
                </div>

                {/* Subject Dropdown for Subject Chart Type */}
                {chartType === "subject" && (viewType === "quiz" ? quizData : gameData) && (
                  <div>
                    <label htmlFor="subject-select" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <select
                      id="subject-select"
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      {(viewType === "quiz" ? quizData : gameData)?.students[0]?.subjects?.length > 0 ? (
                        (viewType === "quiz" ? quizData : gameData).students[0].subjects.map((subject) => (
                          <option key={subject.subject} value={subject.subject}>
                            {subject.subject}
                          </option>
                        ))
                      ) : (
                        <option value="">No subjects available</option>
                      )}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 md:p-6">
              {error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
              ) : !(viewType === "quiz" ? quizData : gameData) ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500">Loading {viewType} comparison data...</p>
                </div>
              ) : (
                renderChart(viewType === "quiz" ? quizData : gameData)
              )}
            </div>
          </div>

          {/* Mobile Sign Out Button */}
          <div className="lg:hidden pt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
