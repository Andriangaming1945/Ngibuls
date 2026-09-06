-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  housing_type text CHECK (housing_type IS NULL OR (housing_type = ANY (ARRAY['rumah'::text, 'kost'::text, 'kontrakan'::text, 'apartemen'::text, 'usaha'::text]))),
  occupants integer CHECK (occupants IS NULL OR occupants >= 1),
  electricity_tariff_per_kwh numeric,
  water_tariff_per_m3 numeric,
  electricity_payment_method text CHECK (electricity_payment_method IS NULL OR (electricity_payment_method = ANY (ARRAY['token'::text, 'pascabayar'::text, 'dibagi'::text, 'tetap'::text, 'termasuk'::text]))),
  water_payment_method text CHECK (water_payment_method IS NULL OR (water_payment_method = ANY (ARRAY['meter_sendiri'::text, 'dibagi'::text, 'tetap'::text, 'termasuk'::text]))),
  budget_preference text CHECK (budget_preference IS NULL OR (budget_preference = ANY (ARRAY['none'::text, 'low'::text, 'investment'::text]))),
  savings_target_monthly numeric,
  avatar_url text,
  role text NOT NULL DEFAULT 'user'::text CHECK (role = ANY (ARRAY['user'::text, 'admin'::text])),
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'suspended'::text])),
  last_login timestamp with time zone,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.devices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  name text NOT NULL,
  watt numeric NOT NULL CHECK (watt > 0::numeric),
  hours_per_day numeric NOT NULL CHECK (hours_per_day > 0::numeric AND hours_per_day <= 24::numeric),
  days_per_month numeric NOT NULL DEFAULT 30 CHECK (days_per_month >= 1::numeric AND days_per_month <= 31::numeric),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  model text,
  voltage numeric,
  current numeric,
  frequency numeric,
  source text CHECK (source IS NULL OR (source = ANY (ARRAY['manual'::text, 'scan'::text]))),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  category text DEFAULT 'Elektronik'::text,
  unit text DEFAULT 'unit'::text,
  deleted_at timestamp with time zone,
  CONSTRAINT devices_pkey PRIMARY KEY (id),
  CONSTRAINT devices_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.water_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  name text NOT NULL,
  minutes numeric NOT NULL CHECK (minutes > 0::numeric),
  times_per_day numeric NOT NULL CHECK (times_per_day > 0::numeric),
  days_per_month numeric NOT NULL DEFAULT 30 CHECK (days_per_month >= 1::numeric AND days_per_month <= 31::numeric),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT water_activities_pkey PRIMARY KEY (id),
  CONSTRAINT water_activities_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.saved_recommendations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  contributor_type text NOT NULL CHECK (contributor_type = ANY (ARRAY['device'::text, 'water'::text])),
  contributor_name text NOT NULL,
  current_value numeric,
  suggested_value numeric,
  potential_saving_amount numeric,
  potential_saving_cost numeric,
  budget_preference text,
  devices_snapshot jsonb,
  water_activities_snapshot jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  tariff_electricity numeric,
  tariff_water numeric,
  total_kwh numeric,
  total_liters numeric,
  total_cost numeric,
  top_devices jsonb,
  top_water_activities jsonb,
  CONSTRAINT saved_recommendations_pkey PRIMARY KEY (id),
  CONSTRAINT saved_recommendations_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.export_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  exported_by uuid,
  scope text NOT NULL CHECK (scope = ANY (ARRAY['single'::text, 'selected'::text, 'all'::text])),
  device_count integer NOT NULL DEFAULT 0,
  device_names ARRAY NOT NULL DEFAULT '{}'::text[],
  file_name text NOT NULL,
  payload jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT export_logs_pkey PRIMARY KEY (id),
  CONSTRAINT export_logs_exported_by_fkey FOREIGN KEY (exported_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.recommendation_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['Listrik'::text, 'Air'::text])),
  trigger_condition text,
  description text,
  suggestion text,
  saving_estimate text,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT recommendation_rules_pkey PRIMARY KEY (id)
);
CREATE TABLE public.device_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  used_for text NOT NULL CHECK (used_for = ANY (ARRAY['Perangkat Listrik'::text, 'Aktivitas Air'::text])),
  description text,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT device_categories_pkey PRIMARY KEY (id)
);
