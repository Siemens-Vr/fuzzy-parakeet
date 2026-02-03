"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"

type SeeMoreCardProps = {
  showMoreUrl: string
  buttonText?: string
}

export default function SeeMoreCard({ showMoreUrl, buttonText = "Show more" }: SeeMoreCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="card-custom"
    >
      {/* Ambient shadow circle */}
      <div className="card-big-shadow" />

      {/* Top-left ring */}
      <motion.div
        className="card-ring card-ring-topLeft"
        animate={hovered ? "hover" : "rest"}
        variants={ringVariants}
      />

      {/* Right ring */}
      <motion.div
        className="card-ring card-ring-right"
        animate={hovered ? "hover" : "rest"}
        variants={ringVariants}
      />

      {/* Content */}
      <div className="card-custom-content">
        <div className="card-custom-title">Want to see more?</div>
        <div className="card-custom-subtitle">Explore more apps, games and experiences.</div>

        <Link href={showMoreUrl} style={{ textDecoration: "none" }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="card-custom-button"
          >
            {buttonText} →
          </motion.button>
        </Link>
      </div>
    </motion.div>
  )
}

/**
 * Same keyframe hover animation style
 */
const ringVariants = {
  rest: {
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  hover: {
    scale: [1, 1.1, 1.6],
    transition: {
      duration: 0.5,
      times: [0, 0.6, 1],
      ease: ["easeInOut", "easeOut"],
    },
  },
}
