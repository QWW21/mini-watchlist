# Mini Watchlist

A small investing app for iOS, Android and web from one codebase, with live
prices streamed over a WebSocket. All instruments, prices and orders are fake.

## Run it

```bash
pnpm install
pnpm nx serve price-server
pnpm nx start mobile        # press w for web, or scan the QR code with Expo Go
```

The mock server takes these environment variables:

| Variable        | Default | What it does                                  |
| --------------- | ------- | --------------------------------------------- |
| `PORT`          | `4000`  | Port for REST and the `/stream` WebSocket     |
| `TICK_MS`       | `250`   | Time between price moves, for stress tests    |
| `FILL_DELAY_MS` | `400`   | How long an order takes to fill               |
| `DROP_EVERY_S`  | `0`     | Cuts all sockets every N seconds; 0 turns off |

Prices and portfolio live in memory, so restarting the server resets them.

## Check it

```bash
pnpm nx run-many -t lint typecheck test
```
