'use client';

import { useEffect, useState, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { Session } from '@/types/session.interface';
import { useRouter, useSearchParams } from 'next/navigation';
import { GameMode } from '@/types/gamemode.interface';
import toast, { Toaster } from 'react-hot-toast';
import { useNotifyLeaveRoom } from '@/hooks/useNotifyLeaveRoom';
import { motion, AnimatePresence } from 'framer-motion';

type PlayerPayload = {
  roomId: string;
  player1: { username: string; socketId: string | null; isHost: boolean };
  player2: { username: string; socketId: string | null; isHost: boolean };
};

export default function SessionPage({
  params,
}: {
  params: { roomId: string };
}) {
  const socket = useSocket();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const hasShownErrorToast = useRef(false);

  const [session, setSession] = useState<Session | null>(null);
  const [gameModes, setGameModes] = useState<GameMode[]>([]);
  const [view, setView] = useState<
    'loading' | 'enter-local-names' | 'game-selection'
  >('loading');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  useNotifyLeaveRoom(socket, params.roomId);

  useEffect(() => {
    if (error === 'game_not_found' && !hasShownErrorToast.current) {
      toast.error("❌ Oups, aucune partie trouvée. T'es où là ?", {
        style: {
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          border: '1px solid #FF4D88',
          padding: '16px',
          borderRadius: '12px',
        },
      });
      hasShownErrorToast.current = true;
    }
  }, [error]);

  useEffect(() => {
    const fetchSession = async () => {
      const res = await fetch(`/api/sessions/${params.roomId}`);
      if (!res.ok) {
        setView('enter-local-names');
        return;
      }
      const data = await res.json();

      if (data.currentGameId) {
        setIsRedirecting(true);
        router.push(`/sessions/${params.roomId}/game/${data.currentGameId}`);
        return;
      }

      setSession(data);
      setView('loading');
    };
    fetchSession();
  }, [params.roomId, router]);

  useEffect(() => {
    if (!socket || !params.roomId) return;

    const saved = localStorage.getItem('localSession');
    if (!saved) return;

    try {
      const data: PlayerPayload = JSON.parse(saved);
      if (data.roomId === params.roomId) {
        socket.emit('local:join-room', data);
      }
    } catch (err) {
      console.error('❌ Erreur parsing localSession', err);
    }
  }, [socket, params.roomId]);

  useEffect(() => {
    if (!socket) return;

    const handlePlayersReady = (sessionData: Session) => {
      setSession(sessionData);
      setView('game-selection');
    };

    const handleError = (message: string) => {
      toast.error(`Erreur : ${message}`, {
        style: {
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          border: '1px solid #FF4D88',
          padding: '16px',
          borderRadius: '12px',
        },
      });
    };

    const handleGameStarted = ({ gameId }: { gameId: string }) => {
      router.push(`/sessions/${params.roomId}/game/${gameId}`);
    };

    socket.on('local:players-ready', handlePlayersReady);
    socket.on('local:error_join-room', handleError);
    socket.on('local:game-started', handleGameStarted);

    return () => {
      socket.off('local:players-ready', handlePlayersReady);
      socket.off('local:error_join-room', handleError);
      socket.off('local:game-started', handleGameStarted);
    };
  }, [params.roomId, router, socket]);

  useEffect(() => {
    if (!session) return;

    if (session.players.length < 2) {
      setView('enter-local-names');
    } else {
      setView('game-selection');
    }
  }, [session]);

  useEffect(() => {
    const fetchGameModes = async () => {
      const res = await fetch('/api/gamemodes');
      if (!res.ok) return;
      const data = await res.json();
      setGameModes(data);
    };
    fetchGameModes();
  }, []);

  const handleLocalJoin = (name1: string, name2: string) => {
    const payload: PlayerPayload = {
      roomId: params.roomId,
      player1: { username: name1, socketId: null, isHost: true },
      player2: { username: name2, socketId: null, isHost: false },
    };

    localStorage.setItem('localSession', JSON.stringify(payload));
    socket?.emit('local:join-room', payload);
  };

  const startGame = (mode: 'chill' | 'grrr') => {
    setSelectedMode(mode);
    setTimeout(() => {
      socket?.emit('local:start-game', { mode, roomId: session?.room });
    }, 500);
  };

  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#4a0d29] to-[#220413] text-white">
        <div className="bg-black/40 backdrop-blur-sm px-8 py-6 rounded-xl flex flex-col items-center">
          <div className="w-12 h-12 border-3 border-t-pink-500 border-r-transparent border-b-pink-500 border-l-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-medium">On t'emmène dans la partie...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#4a0d29] to-[#220413] flex flex-col items-center justify-center p-4 md:p-6 text-white relative">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-15">
          {Array(8)
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

      <AnimatePresence mode="wait">
        {view !== 'loading' &&
          view !== 'enter-local-names' &&
          session?.players?.length === 2 && (
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed top-4 left-0 right-0 z-20 flex justify-center px-4"
            >
              <div className="bg-black/50 backdrop-blur-md p-3 rounded-xl border border-pink-500/20 flex gap-6 items-center">
                {session.players.map((player, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                      {player.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-pink-200">
                        {player.username}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-300 text-xs">★</span>
                        <span className="text-white/90 text-xs">
                          {player.points} pts
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.header>
          )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {view === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10"
          >
            <div className="bg-black/50 backdrop-blur-sm px-8 py-6 rounded-xl border border-pink-500/20">
              <div className="w-12 h-12 border-3 border-t-pink-500 border-r-transparent border-b-pink-500 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-xl font-medium">Chargement en cours...</p>
            </div>
          </motion.div>
        )}

        {view === 'enter-local-names' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 w-full max-w-sm"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const name1 = new FormData(form)
                  .get('name1')
                  ?.toString()
                  .trim();
                const name2 = new FormData(form)
                  .get('name2')
                  ?.toString()
                  .trim();
                if (!name1 || !name2) {
                  toast.error('Hey hey, faut les deux noms pour jouer !', {
                    style: {
                      background: 'rgba(0, 0, 0, 0.8)',
                      color: 'white',
                      border: '1px solid #FF4D88',
                      padding: '16px',
                      borderRadius: '12px',
                    },
                  });
                  return;
                }
                handleLocalJoin(name1, name2);
              }}
              className="bg-black/60 backdrop-blur-md rounded-xl p-6 border border-pink-500/20 shadow-lg"
            >
              <div className="flex justify-center mb-2">
                <div className="bg-pink-500/20 p-2 rounded-full">
                  <span className="text-2xl">💕</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-6 text-center text-pink-200">
                Entre vos prénoms
              </h2>

              <div className="space-y-4">
                <div>
                  <input
                    name="name1"
                    placeholder="Joueur 1"
                    className="w-full p-3 rounded-lg border border-pink-500/30 bg-black/30 focus:outline-none focus:border-pink-500 text-white text-base placeholder-pink-300/50 transition-all"
                    required
                    maxLength={15}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <input
                    name="name2"
                    placeholder="Joueur 2"
                    className="w-full p-3 rounded-lg border border-pink-500/30 bg-black/30 focus:outline-none focus:border-pink-500 text-white text-base placeholder-pink-300/50 transition-all"
                    required
                    maxLength={15}
                    autoComplete="off"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg font-medium text-white text-base shadow-md"
                >
                  C'est parti ! 🔥
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {view === 'game-selection' && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 w-full max-w-lg px-4"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-pink-100">
              Choisis ton mode de jeu
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameModes.map((mode) => (
                <motion.button
                  key={mode.slug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startGame(mode.slug as 'chill' | 'grrr')}
                  disabled={selectedMode !== null}
                  className={`relative overflow-hidden rounded-xl shadow-md ${
                    selectedMode === mode.slug ? 'ring-2 ring-pink-500' : ''
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-600/70 to-purple-700/70"></div>

                  <div className="relative p-4 flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-black/30 flex items-center justify-center border border-pink-500/30">
                      {mode.emojiUrl ? (
                        <img
                          src={mode.emojiUrl}
                          alt={mode.name}
                          className="w-12 h-12 object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-3xl">{mode.emoji ?? '🎮'}</span>
                      )}
                    </div>

                    <div className="text-center">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {mode.name}
                      </h3>
                      {mode.description && (
                        <p className="text-pink-100/80 text-xs">
                          {mode.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {selectedMode === mode.slug && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-xl"
                    >
                      <div className="bg-pink-600 text-white px-4 py-2 rounded-lg font-medium text-sm">
                        Sélectionné ✓
                      </div>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            <div className="mt-6 text-center text-pink-200/80 text-xs bg-black/20 p-3 rounded-lg">
              <p>
                Choisissez un mode pour commencer le jeu. Une fois la partie
                lancée, répondez aux questions à tour de rôle!
              </p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
