"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Home, BarChart, FileText, BookOpen, LogOut, Menu, X } from "lucide-react"

export default function ParentHomePage() {
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Fetch Parent Profile Data
    const token = localStorage.getItem("token")
    if (token) {
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
          }
        })
        .catch(() => console.log("Error fetching profile data"))
    } else {
      router.push("/register")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/register")
  }

  const getInitials = (name) => {
    if (!name) return "P"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <div
        className={`bg-slate-800 text-white w-64 fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
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

          {/* Sidebar Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/parent_home")
                }}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-slate-700 text-white"
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
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                <BookOpen className="h-5 w-5" />
                <span>Learning Insights</span>
              </a>
            </nav>
          </div>

          {/* Sidebar Footer */}
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
        {/* Top Navigation Bar */}
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
              <Home className="h-5 w-5 text-slate-800 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
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

        {/* Dashboard Content */}
        <main className="p-4 md:p-6 space-y-6">
          {/* Parent Motivation Section */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Parenting Motivation</h3>
            <div className="space-y-4">
              <p className="text-gray-600">
                "Every day is a new opportunity to inspire and support your child's growth. Your dedication shapes their future!"
              </p>
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="text-md font-medium text-blue-800 mb-2">Daily Parenting Tip</h4>
                <p className="text-sm text-blue-600">
                  Spend 15 minutes reading with your child today - it boosts their imagination and strengthens your bond.
                </p>
              </div>
            </div>
          </div>

          {/* Daily Routine Section */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Daily Parenting Routine</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">7:00 AM - Morning check-in with your child</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">3:30 PM - Review homework progress</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">6:00 PM - Family learning activity</span>
              </li>
            </ul>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 transition-all hover:shadow-md">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <BarChart className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Child's Progress</h3>
                <p className="text-sm text-gray-500 mb-4">Monitor your child's learning journey and achievements</p>
                <button
                  onClick={() => router.push("/parent_progress")}
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Progress
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 transition-all hover:shadow-md">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Assessments</h3>
                <p className="text-sm text-gray-500 mb-4">Review your child's quiz results and performance</p>
                <button
                  onClick={() => router.push("/parent_quizz")}
                  className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
                >
                  View Assessments
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 transition-all hover:shadow-md">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Learning Insights</h3>
                <p className="text-sm text-gray-500 mb-4">Get personalized tips to support your child's education</p>
                <button
                  onClick={() => router.push("/parent_compare")}
                  className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                >
                  View Insights
                </button>
              </div>
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
