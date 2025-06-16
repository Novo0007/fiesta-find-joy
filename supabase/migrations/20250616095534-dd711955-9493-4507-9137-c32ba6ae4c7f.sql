
-- Update bookings table to better support ticket purchasing
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS buyer_name TEXT,
ADD COLUMN IF NOT EXISTS buyer_email TEXT,
ADD COLUMN IF NOT EXISTS buyer_phone TEXT;

-- Create a trigger to auto-generate booking codes
CREATE OR REPLACE FUNCTION public.generate_booking_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'EVT-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8));
END;
$$;

CREATE OR REPLACE FUNCTION public.set_booking_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.booking_code IS NULL THEN
    NEW.booking_code = generate_booking_code();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for auto-generating booking codes
DROP TRIGGER IF EXISTS set_booking_code_trigger ON public.bookings;
CREATE TRIGGER set_booking_code_trigger
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_booking_code();

-- Update RLS policies for bookings
CREATE POLICY "Users can create their own bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Update events table to track available tickets
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS tickets_sold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ticket_limit INTEGER;

-- Function to update ticket count when booking is made
CREATE OR REPLACE FUNCTION public.update_event_tickets()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.events 
    SET tickets_sold = COALESCE(tickets_sold, 0) + COALESCE(NEW.tickets, 1),
        current_attendees = COALESCE(current_attendees, 0) + COALESCE(NEW.tickets, 1)
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.events 
    SET tickets_sold = GREATEST(0, COALESCE(tickets_sold, 0) - COALESCE(OLD.tickets, 1)),
        current_attendees = GREATEST(0, COALESCE(current_attendees, 0) - COALESCE(OLD.tickets, 1))
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for updating ticket counts
DROP TRIGGER IF EXISTS update_event_tickets_trigger ON public.bookings;
CREATE TRIGGER update_event_tickets_trigger
  AFTER INSERT OR DELETE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_event_tickets();
