import type { FavouriteStatus, SearchHistoryEntry } from '../types/place';

const FAVOURITE_TITLE: Record<FavouriteStatus, string> = {
  idle: 'Mark as favourite',
  loading: 'Saving…',
  succeeded: 'Saved as favourite',
  failed: 'Failed to save — click to retry',
};

interface SearchHistoryItemProps {
  entry: SearchHistoryEntry;
  isSelected: boolean;
  isFavourited: boolean;
  onSelect: (id: string) => void;
  onFavourite: (id: string) => void;
}

export default function SearchHistoryItem({
  entry,
  isSelected,
  isFavourited,
  onSelect,
  onFavourite,
}: SearchHistoryItemProps) {
  const status = isFavourited ? 'succeeded' : entry.favourite.status;

  return (
    <li className={`flex items-center gap-2 p-3 border-b last:border-b-0 ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
      <button onClick={() => onSelect(entry.id)} className="text-left flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{entry.name}</p>
        <p className="text-sm text-gray-500 truncate">{entry.address}</p>
        <p className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleString()}</p>
      </button>
      <button
        onClick={() => onFavourite(entry.id)}
        disabled={status === 'loading' || status === 'succeeded'}
        className="text-xl leading-none disabled:cursor-not-allowed disabled:opacity-60 shrink-0"
        title={FAVOURITE_TITLE[status]}
      >
        {status === 'succeeded' ? '⭐' : '☆'}
      </button>
    </li>
  );
}
