import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    
    if (!n8nWebhookUrl) {
      console.error('N8N_WEBHOOK_URL not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook URL not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current day of week (0 = Sunday, 1 = Monday, etc)
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    console.log(`Checking for reminders - Day: ${currentDay}, Time: ${currentTime}`);

    // Get active habits that need reminders today at this time
    const { data: habits, error: habitsError } = await supabaseClient
      .from('habits')
      .select(`
        id,
        name,
        motivation,
        reminder_time,
        days_of_week,
        user_id,
        profiles!inner (
          full_name,
          whatsapp
        )
      `)
      .eq('is_active', true)
      .contains('days_of_week', [currentDay]);

    if (habitsError) {
      console.error('Error fetching habits:', habitsError);
      throw habitsError;
    }

    console.log(`Found ${habits?.length || 0} active habits for today`);

    const sentReminders = [];
    const errors = [];

    // Send reminder for each habit
    for (const habit of habits || []) {
      try {
        const profile = Array.isArray(habit.profiles) ? habit.profiles[0] : habit.profiles;
        
        // Send to n8n webhook
        const webhookResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            whatsapp: profile.whatsapp,
            full_name: profile.full_name,
            habit_name: habit.name,
            habit_motivation: habit.motivation,
            reminder_time: habit.reminder_time,
            habit_id: habit.id,
            user_id: habit.user_id,
            timestamp: now.toISOString(),
          }),
        });

        if (!webhookResponse.ok) {
          const errorText = await webhookResponse.text();
          console.error(`Failed to send webhook for habit ${habit.id}:`, errorText);
          errors.push({
            habit_id: habit.id,
            error: `Webhook failed: ${webhookResponse.status}`,
          });
        } else {
          console.log(`Reminder sent for habit ${habit.id} to ${profile.whatsapp}`);
          sentReminders.push({
            habit_id: habit.id,
            user_id: habit.user_id,
            whatsapp: profile.whatsapp,
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error sending reminder for habit ${habit.id}:`, error);
        errors.push({
          habit_id: habit.id,
          error: errorMessage,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentReminders.length,
        errors: errors.length,
        details: {
          sentReminders,
          errors,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in send-reminders function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});