# Mini Watchlist

A small investing app for iOS, Android and web from one codebase, with live
prices streamed over a WebSocket. All instruments, prices and orders are fake.

## Run it

```bash
pnpm install
pnpm nx serve price-server
pnpm nx start mobile        # press w for web, or scan the QR code with Expo Go
```

## Check it

```bash
pnpm nx run-many -t lint typecheck test
```
