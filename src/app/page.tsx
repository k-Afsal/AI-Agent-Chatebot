
"use client";

import ChatLayout from '@/components/chat/chat-layout';

// This is a plain object now, not a Firebase User type
const mockUser = {
  uid: 'mock-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
};


export default function Home() {
  return (
    <ChatLayout user={mockUser} />
  );
}
