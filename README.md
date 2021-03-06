# Render
A Wrapper for HTML5 Canvas for declarative rendering

The idea is to be able to create a UI from a single descriptive dataset, rather than having to create and manage traditional UI components (such as HTML Dom). Instead of modifying & managing a bunch of UI components (each with their own state and behaviors), the UI is updated (altered) simply by providing a new / modified dataset.

## Usage:

**`Renderer(config, width, height, textConfig)`** (constructor)
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
* **textConfig**: Can provide any of the following properties (defaults in bold):
* * font: CSS font-family. Example: "sans-serif"
* * size: CSS font-size. Examples: 16, "16px", "12pt"
* * align: Horizontal text alignment: "**start**", "end", "left", "right", "center"
* * baseline: Vertical text alignment: "top", "hanging", "middle", "**alphabetic**", "ideographic", "bottom"
* * direction: "ltr", "rtl", "**inherit**" (inherit from CSS parent)

**`getCanvas()`**
Returns the HTML5 canvas created by the constructor (e.g. so it can be appended to the DOM).

**`resize(w, h)`**
Resizes the canvas (in pixels). This also rerenders content (as passed to render(..)) after the resize. Use this method instead of resizing the canvas (as returned from getCanvas()) directly, otherwise the rendered content will *not* be automatically rerendered.

**`textWidth(text, config)`**
Returns the width of the text (and optional config) if it were to be rendered with the "text" command (see below).

**`render(content: ...["keywords", ...arguments])`**
Renders new graphics content. Any previously rendered content is removed (erased). In other words, each call to render(..) should contain *all* graphics content that the canvas should display. The "keywords" contain the name of the graphical entity to render, and other optional keywords, in any order and separated by spaces. The "arguments" to provide depends on which entity it to be rendered.

**Example entities:**
* `["circle", x, y, r]` *(circle centered at (x, y) with radius r)*
* `["arc", x, y, r, s, e]` *(arc of circle ... from **s**tart angle to **e**nd angle (in radians))*
* `["line", x1, y1, x2, y2, ...]` *(each additional (x, y) forms a line segment from previous point)*
* `["rect", x, y, width, height]` *(rectangle)*
* `["clear", x, y, width, height]` *(clear the pixels in the given rectangle)*
* `["curve", x1, y1, cx, cy, x2, y2]` *(single quadratic curve)*
* `["curve", x1, y1, c1x, c1y, c2x, c2y, x2, y2]` *(single bezier curve)*
* `["curve", x1, y1, cx, cy, x2, y2, ...]` *(each additional (cx, cy, x, y) forms a quad curve)*
* `["path", x1, y1, [...], ...]` *(sequence of lines (x, y), arcs (x, y, a), quads (cx, cy, x, y), or beziers (c1x, c1y, c2x, c2y, x, y))*
* `["text", "Hello!", x, y]` *(Draw text at (x, y))*
* `["text", "Hello!", x, y, w]` *(Draw text at (x, y), and limit width to w)*
* `["text", "Hello!", x, y, {...}]` *(Draw text at (x, y), with css-like properties (see "textConfig" in constructor))*
* `["text", "Hello!", x, y, w, {...}]` *(Draw text at (x, y), width w, & properties (see "textConfig" in constructor))*
* `["clip", x, y, w, h, ...content]` *(Draw content (nested) within a clipped/bounded rectangle)*

**Optional Keywords:**
* filled (`"filled rect"`): The entity will be filled-in (rather than just be outlined).
* closed (`"closed curve"`): The start & end points are joined to form a "closed" shape.
* *(any valid color)* (`"blue line"`, `"#0088FF rect"`): The color to render the entity in.

**Keyboard & Mouse events:**
* * `onKeyUp     (function (code) { ... })` (passes the key-code when a keyboard key is released)
* * `onKeyDown   (function (code) { ... })` (passes the key-code when a keyboard key is pressed)
* * `onMouseUp   (function (x, y) { ... })` (passes the (x,y) cursor position when mouse-button is released)
* * `onMouseDown (function (x, y) { ... })` (passes the (x,y) cursor position when mouse-button is pressed)
* * `onMouseMove (function (x, y, pX, pY) { ... })` (passes current and previous cursor position when mouse is moved)
* * `onMouseDrag (function (x, y, pX, pY) { ... })` (passes current and previous cursor position when mouse is dragged)
* * `onMouseClick(function (x, y, clicks) { ... }, timeout)` (position and number of clicks when mouse is clicked. If given a timeout, then the number of clicks resets after the timeout. For example, specify how quickly clicks must happen to be counted as a double-click, and detect a double-click when clicks is > 1)