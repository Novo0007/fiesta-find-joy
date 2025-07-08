import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HNStory, HNSearchResponse, SearchFilters } from '@/types/hackernews';

const HN_API_BASE = 'https://hn.algolia.com/api/v1';

const searchAlgolia = async (query: string, params: any): Promise<HNSearchResponse> => {
  const searchParams = new URLSearchParams({
    query: query || '',
    ...params,
  });
  
  const response = await fetch(`${HN_API_BASE}/search?${searchParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch from Hacker News API');
  }
  
  return response.json();
};

// Custom hook for fetching top stories
export const useTopStories = (refreshInterval = 300000) => {
  return useQuery({
    queryKey: ['topStories'],
    queryFn: async (): Promise<HNStory[]> => {
      const { hits } = await searchAlgolia('', {
        tags: 'story',
        hitsPerPage: '100',
      });
      return hits;
    },
    refetchInterval: refreshInterval,
    staleTime: 60000, // 1 minute
  });
};

// Custom hook for search with debouncing
export const useHackerNewsSearch = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    tags: 'story',
    dateRange: 'all',
    sortBy: 'search',
  });
  
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounce search query
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(filters.query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filters.query]);

  const searchQuery = useQuery({
    queryKey: ['search', debouncedQuery, filters.tags, filters.dateRange, filters.sortBy],
    queryFn: async (): Promise<HNSearchResponse> => {
      const params: any = {
        tags: filters.tags,
        hitsPerPage: '50',
      };

      // Add date filtering
      if (filters.dateRange !== 'all') {
        const now = Date.now() / 1000;
        const timeRanges = {
          day: 86400,
          week: 604800,
          month: 2592000,
          year: 31536000,
        };
        params.numericFilters = `created_at_i>${now - timeRanges[filters.dateRange]}`;
      }

      // For date sorting, use different endpoint
      const baseUrl = filters.sortBy === 'search_by_date' 
        ? `${HN_API_BASE}/search_by_date`
        : `${HN_API_BASE}/search`;

      const searchParams = new URLSearchParams({
        query: debouncedQuery || '',
        ...params,
      });
      
      const response = await fetch(`${baseUrl}?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      
      return response.json();
    },
    enabled: true,
  });

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    data: searchQuery.data,
    isLoading: searchQuery.isLoading,
    error: searchQuery.error,
    filters,
    updateFilters,
  };
};

// Bookmarks management
export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<HNStory[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('hn-bookmarks');
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse bookmarks:', error);
      }
    }
  }, []);

  const saveBookmarks = useCallback((newBookmarks: HNStory[]) => {
    setBookmarks(newBookmarks);
    localStorage.setItem('hn-bookmarks', JSON.stringify(newBookmarks));
  }, []);

  const addBookmark = useCallback((story: HNStory) => {
    const newBookmarks = [...bookmarks, story];
    saveBookmarks(newBookmarks);
  }, [bookmarks, saveBookmarks]);

  const removeBookmark = useCallback((objectID: string) => {
    const newBookmarks = bookmarks.filter(b => b.objectID !== objectID);
    saveBookmarks(newBookmarks);
  }, [bookmarks, saveBookmarks]);

  const isBookmarked = useCallback((objectID: string) => {
    return bookmarks.some(b => b.objectID === objectID);
  }, [bookmarks]);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
  };
};