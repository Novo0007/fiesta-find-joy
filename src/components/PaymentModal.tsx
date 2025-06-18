
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Event } from "@/hooks/useEvents";
import { Calendar, MapPin, CreditCard, Ticket } from "lucide-react";

interface PaymentModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    ticketQuantity: number;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    totalPrice: number;
  } | null;
  onPaymentSuccess: () => void;
}

const PaymentModal = ({ event, isOpen, onClose, bookingData, onPaymentSuccess }: PaymentModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!event || !bookingData) return null;

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

  const handlePayment = async () => {
    if (event.price === 0) {
      // Free event - process directly
      onPaymentSuccess();
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Integrate with Razorpay
      // For now, simulate payment success
      toast({
        title: "Payment Integration Coming Soon",
        description: "Razorpay integration will be added next. For now, booking is confirmed.",
      });
      
      onPaymentSuccess();
    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Confirm Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{event.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                <span>{formatDate(event.date)} at {event.time}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-green-500" />
                <span>{event.venue}</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Ticket className="w-5 h-5 mr-2" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Tickets ({bookingData.ticketQuantity})</span>
                <span>{formatCurrency(event.price * bookingData.ticketQuantity)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Buyer</span>
                <span>{bookingData.buyerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Email</span>
                <span className="text-xs">{bookingData.buyerEmail}</span>
              </div>
              {bookingData.buyerPhone && (
                <div className="flex justify-between text-sm">
                  <span>Phone</span>
                  <span>{bookingData.buyerPhone}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-blue-600">{formatCurrency(bookingData.totalPrice)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Button */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={loading}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {loading ? "Processing..." : event.price === 0 ? "Confirm Booking" : "Pay Now"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
