export interface HNStory {
  objectID: string;
  title: string;
  url?: string;
  author: string;
  points: number;
  story_text?: string;
  comment_text?: string;
  num_comments: number;
  created_at: string;
  created_at_i: number;
  _tags: string[];
  _highlightResult?: {
    title?: {
      value: string;
      matchLevel: string;
      matchedWords: string[];
    };
    story_text?: {
      value: string;
      matchLevel: string;
      matchedWords: string[];
    };
  };
}

export interface HNSearchResponse {
  hits: HNStory[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  exhaustiveNbHits: boolean;
  processingTimeMS: number;
}

export interface SearchFilters {
  query: string;
  tags: string;
  dateRange: 'all' | 'day' | 'week' | 'month' | 'year';
  sortBy: 'search' | 'search_by_date' | 'points' | 'comments';
}

export interface BookmarkedStory {
  objectID: string;
  title: string;
  url?: string;
  author: string;
  points: number;
  bookmarkedAt: number;
}