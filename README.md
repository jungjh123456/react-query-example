# React Query (TanStack Query) 완전 가이드

## 목차
1. [React Query란?](#react-query란)
2. [주요 개념](#주요-개념)
3. [설치 및 설정](#설치-및-설정)
4. [기본 사용법](#기본-사용법)
5. [고급 기능](#고급-기능)
6. [실전 예시](#실전-예시)
7. [모범 사례](#모범-사례)

## React Query란?

React Query는 React 애플리케이션에서 서버 상태를 관리하기 위한 강력한 라이브러리입니다. TanStack Query로도 알려져 있으며, 다음과 같은 기능을 제공합니다:

- **서버 상태 관리**: API 데이터의 캐싱, 동기화, 백그라운드 업데이트
- **로딩/에러 상태**: 자동으로 로딩과 에러 상태를 관리
- **캐시 관리**: 데이터를 자동으로 캐싱하고 무효화
- **백그라운드 업데이트**: 데이터를 백그라운드에서 자동으로 새로고침
- **낙관적 업데이트**: UI를 즉시 업데이트하고 서버 응답을 기다림

## 주요 개념

### 1. Query
- 서버에서 데이터를 가져오는 작업
- `useQuery` 훅을 사용하여 구현
- 자동 캐싱, 재시도, 백그라운드 업데이트 지원

### 2. Mutation
- 서버에 데이터를 보내는 작업 (POST, PUT, DELETE)
- `useMutation` 훅을 사용하여 구현
- 낙관적 업데이트, 에러 처리 지원

### 3. Query Client
- React Query의 핵심 객체
- 캐시 관리, 쿼리 무효화, 전역 설정 담당

### 4. Query Key
- 쿼리를 식별하는 고유한 키
- 배열 형태로 구성 (예: `['todos', { status: 'done' }]`)
- 캐시 키로도 사용됨

## 설치 및 설정

### 1. 패키지 설치
```bash
npm install @tanstack/react-query
# 또는
yarn add @tanstack/react-query
```

### 2. QueryClient 설정
```tsx
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분
            gcTime: 10 * 60 * 1000, // 10분
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### 3. 앱에 Provider 적용
```tsx
// app/layout.tsx
import Providers from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

## 기본 사용법

### 1. 데이터 가져오기 (useQuery)
```tsx
import { useQuery } from '@tanstack/react-query'

function TodoList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/api/todos').then(res => res.json()),
  })

  if (isLoading) return <div>로딩 중...</div>
  if (error) return <div>에러가 발생했습니다</div>

  return (
    <ul>
      {data?.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

### 2. 데이터 수정 (useMutation)
```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

function AddTodo() {
  const queryClient = useQueryClient()
  
  const mutation = useMutation({
    mutationFn: (newTodo) => {
      return fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo),
      }).then(res => res.json())
    },
    onSuccess: () => {
      // 성공 시 todos 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    mutation.mutate({
      title: formData.get('title'),
      completed: false,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="할 일을 입력하세요" />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? '추가 중...' : '추가'}
      </button>
    </form>
  )
}
```

## 고급 기능

### 1. 쿼리 키와 의존성
```tsx
// 동적 쿼리 키
const { data } = useQuery({
  queryKey: ['todo', todoId],
  queryFn: () => fetchTodo(todoId),
  enabled: !!todoId, // todoId가 있을 때만 실행
})

// 필터링된 쿼리
const { data } = useQuery({
  queryKey: ['todos', { status: 'done' }],
  queryFn: () => fetchTodos({ status: 'done' }),
})
```

### 2. 무한 쿼리 (Infinite Query)
```tsx
import { useInfiniteQuery } from '@tanstack/react-query'

function TodoList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['todos'],
    queryFn: ({ pageParam = 0 }) => fetchTodos({ page: pageParam }),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length : undefined
    },
  })

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.todos.map(todo => (
            <div key={todo.id}>{todo.title}</div>
          ))}
        </div>
      ))}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>
          {isFetchingNextPage ? '로딩 중...' : '더 보기'}
        </button>
      )}
    </div>
  )
}
```

### 3. 낙관적 업데이트
```tsx
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    // 이전 데이터 백업
    await queryClient.cancelQueries({ queryKey: ['todos'] })
    const previousTodos = queryClient.getQueryData(['todos'])
    
    // 낙관적 업데이트
    queryClient.setQueryData(['todos'], (old) => 
      old?.map(todo => 
        todo.id === newTodo.id ? { ...todo, ...newTodo } : todo
      )
    )
    
    return { previousTodos }
  },
  onError: (err, newTodo, context) => {
    // 에러 시 이전 데이터로 롤백
    queryClient.setQueryData(['todos'], context?.previousTodos)
  },
  onSettled: () => {
    // 완료 후 쿼리 무효화
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
})
```

### 4. 쿼리 프리페칭
```tsx
const queryClient = useQueryClient()

// 마우스 호버 시 데이터 프리페칭
const prefetchTodo = (todoId) => {
  queryClient.prefetchQuery({
    queryKey: ['todo', todoId],
    queryFn: () => fetchTodo(todoId),
  })
}
```

## 실전 예시

### Todo 앱 예시
```tsx
// hooks/useTodos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// API 함수들
const fetchTodos = async () => {
  const response = await fetch('/api/todos')
  if (!response.ok) throw new Error('Failed to fetch todos')
  return response.json()
}

const createTodo = async (todo) => {
  const response = await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todo),
  })
  if (!response.ok) throw new Error('Failed to create todo')
  return response.json()
}

const updateTodo = async ({ id, ...todo }) => {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todo),
  })
  if (!response.ok) throw new Error('Failed to update todo')
  return response.json()
}

const deleteTodo = async (id) => {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete todo')
  return response.json()
}

// 커스텀 훅들
export const useTodos = () => {
  return useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  })
}

export const useCreateTodo = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export const useUpdateTodo = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateTodo,
    onMutate: async (updatedTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      const previousTodos = queryClient.getQueryData(['todos'])
      
      queryClient.setQueryData(['todos'], (old) =>
        old?.map(todo =>
          todo.id === updatedTodo.id ? { ...todo, ...updatedTodo } : todo
        )
      )
      
      return { previousTodos }
    },
    onError: (err, updatedTodo, context) => {
      queryClient.setQueryData(['todos'], context?.previousTodos)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export const useDeleteTodo = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
```

## 모범 사례

### 1. 쿼리 키 구조화
```tsx
// 좋은 예
['todos']                    // 모든 todos
['todos', { status: 'done' }] // 완료된 todos
['todo', 1]                  // 특정 todo
['user', 1, 'todos']         // 특정 사용자의 todos

// 피해야 할 예
['todos', 'done']            // 객체 대신 문자열 사용
['todo', '1']                // 숫자를 문자열로 변환
```

### 2. 에러 처리
```tsx
const { data, error, isError } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  retry: (failureCount, error) => {
    // 404 에러는 재시도하지 않음
    if (error.status === 404) return false
    return failureCount < 3
  },
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
})
```

### 3. 성능 최적화
```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000,   // 10분
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
})
```

### 4. 타입스크립트 지원
```tsx
interface Todo {
  id: number
  title: string
  completed: boolean
}

const useTodos = () => {
  return useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  })
}

const useCreateTodo = () => {
  return useMutation<Todo, Error, Omit<Todo, 'id'>>({
    mutationFn: createTodo,
  })
}
```

## 결론

React Query는 서버 상태 관리를 위한 강력한 도구입니다. 적절히 사용하면 다음과 같은 이점을 얻을 수 있습니다:

- **개발자 경험 향상**: 복잡한 상태 관리 로직을 간소화
- **사용자 경험 개선**: 자동 캐싱과 백그라운드 업데이트
- **성능 최적화**: 불필요한 API 호출 감소
- **에러 처리**: 일관된 에러 처리 패턴

React Query를 프로젝트에 도입하여 더 나은 사용자 경험과 개발자 경험을 제공해보세요! 