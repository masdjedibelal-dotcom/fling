export type Gender = 'female' | 'male';

export type VerificationStatus =
  | 'none'
  | 'phone_pending'
  | 'documents_pending'
  | 'pending_review'
  | 'approved'
  | 'rejected';

export type AccountStatus = 'active' | 'suspended' | 'banned' | 'deleted';

export type RejectionReason =
  | 'id_blurry'
  | 'id_mismatch'
  | 'selfie_unclear';

export type Availability = 'now' | 'today' | 'off' | 'all';
export type AvailabilityFilter = 'now' | 'today' | 'all';
export type LocationMode = 'fixed' | 'auto';

export type MatchStatus = 'active' | 'cancelled' | 'expired';

export interface UserProfile {
  id: string;
  phone: string | null;
  gender: Gender;
  birth_date: string | null;
  verification_status: VerificationStatus;
  account_status: AccountStatus;
  rejection_reason: RejectionReason | null;
  terms_accepted_at: string | null;
  privacy_accepted_at: string | null;
  marketing_opt_in: boolean;
  display_name: string | null;
  pseudonym: string | null;
  handle: string | null;
  photos: string[];
  primary_photo_idx: number;
  job: string | null;
  bio: string | null;
  interest_tags: string[];
  city: string | null;
  location_mode: LocationMode;
  availability: Availability;
  latitude: number | null;
  longitude: number | null;
  search_radius_km: number;
  profile_views_today: number;
  picks_count: number;
  dates_count: number;
  push_token: string | null;
  suspended_until: string | null;
  notification_prefs: NotificationPrefs;
  created_at: string;
  updated_at: string;
}

export interface NotificationPrefs {
  new_pick: boolean;
  new_message: boolean;
  warning_6h: boolean;
  pick_expired: boolean;
  marketing: boolean;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  new_pick: true,
  new_message: true,
  warning_6h: true,
  pick_expired: true,
  marketing: false,
};

export interface SchaufensterProfile {
  id: string;
  pseudonym: string;
  photos: string[];
  primary_photo_idx: number;
  distance_km: number;
  availability: Availability;
  verified_at: string;
  bio: string;
  interest_tags: string[];
  last_seen_minutes: number;
  /** Öffentlich sichtbar in Meta-Zeile */
  age?: number;
  job?: string;
  city?: string;
  /** Nur nach Match im Pick-Chat */
  display_name?: string;
}

export interface Match {
  id: string;
  female_id: string;
  male_id: string;
  status: MatchStatus;
  created_at: string;
  expires_at: string;
  male_profile?: SchaufensterProfile;
  female_profile?: SchaufensterProfile;
  female_city?: string | null;
  female_display_name?: string;
}

export type MessageType = 'text' | 'image' | 'voice';

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  deleted_at: string | null;
  is_female: boolean;
  message_type?: MessageType;
  media_url?: string | null;
  media_duration_ms?: number | null;
  view_once?: boolean;
  viewed_at?: string | null;
}

export interface AppConfig {
  match_duration_hours: number;
  cooldown_hours: number;
  max_photos: number;
  max_message_length: number;
  max_radius_km: number;
  default_radius_km: number;
  maintenance_mode: boolean;
  new_registrations: boolean;
  min_version: string;
}

export const REJECTION_COPY: Record<
  RejectionReason,
  { title: string; subtitle: string; hints: string[] }
> = {
  id_blurry: {
    title: 'Ausweis\nunscharf',
    subtitle:
      'Wir konnten die Daten nicht lesen. Versuch es nochmal mit besserem Licht.',
    hints: [
      'Auf gleichmäßige Beleuchtung achten',
      'Reflexionen vermeiden',
      'Ausweis flach auf dunkler Fläche',
    ],
  },
  id_mismatch: {
    title: 'ID-Mismatch',
    subtitle:
      'Dein Selfie passt nicht zum Ausweis. Bitte wiederhole beide Schritte.',
    hints: [
      'Gleiche Person wie auf dem Ausweis',
      'Keine Sonnenbrille beim Selfie',
      'Gesicht gut ausleuchten',
    ],
  },
  selfie_unclear: {
    title: 'Selfie nicht klar',
    subtitle:
      'Wir konnten dein Gesicht nicht eindeutig erkennen. Bitte nimm die Aufnahme erneut auf.',
    hints: [
      'Kopf langsam nach rechts drehen',
      'Gesicht im Rahmen halten',
      'Ruhig halten während der Aufnahme',
    ],
  },
};
