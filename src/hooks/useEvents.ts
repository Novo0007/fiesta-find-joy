
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  venue: string;
  price: number;
  max_attendees: number | null;
  current_attendees: number;
  image: string | null;
  category: string | null;
  tags: string[] | null;
  organizer_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<Event[]> => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'active')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        throw new Error('Failed to fetch events');
      }

      return data || [];
    },
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: async (): Promise<Event | null> => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching event:', error);
        return null;
      }

      return data;
    },
    enabled: !!id,
  });
};
