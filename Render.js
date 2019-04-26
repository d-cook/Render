function Renderer(config, width, height, textConfig) {
    var _ctorArgs = [].slice.call(arguments, 0);
    config = null; width = null; height = null; textConfig = null;

    for(var i = 0; i < _ctorArgs.length; i++) {
        var a = _ctorArgs[i]; var ta = (typeof a);
        if (ta === 'string' && config === null) { config = a; }
        else if (ta === 'number' && width === null) { width = a; }
        else if (ta === 'number' && height === null) { height = a; }
        else if (ta === 'object' && textConfig === null) { textConfig = a; }
    }

    var baseX, baseY, defColor;

    (function() {
        var ids = ('' + (config || '')).toLowerCase().split(' ');
        var T = null, L = null, R = null, B = null, M = 0, C = null;

        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            var t = (id === 'top'   ); T = T || (t && !B);
            var l = (id === 'left'  ); L = L || (l && !R);
            var r = (id === 'right' ); R = R || (r && !L);
            var b = (id === 'bottom'); B = B || (b && !T);
            var m = (id === 'middle' || id === 'center');
            C = (t || l || r || b || m) ? C : id;
        }

        baseX = (L) ? 'left' : (R) ? 'right' : 'middle';
        baseY = (T) ? 'top' : (B) ? 'bottom' : 'middle';
        defColor = C || 'black';
    }());

    var buffer   = document.createElement('canvas');
    var canvas   = document.createElement('canvas');
    var ctx      = buffer.getContext('2d');
    var outerCtx = canvas.getContext('2d');
    var dx       = (baseX === 'right' ? -1 : +1);
    var dy       = (baseY === 'top'   ? +1 : -1);
    var originX  = 0;
    var originY  = 0;
    var content  = [];

    buffer.width  = canvas.width  = (typeof width  === 'number') ? width  : 500;
    buffer.height = canvas.height = (typeof height === 'number') ? height : canvas.width;

    textConfig = Object.assign({}, {
        font: 'sans-serif',
        size: '10px',
        align: 'start',
        baseline: 'alphabetic',
        direction: 'inherit'
    }, (textConfig || {}));

    var ops = {
        line:        function line        (/*..points..*/) { linePath(arguments, 0, 0); },
        closedline:  function closedline  (/*..points..*/) { linePath(arguments, 1, 0); },
        filledline:  function filledline  (/*..points..*/) { linePath(arguments, 1, 1); },
        curve:       function curve       (/*..points..*/) { curvePath(arguments, 0, 0); },
        closedcurve: function closedcurve (/*..points..*/) { curvePath(arguments, 1, 0); },
        filledcurve: function filledcurve (/*..points..*/) { curvePath(arguments, 1, 1); },
        path:        function path        (/*..points..*/) { mixedPath(arguments, 0, 0); },
        closedpath:  function closedpath  (/*..points..*/) { mixedPath(arguments, 1, 0); },
        filledpath:  function filledpath  (/*..points..*/) { mixedPath(arguments, 1, 1); },
        circle:      function circle      (x, y, r      ) { _arc(x, y, r,     0 ,     2*Math.PI , 1, 0, 0); },
        filledcircle:function filledcircle(x, y, r      ) { _arc(x, y, r,     0 ,     2*Math.PI , 1, 1, 0); },
        arc:         function arc         (x, y, r, s, e) { _arc(x, y, r, (s||0), (e||2*Math.PI), 0, 0, 0); },
        closedarc:   function closedarc   (x, y, r, s, e) { _arc(x, y, r, (s||0), (e||2*Math.PI), 1, 0, 0); },
        filledarc:   function filledarc   (x, y, r, s, e) { _arc(x, y, r, (s||0), (e||2*Math.PI), 1, 1, 0); },
        rect:        function rect        (x, y, w, h) { ctx.strokeRect(xof(x+0.5, w-1), yof(y+0.5, h-1), w-1, h-1); },
        filledrect:  function filledrect  (x, y, w, h) { ctx.fillRect  (xof(x,     w  ), yof(y,     h  ), w,   h  ); },
        clear:       function clear       (x, y, w, h) { ctx.clearRect (xof(x,     w  ), yof(y,     h  ), w  , h  ); },
        text:        function text        (t, x, y, w, c) {
            c = arguments[arguments.length - 1];
            _text(t, x, y, w, (typeof c === 'object' && c), true);
        }
    };

    function xof(x, w) { return originX + dx * (dx > 0 ? x : x + (w||0)); }
    function yof(y, h) { return originY + dy * (dy > 0 ? y : y + (h||0)); }
    function aof(a) { var va = (dy > 0 ? a : -a); return (dx > 0 ? va : Math.PI - va); }

    function setFont(config) {
        config = Object.assign({}, textConfig, (config || {}));
        var s = config.size; s = /^\d+$/.test(s) ? s+'px' : String(s);
        ctx.font = s + ' ' + config.font;
        ctx.textAlign = config.align;
        ctx.textBaseline = config.baseline;
        ctx.direction = config.direction;
    }

    function linePath(args, close, fill) {
        var d = (fill ? 0 : 0.5);
        ctx.moveTo(xof(args[0]+d), yof(args[1]+d));
        for(var i = 2; i < args.length - 1; i += 2) { ctx.lineTo(xof(args[i]+d), yof(args[i+1]+d)); }
        if (close) { ctx.closePath(); }
        ctx[fill ? 'fill' : 'stroke']();
    }

    function curvePath(args, close, fill) {
        var d = (fill ? 0 : 0.5);
        ctx.moveTo(xof(args[0]+d), yof(args[1]+d));
        if (args.length < 6) {
            ctx.lineTo(xof(args[2]+d), yof(args[3]+d));
        } else if (args.length > 6 && args.length < 10) {
            ctx.bezierCurveTo(xof(args[2]+d), yof(args[3]+d), xof(args[4]+d), yof(args[5]+d), xof(args[6]+d), yof(args[7]+d));
        } else for(var i = 2; i < args.length - 3; i += 4) {
            ctx.quadraticCurveTo(xof(args[i]+d), yof(args[i+1]+d), xof(args[i+2]+d), yof(args[i+3]+d));
        }
        if (close) {
            // If there is one extra control-point, then *curve* back to the starting point. Otherwise just close the path:
            if (i < args.length - 1) { ctx.quadraticCurveTo(xof(args[i]+d), yof(args[i+1]+d), xof(args[0]+d), yof(args[1]+d)); }
            else { ctx.closePath(); }
        }
        ctx[fill ? 'fill' : 'stroke']();
    }

    function _text(t, x, y, w, c, fill) {
        var d = (fill ? 0 : 0.5);
        setFont(c);
        if (typeof w === 'number') { ctx[fill ? 'fillText' : 'strokeText'](t, x, y, w); }
        else /*******************/ { ctx[fill ? 'fillText' : 'strokeText'](t, x, y); }
    }

    function _arc(x, y, r, s, e, close, fill, path) {
        var d = (fill ? 0 : 0.5);
        ctx.arc(xof(x+d), yof(y+d), r, aof(s), aof(e), (dx * dy * (path || 1)) < 0);
        if (close) { ctx.closePath(); }
        if (!path) { ctx[fill ? 'fill' : 'stroke'](); }
    }

    function arcTo(x0, y0, cx, cy, a, fill) {
        var x = x0 - cx;
        var y = y0 - cy;
        var r = Math.sqrt(x*x + y*y);
        var s = Math.atan2(y, x);
        _arc(cx, cy, r, s, s+a, 0, fill, (a > 0 ? 1 : -1));
    }

    function mixedPath(args, close, fill) {
        var d = (fill ? 0 : 0.5);
        var prevX = args[0];
        var prevY = args[1];
        ctx.moveTo(xof(args[0]+d), yof(args[1]+d));
        for(var i = 2; i < args.length; i++) {
            var p = args[i];
            if /**/ (p.length < 3) { ctx.lineTo/*********/(xof(p[0]+d), yof(p[1]+d)); }
            if /**/ (p.length < 4) { arcTo(prevX, prevY, p[0], p[1], p[2], fill); }
            else if (p.length < 6) { ctx.quadraticCurveTo (xof(p[0]+d), yof(p[1]+d), xof(p[2]+d), yof(p[3]+d)); }
            else /***************/ { ctx.bezierCurveTo/**/(xof(p[0]+d), yof(p[1]+d), xof(p[2]+d), yof(p[3]+d), xof(p[4]+d), yof(p[5]+d)); }
            prevX = p[p.length - 2];
            prevY = p[p.length - 1];
        }
        if (close) { ctx.closePath(); }
        ctx[fill ? 'fill' : 'stroke']();
    }

    function setOrigin() {
        originX = (baseX === 'left') ? 0 : (baseX === 'right' ) ? canvas.width  : Math.floor(canvas.width  / 2);
        originY = (baseY === 'top' ) ? 0 : (baseY === 'bottom') ? canvas.height : Math.floor(canvas.height / 2);
    }

    function renderContent(content) {
        content.map(c => {
            var data = c || ['noop'];
            var ids = ('' + (data[0] || '')).toLowerCase().split(' ');
            var filled = false, closed = false, color = null;
            var op = null, fop = null, cop = null;

            for(var i = 0; i < ids.length; i++) {
                var id = ids[i];
                var o  = ops[id];
                var fo = ops['filled'+id];
                var co = ops['closed'+id];
                var fd = (id === 'filled');
                var cd = (id === 'closed');
                op     = (op     || o);
                fop    = (fop    || fo);
                cop    = (cop    || co);
                filled = (filled || fd);
                closed = (closed || cd);
                color  = (color  || (!o && !fo && !co && !fd && !cd && id));
            }

            op = (filled && fop) || (closed && cop) || op;
            if (op) {
                var args = data.slice(1);
                ctx.fillStyle   = (color || defColor);
                ctx.strokeStyle = (color || defColor);
                ctx.beginPath();
                op.apply(null, args);
            }
        });
    }

    function renderFrame() {
        setOrigin();
        buffer.width = buffer.width;
        canvas.width = canvas.width;
        ctx.clearRect(0, 0, buffer.width, buffer.height);
        renderContent(content);
        requestAnimationFrame(function renderBuffer() {
            outerCtx.clearRect(0, 0, canvas.width, canvas.height);
            outerCtx.drawImage(buffer, 0, 0);
        });
    }

    function resizeCanvas(w, h) {
        buffer.width = canvas.width  = w;
        buffer.height = canvas.height = h;
        renderFrame();
    }

    function fillWindow() {
        resizeCanvas(window.innerWidth, window.innerHeight);
    }

    function fitToWindow(onResize) {
        function resizeRenderer() {
            if (onResize) { onResize(window.innerWidth, window.innerHeight); }
            fillWindow();
        }
        window.addEventListener('resize', resizeRenderer);
        document.body.style.margin = '0';
        document.body.style.overflow = 'hidden';
        document.body.appendChild(canvas);
        resizeRenderer();
    }

    // ---- Event Handlers ----

    var events = {};
    var keysDown = {};
    var prevMouse = null;
    var lastClicked = null;
    var clickTimer = null;
    var clickTimeout = 0;
    var pressed = false;
    var dragged = false;
    var clicks = 0;

    function on(name, f) {
        window.addEventListener(name, e => f(e || window.event), false);
    }

    function getMouseCoords(e) {
        var r = canvas.getBoundingClientRect();
        var w = parseInt((canvas.currentStyle || canvas.style).borderLeftWidth) || 0;
        var h = parseInt((canvas.currentStyle || canvas.style).borderTopWidth ) || 0;
        var x = xof(e.clientX - r.left - w);
        var y = yof(e.clientY - r.top  - h);
        return (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) ? { x: x, y: y} : null;
    }

    on('keyup',   function keyup  (e) {
        if (events.keyup && lastClicked === canvas) {
            events.keyup(e.keyCode);
        }
        keysDown[e.keyCode] = false;
    });

    on('keydown', function keydown(e) {
        if (events.keydown && lastClicked === canvas && !keysDown[e.keyCode]) {
            events.keydown(e.keyCode);
        }
        keysDown[e.keyCode] = true;
    });

    on('mousedown', function mousedown(e) {
        var m = getMouseCoords(e);
        if (m && events.mousedown) {
            events.mousedown(m.x, m.y);
        }
        lastClicked = e.target;
        pressed = true;
    });

    on('mouseup', function mouseup(e) {
        var m = getMouseCoords(e);
        if (m && events.mouseup) {
            events.mouseup(m.x, m.y);
        }
        if (!dragged) {
            clicks++;
            if (clickTimer) { clearTimeout(clickTimer); }
            clickTimer = setTimeout(() => {
                if (m && events.mouseclick) {
                    events.mouseclick(m.x, m.y, clicks);
                }
                clicks = 0;
            }, clickTimeout||0);
        }
        dragged = false;
        pressed = false;
    });

    on('mousemove', function mousemove(e) {
        var m = getMouseCoords(e);
        if (m && events.mousedrag) {
            var p = prevMouse || m;
            events.mousemove(m.x, m.y, p.x, p.y);
            if (pressed) {
                events.mousedrag(m.x, m.y, p.x, p.y);
            }
            prevMouse = m;
            clicks = 0;
        }
        if (pressed) { dragged = true; }
    });

    renderFrame();

    return {
        getCanvas: function getCanvas() {
            return canvas;
        },
        render: function render(c) {
            if (arguments.length > 0) {
                if (!Array.isArray(c)) { var c2 = []; c2.push.apply(c2, arguments); c = c2; }
                content = Array.isArray(c[0]) ? c : [c];
            }
            renderFrame();
        },
        resize: resizeCanvas,
        fillWindow: fillWindow,
        fitToWindow: fitToWindow,
        textWidth: function textWidth(text, config) {
            setFont(config);
            return ctx.measureText(text).width || 0;
        },
        onKeyUp:      function onKeyUp     (f) { events.keyup     = f; },
        onKeyDown:    function onKeyDown   (f) { events.keydown   = f; },
        onMouseUp:    function onMouseUp   (f) { events.mouseup   = f; },
        onMouseDown:  function onMouseDown (f) { events.mousedown = f; },
        onMouseMove:  function onMouseMove (f) { events.mousemove = f; },
        onMouseDrag:  function onMouseDrag (f) { events.mousedrag = f; },
        onMouseClick: function onMouseClick(f, timeout) {
            if (arguments.length > 1) { clickTimeout = timeout; }
            events.mouseclick = f;
        }
    };
}

/*
// ---- EVENTS DEMO ----
var ui = Renderer('top left');
ui.fitToWindow();
ui.onMouseMove((x, y, px, py) => ui.render([['red circle', px, py, 12],['blue circle', x, y, 10]]));
ui.onMouseDrag((x, y, px, py) => ui.render([['filled red circle', px, py, 12],['filled blue circle', x, y, 10]]));
ui.onMouseDown((x, y) => ui.render([['filled blue rect', x-10, y-10, 20, 20]]));
ui.onMouseUp  ((x, y) => ui.render([['blue rect', x-10, y-10, 20, 20]]));
ui.onMouseClick((x, y, clicks) => ui.render([['red rect', x-12-clicks*clicks, y-12-clicks*clicks, 24+2*clicks*clicks, 24+2*clicks*clicks]]), 250);
ui.onKeyDown(k => console.log("DOWN: " + k ));
ui.onKeyUp  (k => console.log("UP  : " + k ));
*/