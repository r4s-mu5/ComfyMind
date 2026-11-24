/**
 * @fileoverview Servicio de gestión de sesiones de terapia.
 * Proporciona funciones para crear, consultar, actualizar y finalizar sesiones.
 * @module sessionsService
 */

import axios from '@/plugins/axios'
import { isDemo } from '@/lib/demo/isDemo'
import { demoSessions } from '@/lib/demo/store'
import { API_URL } from '@/lib/config'


export const sessionsService = {
  /**
   * Obtiene la sesión activa del usuario actual.
   * @async
   * @returns {Promise<Object|null>} Sesión activa o null si no hay ninguna.
   */
  async getActiveSession() {
    if (isDemo) return demoSessions.getActiveSession()
    const token = localStorage.getItem('token')
    try {
      const response = await axios.get(`${API_URL}/sessions/active`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Obtiene la próxima sesión del usuario (activa o futura).
   * @async
   * @returns {Promise<Object|null>} Próxima sesión o null si no hay ninguna.
   */
  async getNextSession() {
    if (isDemo) return demoSessions.getNextSession()
    const token = localStorage.getItem('token')
    try {
      const response = await axios.get(`${API_URL}/sessions/next`, { 
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Finaliza una sesión (solo terapeuta).
   * @async
   * @param {number} sessionId - ID de la sesión a finalizar.
   * @returns {Promise<Object>} Sesión finalizada.
   */
  async endSession(sessionId) {
    if (isDemo) return demoSessions.endSession(sessionId)
    const token = localStorage.getItem('token')
    const response = await axios.post(`${API_URL}/sessions/end/${sessionId}`, null, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  /**
   * Obtiene información de una sesión por ID.
   * @async
   * @param {number} sessionId - ID de la sesión.
   * @returns {Promise<Object>} Datos de la sesión.
   */
  async getSession(sessionId) {
    if (isDemo) return demoSessions.getSession(sessionId)
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/sessions/session/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  /**
   * Obtiene todas las sesiones del usuario actual (como paciente o terapeuta).
   * @async
   * @returns {Promise<Array<Object>>} Lista de sesiones.
   */
  async getMySessions() {
    if (isDemo) return demoSessions.getMySessions()
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/sessions/my-sessions`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const payload = response.data
    if (Array.isArray(payload)) return payload
    if (payload && Array.isArray(payload.data)) return payload.data
    return []
  },

  /**
   * Crea una nueva sesión para un paciente (solo terapeuta).
   * @async
   * @param {number} patientId - ID del paciente.
   * @param {Object} sessionData - Datos de la sesión.
   * @param {string} sessionData.start_date - Fecha de inicio (ISO 8601).
   * @param {string} sessionData.end_date - Fecha de fin (ISO 8601).
   * @returns {Promise<Object>} Sesión creada.
   */
  async createSession(patientId, sessionData) {
    if (isDemo) return demoSessions.createSession(patientId, sessionData)
    const token = localStorage.getItem('token')
    const response = await axios.post(
      `${API_URL}/sessions/session/${patientId}`,
      sessionData,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  },

  /**
   * Elimina una sesión (solo terapeuta).
   * @async
   * @param {number} sessionId - ID de la sesión a eliminar.
   * @returns {Promise<Object>} Confirmación de eliminación.
   */
  async deleteSession(sessionId) {
    if (isDemo) return demoSessions.deleteSession(sessionId)
    const token = localStorage.getItem('token')
    const response = await axios.delete(`${API_URL}/sessions/session/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  /**
   * Actualiza una sesión existente.
   * @async
   * @param {number} sessionId - ID de la sesión.
   * @param {Object} sessionData - Nuevos datos de la sesión.
   * @returns {Promise<Object>} Sesión actualizada.
   */
  async updateSession(sessionId, sessionData) {
    if (isDemo) return demoSessions.updateSession(sessionId, sessionData)
    const token = localStorage.getItem('token')
    const response = await axios.put(
      `${API_URL}/sessions/session/${sessionId}`,
      sessionData,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  },

  /**
   * Obtiene todas las imágenes generadas durante una sesión.
   * @async
   * @param {number} sessionId - ID de la sesión.
   * @returns {Promise<Object>} Lista de imágenes de la sesión.
   */
  async getImagesForSession(sessionId) {
    if (isDemo) return demoSessions.getImagesForSession(sessionId)
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/sessions/sessions/${sessionId}/images`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  async getImagesNoSession(userId) {
    if (isDemo) return demoSessions.getImagesNoSession(userId)
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/users/users/${userId}/free-images`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  }

}