'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SidebarMobile from './SidebarMobile';
import Header from './header';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { postMessage, getMessages, getConversations } from '../lib/messages';
import { deleteConversation } from '../../lib/delete-conversation';
import { uploadFile } from '../../lib/chat-messages';
import type { Message, PostMessageParams } from 'types';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface SofiaChatProps {
  userId: string;
  conversationId?: string;
  userInfo?: {
    id: string;
    name: string;
    userType: string;
    credits: number;
  };
}

const SofiaChat: React.FC<SofiaChatProps> = ({
  userId: initialUserId,
  conversationId,
  userInfo: initialUserInfo,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryUserId = searchParams?.get('user');               // ← 互換のため残すだけ
  const queryConversationId = searchParams?.get('conversation_id');

  // ✅ props（= サーバ検証済みのID）を最優先。無ければクエリを使う。
  const userId = initialUserId || queryUserId || '';

  const [messages, setMessages] = useState<Message[]>([]);
  const [previewMessage, setPreviewMessage] = useState<Message | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localConversationId, setLocalConversationId] = useState<string | undefined>(conversationId);
  const [prevUserId, setPrevUserId] = useState(userId);
  const [conversations, setConversations] = useState<{ id: string; title: string }[]>([]);

  const [userInfo, setUserInfo] = useState<{
    id: string;
    name: string;
    userType: string;
    credits: number;
  }>(initialUserInfo || { id: '', name: '', userType: '', credits: 0 });

  const [credits, setCredits] = useState<number>(initialUserInfo?.credits || 0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // props更新反映
  useEffect(() => {
    console.log('[SofiaChat] initialUserInfo (props):', initialUserInfo);
    if (initialUserInfo) {
      setUserInfo(initialUserInfo);
      setCredits(initialUserInfo.credits || 0);
    }
  }, [initialUserInfo]);

  useEffect(() => {
    console.log('[SofiaChat] マウント時 userId:', userId);
    console.log('[SofiaChat] 初期 userInfo state:', userInfo);
  }, []);

  useEffect(() => {
    console.log('[SofiaChat] userInfo 更新:', userInfo);
  }, [userInfo]);

  // userId変化時はスレッドをリセット
  useEffect(() => {
    if (prevUserId && prevUserId !== userId) {
      setLocalConversationId(undefined);
      setMessages([]);
    }
    setPrevUserId(userId);
  }, [userId, prevUserId]);

  // クエリの会話IDがあれば読みに行く
  useEffect(() => {
    if (queryConversationId) {
      setLocalConversationId(queryConversationId);
      fetchMessages(queryConversationId);
    } else {
      setMessages([]);
    }
  }, [queryConversationId]);

  const fetchMessages = async (convId: string) => {
    const res = await getMessages(userId, convId);
    setMessages(res);
    setIsDeleted(res.length === 0);
  };

  const fetchConversations = async () => {
    const res = await getConversations(userId);
    if (res?.data) {
      setConversations(
        res.data.map((conv: any) => ({
          id: conv.id,
          title: conv.name || '新しい会話',
        }))
      );
    }
  };

  const addConversation = (newConv: { id: string; title?: string }) => {
    setConversations((prev) => {
      const exists = prev.some((conv) => conv.id === newConv.id);
      if (exists) return prev;
      return [{ id: newConv.id, title: newConv.title ?? '新しい会話' }, ...prev];
    });
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === id ? { ...conv, title: newTitle } : conv))
    );
  };

  const handleDeleteConversation = async (id: string) => {
    const confirmed = window.confirm('この会話を削除しますか？');
    if (!confirmed) return;
    const success = await deleteConversation(id, userId);
    if (success) {
      await fetchConversations();
      if (localConversationId === id) {
        setMessages([]);
        setLocalConversationId(undefined);
        // ❌ もう ?user を付けない
        router.replace(`/?conversation_id=`); // or just '/'
      }
    }
  };

  const handleSelectConversation = async (id: string) => {
    setLocalConversationId(id);
    setMessages([]);
    // ❌ もう ?user を付けない
    router.replace(`/?conversation_id=${id}`);
    await fetchMessages(id);
    setIsMobileMenuOpen(false);
  };

  const handlePreview = (files: File[], previewUrl: string) => {
    const previewMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: '',
      uploaded_image_urls: [previewUrl],
      isPreview: true,
    };
    setPreviewMessage(previewMsg);
    setMessages((prev) => [...prev, previewMsg]);
  };

  const handleCancelPreview = () => {
    setPreviewMessage(null);
    setMessages((prev) => prev.filter((msg) => !msg.isPreview));
  };

  const handleSend = async (
    input: string,
    files: File[] | null
  ): Promise<{ conversation_id?: string }> => {
    if (!userId || userId === 'guest') {
      toast.info('🪔 ご利用にはログインが必要です。');
      return {};
    }

    if ((!input || !input.trim()) && (!files || files.length === 0)) {
      toast.info('🪔 何か入力するかファイルを選んでください！');
      return {};
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      uploaded_image_urls: [],
      isPreview: false,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsDeleted(false);

    let uploadedIds: string[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const uploaded = await uploadFile(file, userId);
        if (uploaded?.id) uploadedIds.push(uploaded.id);
      }
    }

    if (previewMessage) {
      setPreviewMessage(null);
    }

    const payload: PostMessageParams = {
      query: input,
      user: userId,                               // ← 内部の userId を使用
      conversation_id: localConversationId || undefined,
      response_mode: 'blocking',
      inputs: {
        userType: userInfo.userType || '',
      },
    };

    if (uploadedIds.length > 0) {
      payload.files = uploadedIds.map((id) => ({
        type: 'image',
        transfer_method: 'local_file',
        upload_file_id: id,
      }));
    }

    const res = await postMessage(payload);
    console.log('🌱 postMessage Response:', res);

    if (res?.credits !== undefined) {
      setCredits(res.credits);
    }

    if (res?.alertMessage) {
      toast.info(res.alertMessage);
    }

    if (res?.error && res?.needed) {
      toast.error(res.alertMessage || `⚠️ ${res.error}`);
      return {};
    }

    if (res?.conversation_id && res.conversation_id !== localConversationId) {
      setLocalConversationId(res.conversation_id);
      // ❌ もう ?user を付けない
      router.replace(`/?conversation_id=${res.conversation_id}`);
      addConversation({ id: res.conversation_id });
    }

    const usage = res?.metadata?.usage;
    const tokens_prompt = usage?.prompt_tokens ?? undefined;
    const tokens_completion = usage?.completion_tokens ?? undefined;
    const tokens_total = usage?.total_tokens ?? undefined;
    const estimated_cost_usd = usage?.total_price ?? 0;

    if (res?.conversation_id && tokens_prompt !== undefined) {
      await fetch('/api/saveSofiaLog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          conversation_id: res.conversation_id,
          tokens_prompt: tokens_prompt,
          tokens_completion: tokens_completion,
          tokens_total: tokens_total,
          estimated_cost_usd: estimated_cost_usd,
          timestamp: new Date().toISOString(),
        }),
      });
    }

    const convId = res?.conversation_id || localConversationId;
    if (convId) {
      const serverMessages = await getMessages(userId, convId);
      setMessages(serverMessages);
    }

    return { conversation_id: res?.conversation_id };
  };

  const handleNewChat = () => {
    if (!userId || userId === 'guest') {
      toast.info('ログインが必要です。');
      return;
    }

    setLocalConversationId(undefined);
    setMessages([]);
    setIsDeleted(false);
    // ❌ もう ?user を付けない
    router.replace(`/`);
  };

  useEffect(() => {
    fetchConversations();
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-x-hidden">
      <Header
        title="会話履歴"
        isMobile
        onShowSideBar={() => setIsMobileMenuOpen(true)}
        onCreateNewChat={handleNewChat}
      />

<SidebarMobile
  isOpen={isMobileMenuOpen}
  onClose={() => setIsMobileMenuOpen(false)}
  conversations={conversations}
  onSelect={handleSelectConversation}
  onDelete={handleDeleteConversation}
  onRename={handleRenameConversation}
  userInfo={userInfo}   // ← ここで渡す
/>


      <div className="flex-1 overflow-y-auto px-2 sm:px-4 pb-[120px]">
        <div className="max-w-[900px] mx-auto">
          <MessageList messages={messages} />
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur border-t z-20">
        <div className="max-w-screen-md mx-auto px-4 py-2">
          <ChatInput
            onSend={handleSend}
            onPreview={handlePreview}
            onCancelPreview={handleCancelPreview}
          />
        </div>
      </div>

      <ToastContainer position="top-center" />
    </div>
  );
};

export default SofiaChat;
