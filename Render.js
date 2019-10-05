function Renderer(config, width, height, textConfig) {
    function type(o) {
        let t = (typeof o);
        return (o === null || t === 'undefined') ? 'null'  :
               (Array.isArray(o)               ) ? 'array' :
               (t === 'boolean'                ) ? 'bool'  : t;
    }

    let _ctorArgs = [...arguments];
    config = null; width = null; height = null; textConfig = null;

    _ctorArgs.map(a => {
        let ta = type(a);
        /**/ if (ta === 'string' && config     === null) { config     = a; }
        else if (ta === 'number' && width      === null) { width      = a; }
        else if (ta === 'number' && height     === null) { height     = a; }
        else if (ta === 'object' && textConfig === null) { textConfig = a; }
    });

    let baseX, baseY, defColor;

    (function() {
        let ids = ('' + (config || '')).toLowerCase().split(' ');
        let T = null, L = null, R = null, B = null, M = 0, C = null;
        ids.map(id => {
            let t = (id === 'top'   ); T = T || (t && !B);
            let l = (id === 'left'  ); L = L || (l && !R);
            let r = (id === 'right' ); R = R || (r && !L);
            let b = (id === 'bottom'); B = B || (b && !T);
            let m = (id === 'middle' || id === 'center');
            C = (t || l || r || b || m) ? C : id;
        });
        baseX = (L) ? 'left' : (R) ? 'right'  : 'middle';
        baseY = (T) ? 'top'  : (B) ? 'bottom' : 'middle';
        defColor = C || 'black';
    }());

    let buffer   = document.createElement('canvas');
    let canvas   = document.createElement('canvas');
    let ctx      = buffer.getContext('2d');
    let outerCtx = canvas.getContext('2d');
    let dx       = (baseX === 'right' ? -1 : +1);
    let dy       = (baseY === 'top'   ? +1 : -1);
    let originX  = 0;
    let originY  = 0;
    let content  = [];
    let clips    = [];

    buffer.width  = canvas.width  = (type(width)  === 'number') ? width  : 500;
    buffer.height = canvas.height = (type(height) === 'number') ? height : canvas.width;

    textConfig = Object.assign({
        font     : 'sans-serif',
        size     : '10px',
        align    : 'start',
        baseline : 'alphabetic',
        direction: 'inherit'
    }, (textConfig || {}));

    let ops = {
        line:         (    ...points) => linePath (points, 0, 0),
        closedline:   (    ...points) => linePath (points, 1, 0),
        filledline:   (    ...points) => linePath (points, 1, 1),
        curve:        (    ...points) => curvePath(points, 0, 0),
        closedcurve:  (    ...points) => curvePath(points, 1, 0),
        filledcurve:  (    ...points) => curvePath(points, 1, 1),
        path:         (    ...points) => mixedPath(points, 0, 0),
        closedpath:   (    ...points) => mixedPath(points, 1, 0),
        filledpath:   (    ...points) => mixedPath(points, 1, 1),
        circle:       (x, y, r      ) => _arc(x, y, r,     0 ,     2*Math.PI , 1, 0, 0),
        filledcircle: (x, y, r      ) => _arc(x, y, r,     0 ,     2*Math.PI , 1, 1, 0),
        arc:          (x, y, r, s, e) => _arc(x, y, r, (s||0), (e||2*Math.PI), 0, 0, 0),
        closedarc:    (x, y, r, s, e) => _arc(x, y, r, (s||0), (e||2*Math.PI), 1, 0, 0),
        filledarc:    (x, y, r, s, e) => _arc(x, y, r, (s||0), (e||2*Math.PI), 1, 1, 0),
        rect:         (x, y, w, h   ) => ctx.strokeRect(xOf(x+0.5, w-1), yOf(y+0.5, h-1), w-1, h-1),
        filledrect:   (x, y, w, h   ) => ctx.fillRect  (xOf(x,     w  ), yOf(y,     h  ), w,   h  ),
        clear:        (x, y, w, h   ) => ctx.clearRect (xOf(x,     w  ), yOf(y,     h  ), w  , h  ),
        text:         (t, x, y, w, c) => _text(t, x, y, w, arguments[arguments.length - 1], true),
        clip:         (x, y, w, h, ...content) => {
            let x2 = x + w;
            let y2 = y + h;
            if (clips.length > 0) {
                let c = clips[clips.length - 1];
                if (x >= c.x2 || c.x >= x2 || y >= c.y2 || c.y >= y2) { return; }
                x = Math.max(x, c.x); x2 = Math.min(x2, c.x2); w = x2 - x;
                y = Math.max(y, c.y); y2 = Math.min(y2, c.y2); h = y2 - y;
            }
            ctx.save();
            ctx.rect(xOf(x), yOf(y), w, h);
            ctx.clip();
            clips.push({ x:x, y:y, x2:x2, y2:y2 });
            renderContent(content);
            clips.pop();
            ctx.restore();
        }
    };

    function xOf(x, w) { return originX + dx * (dx > 0 ? x : x + (w||0)); }
    function yOf(y, h) { return originY + dy * (dy > 0 ? y : y + (h||0)); }
    function angOf (a) { let va = (dy > 0 ? a : -a); return (dx > 0) ? va : Math.PI - va; }

    function setFont(config) {
        config = (type(config) === 'object') ? Object.assign({}, textConfig, config) : textConfig;
        let s = config.size; s = /^\d+$/.test(s) ? s+'px' : String(s);
        ctx.font = s+' ' + config.font;
        ctx.textAlign    = config.align;
        ctx.textBaseline = config.baseline;
        ctx.direction    = config.direction;
    }

    function linePath(args, close, fill) {
        let d  = (fill ? 0 : 0.5);
        let xs = args.filter((a, i) => i % 2 === 0).map(x => xOf(x) + d);
        let ys = args.filter((a, i) => i % 2 === 1).map(y => yOf(y) + d);
        ys.map((y, i) => ctx[i < 1 ? 'moveTo' : 'lineTo'](xs[i], y));
        if (close) { ctx.closePath(); }
        ctx[fill ? 'fill' : 'stroke']();
    }

    function curvePath(args, close, fill) {
        let d = (fill ? 0 : 0.5);
        ctx.moveTo(xOf(args[0]+d), yOf(args[1]+d));
        if (args.length < 6) {
            ctx.lineTo(xOf(args[2]+d), yOf(args[3]+d));
        } else if (args.length > 6 && args.length < 10) {
            ctx.bezierCurveTo(xOf(args[2]+d), yOf(args[3]+d), xOf(args[4]+d), yOf(args[5]+d), xOf(args[6]+d), yOf(args[7]+d));
        } else for(let i = 2; i < args.length - 3; i += 4) {
            ctx.quadraticCurveTo(xOf(args[i]+d), yOf(args[i+1]+d), xOf(args[i+2]+d), yOf(args[i+3]+d));
        }
        if (close) {
            // If there is one extra control-point, then *curve* back to the starting point. Otherwise just close the path:
            if (i < args.length - 1) { ctx.quadraticCurveTo(xOf(args[i]+d), yOf(args[i+1]+d), xOf(args[0]+d), yOf(args[1]+d)); }
            else { ctx.closePath(); }
        }
        ctx[fill ? 'fill' : 'stroke']();
    }

    function _text(t, x, y, w, c, fill) {
        let d = (fill ? 0 : 0.5);
        setFont(c);
        if (type(w) === 'number') { ctx[fill ? 'fillText' : 'strokeText'](t, x, y, w); }
        else /******************/ { ctx[fill ? 'fillText' : 'strokeText'](t, x, y); }
    }

    function _arc(x, y, r, s, e, close, fill, path) {
        let d = (fill ? 0 : 0.5);
        ctx.arc(xOf(x+d), yOf(y+d), r, angOf(s), angOf(e), (dx * dy * (path || 1)) < 0);
        if (close) { ctx.closePath(); }
        if (!path) { ctx[fill ? 'fill' : 'stroke'](); }
    }

    function arcTo(x0, y0, cx, cy, a, fill) {
        let x = x0 - cx;
        let y = y0 - cy;
        let r = Math.sqrt(x*x + y*y);
        let s = Math.atan2(y, x);
        _arc(cx, cy, r, s, s+a, 0, fill, (a > 0 ? 1 : -1));
    }

    function mixedPath(args, close, fill) {
        let d = (fill ? 0 : 0.5);
        let prevX = args[0];
        let prevY = args[1];
        ctx.moveTo(xOf(args[0]+d), yOf(args[1]+d));
        args.map(p => {
            if /**/ (p.length < 3) { ctx.lineTo/*********/(xOf(p[0]+d), yOf(p[1]+d)); }
            if /**/ (p.length < 4) { arcTo(prevX, prevY, p[0], p[1], p[2], fill); }
            else if (p.length < 6) { ctx.quadraticCurveTo (xOf(p[0]+d), yOf(p[1]+d), xOf(p[2]+d), yOf(p[3]+d)); }
            else /***************/ { ctx.bezierCurveTo/**/(xOf(p[0]+d), yOf(p[1]+d), xOf(p[2]+d), yOf(p[3]+d), xOf(p[4]+d), yOf(p[5]+d)); }
            prevX = p[p.length - 2];
            prevY = p[p.length - 1];
        });
        if (close) { ctx.closePath(); }
        ctx[fill ? 'fill' : 'stroke']();
    }

    function setOrigin() {
        originX = (baseX === 'left') ? 0 : (baseX === 'right' ) ? canvas.width  : Math.floor(canvas.width  / 2);
        originY = (baseY === 'top' ) ? 0 : (baseY === 'bottom') ? canvas.height : Math.floor(canvas.height / 2);
    }

    function renderContent(content) {
        content.map(c => {
            let data = c || ['noop'];
            let ids = ('' + (data[0] || '')).toLowerCase().split(' ');
            let filled = false, closed = false, color = null;
            let op = null, fop = null, cop = null;
            ids.map(id => {
                let o  = ops[id];
                let fo = ops['filled'+id];
                let co = ops['closed'+id];
                let fd = (id === 'filled');
                let cd = (id === 'closed');
                op     = (op     || o);
                fop    = (fop    || fo);
                cop    = (cop    || co);
                filled = (filled || fd);
                closed = (closed || cd);
                color  = (color  || (!o && !fo && !co && !fd && !cd && id));
            });
            op = (filled && fop) || (closed && cop) || op;
            if (op) {
                let args = data.slice(1);
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
        requestAnimationFrame(() => {
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

    let events = {};
    let keysDown = {};
    let prevMouse = null;
    let lastClicked = null;
    let clickTimer = null;
    let clickTimeout = 0;
    let pressed = false;
    let dragged = false;
    let clicks = 0;

    function on(name, f) {
        window.addEventListener(name, e => f(e || window.event), false);
    }

    function getMouseCoords(e) {
        let r = canvas.getBoundingClientRect();
        let w = parseInt((canvas.currentStyle || canvas.style).borderLeftWidth) || 0;
        let h = parseInt((canvas.currentStyle || canvas.style).borderTopWidth ) || 0;
        let x = xOf(e.clientX - r.left - w);
        let y = yOf(e.clientY - r.top  - h);
        return (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) ? { x: x, y: y} : null;
    }

    on('keyup', (e) => {
        if (events.keyup && lastClicked === canvas) {
            events.keyup(e.keyCode);
        }
        keysDown[e.keyCode] = false;
    });

    on('keydown', (e) => {
        if (events.keydown && lastClicked === canvas && !keysDown[e.keyCode]) {
            events.keydown(e.keyCode);
        }
        keysDown[e.keyCode] = true;
    });

    on('mousedown', (e) => {
        let m = getMouseCoords(e);
        if (m && events.mousedown) {
            events.mousedown(m.x, m.y);
        }
        lastClicked = e.target;
        pressed = true;
    });

    on('mouseup', (e) => {
        let m = getMouseCoords(e);
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

    on('mousemove', (e) => {
        let m = getMouseCoords(e);
        if (m && (events.mousedrag || events.mousemove)) {
            let p = prevMouse || m;
            if (events.mousemove) {
                events.mousemove(m.x, m.y, p.x, p.y);
            }
            if (events.mousedrag && pressed) {
                events.mousedrag(m.x, m.y, p.x, p.y);
            }
            prevMouse = m;
            clicks = 0;
        }
        if (pressed) { dragged = true; }
    });

    renderFrame();

    return {
        render: (...items) => {
            content = (items.length < 1) ? content : (type(items[0]) === 'array') ? items : [items];
            renderFrame();
        },
        resize      : resizeCanvas,
        fillWindow  : fillWindow,
        fitToWindow : fitToWindow,
        textWidth   : (text, config) => setFont(config) || ctx.measureText(text).width || 0,
        getCanvas   : ( ) => canvas,
        onKeyUp     : (f) => events.keyup     = f,
        onKeyDown   : (f) => events.keydown   = f,
        onMouseUp   : (f) => events.mouseup   = f,
        onMouseDown : (f) => events.mousedown = f,
        onMouseMove : (f) => events.mousemove = f,
        onMouseDrag : (f) => events.mousedrag = f,
        onMouseClick: (f, timeout) => {
            if (type(timeout) === 'number') { clickTimeout = timeout; }
            events.mouseclick = f;
        }
    };
}

/*
// ---- EVENTS DEMO ----
let ui = Renderer('top left');
ui.fitToWindow();
ui.onMouseMove((x, y, px, py) => ui.render(['red circle', px, py, 12],['blue circle', x, y, 10]));
ui.onMouseDrag((x, y, px, py) => ui.render(['filled red circle', px, py, 12],['filled blue circle', x, y, 10]));
ui.onMouseDown((x, y) => ui.render(['filled blue rect', x-10, y-10, 20, 20]));
ui.onMouseUp  ((x, y) => ui.render(['blue rect', x-10, y-10, 20, 20]));
ui.onMouseClick((x, y, clicks) => ui.render(['red rect', x-12-clicks*clicks, y-12-clicks*clicks, 24+2*clicks*clicks, 24+2*clicks*clicks]), 250);
ui.onKeyDown(k => console.log("DOWN: " + k ));
ui.onKeyUp  (k => console.log("UP  : " + k ));
*/