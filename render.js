function renderer(config, width, height) {
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
        line:       function line     (/*..xi,yi..*/) { path(arguments, 0, 0); },
        poly:       function poly     (/*..xi,yi..*/) { path(arguments, 1, 0); },
        solidpoly:  function solidpoly(/*..xi,yi..*/) { path(arguments, 1, 1); },
        rect:       function rect     (x, y, w, h) { ctx.strokeRect(xof(x+0.5, w-1), yof(y+0.5, h-1), w-1, h-1); },
        solidrect:  function solidrect(x, y, w, h) { ctx.fillRect  (xof(x,     w  ), yof(y,     h  ), w,   h  ); },
        clear:      function clearrect(x, y, w, h) { ctx.clearRect (xof(x,     w  ), yof(y,     h  ), w  , h  ); },
        curve:      function curve(x1, y1, x2, y2, cx1, cy1, cx2, cy2) {
                        ctx.moveTo(x1, y1);
                        if (arguments.length > 6) { ctx.bezierCurveTo(xof(cx1+0.5), yof(cy1+0.5), xof(cx2+0.5), yof(cy2+0.5), xof(x2+0.5), yof(y2+0.5)); }
                        else /***************/ { ctx.quadraticCurveTo(xof(cx1+0.5), yof(cy1+0.5), /*************************/ xof(x2+0.5), yof(y2+0.5)); }
                        ctx.stroke();
                    },
        solidcurve: function curve(x1, y1, x2, y2, cx1, cy1, cx2, cy2) {
                        ctx.moveTo(x1, y1);
                        if (arguments.length > 6) { ctx.bezierCurveTo(xof(cx1), yof(cy1), xof(cx2), yof(cy2), xof(x2), yof(y2)); }
                        else /***************/ { ctx.quadraticCurveTo(xof(cx1), yof(cy1), /*****************/ xof(x2), yof(y2)); }
                        ctx.fill();
                    }
    };

    function xof(x, w) { return originX + dx * (dx > 0 ? x : x + (w||0)); }
    function yof(y, h) { return originY + dy * (dy > 0 ? y : y + (h||0)); }

    function path(args, close, fill) {
        var d = (fill ? 0 : 0.5);
        ctx.moveTo(xof(args[0]+d), yof(args[1]+d));
        for(var i = 2; i < args.length - 1; i += 2) {
            ctx.lineTo(xof(args[i]+d), yof(args[i+1]+d));
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
            var op = null, sop = null, solid = false, color = null;

            for (var i = 0; i < ids.length; i++) {
                var id = ids[i];
                var o  = ops[id];
                var so = ops['solid'+id];
                var sd = (id === 'solid');
                op     = (op    || o);
                sop    = (sop   || so);
                solid  = (solid || sd);
                color  = (color || (!o && !so && !sd && id));
            }

            op = (solid && sop) || op || sop;
            if (op) {
                var args = data.slice(1);
                ctx.fillStyle   = (color || defColor);
                ctx.strokeStyle = (color || defColor);
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