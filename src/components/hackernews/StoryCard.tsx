import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, MessageCircle, TrendingUp, Bookmark, BookmarkCheck, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HNStory } from '@/types/hackernews';
import { cn } from '@/lib/utils';

interface StoryCardProps {
  story: HNStory;
  rank?: number;
  isBookmarked: boolean;
  onBookmark: (story: HNStory) => void;
  onRemoveBookmark: (objectID: string) => void;
  className?: string;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  rank,
  isBookmarked,
  onBookmark,
  onRemoveBookmark,
  className,
}) => {
  const timeAgo = formatDistanceToNow(new Date(story.created_at), { addSuffix: true });
  const domain = story.url ? new URL(story.url).hostname.replace('www.', '') : null;
  
  const handleShare = async () => {
    const shareData = {
      title: story.title,
      url: story.url || `https://news.ycombinator.com/item?id=${story.objectID}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareData.url);
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
    }
  };

  const highlightText = (text: string) => {
    if (!story._highlightResult?.title) return text;
    
    return (
      <span 
        dangerouslySetInnerHTML={{ 
          __html: story._highlightResult.title.value.replace(
            /<em>/g, '<mark class="bg-primary/20 text-primary">'
          ).replace(/<\/em>/g, '</mark>')
        }} 
      />
    );
  };

  return (
    <Card className={cn("group hover:shadow-md transition-all duration-200", className)}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {rank && (
            <div className="flex-shrink-0 w-8 text-sm text-muted-foreground font-mono">
              {rank}.
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-medium leading-tight group-hover:text-primary transition-colors">
                {story.url ? (
                  <a
                    href={story.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    {highlightText(story.title)}
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                ) : (
                  <a
                    href={`https://news.ycombinator.com/item?id=${story.objectID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {highlightText(story.title)}
                  </a>
                )}
              </h3>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => isBookmarked ? onRemoveBookmark(story.objectID) : onBookmark(story)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 text-primary" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </Button>
            </div>

            {domain && (
              <p className="text-sm text-muted-foreground mb-2">
                {domain}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>{story.points} points</span>
              </div>
              
              <span>by {story.author}</span>
              
              <span>{timeAgo}</span>
              
              {story.num_comments > 0 && (
                <a
                  href={`https://news.ycombinator.com/item?id=${story.objectID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>{story.num_comments} comments</span>
                </a>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleShare}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
              >
                <Share2 className="w-3 h-3" />
              </Button>
            </div>

            {story._tags && story._tags.length > 0 && (
              <div className="flex gap-1 mt-2">
                {story._tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};