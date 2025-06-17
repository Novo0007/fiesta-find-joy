
import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, Sparkles, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import EventCard from "@/components/EventCard";
import { useEvents } from "@/hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const { data: events = [], isLoading, error } = useEvents();

  const categories = ["all", "Technology", "Music", "Business", "Food", "Sports", "Art"];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const EventsSection = () => {
    if (isLoading) {
      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Failed to load events</h3>
          <p className="text-gray-500">Please try again later</p>
        </div>
      );
    }

    if (filteredEvents.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No events found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative px-4 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-3xl"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Discover Amazing Events</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 animate-fade-in">
            Events That
            <br />
            <span className="text-4xl md:text-6xl">Bring People Together</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto animate-fade-in">
            Create unforgettable experiences, discover exciting events, and connect with your community. 
            Everything you need for seamless event management.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link to="/browse">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Search className="w-5 h-5 mr-2" />
                Explore Events
              </Button>
            </Link>
            <Link to="/create-event">
              <Button variant="outline" size="lg" className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105">
                <Calendar className="w-5 h-5 mr-2" />
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Why Choose EventHub?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Easy Event Creation</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Create beautiful events in minutes with our intuitive interface and powerful tools.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Community Driven</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Connect with like-minded people and build lasting communities around shared interests.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Seamless Experience</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  From discovery to booking, enjoy a smooth and delightful experience across all devices.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 sm:mb-0 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Featured Events
            </h2>
            <Link to="/browse">
              <Button variant="outline" className="rounded-full">
                View All Events
              </Button>
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full border-2 border-gray-200 focus:border-blue-400"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
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
          </div>

          {/* Events Grid */}
          <EventsSection />
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of organizers who trust EventHub to bring their vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Get Started Free
              </Button>
            </Link>
            <Link to="/browse">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105">
                Browse Events
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
