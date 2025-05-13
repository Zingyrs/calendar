"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import type { Employee } from "@/types"

interface EmployeeAbsenceProps {
  employee: Employee
  onAddAbsence: (start: Date, end: Date, reason?: string) => void
  onRemoveAbsence: (index: number) => void
}

export function EmployeeAbsence({ employee, onAddAbsence, onRemoveAbsence }: EmployeeAbsenceProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [reason, setReason] = useState("")

  // Update the handleAddAbsence function to immediately reflect changes
  const handleAddAbsence = () => {
    if (startDate && endDate) {
      onAddAbsence(startDate, endDate, reason)

      // Reset form fields after adding
      setStartDate(undefined)
      setEndDate(undefined)
      setReason("")
    }
  }

  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="text-sm font-medium mb-3">Периоды отсутствия</h4>

      {/* List of existing absence periods */}
      {employee.absencePeriods && employee.absencePeriods.length > 0 ? (
        <div className="mb-4 space-y-2">
          {employee.absencePeriods.map((period, index) => (
            <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md text-sm">
              <div>
                <span className="font-medium">
                  {format(new Date(period.start), "dd.MM.yy", { locale: ru })} -{" "}
                  {format(new Date(period.end), "dd.MM.yy", { locale: ru })}
                </span>
                {period.reason && <span className="ml-2 text-muted-foreground">{period.reason}</span>}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={() => onRemoveAbsence(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground mb-4">Нет периодов отсутствия</div>
      )}

      {/* Add new absence period */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="text-xs mb-1">Начало</div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left text-sm">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd.MM.yy", { locale: ru }) : <span>Выберите...</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} locale={ru} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex-1">
            <div className="text-xs mb-1">Конец</div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left text-sm">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd.MM.yy", { locale: ru }) : <span>Выберите...</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  locale={ru}
                  disabled={(date) => (startDate ? date < startDate : false)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <div className="text-xs mb-1">Причина (необязательно)</div>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Отпуск, больничный и т.д."
            className="text-sm"
          />
        </div>

        <Button onClick={handleAddAbsence} disabled={!startDate || !endDate} size="sm" className="w-full gap-1">
          <Plus className="h-4 w-4" />
          Добавить период
        </Button>
      </div>
    </div>
  )
}
