import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🌆 CityPulse Live</h1>
        <p className="text-xl text-gray-300 mb-8">
          Real-time civic engagement platform for Bogotá
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-400">MVP Frontend - Ready for Development</p>
          <button
            onClick={() => setCount((count) => count + 1)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
          >
            Count: {count}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
