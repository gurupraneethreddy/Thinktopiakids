"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SolarSystemJourney() {
  const router = useRouter()
  const [selectedPlanet, setSelectedPlanet] = useState(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [authError, setAuthError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const planets = [
    {
      id: "sun",
      name: "Sun",
      color: "#FDB813",
      size: 120,
      facts: [
        "The Sun is a star, not a planet!",
        "It's about 93 million miles from Earth.",
        "The Sun is so big that about 1 million Earths could fit inside it!",
      ],
      position: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
    },
    {
      id: "mercury",
      name: "Mercury",
      color: "#A9A9A9",
      size: 20,
      facts: [
        "Mercury is the smallest planet in our solar system.",
        "It's the closest planet to the Sun.",
        "A day on Mercury is 59 Earth days long!",
      ],
      position: { top: "50%", left: "35%", transform: "translate(-50%, -50%)" },
    },
    {
      id: "venus",
      name: "Venus",
      color: "#E7CDCD",
      size: 30,
      facts: [
        "Venus is the hottest planet in our solar system.",
        "It spins in the opposite direction of most planets.",
        "Venus is sometimes called Earth's twin because they're similar in size.",
      ],
      position: { top: "35%", left: "30%", transform: "translate(-50%, -50%)" },
    },
    {
      id: "earth",
      name: "Earth",
      color: "#6B93D6",
      size: 35,
      facts: [
        "Earth is the only planet known to have life.",
        "71% of Earth is covered in water.",
        "Earth has one moon that helps control our ocean tides.",
      ],
      position: { top: "65%", left: "30%", transform: "translate(-50%, -50%)" },
    },
    {
      id: "mars",
      name: "Mars",
      color: "#E27B58",
      size: 25,
      facts: [
        "Mars is known as the Red Planet because of its reddish color.",
        "Mars has the largest volcano in the solar system called Olympus Mons.",
        "Mars has two small moons named Phobos and Deimos.",
      ],
      position: { top: "30%", left: "20%", transform: "translate(-50%, -50%)" },
    },
    {
      id: "jupiter",
      name: "Jupiter",
      color: "#C88B3A",
      size: 70,
      facts: [
        "Jupiter is the largest planet in our solar system.",
        "It has a Giant Red Spot, which is actually a huge storm.",
        "Jupiter has at least 79 moons!",
      ],
      position: { top: "70%", left: "20%", transform: "translate(-50%, -50%)" },
    },
    {
      id: "saturn",
      name: "Saturn",
      color: "#E4CD9E",
      size: 60,
      facts: [
        "Saturn is famous for its beautiful rings.",
        "It's the second-largest planet in our solar system.",
        "Saturn has at least 82 moons!",
      ],
      position: { top: "25%", left: "10%", transform: "translate(-50%, -50%)" },
    },
    {
      id: "uranus",
      name: "Uranus",
      color: "#D1E7E7",
      size: 45,
      facts: [
        "Uranus rotates on its side like a rolling ball.",
        "It's the coldest planet in our solar system.",
        "Uranus has 27 known moons, named after characters from Shakespeare.",
      ],
      position: { top: "50%", left: "10%", transform: "translate(-50%, -50%)" },
    },
    {
      id: "neptune",
      name: "Neptune",
      color: "#5B5DDF",
      size: 40,
      facts: [
        "Neptune is the windiest planet with speeds reaching 1,200 mph.",
        "It's the farthest planet from the Sun.",
        "Neptune has 14 known moons.",
      ],
      position: { top: "75%", left: "10%", transform: "translate(-50%, -50%)" },
    },
  ]

  const quizQuestions = [
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Earth", "Mars", "Venus", "Jupiter"],
      answer: "Mars",
    },
    {
      question: "Which planet has beautiful rings around it?",
      options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
      answer: "Saturn",
    },
    {
      question: "Which is the largest planet in our solar system?",
      options: ["Earth", "Mars", "Jupiter", "Saturn"],
      answer: "Jupiter",
    },
  ]

  const handlePlanetClick = (planet) => {
    setSelectedPlanet(planet)
  }

  const handleQuizStart = () => {
    setShowQuiz(true)
    setQuizSubmitted(false)
    setQuizAnswers({})
    setScore(0)
    setAuthError(null)
  }

  const handleAnswerSelect = (questionIndex, answer) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionIndex]: answer,
    })
  }

  const submitScore = async (score) => {
    setIsSubmitting(true)
    setAuthError(null)
    
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        throw new Error("Please login to save your scores")
      }

      const response = await fetch("http://localhost:5000/game/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject_id: 2, // Science subject
          game_id: 1,    // Solar System Journey game
          score: score,
        }),
      })

      if (response.status === 401 || response.status === 403) {
        const refreshResponse = await fetch("http://localhost:5000/auth/refresh", {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })
        
        if (refreshResponse.ok) {
          const { accessToken } = await refreshResponse.json()
          localStorage.setItem("token", accessToken)
          
          const retryResponse = await fetch("http://localhost:5000/game/submit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              subject_id: 2,
              game_id: 1,
              score: score,
            }),
          })

          if (!retryResponse.ok) {
            throw new Error(`Server responded with ${retryResponse.status}`)
          }
          return await retryResponse.json()
        } else {
          throw new Error("Session expired - please log in again")
        }
      }

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to save score:", error)
      setAuthError(error.message)
      
      if (error.message.includes("Session expired") || 
          error.message.includes("Please login")) {
        localStorage.removeItem("token")
      }
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuizSubmit = async () => {
    let newScore = 0
    quizQuestions.forEach((question, index) => {
      if (quizAnswers[index] === question.answer) {
        newScore++
      }
    })
    setScore(newScore)
    setQuizSubmitted(true)

    try {
      await submitScore(newScore)
    } catch (error) {
      console.error("Score submission error:", error)
    }
  }

  const stars = []
  for (let i = 0; i < 100; i++) {
    const size = Math.random() * 2 + 1
    stars.push({
      id: i,
      size: size,
      top: Math.random() * 100,
      left: Math.random() * 100,
      opacity: Math.random() * 0.8 + 0.2,
      animationDuration: Math.random() * 5 + 3,
    })
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "600px",
        background: "linear-gradient(to bottom, #000000, #330066)",
        borderRadius: "8px",
        padding: "16px",
        overflow: "hidden",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Stars background */}
      {stars.map((star) => (
        <div
          key={star.id}
          style={{
            position: "absolute",
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: "white",
            borderRadius: "50%",
            top: `${star.top}%`,
            left: `${star.left}%`,
            opacity: star.opacity,
            animation: `twinkle ${star.animationDuration}s infinite`,
          }}
        />
      ))}

      <h1
        style={{
          fontSize: "28px",
          fontWeight: "bold",
          textAlign: "center",
          color: "white",
          marginBottom: "24px",
          position: "relative",
          zIndex: 10,
        }}
      >
        Solar System Journey
      </h1>

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "500px",
        }}
      >
        {planets.map((planet) => (
          <div
            key={planet.id}
            onClick={() => handlePlanetClick(planet)}
            style={{
              position: "absolute",
              top: planet.position.top,
              left: planet.position.left,
              transform: planet.position.transform,
              zIndex: planet.id === "sun" ? 1 : 2,
              cursor: "pointer",
              transition: "transform 0.3s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = `${planet.position.transform} scale(1.1)`)}
            onMouseOut={(e) => (e.currentTarget.style.transform = planet.position.transform)}
          >
            <div
              style={{
                width: `${planet.size}px`,
                height: `${planet.size}px`,
                backgroundColor: planet.color,
                borderRadius: "50%",
                boxShadow: `0 0 ${planet.size / 3}px ${planet.color}`,
              }}
            />
            {planet.id === "saturn" && (
              <div
                style={{
                  position: "absolute",
                  width: `${planet.size * 1.6}px`,
                  height: `${planet.size * 0.2}px`,
                  backgroundColor: "#E4CD9E",
                  borderRadius: "50%",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%) rotate(20deg)",
                  opacity: 0.7,
                  zIndex: -1,
                }}
              />
            )}
            <p
              style={{
                textAlign: "center",
                color: "white",
                marginTop: "8px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {planet.name}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "16px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <button
          onClick={handleQuizStart}
          style={{
            background: "linear-gradient(to right, #9c27b0, #e91e63)",
            color: "white",
            fontWeight: "bold",
            padding: "10px 24px",
            borderRadius: "9999px",
            fontSize: "18px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)"
            e.currentTarget.style.boxShadow = "0 6px 8px rgba(0, 0, 0, 0.4)"
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.3)"
          }}
        >
          Take the Quiz!
        </button>
      </div>

      {/* Back Button */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        marginTop: "20px",
        position: "relative",
        zIndex: 10
      }}>
        <button
          onClick={() => router.push("/learning_games/science")}
          style={{
            background: "linear-gradient(to right, #4b6cb7, #182848)",
            color: "white",
            fontWeight: "bold",
            padding: "10px 24px",
            borderRadius: "9999px",
            fontSize: "16px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
            transition: "transform 0.2s, box-shadow 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)"
            e.currentTarget.style.boxShadow = "0 6px 8px rgba(0, 0, 0, 0.4)"
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.3)"
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back 
        </button>
      </div>

      {/* Authentication Error */}
      {authError && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(255, 0, 0, 0.8)",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <span>{authError}</span>
          <button 
            onClick={() => router.push("/login")}
            style={{
              background: "white",
              color: "red",
              border: "none",
              padding: "4px 8px",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Login
          </button>
        </div>
      )}

      {/* Submitting Indicator */}
      {isSubmitting && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(0, 0, 255, 0.8)",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          zIndex: 100
        }}>
          Saving your score...
        </div>
      )}

      {/* Planet Facts Modal */}
      {selectedPlanet && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: "linear-gradient(to bottom, #1a237e, #4a148c)",
              color: "white",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: "16px",
              }}
            >
              {selectedPlanet.name}
            </h2>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "16px 0",
              }}
            >
              <div
                style={{
                  width: `${Math.min(selectedPlanet.size * 2, 150)}px`,
                  height: `${Math.min(selectedPlanet.size * 2, 150)}px`,
                  backgroundColor: selectedPlanet.color,
                  borderRadius: "50%",
                  boxShadow: `0 0 ${selectedPlanet.size / 2}px ${selectedPlanet.color}`,
                }}
              >
                {selectedPlanet.id === "saturn" && (
                  <div
                    style={{
                      position: "absolute",
                      width: `${Math.min(selectedPlanet.size * 3, 240)}px`,
                      height: `${Math.min(selectedPlanet.size * 0.4, 30)}px`,
                      backgroundColor: "#E4CD9E",
                      borderRadius: "50%",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%) rotate(20deg)",
                      opacity: 0.7,
                      zIndex: -1,
                    }}
                  />
                )}
              </div>
            </div>

            <div style={{ color: "white", marginBottom: "16px" }}>
              <ul
                style={{
                  listStyleType: "disc",
                  paddingLeft: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {selectedPlanet.facts.map((fact, index) => (
                  <li key={index} style={{ fontSize: "18px" }}>
                    {fact}
                  </li>
                ))}
              </ul>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "16px",
              }}
            >
              <button
                onClick={() => setSelectedPlanet(null)}
                style={{
                  background: "linear-gradient(to right, #2196f3, #673ab7)",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Cool! 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuiz && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(to bottom, #1a237e, #4a148c)",
              color: "white",
              borderRadius: "12px",
              padding: "32px",
              width: "90vw",
              height: "90vh",
              maxWidth: "1000px",
              maxHeight: "800px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h2
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: "24px",
              }}
            >
              Space Quiz!
            </h2>

            {!quizSubmitted ? (
              <>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "32px",
                    margin: "16px 0",
                  }}
                >
                  {quizQuestions.map((question, qIndex) => (
                    <div key={qIndex} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <h3 style={{ fontSize: "20px", fontWeight: "500" }}>{question.question}</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {question.options.map((option) => (
                          <div
                            key={option}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              padding: "12px",
                              borderRadius: "6px",
                              backgroundColor:
                                quizAnswers[qIndex] === option ? "rgba(138, 43, 226, 0.3)" : "transparent",
                              cursor: "pointer",
                              transition: "background-color 0.2s",
                            }}
                            onClick={() => handleAnswerSelect(qIndex, option)}
                            onMouseOver={(e) => {
                              if (quizAnswers[qIndex] !== option) {
                                e.currentTarget.style.backgroundColor = "rgba(138, 43, 226, 0.1)"
                              }
                            }}
                            onMouseOut={(e) => {
                              if (quizAnswers[qIndex] !== option) {
                                e.currentTarget.style.backgroundColor = "transparent"
                              }
                            }}
                          >
                            <div
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                border: "2px solid white",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              {quizAnswers[qIndex] === option && (
                                <div
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    borderRadius: "50%",
                                    backgroundColor: "white",
                                  }}
                                />
                              )}
                            </div>
                            <label
                              style={{
                                color: "white",
                                cursor: "pointer",
                                fontSize: "18px",
                              }}
                            >
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "24px",
                  }}
                >
                  <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                    style={{
                      background:
                        Object.keys(quizAnswers).length < quizQuestions.length
                          ? "gray"
                          : "linear-gradient(to right, #4caf50, #2196f3)",
                      color: "white",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: "8px",
                      fontSize: "18px",
                      fontWeight: "bold",
                      cursor: Object.keys(quizAnswers).length < quizQuestions.length ? "not-allowed" : "pointer",
                      opacity: Object.keys(quizAnswers).length < quizQuestions.length ? 0.7 : 1,
                    }}
                  >
                    Submit Answers
                  </button>
                </div>
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "32px",
                  margin: "16px 0",
                  textAlign: "center",
                  justifyContent: "center",
                }}
              >
                <h3
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginBottom: "12px",
                  }}
                >
                  You got {score} out of {quizQuestions.length} correct!
                </h3>
                <div
                  style={{
                    fontSize: "56px",
                    margin: "16px 0",
                  }}
                >
                  {score === quizQuestions.length
                    ? "🎉 Amazing! 🚀"
                    : score >= quizQuestions.length / 2
                      ? "🌟 Good job! 🌟"
                      : "Keep exploring! 🔭"}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "20px",
                    marginTop: "24px",
                  }}
                >
                  <button
                    onClick={() => {
                      setShowQuiz(false)
                      setQuizSubmitted(false)
                    }}
                    style={{
                      background: "linear-gradient(to right, #9c27b0, #e91e63)",
                      color: "white",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: "8px",
                      fontSize: "18px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    Back to Space
                  </button>
                  <button
                    onClick={() => {
                      setQuizAnswers({})
                      setQuizSubmitted(false)
                    }}
                    style={{
                      background: "linear-gradient(to right, #2196f3, #4caf50)",
                      color: "white",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: "8px",
                      fontSize: "18px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes twinkle {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  )
}
