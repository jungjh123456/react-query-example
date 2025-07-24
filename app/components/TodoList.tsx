'use client'

import { useTodos } from '../hooks/useTodos'
import TodoItem from './TodoItem'

export default function TodoList() {
  const { data: todos, isLoading, error, isError } = useTodos()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-600">할 일 목록을 불러오는 중...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-600">
          할 일 목록을 불러오는 중 오류가 발생했습니다.
          {error && <div className="text-sm mt-1">{error.message}</div>}
        </div>
      </div>
    )
  }

  if (!todos || todos.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">할 일이 없습니다. 새로운 할 일을 추가해보세요!</div>
      </div>
    )
  }

  const completedCount = todos.filter(todo => todo.completed).length
  const totalCount = todos.length

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>전체: {totalCount}개</span>
        <span>완료: {completedCount}개</span>
        <span>진행률: {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%</span>
      </div>
      
      <div className="space-y-3">
        {todos.map(todo => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  )
} 