"use client";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Zap, Sparkles, Trophy, Gamepad2, ArrowLeft } from "lucide-react"; // Added ArrowLeft

export default function GamesPage() {
  const { subject } = useParams();
  const router = useRouter();

  // Sample games for each subject
  const games = {
    math: [
      { name: "Math Quiz", emoji: "➗", link: "/games/puzzle" },
      { name: "Counting Game", emoji: "🔢", link: "/games/counting" },
    ],
    science: [
      { name: "Physics Challenge", emoji: "🔬", link: "/games/solar-game" },
      { name: "Animal Quiz", emoji: "🐾", link: "/games/animal-quiz" },
    ],
    gk: [
      { name: "World Trivia", emoji: "🌍", link: "/games/landmark-adventure" },
      { name: "History Quest", emoji: "📜", link: "/games/map-explorer" },
    ],
    english: [
      { name: "Word Puzzle", emoji: "📝", link: "/games/word-hunt" },
      { name: "Spelling Bee", emoji: "🔤", link: "/games/spellbe" },
    ],
  };

  const subjectGames = games[subject.toLowerCase()] || [];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-yellow-200 to-yellow-400 p-6 relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/30 backdrop-blur-sm"
            style={{
              width: Math.random() * 60 + 20,
              height: Math.random() * 60 + 20,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              scale: [1, Math.random() * 0.5 + 0.8, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Page Title */}
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-white mb-8 flex items-center gap-3"
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            repeatDelay: 5,
          }}
          className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-xl shadow-md"
        >
          <Gamepad2 className="w-8 h-8 text-white" />
        </motion.div>
        <span>🎮 {subject} Games</span>
      </motion.h1>

      {/* Games Grid */}
      <div className="flex flex-col items-center">
        {subjectGames.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <AnimatePresence>
              {subjectGames.map((game, index) => (
                <motion.div
                  key={game.name}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    y: -5,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                  className="cursor-pointer bg-white p-6 rounded-lg shadow-md flex flex-col items-center transition-all duration-300 relative overflow-hidden"
                  onClick={() => router.push(game.link)}
                >
                  {/* Decorative sparkles */}
                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 20,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="absolute -top-10 -right-10 w-20 h-20 bg-yellow-300/20 rounded-full"
                  />
                  <motion.div
                    animate={{
                      rotate: -360,
                    }}
                    transition={{
                      duration: 20,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="absolute -bottom-10 -left-10 w-20 h-20 bg-orange-300/20 rounded-full"
                  />

                  {/* Game Emoji */}
                  <motion.div
                    animate={{
                      y: [0, -5, 0],
                      rotate: [0, 5, 0, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                      delay: index * 0.2,
                    }}
                    className="text-5xl mb-3"
                  >
                    {game.emoji}
                  </motion.div>

                  {/* Game Name */}
                  <h2 className="text-xl font-semibold text-center">{game.name}</h2>

                  {/* Play Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 shadow-lg"
                  >
                    <Zap className="w-5 h-5" />
                    <span>Play Now</span>
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-white mb-8"
          >
            No games available for this subject.
          </motion.p>
        )}

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/learning_games")}
          className="flex items-center gap-2 bg-white text-yellow-600 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-yellow-50 transition-colors duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Learning Games
        </motion.button>
      </div>

      {/* Floating Game Characters */}
      <div className="fixed bottom-10 right-10 z-0">
        {["🚀", "🎯", "🎲", "🧩"].map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl"
            initial={{ opacity: 0.7, x: 0, y: 0 }}
            animate={{
              opacity: [0.7, 1, 0.7],
              x: [0, Math.random() * 40 - 20],
              y: [0, Math.random() * -50],
              rotate: [0, Math.random() * 40 - 20],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              delay: i * 0.5,
            }}
            style={{
              left: `${i * 30}px`,
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
