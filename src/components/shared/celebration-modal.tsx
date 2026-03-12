'use client'

import { useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CelebrationModalProps {
  show: boolean
  message: string
  onClose: () => void
}

const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444']

function generateParticles() {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
  }))
}

export function CelebrationModal({ show, message, onClose }: CelebrationModalProps) {
  const particles = useMemo(() => (show ? generateParticles() : []), [show])

  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
          onClick={onClose}
        >
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, y: '50vh', x: `${p.x}vw`, scale: 0 }}
              animate={{
                opacity: 0,
                y: `${p.y - 50}vh`,
                scale: [0, 1.5, 0],
              }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute h-3 w-3 rounded-full"
              style={{ backgroundColor: p.color }}
            />
          ))}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="bg-card rounded-2xl p-8 shadow-xl text-center max-w-sm mx-4"
          >
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-lg font-semibold">{message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
