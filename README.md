# Grand City 2099 — Full Game, Street Life Update

Complete editable source, game assets, tests, and ready-built browser game from the published Street Life Update.

## Play on Windows

1. Extract the entire ZIP first.
2. Install Node.js 22 or newer from https://nodejs.org if it is not already installed.
3. Open the extracted `Grand-City-2099` folder and double-click `START-WINDOWS.bat`.
4. The game opens in your browser. If it does not, open http://127.0.0.1:4173/ yourself.
5. Click **Enter Grand City** / **Continue in Grand City** to start and enable sound.

Keep the terminal window open while playing. This is a browser game, not a Windows executable. Do not double-click `index.html`: the 3D assets need the included local server.

## Play on any desktop

With Node.js installed, open a terminal inside this folder and run:

```sh
npm start
```

Open http://127.0.0.1:4173/. No `npm install` is required to play the included build. Once extracted and Node.js is installed, game assets and audio run locally without external services.

## Edit the game

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Editable source is in `dist/`, assets in `dist/public/assets/`, and bundled Three.js modules in `dist/vendor/`.

After edits:

```sh
npm test
npm run build
npm start
```

`build/` is the ready-to-play website output. Upload its contents to a static website host if you want to host your own copy. The exported project contains no hosting credentials or account configuration.

## Controls

- WASD / arrow keys: move or drive
- Shift: sprint / vehicle boost
- Alt: walk
- E: enter, exit, or take a nearby stopped / slow vehicle
- 1 / 2: sidearm / carbine
- Right mouse / F: aim
- Left mouse / Space: fire on foot
- R: reload; Q: holster
- Space in a vehicle: handbrake
- C: first-person / third-person camera
- G near Motorworks: browse five bikes and sixteen car models
- M: contracts; P / Escape: pause
- B near Motorworks: ammunition

Drivers brake when threatened. Taking occupied cars and firing in the city attract security. The target range is east of Motorworks; the weapons panel offers a walking route to it.

## Sound, graphics, and saves

Audio begins after you interact with the game. The header has mute; pause contains master volume and Test Sound. Use a browser with WebGL 2 / hardware acceleration for the full renderer. A lower-detail compatibility renderer is included.

Progress is stored in your browser for each website address. Progress on the published website does not transfer automatically to this local copy. Keep using the same local URL and port to retain local progress.

## Included version and limitations

Street Life Update includes free roaming, 16 original car models, five bikes, visible drivers, vehicle takeovers, pedestrian and security reactions, weapons, vehicle damage, missions, camera modes, procedural sound, and local saves. These are original browser-game graphics and simplified simulation systems, not GTA assets or GTA-level photorealism. Hardware graphics and performance depend on the device.

See `ASSETS.md` and the included Three.js licenses for credits and third-party asset terms. The character asset is included for use within this game; it is not a standalone asset product.

Source revision: 89cfb6441d0651b921b7a234d78add136b1d2751

## Human appearance update
Player and nearby male pedestrians use a licensed photographic head scan with fitted hair, eyes, skin textures, and normal maps. Sleeves and trousers have shaped profiles and fabric texture. Hands have separate fingers. Corrected neck/shoulder alignment follows the torso in seated poses. Close-distance detail is limited to preserve performance; distant people use simpler geometry. There is one base scanned face with complexion variants, not a unique face for every person. This is a generic fictional avatar, not a reconstruction of your face.

## Street Life changes
11 motorcycles with riders now join traffic. Five garage bikes have rebuilt bodywork, engines, wheels, fairings and lights. Car classes have differentiated grilles, lamps and wheel designs. Pedestrians use unobstructed sidewalk loops, crosswalk signals, jogging, browsing, conversation and phone routines. Detailed civilian meshes are used at close range with simpler distant models. The local player character fix is preserved.

Six automated test suites pass. GPU visual performance and published-device audio have not been independently verified in this environment. Visuals remain stylized and are not GTA-level photorealism.
