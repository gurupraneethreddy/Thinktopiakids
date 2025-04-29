export default function WorldExplorerPage() {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-100 to-blue-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center text-blue-700 mb-6">🌍 World Explorer Adventure! 🌎</h1>
          <p className="text-xl text-center text-blue-600 mb-8">
            Click on any country to learn about it! Can you find all the countries?
          </p>
  
          <WorldMap />
        </div>
      </div>
    )
  }
  
  // Import the client component
  import dynamic from "next/dynamic"
  
  // Use dynamic import with no SSR to avoid hydration issues with the map
  const WorldMap = dynamic(() => import("@/components/world-explorer/world-map"), {
    ssr: false,
  })
  
  
