import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface ProjectSearchProps {
  initialValue?: string;
  onSearch: (value: string) => void;
  placeholder?: string;
}

/**
 * Debounced project text search box.
 */
export default function ProjectSearch({
  initialValue = '',
  onSearch,
  placeholder = 'Search by name, key, tags...',
}: ProjectSearchProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(value);
    }, 400);

    return () => clearTimeout(handler);
  }, [value, onSearch]);

  return (
    <div className="relative w-full">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground stroke-[2.2]" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 text-sm rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded transition-colors"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
