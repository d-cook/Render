function renderer(config) {
    config = config || {};

    var buffer   = /***************/ document.createElement('canvas');
    var canvas   = config.canvas  || document.createElement('canvas');
    var baseY    = config.baseY   || 'middle' || 'top'  || 'bottom';
    var baseX    = config.baseX   || 'middle' || 'left' || 'right';
    var color    = config.color   || 'black';
    var content  = config.content || [];
    var ctx      = buffer.getContext('2d');
    var outerCtx = canvas.getContext('2d');
    var dx       = (baseX === 'right' ? -1 : +1);
    var dy       = (baseY === 'top'   ? +1 : -1);
    var originX  = 0;
    var originY  = 0;

    if (config.width ) { buffer.width  = canvas.width  = config.width;  }
    if (config.height) { buffer.height = canvas.height = config.height; }

    var ops = {
        line: function line(args) { }
    };

    function xof(x, w) { return originX + dx * (dx > 0 ? x : x + (w||0)); }
    function yof(y, h) { return originY + dy * (dy > 0 ? y : y + (h||0)); }

    function setOrigin() {
        originX = (baseX === 'left') ? 0 : (baseX === 'right' ) ? canvas.width  : Math.floor(canvas.width  / 2);
        originY = (baseY === 'top' ) ? 0 : (baseY === 'bottom') ? canvas.height : Math.floor(canvas.height / 2);
    }

    function renderFrame() {
        setOrigin();
        ctx.clearRect(0, 0, buffer.width, buffer.height);

        for(var i = 0; i < contents.length; i++) {
            var args = contents[i] || {};
            var op = ops[args.op || 'noop'];
            if (op) {
                ctx.fillStyle   = (args.color || args.fill   || color);
                ctx.strokeStyle = (args.color || args.stroke || color);
                op.apply(null, args);
            }
        }

        outerCtx.clearRect(0, 0, canvas.width, canvas.height);
        outerCtx.drawImage(buffer, 0, 0);
        requestAnimationFrame(renderFrame);
    }

    requestAnimationFrame(renderFrame);

    return {
        render: function render(c) { content = c; },
        resize: function resize(w, h) { buffer.width = canvas.width  = w; buffer.height = canvas.height = h; },
        getCanvas: function getCanvas() { return canvas; }
    };
}