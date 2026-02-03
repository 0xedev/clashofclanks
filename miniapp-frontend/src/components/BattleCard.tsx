import "./battle.css";

export interface Battle {
  id: number;
  token1: {
    address: string;
    name: string;
    symbol: string;
  };
  token2: {
    address: string;
    name: string;
    symbol: string;
  };
  startTime: number;
  endTime: number;
  totalBets: string;
  spotlightBattle: boolean;
  theme: string;
}

interface BattleCardProps {
  battle: Battle;
}

function SpotlightIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 2.5l2.9 5.88 6.5.95-4.7 4.57 1.1 6.47L12 17.8l-5.8 3.07 1.1-6.47-4.7-4.57 6.5-.95L12 2.5z"
      />
    </svg>
  );
}

export function BattleCard({ battle }: BattleCardProps) {
  const timeRemainingSeconds = battle.endTime - Date.now() / 1000;
  const timeRemaining = Math.max(0, Math.floor(timeRemainingSeconds / 3600));

  return (
    <div
      className={`battle-card ${
        battle.spotlightBattle ? "battle-card--spotlight" : ""
      }`}
    >
      {battle.spotlightBattle && (
        <div className="battle-card__badge">
          <SpotlightIcon />
          Spotlight
        </div>
      )}

      <div>
        <span className="battle-card__theme">{battle.theme} Battle</span>
      </div>

      <div className="battle-card__row" style={{ marginTop: 10 }}>
        <div className="battle-card__token">
          <span className="battle-card__symbol">{battle.token1.symbol}</span>
          <span className="battle-card__name">{battle.token1.name}</span>
        </div>
        <button className="battle-card__action" type="button">
          Bet
        </button>
      </div>

      <div className="battle-card__divider" style={{ margin: "8px 0" }}>
        VS
      </div>

      <div className="battle-card__row">
        <div className="battle-card__token">
          <span className="battle-card__symbol">{battle.token2.symbol}</span>
          <span className="battle-card__name">{battle.token2.name}</span>
        </div>
        <button
          className="battle-card__action battle-card__action--secondary"
          type="button"
        >
          Bet
        </button>
      </div>

      <div className="battle-card__stats">
        <div className="battle-card__stat">
          <span>Total Pool</span>
          <strong>{Number(battle.totalBets).toLocaleString()} COC</strong>
        </div>
        <div className="battle-card__stat">
          <span>Time Remaining</span>
          <strong>{timeRemaining}h</strong>
        </div>
      </div>

      <button className="battle-card__details" type="button">
        View Details
      </button>
    </div>
  );
}
