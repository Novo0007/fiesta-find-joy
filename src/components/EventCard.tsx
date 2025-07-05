
import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, Heart, Share2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import TicketBookingModal from "./TicketBookingModal";
import { Event } from "@/hooks/useEvents";

interface EventCardProps {
  event: Event;
  onBookingComplete?: () => void;
}

const EventCard = ({ event, onBookingComplete }: EventCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

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
    console.log('Sharing event:', event.title);
  };

  const handleBookTickets = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsBookingModalOpen(true);
  };

  const handleBookingComplete = () => {
    if (onBookingComplete) {
      onBookingComplete();
    }
  };

  // Convert string event to Event interface format
  const eventData: Event = {
    id: event.id,
    title: event.title,
    description: event.description || "",
    date: event.date,
    time: event.time,
    venue: event.venue,
    price: Number(event.price) || 0,
    max_attendees: event.max_attendees,
    current_attendees: event.current_attendees || 0,
    image: event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
    category: event.category || "General",
    tags: event.tags,
    organizer_id: event.organizer_id,
    status: event.status || "active",
    created_at: event.created_at || "",
    updated_at: event.updated_at || "",
    tickets_sold: event.tickets_sold || 0,
    ticket_limit: event.ticket_limit
  };

  return (
    <>
      <Card className="group bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border-0 shadow-lg">
        <Link to={`/event/${event.id}`}>
          <CardHeader className="p-0 relative">
            <div className="aspect-video overflow-hidden">
              <img 
                src={eventData.image} 
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="absolute top-4 left-4">
              <Badge className="bg-white/90 text-gray-800 backdrop-blur-sm">
                {eventData.category}
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
                  {eventData.description}
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
                <span>{eventData.current_attendees} attending</span>
              </div>
            </div>
          </Link>
        </CardContent>

        <CardFooter className="p-6 pt-0 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {eventData.price === 0 ? 'Free' : `₹${eventData.price}`}
            </p>
            {event.max_attendees && (
              <p className="text-sm text-gray-500">
                {event.max_attendees - eventData.current_attendees} left
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link to={`/event/${event.id}`}>
              <Button variant="outline" className="rounded-full px-4">
                Details
              </Button>
            </Link>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-6 transition-all duration-300 hover:scale-105"
              onClick={handleBookTickets}
            >
              Book Now
            </Button>
          </div>
        </CardFooter>
      </Card>

      <TicketBookingModal
        event={eventData}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingComplete={handleBookingComplete}
      />
    </>
  );
};

export default EventCard;
