# Starship Horizons
## UI Flow
1. Pre-Game - Screens can be selected and launched prior to a game starting while the server application is still in the main menu.  At this point only general information about the screen selected should be displayed.
    - Send CONSOLE-STATUS|Offline
    - When another screen joins or changes: ASC, SCREENS, SVRS, SETTINGS, SESSION, GSP, VCM, ROLES
    - When another screen closes/disconnects: ROLES, ASC
    - When moving from main menu to mission select: SCREEN|Mission Select, SESSION
    - When moving from mission select back to main menu: EVENTS, MISSION, ENCOUNTERS, SESSIONCLR, SCREENLEVEL, MISSION, EVENTS, ENCOUNTERS, RST, TAGS, VARIABLES, SCREEN|Main Menu, SESSION, MISSION, EVENTS, ENCOUNTERS, SESSIONCLR, SCREENLEVEL, EVENTS, MISSION, RST, ENCOUNTERS, VARIABLES, TAGS
    - When selecting a mission: RST, SCREENLEVEL, SESSIONCLR, MISSION, EVENTS, ENCOUNTERS, SESSION, SCREEN, MISSION, MAP, EVENTS, EVENTSTATE (for each event), ENCOUNTERS, MISSION, SESSION, SCREEN|Mission Briefing, MISSION-BRIEFING, MISSION, VARIABLES, then transition to mission briefing.
1. Mission Briefing - Once the mission has been selected, all consoles show the mission briefing display.  Any console may select "Continue" to dismiss the briefing on all screens.
    - Send CONSOLE-STATUS|Mission Briefing
    - When clicking Continue: Send KMC|Continue, transition to Gameplay
1. Gameplay - Once the mission briefing has been dismissed, all screens enter main gameplay, where the screen-specific functionality is available, and players are controlling the ship.
    - Receive at startup: SCREEN|In Game, GM-OBJECTS for each object, GSP, LOCATION-CURRENT, MISSION-WAYPOINTS, GSP, EVENTSTATE for each event, CARGO, MISSION, VARIABLES, TAGS, SETTINGS, SVRS, SCREEN|In Game, SESSION, CNTL, DEVICES, GSP, FACTIONS, MODULES, VESSEL-CLASSES, VARIABLES, MISSION-BRIEFING, MISSION, MISSION-WAYPOINTS, VESSEL, GVS, GVP, VCM, CARGO, DAMAGE-TEAMS, ALERT, DAMAGE-TEAMS-MODE, SHIELDS, CREW, VWL,  VWG, VORDS, VORD, VDRO, CONTACTS, LOCATION-CURRENT, CONSOLE-LOCK, CONSOLE-HEADER-LOCK, MAP, CAMERA-ACTIVE, CCL, CAMERAS, ROLES, ASC, ROLES, ALERT, NSB, CONTACTS, CONTACTS, CONTACTS, SESSION, SVRS, SETTINGS, SESSION, SCREEN|In Game, GSP, CNTL, DEVICES, FACTIONS, MODULES, VESSEL-CLASSES, MISSION-BRIEFING, MISSION, VARIABLES, MISSION-WAYPOINTS, GVP, VESSEL, GVS, EVENTS, VCM, VESSEL, GVS, MISSION, ALERT, CARGO, DAMAGE-TEAMS, DAMAGE-TEAMS-MODE, SHIELDS, CREW, VWL, VWG, VORDS, VORD, VDRO, CONTACTS, CONSOLE-LOCK, CONSOLE-HEADER-LOCK, CONTACTS, BC, LOCATION-CURRENT, MAP, CCL, CAMERA-ACTIVE, NSB, CAMERAS, ROLES, ASC, VWL, SHIELDS, VARIABLES, DECKS, DAMAGE, DAMAGE-TEAMS, ...
    - Recieve constantly: VESSEL, VWL, GM-OBJECTS, CONTACTS, BC
    - Receive constantly, but half as often?: VDRO, VCM, CREW, DECKS, DAMAGE, DAMAGE-TEAMS
    - Always acknowledge CONTACTS with AC?
1. Broken Screen - If the ship is destroyed, screens enter a "broken" state, visually indicating defeat, and the screen is unresponsive.
    - Transition to this mode upon receiving CONSOLE-BREAK|&lt;ship-name&gt;
1. Mission Summary - Following either success or defeat, a mission summary screen is displayed, showing each mission objective and the players' success (or lack thereof) for each.
    - Transition to this mode upon receiving MISSION with State="Ended".
    - When ESC pressed on main screen: MISSION, MISSION, SESSIONCLR, SCREENLEVEL, MISSION, RST, VARIABLES, MISSION, SESSION, then transition to Pre-Game (mission select screen)

## Objects
### Session
- CommOverride: the game master is intercepting comms
- EncountersEnabled: encounters can be disabled by the game master
- Mode
    - Mission
- State
    - Idle: in the main menu, not in a game
    - Loading: mission is loading
    - Loaded: mission loaded, mission briefing shown
    - Playing: game in progress
    - Paused: game in progress has been paused
    - Offline: console broken or disabled or at mission summary

### Settings
- Production: whether or not the server executable is a production build?
- Debug: the game master can enable "debug" mode to do ... ???

### Mission
- Complete:
- Date: the in-world date the mission is occurring, or IRL date if in main menu
- ElapsedTime: number of seconds the game has been running (with or without pause?), or IRL date timestamp prior to mission start
- Grade: the players' score
- Groups: 
- Name: The mission title
- Objectives: mission objective details
- Started: date and time the mission briefing was dismissed, or 1/1/1 prior to start
- State
    - Prologue: in mission briefing
    - Running: game is in progress
    - Ended: game is over, in mission summary
- Success: have the players successfully completed the mission
- Timer: ???
- TotalObjectives: the number of items in the Objectives hash
- TotalWaypoints: the number of waypoints to expect in MISSION-WAYPOINTS
- Related messages: MISSION-BRIEFING, MISSION-WAYPOINTS, SESSIONCLR



## Screen Components

### Common

- Title Bar
    - Game Menu (left)
    - Screen Title (center)
    - Window Mode (right)
    - Roles (inside right)
    - Alert Status (by color)
- Left Component Panel
    - Ship Status controls
    - Contacts
    - Common Actions
- Right Component Panel
    - Target/scan details
    - Inventory
    - Mission data
    - Less common actions
- Footer
    - View Options (left)
        - Radar
        - Main Screen/External View
    - Tool Tip (center)
    - Game Help & Iris (right)
- Center 
    - View Screen (radar, external, etc.)
    - Primary Controls

### Flight
- Center
    - Local, System, Galaxy maps
    - Fisheye radar
- Left
    - Location, Heading, Rotation
    - Drones
    - Operational Mode
    - Thruster Control
- Right
    - Target
    - Waypoints
    - Autopilot Engage
    - Steering Controls

### Tactical
- Center
    - Localmap
    - Exterior View
    - Fisheye radar
- Left
    - Hull/Energy status
    - Contacts
    - Shield status & control
- Right
    - Target
    - Ordnance Inventory
    - Weapon Hardpoint status & control

### Engineering
- Center
    - Systems power status & control
    - Ship hull status map
- Left
    - Hull, Energy, Shield status
    - Power distribution control (shield/weapon)
    - Shield Frequency status & control
- Right
    - Damage Control status & control
    - Drone status & control

### Communications
- Center
    - Current comm channel transcript & control
    - Available message quick select
- Left
    - Available channels
    - Contacts
- Right
    - Alert Level status & control
    - Deck status
    - Camera status & control
    - Landing Bay status & control
    - Cargo status & control
    - Mission Objective status

### Science
- Center
    - Local, System, Galaxy map
- Left
    - Position, heading, rotation status
    - Drones/Shuttle status & control
    - Contacts
- Right
    - Scan results

### Captain
- Alert Level status & control
- Hull, energy, shield status
- Abandon Ship control