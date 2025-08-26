// delete-conversation.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_APP_KEY;

export async function deleteConversation(conversationId: string, userId: string) {
  try {
    const res = await fetch(`${API_URL}/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ user: userId }),
    });

    if (res.status === 204) {
      console.log('✅ Conversation deleted successfully');
      return true;
    } else {
      const errorData = await res.text();
      console.error('❌ Failed to delete conversation:', errorData);
      return false;
    }
  } catch (err) {
    console.error('❌ deleteConversation error:', err);
    return false;
  }
}
