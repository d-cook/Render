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
        line: function line(args) {
            ctx.moveTo(xof(args.x1+0.5), yof(args.y1+0.5));
            ctx.lineTo(xof(args.x2+0.5), yof(args.y2+0.5));
            ctx.stroke();
        },
        rect: function rect(args) {
            if (args.fill || !args.stroke) { ctx.fillRect  (xof(args.x,     args.w  ), yof(args.y,     args.h  ), args.w,   args.h  ); }
            if (/***********/ args.stroke) { ctx.strokeRect(xof(args.x+0.5, args.w-1), yof(args.y+0.5, args.h-1), args.w-1, args.h-1); }
        },
        clearRect: function rect(args) {
            if (/******************/ true) { ctx.clearRect (xof(args.x,     args.w  ), yof(args.y,     args.h  ), args.w  , args.h  ); }
            if (/***********/ args.stroke) { ctx.strokeRect(xof(args.x+0.5, args.w-1), yof(args.y+0.5, args.h-1), args.w-1, args.h-1); }
        },
    };

    function xof(x, w) { return originX + dx * (dx > 0 ? x : x + (w||0)); }
    function yof(y, h) { return originY + dy * (dy > 0 ? y : y + (h||0)); }

    function setOrigin() {
        originX = (baseX === 'left') ? 0 : (baseX === 'right' ) ? canvas.width  : Math.floor(canvas.width  / 2);
        originY = (baseY === 'top' ) ? 0 : (baseY === 'bottom') ? canvas.height : Math.floor(canvas.height / 2);
    }

    function renderFrame() {
        setOrigin();
        buffer.width--; buffer.width++;
        canvas.width--; canvas.width++;
        ctx.clearRect(0, 0, buffer.width, buffer.height);

        for(var i = 0; i < content.length; i++) {
            var args = content[i] || {};
            var op = ops[args.op || 'noop'];
            if (op) {
                ctx.fillStyle   = (args.color || args.fill   || color);
                ctx.strokeStyle = (args.color || args.stroke || color);
                op(args);
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
        getCanvas: function getCanvas( ) { return canvas; },
        render   : function render(c   ) { content = c || content; renderFrame(); },
        resize   : function resize(w, h) {
            buffer.width = canvas.width  = w;
            buffer.height = canvas.height = h;
            renderFrame();
        },
    };
}