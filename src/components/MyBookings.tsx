
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Ticket, QrCode, Download } from "lucide-react";
import QRCodeDisplay from "./QRCodeDisplay";

interface BookingWithEvent {
  id: string;
  booking_code: string;
  qr_code: string;
  tickets: number;
  total_amount: number;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  status: string;
  validated_at: string | null;
  created_at: string;
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    price: number;
  };
}

const MyBookings = () => {
  const [bookings, setBookings] = useState<BookingWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          event:events(
            id,
            title,
            date,
            time,
            venue,
            price
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading bookings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Ticket className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600">
            You haven't booked any events yet. Browse our events to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {bookings.map((booking) => (
        <Card key={booking.id} className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{booking.event.title}</span>
              <div className="flex gap-2">
                <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                  {booking.status}
                </Badge>
                {booking.validated_at && (
                  <Badge variant="outline" className="text-green-600">
                    Validated
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                <span>{formatDate(booking.event.date)} at {booking.event.time}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-green-500" />
                <span>{booking.event.venue}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Ticket className="w-4 h-4 mr-2 text-purple-500" />
                <span>{booking.tickets} ticket{booking.tickets > 1 ? 's' : ''}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">{formatCurrency(booking.total_amount)}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Booking Code</p>
                  <p className="font-mono font-medium">{booking.booking_code}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedBooking(
                    selectedBooking === booking.id ? null : booking.id
                  )}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  {selectedBooking === booking.id ? 'Hide QR' : 'Show QR'}
                </Button>
              </div>
            </div>

            {selectedBooking === booking.id && (
              <div className="border-t pt-4">
                <QRCodeDisplay
                  bookingCode={booking.booking_code}
                  qrCode={booking.qr_code}
                  eventTitle={booking.event.title}
                  validatedAt={booking.validated_at}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MyBookings;
