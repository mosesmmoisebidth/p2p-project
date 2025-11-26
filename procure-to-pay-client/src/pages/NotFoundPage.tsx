import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div className="flex h-full flex-col items-center justify-center gap-4 py-20">
    <img src="/procure-to-pay.png" alt="Smart P2P" className="h-16 w-16" />
    <h1 className="text-3xl font-semibold text-slate-900">Page not found</h1>
    <p className="text-sm text-slate-500">The page you are looking for does not exist.</p>
    <Link to="/" className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white">
      Return to dashboard
    </Link>
  </div>
);
