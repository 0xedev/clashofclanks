import { useEffect, useState } from "react";

import "./battle.css";
import { BattleCard, type Battle } from "./BattleCard";

export function BattleList() {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBattles();
  }, []);

  const fetchBattles = async () => {
    try {
      const mockBattles: Battle[] = [
        {
          id: 1,
          token1: {
            address: "0x...",
            name: "Pepe Supreme",
            symbol: "PEPES",
          },
          token2: {
            address: "0x...",
            name: "Doge Ultimate",
            symbol: "DOGEU",
          },
          startTime: Date.now() / 1000,
          endTime: Date.now() / 1000 + 7 * 24 * 60 * 60,
          totalBets: "125000",
          spotlightBattle: true,
          theme: "Meme",
        },
      ];

      setBattles(mockBattles);
    } catch (error) {
      console.error("Error fetching battles:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="battle-list"
        style={{ alignItems: "center", justifyItems: "center" }}
      >
        <div className="spinner" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="battle-list">
      <div className="battle-list__header">
        <h2 className="battle-list__title">Active Battles</h2>
      </div>

      {battles.length === 0 ? (
        <div className="battle-list__empty">
          <p>No active battles</p>
          <p>Check back soon for new matchups.</p>
        </div>
      ) : (
        <div className="battle-grid">
          {battles.map((battle) => (
            <BattleCard key={battle.id} battle={battle} />
          ))}
        </div>
      )}
    </div>
  );
}
