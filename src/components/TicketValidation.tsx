
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { QrCode, Check, X, Search } from 'lucide-react';

interface TicketInfo {
  id: string;
  qr_code: string;
  booking_code: string;
  tickets: number;
  buyer_name: string;
  buyer_email: string;
  validated_at: string | null;
  event: {
    title: string;
    date: string;
    time: string;
    venue: string;
  };
}

const TicketValidation = () => {
  const [qrInput, setQrInput] = useState('');
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const searchTicket = async () => {
    if (!qrInput.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          event:events(title, date, time, venue)
        `)
        .eq('qr_code', qrInput.trim())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast({
            title: "Ticket not found",
            description: "No ticket found with this QR code.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        setTicketInfo(null);
        return;
      }

      setTicketInfo(data);
    } catch (error: any) {
      toast({
        title: "Error searching ticket",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateTicket = async () => {
    if (!ticketInfo || !user) return;

    setValidating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          validated_at: new Date().toISOString(),
          validated_by: user.id
        })
        .eq('id', ticketInfo.id);

      if (error) throw error;

      setTicketInfo({
        ...ticketInfo,
        validated_at: new Date().toISOString()
      });

      toast({
        title: "Ticket validated",
        description: "Ticket has been successfully validated.",
      });
    } catch (error: any) {
      toast({
        title: "Error validating ticket",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Ticket Validation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter QR code or scan ticket"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchTicket()}
            />
            <Button onClick={searchTicket} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {ticketInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Ticket Information
              <Badge variant={ticketInfo.validated_at ? 'default' : 'secondary'}>
                {ticketInfo.validated_at ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Validated
                  </>
                ) : (
                  <>
                    <X className="w-3 h-3 mr-1" />
                    Not Validated
                  </>
                )}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Event</p>
                <p className="font-medium">{ticketInfo.event?.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-medium">
                  {ticketInfo.event?.date} at {ticketInfo.event?.time}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Venue</p>
                <p className="font-medium">{ticketInfo.event?.venue}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tickets</p>
                <p className="font-medium">{ticketInfo.tickets}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Buyer Name</p>
                <p className="font-medium">{ticketInfo.buyer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Booking Code</p>
                <p className="font-medium font-mono">{ticketInfo.booking_code}</p>
              </div>
            </div>

            {ticketInfo.validated_at ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">
                  ✓ Ticket validated on {new Date(ticketInfo.validated_at).toLocaleString()}
                </p>
              </div>
            ) : (
              <Button 
                onClick={validateTicket} 
                disabled={validating}
                className="w-full"
              >
                <Check className="w-4 h-4 mr-2" />
                {validating ? 'Validating...' : 'Validate Ticket'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TicketValidation;
