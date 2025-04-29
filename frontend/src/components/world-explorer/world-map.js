"use client";

import { useState, useEffect } from "react"
import Image from "next/image"
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"
import { Sparkles, MapPin, Flag, Building, Camera, Star, Globe, Award } from "lucide-react"

// World map topojson data
const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json"

// Country data with educational information
const countryData = {
  "United States": {
    flag: "/images/flags/usa.png",
    capital: "Washington, D.C.",
    landmark: "Statue of Liberty",
    landmarkImage: "/images/landmarks/statue-of-liberty.png",
    funFact: "The United States has 50 states and is home to the Grand Canyon!",
  },
  India: {
    flag: "/images/flags/india.png",
    capital: "New Delhi",
    landmark: "Taj Mahal",
    landmarkImage: "/images/landmarks/taj-mahal.png",
    funFact: "India is home to over 1.3 billion people and has the Bengal tiger as its national animal!",
  },
  France: {
    flag: "/images/flags/france.png",
    capital: "Paris",
    landmark: "Eiffel Tower",
    landmarkImage: "/images/landmarks/eiffel-tower.jpg",
    funFact: "The Eiffel Tower can grow taller in summer because metal expands in heat!",
  },
  Brazil: {
    flag: "/images/flags/brazil.png",
    capital: "Brasília",
    landmark: "Christ the Redeemer",
    landmarkImage: "/images/landmarks/christ-the-redeemer.jpg",
    funFact: "Brazil has the largest rainforest in the world - the Amazon!",
  },
  Japan: {
    flag: "/images/flags/japan.png",
    capital: "Tokyo",
    landmark: "Mount Fuji",
    landmarkImage: "/images/landmarks/mount-fuji.jpg",
    funFact: "Japan has an island called Aoshima where cats outnumber people!",
  },
  Australia: {
    flag: "/images/flags/australia.png",
    capital: "Canberra",
    landmark: "Sydney Opera House",
    landmarkImage: "/images/landmarks/sydney-opera-house.jpg",
    funFact: "Australia is home to kangaroos and koalas, which are marsupials!",
  },
  Egypt: {
    flag: "/images/flags/egypt.png",
    capital: "Cairo",
    landmark: "Pyramids of Giza",
    landmarkImage: "/images/landmarks/pyramids.jpg",
    funFact: "The Great Pyramid of Giza is one of the Seven Wonders of the Ancient World!",
  },
  China: {
    flag: "/images/flags/china.png",
    capital: "Beijing",
    landmark: "Great Wall of China",
    landmarkImage: "/images/landmarks/great-wall.jpg",
    funFact: "The Great Wall of China is over 13,000 miles long - that's half way around the Earth!",
  },
  "United Kingdom": {
    flag: "/images/flags/uk.png",
    capital: "London",
    landmark: "Big Ben",
    landmarkImage: "/images/landmarks/big-ben.jpg",
    funFact: "The real name of Big Ben is actually the Elizabeth Tower - Big Ben is the bell inside!",
  },
  Italy: {
    flag: "/images/flags/italy.png",
    capital: "Rome",
    landmark: "Colosseum",
    landmarkImage: "/images/landmarks/colosseum.jpg",
    funFact: "Italy is shaped like a boot and is famous for pizza and pasta!",
  },
}

export default function WorldMap() {
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [visitedCountries, setVisitedCountries] = useState([])
  const [showCelebration, setShowCelebration] = useState(false)
  const [showFunFact, setShowFunFact] = useState(false)

  // Play a fun sound when a country is selected
  const playSelectSound = () => {
    if (typeof window !== "undefined") {
      const audio = new Audio("/sounds/select.mp3")
      audio.volume = 0.3
      audio.play().catch((e) => console.log("Audio play failed:", e))
    }
  }

  // Handle country click
  const handleCountryClick = (geo) => {
    const countryName = geo.properties.name

    // Check if we have data for this country
    if (countryData[countryName]) {
      playSelectSound()
      setSelectedCountry({
        name: countryName,
        ...countryData[countryName],
      })
      setShowFunFact(false)

      // Add to visited countries if not already visited
      if (!visitedCountries.includes(countryName)) {
        const newVisited = [...visitedCountries, countryName]
        setVisitedCountries(newVisited)

        // Show celebration animation for new discoveries
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 2000)

        // Save to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("visitedCountries", JSON.stringify(newVisited))
        }
      }
    } else {
      // If we don't have data for this country, just show the name
      setSelectedCountry({
        name: countryName,
        message: "We're still adding information about this country. Check back soon!",
      })
    }
  }

  // Handle clicking on oceans or non-country areas
  const handleMapClick = () => {
    setSelectedCountry(null)
  }

  // Load visited countries from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("visitedCountries")
      if (saved) {
        try {
          setVisitedCountries(JSON.parse(saved))
        } catch (e) {
          console.error("Failed to parse saved countries", e)
        }
      }
    }
  }, [])

  // Calculate percentage of world explored
  const totalCountries = Object.keys(countryData).length
  const visitedCount = visitedCountries.length
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
    <div className="relative">
      {/* Celebration animation */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div className="text-6xl animate-bounce">
            <Sparkles className="h-24 w-24 text-yellow-400" />
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-6">
        {/* The map component */}
        <div onClick={handleMapClick} className="cursor-pointer">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 150,
            }}
          >
            <ZoomableGroup center={[0, 30]} zoom={1}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const isVisited = visitedCountries.includes(geo.properties.name)

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => handleCountryClick(geo)}
                        style={{
                          default: {
                            fill: isVisited ? "#34d399" : "#D6D6DA",
                            outline: "none",
                            stroke: "#FFFFFF",
                            strokeWidth: 0.5,
                          },
                          hover: {
                            fill: "#F9A826",
                            outline: "none",
                            stroke: "#FFFFFF",
                            strokeWidth: 0.5,
                            cursor: "pointer",
                          },
                          pressed: {
                            fill: "#3182CE",
                            outline: "none",
                          },
                        }}
                      />
                    )
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>
      </div>

      {/* Country information display */}
      {selectedCountry && (
        <div
          className="bg-white rounded-xl shadow-lg p-6 mb-6 animate-[fadeIn_0.5s]"
          style={{ animation: "fadeIn 0.5s" }}
        >
          {/* If we only have the country name but no data */}
          {selectedCountry.message ? (
            <>
              <h2 className="text-2xl font-bold text-blue-700 mb-2">{selectedCountry.name}</h2>
              <p className="text-gray-600">{selectedCountry.message}</p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-blue-700 mb-4 flex items-center">
                <MapPin className="mr-2 h-6 w-6 text-blue-500" />
                {selectedCountry.name}
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
                        src={selectedCountry.flag || "/placeholder.svg?height=180&width=300"}
                        alt={`Flag of ${selectedCountry.name}`}
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
                    <p className="text-lg text-gray-700">{selectedCountry.capital}</p>
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
                    <div
                      className="mt-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4"
                      style={{ animation: "fadeIn 0.5s" }}
                    >
                      <p className="text-lg text-yellow-800">
                        <span className="font-bold">Did you know?</span> {selectedCountry.funFact}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  {/* Famous Landmark */}
                  <h3 className="text-xl font-semibold text-blue-600 mb-2 flex items-center">
                    <Camera className="mr-2 h-5 w-5 text-blue-500" />
                    Famous Landmark: {selectedCountry.landmark}
                  </h3>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src={selectedCountry.landmarkImage || "/placeholder.svg?height=300&width=400"}
                      alt={selectedCountry.landmark}
                      width={400}
                      height={300}
                      className="w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Exploration tracker */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <h3 className="text-2xl font-bold mb-4 flex items-center">
          <Globe className="mr-2 h-6 w-6" />
          Your Exploration Journey
        </h3>

        <div className="flex items-center mb-4">
          <div className="flex-1">
            <div className="h-4 bg-indigo-900 rounded-full overflow-hidden">
              <div style={{ width: `${percentage}%`, transition: "width 1s" }} className="h-full bg-yellow-400" />
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

      {/* Instructions for kids */}
      {!selectedCountry && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center mt-6 animate-pulse">
          <p className="text-xl text-blue-700 font-medium">Click on any country to learn about it! 👆</p>
        </div>
      )}
    </div>
  )
}

