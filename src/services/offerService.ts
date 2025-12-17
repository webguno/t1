import { supabase } from './supabaseClient';
import { Offer } from '../types';

// Fallback data
const MOCK_OFFERS: Offer[] = [
  {
    id: '1',
    title: 'Watch & Earn: Flat 50',
    description: 'Watch the promotional video and download the app to get instant rewards.',
    link: 'https://youtube.com',
    video_link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
    icon_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    steps: ['Watch Video', 'Download App', 'Register Account'],
    terms: ['New users only', 'Must watch full video'],
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Play Candy Crush',
    description: 'Reach level 10 to claim your points.',
    link: 'https://king.com',
    icon_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Candy_Crush_Saga_logo.svg/1200px-Candy_Crush_Saga_logo.svg.png',
    steps: ['Install game', 'Play to level 10', 'Screenshot profile'],
    terms: [],
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Take Survey',
    description: 'Complete a 5 minute survey about shopping habits.',
    link: 'https://google.com',
    icon_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Google_Forms_2020_Logo.svg/1200px-Google_Forms_2020_Logo.svg.png',
    steps: ['Complete all questions', 'Submit valid email'],
    terms: ['One per household'],
    is_active: true,
    created_at: new Date().toISOString()
  }
];

// Simple in-memory cache
let offersCache: Offer[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute cache

export const fetchOffers = async (): Promise<Offer[]> => {
  const now = Date.now();
  if (offersCache && (now - lastFetchTime < CACHE_DURATION)) {
    return offersCache;
  }

  try {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase Error (fetchOffers):', error.message);
      return offersCache || MOCK_OFFERS;
    }

    if (!data || data.length === 0) return MOCK_OFFERS;

    offersCache = data;
    lastFetchTime = now;
    return data;
  } catch (err: any) {
    console.error('Unexpected error in fetchOffers:', err.message || err);
    return offersCache || MOCK_OFFERS;
  }
};

export const fetchUserTotalClicks = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('offer_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.warn('Supabase Error (fetchUserTotalClicks):', error.message);
      return 0;
    }

    return count || 0;
  } catch (err: any) {
    console.error('Unexpected error in fetchUserTotalClicks:', err.message || err);
    return 0;
  }
};

export const trackOfferClick = async (offerId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('offer_clicks')
      .insert([
        {
          offer_id: offerId,
          user_id: userId,
          clicked_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Supabase Error (trackOfferClick):', error.message);
      throw new Error(error.message);
    }
  } catch (err: any) {
    console.error('Unexpected error in trackOfferClick:', err.message || err);
    throw err;
  }
};