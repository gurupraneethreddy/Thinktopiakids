"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import YouTubeAudio from "../../../components/YoutubeAudio"
import { Music, BookOpen, ArrowLeft, Target, Loader2 } from "lucide-react"

export default function AudiobookLessonPage() {
  const { subject } = useParams()
  const router = useRouter()

  const formattedSubject =
    subject === "gk" ? "General Knowledge" : subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : ""

  const [audiobooks, setAudiobooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentAudioId, setCurrentAudioId] = useState(null)
  const [currentUrl, setCurrentUrl] = useState("")
  const [savedTimeMap, setSavedTimeMap] = useState({})

  const playerRef = useRef(null)

  // Fetch audiobooks from API
  useEffect(() => {
    if (!subject) return

    const token = localStorage.getItem("token")

    fetch(`http://localhost:5000/audiobooks/${formattedSubject}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setAudiobooks(data || [])
        if (data?.length) {
          setCurrentAudioId(data[0].id)
          setCurrentUrl(data[0].link)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching audiobooks:", err)
        setLoading(false)
      })
  }, [subject])

  // Audio switch handler
  const handleAudioChange = (newAudio) => {
    setCurrentAudioId(newAudio.id)
    setCurrentUrl(newAudio.link)
  }

  // Navigation
  const handleNext = () => {
    const idx = audiobooks.findIndex((a) => a.id === currentAudioId)
    const nextIdx = (idx + 1) % audiobooks.length
    handleAudioChange(audiobooks[nextIdx])
  }

  const handlePrev = () => {
    const idx = audiobooks.findIndex((a) => a.id === currentAudioId)
    const prevIdx = (idx - 1 + audiobooks.length) % audiobooks.length
    handleAudioChange(audiobooks[prevIdx])
  }

  const handleSelectAudio = (audio) => handleAudioChange(audio)

  const handleTimeUpdate = (videoUrl, time, audioId) => {
    setSavedTimeMap((prev) => ({ ...prev, [audioId]: time }))
  }

  // Loading state
  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-r from-yellow-100 to-orange-100">
        <div className="animate-bounce mb-4">
          <Loader2 className="h-12 w-12 text-yellow-500 animate-spin" />
        </div>
        <p className="text-2xl font-bold text-yellow-600">Loading your fun audiobooks...</p>
        <div className="mt-4 text-yellow-500 text-lg">Get ready to listen and learn!</div>
      </div>
    )

  if (audiobooks.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-r from-yellow-100 to-orange-100">
        <div className="text-center max-w-md">
          <BookOpen className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-yellow-600 mb-4">Oops! No audiobooks yet!</h2>
          <p className="text-yellow-700 text-lg mb-6">
            We're still adding fun stories for this subject. Check back soon!
          </p>
          <button
            onClick={() => router.back()}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg transform transition hover:scale-105 flex items-center justify-center mx-auto"
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> Go Back
          </button>
        </div>
      </div>
    )

  const currentAudio = audiobooks.find((a) => a.id === currentAudioId) || {}

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return "bg-gray-200 text-gray-700"

    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-200 text-green-700"
      case "medium":
        return "bg-yellow-200 text-yellow-700"
      case "hard":
        return "bg-red-200 text-red-700"
      default:
        return "bg-blue-200 text-blue-700"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-yellow-100 to-orange-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-3xl shadow-xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            {/* Background pattern */}
            <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-white"></div>
            <div className="absolute bottom-8 right-8 w-16 h-16 rounded-full bg-white"></div>
            <div className="absolute top-1/2 left-1/3 w-8 h-8 rounded-full bg-white"></div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-center relative z-10 flex flex-wrap justify-center items-center gap-3">
            <BookOpen className="h-8 w-8 md:h-10 md:w-10" />
            <span>{formattedSubject} Audiobooks</span>
            <Music className="h-8 w-8 md:h-10 md:w-10" />
          </h1>
        </div>

        {/* Now Playing */}
        {currentAudio && (
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-8 border-4 border-yellow-300 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-200 rounded-full opacity-50"></div>
            <div className="absolute -left-6 -bottom-6 w-20 h-20 bg-orange-200 rounded-full opacity-50"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-600 mb-2 relative z-10">
              Now Playing: {currentAudio.name}
            </h2>
            <div className="flex items-center">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentAudio.difficulty)}`}
              >
                {currentAudio.difficulty || "Level: Fun!"}
              </span>
            </div>
          </div>
        )}

        {/* Player */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-full max-w-3xl bg-white p-4 rounded-3xl shadow-lg border-4 border-yellow-300">
            {currentUrl && (
              <YouTubeAudio
                ref={playerRef}
                videoUrl={currentUrl}
                onNext={handleNext}
                onPrev={handlePrev}
                savedTime={savedTimeMap[currentAudio.id] || 0}
                onTimeUpdate={(videoUrl, time) => handleTimeUpdate(videoUrl, time, currentAudio.id)}
                audiobookId={currentAudio.id}
              />
            )}
          </div>
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={handlePrev}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg transform transition hover:scale-105 flex items-center"
            >
              ⏮ Previous
            </button>
            <button
              onClick={handleNext}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg transform transition hover:scale-105 flex items-center"
            >
              Next ⏭
            </button>
          </div>
        </div>

        {/* List */}
        <div className="bg-white shadow-lg rounded-3xl p-6 border-4 border-yellow-300 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-yellow-600 flex items-center">
            <Music className="mr-2 h-6 w-6" />
            Choose Your Audiobook Adventure!
          </h2>
          <ul className="space-y-3">
            {audiobooks.map((audio) => (
              <li
                key={audio.id}
                onClick={() => handleSelectAudio(audio)}
                className={`cursor-pointer p-4 rounded-2xl transition-all transform hover:scale-102 ${
                  currentAudioId === audio.id
                    ? "bg-yellow-100 border-2 border-yellow-400 shadow-md"
                    : "hover:bg-yellow-50 border-2 border-transparent"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        currentAudioId === audio.id ? "bg-yellow-400" : "bg-yellow-200"
                      }`}
                    >
                      <Music className={`h-5 w-5 ${currentAudioId === audio.id ? "text-white" : "text-yellow-600"}`} />
                    </div>
                    <p
                      className={`text-xl font-bold ${
                        currentAudioId === audio.id ? "text-yellow-700" : "text-yellow-600"
                      }`}
                    >
                      {audio.name}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(audio.difficulty)}`}
                  >
                    {audio.difficulty || "Fun!"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-4 rounded-full text-lg font-bold shadow-lg transform transition hover:scale-105 flex items-center justify-center"
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Lessons
          </button>
          <button
            onClick={() => router.push(`/learning_games/${subject}`)}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-full text-lg font-bold shadow-lg transform transition hover:scale-105 flex items-center justify-center"
          >
            <Target className="mr-2 h-5 w-5" /> Go to {formattedSubject} Quiz
          </button>
        </div>
      </div>
    </div>
  )
}

