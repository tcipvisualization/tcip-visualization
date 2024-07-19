# CIP Visualization Website

This app uses pnpm to build.

## Installation

1. Install pnpm globally:
2. Install dependencies after navigating to this directory:

`pnpm install`

## Usage

To start the development server:

`pnpm dev`

To build the app (to the `dist` directory)

`pnpm build`

## Notes

`src/Visualization.tsx` contains a constant called MAP_ID at the top.
It should be set to the ID of the "CIP Map" web map in ArcGIS Enterprise.

`src/App.tsx` contains authentication logic. appId should be set to the ID of the app in ArcGIS Enterprise.
Remember to add the URL you host the app on to the redirect URIs in the app settings.

The map relies on two feature layers: "CIP Points" and "CIP Lines".
It also relies on two tables: "CIP Projects" and "CIP Finances".