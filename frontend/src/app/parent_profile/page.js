"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Home,
  BarChart,
  FileText,
  BookOpen,
  LogOut,
  Menu,
  X,
  User2,
  Edit,
  Save,
  ChevronLeft,
  Users,
} from "lucide-react"

const avatars = ["/avatars/avatar1.png", "/avatars/avatar2.png", "/avatars/avatar3.png", "/avatars/avatar4.png"]

export default function ParentProfile() {
  const [user, setUser] = useState(null)
  const [error, setError] = useState("")
  const [editMode, setEditMode] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [updatedName, setUpdatedName] = useState("")
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [viewingStudent, setViewingStudent] = useState(false)
  const [editingStudent, setEditingStudent] = useState(false)
  const [updatedStudentName, setUpdatedStudentName] = useState("")
  const [updatedStudentAge, setUpdatedStudentAge] = useState("")
  const [updatedStudentGrade, setUpdatedStudentGrade] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchParentProfile = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/register")
        return
      }

      try {
        const response = await fetch("http://localhost:5000/parent_dashboard", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Error ${response.status}: Unable to fetch profile`)
        }

        const data = await response.json()

        if (data.user) {
          setUser(data.user)
          setUpdatedName(data.user.name)
          setSelectedAvatar(data.user.avatar ? `/avatars/${data.user.avatar}` : avatars[0])
        } else {
          setError("Parent profile not found.")
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        setError("Failed to load profile. Try again later.")
      }
    }

    const fetchStudents = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        return
      }

      try {
        const response = await fetch("http://localhost:5000/parent_students", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch students")
        }

        const data = await response.json()
        setStudents(data.students)
      } catch (error) {
        console.error("Error fetching students:", error)
      }
    }

    fetchParentProfile()
    fetchStudents()
  }, [router])

  // Handle saving changes for the parent profile
  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch("http://localhost:5000/update-parent-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: updatedName,
          avatar: selectedAvatar.replace("/avatars/", ""), // Remove the prefix
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update parent profile")
      }

      const result = await response.json()

      // Update the user state with the new data
      setUser((prevUser) => ({
        ...prevUser,
        name: updatedName,
        avatar: selectedAvatar,
      }))

      // Exit edit mode
      setEditMode(false)
    } catch (error) {
      console.error("Parent profile update error:", error)
      setError("Failed to update parent profile. Try again later.")
    }
  }

  const handleSaveStudentChanges = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch("http://localhost:5000/update-student-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          name: updatedStudentName,
          age: updatedStudentAge,
          grade: updatedStudentGrade,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update student profile")
      }

      const result = await response.json()

      // Update the selected student's details in the state
      setSelectedStudent((prevStudent) => ({
        ...prevStudent,
        name: updatedStudentName,
        age: updatedStudentAge,
        grade: updatedStudentGrade,
      }))

      // Exit edit mode
      setEditingStudent(false)
    } catch (error) {
      console.error("Student profile update error:", error)
      setError("Failed to update student profile. Try again later.")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/register")
  }

  const handleStudentClick = async (studentId) => {
    const token = localStorage.getItem("token")
    if (!token) {
      return
    }

    try {
      const response = await fetch("http://localhost:5000/parent_students", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch student details")
      }

      const data = await response.json()
      const studentDetails = data.students.find((student) => student.id === studentId)

      if (studentDetails) {
        setSelectedStudent(studentDetails)
        setUpdatedStudentName(studentDetails.name)
        setUpdatedStudentAge(studentDetails.age)
        setUpdatedStudentGrade(studentDetails.grade)
        setViewingStudent(true) // Switch to student details view
      }
    } catch (error) {
      console.error("Error fetching student details:", error)
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
              <User2 className="h-5 w-5 text-slate-800 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            </div>
            <div className="ml-auto flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="relative w-10 h-10 rounded-full overflow-hidden cursor-pointer border border-gray-200">
                    <img
                      src={selectedAvatar || "/placeholder.svg"}
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
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}

          {user ? (
            <div className="space-y-6">
              {/* Parent Profile Section */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                      <img
                        src={selectedAvatar || "/placeholder.svg"}
                        alt="Parent Avatar"
                        className="w-24 h-24 rounded-full border-4 border-gray-200"
                        onError={(e) => {
                          e.target.style.display = "none"
                          e.target.nextSibling.style.display = "flex"
                        }}
                      />
                      <div className="absolute inset-0 bg-slate-700 text-white flex items-center justify-center text-xl font-medium rounded-full hidden">
                        {getInitials(user.name)}
                      </div>
                    </div>

                    <div className="flex-1 space-y-4 text-center md:text-left">
                      <div>
                        {editMode ? (
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Name</label>
                            <input
                              type="text"
                              value={updatedName}
                              onChange={(e) => setUpdatedName(e.target.value)}
                              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        ) : (
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">{user.name || "Parent"}</h2>
                            <p className="text-gray-500">{user.email}</p>
                          </div>
                        )}
                      </div>

                      {/* Avatar Selection in Edit Mode */}
                      {editMode && (
                        <div className="mt-4">
                          <label className="text-sm font-medium text-gray-700 block mb-2">Select Avatar</label>
                          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            {avatars.map((avatar, index) => (
                              <img
                                key={index}
                                src={avatar || "/placeholder.svg"}
                                alt={`Avatar ${index + 1}`}
                                className={`w-12 h-12 rounded-full cursor-pointer border-2 transition-all ${
                                  selectedAvatar === avatar
                                    ? "border-blue-500 scale-110"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                                onClick={() => setSelectedAvatar(avatar)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Edit & Save Buttons */}
                  <div className="mt-6 flex justify-center md:justify-end gap-3">
                    {editMode ? (
                      <>
                        <button
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                          onClick={handleSaveChanges}
                        >
                          <Save className="h-4 w-4" />
                          <span>Save Changes</span>
                        </button>
                        <button
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 transition-colors"
                          onClick={() => setEditMode(false)}
                        >
                          <X className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                      </>
                    ) : (
                      <button
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                        onClick={() => setEditMode(true)}
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit Profile</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Student List - Visible Only When No Student is Selected */}
              {!viewingStudent && students.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5 text-blue-600" />
                      <h2 className="text-xl font-semibold text-gray-900">Your Children</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {students.map((student) => (
                        <div
                          key={student.id}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleStudentClick(student.id)}
                        >
                          <div className="relative flex-shrink-0">
                            <img
                              src={`/avatars/${student.avatar}`}
                              alt={student.name}
                              className="w-16 h-16 rounded-full border-2 border-gray-200"
                              onError={(e) => {
                                e.target.style.display = "none"
                                e.target.nextSibling.style.display = "flex"
                              }}
                            />
                            <div className="absolute inset-0 bg-slate-700 text-white flex items-center justify-center text-sm font-medium rounded-full hidden">
                              {getInitials(student.name)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Student Details - Full Page View */}
              {viewingStudent && selectedStudent && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <button
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                        onClick={() => {
                          setViewingStudent(false)
                          setSelectedStudent(null)
                          setEditingStudent(false)
                        }}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back to student list</span>
                      </button>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="relative">
                        <img
                          src={`/avatars/${selectedStudent.avatar}`}
                          alt={selectedStudent.name}
                          className="w-24 h-24 rounded-full border-4 border-gray-200"
                          onError={(e) => {
                            e.target.style.display = "none"
                            e.target.nextSibling.style.display = "flex"
                          }}
                        />
                        <div className="absolute inset-0 bg-slate-700 text-white flex items-center justify-center text-xl font-medium rounded-full hidden">
                          {getInitials(selectedStudent.name)}
                        </div>
                      </div>

                      <div className="flex-1 space-y-4 text-center md:text-left">
                        <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.name}</h2>
                        <p className="text-gray-500">{selectedStudent.email}</p>
                      </div>
                    </div>

                    {/* Edit Mode for Student Details */}
                    {editingStudent ? (
                      <div className="mt-6 space-y-4 max-w-md mx-auto md:mx-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                              type="text"
                              value={updatedStudentName}
                              onChange={(e) => setUpdatedStudentName(e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                            <input
                              type="number"
                              value={updatedStudentAge}
                              onChange={(e) => setUpdatedStudentAge(e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                            <input
                              type="text"
                              value={updatedStudentGrade}
                              onChange={(e) => setUpdatedStudentGrade(e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        {/* Save and Cancel Buttons */}
                        <div className="flex justify-end gap-3 mt-6">
                          <button
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                            onClick={handleSaveStudentChanges}
                          >
                            <Save className="h-4 w-4" />
                            <span>Save Changes</span>
                          </button>
                          <button
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 transition-colors"
                            onClick={() => setEditingStudent(false)}
                          >
                            <X className="h-4 w-4" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">Age</p>
                            <p className="text-lg font-medium text-gray-900">{selectedStudent.age}</p>
                          </div>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">Grade</p>
                            <p className="text-lg font-medium text-gray-900">{selectedStudent.grade}</p>
                          </div>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">Screen Time</p>
                            <p className="text-lg font-medium text-gray-900">{selectedStudent.screen_time} mins</p>
                          </div>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">Quiz Time</p>
                            <p className="text-lg font-medium text-gray-900">{selectedStudent.quiz_time} mins</p>
                          </div>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">Game Time</p>
                            <p className="text-lg font-medium text-gray-900">{selectedStudent.game_time} mins</p>
                          </div>
                        </div>

                        {/* Edit Button */}
                        <div className="flex justify-end mt-6">
                          <button
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                            onClick={() => setEditingStudent(true)}
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit Student Details</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Back to Home Button */}
              <div className="flex justify-center md:justify-start">
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 transition-colors"
                  onClick={() => router.push("/parent_home")}
                >
                  <Home className="h-4 w-4" />
                  <span>Back To Home</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-24">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

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

