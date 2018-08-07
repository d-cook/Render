# Render
Wrapper for HTML5 Canvas for declarative rendering

## Usage:

#### Constructor method:

**renderer(config:string, width:number, height:number)**
Creates a new HTML5 canvas, with convenience methods for rendering graphics primitives.
All parameters are optional, and "config" can be given first or last.
* **config**: Can provide any of the following keywords (in any order, separated by spaces):
** top: Y-Origin (y=0) will be at the top, with positive-y going downward.
** left: X-Origin (x=0) will be at the left, with positive-x going rightward.
** right: X-Origin (x=0) will be at the right, with positive-x going leftward.
** bottom: Y-Origin (y=0) will be at the bottom, with positive-y going upward.
** middle: The Origin (X or Y or both, if not provided some other way) will be in the center, with positive values going rightward / upward.
** (any valid color): The default color that will be used in rendering anything.
* **width**: The width of the canvas to create (in pixels).
* **height**: The height of the canvas to create (in pixels).

#### Methods:

**getCanvas()**
Returns the HTML5 canvas created by the constructor (e.g. so it can be appended to the DOM).

**resize(w:number, h:number)**
Resizes the canvas (in pixels). This also rerenders content (as passed to render()) after the resize. Use this method instead of resizing the canvas (as returned from getCanvas()) directly, otherwise the rendered content will *not* be automatically rerendered.

**render(content)**
Renders new graphics content. Any previously rendered content is removed (erased). In other words, each call to render(..) should contain *all* graphics content that the canvas should display. Once rendered, the content will remain visible even if the canvas is resized. Content can be given in any of the following forms:
* (editing....)
