import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const unwrapError = (error, fallback) => {
  console.error('API Error:', error)
  return new Error(error.response?.data?.detail || fallback)
}

export const calculateProjectile = async (params) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/calculate`, {
      angle: params.angle,
      velocity: params.velocity,
      gravity: params.gravity,
      initialHeight: params.initialHeight,
      airResistance: params.airResistance,
      mass: params.mass,
      diameter: params.diameter,
      dragCoefficient: params.dragCoefficient,
      objectType: params.objectType,
      compareIdealPath: params.compareIdealPath
    })
    return response.data
  } catch (error) {
    throw unwrapError(error, 'Failed to calculate trajectory')
  }
}

export const calculateNewtonLaw = async (params) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/newton/calculate`, params)
    return response.data
  } catch (error) {
    throw unwrapError(error, "Failed to calculate Newton's Law simulation")
  }
}

export const calculateWorkEnergyPower = async (params) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/work-energy/calculate`, params)
    return response.data
  } catch (error) {
    throw unwrapError(error, 'Failed to calculate Work, Energy & Power simulation')
  }
}

export const calculateMomentumCollision = async (params) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/momentum/calculate`, params)
    return response.data
  } catch (error) {
    throw unwrapError(error, 'Failed to calculate Momentum & Collisions simulation')
  }
}

export const calculateSHM = async (params) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/shm/calculate`, params)
    return response.data
  } catch (error) {
    throw unwrapError(error, 'Failed to calculate Simple Harmonic Motion simulation')
  }
}