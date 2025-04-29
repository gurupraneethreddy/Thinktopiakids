"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { MapPin, Flag, Building, Camera, Star } from "lucide-react"

export default function CountryInfo({ country }) {
  const [showFunFact, setShowFunFact] = useState(false)

  // If we only have the country name but no data
  if (country.message) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-6"
      >
        <h2 className="text-2xl font-bold text-blue-700 mb-2">{country.name}</h2>
        <p className="text-gray-600">{country.message}</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 mb-6"
    >
      <h2 className="text-3xl font-bold text-blue-700 mb-4 flex items-center">
        <MapPin className="mr-2 h-6 w-6 text-blue-500" />
        {country.name}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {/* Flag */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-blue-600 mb-2 flex items-center">
              <Flag className="mr-2 h-5 w-5 text-blue-500" />
              Flag
            </h3>
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <Image
                src={country.flag || "/placeholder.svg"}
                alt={`Flag of ${country.name}`}
                width={300}
                height={180}
                className="w-full object-cover"
              />
            </div>
          </div>

          {/* Capital */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-blue-600 mb-2 flex items-center">
              <Building className="mr-2 h-5 w-5 text-blue-500" />
              Capital City
            </h3>
            <p className="text-lg text-gray-700">{country.capital}</p>
          </div>

          {/* Fun Fact Button */}
          <button
            onClick={() => setShowFunFact(!showFunFact)}
            className="bg-yellow-400 hover:bg-yellow-500 text-yellow-800 font-bold py-2 px-4 rounded-full flex items-center transition-all"
          >
            <Star className="mr-2 h-5 w-5" />
            {showFunFact ? "Hide Fun Fact" : "Show Fun Fact!"}
          </button>

          {/* Fun Fact */}
          {showFunFact && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4"
            >
              <p className="text-lg text-yellow-800">
                <span className="font-bold">Did you know?</span> {country.funFact}
              </p>
            </motion.div>
          )}
        </div>

        <div>
          {/* Famous Landmark */}
          <h3 className="text-xl font-semibold text-blue-600 mb-2 flex items-center">
            <Camera className="mr-2 h-5 w-5 text-blue-500" />
            Famous Landmark: {country.landmark}
          </h3>
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <Image
              src={country.landmarkImage || "/placeholder.svg"}
              alt={country.landmark}
              width={400}
              height={300}
              className="w-full object-cover"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

