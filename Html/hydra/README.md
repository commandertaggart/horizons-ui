# Hydra Network Protocol

## Metagame Packets
---

## ⬆ `ACCEPT-PACKET`

Sent by the client to request receipt of the specified packet.  The client should receive the specified packet for the remainder of the session, and in most cases will receive the most recent packet value in immediate response.  Some packets are sent to all clients even without subscription.  These packets include: `SESSION`, `RST`, `SESSIONCLR`, `SCREENLEVEL`, `MISSION`, `MISSION-BRIEFING`, `VARIABLES`, `GSP`, `SVRS`, `SETTINGS`, `FACTIONS`, `VESSEL`, `ALERT`, `BC`.

**Payload** - String: The packet name to subscribe to or `*` to subscribe to all packets (dev use only).  Specifying `*` will not result in any most recent packet values in response.

## ⬆ `IDENTIFY`

Sent by the client to inform the server of the screen name and location of the player.

**Payload** - JSON Object:
- `ScreenName`: The title of this screen
- `Location`: A string providing the real-world location of this client

## ⬆ `PING`

Sent periodically by the client to keep the connection alive

**Payload** - String: The title of this screen

## ⬆ `CONSOLE-STATUS`

Informs the server of the current console's status

**Payload** - String: Name of the current status: `Idle`, `Offline`, `Online`, `Mission Briefing`, `Mission Summary`, `Broken`.

## ⬇ `SESSION`

**Payload** - JSON Object: 
- `CommOverride`
- `EncountersEnabled`
- `Mode`
- `State`

## ⬇ `RST`

**Payload** - None.

## ⬇ `SCREENLEVEL`, `CONSOLE-LEVEL`

Informs the console to show or hide various components based on intended user level.

**Payload** - String: `Novice`, `Intermediate` or `Advanced`

## ⬇ `SETTINGS`

**Payload** - JSON Object:
- `Debug` - Boolean: Is the server running debug mode.
- `Production` - Boolean: Is the server app a production build (vs. dev build).

## ⬇ `SVRS`

**Payload** - String: The time at which the server started the current game session in UTC format.

## ⬇ `BC`

**Payload** - None.

#

## Gameplay Packets
---

