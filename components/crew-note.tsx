"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useDragControls } from "framer-motion"
import { StickyNote, Save, GripHorizontal, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { CrewNote as CrewNoteType } from "@/types"

interface CrewNoteProps {
  note?: CrewNoteType
  onSave: (text: string) => void
}

export function CrewNote({ note, onSave }: CrewNoteProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(note?.text || "")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const noteButtonRef = useRef<HTMLButtonElement>(null)
  const dragControls = useDragControls()
  
  // Используем offset вместо position для более точного позиционирования
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isEditing])

  // Update text when note changes
  useEffect(() => {
    setText(note?.text || "")
  }, [note])

  // Сбросить позицию при открытии
  useEffect(() => {
    if (isEditing) {
      setOffset({ x: 0, y: 0 })
    }
  }, [isEditing])

  const handleSave = () => {
    onSave(text)
    setIsEditing(false)
  }

  // Закрыть примечание при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isEditing && textareaRef.current) {
        // Проверяем что клик не по модальному окну или кнопке
        const noteModal = document.getElementById('note-modal')
        if (
          noteModal && 
          !noteModal.contains(event.target as Node) && 
          noteButtonRef.current && 
          !noteButtonRef.current.contains(event.target as Node)
        ) {
          setIsEditing(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isEditing])

  // Функция для начала перетаскивания
  const startDrag = (event: React.PointerEvent) => {
    event.preventDefault()
    dragControls.start(event)
  }

  // Базовая кнопка примечания
  const NoteButton = (
    <Button
      ref={noteButtonRef}
      variant="ghost"
      size="sm"
      className={`h-5 w-5 p-0 absolute right-1 top-1/2 -translate-y-1/2 ${note?.text ? 'bg-amber-200 border border-amber-400 rounded-full hover:bg-amber-300' : 'opacity-30 hover:opacity-100'} z-10`}
      onClick={() => setIsEditing(true)}
    >
      <StickyNote className={`h-3 w-3 ${note?.text ? 'text-amber-700' : ''}`} />
    </Button>
  )

  return (
    <>
      {!isEditing && !note?.text ? (
        NoteButton
      ) : !isEditing ? (
        <div className="group relative">
          {NoteButton}
  
          <div
            className="hidden group-hover:block absolute right-0 z-20 bg-white shadow-lg rounded-md p-2 w-[200px]"
            style={{ transform: "translate(calc(-100% + 15px), -100%)" }}
          >
            <div className="text-xs mb-1 font-medium">Примечание:</div>
            <div className="text-xs">{note?.text}</div>
          </div>
        </div>
      ) : null}
      
      {/* Модальное окно редактирования примечания в центре экрана */}
      <AnimatePresence>
        {isEditing && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
          >
            <motion.div
              id="note-modal"
              drag
              dragControls={dragControls}
              dragListener={false} 
              dragConstraints={{ left: -500, right: 500, top: -300, bottom: 300 }}
              dragElastic={0}
              dragMomentum={false} // Отключаем инерцию движения
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: offset.x,
                y: offset.y
              }}
              exit={{ opacity: 0, scale: 0.95 }}
              onDragEnd={(_, info) => {
                // Сохраняем смещение точно в том месте, где закончилось перетаскивание
                setOffset(current => ({
                  x: current.x + info.offset.x,
                  y: current.y + info.offset.y
                }))
              }}
              className="bg-white shadow-lg rounded-md w-[350px] max-w-[90vw] overflow-hidden"
            >
              {/* Заголовок с возможностью перетаскивания */}
              <div 
                className="bg-gray-100 p-2 flex justify-between items-center border-b cursor-move"
                onPointerDown={startDrag}
              >
                <div className="flex items-center text-sm font-medium">
                  <GripHorizontal className="h-4 w-4 mr-2 text-gray-500" />
                  Примечание
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={() => setIsEditing(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="p-3">
                <Textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Введите примечание..."
                  className="text-xs min-h-[100px] mb-3"
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setIsEditing(false)}>
                    Отмена
                  </Button>
                  <Button size="sm" className="h-8 text-xs gap-1" onClick={handleSave}>
                    <Save className="h-3 w-3" />
                    Сохранить
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
