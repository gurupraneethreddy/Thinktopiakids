"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Clock,
  BookOpen,
  Home,
  Star,
  Sparkles,
  LibraryIcon as Museum,
  ArrowLeft,
  Globe,
  Calendar,
  Info,
  Zap,
  Award,
  Gift,
  Gamepad2,
} from "lucide-react"
import confetti from "canvas-confetti"

export default function TimeMachineExplorer() {
  // Game state
  const [currentPeriod, setCurrentPeriod] = useState(null)
  const [collectedArtifacts, setCollectedArtifacts] = useState({})
  const [showArtifactInfo, setShowArtifactInfo] = useState(null)
  const [showIntro, setShowIntro] = useState(true)
  const [showFact, setShowFact] = useState(false)
  const [currentFact, setCurrentFact] = useState({ text: "", image: "" })
  const [artifactCollected, setArtifactCollected] = useState(false)
  const [totalCollected, setTotalCollected] = useState(0)
  const [showMuseum, setShowMuseum] = useState(false)
  const [selectedMuseumPeriod, setSelectedMuseumPeriod] = useState(null)
  const [showTimeline, setShowTimeline] = useState(false)
  const [timelineView, setTimelineView] = useState("all")
  const [timeEnergy, setTimeEnergy] = useState(5)
  const [showMiniGame, setShowMiniGame] = useState(false)
  const [currentMiniGame, setCurrentMiniGame] = useState(null)
  const [coins, setCoins] = useState(0)
  const [showReward, setShowReward] = useState(false)
  const [currentReward, setCurrentReward] = useState("")
  const [showProfessor, setShowProfessor] = useState(false)
  const [professorMessage, setProfessorMessage] = useState("")
  const [showTimeCapsule, setShowTimeCapsule] = useState(false)
  const [badges, setBadges] = useState([])

  // Initialize collected artifacts from localStorage if available
  useEffect(() => {
    const savedArtifacts = localStorage.getItem("collectedArtifacts")
    if (savedArtifacts) {
      setCollectedArtifacts(JSON.parse(savedArtifacts))
    } else {
      const initialCollected = {}
      historicalPeriods.forEach((period) => {
        initialCollected[period.id] = []
      })
      setCollectedArtifacts(initialCollected)
    }

    // Load other saved data
    const savedCoins = localStorage.getItem("timeCoins")
    if (savedCoins) setCoins(Number.parseInt(savedCoins))

    const savedBadges = localStorage.getItem("timeBadges")
    if (savedBadges) setBadges(JSON.parse(savedBadges))

    const savedEnergy = localStorage.getItem("timeEnergy")
    if (savedEnergy) setTimeEnergy(Number.parseInt(savedEnergy))
    else setTimeEnergy(5)

    // Show Professor Timely's welcome message
    setTimeout(() => {
      setProfessorMessage("Welcome back, Time Explorer! Ready for a new adventure?")
      setShowProfessor(true)
    }, 1000)
  }, [])

  // Save collected artifacts to localStorage when updated
  useEffect(() => {
    if (Object.keys(collectedArtifacts).length > 0) {
      localStorage.setItem("collectedArtifacts", JSON.stringify(collectedArtifacts))
    }
  }, [collectedArtifacts])

  // Save other game data
  useEffect(() => {
    localStorage.setItem("timeCoins", coins.toString())
  }, [coins])

  useEffect(() => {
    localStorage.setItem("timeBadges", JSON.stringify(badges))
  }, [badges])

  useEffect(() => {
    localStorage.setItem("timeEnergy", timeEnergy.toString())
  }, [timeEnergy])

  // Update total collected count
  useEffect(() => {
    let count = 0
    Object.values(collectedArtifacts).forEach((periodArtifacts) => {
      count += periodArtifacts.length
    })
    setTotalCollected(count)

    // Award badges based on collection
    if (count >= 5 && !badges.includes("novice")) {
      awardBadge("novice", "Novice Collector")
    }
    if (count >= 15 && !badges.includes("explorer")) {
      awardBadge("explorer", "Master Explorer")
    }
    if (count >= 30 && !badges.includes("historian")) {
      awardBadge("History Expert")
    }

    // Check for period-specific badges
    historicalPeriods.forEach((period) => {
      if (collectedArtifacts[period.id]?.length === period.artifacts.length && !badges.includes(period.id)) {
        awardBadge(period.id, `${period.name} Expert`)
      }
    })
  }, [collectedArtifacts])

  const awardBadge = (id, name) => {
    setBadges([...badges, id])
    setCurrentReward(name)
    setShowReward(true)

    // Trigger confetti
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
    })

    // Add coins for badge
    setCoins((prev) => prev + 50)
  }

  const historicalPeriods = [
    {
      id: "egypt",
      name: "Ancient Egypt",
      years: "3100 BCE - 30 BCE",
      description:
        "The civilization of Ancient Egypt was one of the longest in history! They built huge pyramids and wrote using special pictures called hieroglyphics.",
      color: "from-yellow-400 to-amber-600",
      bgColor: "bg-amber-100",
      region: "world",
      image: "/game/egypt.jpeg?height=300&width=400&text=Ancient+Egypt",
      ruler: "Pharaoh Tutankhamun",
      rulerFact: "King Tut became pharaoh when he was only 9 years old!",
      rulerImage: "/game/egypt.jpeg?height=350&width=150&text=King+Tut",
      invention: "Papyrus Paper",
      inventionFact: "Egyptians made paper from a plant called papyrus that grew along the Nile River.",
      inventionImage: "/game/egypt.jpeg?height=150&width=150&text=Papyrus",
      lifestyle: "Egyptians loved cats and kept them as pets to protect their homes from mice and snakes.",
      lifestyleImage: "/game/egypt.jpeg?height=150&width=150&text=Egyptian+Cats",
      miniGame: {
        type: "memory",
        title: "Hieroglyph Memory Match",
        description: "Match the hieroglyph pairs to collect the artifact!",
      },
      artifacts: [
        {
          id: "pyramid",
          name: "Mini Pyramid",
          description: "A small model of the Great Pyramid of Giza.",
          historicalInfo:
            "The Great Pyramid was built for Pharaoh Khufu around 2560 BCE. It's the oldest of the Seven Wonders of the Ancient World and the only one still standing today!",
          image: "/game/pyramid.jpeg?height=300&width=300&text=Pyramid",
        },
        {
          id: "mummy",
          name: "Toy Mummy Case",
          description: "A colorful case that protected mummies.",
          historicalInfo:
            "Egyptians preserved bodies as mummies because they believed you needed your body in the afterlife. The process took 70 days and involved special oils and wrappings.",
          image: "/game/mummy.jpeg?height=1000&width=1000&text=Mummy+Case",
        },
        {
          id: "scarab",
          name: "Scarab Beetle",
          description: "A lucky charm shaped like a beetle.",
          historicalInfo:
            "Scarab beetles were sacred in ancient Egypt. They represented the sun god Ra and symbolized rebirth and protection.",
          image: "/game/bettle.jpeg?height=100&width=100&text=Scarab",
        },
      ],
    },
    {
      id: "rome",
      name: "Roman Empire",
      years: "27 BCE - 476 CE",
      description:
        "The Roman Empire was huge and powerful! They built roads, aqueducts (water bridges), and had big armies with cool shields and helmets.",
      color: "from-red-500 to-red-700",
      bgColor: "bg-red-100",
      region: "world",
      image: "/game/rome.jpg?height=300&width=400&text=Roman+Empire",
      ruler: "Emperor Augustus",
      rulerFact: "Augustus was the first Roman Emperor and ruled for 41 years!",
      rulerImage: "/game/rome.jpg?height=150&width=150&text=Augustus",
      invention: "Concrete",
      inventionFact: "Romans invented a special type of concrete that could even harden underwater!",
      inventionImage: "/game/rome.jpg?height=150&width=150&text=Roman+Concrete",
      lifestyle: "Roman children played with toys like dolls, hoops, and toy soldiers.",
      lifestyleImage: "/game/rome.jpg?height=150&width=150&text=Roman+Toys",
      miniGame: {
        type: "puzzle",
        title: "Fix the Roman Pottery",
        description: "Drag the broken pieces to fix the ancient Roman pot!",
      },
      artifacts: [
        {
          id: "helmet",
          name: "Roman Helmet",
          description: "A helmet worn by Roman soldiers.",
          historicalInfo:
            "Roman soldiers wore helmets called 'galea' to protect their heads in battle. These helmets were often decorated with colorful plumes to show rank.",
          image: "/game/helmet.jpg?height=100&width=100&text=Helmet",
        },
        {
          id: "coin",
          name: "Roman Coin",
          description: "A coin with the face of an emperor.",
          historicalInfo:
            "Roman coins were made of gold, silver, and bronze. They had the emperor's face on one side and often showed Roman gods or important buildings on the other.",
          image: "/game/romecoin.jpeg?height=100&width=100&text=Roman+Coin",
        },
        {
          id: "mosaic",
          name: "Colorful Mosaic",
          description: "A picture made from tiny colored tiles.",
          historicalInfo:
            "Romans decorated their homes with beautiful mosaics made from small colored stones. These pictures often showed scenes from mythology, daily life, or nature.",
          image: "/game/mosasi.jpeg?height=100&width=100&text=Mosaic",
        },
      ],
    },
    {
      id: "dinosaurs",
      name: "Dinosaur Age",
      years: "245 - 66 Million Years Ago",
      description:
        "Dinosaurs ruled the Earth for millions of years! Some were as big as buildings, while others were as small as chickens.",
      color: "from-green-500 to-green-700",
      bgColor: "bg-green-100",
      region: "world",
      image: "/game/dinosaur.jpeg?height=300&width=400&text=Dinosaurs",
      ruler: "T-Rex",
      rulerFact: "The T-Rex had the strongest bite of any land animal ever! It could crush a car with its jaws.",
      rulerImage: "/game/dinosaur.jpeg?height=150&width=150&text=T-Rex",
      invention: "Feathers",
      inventionFact: "Many dinosaurs had feathers! Scientists think birds evolved from small feathered dinosaurs.",
      inventionImage: "/game/dinosaur.jpeg?height=150&width=150&text=Feathers",
      lifestyle: "Baby dinosaurs hatched from eggs, just like birds and reptiles today.",
      lifestyleImage: "/game/dinosaur.jpeg?height=150&width=150&text=Dino+Eggs",
      miniGame: {
        type: "build",
        title: "Build-a-Dino",
        description: "Put the dinosaur bones in the right spots to build a complete skeleton!",
      },
      artifacts: [
        {
          id: "trexskull",
          name: "T-Rex Skull",
          description: "A model of a Tyrannosaurus Rex skull.",
          historicalInfo:
            "The T-Rex had a massive skull with 60 teeth, each as big as a banana! It could see, smell, and hear very well to hunt its prey.",
          image: "/placeholder.svg?height=100&width=100&text=T-Rex+Skull",
        },
        {
          id: "amber",
          name: "Insect in Amber",
          description: "A prehistoric insect trapped in golden amber.",
          historicalInfo:
            "Amber is fossilized tree sap that sometimes trapped insects and small animals millions of years ago. Scientists can study these perfectly preserved specimens to learn about ancient life.",
          image: "/placeholder.svg?height=100&width=100&text=Amber",
        },
        {
          id: "footprint",
          name: "Dinosaur Footprint",
          description: "A cast of a real dinosaur footprint.",
          historicalInfo:
            "Dinosaur footprints can tell scientists how fast dinosaurs moved, how big they were, and even if they traveled in groups. Some footprints are as big as a kiddie pool!",
          image: "/placeholder.svg?height=100&width=100&text=Footprint",
        },
      ],
    },
    {
      id: "medieval",
      name: "Medieval Europe",
      years: "500 CE - 1500 CE",
      description:
        "Medieval Europe was the time of knights, castles, and kings! People lived in villages and towns with tall castle walls to protect them.",
      color: "from-purple-500 to-purple-800",
      bgColor: "bg-purple-100",
      region: "world",
      image: "/game/meurope.jpeg?height=300&width=400&text=Medieval+Europe",
      ruler: "King Arthur",
      rulerFact: "King Arthur and his Knights of the Round Table went on many adventures!",
      rulerImage: "/game/meurope.jpeg?height=150&width=150&text=King+Arthur",
      invention: "Mechanical Clock",
      inventionFact: "The first mechanical clocks were invented in medieval Europe to help monks know when to pray.",
      inventionImage: "/game/meurope.jpeg?height=150&width=150&text=Clock",
      lifestyle: "Medieval children played games like hide-and-seek, tag, and hopscotch.",
      lifestyleImage: "/game/meurope.jpeg?height=150&width=150&text=Medieval+Games",
      miniGame: {
        type: "dress",
        title: "Dress the Knight",
        description: "Help the knight get ready for battle by putting on the correct armor pieces!",
      },
      artifacts: [
        {
          id: "sword",
          name: "Knight's Sword",
          description: "A sword used by brave knights.",
          historicalInfo:
            "Knights' swords were very special and often had names! It took a blacksmith many days to make a good sword, and knights were trained from childhood to use them properly.",
          image: "/placeholder.svg?height=100&width=100&text=Sword",
        },
        {
          id: "shield",
          name: "Coat of Arms",
          description: "A shield with special symbols for a family.",
          historicalInfo:
            "Each noble family had their own coat of arms - special symbols and colors that represented their family. Knights displayed these on their shields and banners so people could recognize them in battle.",
          image: "/placeholder.svg?height=100&width=100&text=Shield",
        },
        {
          id: "crown",
          name: "Royal Crown",
          description: "A golden crown worn by kings and queens.",
          historicalInfo:
            "Medieval crowns were made of gold and decorated with precious gems. Different crowns were used for different ceremonies, and they symbolized the king or queen's power from God.",
          image: "/placeholder.svg?height=100&width=100&text=Crown",
        },
      ],
    },
    {
      id: "maya",
      name: "Maya Civilization",
      years: "2000 BCE - 1500 CE",
      description:
        "The Maya built amazing pyramid temples in Central America! They were excellent mathematicians and astronomers who created accurate calendars.",
      color: "from-green-500 to-green-800",
      bgColor: "bg-green-100",
      region: "world",
      image: "/game/maya.jpeg?height=300&width=400&text=Maya+Civilization",
      ruler: "King Pakal",
      rulerFact: "King Pakal ruled the city of Palenque for 68 years and was buried in a beautiful pyramid temple!",
      rulerImage: "/game/maya.jpeg?height=150&width=150&text=King+Pakal",
      invention: "Maya Calendar",
      inventionFact:
        "The Maya created a calendar so accurate that it could predict solar eclipses thousands of years in the future!",
      inventionImage: "/game/maya.jpeg?height=150&width=150&text=Maya+Calendar",
      lifestyle:
        "Maya children helped their parents farm corn, beans, and squash. They also played a ball game called 'Pok-a-Tok' using a rubber ball.",
      lifestyleImage: "/game/maya.jpeg?height=150&width=150&text=Maya+Life",
      miniGame: {
        type: "catch",
        title: "Catch the Flying Scrolls",
        description: "Quick! Tap the flying scrolls before they blow away!",
      },
      artifacts: [
        {
          id: "mayacalendar",
          name: "Maya Calendar Stone",
          description: "A stone disk showing the Maya calendar.",
          historicalInfo:
            "The Maya had several calendars! Their 'Long Count' calendar tracked very long periods of time, while their 260-day sacred calendar was used for religious ceremonies.",
          image: "/placeholder.svg?height=100&width=100&text=Calendar",
        },
        {
          id: "mayamask",
          name: "Jade Death Mask",
          description: "A mask made of green jade stones.",
          historicalInfo:
            "Maya kings were buried wearing beautiful masks made of jade. Jade was more valuable than gold to the Maya because its green color represented life and growth.",
          image: "/placeholder.svg?height=100&width=100&text=Jade+Mask",
        },
        {
          id: "mayacodex",
          name: "Maya Codex",
          description: "A book with Maya hieroglyphic writing.",
          historicalInfo:
            "The Maya wrote using hieroglyphs - picture symbols that represented sounds or ideas. They wrote on long strips of paper made from tree bark and folded them like an accordion.",
          image: "/placeholder.svg?height=100&width=100&text=Codex",
        },
      ],
    },
    {
      id: "china",
      name: "Ancient China",
      years: "1600 BCE - 220 CE",
      description:
        "Ancient China gave us many inventions like paper, printing, and fireworks! They also built the Great Wall of China.",
      color: "from-blue-500 to-indigo-700",
      bgColor: "bg-blue-100",
      region: "world",
      image: "/game/china.jpg?height=300&width=400&text=Ancient+China",
      ruler: "Emperor Qin Shi Huang",
      rulerFact: "Emperor Qin united China and built the first version of the Great Wall!",
      rulerImage: "/game/china.jpg?height=150&width=150&text=Emperor+Qin",
      invention: "Compass",
      inventionFact: "The Chinese invented the compass to help ships find their way at sea.",
      inventionImage: "/game/china.jpg?height=150&width=150&text=Compass",
      lifestyle: "Chinese children flew kites for fun, which were first invented in China over 2,000 years ago!",
      lifestyleImage: "/game/china.jpg?height=150&width=150&text=Chinese+Kites",
      miniGame: {
        type: "quiz",
        title: "Chinese Invention Quiz",
        description: "Answer questions about amazing Chinese inventions to win the artifact!",
      },
      artifacts: [
        {
          id: "dragon",
          name: "Dragon Statue",
          description: "A colorful dragon that brings good luck.",
          historicalInfo:
            "Dragons are very important in Chinese culture. Unlike Western dragons, Chinese dragons are friendly and bring good fortune, rain, and success.",
          image: "/game/dragon.jpeg?height=100&width=100&text=Dragon",
        },
        {
          id: "terracotta",
          name: "Terracotta Warrior",
          description: "A small clay soldier from Emperor Qin's army.",
          historicalInfo:
            "Emperor Qin was buried with over 8,000 life-sized clay soldiers to protect him in the afterlife! Each soldier has a different face, and they were all painted in bright colors.",
          image: "/game/terra.jpeg?height=100&width=100&text=Terracotta",
        },
        {
          id: "silk",
          name: "Silk Cloth",
          description: "Soft, shiny fabric made from silkworm cocoons.",
          historicalInfo:
            "The Chinese kept silk-making a secret for thousands of years! They unraveled the cocoons of silkworms and wove the threads into beautiful fabric that was traded along the famous Silk Road.",
          image: "/game/silk.jpeg?height=100&width=100&text=Silk",
        },
      ],
    },
    // Add Indian history periods
    {
      id: "indus",
      name: "Indus Valley",
      years: "3300 BCE - 1300 BCE",
      description:
        "The Indus Valley Civilization was one of the world's oldest urban civilizations! They built amazing cities with advanced drainage systems and bathrooms.",
      color: "from-orange-400 to-orange-600",
      bgColor: "bg-orange-100",
      region: "indian",
      image: "/game/indus.jpeg?height=300&width=400&text=Indus+Valley",
      ruler: "Unknown Rulers",
      rulerFact:
        "The rulers of the Indus Valley are still a mystery! Archaeologists haven't found any palaces or royal tombs.",
      rulerImage: "/game/indus.jpeg?height=150&width=150&text=Indus+Ruler",
      invention: "Standardized Weights and Measures",
      inventionFact:
        "The Indus people used very accurate weights and measuring tools for trading goods, showing they were excellent at math!",
      inventionImage: "/game/indus.jpeg?height=150&width=150&text=Indus+Weights",
      lifestyle:
        "Children in the Indus Valley played with toys made of clay, including tiny carts, whistles, and animal figures.",
      lifestyleImage: "/game/indus.jpeg?height=150&width=150&text=Indus+Toys",
      miniGame: {
        type: "puzzle",
        title: "Rebuild Indus Valley City",
        description: "Place the buildings in the right spots to rebuild an ancient Indus city!",
      },
      artifacts: [
        {
          id: "seal",
          name: "Indus Seal",
          description: "A small stone seal with animals and mysterious writing.",
          historicalInfo:
            "The Indus people made thousands of small square seals with animals and symbols. Scientists still can't read their writing - it's one of history's biggest mysteries!",
          image: "/placeholder.svg?height=100&width=100&text=Indus+Seal",
        },
        {
          id: "bangles",
          name: "Colorful Bangles",
          description: "Beautiful bracelets worn by Indus Valley people.",
          historicalInfo:
            "The Indus people loved jewelry! They made colorful bangles from shell, copper, and even fired clay. Both men and women wore these beautiful bracelets.",
          image: "/placeholder.svg?height=100&width=100&text=Bangles",
        },
        {
          id: "unicorn",
          name: "Unicorn Figurine",
          description: "A small statue of a one-horned animal.",
          historicalInfo:
            "Many Indus seals show a mysterious one-horned animal that some people call a 'unicorn.' It might have been an important symbol in their religion.",
          image: "/placeholder.svg?height=100&width=100&text=Unicorn",
        },
      ],
    },
    {
      id: "maurya",
      name: "Maurya Empire",
      years: "322 BCE - 185 BCE",
      description:
        "The Maurya Empire was one of India's largest and most powerful ancient kingdoms! Emperor Ashoka spread Buddhism and built stone pillars with important messages.",
      color: "from-yellow-500 to-yellow-700",
      bgColor: "bg-yellow-100",
      region: "indian",
      image: "/game/maurya.jpg?height=300&width=400&text=Maurya+Empire",
      ruler: "Emperor Ashoka",
      rulerFact:
        "After a terrible war, Emperor Ashoka felt so sad about the violence that he became a Buddhist and started spreading peace!",
      rulerImage: "/game/maurya.jpg?height=150&width=150&text=Ashoka",
      invention: "Ashoka Pillars",
      inventionFact: "Ashoka built huge stone pillars with special rules for being kind to people and animals.",
      inventionImage: "/game/maurya.jpg?height=150&width=150&text=Ashoka+Pillar",
      lifestyle:
        "People in the Maurya Empire enjoyed music, dance, and art. They also had universities where students studied math and science.",
      lifestyleImage: "/game/maurya.jpg?height=150&width=150&text=Mauryan+Life",
      miniGame: {
        type: "quiz",
        title: "Ashoka's Edicts Quiz",
        description: "Answer questions about Emperor Ashoka's rules to win the artifact!",
      },
      artifacts: [
        {
          id: "ashokapillar",
          name: "Ashoka Pillar",
          description: "A stone pillar with special messages.",
          historicalInfo:
            "Ashoka's pillars were made from single pieces of polished sandstone and could be up to 50 feet tall! The Lion Capital from one of these pillars is now India's national emblem.",
          image: "/placeholder.svg?height=100&width=100&text=Pillar",
        },
        {
          id: "buddhastatue",
          name: "Buddha Statue",
          description: "A statue of Lord Buddha.",
          historicalInfo:
            "Buddhism spread widely during the Maurya Empire. Ashoka built many stupas (dome-shaped structures) and monasteries to promote Buddhist teachings.",
          image: "/placeholder.svg?height=100&width=100&text=Buddha",
        },
        {
          id: "mauryacoin",
          name: "Mauryan Coin",
          description: "An ancient Indian coin with symbols.",
          historicalInfo:
            "Mauryan coins were called 'panas' and were made of silver and copper. They had symbols like elephants, trees, and mountains stamped on them.",
          image: "/placeholder.svg?height=100&width=100&text=Coin",
        },
      ],
    },
    {
      id: "gupta",
      name: "Gupta Empire",
      years: "320 CE - 550 CE",
      description:
        "The Gupta Empire is called India's 'Golden Age'! This was a time of amazing discoveries in math, science, art, and literature.",
      color: "from-green-400 to-green-600",
      bgColor: "bg-green-50",
      region: "indian",
      image: "/game/guptha.jpeg?height=300&width=400&text=Gupta+Empire",
      ruler: "Chandragupta II",
      rulerFact:
        "Chandragupta II was also called 'Vikramaditya', which means 'Sun of Power'. His court had nine famous scholars called the 'Nine Gems'!",
      rulerImage: "/game/guptha.jpeg?height=150&width=150&text=Chandragupta",
      invention: "Zero and Decimal System",
      inventionFact:
        "Mathematician Aryabhata worked with the number zero and the decimal system, which we still use today for counting!",
      inventionImage: "/game/guptha.jpeg?height=150&width=150&text=Mathematics",
      lifestyle: "People enjoyed plays, music, and poetry. They built beautiful temples with amazing sculptures.",
      lifestyleImage: "/game/guptha.jpeg?height=150&width=150&text=Gupta+Art",
      miniGame: {
        type: "memory",
        title: "Math Symbols Memory",
        description: "Match the ancient Indian math symbols to collect the artifact!",
      },
      artifacts: [
        {
          id: "mathscroll",
          name: "Mathematics Scroll",
          description: "A scroll with early mathematical formulas.",
          historicalInfo:
            "During the Gupta period, mathematicians like Aryabhata and Brahmagupta made incredible discoveries. They understood the concept of zero, negative numbers, and algebra!",
          image: "/game/math.jpeg?height=100&width=100&text=Math+Scroll",
        },
        {
          id: "guptacoin",
          name: "Gold Gupta Coin",
          description: "A gold coin showing a Gupta king.",
          historicalInfo:
            "Gupta gold coins were called 'dinars'. They showed kings performing heroic acts like hunting tigers or playing musical instruments.",
          image: "/game/gucoin.jpeg?height=100&width=100&text=Gold+Coin",
        },
        {
          id: "ironpillar",
          name: "Iron Pillar",
          description: "A pillar made of iron that doesn't rust.",
          historicalInfo:
            "The Iron Pillar of Delhi was made during the Gupta period and is over 1,600 years old! Scientists are amazed that it hasn't rusted, showing how advanced their iron-working skills were.",
          image: "/game/iron.jpeg?height=100&width=100&text=Iron+Pillar",
        },
      ],
    },
    {
      id: "mughal",
      name: "Mughal Empire",
      years: "1526 CE - 1857 CE",
      description:
        "The Mughal Empire was one of India's greatest kingdoms! They built beautiful buildings like the Taj Mahal and created amazing art and music.",
      color: "from-emerald-500 to-teal-700",
      bgColor: "bg-emerald-100",
      region: "indian",
      image: "/game/mughal.jpg?height=300&width=400&text=Mughal+India",
      ruler: "Emperor Akbar",
      rulerFact: "Akbar was known as 'Akbar the Great' because he was wise and respected all religions.",
      rulerImage: "/game/mughal.jpg?height=150&width=150&text=Emperor+Akbar",
      invention: "Miniature Paintings",
      inventionFact: "Mughals created tiny, detailed paintings that told stories about their lives.",
      inventionImage: "/game/mughal.jpg?height=150&width=150&text=Miniature+Paintings",
      lifestyle: "Mughal emperors loved gardens with fountains and beautiful flowers.",
      lifestyleImage: "/game/mughal.jpg?height=150&width=150&text=Mughal+Gardens",
      miniGame: {
        type: "build",
        title: "Build the Taj Mahal",
        description: "Place the pieces in the right spots to build the beautiful Taj Mahal!",
      },
      artifacts: [
        {
          id: "tajmahal",
          name: "Taj Mahal Model",
          description: "A small model of the famous Taj Mahal.",
          historicalInfo:
            "The Taj Mahal was built by Emperor Shah Jahan as a tomb for his beloved wife Mumtaz Mahal. It took over 20,000 workers and 22 years to complete this beautiful marble building!",
          image: "/placeholder.svg?height=100&width=100&text=Taj+Mahal",
        },
        {
          id: "carpet",
          name: "Mughal Carpet",
          description: "A colorful carpet with beautiful patterns.",
          historicalInfo:
            "Mughal carpets were handmade with intricate designs of flowers, animals, and geometric patterns. They were so valuable that they were given as special gifts to other rulers.",
          image: "/placeholder.svg?height=100&width=100&text=Carpet",
        },
        {
          id: "jewelry",
          name: "Royal Jewelry",
          description: "Shiny jewelry worn by Mughal princes and princesses.",
          historicalInfo:
            "Mughal emperors loved jewels! The famous Peacock Throne of Shah Jahan was covered in gold and precious stones, including the Koh-i-Noor diamond, which is now part of the British Crown Jewels.",
          image: "/placeholder.svg?height=100&width=100&text=Jewelry",
        },
      ],
    },
  ]

  // Game functions
  const startTimeMachine = () => {
    if (timeEnergy <= 0) {
      setProfessorMessage("Oh no! You're out of Time Energy! Pet my robot dog to get more energy!")
      setShowProfessor(true)
      return
    }

    setTimeEnergy((prev) => prev - 1)
    setShowIntro(false)
    const randomIndex = Math.floor(Math.random() * historicalPeriods.length)
    setCurrentPeriod(historicalPeriods[randomIndex])

    // Show artifact purpose message on first travel
    if (totalCollected === 0) {
      setProfessorMessage(
        "Welcome to your first time travel adventure! Collect artifacts by playing mini-games. Each artifact you find will be displayed in your museum and teach you cool facts about history!",
      )
    } else {
      // Professor message
      const messages = [
        "Great Scott! We've arrived in " + historicalPeriods[randomIndex].name + "!",
        "Time jump successful! Welcome to " + historicalPeriods[randomIndex].name + "!",
        "Whoosh! We've landed in " + historicalPeriods[randomIndex].name + "! Look around for artifacts!",
        "Beep boop! My calculations were correct! We're in " + historicalPeriods[randomIndex].name + "!",
      ]
      setProfessorMessage(messages[Math.floor(Math.random() * messages.length)])
    }
    setShowProfessor(true)
  }

  const goHome = () => {
    setCurrentPeriod(null)
    setShowIntro(true)
    setShowArtifactInfo(null)
    setShowFact(false)
    setShowMuseum(false)
    setShowTimeline(false)
    setShowMiniGame(false)
  }

  const collectArtifact = (artifact) => {
    // Start mini-game to collect artifact
    if (!collectedArtifacts[currentPeriod.id]?.includes(artifact.id)) {
      setCurrentMiniGame({
        ...currentPeriod.miniGame,
        artifactId: artifact.id,
        artifactName: artifact.name,
      })
      setShowMiniGame(true)
      return
    }

    // Already collected, just show info
    setShowArtifactInfo(artifact)
  }

  const completeMiniGame = (artifactId) => {
    // Add artifact to collection
    if (!collectedArtifacts[currentPeriod.id].includes(artifactId)) {
      setCollectedArtifacts({
        ...collectedArtifacts,
        [currentPeriod.id]: [...collectedArtifacts[currentPeriod.id], artifactId],
      })

      setArtifactCollected(true)

      // Add coins for collecting artifact
      setCoins((prev) => prev + 25)

      // Trigger confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      setTimeout(() => {
        setArtifactCollected(false)
      }, 2000)
    }

    setShowMiniGame(false)

    // Show artifact info
    const artifact = currentPeriod.artifacts.find((a) => a.id === artifactId)
    setShowArtifactInfo(artifact)
  }

  const showRandomFact = () => {
    const factTypes = ["ruler", "invention", "lifestyle"]
    const randomType = factTypes[Math.floor(Math.random() * factTypes.length)]

    let fact = ""
    let factImage = ""

    if (randomType === "ruler") {
      fact = `${currentPeriod.ruler}: ${currentPeriod.rulerFact}`
      factImage = currentPeriod.rulerImage
    } else if (randomType === "invention") {
      fact = `${currentPeriod.invention}: ${currentPeriod.inventionFact}`
      factImage = currentPeriod.inventionImage
    } else {
      fact = currentPeriod.lifestyle
      factImage = currentPeriod.lifestyleImage
    }

    setCurrentFact({ text: fact, image: factImage })
    setShowFact(true)

    // Add coins for learning
    setCoins((prev) => prev + 5)
  }

  const closeFact = () => {
    setShowFact(false)
  }

  const travelToNewPeriod = () => {
    if (timeEnergy <= 0) {
      setProfessorMessage("Oh no! You're out of Time Energy! Pet my robot dog to get more energy!")
      setShowProfessor(true)
      return
    }

    setTimeEnergy((prev) => prev - 1)

    let newIndex
    do {
      newIndex = Math.floor(Math.random() * historicalPeriods.length)
    } while (historicalPeriods[newIndex].id === currentPeriod.id)

    setCurrentPeriod(historicalPeriods[newIndex])
    setShowArtifactInfo(null)
    setShowFact(false)

    // Professor message
    const messages = [
      "Zooooom! Time jump complete! We're now in " + historicalPeriods[newIndex].name + "!",
      "Hold onto your hat! We've arrived in " + historicalPeriods[newIndex].name + "!",
      "My time calculations were perfect! Welcome to " + historicalPeriods[newIndex].name + "!",
      "Beep boop! Time travel successful! Explore " + historicalPeriods[newIndex].name + "!",
    ]
    setProfessorMessage(messages[Math.floor(Math.random() * messages.length)])
    setShowProfessor(true)
  }

  const openMuseum = () => {
    setShowMuseum(true)
    setCurrentPeriod(null)
    setShowArtifactInfo(null)
    setShowFact(false)
    setShowTimeline(false)
    setShowIntro(false)
  }

  const openTimeline = () => {
    setShowTimeline(true)
    setCurrentPeriod(null)
    setShowArtifactInfo(null)
    setShowFact(false)
    setShowMuseum(false)
    setShowIntro(false)
  }

  const selectPeriodInMuseum = (periodId) => {
    const period = historicalPeriods.find((p) => p.id === periodId)
    setSelectedMuseumPeriod(period)
  }

  const closeMuseumPeriod = () => {
    setSelectedMuseumPeriod(null)
  }

  const travelToPeriod = (periodId) => {
    if (timeEnergy <= 0) {
      setProfessorMessage("Oh no! You're out of Time Energy! Pet my robot dog to get more energy!")
      setShowProfessor(true)
      return
    }

    setTimeEnergy((prev) => prev - 1)

    const period = historicalPeriods.find((p) => p.id === periodId)
    setCurrentPeriod(period)
    setShowMuseum(false)
    setShowTimeline(false)
    setShowArtifactInfo(null)
    setShowFact(false)
  }

  const getCollectedArtifactsCount = (periodId) => {
    return collectedArtifacts[periodId]?.length || 0
  }

  const getTotalArtifactsCount = (periodId) => {
    const period = historicalPeriods.find((p) => p.id === periodId)
    return period?.artifacts?.length || 0
  }

  const openTimeCapsule = () => {
    setShowTimeCapsule(true)

    // Random rewards
    const rewards = ["25 Time Coins", "50 Time Coins", "2 Time Energy", "Special Badge: Time Traveler", "3 Time Energy"]

    const selectedReward = rewards[Math.floor(Math.random() * rewards.length)]
    setCurrentReward(selectedReward)

    // Apply reward
    if (selectedReward.includes("Coins")) {
      const amount = Number.parseInt(selectedReward.split(" ")[0])
      setCoins((prev) => prev + amount)
    } else if (selectedReward.includes("Energy")) {
      const amount = Number.parseInt(selectedReward.split(" ")[0])
      setTimeEnergy((prev) => prev + amount)
    } else if (selectedReward.includes("Badge")) {
      const badgeId = selectedReward.split(": ")[1].toLowerCase().replace(" ", "-")
      if (!badges.includes(badgeId)) {
        setBadges([...badges, badgeId])
      }
    }

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
    })
  }

  const closeTimeCapsule = () => {
    setShowTimeCapsule(false)
  }

  const rechargeEnergy = () => {
    setTimeEnergy((prev) => prev + 3)
    setProfessorMessage("Woof! Woof! My robot dog likes you! You got 3 Time Energy!")
    setShowProfessor(true)
  }

  const closeProfessor = () => {
    setShowProfessor(false)
  }

  // Mini-game components
  const renderMiniGame = () => {
    if (!currentMiniGame) return null

    switch (currentMiniGame.type) {
      case "memory":
        return <MemoryGame onComplete={() => completeMiniGame(currentMiniGame.artifactId)} />
      case "puzzle":
        return <PuzzleGame onComplete={() => completeMiniGame(currentMiniGame.artifactId)} />
      case "build":
        return <BuildGame onComplete={() => completeMiniGame(currentMiniGame.artifactId)} />
      case "dress":
        return <DressUpGame onComplete={() => completeMiniGame(currentMiniGame.artifactId)} />
      case "catch":
        return <CatchGame onComplete={() => completeMiniGame(currentMiniGame.artifactId)} />
      case "quiz":
        return <QuizGame onComplete={() => completeMiniGame(currentMiniGame.artifactId)} />
      default:
        return (
          <div className="p-4 text-center">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
              {currentMiniGame.title}
            </h2>
            <p className="mb-4" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
              {currentMiniGame.description}
            </p>
            <Button onClick={() => completeMiniGame(currentMiniGame.artifactId)}>Complete Challenge</Button>
          </div>
        )
    }
  }

  // Simple mini-game implementations
  const MemoryGame = ({ onComplete }) => {
    const [cards, setCards] = useState(
      [
        { id: 1, symbol: "𓂀", flipped: false, matched: false },
        { id: 2, symbol: "𓂀", flipped: false, matched: false },
        { id: 3, symbol: "𓃒", flipped: false, matched: false },
        { id: 4, symbol: "𓃒", flipped: false, matched: false },
        { id: 5, symbol: "𓆣", flipped: false, matched: false },
        { id: 6, symbol: "𓆣", flipped: false, matched: false },
        { id: 7, symbol: "𓇌", flipped: false, matched: false },
        { id: 8, symbol: "𓇌", flipped: false, matched: false },
      ].sort(() => Math.random() - 0.5),
    )

    const [flippedCards, setFlippedCards] = useState([])
    const [matchedPairs, setMatchedPairs] = useState(0)

    const flipCard = (id) => {
      if (flippedCards.length === 2) return

      const newCards = cards.map((card) => (card.id === id ? { ...card, flipped: true } : card))
      setCards(newCards)

      const flippedCard = cards.find((card) => card.id === id)
      const newFlippedCards = [...flippedCards, flippedCard]
      setFlippedCards(newFlippedCards)

      if (newFlippedCards.length === 2) {
        // Check for match
        if (newFlippedCards[0].symbol === newFlippedCards[1].symbol) {
          // Match found
          setTimeout(() => {
            const matchedCards = cards.map((card) =>
              card.symbol === newFlippedCards[0].symbol ? { ...card, matched: true, flipped: false } : card,
            )
            setCards(matchedCards)
            setFlippedCards([])
            setMatchedPairs(matchedPairs + 1)

            // Check if game is complete
            if (matchedPairs + 1 === 4) {
              setTimeout(() => onComplete(), 500)
            }
          }, 1000)
        } else {
          // No match
          setTimeout(() => {
            const resetCards = cards.map((card) =>
              newFlippedCards.some((fc) => fc.id === card.id) ? { ...card, flipped: false } : card,
            )
            setCards(resetCards)
            setFlippedCards([])
          }, 1000)
        }
      }
    }

    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
          Hieroglyph Memory Match
        </h2>
        <p className="mb-4" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
          Find all the matching pairs of hieroglyphs!
        </p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => !card.flipped && !card.matched && flipCard(card.id)}
              className={`h-16 flex items-center justify-center text-2xl rounded-lg cursor-pointer transition-all ${
                card.flipped || card.matched ? "bg-amber-200" : "bg-amber-500"
              }`}
            >
              {(card.flipped || card.matched) && card.symbol}
            </div>
          ))}
        </div>
        <p className="text-lg" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
          Pairs found: {matchedPairs}/4
        </p>
      </div>
    )
  }

  const PuzzleGame = ({ onComplete }) => {
    const [completed, setCompleted] = useState(false)
    const [progress, setProgress] = useState(0)
    const [placedPieces, setPlacedPieces] = useState([false, false, false, false])

    const handleDragSuccess = (index) => {
      if (placedPieces[index]) return

      const newPlacedPieces = [...placedPieces]
      newPlacedPieces[index] = true
      setPlacedPieces(newPlacedPieces)

      setProgress((prev) => {
        const newProgress = prev + 25
        if (newProgress >= 100) {
          setCompleted(true)
          setTimeout(() => onComplete(), 1000)
        }
        return newProgress
      })
    }

    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
          Fix the Roman Pottery
        </h2>
        <div className="bg-red-100 p-4 rounded-lg mb-4">
          <div className="h-40 flex items-center justify-center">
            <div className="relative w-32 h-32 bg-red-300 rounded-full">
              {completed ? (
                <div className="absolute inset-0 flex items-center justify-center text-4xl">🏺</div>
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center justify-center text-lg">
                    {placedPieces.filter((p) => p).length === 0 ? "Drag pieces here!" : ""}
                  </div>
                  {placedPieces[0] && (
                    <div className="absolute top-0 left-0 w-16 h-16 bg-red-400 rounded-tl-full"></div>
                  )}
                  {placedPieces[1] && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-red-400 rounded-tr-full"></div>
                  )}
                  {placedPieces[2] && (
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-red-400 rounded-bl-full"></div>
                  )}
                  {placedPieces[3] && (
                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-red-400 rounded-br-full"></div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="flex justify-around mb-4">
          {!completed &&
            Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className={`w-16 h-16 bg-red-400 rounded-lg flex items-center justify-center cursor-pointer ${placedPieces[i] ? "opacity-50" : ""}`}
                  onClick={() => !placedPieces[i] && handleDragSuccess(i)}
                >
                  Piece {i + 1}
                </div>
              ))}
        </div>

        <p className="text-lg" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
          {completed ? "Great job! Pot fixed!" : "Click the pieces to fix the pot!"}
        </p>
      </div>
    )
  }

  const BuildGame = ({ onComplete }) => {
    const [completed, setCompleted] = useState(false)
    const [bones, setBones] = useState([
      { id: 1, name: "Skull", placed: false },
      { id: 2, name: "Ribs", placed: false },
      { id: 3, name: "Legs", placed: false },
      { id: 4, name: "Tail", placed: false },
    ])

    const placeBone = (id) => {
      const newBones = bones.map((bone) => (bone.id === id ? { ...bone, placed: true } : bone))
      setBones(newBones)

      if (newBones.every((bone) => bone.placed)) {
        setCompleted(true)
        setTimeout(() => onComplete(), 1000)
      }
    }

    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
          Build-a-Dino
        </h2>
        <div className="bg-green-100 p-4 rounded-lg mb-4">
          <div className="h-48 flex items-center justify-center">
            {completed ? (
              <div className="text-6xl">🦖</div>
            ) : (
              <div className="border-2 border-dashed border-green-500 h-full w-full flex items-center justify-center relative">
                {bones[0].placed && (
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-4xl">💀</div>
                )}
                {bones[1].placed && (
                  <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-4xl">🦴</div>
                )}
                {bones[2].placed && (
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-4xl">🦵</div>
                )}
                {bones[3].placed && (
                  <div className="absolute right-8 top-1/2 transform -translate-y-1/2 text-4xl">〰️</div>
                )}
                {!bones.some((bone) => bone.placed) && <p>Place bones here!</p>}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-around mb-4">
          {bones.map((bone) => (
            <div
              key={bone.id}
              className={`p-2 rounded-lg ${bone.placed ? "opacity-50 bg-gray-200" : "bg-green-300 cursor-pointer"}`}
              onClick={() => !bone.placed && placeBone(bone.id)}
            >
              {bone.name}
            </div>
          ))}
        </div>

        <p className="text-lg" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
          {completed ? "Amazing! You built a dinosaur!" : "Click the bones to build your dinosaur!"}
        </p>
      </div>
    )
  }

  const DressUpGame = ({ onComplete }) => {
    const [armorPieces, setArmorPieces] = useState([
      { id: 1, name: "Helmet", equipped: false, emoji: "⛑️" },
      { id: 2, name: "Chestplate", equipped: false, emoji: "🛡️" },
      { id: 3, name: "Shield", equipped: false, emoji: "🛡️" },
      { id: 4, name: "Boots", equipped: false, emoji: "👢" },
    ])

    const [completed, setCompleted] = useState(false)

    const equipArmor = (id) => {
      const newArmorPieces = armorPieces.map((piece) => (piece.id === id ? { ...piece, equipped: true } : piece))
      setArmorPieces(newArmorPieces)

      if (newArmorPieces.every((piece) => piece.equipped)) {
        setCompleted(true)
        setTimeout(() => onComplete(), 1000)
      }
    }

    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
          Dress the Knight
        </h2>
        <div className="bg-purple-100 p-4 rounded-lg mb-4">
          <div className="h-48 flex items-center justify-center">
            {completed ? (
              <div className="text-6xl">🛡️👨‍🦰⚔️</div>
            ) : (
              <div className="relative flex flex-col items-center">
                <div className="text-4xl mb-2">
                  {armorPieces[0].equipped ? "⛑️" : ""}
                  👨‍🦰
                </div>
                <div className="text-4xl">
                  {armorPieces[1].equipped ? "🛡️" : "👕"}
                  {armorPieces[2].equipped ? "🛡️" : ""}
                </div>
                <div className="text-4xl mt-2">{armorPieces[3].equipped ? "👢" : "👖"}</div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-around mb-4">
          {armorPieces.map((piece) => (
            <div
              key={piece.id}
              className={`p-2 rounded-lg ${piece.equipped ? "opacity-50 bg-gray-200" : "bg-purple-300 cursor-pointer"}`}
              onClick={() => !piece.equipped && equipArmor(piece.id)}
            >
              {piece.name} {piece.emoji}
            </div>
          ))}
        </div>

        <p className="text-lg" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
          {completed ? "The knight is ready for battle!" : "Help the knight get dressed for battle!"}
        </p>
      </div>
    )
  }

  const CatchGame = ({ onComplete }) => {
    const [scrollsCaught, setScrollsCaught] = useState(0)
    const [timeLeft, setTimeLeft] = useState(15) // Increased time
    const [gameActive, setGameActive] = useState(true)
    const [scrollPosition, setScrollPosition] = useState({ left: "40%", top: "40%" })

    useEffect(() => {
      if (timeLeft > 0 && gameActive) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
        return () => clearTimeout(timer)
      } else if (timeLeft === 0 && gameActive) {
        setGameActive(false)
        if (scrollsCaught >= 3) {
          // Reduced required scrolls
          setTimeout(() => onComplete(), 1000)
        }
      }
    }, [timeLeft, gameActive])

    const catchScroll = () => {
      setScrollsCaught(scrollsCaught + 1)
      // Move scroll to new position
      setScrollPosition({
        left: `${Math.random() * 80}%`,
        top: `${Math.random() * 70}%`,
      })

      if (scrollsCaught + 1 >= 3 && gameActive) {
        // Reduced required scrolls
        setGameActive(false)
        setTimeout(() => onComplete(), 1000)
      }
    }

    const resetGame = () => {
      setScrollsCaught(0)
      setTimeLeft(15)
      setGameActive(true)
    }

    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
          Catch the Flying Scrolls
        </h2>

        <div className="flex justify-between mb-2">
          <div className="bg-green-100 px-3 py-1 rounded-lg">Scrolls: {scrollsCaught}/3</div>
          <div className="bg-red-100 px-3 py-1 rounded-lg">Time: {timeLeft}s</div>
        </div>

        <div className="bg-green-100 p-4 rounded-lg mb-4 h-48 relative">
          {gameActive ? (
            <div
              className="absolute w-12 h-12 bg-yellow-200 rounded-lg flex items-center justify-center cursor-pointer animate-bounce"
              style={{
                left: scrollPosition.left,
                top: scrollPosition.top,
              }}
              onClick={catchScroll}
            >
              📜
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-xl mb-2" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
                  {scrollsCaught >= 3 ? "Great job! You caught enough scrolls!" : "Try again!"}
                </p>
                {scrollsCaught < 3 && <Button onClick={resetGame}>Try Again</Button>}
              </div>
            </div>
          )}
        </div>

        <p className="text-lg" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
          {gameActive
            ? "Quick! Tap the scrolls before they fly away!"
            : scrollsCaught >= 3
              ? "You saved the ancient knowledge!"
              : "You need to catch at least 3 scrolls!"}
        </p>
      </div>
    )
  }

  const QuizGame = ({ onComplete }) => {
    const questions = [
      {
        question: "Which of these was invented in Ancient China?",
        options: ["Pizza", "Compass", "Television"],
        answer: 1,
      },
      {
        question: "What was the Great Wall of China built to do?",
        options: ["Keep dragons out", "Protect from invaders", "Hold water back"],
        answer: 1,
      },
      {
        question: "What material did the Chinese keep secret for centuries?",
        options: ["Silk", "Gold", "Plastic"],
        answer: 0,
      },
    ]

    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [score, setScore] = useState(0)
    const [quizComplete, setQuizComplete] = useState(false)

    const answerQuestion = (selectedIndex) => {
      if (selectedIndex === questions[currentQuestion].answer) {
        setScore(score + 1)
      }

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        setQuizComplete(true)
        if (score + (selectedIndex === questions[currentQuestion].answer ? 1 : 0) >= 2) {
          setTimeout(() => onComplete(), 1000)
        }
      }
    }

    const resetQuiz = () => {
      setCurrentQuestion(0)
      setScore(0)
      setQuizComplete(false)
    }

    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
          Chinese Invention Quiz
        </h2>

        {!quizComplete ? (
          <>
            <div className="bg-blue-100 p-4 rounded-lg mb-4">
              <p className="text-lg mb-4" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
                {questions[currentQuestion].question}
              </p>

              <div className="space-y-2">
                {questions[currentQuestion].options.map((option, index) => (
                  <Button key={index} className="w-full" onClick={() => answerQuestion(index)}>
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <p className="text-sm" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </>
        ) : (
          <div className="bg-blue-100 p-4 rounded-lg mb-4">
            <p className="text-xl mb-4" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
              Quiz Complete!
            </p>
            <p className="text-lg mb-4" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
              You got {score} out of {questions.length} correct!
            </p>

            {score >= 2 ? (
              <p className="text-green-600 font-bold" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
                Great job! You know a lot about Ancient China!
              </p>
            ) : (
              <>
                <p className="text-orange-600 mb-4" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
                  Try again to win the artifact!
                </p>
                <Button onClick={resetQuiz}>Try Again</Button>
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  // Main UI rendering
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-200 to-purple-200 p-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full text-center">
          <h1
            className="text-5xl font-bold mb-4 text-purple-800"
            style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}
          >
            Time Machine Explorer
          </h1>
          <div className="bg-white rounded-3xl p-6 shadow-lg mb-6 border-4 border-yellow-400">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Clock className="w-20 h-20 text-purple-600 animate-pulse" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-bounce flex items-center justify-center text-white font-bold">
                  GO!
                </div>
              </div>
            </div>
            <p className="text-xl mb-4" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
              Oh no! The Time Machine is broken, and history is getting mixed up!
            </p>
            <p className="mb-6 text-gray-700" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
              Help Professor Timely fix time by collecting lost artifacts before they disappear forever!
            </p>
            <Button
              onClick={startTimeMachine}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-full text-xl shadow-md transform transition-transform hover:scale-105"
            >
              Start Time Travel Adventure!
            </Button>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-yellow-500 mr-1" />
                <span className="font-bold">Time Energy: {timeEnergy}</span>
              </div>
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-500 mr-1" />
                <span className="font-bold">Coins: {coins}</span>
              </div>
            </div>

            <div className="flex justify-center mb-2">
              <div
                className="bg-blue-100 p-3 rounded-full cursor-pointer hover:bg-blue-200 transition-colors"
                onClick={rechargeEnergy}
              >
                <span className="text-2xl">🐶</span>
              </div>
            </div>
            <p className="text-sm text-center" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
              Pet Professor Timely's robot dog for energy!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <Button
              onClick={openMuseum}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-xl shadow-md"
            >
              <Museum className="w-5 h-5 mb-1" />
              <span className="text-xs block">Museum</span>
            </Button>
            <Button
              onClick={openTimeline}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl shadow-md"
            >
              <Calendar className="w-5 h-5 mb-1" />
              <span className="text-xs block">Timeline</span>
            </Button>
            <Button
              onClick={openTimeCapsule}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl shadow-md"
            >
              <Gift className="w-5 h-5 mb-1" />
              <span className="text-xs block">Surprise!</span>
            </Button>
          </div>

          {badges.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-md mb-6">
              <h3
                className="font-bold mb-2 flex items-center"
                style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}
              >
                <Award className="w-5 h-5 text-yellow-500 mr-1" />
                Your Badges
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {badges.map((badge, index) => (
                  <div key={index} className="bg-yellow-100 px-2 py-1 rounded-full text-xs">
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (showMuseum) {
    return (
      <div className="min-h-screen bg-amber-50 p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="sm" onClick={goHome} className="flex items-center gap-1 bg-white">
            <Home className="w-4 h-4" /> Home
          </Button>
          <h1
            className="text-2xl font-bold text-amber-800"
            style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}
          >
            Your History Museum
          </h1>
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-bold">{totalCollected} Artifacts</span>
          </div>
        </div>

        {selectedMuseumPeriod ? (
          <div className="bg-white rounded-xl p-4 shadow-md mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
                {selectedMuseumPeriod.name} Collection
              </h2>
              <Button variant="outline" size="sm" onClick={closeMuseumPeriod}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Museum
              </Button>
            </div>

            <img
              src={selectedMuseumPeriod.image || "/placeholder.svg"}
              alt={selectedMuseumPeriod.name}
              className="w-full h-40 object-cover rounded-lg mb-3"
            />

            <p className="mb-4" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
              {selectedMuseumPeriod.description}
            </p>

            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
              Your Artifacts:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {selectedMuseumPeriod.artifacts.map((artifact) => {
                const isCollected = collectedArtifacts[selectedMuseumPeriod.id]?.includes(artifact.id)

                return (
                  <div
                    key={artifact.id}
                    className={`p-4 rounded-lg ${isCollected ? "bg-green-50 border-2 border-green-500" : "bg-gray-100 opacity-70"}`}
                  >
                    <div className="flex items-center mb-2">
                      <img
                        src={artifact.image || "/placeholder.svg"}
                        alt={artifact.name}
                        className="w-12 h-12 object-contain mr-3"
                      />
                      <h4 className="font-bold" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
                        {artifact.name}
                      </h4>
                    </div>

                    {isCollected ? (
                      <>
                        <p className="text-sm mb-2" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
                          {artifact.description}
                        </p>
                        <p
                          className="text-xs text-gray-700"
                          style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}
                        >
                          {artifact.historicalInfo}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm italic" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
                        You haven't found this artifact yet! Travel to {selectedMuseumPeriod.name} to discover it.
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            <Button
              onClick={() => travelToPeriod(selectedMuseumPeriod.id)}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl"
            >
              Travel to {selectedMuseumPeriod.name}
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl p-4 shadow-md mb-4">
              <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
                <Museum className="w-6 h-6 inline mr-2 text-amber-600" />
                Your Artifact Collection
              </h2>
              <p className="mb-4" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
                Click on a time period to see the artifacts you've collected!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {historicalPeriods.map((period) => (
                  <div
                    key={period.id}
                    onClick={() => selectPeriodInMuseum(period.id)}
                    className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
                        {period.name}
                      </h3>
                      <span className="text-sm bg-amber-100 px-2 py-1 rounded-full">
                        {getCollectedArtifactsCount(period.id)}/{getTotalArtifactsCount(period.id)} Artifacts
                      </span>
                    </div>
                    <div className="flex items-center">
                      <img
                        src={period.image || "/placeholder.svg"}
                        alt={period.name}
                        className="w-16 h-16 object-cover rounded-md mr-3"
                      />
                      <p className="text-sm text-gray-600" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
                        {period.years}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={startTimeMachine}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl text-lg shadow-md"
            >
              Start New Adventure!
            </Button>
          </>
        )}
      </div>
    )
  }

  if (showTimeline) {
    return (
      <div className="min-h-screen bg-blue-50 p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="sm" onClick={goHome} className="flex items-center gap-1 bg-white">
            <Home className="w-4 h-4" /> Home
          </Button>
          <h1 className="text-2xl font-bold text-blue-800" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
            History Timeline
          </h1>
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-bold">{totalCollected} Artifacts</span>
          </div>
        </div>

        {/* Timeline Filter */}
        <div className="bg-white rounded-xl p-4 shadow-md mb-4 flex justify-center space-x-2">
          <Button
            variant={timelineView === "all" ? "default" : "outline"}
            onClick={() => setTimelineView("all")}
            className="rounded-full"
          >
            <Globe className="w-4 h-4 mr-1" /> All History
          </Button>
          <Button
            variant={timelineView === "world" ? "default" : "outline"}
            onClick={() => setTimelineView("world")}
            className="rounded-full"
          >
            <Globe className="w-4 h-4 mr-1" /> World History
          </Button>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-1 bg-blue-300 rounded-full"></div>

          <div className="space-y-6 ml-12">
            {historicalPeriods
              .filter((period) => timelineView === "all" || period.region === timelineView)
              .sort((a, b) => {
                // Extract the first year from the years string and convert to number
                const yearA = Number.parseInt(a.years.split(" ")[0].replace(/[^0-9-]/g, ""))
                const yearB = Number.parseInt(b.years.split(" ")[0].replace(/[^0-9-]/g, ""))
                return yearA - yearB
              })
              .map((period) => (
                <div key={period.id} className="bg-white rounded-xl p-4 shadow-md relative">
                  <div className="absolute left-[-2.5rem] top-6 w-6 h-6 bg-blue-500 rounded-full border-4 border-white"></div>

                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="md:w-1/3 mb-3 md:mb-0 md:mr-4">
                      <img
                        src={period.image || "/placeholder.svg"}
                        alt={period.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>

                    <div className="md:w-2/3">
                      <h2
                        className="text-xl font-bold mb-1"
                        style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}
                      >
                        {period.name}
                      </h2>
                      <p
                        className="text-sm text-gray-600 mb-2"
                        style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}
                      >
                        {period.years}
                      </p>
                      <p className="text-sm mb-3" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
                        {period.description}
                      </p>

                      <div className="flex justify-between items-center">
                        <span className="text-sm bg-amber-100 px-2 py-1 rounded-full">
                          {getCollectedArtifactsCount(period.id)}/{getTotalArtifactsCount(period.id)} Artifacts
                        </span>

                        <Button
                          onClick={() => travelToPeriod(period.id)}
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          Travel Here
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    )
  }

  if (showMiniGame) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-purple-100 p-4">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMiniGame(false)}
            className="flex items-center gap-1 bg-white"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <h1 className="text-xl font-bold" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
            <Gamepad2 className="w-5 h-5 inline mr-1 text-purple-600" />
            Mini-Game Challenge
          </h1>
          <div className="w-16"></div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-4">{renderMiniGame()}</div>
      </div>
    )
  }

  if (!currentPeriod) {
    return <div>Loading your time machine...</div>
  }

  return (
    <div className={`min-h-screen ${currentPeriod.bgColor} p-4`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={goHome} className="flex items-center gap-1 bg-white">
          <Home className="w-4 h-4" /> Home
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={openMuseum} className="flex items-center gap-1 bg-white">
            <Museum className="w-4 h-4" /> Museum
          </Button>
          <Button variant="outline" size="sm" onClick={openTimeline} className="flex items-center gap-1 bg-white">
            <Calendar className="w-4 h-4" /> Timeline
          </Button>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="font-bold">{totalCollected} Artifacts</span>
        </div>
      </div>

      {/* Time Period Header */}
      <div className={`bg-gradient-to-r ${currentPeriod.color} rounded-xl p-4 text-white mb-4 shadow-lg`}>
        <h1 className="text-2xl font-bold mb-1">{currentPeriod.name}</h1>
        <p className="text-sm opacity-90">{currentPeriod.years}</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-4">
        {/* Time Period Image */}
        <Card className="p-4 shadow-md overflow-hidden">
          <img
            src={currentPeriod.image || "/placeholder.svg"}
            alt={currentPeriod.name}
            className="w-full h-48 object-cover rounded-lg mb-3"
          />
          <p className="text-lg" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
            {currentPeriod.description}
          </p>
          <Button onClick={showRandomFact} className="mt-3 bg-yellow-500 hover:bg-yellow-600 rounded-full font-bold">
            Learn a Fun Fact!
          </Button>
        </Card>

        {/* Artifacts */}
        <div className="bg-white rounded-xl p-4 shadow-md border-2 border-blue-200">
          <h2
            className="text-xl font-bold mb-3 flex items-center"
            style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}
          >
            <Sparkles className="w-6 h-6 mr-2 text-yellow-500" />
            Collect Artifacts
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {currentPeriod.artifacts.map((artifact) => (
              <div
                key={artifact.id}
                onClick={() => collectArtifact(artifact)}
                className={`relative cursor-pointer bg-gray-100 rounded-lg p-3 text-center transition-all hover:scale-105 ${
                  collectedArtifacts[currentPeriod.id]?.includes(artifact.id)
                    ? "border-3 border-green-500 bg-green-50"
                    : "border border-gray-200"
                }`}
              >
                <div className="h-20 flex items-center justify-center mb-2">
                  <img
                    src={artifact.image || "/placeholder.svg"}
                    alt={artifact.name}
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <p className="font-medium text-sm" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
                  {artifact.name}
                </p>
                {collectedArtifacts[currentPeriod.id]?.includes(artifact.id) && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center animate-bounce">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Game Stats */}
        <div className="bg-white rounded-xl p-3 shadow-md">
          <div className="flex justify-between">
            <div className="flex items-center">
              <Zap className="w-5 h-5 text-yellow-500 mr-1" />
              <span className="font-bold">Energy: {timeEnergy}</span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-1" />
              <span className="font-bold">Coins: {coins}</span>
            </div>
          </div>
        </div>

        {/* Travel Button */}
        <Button
          onClick={travelToNewPeriod}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl text-lg mt-2 shadow-lg"
          style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}
        >
          Travel to Another Time!
        </Button>
      </div>

      {/* Artifact Info Modal */}
      {showArtifactInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full border-4 border-yellow-400">
            <div className="flex justify-center mb-4">
              <img
                src={showArtifactInfo.image || "/placeholder.svg"}
                alt={showArtifactInfo.name}
                className="w-24 h-24 object-contain"
              />
            </div>
            <h2
              className="text-xl font-bold mb-2 text-center"
              style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}
            >
              {showArtifactInfo.name}
            </h2>
            <p className="mb-3 text-center" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
              {showArtifactInfo.description}
            </p>

            {collectedArtifacts[currentPeriod.id]?.includes(showArtifactInfo.id) && (
              <div className="bg-amber-50 p-3 rounded-lg mb-4 border border-amber-200">
                <h3
                  className="font-bold flex items-center mb-1"
                  style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}
                >
                  <Info className="w-4 h-4 mr-1 text-amber-500" /> Historical Facts:
                </h3>
                <p className="text-sm" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
                  {showArtifactInfo.historicalInfo}
                </p>
              </div>
            )}

            <Button onClick={() => setShowArtifactInfo(null)} className="w-full rounded-full">
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Fact Modal */}
      {showFact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full border-4 border-blue-300">
            <div className="flex justify-center mb-4">
              <BookOpen className="w-12 h-12 text-blue-500" />
            </div>
            <h2
              className="text-xl font-bold mb-2 text-center"
              style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}
            >
              Fun Fact!
            </h2>
            <div className="flex justify-center mb-4">
              <img
                src={currentFact.image || "/placeholder.svg"}
                alt="Fact illustration"
                className="w-32 h-32 object-contain rounded-lg"
              />
            </div>
            <p className="mb-4 text-center" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
              {currentFact.text}
            </p>
            <Button onClick={closeFact} className="w-full rounded-full bg-green-500 hover:bg-green-600">
              Cool! I learned something!
            </Button>
          </div>
        </div>
      )}

      {/* Artifact Collected Animation */}
      {artifactCollected && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-20">
          <div className="bg-white bg-opacity-90 rounded-xl p-6 animate-bounce border-4 border-green-500">
            <h2
              className="text-3xl font-bold text-green-600"
              style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}
            >
              Artifact Collected! 🎉
            </h2>
            <div className="flex justify-center mt-2">
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>
      )}

      {/* Professor Timely Modal */}
      {showProfessor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-30">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full border-4 border-purple-400">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-24 h-24 bg-purple-200 rounded-full flex items-center justify-center">
                  <span className="text-4xl">🤖</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  !
                </div>
              </div>
            </div>
            <h2
              className="text-xl font-bold mb-2 text-center text-purple-700"
              style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}
            >
              Professor Timely
            </h2>
            <div className="bg-purple-100 p-3 rounded-lg mb-4 border border-purple-200">
              <p className="text-center" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
                {professorMessage}
              </p>
            </div>
            <Button
              onClick={closeProfessor}
              className="w-full rounded-full bg-purple-500 hover:bg-purple-600 text-white"
            >
              Got it!
            </Button>
          </div>
        </div>
      )}

      {/* Time Capsule Modal */}
      {showTimeCapsule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-30">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full border-4 border-green-400">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-green-200 rounded-full flex items-center justify-center">
                <Gift className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <h2
              className="text-xl font-bold mb-2 text-center text-green-700"
              style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}
            >
              Time Capsule Surprise!
            </h2>
            <div className="bg-green-100 p-3 rounded-lg mb-4 border border-green-200">
              <p className="text-center text-xl font-bold" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
                You got: {currentReward}
              </p>
              <p className="text-center mt-2" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
                You also earned 50 Time Coins!
              </p>
            </div>
            <Button
              onClick={closeTimeCapsule}
              className="w-full rounded-full bg-green-500 hover:bg-green-600 text-white"
            >
              Awesome!
            </Button>
          </div>
        </div>
      )}

      {/* Reward Modal */}
      {showReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-30">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full border-4 border-yellow-400">
            <div className="flex justify-center mb-4">
              <Award className="w-24 h-24 text-yellow-500 fill-yellow-200" />
            </div>
            <h2
              className="text-xl font-bold mb-2 text-center text-yellow-700"
              style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}
            >
              New Badge Earned!
            </h2>
            <div className="bg-yellow-100 p-3 rounded-lg mb-4 border border-yellow-200">
              <p className="text-center text-xl font-bold" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
                {currentReward}
              </p>
              <p className="text-center mt-2" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
                You also earned 50 Time Coins!
              </p>
            </div>
            <Button
              onClick={() => setShowReward(false)}
              className="w-full rounded-full bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Awesome!
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

