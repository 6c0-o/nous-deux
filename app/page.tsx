'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  useEffect,
  useState,
} from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { FlippableCards } from '@/components/FlippableCards';

export default function Home() {
  const socket = useSocket();

  const [onlinePlayers, setOnlinePlayers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleOnlinePlayers = (count) => {
      setOnlinePlayers(count);
    };

    socket.on('online:connected', handleOnlinePlayers);

    return () => {
      socket.off('online:connected', handleOnlinePlayers);
    };
  }, [socket]);

  useEffect(() => {
    const fetchQuestionCount = async () => {
      try {
        const res = await fetch('/api/questions/count');
        const data = await res.json();
        setTotalQuestions(data.totalQuestions);
      } catch (err) {
        console.error('❌ Failed to fetch question count', err);
      }
    };

    fetchQuestionCount();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#4a0d29] to-[#220413] text-white flex flex-col relative overflow-hidden select-none">
      <nav className="w-full px-4 sm:px-6 md:px-12 pt-4 sm:pt-6 pb-2 sm:pb-4 flex justify-between items-center z-10 backdrop-blur-sm bg-black/10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <div className="relative w-8 h-8 sm:w-10 sm:h-10">
            <Image
              src="https://files.catbox.moe/gxcap8.png"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-pink-300 to-pink-500 text-transparent bg-clip-text">
            Nous Deux
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-r from-black/40 to-black/20 backdrop-blur-md px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm text-pink-200 flex items-center gap-2 border border-pink-500/20"
        >
          <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>{onlinePlayers} en ligne</span>
        </motion.div>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 gap-6 sm:gap-8 md:gap-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex flex-col items-center text-center lg:text-left"
        >
          <div className="mb-6 md:mb-12 max-w-md">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-pink-500 to-purple-500 mb-4 uppercase"
            >
              Nous Deux
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl md:text-2xl text-pink-100/90 leading-relaxed mb-6 font-light"
            >
              Le jeu qui teste votre complicité et pimente votre relation
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 text-sm text-pink-200 mb-8 bg-gradient-to-r from-black/40 to-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-pink-500/20 max-w-max"
            >
              <span className="font-bold text-pink-300 text-lg">
                {totalQuestions}
              </span>
              <span>questions disponibles</span>
            </motion.div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/sessions/new" passHref>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 15px rgba(236, 72, 153, 0.5)',
                }}
                whileTap={{ scale: 0.98 }}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 rounded-lg font-medium text-white shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 border border-pink-400/20 w-full sm:w-auto"
              >
                Créer une session
              </motion.button>
            </Link>
            <Link href="/sessions/join" passHref>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 10px rgba(236, 72, 153, 0.3)',
                }}
                whileTap={{ scale: 0.98 }}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-black/40 backdrop-blur-md border border-pink-500/30 hover:bg-pink-500/10 rounded-lg font-medium text-pink-200 shadow-md transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                Rejoindre une session
              </motion.button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex-1 flex justify-center relative perspective-1000 w-full lg:w-auto min-h-[300px] sm:min-h-[350px]"
          style={{ zIndex: 10 }}
        >
          <div className="relative w-full h-full max-w-md">
            <FlippableCards />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="w-full flex justify-center z-0 pb-8 sm:pb-12"
      >
        <div className="w-full max-w-5xl px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-pink-500/20 shadow-lg shadow-pink-500/5"
          >
            <div className="flex justify-center mb-3">
              <div className="w-10 h-10 relative">
                <Image
                  src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Symbols/Heart%20On%20Fire.webp"
                  alt="Complicité"
                  width={40}
                  height={40}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-center text-pink-100">
              Testez votre complicité
            </h3>
            <p className="text-pink-100/80 text-sm text-center">
              Découvrez à quel point vous connaissez votre partenaire
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-pink-500/20 shadow-lg shadow-pink-500/5"
          >
            <div className="flex justify-center mb-3">
              <div className="w-10 h-10 relative">
                <Image
                  src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Animals%20and%20Nature/Fire.webp"
                  alt="Pimentez"
                  width={40}
                  height={40}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-center text-pink-100">
              Pimentez vos soirées
            </h3>
            <p className="text-pink-100/80 text-sm text-center">
              Apportez du fun et de la nouveauté à vos moments à deux
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-pink-500/20 shadow-lg shadow-pink-500/5"
          >
            <div className="flex justify-center mb-3">
              <div className="w-10 h-10 relative">
                <Image
                  src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Animals%20and%20Nature/High%20Voltage.webp"
                  alt="Rapide"
                  width={40}
                  height={40}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-center text-pink-100">
              Rapide & facile
            </h3>
            <p className="text-pink-100/80 text-sm text-center">
              Lancez une session en quelques clics, sans prise de tête
            </p>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
