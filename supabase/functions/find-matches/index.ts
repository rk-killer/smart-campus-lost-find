import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface LostItem {
  id: string;
  item_name: string;
  category: string;
  description: string;
  location_lost: string;
  date_lost: string;
}

interface FoundItem {
  id: string;
  item_name: string;
  category: string;
  description: string;
  location_found: string;
  date_found: string;
}

function calculateMatchScore(lostItem: LostItem, foundItem: FoundItem): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  if (lostItem.category === foundItem.category) {
    score += 40;
    reasons.push(`Same category (${lostItem.category})`);
  }

  const lostName = lostItem.item_name.toLowerCase();
  const foundName = foundItem.item_name.toLowerCase();
  if (lostName.includes(foundName) || foundName.includes(lostName)) {
    score += 30;
    reasons.push('Similar item name');
  }

  const lostWords = lostItem.description.toLowerCase().split(/\s+/);
  const foundWords = foundItem.description.toLowerCase().split(/\s+/);
  const commonWords = lostWords.filter(word => foundWords.includes(word) && word.length > 3);
  if (commonWords.length > 0) {
    const wordScore = Math.min(30, commonWords.length * 5);
    score += wordScore;
    reasons.push(`${commonWords.length} matching keywords in description`);
  }

  const daysDiff = Math.abs(
    (new Date(lostItem.date_lost).getTime() - new Date(foundItem.date_found).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysDiff <= 7) {
    score += 10;
    reasons.push('Dates are close');
  }

  return { score, reason: reasons.join(', ') };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: lostItems, error: lostError } = await supabase
      .from('lost_items')
      .select('*')
      .eq('status', 'pending');

    if (lostError) throw lostError;

    const { data: foundItems, error: foundError } = await supabase
      .from('found_items')
      .select('*')
      .eq('status', 'pending');

    if (foundError) throw foundError;

    const matches = [];
    const notifications = [];

    for (const lostItem of lostItems) {
      for (const foundItem of foundItems) {
        const { score, reason } = calculateMatchScore(lostItem, foundItem);

        if (score >= 50) {
          const { data: existingMatch } = await supabase
            .from('matches')
            .select('id')
            .eq('lost_item_id', lostItem.id)
            .eq('found_item_id', foundItem.id)
            .maybeSingle();

          if (!existingMatch) {
            matches.push({
              lost_item_id: lostItem.id,
              found_item_id: foundItem.id,
              match_score: score,
              match_reason: reason,
              status: 'pending',
            });

            notifications.push(
              {
                user_id: lostItem.user_id,
                title: 'Potential Match Found!',
                message: `We found a potential match for your lost item: ${lostItem.item_name}. Match score: ${score}%`,
                type: 'match_found',
                read: false,
                related_item_id: lostItem.id,
              },
              {
                user_id: foundItem.user_id,
                title: 'Potential Match Found!',
                message: `Your found item (${foundItem.item_name}) may match a lost item. Match score: ${score}%`,
                type: 'match_found',
                read: false,
                related_item_id: foundItem.id,
              }
            );
          }
        }
      }
    }

    if (matches.length > 0) {
      await supabase.from('matches').insert(matches);
      await supabase.from('notifications').insert(notifications);
    }

    return new Response(
      JSON.stringify({
        success: true,
        matchesFound: matches.length,
        message: `Found ${matches.length} potential matches`,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});