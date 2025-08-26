// Define or import the Message type
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

// You need to define or import setMessages. For example, if using React state:
import { Dispatch, SetStateAction } from 'react';

// Add setMessages as a parameter to sendMessage, or import it from context/store
let setMessages: Dispatch<SetStateAction<Message[]>>;

// Example: export a function to set setMessages from outside
export const setSetMessages = (fn: Dispatch<SetStateAction<Message[]>>) => {
  setMessages = fn;
};

// Define or import conversationId before using it
let conversationId: string | null = null; // Replace with actual logic to get conversationId

type PostMessageResponse = {
  answer?: string;
  conversation_id?: string;
  // add other properties if needed
};

// Make sure to import or define postMessage with the correct return type
// Example definition:
async function postMessage(params: {
  query: string;
  inputs: { text: string };
  user: string;
  conversation_id?: string;
}): Promise<PostMessageResponse> {
  // Replace with actual API call logic
  return {
    answer: "Sample answer",
    conversation_id: params.conversation_id || "new-conversation-id",
  };
}

// Import useRouter from next/navigation if using Next.js App Router
import { useRouter } from 'next/navigation';

const router = typeof window !== 'undefined' ? useRouter() : null;

const sendMessage = async (input: string) => {
  if (!input.trim()) return;

  const newUserMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: input,
  };

  setMessages((prev) => [...prev, newUserMessage]);

  // Define or import userId before using it
  const userId = 'your-user-id'; // Replace with actual logic to get the user ID

  const res: PostMessageResponse = await postMessage({
    query: input,
    inputs: { text: input },
    user: userId,
    conversation_id: conversationId || undefined,
  });

  const answer = res?.answer || '(No answer)';
  const newAssistantMessage: Message = {
    id: Date.now().toString() + '-assistant',
    role: 'assistant',
    content: answer,
  };

  setMessages((prev) => [...prev, newAssistantMessage]);

  if (res?.conversation_id && res.conversation_id !== conversationId) {
    if (router) {
      router.replace(`/?user=${userId}&conversation_id=${res.conversation_id}`);
    }
  }
};
