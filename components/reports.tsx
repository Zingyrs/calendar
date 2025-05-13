"use client"

import { useState } from "react"
import { format, eachDayOfInterval } from "date-fns"
import { ru } from "date-fns/locale"
import { motion } from "framer-motion"
import { CalendarIcon, FileSpreadsheet, X } from "lucide-react"
import * as XLSX from "xlsx"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ReportsProps {
  getScheduleForDateRange: (startDate: Date, endDate: Date) => Record<string, any>
  crews: string[]
  onClose: () => void
}

export function Reports({ getScheduleForDateRange, crews, onClose }: ReportsProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  // Fix Excel export functionality by updating the generateExcelReport function
  const generateExcelReport = () => {
    if (!startDate || !endDate) return

    try {
      // Get schedule data for the selected date range
      const scheduleData = getScheduleForDateRange(startDate, endDate)

      // Generate all dates in the range
      const dateRange = eachDayOfInterval({ start: startDate, end: endDate })

      // Prepare data for Excel
      const workbook = XLSX.utils.book_new()

      // Create worksheet data
      const worksheetData: any[][] = []

      // Header row with dates
      const headerRow = ["Бригада"]
      dateRange.forEach((date) => {
        headerRow.push(format(date, "dd.MM.yy", { locale: ru }))
      })
      worksheetData.push(headerRow)

      // Data rows for each crew
      crews.forEach((crew) => {
        const crewRow = [crew]

        dateRange.forEach((date) => {
          const dateStr = format(date, "yyyy-MM-dd")
          const assignments = scheduleData[dateStr]?.[crew] || [null, null]

          // Format cell content
          const cellContent = assignments
            .filter(Boolean)
            .map((emp: any) => emp?.name)
            .join(", ")

          crewRow.push(cellContent || "—")
        })

        worksheetData.push(crewRow)
      })

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "График выходов")

      // Generate Excel file as a blob and trigger download
      // This is the browser-compatible approach instead of using writeFile
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      // Create download link and trigger it
      const fileName = `График_выходов_${format(startDate, "dd.MM.yy")}-${format(endDate, "dd.MM.yy")}.xlsx`
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 0)
    } catch (error) {
      console.error("Error generating Excel report:", error)
      alert("Произошла ошибка при создании отчета. Пожалуйста, попробуйте еще раз.")
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
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Отчеты</h2>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Выберите период для отчета</h3>

            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <div className="text-xs mb-1">Начало периода</div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd.MM.yy", { locale: ru }) : <span>Выберите дату...</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} locale={ru} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1">
                <div className="text-xs mb-1">Конец периода</div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd.MM.yy", { locale: ru }) : <span>Выберите дату...</span>}
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
          </div>

          <Button onClick={generateExcelReport} disabled={!startDate || !endDate} className="w-full gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Скачать отчет в Excel
          </Button>

          <div className="text-sm text-muted-foreground mt-2">
            Отчет будет содержать информацию о выходах сотрудников по бригадам за выбранный период.
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
