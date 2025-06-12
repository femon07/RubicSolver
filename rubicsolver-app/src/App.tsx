import RubiksCube from './components/RubiksCube'
import { useState } from 'react'
import './App.css'

function App() {
  const [error, setError] = useState('')
  return (
    <div className="App">
      {error && <div className="error">{error}</div>}
      <RubiksCube onError={setError} />
    </div>
  )
}

export default App
