# GRAND CITY 2099

An original playable open-world city experience built around free-roam driving, bikes, traffic, pedestrians, combat, missions, garages, dynamic audio and controller support.

Grand City 2099 is designed as a living city rather than a static scene. Vehicles move through the streets, pedestrians populate the environment, the player can move on foot or enter vehicles, and multiple gameplay systems run together inside one browser-based 3D world.

> Current focus: expanding city life, vehicle variety, NPC realism, driving feel, sound design and open-world interaction.

## Game overview

The project combines several systems that would normally exist separately — city rendering, vehicle handling, character movement, combat, traffic, audio, garages and missions — into one playable experience.

The goal is not to reproduce another open-world title. Grand City 2099 is an original fictional city with its own procedural geometry, materials, vehicle designs, signs and gameplay structure.

## Core systems

- Open-world city exploration
- Cars and bikes
- Enter / exit vehicle system
- Traffic vehicles
- Pedestrian population
- On-foot character movement
- Combat and weapon states
- Garages and vehicle access
- Missions / contracts
- Police sirens and pursuit-style audio cues
- Dynamic city ambience
- Engine, braking, tyre, boost and collision sound layers
- Horn system
- Keyboard, touch and gamepad input
- Camera switching
- Pause and gameplay UI

## Controls

### Keyboard

| Key | Action |
| --- | --- |
| `WASD` / Arrow Keys | Move / drive / steer |
| `Shift` | Sprint / boost |
| `Space` | Handbrake |
| `H` | Horn |
| `E` | Enter / exit vehicle |
| `C` | Change camera |
| `G` | Garage |
| `M` | Contracts |
| `P` / `Esc` | Pause |
| `1` / `2` | Weapon selection |
| `R` | Reload |

### Gamepad

| Control | Action |
| --- | --- |
| Left Stick | Movement / steering |
| RT | Accelerate |
| LT | Brake / reverse |
| RB | Boost |
| B | Handbrake |
| X | Horn |
| A | Enter / exit vehicle |
| Y | Change camera |
| Start | Pause |
| LB | Weapon / holster |
| D-pad Up | Sidearm |
| D-pad Right | Carbine |

## Run locally

Requires Node.js and npm.

```bash
npm install
npm run dev
```

Open the local address printed by Vite in the terminal.

### Production build

```bash
npm run build
npm start
```

### Tests

```bash
npm test
```

## Project structure

```text
Grand-City-2099/
├── build/              Production-ready game build and bundled assets
├── dist/               Distribution output and runtime assets
├── scripts/            Project utility / asset preparation scripts
├── tests/              Automated gameplay and rendering checks
├── ASSETS.md           Asset provenance, licenses and attribution notes
├── package.json        npm scripts and project metadata
├── package-lock.json   Locked dependency versions
├── serve.mjs           Local production server
├── START-WINDOWS.bat   Windows quick-start helper
├── vite.config.js      Vite configuration
└── README.md           Project documentation
```

## Architecture and dependencies

Grand City 2099 is delivered as a browser-based 3D experience and uses **Vite** for development and production builds. The 3D world is rendered with **Three.js / WebGL** resources bundled with the project.

The runtime is structured around several continuously interacting systems:

- city geometry and material rendering
- player movement and animation
- vehicle movement and steering
- traffic updates
- pedestrian behaviour
- camera state
- combat interactions
- garage / contract state
- audio generation and playback
- keyboard, touch and controller input

The original city facades, road surfaces, fictional shop signs, vehicle geometry, NPC geometry, weapon geometry and combat effects are procedural project work. Third-party character / head assets and Three.js components are documented separately in `ASSETS.md` with their relevant attribution and license details.

## Audio system

The game uses a layered runtime audio system rather than a single background track. Current sound behaviour includes:

- vehicle engine tone
- acceleration / rev response
- road and tyre noise
- braking feedback
- boost feedback
- collision effects
- city ambience
- traffic presence
- horns
- police sirens
- footsteps
- weapon sound effects

Browser autoplay restrictions may require the player to enable sound after entering the game.

## Vehicle and controller support

Grand City 2099 supports both keyboard driving and standard gamepad input. Controller support includes analogue steering, trigger-based acceleration / braking, boost, handbrake, horn, camera switching, vehicle interaction and weapon selection.

The project also includes touch controls for supported interfaces.

## Assets and originality

Grand City 2099 is a fictional original city project. Its coastal facade atlas and surface materials were created specifically for the project, and the city does not use extracted GTA maps, models or textures.

Some embedded character resources use publicly documented example / licensed assets. Full provenance and attribution are maintained in [`ASSETS.md`](./ASSETS.md).

## Known limitations

The project is actively evolving. Current limitations include:

- pedestrian behaviour is lighter than a full simulation-grade NPC system
- driving physics favour accessible open-world gameplay over full vehicle simulation
- city population and draw distance are balanced for browser performance
- some sound layers are synthesized / procedural rather than studio-recorded automotive audio
- traffic logic is still being expanded around more complex intersections
- combat, police behaviour and mission variety have room for deeper state logic
- mobile / touch play is less mature than keyboard and gamepad control
- visual quality and frame rate depend on the device GPU and browser

## Future upgrades

Planned directions for the project include:

- richer pedestrian routines and reactions
- denser, more varied human NPCs
- expanded city districts and road networks
- more cars, bikes and unique vehicle classes
- improved traffic rules and intersection behaviour
- deeper police pursuit logic
- better crash and vehicle damage feedback
- richer missions and contracts
- interiors and enterable locations
- improved combat behaviour
- expanded garage and progression systems
- stronger save / persistence systems
- more advanced spatial audio
- additional controller polish
- continued performance optimization for larger city scenes

## Development approach

Grand City 2099 began as an experiment in how far AI-assisted development could go when given a complete product requirement rather than a small UI task or isolated code snippet.

The project evolved through repeated design, implementation, testing and gameplay iteration — including city rendering, vehicles, pedestrians, combat, audio, controller input and open-world systems — with the goal of turning the concept into a complete playable experience.

## Creator

**YM Parthish**

Vision, direction and gameplay concept by YM Parthish.

