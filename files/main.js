/* Physics 2D for mobile
 * Daniel Altschuler
 * October 2014   
 */
var canvas;
var ctx; //context for drawing in canvas
var android;
var no_interactions = false; //interactions between objects
var dt = 0.02;
var degtorad = Math.PI/180;
//this is the inverse of the fps rate, expressed in milliseconds
var ifps = dt*1000;
var radius = 50;
var v = 600; //maximum initial speed
var f = 60; //friction
var a = 50; //gravity
var agx, agy; //projection of gravity to screen
var orient = 0;
var maxmass = 3.5;
var minmass = 2.5;
var bodylist = [];
var movebody = -1;    

function setup()
{
    canvas = document.getElementById('mycanvas');
    ctx = canvas.getContext('2d');
    
    window.addEventListener('touchstart', handleTouchStartEvent, false);
    window.addEventListener('touchmove', handleTouchMoveEvent, false);
    window.addEventListener('touchend', handleTouchEndEvent, false);
    window.addEventListener('touchleave', handleTouchEndEvent, false);
    window.addEventListener('touchcancel', handleTouchEndEvent, false);
    window.addEventListener('devicemotion', handleDeviceMotionEvent, false);
    window.addEventListener('orientationchange', handleOrientationChange, false);
    window.setInterval(draw, ifps);
    
    //device dependent variables
    radius *= Math.min(window.screen.availWidth, window.screen.availHeight) < 500 ? 0.5 : 1.0;
    android = window.navigator.userAgent.indexOf('Android') === -1 ? 1 : -1;
    if (window.navigator.userAgent.indexOf('Firefox')>=0) {
        document.getElementById('message').innerHTML =
                'this site does not work properly with firefox';
    }
    if (window.navigator.userAgent.indexOf('Mobile')<0) {
        document.getElementById('message').innerHTML =
                'this site is designed for mobile devices';
    }
    //make sure orientation has a value before we draw
    window.resizeBy(1, 1);
    orient = window.orientation || 0;
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
    var mass = (maxmass - minmass)*Math.random() + minmass;
    bodylist.push(new CreateBody(mass, color, position, speed));
}

function handleTouchStartEvent(e)
{
    e.preventDefault();
    switch (e.touches.length)
    {
    case 1:
        var touchX = e.touches[0].pageX;
        var touchY = e.touches[0].pageY;
        for (var i=0; i<bodylist.length; i++)
            {
                var r = new Vector2D(touchX-bodylist[i].position.x, touchY-bodylist[i].position.y);
                if (Math.sqrt(dot(r,r))> radius) continue;
                movebody = i;
                bodylist[movebody].speed.x = 0;
                bodylist[movebody].speed.y = 0;
                break;
            }
        if (movebody<0) addBody(touchX, touchY);
        break;
    case 2:
        bodylist = [];
        break;
    case 3:
        window.location = 'help.html';
    default:
        break;
    } 
}

function handleTouchMoveEvent(e)
{
    bodylist[movebody].position.x = e.touches[0].pageX;
    bodylist[movebody].position.y = e.touches[0].pageY;
}

function handleTouchEndEvent(e)
{
    movebody = -1;
}

function handleOrientationChange()
{
    orient = window.orientation;
}

function handleDeviceMotionEvent(e)
{
    var acc = e.acceleration;
    var accGravity = e.accelerationIncludingGravity;
    agx = acc.x - accGravity.x;
    agy = acc.y - accGravity.y;
}

function sign(x)
{
    return x>0 ? 1 : -1;
}

function dot(v1, v2)
{
    return v1.x*v2.x + v1.y*v2.y;
}

//reflection in plane perp to vecparam
function reflect(vec, vecparam)
{
    var norm = dot(vecparam, vecparam);
    var prod = dot(vec, vecparam);
    return new Vector2D(vec.x-2*prod*vecparam.x/norm, vec.y-2*prod*vecparam.y/norm);
}

function draw()
{
    /* this function is called fps times per second with setInterval
     * 
     */
    var width = window.innerWidth;
    var height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    var bl = bodylist.length;
    
    ctx.fillStyle = 'black';
    ctx.font = '12pt Helvetica';
    ctx.fillText('tap with three fingers for help', 10, 30);
    
    //gravity (positive y coordinate due to definition
    //of canvas coordinates
    var cor = Math.cos(orient*degtorad);
    var sor = Math.sin(orient*degtorad);
    var flip = orient % 180 === 0 ? -1 : 1;
    var gx = a*android*flip*(cor*agx + sor*agy);
    var gy = a*android*flip*(sor*agx - cor*agy);
            
    for (var i=0; i<bl; i++)
        {
        var color = bodylist[i].color;
        var mass = bodylist[i].mass;
        var x = bodylist[i].position.x;
        var y = bodylist[i].position.y;
        var vx = bodylist[i].speed.x;
        var vy = bodylist[i].speed.y;
                
        for (var j=0; j<bl; j++)
            {//inner loop to compute interaction between objects
            if (no_interactions) break;
            if (i<=j) continue;
            var mass2 = bodylist[j].mass;
            var x2 = bodylist[j].position.x;
            var y2 = bodylist[j].position.y;
            var vx2 = bodylist[j].speed.x;
            var vy2 = bodylist[j].speed.y;
            
            //relative coordinates
            var r = new Vector2D(x - x2, y - y2);
            var d = Math.sqrt(dot(r, r));
            if (d > 2*radius) continue;

            var alpha = 2*radius/d;
            r.x *= alpha;
            r.y *= alpha;
            
            //center of mass
            var cmx = (mass*x + mass2*x2)/(mass + mass2);
            var cmy = (mass*y + mass2*y2)/(mass + mass2);
            var cmvx = (mass*vx + mass2*vx2)/(mass + mass2);
            var cmvy = (mass*vy + mass2*vy2)/(mass + mass2);
            
            //bounce
            x = cmx + mass2 * r.x /(mass + mass2);
            y = cmy + mass2 * r.y /(mass + mass2);
            x2 = cmx - mass * r.x /(mass + mass2);
            y2 = cmy - mass * r.y /(mass + mass2);
            //
            var veccm = new Vector2D(-cmvy, cmvx); //perp to cm
            var v = new Vector2D(vx, vy);
            var v2 = new Vector2D(vx2, vy2);
            v = reflect(v, veccm);
            v2 = reflect(v2, veccm);
            vx = v.x;
            vy = v.y;
            vx2 = v2.x;
            vy2 = v2.y;
            
            //save new state of particle j
            bodylist[j].position.x = x2;
            bodylist[j].position.y = y2;
            bodylist[j].speed.x = vx2;
            bodylist[j].speed.y = vy2;           
            }
        //
        //resume outer loop to compute interaction with walls
                              
        //accelerate
        vx = vx + (gx - sign(vx)*f)*dt/mass;
        vy = vy + (gy - sign(vy)*f)*dt/mass;
        
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
        
        //ctx.globalCompositeOperation = 'lighter';
        
        ctx.beginPath();
        ctx.arc(x1, y1, radius, 0, 2*Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
        
        ctx.strokeStyle = 'black';
        ctx.font = '11pt Helvetica';
        ctx.strokeText(mass.toFixed(2), x1-14, y1+5);
        }
}


