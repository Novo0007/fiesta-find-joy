import { useState } from "react";
import { Search, Filter, Calendar, MapPin, DollarSign, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Header from "@/components/Header";
import EventCard from "@/components/EventCard";
import { Event } from "@/hooks/useEvents";

const Browse = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // Mock events data - formatted to match Event interface
  const allEvents: Event[] = [
    {
      id: "tech-conf-2024",
      title: "Tech Conference 2024",
      description: "Join industry leaders for cutting-edge tech discussions and networking opportunities",
      date: "2024-07-15",
      time: "09:00:00",
      venue: "Convention Center, Downtown",
      price: 149,
      max_attendees: 500,
      current_attendees: 234,
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      category: "Technology",
      tags: ["tech", "conference", "networking"],
      organizer_id: "org-1",
      status: "active",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      tickets_sold: 234,
      ticket_limit: 500
    },
    {
      id: "summer-music-fest",
      title: "Summer Music Festival",
      description: "Three days of amazing music, food trucks, and unforgettable memories",
      date: "2024-08-01",
      time: "16:00:00",
      venue: "Central Park",
      price: 89,
      max_attendees: 2000,
      current_attendees: 1547,
      image: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
      category: "Music",
      tags: ["music", "festival", "outdoor"],
      organizer_id: "org-2",
      status: "active",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      tickets_sold: 1547,
      ticket_limit: 2000
    },
    {
      id: "digital-marketing-workshop",
      title: "Digital Marketing Workshop",
      description: "Learn the latest strategies from marketing experts and grow your business",
      date: "2024-07-25",
      time: "14:00:00",
      venue: "Business Hub, City Center",
      price: 75,
      max_attendees: 100,
      current_attendees: 89,
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
      category: "Business",
      tags: ["business", "marketing", "workshop"],
      organizer_id: "org-3",
      status: "active",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      tickets_sold: 89,
      ticket_limit: 100
    },
    {
      id: "yoga-in-the-park",
      title: "Yoga in the Park",
      description: "Start your day with peaceful yoga sessions in beautiful outdoor settings",
      date: "2024-07-20",
      time: "07:00:00",
      venue: "Riverside Park",
      price: 0,
      max_attendees: 50,
      current_attendees: 45,
      image: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
      category: "Health",
      tags: ["health", "yoga", "outdoor"],
      organizer_id: "org-4",
      status: "active",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      tickets_sold: 45,
      ticket_limit: 50
    },
    {
      id: "food-wine-tasting",
      title: "Food & Wine Tasting",
      description: "Explore exotic flavors and premium wines curated by top chefs",
      date: "2024-08-10",
      time: "19:00:00",
      venue: "Grand Hotel Ballroom",
      price: 120,
      max_attendees: 100,
      current_attendees: 156,
      image: "https://images.unsplash.com/photo-1469041797191-50ace28483c3",
      category: "Food",
      tags: ["food", "wine", "tasting"],
      organizer_id: "org-5",
      status: "active",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      tickets_sold: 156,
      ticket_limit: 100
    },
    {
      id: "art-gallery-opening",
      title: "Art Gallery Opening",
      description: "Discover contemporary art from emerging and established artists",
      date: "2024-07-18",
      time: "18:00:00",
      venue: "Modern Art Gallery",
      price: 25,
      max_attendees: 50,
      current_attendees: 78,
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
      category: "Art",
      tags: ["art", "gallery", "opening"],
      organizer_id: "org-6",
      status: "active",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      tickets_sold: 78,
      ticket_limit: 50
    }
  ];

  const categories = ["all", "Technology", "Music", "Business", "Health", "Food", "Art", "Sports"];

  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    
    const matchesPrice = (event.price || 0) >= priceRange[0] && (event.price || 0) <= priceRange[1];
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const eventDate = new Date(event.date);
      const today = new Date();
      const week = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const month = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      switch (dateFilter) {
        case "today":
          matchesDate = eventDate.toDateString() === today.toDateString();
          break;
        case "week":
          matchesDate = eventDate <= week && eventDate >= today;
          break;
        case "month":
          matchesDate = eventDate <= month && eventDate >= today;
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesPrice && matchesDate;
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      case "popular":
        return (b.current_attendees || 0) - (a.current_attendees || 0);
      default:
        return 0;
    }
  });

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={500}
          min={0}
          step={10}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Date</h3>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Select date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All dates</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Sort by</h3>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Discover Events
          </h1>
          <p className="text-gray-600 text-lg">
            Find amazing events happening near you
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search events, venues, or organizers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 rounded-full border-2 border-gray-200 focus:border-blue-400"
                />
              </div>
              
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden rounded-full px-6">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Events</SheetTitle>
                    <SheetDescription>
                      Refine your search to find the perfect events
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-2 transition-all duration-200 ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === "all" ? "All Categories" : category}
                </Badge>
              ))}
            </div>

            {/* Results count */}
            <p className="text-gray-600">
              Showing <span className="font-semibold">{sortedEvents.length}</span> event{sortedEvents.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-80">
            <Card className="sticky top-24 shadow-lg border-0">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </h2>
                <FilterContent />
              </CardContent>
            </Card>
          </div>

          {/* Events Grid */}
          <div className="flex-1">
            {sortedEvents.length > 0 ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-600 mb-4">No events found</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  We couldn't find any events matching your criteria. Try adjusting your filters or search terms.
                </p>
                <Button 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setPriceRange([0, 500]);
                    setDateFilter("all");
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-8"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Browse;
