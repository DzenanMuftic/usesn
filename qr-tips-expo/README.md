# QR Tips

An Expo/React Native clone of a "QR code tip jar" app. Show your personal QR
code to receive tips, or scan someone else's to send them one — all stored
locally on-device for demo purposes (no backend).

## Features

- **My QR** — generates a personal `qrtips://tip/<userId>` QR code (via
  `react-native-qrcode-svg`) plus your current balance.
- **Scan** — uses `expo-camera`'s built-in barcode scanner to read a QR Tips
  code and jump straight to the send-tip screen.
- **Send a tip** — preset or custom amount, optional note, debits your local
  balance.
- **Activity** — a running list of sent/received transactions.
- **Profile** — edit your display name/handle and top up your demo balance.

## Getting started

```bash
npm install
npx expo start
```

Scanning requires a physical device or a development build (Expo Go works
for `expo-camera`'s QR scanning). Two devices/simulators can tip each other
by scanning each other's "My QR" screen.

## Structure

```
src/
  app/            # expo-router routes
    (tabs)/        # My QR, Activity, Profile tabs
    scan.tsx        # camera modal
    tip/[userId].tsx # send-tip modal
  lib/
    store.tsx       # AsyncStorage-backed profile/wallet state
    qr.ts           # QR payload encode/decode
    theme.ts         # color/radius tokens
```
