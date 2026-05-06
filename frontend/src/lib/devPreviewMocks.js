const now = new Date()
const plusMinutes = (mins) => new Date(now.getTime() + mins * 60000).toISOString()

export const mockCurrentUser = {
  id: 1001,
  email: 'preview@comfymind.local',
  full_name: 'Preview Therapist',
  type: 'therapist'
}

export const mockUsers = [
  mockCurrentUser,
  { id: 2001, email: 'patient1@comfymind.local', full_name: 'Preview Patient', type: 'patient' },
  { id: 2002, email: 'patient2@comfymind.local', full_name: 'Preview Patient 2', type: 'patient' }
]

export const mockSession = {
  id: 9001,
  patient_id: 2001,
  therapist_id: 1001,
  start_date: plusMinutes(30),
  end_date: plusMinutes(90),
  ended_at: null
}
