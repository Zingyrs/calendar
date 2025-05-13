"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { motion } from "framer-motion"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Employee } from "@/types"

interface EmployeeSelectorProps {
  date: Date
  crew: string
  slot: number
  employees: Employee[]
  onSelect: (employee: Employee) => void
  onCancel: () => void
}

export function EmployeeSelector({ date, crew, slot, employees, onSelect, onCancel }: EmployeeSelectorProps) {
  const [search, setSearch] = useState("")

  const filteredEmployees = employees.filter((emp) => emp.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Выбор сотрудника</h2>
        <div className="text-sm text-muted-foreground mb-4">
          Дата: {format(date, "dd MMMM yyyy", { locale: ru })}, Бригада: {crew}, Слот: {slot + 1}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Поиск сотрудника..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto mb-4 border rounded-md">
          {filteredEmployees.length > 0 ? (
            <div className="divide-y">
              {filteredEmployees.map((employee) => (
                <button
                  key={employee.id}
                  className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center"
                  onClick={() => onSelect(employee)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{employee.name}</div>
                    {employee.position && <div className="text-sm text-muted-foreground">{employee.position}</div>}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              {employees.length === 0 ? "Нет доступных сотрудников" : "Сотрудники не найдены"}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
