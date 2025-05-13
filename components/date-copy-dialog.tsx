"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { motion } from "framer-motion"
import { CalendarIcon, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateCopyDialogProps {
  sourceDate: Date
  onCopy: (targetDate: Date) => void
  onCancel: () => void
}

export function DateCopyDialog({ sourceDate, onCopy, onCancel }: DateCopyDialogProps) {
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined)

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
        <h2 className="text-xl font-bold mb-4">Копирование расписания</h2>
        <div className="text-sm text-muted-foreground mb-4">
          Копировать расписание с даты {format(sourceDate, "dd.MM.yy", { locale: ru })}
        </div>

        <div className="mb-6">
          <div className="text-sm font-medium mb-2">Выберите дату назначения:</div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {targetDate ? format(targetDate, "dd.MM.yy", { locale: ru }) : <span>Выберите дату...</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={targetDate} onSelect={setTargetDate} locale={ru} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button onClick={() => targetDate && onCopy(targetDate)} disabled={!targetDate} className="gap-2">
            <Copy className="h-4 w-4" />
            Копировать
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
