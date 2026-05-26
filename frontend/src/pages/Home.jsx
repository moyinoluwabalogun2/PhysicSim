import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Rocket,
  Zap,
  BatteryCharging,
  Orbit,
  Waves
} from 'lucide-react'
import SimulationCard from '../components/SimulationCard'
import '../styles/home.css'

const Home = () => {
  const navigate = useNavigate()

  const simulations = [
    {
      id: 'projectile',
      title: 'Projectile Motion',
      description:
        'Explore launch angle, velocity, gravity, and air resistance with real-time motion visualization.',
      icon: Rocket,
      color: '#3b82f6',
      path: '/projectile-motion'
    },
    {
      id: 'newtons',
      title: "Newton's Laws",
      description:
        "Interactive force and motion simulations for Newton's three laws of motion.",
      icon: Zap,
      color: '#ef4444',
      path: '/newtons-laws',
      disabled: false
    },
    {
      id: 'energy',
      title: 'Work, Energy & Power',
      description:
        'Visualize work-energy relationships, energy transfer, and conservation principles.',
      icon: BatteryCharging,
      color: '#22c55e',
      path: '/work-energy-power',
      disabled: false
    },
    {
  id: 'momentum',
  title: 'Momentum & Collisions',
  description:
    'Investigate momentum conservation and collision behavior with dynamic feedback.',
  icon: Orbit,
  color: '#f59e0b',
  path: '/momentum-collisions',
  disabled: false
},
    {
  id: 'shm',
  title: 'Simple Harmonic Motion',
  description:
    'Study oscillatory motion, spring systems, and periodic behavior visually.',
  icon: Waves,
  color: '#8b5cf6',
  path: '/simple-harmonic-motion',
  disabled: false
}
  ]

  return (
    <div className="home-container">
      <div className="home-animated-bg">
        <span className="bg-glow glow-1"></span>
        <span className="bg-glow glow-2"></span>
        <span className="bg-glow glow-3"></span>
        <span className="grid-overlay"></span>
      </div>

      <header className="home-header">
        <span className="home-badge">Physics Simulation Platform</span>
        <h1>Classical Mechanics Simulator</h1>
        <p>
          A dark, interactive, and visually engaging environment for exploring
          introductory classical mechanics concepts through simulation.
        </p>
      </header>

      <section className="home-hero-panel">
        <div className="hero-copy">
          <h2>Learn mechanics through motion, interaction, and visual feedback</h2>
          <p>
            Launch simulations, explore changing parameters, and experience
            classical mechanics concepts in a more intuitive and engaging way.
          </p>
        </div>

        <div className="hero-stats">
          <div className="hero-stat-card">
            <strong>5</strong>
            <span>Core Modules</span>
          </div>
          <div className="hero-stat-card">
            <strong>Real-Time</strong>
            <span>Animation</span>
          </div>
          <div className="hero-stat-card">
            <strong>Interactive</strong>
            <span>Learning</span>
          </div>
        </div>
      </section>

      <section className="simulations-section">
        <div className="section-heading">
          <h2>Simulation Modules</h2>
          <p>Select a module to begin exploring.</p>
        </div>

        <div className="simulations-grid">
          {simulations.map((sim) => (
            <SimulationCard
              key={sim.id}
              title={sim.title}
              description={sim.description}
              icon={sim.icon}
              color={sim.color}
              onClick={() => !sim.disabled && navigate(sim.path)}
              disabled={sim.disabled}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home