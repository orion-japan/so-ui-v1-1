'use client';

interface Props {
  userInfo: {
    id?: number;
    name?: string;
    userType?: string;
    credits?: number;
    error?: string;
  };
}

export default function UserTypeContent({ userInfo }: Props) {
  if (userInfo.error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-sm text-red-600">
        Your type : error ({userInfo.error})
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-sm text-gray-600">
      <p>Your type : {userInfo.userType}</p>
      <p>Name : {userInfo.name}</p>
      <p>Credits : {userInfo.credits}</p>
    </div>
  );
}
