
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency, receipt }: CreateOrderRequest = await req.json();
    
    console.log("Creating Razorpay order with:", { amount, currency, receipt });

    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("Razorpay credentials missing");
      throw new Error("Razorpay credentials not found");
    }

    console.log("Using Razorpay Key ID:", razorpayKeyId?.substring(0, 8) + "...");

    // Create Razorpay order
    const orderData = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise, ensure integer
      currency: currency,
      receipt: receipt,
    };

    console.log("Order data:", orderData);

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const responseText = await response.text();
    console.log("Razorpay response status:", response.status);
    console.log("Razorpay response:", responseText);

    if (!response.ok) {
      let errorMessage = `Razorpay API error: ${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error) {
          errorMessage = `Razorpay API error: ${errorData.error.description || errorData.error.code}`;
        }
      } catch (e) {
        // If parsing fails, use the original error message
      }
      throw new Error(errorMessage);
    }

    const order = JSON.parse(responseText);

    return new Response(JSON.stringify(order), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
