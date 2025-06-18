
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Download, Check, X } from 'lucide-react';

interface QRCodeDisplayProps {
  bookingCode: string;
  qrCode: string;
  eventTitle: string;
  validatedAt?: string | null;
  onValidate?: () => void;
  canValidate?: boolean;
}

const QRCodeDisplay = ({ 
  bookingCode, 
  qrCode, 
  eventTitle, 
  validatedAt, 
  onValidate, 
  canValidate = false 
}: QRCodeDisplayProps) => {
  const [generating, setGenerating] = useState(false);
  
  const generateQRCodeImage = async () => {
    setGenerating(true);
    try {
      // Generate QR code data URL
      const qrData = `${window.location.origin}/validate-ticket/${qrCode}`;
      
      // Create a simple QR code representation (in real app, use a QR library)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = 200;
      canvas.height = 200;
      
      // Simple placeholder QR code pattern
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = '#fff';
      ctx.fillRect(10, 10, 180, 180);
      ctx.fillStyle = '#000';
      ctx.font = '12px monospace';
      ctx.fillText(qrCode, 20, 100);
      
      // Download the image
      const link = document.createElement('a');
      link.download = `ticket-${bookingCode}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setGenerating(false);
    }
  };

  const isValidated = validatedAt !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Ticket QR Code
          </div>
          <Badge variant={isValidated ? 'default' : 'outline'}>
            {isValidated ? (
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
        <div className="text-center">
          <div className="w-48 h-48 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 font-mono">{qrCode}</p>
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="font-medium">{eventTitle}</p>
          <p className="text-sm text-gray-600">Booking: {bookingCode}</p>
          {validatedAt && (
            <p className="text-sm text-green-600">
              Validated on {new Date(validatedAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={generateQRCodeImage}
            disabled={generating}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            {generating ? 'Generating...' : 'Download QR'}
          </Button>
          
          {canValidate && !isValidated && onValidate && (
            <Button onClick={onValidate} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Validate Ticket
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;
