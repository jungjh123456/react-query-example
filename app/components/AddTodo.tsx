'use client'

import { useState } from 'react'
import { useCreateTodo } from '../hooks/useTodos'

export default function AddTodo() {
  const [title, setTitle] = useState('')
  const createTodo = useCreateTodo()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (title.trim()) {
      createTodo.mutate(
        {
          title: title.trim(),
          completed: false,
        },
        {
          onSuccess: () => {
            setTitle('')
          },
        }
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="새로운 할 일을 입력하세요..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={createTodo.isPending}
        />
        <button
          type="submit"
          disabled={!title.trim() || createTodo.isPending}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createTodo.isPending ? '추가 중...' : '추가'}
        </button>
      </div>
      
      {createTodo.isError && (
        <div className="mt-2 text-sm text-red-600">
          할 일 추가 중 오류가 발생했습니다.
        </div>
      )}
    </form>
  )
} 