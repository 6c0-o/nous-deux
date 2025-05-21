'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function CreateSession() {
  const router = useRouter();
  const [sessionName, setSessionName] = useState('');
  const [sessionType, setSessionType] = useState<'local' | 'online'>('local');
  const [setPassword, setSetPassword] = useState(false);
  const [sessionPassword, setSessionPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    const data: Record<string, string> = {
      name: sessionName,
      type: sessionType,
    };

    if (sessionType === 'online' && setPassword) {
      data.password = sessionPassword;
    }

    try {
      const response = await fetch('/api/sessions/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/sessions/${result.id}`);
      } else {
        const errorData = await response.json();
        setMessage(`Erreur: ${errorData.message || response.statusText}`);
      }
    } catch (error: any) {
      setMessage(`Erreur: ${error?.message || 'inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-gradient-to-br from-[#4a0d29] to-[#220413] text-white flex items-center justify-center relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md bg-gradient-to-br from-black/70 to-black/50 backdrop-blur-md border border-pink-500/20 p-8 rounded-2xl shadow-lg shadow-pink-500/10"
      >
        <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-pink-500 to-purple-500 mb-8">
          Créer une session
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="sessionName"
              className="block mb-2 text-pink-200 font-medium"
            >
              Nom de la session
            </label>
            <input
              id="sessionName"
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Ex: Partie entre amis"
              required
              className="w-full rounded-lg border border-pink-500/40 bg-black/40 px-4 py-3 placeholder-pink-300/50 text-white focus:ring-2 focus:ring-pink-500 outline-none transition"
            />
          </div>

          <div>
            <span className="block text-pink-200 font-medium mb-3">
              Type de session
            </span>
            <div className="flex gap-8 justify-center">
              {['local', 'online'].map((type) => (
                <label
                  key={type}
                  className={`inline-flex items-center relative overflow-hidden px-5 py-3 rounded-lg border ${
                    sessionType === type
                      ? 'border-pink-500 bg-pink-500/20'
                      : 'border-pink-500/30 bg-black/30'
                  } transition-all duration-300 ${
                    type === 'online'
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer hover:bg-pink-500/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="sessionType"
                    value={type}
                    checked={sessionType === type}
                    onChange={() => setSessionType(type as 'local' | 'online')}
                    disabled={type === 'online'}
                    className="absolute opacity-0"
                  />
                  <span className="text-pink-100 select-none text-lg capitalize">
                    {type}
                  </span>
                  {sessionType === type && (
                    <motion.span
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-pink-400 to-pink-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </label>
              ))}
            </div>
          </div>
          <AnimatePresence>
            {sessionType === 'online' && (
              <motion.div
                key="password-toggle"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-4"
              >
                <label className="inline-flex items-center cursor-pointer px-4 py-2 rounded-lg bg-black/30 border border-pink-500/30 hover:bg-pink-500/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={setPassword}
                    onChange={(e) => setSetPassword(e.target.checked)}
                    className="h-5 w-5 text-pink-500 rounded border-pink-400 focus:ring-pink-500"
                  />
                  <span className="ml-3 text-pink-200 font-medium text-lg">
                    Mot de passe
                  </span>
                </label>

                <AnimatePresence>
                  {setPassword && (
                    <motion.div
                      key="password-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <label
                        htmlFor="sessionPassword"
                        className="block mb-2 text-pink-200 font-medium"
                      >
                        Mot de passe
                      </label>
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        className="relative"
                      >
                        <input
                          id="sessionPassword"
                          type="password"
                          value={sessionPassword}
                          onChange={(e) => setSessionPassword(e.target.value)}
                          required
                          placeholder="Entrez un mot de passe"
                          className="w-full rounded-lg border border-pink-500/40 bg-black/40 px-4 py-3 placeholder-pink-300/50 text-white focus:ring-2 focus:ring-pink-500 outline-none transition"
                        />
                        <motion.span
                          className="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 opacity-0 pointer-events-none"
                          animate={{ opacity: [0, 0.5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className="w-full py-4 rounded-lg font-semibold bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20 border border-pink-400/20 disabled:opacity-50 transition"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-t-white border-r-transparent border-b-white border-l-transparent rounded-full animate-spin"></div>
                <span>Création...</span>
              </div>
            ) : (
              'Créer la session'
            )}
          </motion.button>
        </form>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-4 rounded-lg text-center border ${
              message.toLowerCase().includes('succès')
                ? 'bg-green-900/60 text-green-200 border-green-500/40'
                : 'bg-red-900/60 text-red-200 border-red-500/40'
            }`}
          >
            {message}
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center"
        >
          <Link
            href="/"
            className="text-pink-300 hover:text-pink-200 inline-flex items-center gap-1 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Retour à l'accueil
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
