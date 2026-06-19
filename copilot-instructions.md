# Copilot Project Guide

This project is a small order-management demo where cooking bots process McDonald's orders with VIP priority rules.

## Next.js Constraint

This is not a default Next.js setup. APIs, conventions, and file structure may differ from older Next.js versions. Read the relevant guide in `node_modules/next/dist/docs/` before writing code that depends on framework behavior, and heed deprecation notices.

## Core Behavior

- `NORMAL` orders go to the back of the pending queue
- `VIP` orders go before all pending normal orders, but after existing pending VIP orders
- A bot can process only one order at a time
- Each order takes 10 seconds to complete
- Adding a bot should immediately start work if a pending order exists
- Removing a bot should stop its current work and return that order to the correct pending position

## Important Files

```text
app/page.tsx                 page composition
app/hooks/useOrderSystem.ts  main orchestration hook
app/hooks/useOrder.ts        order queue state
app/hooks/useBots.ts         bot state and bot lifecycle
app/components/              presentational components
app/types.ts                 shared types
```

## Working Rules

- Keep changes small and local
- Preserve the existing UI behavior unless asked to change it
- Prefer extracting or simplifying components over adding abstraction layers
- Keep state logic inside hooks, not inside presentational components
- Validate with `npm run lint` after code changes when possible

## UI Conventions

- `VIP` orders are yellow
- `NORMAL` orders are blue
- Processing bots are green
- Idle bots are gray

## Developer Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```
