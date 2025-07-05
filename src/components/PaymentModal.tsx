
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Event } from "@/hooks/useEvents";
import { Calendar, MapPin, CreditCard, Ticket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

// Declare Razorpay interface for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
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
      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create Razorpay order
      const { data: order, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: bookingData.totalPrice,
          currency: 'INR',
          receipt: `event_${event.id}_${Date.now()}`
        }
      });

      if (orderError) throw orderError;

      // Initialize Razorpay payment
      const options = {
        key: 'rzp_test_9WsLnHkratti5e', // This will be replaced with your actual key
        amount: order.amount,
        currency: order.currency,
        name: 'Event Booking',
        description: `Booking for ${event.title}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const { data: verification, error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }
            });

            if (verifyError || !verification.valid) {
              throw new Error('Payment verification failed');
            }

            toast({
              title: "Payment successful!",
              description: "Your booking has been confirmed.",
            });
            
            onPaymentSuccess();
          } catch (error: any) {
            toast({
              title: "Payment verification failed",
              description: error.message,
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: bookingData.buyerName,
          email: bookingData.buyerEmail,
          contact: bookingData.buyerPhone
        },
        theme: {
          color: '#3B82F6'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response: any) => {
        toast({
          title: "Payment failed",
          description: response.error.description,
          variant: "destructive",
        });
      });

      razorpay.open();
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
                <span>₹{event.price * bookingData.ticketQuantity}</span>
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
                <span className="text-blue-600">₹{bookingData.totalPrice}</span>
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
              {loading ? "Processing..." : event.price === 0 ? "Confirm Booking" : "Pay with Razorpay"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
