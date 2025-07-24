import AddTodo from './components/AddTodo'
import TodoList from './components/TodoList'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            React Query Todo 앱
          </h1>
          
          <AddTodo />
          <TodoList />
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              React Query 기능들
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✅ 자동 캐싱 및 백그라운드 업데이트</li>
              <li>✅ 로딩/에러 상태 자동 관리</li>
              <li>✅ 낙관적 업데이트 (즉시 UI 반영)</li>
              <li>✅ 자동 재시도 및 에러 처리</li>
              <li>✅ 쿼리 무효화 및 동기화</li>
              <li>✅ 개발자 도구 지원</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
