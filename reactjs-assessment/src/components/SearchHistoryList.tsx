import SearchHistoryItem from './SearchHistoryItem';
import type { SearchHistoryEntry } from '../types/place';

interface SearchHistoryListProps {
  history: SearchHistoryEntry[];
  selectedId: string | null | undefined;
  onSelect: (id: string) => void;
  onFavourite: (id: string) => void;
}

export default function SearchHistoryList({ history, selectedId, onSelect, onFavourite }: SearchHistoryListProps) {
  if (history.length === 0) {
    return <p className="text-gray-500 text-sm p-3">No searches yet — try searching for a place above.</p>;
  }

  return (
    <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white">
      {history.map((entry) => (
        <SearchHistoryItem
          key={entry.id}
          entry={entry}
          isSelected={entry.id === selectedId}
          onSelect={onSelect}
          onFavourite={onFavourite}
        />
      ))}
    </ul>
  );
}
