import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SearchFilters } from '@/types/hackernews';

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  resultsCount?: number;
}

export const SearchFiltersComponent: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  resultsCount,
}) => {
  const handleClearFilters = () => {
    onFiltersChange({
      query: '',
      tags: 'story',
      dateRange: 'all',
      sortBy: 'search',
    });
  };

  const hasActiveFilters = filters.query || filters.tags !== 'story' || filters.dateRange !== 'all' || filters.sortBy !== 'search';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search stories, comments, and more..."
            value={filters.query}
            onChange={(e) => onFiltersChange({ query: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filters.tags} onValueChange={(tags) => onFiltersChange({ tags })}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="story">Stories</SelectItem>
              <SelectItem value="ask_hn">Ask HN</SelectItem>
              <SelectItem value="show_hn">Show HN</SelectItem>
              <SelectItem value="job">Jobs</SelectItem>
              <SelectItem value="poll">Polls</SelectItem>
              <SelectItem value="comment">Comments</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.dateRange} onValueChange={(dateRange: any) => onFiltersChange({ dateRange })}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="day">Past day</SelectItem>
              <SelectItem value="week">Past week</SelectItem>
              <SelectItem value="month">Past month</SelectItem>
              <SelectItem value="year">Past year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.sortBy} onValueChange={(sortBy: any) => onFiltersChange({ sortBy })}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="search">Relevance</SelectItem>
              <SelectItem value="search_by_date">Date</SelectItem>
              <SelectItem value="points">Points</SelectItem>
              <SelectItem value="comments">Comments</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="h-7"
            >
              <X className="w-3 h-3 mr-1" />
              Clear filters
            </Button>
          )}
          
          {filters.query && (
            <Badge variant="secondary" className="text-xs">
              Query: "{filters.query}"
            </Badge>
          )}
          
          {filters.tags !== 'story' && (
            <Badge variant="secondary" className="text-xs">
              Type: {filters.tags.replace('_', ' ')}
            </Badge>
          )}
          
          {filters.dateRange !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Time: {filters.dateRange}
            </Badge>
          )}
        </div>

        {resultsCount !== undefined && (
          <span className="text-sm text-muted-foreground">
            {resultsCount.toLocaleString()} results
          </span>
        )}
      </div>
    </div>
  );
};