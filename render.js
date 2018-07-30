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

    if (config.width ) { buffer.width  = canvas.width  = config.width;  }
    if (config.height) { buffer.height = canvas.height = config.height; }

    var ops = {
        line: function line(args) { }
    };

    function renderFrame() {
        requestAnimationFrame(renderFrame);
        ctx.clearRect(0, 0, buffer.width, buffer.height);

        for(var i = 0; i < contents.length; i++) {
            var args = contents[i] || {};
            var name = args.op || 'noop';
            var op = ops[name] || ops.noop;
            if (op) {
                ctx.fillStyle = (op.color || op.fill || color)
                ctx.strokeStyle = (op.color || op.stroke || color);
                op.apply(null, args);
            }
        }

        outerCtx.clearRect(0, 0, canvas.width, canvas.height);
        outerCtx.drawImage(buffer, 0, 0);
    }

    requestAnimationFrame(renderFrame);

    return {
        render: function render(c) { content = c; },
        resize: function resize(w, h) { buffer.width = canvas.width  = w; buffer.height = canvas.height = h; },
        getCanvas: function getCanvas() { return canvas; }
    };
}