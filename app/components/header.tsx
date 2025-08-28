'use client'

import React from 'react'
import { Bars3Icon, PencilSquareIcon } from '@heroicons/react/24/solid'

export type IHeaderProps = {
  title: string
  isMobile?: boolean
  onShowSideBar?: () => void
  onCreateNewChat?: () => void
}

const Header: React.FC<IHeaderProps> = ({
  title,
  isMobile,
  onShowSideBar,
  onCreateNewChat,
}) => {
  return (
    <div className="w-full h-12 px-4 flex items-center justify-between bg-gradient-to-r from-blue-400 to-purple-500 shadow-md">
      {/* 左：ハンバーガー（≡） */}
      {isMobile ? (
        <button
          className="flex items-center justify-center h-8 w-8"
          onClick={onShowSideBar}
        >
          <Bars3Icon className="h-5 w-5 text-white" />
        </button>
      ) : (
        <div className="w-8" />
      )}

      {/* 中央：Sofiaラベル */}
      <div className="flex items-center gap-2">
        <img
  src="/mu_logo2.png"
  className="h-8 w-8 rounded-full filter brightness-125 drop-shadow-sm"
  alt="Sofia"
/>

        <div className="text-white text-sm font-bold tracking-wide font-sofia">
          irosAI
        </div>
      </div>

      {/* 右：新規チャット作成ボタン */}
      {isMobile ? (
        <button
          className="flex items-center justify-center h-8 w-8"
          onClick={onCreateNewChat}
        >
          <PencilSquareIcon className="h-5 w-5 text-white" />
        </button>
      ) : (
        <div className="w-8" />
      )}
    </div>
  )
}

export default React.memo(Header)
