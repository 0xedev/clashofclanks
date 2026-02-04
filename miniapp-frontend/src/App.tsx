import { useMemo } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
// import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { AdminPage } from "./pages/AdminPage";
import { Home } from "./pages/Home";
import { Battles } from "./pages/Battles";
import { Staking } from "./pages/Staking";
import { Profile } from "./pages/Profile";
import { About } from "./pages/About";
import { BattleDetail } from "./pages/BattleDetail";
import { Leaderboard } from "./pages/Leaderboard";

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isHome = location.pathname === "/" || location.pathname === "/home";

  return (
    <div className="relative min-h-screen pb-24 flex flex-col items-center">
      <div className={`galactic-bg ${!isHome ? "galactic-bg--blur" : ""}`} />
      {/* <Header /> */}
      <main className="relative z-10 w-full max-w-md md:max-w-2xl lg:max-w-4xl flex-1 flex flex-col">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  if (isAdminPath) {
    return <AdminPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/battles" element={<Battles />} />
        <Route path="/battles/:id" element={<BattleDetail />} />
        <Route path="/staking" element={<Staking />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
