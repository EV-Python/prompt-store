create table if not exists public.saved_tweets (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.saved_tweets enable row level security;

-- Create a policy that allows all operations for authenticated users
create policy "Users can manage their own tweets"
  on public.saved_tweets
  for all
  using (true)  -- In a production app, you'd want to limit this to the user's own tweets
  with check (true); 