export const dynamic = 'force-dynamic';

import UserTypeContent from '../components/UserTypeContent';

interface Props {
  searchParams: { [key: string]: string | undefined };
}

export default async function UserTypePage({ searchParams }: Props) {
  const userId = searchParams?.user;

  let userInfo: {
    id?: number;
    name?: string;
    userType?: string;
    credits?: number;
    error?: string;
  } = {};

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  console.log('🌱 BASE_URL:', BASE_URL);

  if (userId) {
    try {
      const res = await fetch(`${BASE_URL}/api/get-user-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
        cache: 'no-store'
      });

      const data = await res.json();
      console.log('🌱 API response:', data);

      if (res.ok) {
        userInfo = data;
      } else {
        userInfo = { error: `${res.status}: ${data.error || 'unknown'}` };
      }
    } catch (e) {
      console.error('🌱 Fetch Exception:', e);
      userInfo = { error: String(e) };
    }
  } else {
    userInfo = { error: 'No userId provided' };
  }

  return <UserTypeContent userInfo={userInfo} />;
}
