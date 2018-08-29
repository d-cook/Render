function Renderer(config, width, height) {
    if ((typeof config) !== 'string') { var x = config; config = width;  width  = x; }
    if ((typeof config) !== 'string') { var x = config; config = height; height = x; }

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

    var ops = {
        line:        function line        (/*..points..*/) { linePath(arguments, 0, 0); },
        poly:        function poly        (/*..points..*/) { linePath(arguments, 1, 0); },
        filledpoly:  function filledpoly  (/*..points..*/) { linePath(arguments, 1, 1); },
        curve:       function curve       (/*..points..*/) { curvePath(arguments, 0, 0); },
        closedcurve: function closedcurve (/*..points..*/) { curvePath(arguments, 1, 0); },
        filledcurve: function filledcurve (/*..points..*/) { curvePath(arguments, 1, 1); },
        path:        function path        (/*..points..*/) { mixedPath(arguments, 0, 0); },
        closedpath:  function closedpath  (/*..points..*/) { mixedPath(arguments, 1, 0); },
        filledpath:  function filledpath  (/*..points..*/) { mixedPath(arguments, 1, 1); },
        circle:      function circle      (x, y, r      ) { _arc(x, y, r,     0 ,     2*Math.PI , 1, 0); },
        filledcircle:function filledcircle(x, y, r      ) { _arc(x, y, r,     0 ,     2*Math.PI , 1, 0); },
        arc:         function arc         (x, y, r, s, e) { _arc(x, y, r, (s||0), (e||2*Math.PI), 0, 0); },
        closedarc:   function closedarc   (x, y, r, s, e) { _arc(x, y, r, (s||0), (e||2*Math.PI), 1, 0); },
        filledarc:   function filledarc   (x, y, r, s, e) { _arc(x, y, r, (s||0), (e||2*Math.PI), 1, 1); },
        rect:        function rect        (x, y, w, h) { ctx.strokeRect(xof(x+0.5, w-1), yof(y+0.5, h-1), w-1, h-1); },
        filledrect:  function filledrect  (x, y, w, h) { ctx.fillRect  (xof(x,     w  ), yof(y,     h  ), w,   h  ); },
        clear:       function clear       (x, y, w, h) { ctx.clearRect (xof(x,     w  ), yof(y,     h  ), w  , h  ); }
    };

    function xof(x, w) { return originX + dx * (dx > 0 ? x : x + (w||0)); }
    function yof(y, h) { return originY + dy * (dy > 0 ? y : y + (h||0)); }
    function aof(a) { var va = (dy > 0 ? a : -a); return (dx > 0 ? va : Math.PI - va); }

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

    function _arc(x, y, r, s, e, close, fill) {
        var d = (fill ? 0 : 0.5);
        ctx.arc(xof(x+d), yof(y+d), r, aof(s), aof(e), (dx * dy < 0));
        if (close) { ctx.closePath(); }
        ctx[fill ? 'fill' : 'stroke']();
    }

    function mixedPath(args, close, fill) {
        var d = (fill ? 0 : 0.5);
        ctx.moveTo(xof(args[0]+d), yof(args[1]+d));
        for(var i = 2; i < args.length; i++) {
            var p = args[i];
            if /**/ (p.length < 4) { ctx.lineTo/*********/(xof(p[0]+d), yof(p[1]+d)); }
            else if (p.length < 6) { ctx.quadraticCurveTo (xof(p[0]+d), yof(p[1]+d), xof(p[2]+d), yof(p[3]+d)); }
            else /***************/ { ctx.bezierCurveTo/**/(xof(p[0]+d), yof(p[1]+d), xof(p[2]+d), yof(p[3]+d), xof(p[4]+d), yof(p[5]+d)); }
        }
        if (close) { ctx.closePath(); }
        ctx[fill ? 'fill' : 'stroke']();
    }

    function setOrigin() {
        originX = (baseX === 'left') ? 0 : (baseX === 'right' ) ? canvas.width  : Math.floor(canvas.width  / 2);
        originY = (baseY === 'top' ) ? 0 : (baseY === 'bottom') ? canvas.height : Math.floor(canvas.height / 2);
    }

    function renderFrame() {
        setOrigin();
        buffer.width--; buffer.width++;
        canvas.width--; canvas.width++;
        ctx.clearRect(0, 0, buffer.width, buffer.height);

        for(var ci = 0; ci < content.length; ci++) {
            var data = content[ci] || ['noop'];
            var ids = ('' + (data[0] || '')).toLowerCase().split(' ');
            var filled = false, closed = false, color = null;
            var op = null, fop = null, cop = null;

            for(var i = 0; i < ids.length; i++) {
                var id = ids[i];
                var o  = ops[id];
                var so = ops['filled'+id];
                var co = ops['closed'+id];
                var fd = (id === 'filled');
                var cd = (id === 'closed');
                op     = (op     || o);
                fop    = (fop    || so);
                cop    = (cop    || co);
                filled = (filled || fd);
                closed = (closed || cd);
                color  = (color  || (!o && !so && !co && !fd && !cd && id));
            }

            op = (filled && fop) || (closed && cop) || op;
            if (op) {
                var args = data.slice(1);
                ctx.fillStyle   = (color || defColor);
                ctx.strokeStyle = (color || defColor);
                ctx.beginPath();
                op.apply(null, args);
            }
        }

        requestAnimationFrame(function renderBuffer() {
            outerCtx.clearRect(0, 0, canvas.width, canvas.height);
            outerCtx.drawImage(buffer, 0, 0);
        });
    }

    function isArray(a) {
        var s = Object.prototype.toString.call(a);
        return (s === '[object Array]' || s === '[object Arguments]');
    }

    renderFrame();

    return {
        getCanvas: function getCanvas() {
            return canvas;
        },
        render: function render(c) {
            if (arguments.length > 0) {
                if (!isArray(c)) { var c2 = []; c2.push.apply(c2, arguments); c = c2; }
                content = isArray(c[0]) ? c : [c];
            }
            renderFrame();
        },
        resize: function resize(w, h) {
            buffer.width = canvas.width  = w;
            buffer.height = canvas.height = h;
            renderFrame();
        },
    };
}
