import { useMemo } from "react";
import { Header } from "./components/Header";
import { MainHero } from "./components/MainHero";
import { ClashMarquee } from "./components/ClashMarquee";
import { BottomNav } from "./components/BottomNav";
import { AdminPage } from "./pages/AdminPage";

function App() {
  const isAdminPath = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.location.pathname.startsWith("/admin");
  }, []);

  if (isAdminPath) {
    return <AdminPage />;
  }

  return (
    <div className="relative min-h-screen pb-24">
      <div className="galactic-bg" />
      
      <Header />
      
      <main className="relative z-10 w-full max-w-md mx-auto">
        <MainHero />
        <div className="mt-8">
          <ClashMarquee />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default App;
