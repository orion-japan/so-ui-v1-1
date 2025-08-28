// ✅ ファイル構造の基本型
export interface MessageFile {
  id: string;
  type: 'image' | 'document' | string;
  url: string;
  belongs_to?: 'user' | 'assistant';
}

// ✅ メッセージ構造
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  uploaded_image_urls?: string[];
  message_files?: MessageFile[];
  isPreview?: boolean;
}

// ✅ POST送信用の型構造
export interface PostMessageParams {
  query: string;
  user: string;
  conversation_id?: string;
  inputs: Record<string, any>;
  response_mode?: 'blocking' | 'streaming'; // ← 必ず含める！
  files?: {
    type: string;
    transfer_method: string;
    upload_file_id: string;
  }[];
}
