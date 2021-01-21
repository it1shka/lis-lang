const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function set_color(color){
    ctx.fillStyle = color;
}

function set_pixel(x, y){
    ctx.fillRect(x, y, 1, 1);
}

function rect(x, y, w, h){
    ctx.fillRect(x, y, w, h);
}

function line(x1, y1, x2, y2){
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}