'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useRouter } from 'next/navigation';
import { useNotifyLeaveRoom } from '@/hooks/useNotifyLeaveRoom';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

type Player = {
  socketId: string | null;
  username: string;
  isHost: boolean;
  isOnline: boolean;
  points: number;
};

type Question = {
  id: string;
  content: string;
  type: 'QUESTION' | 'CHALLENGE';
  points: number;
};

export default function GamePage({
  params,
}: {
  params: { roomId: string; id: string };
}) {
  const socket = useSocket();
  const router = useRouter();
  const { id: gameId, roomId } = params;

  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);

  useNotifyLeaveRoom(socket, params.roomId);

  useEffect(() => {
    if (!socket || !roomId) return;

    const saved = localStorage.getItem('localSession');
    if (!saved) return;

    try {
      const data = JSON.parse(saved);
      if (data.roomId === roomId) {
        socket.emit('local:join-room', data);
      }
    } catch (err) {
      console.error('❌ Erreur parsing localSession depuis localStorage', err);
    }
  }, [socket, roomId]);

  useEffect(() => {
    if (!gameId || !roomId) return;

    const fetchData = async () => {
      const [gameRes, sessionRes] = await Promise.all([
        fetch(`/api/games/${gameId}`),
        fetch(`/api/sessions/${roomId}`),
      ]);

      if (!gameRes.ok) {
        if (sessionRes.ok) {
          const session = await sessionRes.json();
          if (
            session.currentGameId !== gameId &&
            session.currentGameId !== null
          ) {
            router.push(`/sessions/${roomId}/game/${session.currentGameId}`);
            return;
          }
        }
        router.push(`/sessions/${roomId}?error=game_not_found`);
        return;
      }

      if (!sessionRes.ok) return;

      const game = await gameRes.json();
      const session = await sessionRes.json();

      setCurrentRound(game.currentRound);
      setCurrentQuestion(game.questions[game.currentRound - 1] || null);
      setPlayers(session.players || []);
    };

    fetchData();
  }, [gameId, roomId, router]);

  useEffect(() => {
    if (!socket) return;

    socket.on('local:next-round', ({ currentRound, question }) => {
      setCurrentRound(currentRound);
      setCurrentQuestion(question);
      setIsAnswering(false);
    });

    socket.on('local:update-score', ({ players }) => {
      setPlayers(players);
    });

    socket.on('local:end-game', ({ players }) => {
      toast.success('🎉 La partie est terminée !', {
        style: {
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          border: '1px solid #FF4D88',
          padding: '16px',
          borderRadius: '12px',
        },
      });
      setTimeout(() => router.push(`/sessions/${roomId}`), 1500);
    });

    socket.on('local:error', (message) => {
      toast.error(`Erreur: ${message}`, {
        style: {
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          border: '1px solid #FF4D88',
          padding: '16px',
          borderRadius: '12px',
        },
      });
    });

    socket.on('local:players-ready', (session) => {
      setPlayers(session.players);
    });

    return () => {
      socket.off('local:next-round');
      socket.off('local:update-score');
      socket.off('local:end-game');
      socket.off('local:players-ready');
      socket.off('local:error');
    };
  }, [socket, router, roomId]);

  if (!players.length || !currentQuestion)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#4a0d29] to-[#220413] text-white">
        <div className="bg-black/40 backdrop-blur-sm px-8 py-6 rounded-xl flex flex-col items-center">
          <div className="w-12 h-12 border-3 border-t-pink-500 border-r-transparent border-b-pink-500 border-l-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-medium">Chargement de la partie...</p>
        </div>
      </div>
    );

  const playerIndexAnswering = currentRound % 2 === 1 ? 0 : 1;
  const playerIndexJudging = playerIndexAnswering === 0 ? 1 : 0;

  const playerAnswering = players[playerIndexAnswering];
  const playerJudging = players[playerIndexJudging];

  const handleAnswer = (accepted: boolean) => {
    if (!socket) return;
    setIsAnswering(true);
    socket.emit('local:answer', { gameId, accepted });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#4a0d29] to-[#220413] text-white flex flex-col items-center justify-center p-4 md:p-6 relative">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-15">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full blur-3xl bg-pink-500"
                style={{
                  width: `${Math.random() * 200 + 100}px`,
                  height: `${Math.random() * 200 + 100}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
              />
            ))}
        </div>
      </div>

      <Toaster position="top-center" />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-0 right-0 z-20 flex justify-center px-4"
      >
        <div className="bg-black/50 backdrop-blur-md p-3 rounded-xl border border-pink-500/20 flex gap-4 items-center">
          <div className="text-pink-200 font-medium">
            Round {currentRound}
            <span className="text-pink-300/80 text-sm"> / 20</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-700/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentRound / 20) * 100}%` }}
                className="h-full bg-pink-500 rounded-full"
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative z-10 w-full max-w-lg mb-6"
        >
          <div className="bg-black/60 backdrop-blur-md rounded-xl p-6 border border-pink-500/20 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-pink-500/20 rounded-lg text-pink-200 text-sm font-medium max-w-full truncate">
                  {currentQuestion.type === 'QUESTION'
                    ? '⁉️ Question'
                    : '🔥 Défi'}
                </div>

                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (!socket) return;

                    socket.emit('local:report-question', {
                      gameId,
                      questionId: currentQuestion.id,
                    });

                    socket.emit('local:answer', { gameId, accepted: false });
                    setIsAnswering(true);

                    toast.success('🚩 Question signalée !', {
                      style: {
                        background: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        border: '1px solid #FF4D88',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        userSelect: 'none',
                      },
                    });
                  }}
                  aria-label="Signaler la question"
                  type="button"
                  className="text-pink-400 hover:text-pink-600 cursor-pointer select-none text-xl leading-none"
                >
                  🚩
                </motion.button>
              </div>
              <div className="text-pink-300 text-sm">
                <span className="font-bold">{currentQuestion.points}</span>{' '}
                points
              </div>
            </div>

            <p className="text-lg font-medium text-white mb-4">
              {currentQuestion.content}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-lg mb-6 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-pink-500/20 text-center"
      >
        <p className="text-pink-100 mb-1">
          <span className="font-bold">{playerAnswering.username}</span> doit
          {currentQuestion.type === 'QUESTION' ? ' répondre' : ' faire le défi'}
        </p>
        <p className="text-pink-300/70 text-sm">
          <span className="font-medium">{playerJudging.username}</span> doit
          juger
        </p>
      </motion.div>

      {!isAnswering ? (
        <div className="flex justify-center gap-4 w-full max-w-lg mb-8 z-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAnswer(true)}
            className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-500 rounded-lg font-medium text-white shadow-md flex items-center justify-center gap-2"
          >
            <span>✓</span> Valider
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAnswer(false)}
            className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-500 rounded-lg font-medium text-white shadow-md flex items-center justify-center gap-2"
          >
            <span>✗</span> Refuser
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 py-3 px-6 bg-black/40 backdrop-blur-sm rounded-lg border border-pink-500/20"
        >
          <div className="flex items-center gap-2 text-pink-200">
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
            <p className="text-sm">En attente de la prochaine manche...</p>
          </div>
        </motion.div>
      )}

      <div className="w-full max-w-lg grid grid-cols-2 gap-4">
        {players.map((player, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-black/40 backdrop-blur-sm rounded-xl p-4 border ${
              idx === playerIndexAnswering
                ? 'border-pink-500/40'
                : 'border-pink-500/10'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                {player.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-pink-100">{player.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-yellow-300 text-xs">★</span>
              <span className="text-white/90 text-sm font-medium">
                {player.points} points
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
