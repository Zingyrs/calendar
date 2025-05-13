"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Trash2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Employee } from "@/types"
// Import the EmployeeAbsence component
import { EmployeeAbsence } from "@/components/employee-absence"

interface EmployeeManagerProps {
  employees: Employee[]
  onAdd: (employee: Omit<Employee, "id">) => void
  onRemove: (id: string) => void
  onUpdate: (employee: Employee) => void
  onClose: () => void
}

// Update the component to fix overflow and add absence management
export function EmployeeManager({ employees, onAdd, onRemove, onUpdate, onClose }: EmployeeManagerProps) {
  const [newEmployee, setNewEmployee] = useState({ name: "", position: "" })
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  const handleAddEmployee = () => {
    if (newEmployee.name.trim()) {
      onAdd(newEmployee)
      setNewEmployee({ name: "", position: "" })
    }
  }

  const handleUpdateEmployee = () => {
    if (editingEmployee && editingEmployee.name.trim()) {
      onUpdate(editingEmployee)
      setEditingEmployee(null)
    }
  }

  // Update the handleAddAbsence function to immediately reflect changes
  const handleAddAbsence = (employeeId: string, start: Date, end: Date, reason?: string) => {
    const employee = employees.find((emp) => emp.id === employeeId)
    if (employee) {
      const absencePeriods = employee.absencePeriods || []
      const updatedEmployee = {
        ...employee,
        absencePeriods: [...absencePeriods, { start: start.toISOString(), end: end.toISOString(), reason }],
      }

      // Update the employee immediately
      onUpdate(updatedEmployee)

      // Update the selected employee state to reflect changes
      setSelectedEmployee(updatedEmployee)
    }
  }

  // Update the handleRemoveAbsence function to immediately reflect changes
  const handleRemoveAbsence = (employeeId: string, index: number) => {
    const employee = employees.find((emp) => emp.id === employeeId)
    if (employee && employee.absencePeriods) {
      const newAbsencePeriods = [...employee.absencePeriods]
      newAbsencePeriods.splice(index, 1)

      const updatedEmployee = {
        ...employee,
        absencePeriods: newAbsencePeriods,
      }

      // Update the employee immediately
      onUpdate(updatedEmployee)

      // Update the selected employee state to reflect changes
      setSelectedEmployee(updatedEmployee)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-6">Управление сотрудниками</h2>

        {selectedEmployee ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{selectedEmployee.name}</h3>
              <Button variant="outline" size="sm" onClick={() => setSelectedEmployee(null)}>
                Назад к списку
              </Button>
            </div>

            <EmployeeAbsence
              employee={selectedEmployee}
              onAddAbsence={(start, end, reason) => handleAddAbsence(selectedEmployee.id, start, end, reason)}
              onRemoveAbsence={(index) => handleRemoveAbsence(selectedEmployee.id, index)}
            />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Добавить сотрудника</h3>
              <div className="flex gap-3">
                <Input
                  placeholder="Имя сотрудника"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="flex-1"
                />
                <Input
                  placeholder="Должность (необязательно)"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                  className="flex-1"
                />
                <Button onClick={handleAddEmployee}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Список сотрудников</h3>
              <div className="border rounded-md overflow-hidden">
                {employees.length > 0 ? (
                  <div className="divide-y">
                    {employees.map((employee) => (
                      <div key={employee.id} className="p-3 flex items-center gap-3">
                        {editingEmployee?.id === employee.id ? (
                          <>
                            <Input
                              value={editingEmployee.name}
                              onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                              className="flex-1"
                            />
                            <Input
                              value={editingEmployee.position || ""}
                              onChange={(e) => setEditingEmployee({ ...editingEmployee, position: e.target.value })}
                              className="flex-1"
                            />
                            <Button size="sm" onClick={handleUpdateEmployee}>
                              <Save className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="flex-1">
                              <div className="font-medium">{employee.name}</div>
                              {employee.position && (
                                <div className="text-sm text-muted-foreground">{employee.position}</div>
                              )}
                              {employee.absencePeriods && employee.absencePeriods.length > 0 && (
                                <div className="text-xs text-red-500 mt-1">
                                  Периоды отсутствия: {employee.absencePeriods.length}
                                </div>
                              )}
                            </div>
                            <Button size="sm" variant="outline" onClick={() => setSelectedEmployee(employee)}>
                              Отсутствия
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingEmployee(employee)}>
                              Изменить
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => onRemove(employee.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">Список сотрудников пуст</div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end">
          <Button onClick={onClose}>Закрыть</Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
