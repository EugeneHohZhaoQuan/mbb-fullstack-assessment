import BookmarkIcon from './BookmarkIcon';
import type { FavouritePlaceResponse } from '../types/place';

interface FavouritesListProps {
  favourites: FavouritePlaceResponse[];
  onUnfavourite: (id: number) => void;
}

export default function FavouritesList({
  favourites,
  onUnfavourite,
}: FavouritesListProps) {
  if (favourites.length === 0) {
    return (
      <p className="text-gray-500 text-sm p-3">
        No favourites yet — star a place from your search history.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-transparent hover:bg-slate-100/5">
      {favourites.map((entry) => (
        <li
          key={entry.id}
          className="flex items-center gap-2 p-3 border-b last:border-b-0"
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{entry.name}</p>
            <p className="text-sm text-gray-500 truncate">{entry.address}</p>
          </div>
          <button
            onClick={() => onUnfavourite(entry.id)}
            className="shrink-0 text-slate-700"
            title="Remove from favourites"
          >
            <BookmarkIcon filled className="w-5 h-5" />
          </button>
        </li>
      ))}
    </ul>
  );
}
