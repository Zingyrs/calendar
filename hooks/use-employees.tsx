"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import type { Employee } from "@/types"

// Sample initial data
const initialEmployees: Employee[] = [
  { id: "1", name: "Иванов Иван", position: "Электромонтер" },
  { id: "2", name: "Петров Петр", position: "Электромонтер" },
  { id: "3", name: "Сидоров Алексей", position: "Электромонтер" },
  { id: "4", name: "Смирнова Ольга", position: "Электромонтер" },
  { id: "5", name: "Козлов Дмитрий", position: "Электромонтер" },
  { id: "6", name: "Новикова Анна", position: "Электромонтер" },
  { id: "7", name: "Морозов Сергей", position: "Электромонтер" },
  { id: "8", name: "Волкова Елена", position: "Электромонтер" },
]

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    // Load from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("employees")
      return saved ? JSON.parse(saved) : initialEmployees
    }
    return initialEmployees
  })

  // Save to localStorage when employees change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("employees", JSON.stringify(employees))
    }
  }, [employees])

  const addEmployee = (employee: Omit<Employee, "id">) => {
    const newEmployee = {
      ...employee,
      id: uuidv4(),
    }
    setEmployees([...employees, newEmployee])
  }

  const removeEmployee = (id: string) => {
    setEmployees(employees.filter((emp) => emp.id !== id))
  }

  const updateEmployee = (updatedEmployee: Employee) => {
    setEmployees(employees.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp)))
  }

  const addAbsencePeriod = (employeeId: string, start: Date, end: Date, reason?: string) => {
    setEmployees(
      employees.map((emp) => {
        if (emp.id === employeeId) {
          const absencePeriods = emp.absencePeriods || []
          return {
            ...emp,
            absencePeriods: [
              ...absencePeriods,
              {
                start: start.toISOString(),
                end: end.toISOString(),
                reason,
              },
            ],
          }
        }
        return emp
      }),
    )
  }

  const removeAbsencePeriod = (employeeId: string, index: number) => {
    setEmployees(
      employees.map((emp) => {
        if (emp.id === employeeId && emp.absencePeriods) {
          const newAbsencePeriods = [...emp.absencePeriods]
          newAbsencePeriods.splice(index, 1)
          return {
            ...emp,
            absencePeriods: newAbsencePeriods,
          }
        }
        return emp
      }),
    )
  }

  const isEmployeeAbsent = (employeeId: string, date: Date): boolean => {
    const employee = employees.find((emp) => emp.id === employeeId)
    if (!employee || !employee.absencePeriods) return false

    const checkDate = date.getTime()
    return employee.absencePeriods.some((period) => {
      const startDate = new Date(period.start).getTime()
      const endDate = new Date(period.end).getTime()
      return checkDate >= startDate && checkDate <= endDate
    })
  }

  return {
    employees,
    addEmployee,
    removeEmployee,
    updateEmployee,
    addAbsencePeriod,
    removeAbsencePeriod,
    isEmployeeAbsent,
  }
}
