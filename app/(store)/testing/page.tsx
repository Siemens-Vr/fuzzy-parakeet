"use client"

import Carding from "@/components/layout/Carding"

export default function TestingPage() {
  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Testing Carding Component</h1>
      <div style={demoContainer}>
        <Carding />
      </div>
      <p style={hintStyle}>Hover over the card to see the animation</p>
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  backgroundColor: "#050505",
  color: "#fff",
  fontFamily: "sans-serif",
}

const titleStyle: React.CSSProperties = {
  marginBottom: "2rem",
  fontSize: "2rem",
  color: "#0cdcf7",
}

const demoContainer: React.CSSProperties = {
  padding: "3rem",
  border: "1px solid #333",
  borderRadius: "12px",
  background: "rgba(255, 255, 255, 0.02)",
}

const hintStyle: React.CSSProperties = {
  marginTop: "1rem",
  color: "#666",
}
