import { Search, MapPin } from 'lucide-react';

interface CreationSearchProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleSearchInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleKeyDown: (e: React.KeyboardEvent) => void;
    showSuggestions: boolean;
    suggestions: any[];
    handleSelectCity: (city: any) => void;
    setShowSuggestions: (show: boolean) => void;
}

export function CreationSearch({
    searchQuery,
    // setSearchQuery,
    handleSearchInput,
    handleKeyDown,
    showSuggestions,
    suggestions,
    handleSelectCity,
    setShowSuggestions
}: CreationSearchProps) {
    return (
        <div className="absolute top-3.5 left-16 lg:left-4 z-[1000] w-[calc(100%-8rem)] lg:w-[calc(100%-2rem)] max-w-sm transition-[left] duration-200">
            <div className="relative group">
                <div className="absolute left-3 top-2.5 text-[hsl(var(--text-secondary))] group-focus-within:text-[hsl(var(--text-primary))] transition-colors">
                    <Search size={18} />
                </div>
                <input
                    className="w-full h-10 pl-10 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))]/95 backdrop-blur border border-[hsl(var(--border-primary))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] shadow-xl transition-colors placeholder:text-[hsl(var(--text-muted))]"
                    placeholder="Search cities..."
                    value={searchQuery}
                    onChange={handleSearchInput}
                    onKeyDown={handleKeyDown}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                />

                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-primary))] rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                        {suggestions.map((item, index) => (
                            <button
                                key={index}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#282e39] flex items-center gap-2 transition-colors border-b border-[hsl(var(--border-primary))] last:border-0"
                                onClick={() => handleSelectCity(item)}
                            >
                                <MapPin size={14} className="text-[hsl(var(--text-secondary))] shrink-0" />
                                <span className="truncate">
                                    <span className="font-medium text-[hsl(var(--text-primary))]">
                                        {item.address?.city || item.address?.town || item.address?.village || item.name}
                                    </span>
                                    <span className="text-[hsl(var(--text-secondary))] text-xs ml-1.5 opacity-70">
                                        {item.address?.country}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
