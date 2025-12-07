import LoginForm from '@/components/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-serif text-stone-800">AL</Link>
          <h1 className="text-2xl font-light text-stone-700 mt-4">Admin Login</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
