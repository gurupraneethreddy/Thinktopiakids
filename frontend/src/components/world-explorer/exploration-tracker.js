"use client"

import { motion } from "framer-motion"
import { Award, Globe } from "lucide-react"

export default function ExplorationTracker({ visitedCount, totalCountries }) {
  // Calculate percentage of world explored
  const percentage = Math.round((visitedCount / totalCountries) * 100)

  // Determine explorer rank based on countries visited
  const getExplorerRank = () => {
    if (percentage === 100) return "World Explorer Master! 🏆"
    if (percentage >= 75) return "Senior Explorer 🌟"
    if (percentage >= 50) return "Adventurer 🧭"
    if (percentage >= 25) return "Traveler 🚀"
    return "Explorer in Training 🔍"
  }

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
      <h3 className="text-2xl font-bold mb-4 flex items-center">
        <Globe className="mr-2 h-6 w-6" />
        Your Exploration Journey
      </h3>

      <div className="flex items-center mb-4">
        <div className="flex-1">
          <div className="h-4 bg-indigo-900 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-yellow-400"
            />
          </div>
        </div>
        <div className="ml-4 text-xl font-bold">{percentage}%</div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-indigo-100">
            You've explored <span className="font-bold text-yellow-300">{visitedCount}</span> out of{" "}
            <span className="font-bold">{totalCountries}</span> countries!
          </p>
        </div>

        <div className="flex items-center bg-indigo-800 px-3 py-1 rounded-full">
          <Award className="mr-1 h-5 w-5 text-yellow-400" />
          <span className="font-medium">{getExplorerRank()}</span>
        </div>
      </div>
    </div>
  )
}

