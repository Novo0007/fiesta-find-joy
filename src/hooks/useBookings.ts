
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Booking {
  id: string;
  user_id: string;
  event_id: string;
  tickets: number;
  total_amount: number;
  booking_code: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  event?: {
    title: string;
    date: string;
    time: string;
    venue: string;
  };
}

export const useUserBookings = () => {
  return useQuery({
    queryKey: ['user-bookings'],
    queryFn: async (): Promise<Booking[]> => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          event:events(title, date, time, venue)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        throw new Error('Failed to fetch bookings');
      }

      return data || [];
    },
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData: {
      event_id: string;
      tickets: number;
      total_amount: number;
      buyer_name: string;
      buyer_email: string;
      buyer_phone?: string;
    }) => {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...bookingData,
          status: 'confirmed',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};
