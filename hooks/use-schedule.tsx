"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import type { Employee, ScheduleData } from "@/types"

export function useSchedule() {
  const [schedule, setSchedule] = useState<ScheduleData>(() => {
    // Load from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("schedule")
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })

  // Save to localStorage when schedule changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("schedule", JSON.stringify(schedule))
    }
  }, [schedule])

  const assignEmployee = (date: Date, crew: string, slot: number, employee: Employee) => {
    const dateStr = format(date, "yyyy-MM-dd")

    setSchedule((prev) => {
      const newSchedule = { ...prev }

      // Initialize date and crew if they don't exist
      if (!newSchedule[dateStr]) {
        newSchedule[dateStr] = {}
      }

      if (!newSchedule[dateStr][crew]) {
        newSchedule[dateStr][crew] = [null, null]
      }

      // Assign employee to the slot
      newSchedule[dateStr][crew][slot] = employee

      return newSchedule
    })
  }

  const removeAssignment = (date: Date, crew: string, slot: number) => {
    const dateStr = format(date, "yyyy-MM-dd")

    setSchedule((prev) => {
      // If date or crew doesn't exist, nothing to remove
      if (!prev[dateStr] || !prev[dateStr][crew]) {
        return prev
      }

      const newSchedule = { ...prev }
      newSchedule[dateStr] = { ...newSchedule[dateStr] }
      newSchedule[dateStr][crew] = [...newSchedule[dateStr][crew]]
      newSchedule[dateStr][crew][slot] = null

      return newSchedule
    })
  }

  const copyScheduleFromDate = (sourceDate: Date, targetDate: Date) => {
    const sourceDateStr = format(sourceDate, "yyyy-MM-dd")
    const targetDateStr = format(targetDate, "yyyy-MM-dd")

    if (!schedule[sourceDateStr]) {
      return // Nothing to copy
    }

    setSchedule((prev) => {
      const newSchedule = { ...prev }
      newSchedule[targetDateStr] = JSON.parse(JSON.stringify(schedule[sourceDateStr]))
      return newSchedule
    })
  }

  const getScheduleForDateRange = (startDate: Date, endDate: Date) => {
    const result: Record<string, any> = {}

    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, "yyyy-MM-dd")
      if (schedule[dateStr]) {
        result[dateStr] = schedule[dateStr]
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return result
  }

  return {
    schedule,
    assignEmployee,
    removeAssignment,
    copyScheduleFromDate,
    getScheduleForDateRange,
  }
}
