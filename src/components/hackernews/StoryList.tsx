import React, { useState } from 'react';
import { RefreshCw, TrendingUp, Bookmark, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useTopStories, useHackerNewsSearch, useBookmarks } from '@/hooks/useHackerNews';
import { StoryCard } from './StoryCard';
import { SearchFiltersComponent } from './SearchFilters';

const StoryCardSkeleton = () => (
  <div className="p-4 space-y-3">
    <div className="flex gap-3">
      <Skeleton className="w-8 h-4" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  </div>
);

export const StoryList: React.FC = () => {
  const [activeTab, setActiveTab] = useState('top');
  
  const { 
    data: topStories, 
    isLoading: isLoadingTop, 
    refetch: refetchTop 
  } = useTopStories();
  
  const {
    data: searchData,
    isLoading: isLoadingSearch,
    filters,
    updateFilters,
  } = useHackerNewsSearch();

  const {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
  } = useBookmarks();

  const renderTopStories = () => {
    if (isLoadingTop) {
      return (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <StoryCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (!topStories?.length) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No stories found</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {topStories.map((story, index) => (
          <StoryCard
            key={story.objectID}
            story={story}
            rank={index + 1}
            isBookmarked={isBookmarked(story.objectID)}
            onBookmark={addBookmark}
            onRemoveBookmark={removeBookmark}
          />
        ))}
      </div>
    );
  };

  const renderSearchResults = () => {
    if (isLoadingSearch) {
      return (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <StoryCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (!searchData?.hits?.length) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No results found</p>
          <p className="text-sm mt-2">Try adjusting your search filters</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {searchData.hits.map((story) => (
          <StoryCard
            key={story.objectID}
            story={story}
            isBookmarked={isBookmarked(story.objectID)}
            onBookmark={addBookmark}
            onRemoveBookmark={removeBookmark}
          />
        ))}
      </div>
    );
  };

  const renderBookmarks = () => {
    if (!bookmarks.length) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No bookmarks yet</p>
          <p className="text-sm mt-2">Bookmark stories to read them later</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {bookmarks.map((story) => (
          <StoryCard
            key={story.objectID}
            story={story}
            isBookmarked={true}
            onBookmark={addBookmark}
            onRemoveBookmark={removeBookmark}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hacker News</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with the latest tech stories and discussions
          </p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchTop()}
          disabled={isLoadingTop}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingTop ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="top" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Top Stories
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-2">
            <SearchIcon className="w-4 h-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="gap-2">
            <Bookmark className="w-4 h-4" />
            Bookmarks {bookmarks.length > 0 && `(${bookmarks.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="top" className="space-y-6">
          {renderTopStories()}
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <SearchFiltersComponent
            filters={filters}
            onFiltersChange={updateFilters}
            resultsCount={searchData?.nbHits}
          />
          {renderSearchResults()}
        </TabsContent>

        <TabsContent value="bookmarks" className="space-y-6">
          {renderBookmarks()}
        </TabsContent>
      </Tabs>
    </div>
  );
};