"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Home, BarChart, FileText, BookOpen, LogOut, Menu, ChevronRight, X, Users, Target } from "lucide-react"

// Quiz/Game Scores Modal Component
const ScoresModal = ({ child, quizScores, gameScores, onClose, type }) => {
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
          {type === "quiz" && quizScores.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessment Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attempt
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quizScores.map((quiz) => (
                    <tr key={quiz.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {quiz.quiz_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{quiz.score}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(quiz.attempt_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{quiz.attempt_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : type === "game" && gameScores.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Game ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attempt
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {gameScores.map((game) => (
                    <tr key={game.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {game.subject_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{game.game_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{game.score}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(game.attempt_timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{game.attempt_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

export default function ParentQuizzes() {
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

    // Fetch the parent's profile data
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
      // Fetch quiz scores
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
      // Fetch game scores
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
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-slate-700 text-white"
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
              <Target className="h-5 w-5 text-slate-800 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">Assessment Results</h1>
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
                        <span>View quiz scores</span>
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
                        <span>View game scores</span>
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
        <ScoresModal
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
