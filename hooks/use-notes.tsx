"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import type { NotesData, CrewNote } from "@/types"

export function useNotes() {
  const [notes, setNotes] = useState<NotesData>(() => {
    // Load from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("crewNotes")
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })

  // Save to localStorage when notes change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("crewNotes", JSON.stringify(notes))
    }
  }, [notes])

  const saveNote = (date: Date, crew: string, text: string) => {
    const dateStr = format(date, "yyyy-MM-dd")

    setNotes((prev) => {
      const newNotes = { ...prev }

      // Initialize date if it doesn't exist
      if (!newNotes[dateStr]) {
        newNotes[dateStr] = {}
      }

      // Save note with timestamp
      newNotes[dateStr][crew] = {
        text,
        updatedAt: new Date().toISOString(),
      }

      return newNotes
    })
  }

  const getNote = (date: Date, crew: string): CrewNote | undefined => {
    const dateStr = format(date, "yyyy-MM-dd")
    return notes[dateStr]?.[crew]
  }

  return {
    notes,
    saveNote,
    getNote,
  }
}
