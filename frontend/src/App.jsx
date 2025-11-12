import Navbar from "./components/Navbar";
import Login from "./components/Login";
import { Routes, Route } from "react-router-dom";

function Home() {
  return (
    <main style={{ marginTop: 120, textAlign: "center" }}>
      <h1>Bienvenido a Gestión Solar</h1>
      <p>Pulsa “Ingresar” en la barra superior.</p>
    </main>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<div style={{marginTop:120, textAlign:"center"}}>404</div>} />
      </Routes>
    </>
  );
}
