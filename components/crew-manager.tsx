"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Trash2, Save, X, Palette } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Crew } from "@/types"

// Определяем 10 стандартных цветов
const standardColors = [
  "#FF5252", // ярко-красный
  "#4CAF50", // зеленый
  "#2196F3", // синий
  "#FFC107", // янтарный
  "#9C27B0", // фиолетовый
  "#00BCD4", // голубой
  "#FF9800", // оранжевый
  "#607D8B", // сине-серый
  "#8BC34A", // светло-зеленый
  "#E91E63"  // розовый
]

interface CrewManagerProps {
  crews: Crew[]
  onAdd: (crew: Omit<Crew, "id">) => void
  onRemove: (id: string) => void
  onUpdate: (crew: Crew) => void
  onClose: () => void
}

export function CrewManager({ crews, onAdd, onRemove, onUpdate, onClose }: CrewManagerProps) {
  const [newCrew, setNewCrew] = useState<Omit<Crew, "id">>({ name: "", color: standardColors[0] })
  const [editingCrew, setEditingCrew] = useState<Crew | null>(null)

  const handleAddCrew = () => {
    if (newCrew.name.trim()) {
      onAdd(newCrew)
      setNewCrew({ name: "", color: standardColors[0] })
    }
  }

  const handleUpdateCrew = () => {
    if (editingCrew && editingCrew.name.trim()) {
      onUpdate(editingCrew)
      setEditingCrew(null)
    }
  }

  // Компонент выбора цвета из палитры
  const ColorPalette = ({ 
    selectedColor, 
    onColorSelect 
  }: { 
    selectedColor: string, 
    onColorSelect: (color: string) => void 
  }) => {
    return (
      <div className="grid grid-cols-5 gap-2 p-2">
        {standardColors.map((color) => (
          <div 
            key={color} 
            className={`w-8 h-8 rounded-full cursor-pointer border-2 ${selectedColor === color ? 'border-gray-700' : 'border-transparent'}`}
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect(color)}
          />
        ))}
      </div>
    )
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
        className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Управление бригадами</h2>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Добавить бригаду</h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <div className="text-sm mb-1">Название бригады</div>
              <Input
                placeholder="Название бригады"
                value={newCrew.name}
                onChange={(e) => setNewCrew({ ...newCrew, name: e.target.value })}
              />
            </div>

            <div className="w-24">
              <div className="text-sm mb-1">Цвет</div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full h-10" style={{ backgroundColor: newCrew.color }}>
                    <Palette className="h-4 w-4 mr-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <ColorPalette 
                    selectedColor={newCrew.color} 
                    onColorSelect={(color) => setNewCrew({ ...newCrew, color })} 
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button onClick={handleAddCrew}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Список бригад</h3>
          <div className="border rounded-md overflow-hidden">
            {crews.length > 0 ? (
              <div className="divide-y">
                {crews.map((crew) => (
                  <div key={crew.id} className="p-3 flex items-center gap-3">
                    {editingCrew?.id === crew.id ? (
                      <>
                        <Input
                          value={editingCrew.name}
                          onChange={(e) => setEditingCrew({ ...editingCrew, name: e.target.value })}
                          className="flex-1"
                        />

                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-16 h-10"
                              style={{ backgroundColor: editingCrew.color }}
                            >
                              <Palette className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <ColorPalette 
                              selectedColor={editingCrew.color} 
                              onColorSelect={(color) => setEditingCrew({ ...editingCrew, color })} 
                            />
                          </PopoverContent>
                        </Popover>

                        <Button size="sm" onClick={handleUpdateCrew}>
                          <Save className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="w-6 h-6 rounded-full mr-2" style={{ backgroundColor: crew.color }} />
                        <div className="flex-1 font-medium">{crew.name}</div>
                        <Button size="sm" variant="ghost" onClick={() => setEditingCrew(crew)}>
                          Изменить
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => onRemove(crew.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">Список бригад пуст</div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Закрыть</Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
