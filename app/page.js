"use client"

import { useState, useEffect } from "react"
import Navbar from "../components/Navbar.js"
import Hero from "../components/Hero.js"
import { supabase } from "../lib/supabaseClient.js"

export default function Home() {
  // Auth state
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authMode, setAuthMode] = useState("login") // "login" or "signup"
  const [authError, setAuthError] = useState("")

  // Calculator state
  const [bill, setBill] = useState("")
  const [tip, setTip] = useState("")
  const [tipAmount, setTipAmount] = useState(null)
  const [total, setTotal] = useState(null)

  // Check if a user is already logged in when the page loads
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for login/logout events
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])



  async function handleLogin() {
    setAuthError("")
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  async function handleSignUp() {
  setAuthError("")

  // Create the user's login account
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    setAuthError(error.message)
    return
  }

  // Create a matching row in the profiles table for this new user
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: data.user.id,
      is_pro: false,
    })

  if (profileError) {
    console.log("Error creating profile:", profileError.message)
  }
}

  async function handleUpgrade() {
  // Call our API route, sending the logged-in user's id and email

console.log("Upgrading user:", user.id, user.email)

  const res = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user.id,
      userEmail: user.email,
    }),
  })

  // The API route sends back a Stripe checkout URL
  const data = await res.json()

  // Send the browser to that URL — this is Stripe's hosted payment page
  if (data.url) {
    window.location.href = data.url
  } else {
    console.log("Error creating checkout session:", data.error)
  }
}

async function calculateTip() {
  // Check if this user is Pro by looking up their profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("id", user.id)
    .single()

  const isPro = profile?.is_pro ?? false

  // If they're not Pro, check how many calculations they've done
  if (!isPro) {
    const { count } = await supabase
      .from("calculations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    // If they've hit the limit, block the calculation and show upgrade message
    if ((count ?? 0) >= 3) {
      alert("You've used your 3 free calculations. Upgrade to Pro for unlimited access!")
      return // stop here — don't run the calculation
    }
  }

  // If we get here, either they're Pro or under the limit — run the calculation
  const billNum = parseFloat(bill)
  const tipNum = parseFloat(tip)
  const calculatedTip = billNum * (tipNum / 100)
  const calculatedTotal = billNum + calculatedTip
  setTipAmount(calculatedTip.toFixed(2))
  setTotal(calculatedTotal.toFixed(2))

  const { error } = await supabase
    .from("calculations")
    .insert({
      bill_amount: billNum,
      tip_percent: tipNum,
      tip_amount: calculatedTip,
      total: calculatedTotal,
      user_id: user.id,
    })

  if (error) {
    console.log("Error saving to database:", error.message)
  } else {
    console.log("Calculation saved!")
  }
}

  // If no user is logged in, show the auth form
  if (!user) {
    return (
      <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ maxWidth: "400px", margin: "80px auto", padding: "40px 24px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
          <h2 style={{ marginBottom: "24px", color: "#222" }}>
            {authMode === "login" ? "Log In" : "Sign Up"}
          </h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ display: "block", width: "100%", padding: "12px", fontSize: "16px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ccc" }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: "block", width: "100%", padding: "12px", fontSize: "16px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ccc" }}
          />

          {authError && (
            <p style={{ color: "red", marginBottom: "12px" }}>{authError}</p>
          )}

          <button
            onClick={authMode === "login" ? handleLogin : handleSignUp}
            style={{ width: "100%", padding: "12px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", marginBottom: "12px" }}
          >
            {authMode === "login" ? "Log In" : "Sign Up"}
          </button>

          <p style={{ textAlign: "center", color: "#666" }}>
            {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
              style={{ color: "#4f46e5", cursor: "pointer" }}
            >
              {authMode === "login" ? "Sign Up" : "Log In"}
            </span>
          </p>
        </div>
      </div>
    )
  }

  // If user is logged in, show the calculator
  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <Navbar />
      <Hero />

      <div style={{ maxWidth: "400px", margin: "0 auto", padding: "40px 24px" }}>

        <p style={{ color: "#666", marginBottom: "16px" }}>Logged in as {user.email}</p>

        <button
          onClick={handleLogout}
          style={{ marginBottom: "24px", padding: "8px 16px", backgroundColor: "#e5e7eb", border: "none", borderRadius: "8px", cursor: "pointer" }}
        >
          Log Out
        </button>

        <button
          onClick={handleUpgrade}
          style={{ marginBottom: "24px", marginLeft: "12px", padding: "8px 16px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
        >
          Upgrade to Pro
        </button>
        

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