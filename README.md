# Protein Tracker

Offline-first Expo (React Native + TypeScript) app for tracking protein-pack servings.
No backend, no database, no account. Everything is stored on-device with AsyncStorage.

## Run

    npm install
    npx expo install --fix      # aligns package versions to your Expo SDK
    npx expo start              # scan the QR code with Expo Go
    npx expo start --android
    npx expo start --ios        # macOS only

## Structure

    app/          Expo Router screens (Home, History, Settings) + tab layout
    components/   Reusable UI (cards, ring, buttons, empty state)
    constants/    Product list and theme colours
    context/      App state + write queue (AppContext)
    storage/      The only file that touches AsyncStorage
    types/        TypeScript types
    utils/        Pure logic (calculations) and date helpers
"# protien-tracker" 
