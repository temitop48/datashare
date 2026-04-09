### # DataShare

### Decentralized Dataset Library for Developers

**“Upload once. Share forever. Build without limits.”**

DataShare is a decentralized platform where blockchain datasets are not hidden, duplicated, or lost — but stored, discovered, and used instantly.



## What is DataShare?

DataShare is a developer-first dataset infrastructure built on **Shelby + Aptos + Postgres**, designed to:

- Store structured datasets on decentralized storage
- Track dataset history through revisions
- Enable rollback to any previous state
- Provide verifiable integrity using checksums
- Allow creators to own and showcase their datasets



## Core Features

### Dataset Management
- Upload structured JSON datasets
- Categorize by chain, type, and tags
- Public / private dataset control

### Revision System
- Automatic version tracking
- Full dataset history
- Rollback to any previous revision
- Immutable storage references

### Download Tracking (Smart)
- Counts only real downloads (`?download=1`)
- Prevents spam with fingerprint-based tracking
- Accurate usage metrics

### Wallet Authentication
- Sign-in with Aptos wallet (Petra)
- Secure session-based authentication
- No passwords required

### Decentralized Profiles
- Users control what info is visible
- Display name, bio, links, skills
- Linked to datasets they create

### Activity Log
- Tracks actions like:
  - Upload
  - Update
  - Rollback
  - Content replacement

### Discovery
- Search datasets by:
  - title
  - tags
  - category
  - chain



## Tech Stack

| Layer | Technology |

| Frontend | Next.js (App Router) |
| Backend | Next.js API Routes |
| Database | Neon (PostgreSQL) |
| ORM | Prisma |
| Storage | Shelby Protocol |
| Auth | Aptos Wallet Adapter |
| Crypto | Ed25519 Signature Verification |
| Deployment | Vercel |



## Environment Variables

Create a `.env.local` file:

```env
DATABASE_URL=your_neon_postgres_url
SHELBY_API_KEY=your_shelby_api_key
APTOS_PRIVATE_KEY=your_private_key
SESSION_SECRET=your_random_secret


**## Local Setup**

1. Install dependencies
2. Generate Prisma client
3. Run database migrations
4. Start the development server


```bash
pnpm install
pnpm prisma generate
pnpm prisma migrate dev
pnpm dev


**## Deployment**

```bash
vercel deploy --prod
pnpm db:deploy


**## How Revisions Work**

Every dataset change creates a snapshot:

- Metadata + content are stored together
- Each revision includes:
   - version
   - checksum
   - blob reference
- Rollback restores both content and metadata


**## Download Logic**

- Viewing raw → no count
- Download (?download=1) → counted
- Fingerprint system prevents spam


**## Project structure**

```txt
app/
  api/
  datasets/
  manage/
  profiles/

lib/
  server/

prisma/
  schema.prisma


**## Current Limitations**

- Max dataset size: ~2MB
- No pagination yet
- No dataset rating system
- No team / multi-owner support yet


**## Future Improvements**

- Dataset monetization
- API access for datasets
- Creator leaderboard
- Dataset version comparison
- On-chain dataset indexing


**## Why DataShare?**

Today:

- datasets are scattered
- duplicated across apps
- hard to verify
- hard to version

DataShare fixes that by making datasets:
verifiable, versioned, and reusable — by default



**Final Note**

This is a data layer for Web3 builders.



**Author**

Built by DaCruz 
(web3 Enthusiast, Vibe Coder, Software Engineer)


