'use client'

import { X, Waves, Trash, Edit } from 'lucide-react'
import React from 'react'

// 画面で使う統一型
interface UserInfo {
  id: string
  name: string
  userType: string
  credits: number
}

interface Conversation {
  id: string
  title: string
}

interface SidebarMobileProps {
  conversations: Conversation[]
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onRename: (id: string, newTitle: string) => void
  isOpen: boolean
  onClose: () => void
  userInfo: UserInfo | null // 👈 追加：親から渡す
}

const SidebarMobile: React.FC<SidebarMobileProps> = ({
  conversations,
  onSelect,
  onDelete,
  onRename,
  isOpen,
  onClose,
  userInfo, // 👈 親から受け取り
}) => {
  // スクロールロック
  React.useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center text-indigo-700">
            <Waves className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-bold">🌊 セッション一覧</h2>
          </div>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* ユーザー情報表示（署名で親から渡されたものを表示） */}
        {userInfo && (
          <div className="p-4 border-b text-sm text-gray-800">
            🌱 <strong>Name:</strong> {userInfo.name}
            <br />
            🌱 <strong>Type:</strong> {userInfo.userType}
            <br />
            🌱 <strong>Credits:</strong> {userInfo.credits}
          </div>
        )}

        <ul className="p-4 space-y-2 overflow-y-auto">
          {conversations.map((conv) => (
            <li
              key={conv.id}
              className="bg-indigo-50 rounded-xl px-3 py-2 flex justify-between items-center"
            >
              <span
                onClick={() => {
                  onSelect(conv.id)
                  onClose()
                }}
                className="cursor-pointer text-indigo-900 font-medium truncate max-w-[140px]"
              >
                {conv.title || '無題のセッション'}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const newTitle = prompt('新しいタイトルを入力してください', conv.title)
                    if (newTitle) onRename(conv.id, newTitle)
                  }}
                >
                  <Edit size={16} className="text-indigo-500" />
                </button>
                <button onClick={() => onDelete(conv.id)}>
                  <Trash size={16} className="text-red-400" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default SidebarMobile
