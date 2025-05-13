"use client"

import { useState, useRef, useEffect, useCallback, useMemo, memo, ReactNode, ForwardedRef, forwardRef, RefObject } from "react"
import { motion, AnimatePresence, MotionProps, HTMLMotionProps } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Calendar as DatePickerCalendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { EmployeeSelector } from "@/components/employee-selector"
import { EmployeeManager } from "@/components/employee-manager"
import { useEmployees } from "@/hooks/use-employees"
import { useSchedule } from "@/hooks/use-schedule"
import { cn } from "@/lib/utils"

// Import the DnD libraries and new components
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { format, addDays, isSameDay, isWeekend } from "date-fns"
import { ru } from "date-fns/locale"
import { CalendarIcon, Users, Copy, FileSpreadsheet, Layers } from "lucide-react"

import { DateCopyDialog } from "@/components/date-copy-dialog"
import { CrewNote } from "@/components/crew-note"
import { Reports } from "@/components/reports"
import { useNotes } from "@/hooks/use-notes"
import { useCrews } from "@/hooks/use-crews"
import { CrewManager } from "@/components/crew-manager"
import type { Employee } from "@/types"

// Add DraggableEmployee component
interface DraggableEmployeeProps {
  employee: Employee | null
  date: Date
  crew: string
  slot: number
  onRemove: () => void
  isComplete: boolean
}

// Добавляем новый клиентский компонент для motion.div, чтобы избежать ошибок гидратации
interface ClientOnlyMotionDivProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
}

const ClientOnlyMotionDiv = forwardRef<HTMLDivElement, ClientOnlyMotionDivProps>(
  ({ children, ...props }, ref) => {
    const [isClient, setIsClient] = useState(false)
    
    useEffect(() => {
      setIsClient(true)
    }, [])
    
    if (!isClient) {
      return <div ref={ref} className={props.className}>{children}</div>
    }
    
    return <motion.div ref={ref} {...props}>{children}</motion.div>
  }
)

ClientOnlyMotionDiv.displayName = 'ClientOnlyMotionDiv';

function DraggableEmployee({ employee, date, crew, slot, onRemove, isComplete }: DraggableEmployeeProps) {
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: "EMPLOYEE",
      item: { employee, date, crew, slot },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      // Add custom preview
      end: (item, monitor) => {
        const didDrop = monitor.didDrop()
        if (!didDrop) {
          // If not dropped on a valid target, do nothing
        }
      },
    }),
    [employee, date, crew, slot],
  )

  // Use custom drag layer for better visual feedback
  useEffect(() => {
    if (typeof window !== "undefined") {
      const preview = document.getElementById("custom-drag-layer")
      if (preview && isDragging) {
        const updatePreview = (e: MouseEvent) => {
          preview.style.left = `${e.clientX}px`
          preview.style.top = `${e.clientY}px`
          preview.textContent = employee?.name || ""
          preview.style.display = "block"
        }

        const hidePreview = () => {
          preview.style.display = "none"
        }

        window.addEventListener("mousemove", updatePreview)
        window.addEventListener("mouseup", hidePreview)

        return () => {
          window.removeEventListener("mousemove", updatePreview)
          window.removeEventListener("mouseup", hidePreview)
          preview.style.display = "none"
        }
      }
    }
  }, [isDragging, employee])

  if (!employee) return null

  // Determine background color based on completion status
  const bgColor = isComplete ? "bg-green-100" : "bg-yellow-100"
  
  // Состояние для определения, загружен ли клиентский компонент
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Создаем функцию для передачи ref
  const setRef = useCallback((node: HTMLDivElement | null) => {
    if (typeof drag === 'function' && isMounted) {
      drag(node)
    }
  }, [drag, isMounted]);

  return (
    <ClientOnlyMotionDiv
      ref={setRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`w-full h-full flex items-center justify-center cursor-grab ${bgColor}`}
      onClick={onRemove}
    >
      {employee.name}
    </ClientOnlyMotionDiv>
  )
}

// Add DroppableCell component
interface DroppableCellProps {
  date: Date
  crew: string
  slot: number
  employee: Employee | null
  isAbsent: boolean
  onDrop: (item: any) => void
  onClick: () => void
  isWeekend: boolean
  isComplete: boolean
}

function DroppableCell({
  date,
  crew,
  slot,
  employee,
  isAbsent,
  onDrop,
  onClick,
  isWeekend,
  isComplete,
}: DroppableCellProps) {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "EMPLOYEE",
      drop: (item: any) => onDrop(item),
      canDrop: (item: any) => {
        // Can't drop if cell already has an employee or if it's the same cell
        if (employee) return false
        if (item.date === date && item.crew === crew && item.slot === slot) return false
        return true
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [date, crew, slot, employee],
  )

  // Состояние для определения, загружен ли клиентский компонент
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Создаем функцию для передачи ref
  const setRef = useCallback((node: HTMLDivElement | null) => {
    if (typeof drop === 'function' && isMounted) {
      drop(node)
    }
  }, [drop, isMounted])

  return (
    <div
      ref={setRef}
      className={cn(
        "flex-1 rounded cursor-pointer transition-all flex items-center justify-center text-xs",
        employee
          ? isComplete
            ? "bg-green-100 hover:bg-green-200"
            : "bg-yellow-100 hover:bg-yellow-200"
          : isOver && canDrop
            ? "bg-green-100 border border-dashed border-green-300"
            : isOver && !canDrop
              ? "bg-red-100 border border-dashed border-red-300"
              : isAbsent
                ? "bg-red-50 border border-dashed border-red-200"
                : isWeekend
                  ? "bg-amber-50 border border-dashed border-amber-200"
                  : "border border-dashed border-gray-200 hover:border-gray-300",
      )}
      onClick={onClick}
    >
      {employee ? (
        <MemoizedDraggableEmployee
          employee={employee}
          date={date}
          crew={crew}
          slot={slot}
          onRemove={onClick}
          isComplete={isComplete}
        />
      ) : (
        <span className="text-muted-foreground">+</span>
      )}
    </div>
  )
}

// Мемоизированный компонент ячейки
const MemoizedDraggableEmployee = memo(DraggableEmployee);
const MemoizedDroppableCell = memo(DroppableCell);

// Update the Calendar component
export function Calendar() {
  const [date, setDate] = useState<Date>(new Date())
  const [showEmployeeManager, setShowEmployeeManager] = useState(false)
  const [showCrewManager, setShowCrewManager] = useState(false)
  const [showReports, setShowReports] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{
    date: Date
    crew: string
    slot: number
  } | null>(null)
  const [copySourceDate, setCopySourceDate] = useState<Date | null>(null)
  const [initialLoad, setInitialLoad] = useState(true)
  
  // Состояние для управления видимым диапазоном дат
  const [visibleDateRange, setVisibleDateRange] = useState({
    start: -45, // начало диапазона (дней от текущей даты)
    end: 45,    // конец диапазона (дней от текущей даты)
  })

  const calendarRef = useRef<HTMLDivElement>(null)
  const { employees, addEmployee, removeEmployee, updateEmployee, isEmployeeAbsent } = useEmployees()
  const { schedule, assignEmployee, removeAssignment, copyScheduleFromDate, getScheduleForDateRange } = useSchedule()
  const { notes, saveNote, getNote } = useNotes()
  const { crews, addCrew, removeCrew, updateCrew } = useCrews()

  // Текущая дата для расчетов
  const currentDate = useMemo(() => new Date(), []);
  
  // Мемоизируем даты
  const dates = useMemo(() => Array.from(
    { length: visibleDateRange.end - visibleDateRange.start }, 
    (_, i) => addDays(currentDate, i + visibleDateRange.start)
  ), [visibleDateRange, currentDate]);

  // Мемоизируем обработчики событий
  const handleCellClick = useCallback((date: Date, crew: string, slot: number) => {
    // Check if slot is already filled
    const dateStr = format(date, "yyyy-MM-dd")
    const assignments = schedule[dateStr]?.[crew] || []

    if (assignments[slot]) {
      // If slot is filled, remove the assignment
      removeAssignment(date, crew, slot)
    } else {
      // Otherwise open selector
      setSelectedCell({ date, crew, slot })
    }
  }, [schedule, removeAssignment, setSelectedCell]);

  // Handle drop of employee tile
  const handleDrop = useCallback((targetDate: Date, targetCrew: string, targetSlot: number, item: any) => {
    if (item.employee) {
      // Remove from original position
      removeAssignment(item.date, item.crew, item.slot)

      // Add to new position
      assignEmployee(targetDate, targetCrew, targetSlot, item.employee)
    }
  }, [removeAssignment, assignEmployee]);

  // Обработчик скролла - memoized
  const handleCalendarScroll = useCallback(() => {
    if (!calendarRef.current) return

    const scrollElement = calendarRef.current
    const scrollPosition = scrollElement.scrollLeft
    const maxScroll = scrollElement.scrollWidth - scrollElement.clientWidth
    
    // Если пользователь прокрутил близко к левому краю, расширяем диапазон влево
    if (scrollPosition < 150) {
      setVisibleDateRange(prev => ({
        start: prev.start - 45, // Загружаем еще 45 дней в прошлое
        end: prev.end
      }))
    } 
    // Если пользователь прокрутил близко к правому краю, расширяем диапазон вправо
    else if (maxScroll - scrollPosition < 150) {
      setVisibleDateRange(prev => ({
        start: prev.start,
        end: prev.end + 45 // Загружаем еще 45 дней в будущее
      }))
    }
  }, [visibleDateRange, setVisibleDateRange]);

  // Get assigned employees for a specific date and crew
  const getAssignedEmployees = useCallback((date: Date, crew: string) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return schedule[dateStr]?.[crew] || [null, null]
  }, [schedule]);

  // Get employees available for assignment on a specific date
  const getAvailableEmployees = useCallback((date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    const assignedIds = Object.values(schedule[dateStr] || {})
      .flat()
      .filter(Boolean)
      .map((emp) => emp?.id)

    return employees.filter((emp) => {
      // Check if employee is already assigned on this date
      if (assignedIds.includes(emp.id)) return false

      // Check if employee is absent on this date
      if (emp.absencePeriods && emp.absencePeriods.length > 0) {
        const checkDate = date.getTime()
        return !emp.absencePeriods.some((period) => {
          const startDate = new Date(period.start).getTime()
          const endDate = new Date(period.end).getTime()
          return checkDate >= startDate && checkDate <= endDate
        })
      }

      return true
    })
  }, [schedule, employees]);

  // Check if employee is absent on a specific date
  const isEmployeeAbsentOnDate = useCallback((employeeId: string, date: Date) => {
    const employee = employees.find((emp) => emp.id === employeeId)
    if (!employee || !employee.absencePeriods) return false

    const checkDate = date.getTime()
    return employee.absencePeriods.some((period) => {
      const startDate = new Date(period.start).getTime()
      const endDate = new Date(period.end).getTime()
      return checkDate >= startDate && checkDate <= endDate
    })
  }, [employees]);

  // Handle saving a note for a crew on a specific date
  const handleSaveNote = useCallback((date: Date, crew: string, text: string) => {
    saveNote(date, crew, text)
  }, [saveNote]);

  // Check if a crew is complete (both slots filled)
  const isCrewComplete = useCallback((date: Date, crew: string) => {
    const assignedEmployees = getAssignedEmployees(date, crew)
    return assignedEmployees.every(Boolean)
  }, [getAssignedEmployees]);

  // Get crew color by name
  const getCrewColor = useCallback((crewName: string) => {
    const crew = crews.find((c) => c.name === crewName)
    return crew?.color || "#ffffff"
  }, [crews]);

  // Добавляем обработчик скролла
  useEffect(() => {
    const scrollElement = calendarRef.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleCalendarScroll)
      return () => scrollElement.removeEventListener('scroll', handleCalendarScroll)
    }
  }, [handleCalendarScroll])

  // Скролл к текущей дате при первой загрузке
  useEffect(() => {
    if (initialLoad && calendarRef.current) {
      const currentDate = new Date()
      const todayElement = calendarRef.current.querySelector(`[data-date="${format(currentDate, "yyyy-MM-dd")}"]`)
      
      if (todayElement) {
        // Используем requestAnimationFrame для гарантии, что DOM полностью загружен
        requestAnimationFrame(() => {
          todayElement.scrollIntoView({ behavior: "auto", block: "nearest", inline: "center" })
          setInitialLoad(false)
        })
      }
    }
  }, [initialLoad, dates]);

  // Scroll to selected date when user explicitly selects a date
  useEffect(() => {
    if (!initialLoad && date && calendarRef.current) {
      const dateIndex = dates.findIndex((d) => isSameDay(d, date))
      if (dateIndex >= 0) {
        const dateElement = calendarRef.current.querySelector(`[data-date="${format(date, "yyyy-MM-dd")}"]`)
        if (dateElement) {
          dateElement.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" })
        }
      }
    }
  }, [date, dates, initialLoad])

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        id="custom-drag-layer"
        className="fixed bg-blue-100 border border-blue-300 rounded px-2 py-1 text-xs pointer-events-none z-50"
        style={{ display: "none", transform: "translate(-50%, -50%)" }}
      />
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{format(date, "dd.MM.yy", { locale: ru })}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <DatePickerCalendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  locale={ru}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setShowReports(true)}>
              <FileSpreadsheet className="h-4 w-4" />
              <span>Отчеты</span>
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setShowCrewManager(true)}>
              <Layers className="h-4 w-4" />
              <span>Управление бригадами</span>
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setShowEmployeeManager(true)}>
              <Users className="h-4 w-4" />
              <span>Управление сотрудниками</span>
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="flex">
            {/* Fixed left column with crew names */}
            <div className="bg-muted border-r min-w-[80px]">
              <div className="h-12 border-b flex items-center justify-center font-medium">Бригады</div>
              {crews.map((crew) => (
                <div
                  key={crew.id}
                  className="h-16 border-b last:border-b-0 flex items-center justify-center font-medium"
                  style={{ backgroundColor: crew.color }}
                >
                  {crew.name}
                </div>
              ))}
            </div>

            {/* Scrollable calendar grid */}
            <div
              className="overflow-x-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
              ref={calendarRef}
            >
              <div className="flex min-w-max">
                {dates.map((currentDate) => {
                  const isWeekendDay = isWeekend(currentDate)

                  return (
                    <div
                      key={format(currentDate, "yyyy-MM-dd")}
                      data-date={format(currentDate, "yyyy-MM-dd")}
                      className={cn(
                        "min-w-[120px] border-r last:border-r-0", // Increased width from 100px to 120px
                        isSameDay(currentDate, new Date()) && "bg-blue-50",
                        isWeekendDay && "bg-amber-50",
                      )}
                    >
                      <div className="h-12 border-b flex flex-col items-center justify-center relative">
                        <div className="text-sm font-medium">{format(currentDate, "dd.MM.yy", { locale: ru })}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(currentDate, "EEE", { locale: ru })}
                        </div>

                        {/* Copy button - moved to not overlap with date */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 absolute right-2 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100"
                          onClick={() => setCopySourceDate(currentDate)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>

                      {crews.map((crew) => {
                        const assignedEmployees = getAssignedEmployees(currentDate, crew.name)
                        const note = getNote(currentDate, crew.name)
                        const crewComplete = isCrewComplete(currentDate, crew.name)

                        return (
                          <div
                            key={`${format(currentDate, "yyyy-MM-dd")}-${crew.name}`}
                            className="h-16 border-b last:border-b-0 p-1 flex flex-col gap-1 relative"
                          >
                            {/* Crew note - repositioned */}
                            <CrewNote note={note} onSave={(text) => handleSaveNote(currentDate, crew.name, text)} />

                            {[0, 1].map((slot) => {
                              const employee = assignedEmployees[slot]
                              const isAbsent = employee && isEmployeeAbsentOnDate(employee.id, currentDate)

                              if (isAbsent) {
                                // If employee is absent, remove them from the schedule
                                removeAssignment(currentDate, crew.name, slot)
                              }

                              return (
                                <MemoizedDroppableCell
                                  key={`${format(currentDate, "yyyy-MM-dd")}-${crew.name}-${slot}`}
                                  date={currentDate}
                                  crew={crew.name}
                                  slot={slot}
                                  employee={employee}
                                  isAbsent={false}
                                  onDrop={(item) => handleDrop(currentDate, crew.name, slot, item)}
                                  onClick={() => handleCellClick(currentDate, crew.name, slot)}
                                  isWeekend={isWeekendDay}
                                  isComplete={crewComplete}
                                />
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Employee selector modal */}
        <AnimatePresence>
          {selectedCell && (
            <EmployeeSelector
              date={selectedCell.date}
              crew={selectedCell.crew}
              slot={selectedCell.slot}
              employees={getAvailableEmployees(selectedCell.date)}
              onSelect={(employee) => {
                assignEmployee(selectedCell.date, selectedCell.crew, selectedCell.slot, employee)
                setSelectedCell(null)
              }}
              onCancel={() => setSelectedCell(null)}
            />
          )}
        </AnimatePresence>

        {/* Employee manager modal */}
        <AnimatePresence>
          {showEmployeeManager && (
            <EmployeeManager
              employees={employees}
              onAdd={addEmployee}
              onRemove={removeEmployee}
              onUpdate={updateEmployee}
              onClose={() => setShowEmployeeManager(false)}
            />
          )}
        </AnimatePresence>

        {/* Crew manager modal */}
        <AnimatePresence>
          {showCrewManager && (
            <CrewManager
              crews={crews}
              onAdd={addCrew}
              onRemove={removeCrew}
              onUpdate={updateCrew}
              onClose={() => setShowCrewManager(false)}
            />
          )}
        </AnimatePresence>

        {/* Date copy dialog */}
        <AnimatePresence>
          {copySourceDate && (
            <DateCopyDialog
              sourceDate={copySourceDate}
              onCopy={(targetDate) => {
                copyScheduleFromDate(copySourceDate, targetDate)
                setCopySourceDate(null)
              }}
              onCancel={() => setCopySourceDate(null)}
            />
          )}
        </AnimatePresence>

        {/* Reports dialog */}
        <AnimatePresence>
          {showReports && (
            <Reports
              getScheduleForDateRange={getScheduleForDateRange}
              crews={crews.map((c) => c.name)}
              onClose={() => setShowReports(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  )
}
