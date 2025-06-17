
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, DollarSign, Users, Image, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

const CreateEventContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { userRole, canManageEvents } = useUserRole();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    price: "",
    maxAttendees: "",
    category: "",
    image: ""
  });

  const categories = ["Technology", "Music", "Business", "Food", "Sports", "Art", "Education", "Health"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create an event.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!canManageEvents) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to create events. Only organizers and administrators can create events.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Creating event with user:', user.id, 'role:', userRole);
      
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          date: formData.date,
          time: formData.time,
          venue: formData.venue,
          price: parseFloat(formData.price) || 0,
          max_attendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
          category: formData.category,
          image: formData.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
          organizer_id: user.id,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Event creation error:', error);
        throw error;
      }

      console.log('Event created successfully:', data);
      
      toast({
        title: "Event Created Successfully!",
        description: "Your event has been published and is now live.",
      });
      
      navigate("/");
    } catch (error: any) {
      console.error('Error creating event:', error);
      
      if (error.message?.includes('row-level security policy')) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to create events. Please contact an administrator.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error Creating Event",
          description: error.message || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/80">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create New Event
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Current role: <span className="font-semibold capitalize">{userRole}</span>
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter event title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your event..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="venue"
                    name="venue"
                    placeholder="Enter venue location"
                    value={formData.venue}
                    onChange={handleInputChange}
                    required
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxAttendees">Max Attendees</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="maxAttendees"
                      name="maxAttendees"
                      type="number"
                      placeholder="Leave empty for unlimited"
                      value={formData.maxAttendees}
                      onChange={handleInputChange}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="image"
                    name="image"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
                disabled={isLoading || !canManageEvents}
              >
                {isLoading ? "Creating Event..." : "Create Event"}
              </Button>
              
              {!canManageEvents && (
                <p className="text-sm text-red-600 text-center">
                  You need organizer or admin privileges to create events.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const CreateEvent = () => {
  return (
    <RoleProtectedRoute requireManageEvents={true}>
      <CreateEventContent />
    </RoleProtectedRoute>
  );
};

export default CreateEvent;
