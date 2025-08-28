'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { marked } from 'marked';
import type { Message, MessageFile } from 'types';

interface MessageListProps {
  messages: Message[];
}

// ✅ テキスト内の埋め込み画像URLを抽出
const extractImageUrls = (text: string): string[] => {
  const urls: string[] = [];
  const regex = /(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|webp|gif))/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    urls.push(match[1]);
  }
  return urls;
};

// ✅ assistant側の自動生成ファイル判定
const isPreviewFile = (file: MessageFile): boolean => {
  return (
    !!file.url &&
    file.url.includes('https://upload.dify.ai/files/') &&
    file.belongs_to === 'assistant'
  );
};

const MessageList: FC<MessageListProps> = ({ messages }) => {
  // ✅ 重複排除（id基準）
  const uniqueMessagesMap = new Map<string, Message>();
  messages.forEach((m) => {
    if (m.id) uniqueMessagesMap.set(m.id, m);
  });
  const uniqueMessages = Array.from(uniqueMessagesMap.values());

  return (
    <div className="message-list-container flex flex-col px-4 py-6 space-y-4 overflow-y-auto">
      {uniqueMessages
        .filter((msg) => !msg.isPreview)
        .map((message, index) => {
          const embeddedImages = extractImageUrls(message.content || '');
          const htmlContent = marked.parse(message.content || '') as string;

          const files = (message.message_files || []) as MessageFile[];

          // ✅ belongs_to の判定
          const hasUserImage =
            Array.isArray(files) && files.some((f) => f.belongs_to === 'user');
          const isUserSide = message.role === 'user' || hasUserImage;

          return (
            <motion.div
              key={message.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className={`flex items-start ${
                isUserSide ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* 左アイコン（Sofia） */}
              {!isUserSide && (
                <img
                  src="/sofia-icon2.png"
                  alt="Sofia"
                  width={32}
                  height={32}
                  className="rounded-full mt-1 mr-2"
                />
              )}

              {/* 吹き出し */}
              <div
                className={`
                  bubble flex flex-col
                  ${
                    isUserSide
                      ? 'bubble-user bg-blue-500 text-white'
                      : 'bubble-assistant bg-gray-100 text-gray-800'
                  }
                  w-full text-base leading-loose p-4 rounded-xl
                  break-words whitespace-pre-wrap
                  max-w-[85%] md:max-w-[70%] 
                `}
              >
                {/* テキスト本文 */}
                {htmlContent && (
                  <div
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                    className="break-words"
                  />
                )}

                {/* 埋め込み画像URL */}
                {embeddedImages.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2">
                    {embeddedImages.map((url, idx) => (
                      <a
                        key={`embed-${idx}`}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <img
                          src={url}
                          alt="Embedded"
                          className="rounded-lg max-w-[150px] w-full h-auto shadow"
                        />
                      </a>
                    ))}
                  </div>
                )}

                {/* message_files の画像 */}
                {Array.isArray(files) && files.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2">
                    {files
                      .filter(
                        (f) =>
                          f.type === 'image' &&
                          f.url &&
                          (isUserSide
                            ? f.belongs_to === 'user'
                            : f.belongs_to !== 'user' && !isPreviewFile(f))
                      )
                      .map((file, idx) => (
                        <a
                          key={`file-${idx}`}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                        >
                          <img
                            src={file.url}
                            alt={`Uploaded ${idx}`}
                            className="rounded-lg max-w-[150px] w-full h-auto shadow"
                          />
                        </a>
                      ))}
                  </div>
                )}
              </div>

              {/* 右アイコン（User） */}
              {isUserSide && (
                <img
                  src="/Icom.png"
                  alt="User"
                  width={32}
                  height={32}
                  className="rounded-full mt-1 ml-2"
                />
              )}
            </motion.div>
          );
        })}
    </div>
  );
};

export default MessageList;
