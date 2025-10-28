<div align="center">
  <a href="https://moonshot.hackclub.com" target="_blank">
    <img src="https://hc-cdn.hel1.your-objectstorage.com/s/v3/35ad2be8c916670f3e1ac63c1df04d76a4b337d1_moonshot.png" 
         alt="This project is part of Moonshot, a 4-day hackathon in Florida visiting Kennedy Space Center and Universal Studios!" 
         style="width: 100%;">
  </a>
</div>

# ➡️ mathseek

mathseek is an open-source web application, AI-powered math problem solver that provides step-by-step solutions and explanations for a wide range of mathematical concepts. whether you are struggling with algebra, calculus, or geometry,
mathseek is here to help you understand and get the answers you need

## Some key features
- user-friendly interface
- luigi - AI assistant
- unlimited usage for free
- uses DeepSeek API's
- provides latex formated data for best experience
- history of queries

## Requirements to run it on your localhost
- Node.js 20+
- Yarn
- Docker
- Supabase instance

## Local setup
1. Clone the repo
```bash
git clone https://github.com/xndadelin/mathseek.git && cd mathseek
```
2. Copy environment file
cp .env.example .env

3. Set enviroment variables in .env
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DEEPSEEK_API_KEY=
``` 

4. Create supabase table
```bash
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.queries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  equation text NOT NULL,
  result jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
  CONSTRAINT queries_pkey PRIMARY KEY (id),
  CONSTRAINT queries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

# create your own rls policies
```

## Production
```bash
yarn build
yarn start
```

## Docker
Build: 
```bash
docker build -t math .
```
Run:
```bash
docker run --env-file .env -p 3000:3000 math
```

## Contributing
open issues or PRs on Github. Please write concise and clear commit message