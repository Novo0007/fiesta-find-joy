
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Event } from "@/hooks/useEvents";
import { Calendar, MapPin, User, Mail, Phone, Ticket } from "lucide-react";
import PaymentModal from "./PaymentModal";

interface TicketBookingModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: () => void;
}

const TicketBookingModal = ({ event, isOpen, onClose, onBookingComplete }: TicketBookingModalProps) => {
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  if (!event) return null;

  const totalPrice = event.price * ticketQuantity;
  const availableTickets = event.max_attendees ? event.max_attendees - event.current_attendees : 999;
  const maxTickets = Math.min(availableTickets, 10);

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

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book tickets",
        variant: "destructive",
      });
      return;
    }

    const bookingDetails = {
      ticketQuantity,
      buyerName,
      buyerEmail,
      buyerPhone,
      totalPrice
    };

    setBookingData(bookingDetails);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user!.id,
          event_id: event.id,
          tickets: ticketQuantity,
          total_amount: totalPrice,
          buyer_name: buyerName,
          buyer_email: buyerEmail,
          buyer_phone: buyerPhone,
          status: 'confirmed',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Booking confirmed!",
        description: `Your booking code is ${data.booking_code}. Check your email for details.`,
      });

      onBookingComplete();
      setShowPaymentModal(false);
      onClose();
      
      // Reset form
      setTicketQuantity(1);
      setBuyerName("");
      setBuyerEmail("");
      setBuyerPhone("");
      setBookingData(null);
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Book Tickets
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                  <span>{formatDate(event.date)} at {event.time}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-green-500" />
                  <span>{event.venue}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {event.price === 0 ? 'Free' : `₹${event.price} per ticket`}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {availableTickets} tickets available
                  </span>
                </div>
              </CardContent>
            </Card>

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {/* Ticket Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Ticket className="w-5 h-5 mr-2" />
                    Select Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Number of tickets</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={maxTickets}
                      value={ticketQuantity}
                      onChange={(e) => setTicketQuantity(parseInt(e.target.value) || 1)}
                      className="w-24"
                    />
                    <p className="text-sm text-gray-500">
                      Maximum {maxTickets} tickets per purchase
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Buyer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <User className="w-5 h-5 mr-2" />
                    Buyer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="buyer-name">Full Name *</Label>
                    <Input
                      id="buyer-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buyer-email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="buyer-email"
                        type="email"
                        placeholder="Enter your email"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buyer-phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="buyer-phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={loading || availableTickets < ticketQuantity}
                >
                  {event.price === 0 ? "Book Free Tickets" : `Continue to Payment - ₹${totalPrice}`}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <PaymentModal
        event={event}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        bookingData={bookingData}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default TicketBookingModal;
