export default function Navbar() {
  return (
    <nav style={{ width: "100%", padding: "16px 32px", backgroundColor: "#4f46e5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "white", fontSize: "20px", fontWeight: "bold" }}>
        TipCalc
      </span>
      <span style={{ color: "white", fontSize: "16px", cursor: "pointer" }}>
        Try it free
      </span>
    </nav>
  )
}