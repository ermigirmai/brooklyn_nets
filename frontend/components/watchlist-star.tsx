type WatchlistStarProps = {
  isSelected: boolean;
  onToggle: () => void;
  playerName: string;
};

export function WatchlistStar({
  isSelected,
  onToggle,
  playerName,
}: WatchlistStarProps) {
  const action = isSelected ? "Remove from watchlist" : "Add to watchlist";

  return (
    <button
      type="button"
      aria-label={`${action}: ${playerName}`}
      aria-pressed={isSelected}
      title={action}
      onClick={onToggle}
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border text-2xl leading-none transition ${
        isSelected
          ? "border-[#f2c94c]/60 bg-[#f2c94c]/10 text-[#f2c94c]"
          : "border-white/15 text-white/40 hover:border-[#f2c94c]/60 hover:text-[#f2c94c]"
      }`}
    >
      <span aria-hidden="true">{isSelected ? "★" : "☆"}</span>
    </button>
  );
}
