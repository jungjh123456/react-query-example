import { NextRequest, NextResponse } from 'next/server'

// 간단한 인메모리 데이터베이스 (실제 프로젝트에서는 실제 DB 사용)
let todos = [
  { id: 1, title: 'React Query 배우기', completed: false },
  { id: 2, title: 'Todo 앱 만들기', completed: true },
  { id: 3, title: '문서 작성하기', completed: false },
]

// PUT - todo 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { title, completed } = body

    const todoIndex = todos.findIndex(todo => todo.id === id)
    
    if (todoIndex === -1) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      )
    }

    // 업데이트할 필드만 수정
    if (title !== undefined) {
      todos[todoIndex].title = title.trim()
    }
    if (completed !== undefined) {
      todos[todoIndex].completed = completed
    }

    return NextResponse.json(todos[todoIndex])
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    )
  }
}

// DELETE - todo 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  const todoIndex = todos.findIndex(todo => todo.id === id)
  
  if (todoIndex === -1) {
    return NextResponse.json(
      { error: 'Todo not found' },
      { status: 404 }
    )
  }

  const deletedTodo = todos[todoIndex]
  todos.splice(todoIndex, 1)

  return NextResponse.json(deletedTodo)
} 