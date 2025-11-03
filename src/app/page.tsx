// src/app/page.tsx
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    // Use post-login to route based on role
    redirect('/post-login');
  } else {
    redirect('/sign-in');
  }
}
