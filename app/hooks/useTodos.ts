import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// 타입 정의
export interface Todo {
  id: number
  title: string
  completed: boolean
}

// API 함수들
const fetchTodos = async (): Promise<Todo[]> => {
  const response = await fetch('/api/todos')
  if (!response.ok) {
    throw new Error('Failed to fetch todos')
  }
  return response.json()
}

const createTodo = async (todo: Omit<Todo, 'id'>): Promise<Todo> => {
  const response = await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todo),
  })
  if (!response.ok) {
    throw new Error('Failed to create todo')
  }
  return response.json()
}

const updateTodo = async ({ id, ...todo }: Partial<Todo> & { id: number }): Promise<Todo> => {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todo),
  })
  if (!response.ok) {
    throw new Error('Failed to update todo')
  }
  return response.json()
}

const deleteTodo = async (id: number): Promise<Todo> => {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete todo')
  }
  return response.json()
}

// 커스텀 훅들
export const useTodos = () => {
  return useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  })
}

export const useCreateTodo = () => {
  const queryClient = useQueryClient()
  
  return useMutation<Todo, Error, Omit<Todo, 'id'>>({
    mutationFn: createTodo,
    onSuccess: () => {
      // 성공 시 todos 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export const useUpdateTodo = () => {
  const queryClient = useQueryClient()
  
  return useMutation<Todo, Error, Partial<Todo> & { id: number }>({
    mutationFn: updateTodo,
    onMutate: async (updatedTodo) => {
      // 이전 데이터 백업
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos'])
      
      // 낙관적 업데이트
      queryClient.setQueryData<Todo[]>(['todos'], (old) =>
        old?.map(todo =>
          todo.id === updatedTodo.id ? { ...todo, ...updatedTodo } : todo
        )
      )
      
      return { previousTodos }
    },
    onError: (err, updatedTodo, context) => {
      // 에러 시 이전 데이터로 롤백
      const typedContext = context as { previousTodos?: Todo[] } | undefined
      if (typedContext?.previousTodos) {
        queryClient.setQueryData(['todos'], typedContext.previousTodos)
      }
    },
    onSettled: () => {
      // 완료 후 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export const useDeleteTodo = () => {
  const queryClient = useQueryClient()
  
  return useMutation<Todo, Error, number>({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
} 