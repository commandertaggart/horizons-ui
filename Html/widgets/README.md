# Widgets

## Screen `<hz-screen>`

This is currently just a basic container.  It will display its children as-is.

## Header `<hz-header>`

The header displays the screen title, as well as the current alert mode and a network status indicator.

### Attributes

- `title`: The screen title.  This would usually be `"[Screen.Title]"`
- `alert-status`: The current alert level.  Starts at `"blue"`, but is updated automatically by incoming network traffic.
- `network-status`: The current status of the network connection to the game. A value of `"OPEN"` shows as a green dot, indicating an active connection.  This is updated automatically.

## Debug Stream `<hz-debug>`

The debug stream lists all incoming network packets.

### Attributes

- `max-lines`: The maximum number of packets to display.  When this number is reached, older packets are dropped.  Defaults to `"50"`.

## Map `<hz-map>`

Displays a real-time map or radar.  By itself, the map does nothing visible, but is a container for the child elements listed below. Each child element represents a layer of information in the map and will be rendered to the map in the order it appears in the DOM.  Child elements not in this list will render on top of map layer elements.

### Attributes

- `mode`: One of `local`, `system` or `galaxy`, indicating the type of map to display. Default is `local`.
- `focus`: This indicates what is at the center of the map.  This can be a position vector in the format `(<x>,<y>,<z>)`, a game object id or `$vessel` (the default) indicating the player vessel. The map focus is always the center of the map.
- `focus-offset`: A vector in the format `(<x>,<y>.<z>)` that offsets the center of the map from the `focus` position. Useful for panning the view.
- `orientation`: Applies to `local` mode only.  A value of `static` shows a view locked to the local coordinate space showing positions in X and Z.  A value of `heading` shows positions in local space X and Z but rotated so "up" matches the forward vector of the focus object flattened into the XZ plane.  If `focus` is not an object or does not have an orientation, this behaves the same as `static`.  A value of `relative` will show all objects in positions relative to the focus object's full orientation.
- `zoom`: Indicates the zoom scale of the map, equating to world units per pixel.  Default is defined by the `default-zoom` property.  Larger numbers are zoomed out, smaller numbers are zoomed in.  This value resets when `mode` changes, so be sure to set this after changing `mode` if you desire a specific zoom level other than `default-zoom`.
- `default-zoom`: Provides the default zoom scale.  The value of `zoom` will start at this value on load (unless otherwise specified) and reset to this value whenever `mode` is changed.  Default value is `TBD`.

### Child Elements

#### Background Layer `<hz-map-background>`

Renders the background.

##### Attributes

- `image`: Specifies an image path to use as the background image.
- `color`: If provided, this color value will be used instead of a background image.  If `color` is not set but `image` is set, `color` defaults to `#000`.

If both `color` and `image` are specified, the color value will only show through transparent pixels in the image.  If neither are specified, the image provided by the galaxy map will be used.

#### Square Grid Layer `<hz-map-squaregrid>`

Renders a square grid of lines.

##### Attributes

- `mode`: A value of `absolute` renders a grid in absolute world coordinates, resulting in a grid that will move as the focus of the parent map moves.  A value of `relative` draws a grid with lines spaced from the center of the map, showing distances relative to the focus object.  Default is `absolute`.
- `spacing`: A number value indicating the in-world distance between grid lines. Default is `TBD`.
- `show-values`: If `true`, grid lines will be annotated with numerical values indicating distances. Default is `false`. [NOT IMPLEMENTED]
- `color`: A color value in which grid lines and values will be rendered.

#### Polar Grid Layer `<hz-map-polargrid>` [NOT IMPLEMENTED]

Renders a polar grid with radiating lines and concentric circles. This grid always indicates positions relative to the map target. This component can also be configured to render a compass, and can be used along with a square grid if desired.

##### Attributes

- `distance-spacing`: A number value indicating in-world distance between concentric circles, centered on the map focus.
- `bearing-spacing`: A number value indicating the angle between bearing lines radiating from the center of the map.  This value should be evenly divisible into 360 or the lines will not be evenly spaced around the grid. Default is `45`.  A value of `0` will disable bearing grid lines.
- `compass-radius`: A number value in on-screen pixels indicating the size of the compass ring to render.  The default is `0`, disabling the compass.
- `compass-spacing`: A number value indicating the angle between compass values.  The default is `45`.  A value of `0` will disable compass values.  An angle of e.g. `45` will place degree values at 45-degree increments around the compass ring.
- `compass-ticks`: A number value indicating the angle between compass ticks. This renders smaller tick lines between compass values.  Default is `5`.  If a tick lines up with a compass value, only the value is rendered.
- `max-distance`: A number value indicating the most distant distance ring to be rendered.  The default is `0` indicating that rings will be drawn to the full extent of the map.
- `color`: A color value in which grid lines and values will be rendered.

#### Bodies Layer `<hz-map-objects>`

This layer renders all objects, including planets, stars, contacts, etc. as appropriate for the map mode.

##### Attributes

- `allow-selection`: Allows the user to select bodies in the map, generating an event for other components to respond to.  Default is `true`.
- `system-orbits`: Renders orbit lines in `system` mode.
- `local-orbits`: Renders orbit lines in `local`mode.
- `color`: A color value to use for rendering bodies on the map.
- `orbit-color`: A color value to use for rendering orbit lines.
- `target-type`: Default is `none` which disables targeting.  Valid values are `flight`, `tactical`, `science` and `local`.  A value of `local` targets a contact on this map only.  The other values are shared with other screens.
- `all-targets`: Default is `true`.  This will indicate all shared targets on the map.  A value of `false` will indicate only the target specified in the `target-type` attribute.
- `unknown-color`: A color value used when rendering unidentified contacts. Default is `white`.
- `friendly-color`: A color value used when rendering friendly contacts. Default is `green`.
- `neutral-color`: A color value used when rendering neutral contacts. Default is `gray`.
- `hostile-color`: A color value used when rendering hostile contacts. Default is `red`.
- `target-details`: One of `none`, `above`, `below`, `side` or `leader`.  Defaults to `below`, rendering elements of the details layer below the associated object.  A value of `leader` will place details biased toward the center of the map, with a leader line pointing to the object. A value of `side` will place details next to the contact, closer to the center line of the map.  A value of `none` will not display target details.
- `all-target-details`: If `true`, will display details for all targets indicated on this map.  Otherwise, only the target specified by `target-type` will have details, even if `all-targets` is `true`.

#### Transients Layer `<hz-map-transients>`

Renders transient events and effects.  Only applies in `local` mode.

##### Attributes

- `blasts`: Indicates that blast effects should be rendered.  Default is `true`.
- `blast-color`: A color value used when rendering blasts.  Default is `gold`.
- `pings`: Indicates that ping effects should be rendered.  Default is `true`.
- `ping-color`: A color value used when rendering pings.
- `new-contacts`: Indicates that new contact effects should be rendered.  Default is `false`.
- `new-contact-color`: A color value used when rendering new contact effects.  Default is `white`.

