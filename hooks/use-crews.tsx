"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import type { Crew } from "@/types"

// Sample initial data
const initialCrews: Crew[] = [
  { id: "1", name: "Кр1", color: "#f8e3b2" },
  { id: "2", name: "Кр2", color: "#b2f8e3" },
  { id: "3", name: "Кр3", color: "#e3b2f8" },
  { id: "4", name: "Кр4", color: "#b2e3f8" },
  { id: "5", name: "Кр5", color: "#f8b2e3" },
  { id: "6", name: "Кр6", color: "#e3f8b2" },
  { id: "7", name: "Кр7", color: "#f8b2b2" },
  { id: "8", name: "Кр8", color: "#b2b2f8" },
  { id: "9", name: "Кр9", color: "#f8f8b2" },
  { id: "10", name: "Кр10", color: "#b2f8b2" },
]

export function useCrews() {
  const [crews, setCrews] = useState<Crew[]>(() => {
    // Load from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("crews")
      return saved ? JSON.parse(saved) : initialCrews
    }
    return initialCrews
  })

  // Save to localStorage when crews change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("crews", JSON.stringify(crews))
    }
  }, [crews])

  const addCrew = (crew: Omit<Crew, "id">) => {
    const newCrew = {
      ...crew,
      id: uuidv4(),
    }
    setCrews([...crews, newCrew])
  }

  const removeCrew = (id: string) => {
    setCrews(crews.filter((crew) => crew.id !== id))
  }

  const updateCrew = (updatedCrew: Crew) => {
    setCrews(crews.map((crew) => (crew.id === updatedCrew.id ? updatedCrew : crew)))
  }

  return {
    crews,
    addCrew,
    removeCrew,
    updateCrew,
  }
}
