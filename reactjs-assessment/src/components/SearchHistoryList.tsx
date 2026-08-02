import SearchHistoryItem from './SearchHistoryItem';
import type { SearchHistoryEntry } from '../types/place';

interface SearchHistoryListProps {
  history: SearchHistoryEntry[];
  selectedId: string | null | undefined;
  favouritePlaceIds: Set<string>;
  onSelect: (id: string) => void;
  onFavourite: (id: string) => void;
}

export default function SearchHistoryList({
  history,
  selectedId,
  favouritePlaceIds,
  onSelect,
  onFavourite,
}: SearchHistoryListProps) {
  if (history.length === 0) {
    return (
      <p className="text-gray-500 text-sm p-3">
        No searches yet — try searching for a place above.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-transparent hover:bg-slate-100/5">
      {history.map((entry) => (
        <SearchHistoryItem
          key={entry.id}
          entry={entry}
          isSelected={entry.id === selectedId}
          isFavourited={favouritePlaceIds.has(entry.placeId)}
          onSelect={onSelect}
          onFavourite={onFavourite}
        />
      ))}
    </ul>
  );
}
