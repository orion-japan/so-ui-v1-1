'use client'

interface SofiaChatProps {
  userId: string
  userInfo?: {
    id: string
    name: string
    userType: string
    credits: number
  }
}

export default function SofiaChat({ userId, userInfo }: SofiaChatProps) {
  console.log('🌿 SofiaChat userId:', userId)
  console.log('🌿 SofiaChat userInfo:', userInfo)

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">🌱 Sofia Chat</h2>
      <p><strong>User ID:</strong> {userId}</p>
      {userInfo ? (
        <div className="mt-2 p-2 border">
          <p><strong>Name:</strong> {userInfo.name}</p>
          <p><strong>User Type:</strong> {userInfo.userType}</p>
          <p><strong>Credits:</strong> {userInfo.credits}</p>
        </div>
      ) : (
        <p>🔄 ユーザー情報を取得中…</p>
      )}

      {/* ここに元々のチャットUIが続く */}
    </div>
  )
}
