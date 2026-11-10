import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto shadow-md">
          <BookOpen className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-6xl font-black font-sans text-slate-900 dark:text-white">
            404
          </h1>
          <h2 className="mt-2 text-xl font-bold font-serif text-slate-800 dark:text-slate-200">
            Story Not Found
          </h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed font-serif">
            The page or article you are looking for may have been archived, renamed, or is temporarily unavailable.
          </p>
        </div>

        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
