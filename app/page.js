"use client"

import { useState } from "react"
import Navbar from "../components/Navbar.js"
import Hero from "../components/Hero.js"

export default function Home() {
  const [bill, setBill] = useState("")
  const [tip, setTip] = useState("")
  const [tipAmount, setTipAmount] = useState(null)
  const [total, setTotal] = useState(null)

  function calculateTip() {
    const billNum = parseFloat(bill)
    const tipNum = parseFloat(tip)
    const calculatedTip = billNum * (tipNum / 100)
    const calculatedTotal = billNum + calculatedTip
    setTipAmount(calculatedTip.toFixed(2))
    setTotal(calculatedTotal.toFixed(2))
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>

      <Navbar />
      
      <Hero />

      <div style={{ maxWidth: "400px", margin: "0 auto", padding: "40px 24px" }}>

        <input
          type="number"
          placeholder="Enter bill amount"
          value={bill}
          onChange={(e) => setBill(e.target.value)}
          style={{ display: "block", width: "100%", padding: "12px", fontSize: "16px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ccc" }}
        />

        <input
          type="number"
          placeholder="Tip % (e.g. 20)"
          value={tip}
          onChange={(e) => setTip(e.target.value)}
          style={{ display: "block", width: "100%", padding: "12px", fontSize: "16px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ccc" }}
        />

        <button
          onClick={calculateTip}
          style={{ width: "100%", padding: "12px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer" }}
        >
          Calculate
        </button>

        {tipAmount && (
          <div style={{ marginTop: "24px" }}>
            <p style={{ fontSize: "18px", color: "#222222" }}>Tip: ${tipAmount}</p>
            <p style={{ fontSize: "18px", fontWeight: "bold", color: "#222222" }}>Total: ${total}</p>
          </div>
        )}

      </div>
    </div>
  )
}