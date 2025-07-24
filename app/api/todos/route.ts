import { NextRequest, NextResponse } from 'next/server'

// 간단한 인메모리 데이터베이스 (실제 프로젝트에서는 실제 DB 사용)
let todos = [
  { id: 1, title: 'React Query 배우기', completed: false },
  { id: 2, title: 'Todo 앱 만들기', completed: true },
  { id: 3, title: '문서 작성하기', completed: false },
]

let nextId = 4

// GET - 모든 todos 조회
export async function GET() {
  return NextResponse.json(todos)
}

// POST - 새로운 todo 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title } = body
    
    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required and must be a string' },
        { status: 400 }
      )
    }

    const newTodo = {
      id: nextId++,
      title: title.trim(),
      completed: false,
    }

    todos.push(newTodo)
    return NextResponse.json(newTodo, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    )
  }
} 