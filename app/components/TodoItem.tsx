'use client'

import { useState } from 'react'
import { useUpdateTodo, useDeleteTodo, Todo } from '../hooks/useTodos'

interface TodoItemProps {
  todo: Todo
}

export default function TodoItem({ todo }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  
  const updateTodo = useUpdateTodo()
  const deleteTodo = useDeleteTodo()

  const handleToggleComplete = () => {
    updateTodo.mutate({
      id: todo.id,
      completed: !todo.completed,
    })
  }

  const handleEdit = () => {
    if (editTitle.trim()) {
      updateTodo.mutate({
        id: todo.id,
        title: editTitle.trim(),
      })
      setIsEditing(false)
    }
  }

  const handleDelete = () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteTodo.mutate(todo.id)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEdit()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setEditTitle(todo.title)
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-white shadow-sm">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggleComplete}
        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        disabled={updateTodo.isPending}
      />
      
      <div className="flex-1">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleEdit}
            className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <span
            className={`${
              todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
            } cursor-pointer`}
            onDoubleClick={() => setIsEditing(true)}
          >
            {todo.title}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
          disabled={updateTodo.isPending || deleteTodo.isPending}
        >
          {isEditing ? '취소' : '수정'}
        </button>
        <button
          onClick={handleDelete}
          className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
          disabled={updateTodo.isPending || deleteTodo.isPending}
        >
          삭제
        </button>
      </div>

      {(updateTodo.isPending || deleteTodo.isPending) && (
        <div className="text-sm text-gray-500">처리 중...</div>
      )}
    </div>
  )
} 