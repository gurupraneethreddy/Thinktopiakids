"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Home, BarChart, FileText, BookOpen, LogOut, Menu, ChevronRight, X, Users } from "lucide-react"
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Helper function to group quiz/game scores by subject and calculate required data
const groupScoresBySubject = (scores, type = "quiz") => {
  const groupedData = {}

  scores.forEach((score) => {
    const key = type === "quiz" ? score.quiz_name : score.subject_name
    if (!groupedData[key]) {
      groupedData[key] = {
        name: key,
        latestScore: score.score,
        highestScore: score.score,
        totalAttempts: 1,
      }
    } else {
      groupedData[key].latestScore = score.score // Update to the latest score
      if (score.score > groupedData[key].highestScore) {
        groupedData[key].highestScore = score.score // Update highest score
      }
      groupedData[key].totalAttempts += 1 // Increment attempts
    }
  })

  return Object.values(groupedData)
}

// ScoreBox Component (Updated to explicitly display subject name)
const ScoreBox = ({ item, type }) => {
  return (
    <div className="p-6 rounded-lg shadow-sm border border-gray-200 bg-white">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">
          {type === "quiz" ? `Quiz: ${item.name}` : `Game: ${item.name}`}
        </h3>
      </div>
      <div className="space-y-2 mt-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Latest Score:</span>
          <span className="font-medium text-blue-600">{item.latestScore}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Highest Score:</span>
          <span className="font-medium text-green-600">{item.highestScore}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Attempts:</span>
          <span className="font-medium text-purple-600">{item.totalAttempts}</span>
        </div>
      </div>
    </div>
  )
}

// ProgressChart Component (Updated to adjust English game scores)
const ProgressChart = ({ progress, type }) => {
  // Adjust game scores for English by dividing by 10
  const adjustedProgress = progress.map((item) => {
    if (type === "game" && item.name.toLowerCase() === "english") {
      return {
        ...item,
        latestScore: item.latestScore / 10,
        highestScore: item.highestScore / 10,
      }
    }
    return item
  })

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">{type === "quiz" ? "Quiz" : "Game"} Score & Attempts Analysis</h3>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={adjustedProgress} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, angle: -45, textAnchor: "end", fill: "#4B5563" }}
              height={70}
            />
            <YAxis tick={{ fontSize: 12, fill: "#4B5563" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
              formatter={(value, name, props) =>
                type === "game" && props.payload.name.toLowerCase() === "english" && name !== "totalAttempts"
                  ? `${(value * 10).toFixed(0)} (${value.toFixed(1)} adjusted)`
                  : value
              }
            />
            <Legend />
            <Bar dataKey="totalAttempts" fill="#9333EA" name="Total Attempts" radius={[4, 4, 0, 0]} />
            <Bar dataKey="highestScore" fill="#2563EB" name="Highest Score" radius={[4, 4, 0, 0]} />
            <Bar dataKey="latestScore" fill="#10B981" name="Latest Score" radius={[4, 4, 0, 0]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ChildScoreModal Component
const ChildScoreModal = ({ child, quizScores, gameScores, onClose, type }) => {
  const groupedQuizScores = groupScoresBySubject(quizScores, "quiz")
  const groupedGameScores = groupScoresBySubject(gameScores, "game")

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-11/12 max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {type === "quiz" ? "Quiz" : "Game"} Scores for {child.name}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {type === "quiz" && groupedQuizScores.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedQuizScores.map((quiz, index) => (
                  <ScoreBox key={index} item={quiz} type="quiz" />
                ))}
              </div>
              <ProgressChart progress={groupedQuizScores} type="quiz" />
            </>
          ) : type === "game" && groupedGameScores.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedGameScores.map((game, index) => (
                  <ScoreBox key={index} item={game} type="game" />
                ))}
              </div>
              <ProgressChart progress={groupedGameScores} type="game" />
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No {type} scores found for this child.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Main ParentProgress Component
export default function ParentProgress() {
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [quizScores, setQuizScores] = useState([])
  const [gameScores, setGameScores] = useState([])
  const [error, setError] = useState("")
  const [user, setUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState("quiz") // "quiz" or "game"
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/register")
      return
    }

    // Fetch parent's profile data
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

    // Fetch the list of children
    fetch("http://localhost:5000/parent_students", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.students) {
          setChildren(data.students)
        } else {
          setError("Failed to fetch children.")
        }
      })
      .catch(() => setError("Error fetching children."))
  }, [router])

  const handleChildClick = (childId, type = "quiz") => {
    const token = localStorage.getItem("token")
    if (!token) {
      return
    }

    setSelectedChild(childId)
    setModalType(type)
    setIsModalOpen(true)

    if (type === "quiz") {
      fetch(`http://localhost:5000/child_quiz_scores?studentId=${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.quizScores) {
            setQuizScores(data.quizScores)
          } else {
            setError(data.error || "Failed to fetch quiz scores.")
          }
        })
        .catch(() => setError("Error fetching quiz scores."))
    } else if (type === "game") {
      fetch(`http://localhost:5000/child_game_scores?studentId=${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.gameScores) {
            setGameScores(data.gameScores)
          } else {
            setError(data.error || "Failed to fetch game scores.")
          }
        })
        .catch(() => setError("Error fetching game scores."))
    }
  }

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
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
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-slate-700 text-white"
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
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-700 hover:text-white"
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
              <BarChart className="h-5 w-5 text-slate-800 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">Child's Progress</h1>
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

        <main className="p-4 md:p-6 space-y-12">
          {/* Quiz Section */}
          <div>
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-slate-800 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Your Children (Quizzes)</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {children.length > 0 ? (
                children.map((child) => (
                  <div
                    key={child.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-md"
                    onClick={() => handleChildClick(child.id, "quiz")}
                  >
                    <div className="p-4 flex flex-col items-center">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200 mb-3">
                        <img
                          src={`/avatars/${child.avatar}`}
                          alt={child.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none"
                            e.target.nextSibling.style.display = "flex"
                          }}
                        />
                        <div className="absolute inset-0 bg-slate-700 text-white flex items-center justify-center text-sm font-medium hidden">
                          {getInitials(child.name)}
                        </div>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">{child.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{child.email}</p>
                      <div className="mt-3 text-xs text-blue-600 flex items-center">
                        <span>View quiz progress</span>
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white border border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-gray-500">No children found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Game Section */}
          <div>
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-slate-800 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Your Children (Games)</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {children.length > 0 ? (
                children.map((child) => (
                  <div
                    key={child.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-md"
                    onClick={() => handleChildClick(child.id, "game")}
                  >
                    <div className="p-4 flex flex-col items-center">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200 mb-3">
                        <img
                          src={`/avatars/${child.avatar}`}
                          alt={child.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none"
                            e.target.nextSibling.style.display = "flex"
                          }}
                        />
                        <div className="absolute inset-0 bg-slate-700 text-white flex items-center justify-center text-sm font-medium hidden">
                          {getInitials(child.name)}
                        </div>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">{child.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{child.email}</p>
                      <div className="mt-3 text-xs text-blue-600 flex items-center">
                        <span>View game progress</span>
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white border border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-gray-500">No children found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}

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

      {/* Modal for Scores */}
      {isModalOpen && selectedChild && (
        <ChildScoreModal
          child={children.find((c) => c.id === selectedChild)}
          quizScores={quizScores}
          gameScores={gameScores}
          onClose={() => setIsModalOpen(false)}
          type={modalType}
        />
      )}
    </div>
  )
}
