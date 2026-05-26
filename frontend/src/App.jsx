
  import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ProjectileMotion from './pages/ProjectileMotion'
import NewtonsLaws from './pages/NewtonsLaws'
import WorkEnergyPower from './pages/WorkEnergyPower' 
import MomentumCollisions from './pages/MomentumCollisions'
import SimpleHarmonicMotion from './pages/SimpleHarmonicMotion'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projectile-motion" element={<ProjectileMotion />} />
          <Route path="/newtons-laws" element={<NewtonsLaws />} />
           <Route path="/work-energy-power" element={<WorkEnergyPower />} />
           <Route path="/momentum-collisions" element={<MomentumCollisions />} />
           <Route path="/simple-harmonic-motion" element={<SimpleHarmonicMotion />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
