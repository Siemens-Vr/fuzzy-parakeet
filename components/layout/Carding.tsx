"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export default function Carding() {
    const [hovered, setHovered] = useState(false)

    return (
        <motion.div
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            className="card-custom"
        >
            {/* subtle big dark circle (right side) */}
            <div className="card-big-shadow" />

            {/* top-left neon ring (partially off-card) */}
            <motion.div
                className="card-ring card-ring-topLeft"
                animate={hovered ? "hover" : "rest"}
                variants={ringVariants}
            />

            {/* right small white ring */}
            <motion.div
                className="card-ring card-ring-right"
                animate={hovered ? "hover" : "rest"}
                variants={ringVariants}
            />

            {/* Text */}
            <div className="card-custom-content">
                <div className="card-custom-title">What People Are</div>
                <div className="card-custom-title">Playing</div>
            </div>
        </motion.div>
    )
}

/**
 * Keyframe hover animation (your style)
 */
const ringVariants = {
    rest: {
        scale: 1,
        transition: { duration: 0.3, ease: "easeOut" },
    },
    hover: {
        scale: [1, 1.1, 1.6],
        transition: {
            duration: 1.5,
            times: [0, 0.6, 1],
            ease: ["easeInOut", "easeOut"],
        },
    },
}
