/* Physics 2D for mobile
 * Daniel Altschuler
 * October 2014   
 */

var ctx, //context for drawing in canvas
    deviceWidth, //device avaialable max width
    deviceHeight; //device available max height

function onOrientationchange()
{
    var isPortrait = window.orientation % 180 === 0;
};

function setup()
{
    ctx = document.getElementById('mycanvas').getContext('2d');
    deviceWidth = window.screen.availWidth;
    deviceHeight = window.screen.availHeight;
    window.screen.lockOrientation('portrait');
}

