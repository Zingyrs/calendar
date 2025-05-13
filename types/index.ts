export interface Employee {
  id: string
  name: string
  position?: string
  absencePeriods?: {
    start: string // ISO date string
    end: string // ISO date string
    reason?: string
  }[]
}

export interface CrewNote {
  text: string
  updatedAt: string // ISO date string
}

export interface ScheduleData {
  [date: string]: {
    [crew: string]: (Employee | null)[]
  }
}

export interface NotesData {
  [date: string]: {
    [crew: string]: CrewNote
  }
}

export interface Crew {
  id: string
  name: string
  color: string
}
