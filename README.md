# OpenSea Eligibility Checker

Node/Express website with an OpenSea API backend.

## Setup
1. Install Node.js 20+.
2. `npm install`
3. Copy `.env.example` to `.env`.
4. Add `OPENSEA_API_KEY`.
5. For wallet-scoped eligibility, add an OpenSea JWT with `read:eligibility`.
6. `npm start`
7. Open http://localhost:3000

The API key/JWT are server-side only. The frontend never receives them.
