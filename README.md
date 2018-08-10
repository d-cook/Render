# Render
A Wrapper for HTML5 Canvas for declarative rendering

The idea is to be able to create a UI from a single descriptive dataset, rather than having to create and manage traditional UI components (such as HTML Dom). Instead of modifying & managing a bunch of UI components (each with their own state and behaviors), the UI is updated (altered) simply by providing a new / modified dataset.

## Usage:

**Constructor: renderer(config, width, height)**
Creates a new HTML5 canvas, with convenience methods for rendering graphics primitives. All parameters are optional, and "config" can be given either first or last.
* **width**: The width of the canvas to create (in pixels). The default is 500.
* **height**: The height of the canvas to create (in pixels). The default is whatever the width is.
* **config**: Can provide any of the following keywords (in any order, separated by spaces):
* * top: Y-Origin (y=0) will be at the top, with positive-y going downward.
* * left: X-Origin (x=0) will be at the left, with positive-x going rightward.
* * right: X-Origin (x=0) will be at the right, with positive-x going leftward.
* * bottom: Y-Origin (y=0) will be at the bottom, with positive-y going upward.
* * middle: The Origin (X or Y or both) will be in the center, with positive values going rightward / upward. This option is assumed by default when an alternate value is not provided for the X or Y Origin.
* * (any valid color): The default color that will be used in rendering anything. If not provided, the default color will be "black".

**getCanvas()**
Returns the HTML5 canvas created by the constructor (e.g. so it can be appended to the DOM).

**resize(w:number, h:number)**
Resizes the canvas (in pixels). This also rerenders content (as passed to render(..)) after the resize. Use this method instead of resizing the canvas (as returned from getCanvas()) directly, otherwise the rendered content will *not* be automatically rerendered.

**render(content:[["keywords", arguments...], ...])**
Renders new graphics content. Any previously rendered content is removed (erased). In other words, each call to render(..) should contain *all* graphics content that the canvas should display. The "keywords" contain the name of the graphical entity to render, and other optional keywords, in any order and separated by spaces. The "arguments" to provide depends on which entity it to be rendered.

**Example entities:**
* `["line", x1, y1, x2, y2, ...]` *(each additional (x, y) forms a line segment from previous point)*
* `["poly", x1, y1, x2, y2, ...]` *(like "line", but forms a closed polygon)*
* `["rect", x, y, width, height]` *(rectangle)*
* `["clear", x, y, width, height]` *(clear the pixels in the given rectangle)*
* `["curve", x1, y1, cx, cy, x2, y2]` *(single quadratic curve)*
* `["curve", x1, y1, c1x, c1y, c2x, c2y, x2, y2]` *(single bezier curve)*
* `["curve", x1, y1, cx, cy, x2, y2, ...]` *(each additional (cx, cy, x, y) forms a quad curve)*
* `["path", x1, y1, [...], ...]` *(sequence of lines (x, y) or quad (cx, cy, x, y) or bezier (c1x, c1y, c2x, c2y, x, y) curves)*

**Optional Keywords:**
* solid *(`"solid rect"`)*: The entity will be filled-in (rather than just be outlined).
* closed *(`"closed curve"`)*: The shape is "closed" (currently only applies to curves).
* (color) *(`"blue line" "#0088FF rect"`)*: The color to render the entity in.
