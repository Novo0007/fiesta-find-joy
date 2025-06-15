
import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, Heart, Share2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  price: number;
  image: string;
  category: string;
  organizer: string;
  attendees: number;
}

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const [isLiked, setIsLiked] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLiked(!isLiked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    // Add share functionality here
    console.log('Sharing event:', event.title);
  };

  return (
    <Card className="group bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border-0 shadow-lg">
      <Link to={`/event/${event.id}`}>
        <CardHeader className="p-0 relative">
          <div className="aspect-video overflow-hidden">
            <img 
              src={event.image} 
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="absolute top-4 left-4">
            <Badge className="bg-white/90 text-gray-800 backdrop-blur-sm">
              {event.category}
            </Badge>
          </div>
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              className={`w-8 h-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white ${
                isLiked ? 'text-red-500' : 'text-gray-600'
              }`}
              onClick={handleLike}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-600"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
      </Link>

      <CardContent className="p-6">
        <Link to={`/event/${event.id}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                {event.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {event.description}
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
              <span>{formatDate(event.date)} at {event.time}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-green-500" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2 text-purple-500" />
              <span>{event.attendees} attending</span>
            </div>
          </div>
        </Link>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">by {event.organizer}</p>
          <p className="text-2xl font-bold text-gray-900">
            {event.price === 0 ? 'Free' : `$${event.price}`}
          </p>
        </div>
        <Link to={`/event/${event.id}`}>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-6 transition-all duration-300 hover:scale-105">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
