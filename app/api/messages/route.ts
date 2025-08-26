import { NextRequest, NextResponse } from 'next/server'

// 🎯 （任意）ローカルMock（デバッグ用）
let mockConversations = [
  { id: '1', title: '会話１' },
  { id: '2', title: '会話２' },
]

// ✅ GET /api/messages
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('user')
  const conversationId = searchParams.get('conversation_id')

  if (userId && conversationId) {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/messages?user=${encodeURIComponent(userId)}&conversation_id=${encodeURIComponent(conversationId)}`

    console.log('🌱 [GET] Fetching from Dify:', apiUrl)

    try {
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_APP_KEY}`,
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error('❌ Dify API Error:', res.status, errorText)
        return NextResponse.json({ error: errorText }, { status: res.status })
      }

      const data = await res.json()
      console.log('✅ [GET] Dify /messages response:', data)
      return NextResponse.json(data)

    } catch (error) {
      console.error('❌ Dify /messages fetch error:', error)
      return NextResponse.json({ error: String(error) }, { status: 500 })
    }
  }

  // 🎯 userId or conversationId が無い場合はMock返却
  console.warn('⚠️ [GET] userId / conversationId not provided → mockConversations returned')
  return NextResponse.json(mockConversations)
}

// ✅ DELETE /api/messages/:id （Mock削除）
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  mockConversations = mockConversations.filter((c) => c.id !== id)
  console.log('✅ [DELETE] Mock conversation deleted:', id)
  return NextResponse.json({ status: 'deleted', id })
}

// ✅ PUT /api/messages/:id （Mock名前変更）
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const { title } = await req.json()
  mockConversations = mockConversations.map((c) =>
    c.id === id ? { ...c, title } : c
  )
  console.log('✅ [PUT] Mock conversation renamed:', id, title)
  return NextResponse.json({ status: 'renamed', id, title })
}
