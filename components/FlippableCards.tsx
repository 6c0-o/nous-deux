import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';

const Card = memo(
  ({
    card,
    isSelected,
    isFlipped,
    index,
    totalCards,
    onSelect,
    onClick,
    isMobile,
    isCentered,
  }) => {
    if (isMobile) {
      return (
        <motion.div
          className="absolute cursor-pointer touch-manipulation origin-center mx-auto"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            zIndex: 20,
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          onClick={() => onClick(isFlipped ? null : card.id)}
        >
          <div
            className="relative w-[260px] h-[350px] mx-auto transition-transform duration-700 shadow-xl"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            <div
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-sm border border-pink-300/30 shadow-lg flex flex-col p-6"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="w-7 h-7 rounded-full bg-pink-500/20 backdrop-blur-sm flex items-center justify-center text-pink-300 text-xs border border-pink-400/30">
                  {card.id}
                </div>
              </div>

              <div className="mb-4">
                <div className="inline-block px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-pink-500/20">
                  <p className="text-pink-300 text-xs font-light tracking-wide">
                    {card.category}
                  </p>
                </div>
              </div>

              <div className="flex-grow flex items-center justify-center text-center my-2">
                <p className="text-white text-xl font-medium leading-tight">
                  {card.question}
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-pink-500/10 flex justify-between items-center">
                <span className="text-xs text-pink-200/70 font-light italic">
                  Nous Deux
                </span>
                <span className="text-xs text-pink-200/50">
                  Touchez pour retourner
                </span>
              </div>
            </div>
            <div
              className="absolute inset-0 rounded-xl bg-black/80 backdrop-blur-sm border border-pink-300/30 shadow-lg flex items-center justify-center"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="w-24 h-24 bg-pink-500/20 rounded-full flex items-center justify-center">
                <p className="text-pink-300 text-xl font-medium">NousDeux</p>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    // Desktop display (horizontal layout) - cartes plus rapprochées
    const spacing = 50; // Espacement beaucoup plus petit entre les cartes
    const baseXPos = (-spacing * (totalCards - 1)) / 2 + index * spacing;

    // Animation simplifiée pour cartes plus collées
    const animate = isSelected
      ? { y: -20, x: 0, scale: 1.1, zIndex: 50 }
      : isCentered
      ? {
          y: 0,
          x: baseXPos,
          scale: 0.85,
          zIndex: index, // Plus petit z-index pour que les cartes se chevauchent naturellement
          filter: 'brightness(0.7)',
        }
      : {
          y: 0,
          x: baseXPos,
          scale: 0.85,
          zIndex: index,
        };

    return (
      <motion.div
        className="absolute cursor-pointer origin-center"
        initial={{ y: 0, x: baseXPos, scale: 0.85 }}
        animate={animate}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
          mass: 0.8,
        }}
        onClick={(e) => {
          e.stopPropagation(); // Prevent event bubbling
          if (isSelected) {
            // If already selected, flip it
            onClick(isFlipped ? null : card.id);
          } else {
            // Otherwise select this card
            onSelect(card.id);
          }
        }}
      >
        <div
          className={`relative w-[280px] h-[380px] transition-transform duration-700 ${
            isSelected ? 'shadow-2xl' : 'shadow-lg'
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transformOrigin: 'center',
          }}
        >
          {/* FRONT */}
          <div
            className="absolute inset-0 rounded-xl bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-sm border border-pink-300/30 shadow-lg flex flex-col p-6"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="w-7 h-7 rounded-full bg-pink-500/20 backdrop-blur-sm flex items-center justify-center text-pink-300 text-xs border border-pink-400/30">
                {card.id}
              </div>
            </div>

            <div className="mb-4">
              <div className="inline-block px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-pink-500/20">
                <p className="text-pink-300 text-xs font-light tracking-wide">
                  {card.category}
                </p>
              </div>
            </div>

            <div className="flex-grow flex items-center justify-center text-center my-2">
              <p className="text-white text-xl font-medium leading-tight">
                {card.question}
              </p>
            </div>

            <div className="mt-auto pt-4 border-t border-pink-500/10 flex justify-between items-center">
              <span className="text-xs text-pink-200/70 font-light italic">
                Nous Deux
              </span>
              <span className="text-xs text-pink-200/50">
                {isSelected
                  ? isFlipped
                    ? 'Cliquez pour fermer'
                    : 'Cliquez pour retourner'
                  : 'Cliquez pour agrandir'}
              </span>
            </div>
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 rounded-xl bg-black/80 backdrop-blur-sm border border-pink-300/30 shadow-lg flex items-center justify-center"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <Image
              src="https://files.catbox.moe/gxcap8.png"
              alt="Logo Nous Deux"
              width={100}
              height={100}
              className="opacity-80"
            />
          </div>
        </div>
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export function FlippableCards() {
  const questionCards = useMemo(
    () => [
      {
        id: 1,
        question: 'Quel est mon plus grand rêve ?',
        category: 'Rêves & Aspirations',
      },
      {
        id: 2,
        question: 'Quelle est ma plus grande peur ?',
        category: 'Émotions',
      },
      {
        id: 3,
        question: 'Où aimerais-je partir en voyage avec toi ?',
        category: 'Aventures',
      },
    ],
    []
  );

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flippedCard, setFlippedCard] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setFlippedCard(null);
    setSelectedCard(null);
  }, [isMobile]);

  const handleFlip = useCallback((cardId) => {
    setFlippedCard(cardId);
  }, []);

  const handleSelect = useCallback((cardId) => {
    setSelectedCard(cardId);
  }, []);

  const goToNextCard = useCallback(() => {
    setCurrentCardIndex((prev) => (prev + 1) % questionCards.length);
    setFlippedCard(null);
  }, [questionCards.length]);

  const goToPrevCard = useCallback(() => {
    setCurrentCardIndex(
      (prev) => (prev - 1 + questionCards.length) % questionCards.length
    );
    setFlippedCard(null);
  }, [questionCards.length]);

  const handleBackgroundClick = useCallback(() => {
    setSelectedCard(null);
    setFlippedCard(null);
  }, []);

  return (
    <div className="relative w-full h-full py-6">
      {isMobile ? (
        <div className="relative w-full h-[400px]">
          <div className="relative w-full h-full flex flex-col items-center">
            <div className="relative w-full h-[350px] flex items-center justify-center mb-4">
              <AnimatePresence mode="wait">
                <Card
                  key={questionCards[currentCardIndex].id}
                  card={questionCards[currentCardIndex]}
                  isSelected={true}
                  isFlipped={flippedCard === questionCards[currentCardIndex].id}
                  index={0}
                  totalCards={1}
                  onSelect={() => {}}
                  onClick={handleFlip}
                  isMobile={true}
                />
              </AnimatePresence>
              <motion.button
                className="absolute left-0 z-50 h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm border border-pink-300/30 flex items-center justify-center text-pink-200"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevCard();
                }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </motion.button>

              <motion.button
                className="absolute right-0 z-50 h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm border border-pink-300/30 flex items-center justify-center text-pink-200"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextCard();
                }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.button>
            </div>

            <div className="flex justify-center gap-2 mt-2">
              {questionCards.map((_, idx) => (
                <motion.div
                  key={idx}
                  className={`h-2 rounded-full cursor-pointer transition-all ${
                    currentCardIndex === idx
                      ? 'w-6 bg-pink-500'
                      : 'w-2 bg-pink-500/30'
                  }`}
                  onClick={() => {
                    setCurrentCardIndex(idx);
                    setFlippedCard(null);
                  }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="relative w-full h-[480px] flex flex-col justify-center items-center"
          style={{ perspective: 1500 }}
          onClick={handleBackgroundClick}
        >
          <div className="text-center w-full text-sm text-pink-200/70 mb-4">
            {selectedCard === null
              ? "Cliquez sur une carte pour l'agrandir"
              : flippedCard === null
              ? 'Cliquez à nouveau pour la retourner ou ailleurs pour revenir'
              : 'Cliquez sur la carte ou ailleurs pour revenir'}
          </div>

          <div className="relative w-full max-w-lg h-[360px] flex items-center justify-center">
            {questionCards.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                isSelected={selectedCard === card.id}
                isFlipped={flippedCard === card.id}
                index={index}
                totalCards={questionCards.length}
                onSelect={handleSelect}
                onClick={handleFlip}
                isMobile={false}
                isCentered={selectedCard !== null && selectedCard !== card.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
