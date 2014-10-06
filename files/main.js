/* Physics 2D for mobile
 * Daniel Altschuler
 * October 2014   
 */
var canvas;
var ctx; //context for drawing in canvas
var dt = 0.01;
//this is the inverse of the fps rate, expressed in milliseconds
var ifps = dt*1000;
var radius = 50;
var v = 600; //maximum initial speed
var f = 70; //friction
var a = 400; //gravity
var maxmass = 5;
var minmass = 2;
var bodylist = [];
    

function setup()
{
    canvas = document.getElementById('mycanvas');
    ctx = canvas.getContext('2d');
    
    window.addEventListener('touchstart', handleTouchEvent, false);
    window.setInterval(draw, ifps);
}

function Vector2D(x,y)
{
    this.x = x;
    this.y = y;
}

function CreateBody(mass, color, position, speed)
{
    /* color: valid string for passing to ctx.fillstyle
     * position, speed: Vector2D objects
     * 
     */
    this.mass = mass;
    this.color = color;
    this.position = position;
    this.speed = speed;
}

function addBody(x,y)
{
    var position = new Vector2D(x, y);
    var speed = new Vector2D(v*Math.random(), v*Math.random());
    var r = Math.floor(256*Math.random());
    var g = Math.floor(256*Math.random());
    var b = Math.floor(256*Math.random());
    var color = 'rgb(' + r + ',' + g + ',' + b + ')';
    var mass = (maxmass - minmass)*(minmass + Math.random());
    bodylist.push(new CreateBody(mass, color, position, speed));
}

function handleTouchEvent(e)
{
    e.preventDefault();
    var touch_location = e.touches[0];
    addBody(touch_location.pageX, touch_location.pageY);
}

function sign(x)
{
    return x>0 ? 1 : -1;
}

function draw()
{
    /* this function is called fps times per second with setInterval
     * 
     */
    var width = screen.availWidth;
    var height = screen.availHeight;
    canvas.width = width;
    canvas.height = height;
    var bl = bodylist.length;
    
    for (var i=0; i<bl; i++)
        {
        var color = bodylist[i].color;
        var mass = bodylist[i].mass;
        var x = bodylist[i].position.x;
        var y = bodylist[i].position.y;
        var vx = bodylist[i].speed.x;
        var vy = bodylist[i].speed.y;
        
        //gravity (positive y coordinate due to definition
        //of canvas coordinates
        var ax = 0;
        var ay = a;
        
        //accelerate
        vx = vx + (ax - sign(vx)*f)*dt/mass;
        vy = vy + (ay - sign(vy)*f)*dt/mass;
        
        //distance covered
        var x1 = x + vx*dt;
        var y1 = y + vy*dt;
        
        //collision with vertical edges
        if (x1 < radius)
            {
            vx = -vx;
            x1 = radius;
            }
        if (x1 > width - radius)
            {
            vx = -vx;
            x1 = width - radius;
            }
        
        //collision with horizontal edges
        if (y1 < radius)
            {
            vy = -vy;
            y1 = radius;
            }
        if (y1 > height - radius)
            {
            vy = -vy;
            y1 = height - radius;
            }
        
        bodylist[i].position.x = x1;
        bodylist[i].position.y = y1;
        bodylist[i].speed.x = vx;
        bodylist[i].speed.y = vy;
        
        ctx.beginPath();
        ctx.arc(x1, y1, radius, 0, 2*Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
        }
}


