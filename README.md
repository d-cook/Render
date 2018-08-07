# Render
A Wrapper for HTML5 Canvas for declarative rendering

The idea is to be able to create a UI from a single descriptive dataset, rather than having to create and managing traditional UI components (such as the HTML Dom). To update (alter) the UI, one simply provides a new dataset (instead of keeping of modifying & managing a bunch of UI components that all have their own state and behaviors).

## Usage:

### Constructor method:

**renderer(config:string, width:number, height:number)**
Creates a new HTML5 canvas, with convenience methods for rendering graphics primitives. All parameters are optional, and "config" can be given either first or last.
* **width**: The width of the canvas to create (in pixels). The default is 500.
* **height**: The height of the canvas to create (in pixels). The default is whatever the width is.
* **config**: Can provide any of the following keywords (in any order, separated by spaces):
** top: Y-Origin (y=0) will be at the top, with positive-y going downward.
** left: X-Origin (x=0) will be at the left, with positive-x going rightward.
** right: X-Origin (x=0) will be at the right, with positive-x going leftward.
** bottom: Y-Origin (y=0) will be at the bottom, with positive-y going upward.
** middle: The Origin (X or Y or both) will be in the center, with positive values going rightward / upward. This option is assumed by default when an alternate value is not provided for the X or Y Origin.
** (any valid color): The default color that will be used in rendering anything. If not provided, the default color will be "black".

### Methods:

**getCanvas()**
Returns the HTML5 canvas created by the constructor (e.g. so it can be appended to the DOM).

**resize(w:number, h:number)**
Resizes the canvas (in pixels). This also rerenders content (as passed to render(..)) after the resize. Use this method instead of resizing the canvas (as returned from getCanvas()) directly, otherwise the rendered content will *not* be automatically rerendered.

**render(content:[["keywords", arguments...], ...])**
Renders new graphics content. Any previously rendered content is removed (erased). In other words, each call to render(..) should contain *all* graphics content that the canvas should display. The "keywords" contain the name of the graphical entity to render, and other optional keywords, in any order and separated by spaces. The "arguments" to provide depends on which entity it to be rendered.

Example content (passed to render(..)):
* `["blue line", x1, y1, x2, y2]`
* `["solid red rect", x, y, width, height]`
* `["closed curve", x1, y1, control-x, control-y, x2, y2]`

Keywords (all are optional):
* solid: The entity will be filled-in (I might change this to "filled"). Otherwise it will just be outlined.
* closed: The shape is "closed" (currently only applies to curves)
* (any valid color): The color to render the entity in.
