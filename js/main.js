//TODO - gravity / jetpack / look up down / jump crouch
//TODO - camera sway when walking
//TODO - level editing/loading/saving
//TODO - mouse look
//TODO - switch to full-perspective once implemented

console.log('v0.0.1');

//initialize the main canvas variables
var canvas = document.getElementById("viewPort");
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
var context = canvas.getContext('2d');

//define the projection type
var projectionType = 'weak-perspective';
//var projectionType = 'better-perspective';  //should be better, but isn't
//var projectionType = 'orthographic';      //functional, but not real helpful
//var projectionType = 'full-perspective';   //not functional yet

//specify whether or not to display the crosshair
var crosshair = {
    on : 1,                             // 1=on, 0=off
    size : 16,                          // size of crosshair
    color : 'rgba(255,255,255,0.2)'     // color of crosshair
}

//define the maximum drawing distance - EXPERIMENTAL - currently can cause crashes when almost all faces are clipped
var drawLimit = 0;  //0 disables this feature, positive integers set the drawing distance

//set the offset between the viewport window and the 3d world origin
var dx = canvas.width / 2;
var dy = canvas.height / 2;

//initialize the animation function (browser specific)
var lastCalledTime=performance.now();
var requestAnimationFrame = window.requestAnimationFrame || 
                            window.mozRequestAnimationFrame || 
                            window.webkitRequestAnimationFrame || 
                            window.msRequestAnimationFrame;

//define reusable variables
var ctr; //used to store the center of an object
var wdth; //used to store the width of the an object (x-axis)
var hgth; //used to store the height of an object (y-axis)
var dpth; //used to store the depth of an object (z-axis)

//initialize the world object
var config = {
    gravity : 40,   //level of gravity in the world
    friction : 0.2   //level of friction in the world (air friction, etc.);
};
var world = new World(config);


//define the main animiation loop
function drawAndUpdate(zmap,currentT) {

    //clear the previous frame
    context.clearRect(0,0,canvas.width,canvas.height);

    //update the player
    player.update();

    //update all interactive elements (triggers)
    for(t=0; t<world.triggers.length; t++) {
        world.triggers[t].update(world);
    }

    //move the viewPort to the player location
    viewPort.location = player.location;
    viewPort.pitch = player.angle.pitch;
    viewPort.roll = player.angle.roll;
    viewPort.yaw = player.angle.yaw;

    //check if we are falling - if so, refresh the page to start again
    if (viewPort.location.y < -25000) {
        viewPort.location.y = 0;
        location.href = location.href;
    }

    //render the world
    render(viewPort, world.faces, context, zmap, dx, dy);
    if(crosshair.on == 1) {
        draw_crosshair(context,crosshair.size,crosshair.color);    
    }
    

    // restart the loop
    //setTimeout(drawAndUpdate,100);
    requestAnimationFrame(function() {
            
        // //this code writes the frame rate to the console    
        // if(!lastCalledTime) {
        //     lastCalledTime = performance.now();
        //     fps = 0;
        //     return;
        // }
        // delta = (performance.now() - lastCalledTime)/1000;
        // lastCalledTime = performance.now();
        // fps = 1/delta;
        // console.clear();
        // console.log("FPS: "+fps);
        
        drawAndUpdate();
    
    });

} // end of main animation loop

//add event listeners
   
   //keyboard listener - detects keypress and passes it to the player model
   window.onkeydown = window.onkeyup = function (e) {
            
        e = e || event; // to deal with IE
        player.control(e);

   }; // end key press listener

//setup our viewPort
var config = {

    location: new Vertex(0,-70,0),
    width: canvas.width,
    height: canvas.height,
    pitch: 0,
    yaw: 0, //Math.PI/2,
    roll: 0,
    gravity: 1,
    max_distance : drawLimit

};

//create our viewPort
var viewPort = new viewPort (config);


//initialize the player object
var config = {
    health : 100,
    jetpack : 0,
    height : 600,
    width : 400,
    depth : 400,
    location : viewPort.location,
    mass : 1,
    force : {
        x : 0,
        y : 0,
        z : 0,
    },
    inputForce : {
        x : 0,
        y : 0,
        z : 0
    },
    velocity : {
        x : 0,
        y : 0,
        z : 0
    },
    acceleration : {
        x : 0,
        y : 0,
        z : 0
    },
    angles : {
        pitch : 0,
        yaw : 0,
        roll : 0,
        velocities : {
            pitch : 0,
            yaw : 0,
            roll : 0
        },
        accelerations : {
            pitch : 0,
            yaw : 0,
            roll : 0
        }
    },
    strength : {
        x : 10,
        y : 70,
        z : 10
    }
};

var player = new Player_Model(config);



// //EXAMPLE: draw a predefined map
// var level = {

//         // map must be rectangular
//         // (0,0) coordinate is top left corner of this array

//         map : [

//                 [80,80,13,30,30,10,80,80,80,80],
//                 [80,80,33,50,50,50,90,10,80,80],
//                 [13,92,50,50,50,31,80,33,90,10],
//                 [ 3,80,33,50,50,50,90,11,80, 1],
//                 [ 3,80,12,50,32,11,80,80,80, 1],
//                 [ 3,80,80,91,80,80,80,80,80, 1],
//                 [12, 2, 2,11,80,80,80,80,80,11],
//                 [80,80,80,80,80,80,80,80,80,80],
//                 [80,80,80,80,80,80,80,80,80,80],
//                 [80,80,80,80,80,80,80,80,80,80]

//         ],
//         config : {
//             stroke : 'rgba(0,0,0,1)',
//             fill : {
//                 ceiling : ['rgba(100,100,100,1)'],
//                 floor : ['rgba(200,50,100,1'],
//                 wall : ['rgba(100,100,100,1)'],
//                 door : ['rgba(50,50,50,1']
//             },
//             player_start : {
//                 row : 3,
//                 column : 4,
//                 direction : 1
//             }
//         }
// };
// world.draw_level(level,world,viewPort);


// // EXAMPLE: draw a random level of specified size and with fixed parameters
// var config = {

//     size : 15,                               //the level will fit a square with sides of this length
//     hallways : 150,                          //this many hallways will be generated within the square (some may overlap each other)
//     length : 1,                              //this is the maximum length of each hallway
//     stroke : 'rgba(0,0,0,1)',                //color for the stroke of each polygon
//     fill : {                                 
//         ceiling : ['rgba(100,100,100,1)'],   //color to fill the ceiling
//         floor : ['rgba(50,50,50,1'],         //color to fill the floor 
//         wall : ['rgba(100,100,100,1)'],      //color to fill the walls
//         door : ['rgba(50,50,50,1']           //color to fill any doors (doors not implemented yet)
//     },
// };
// world.random_level(config,world,viewPort);

// EXAMPLE: draw a random level of specified size and with randomized parameters
var sze = 15;
var lgth = 1+Math.random()*sze/2;
var hlwys = 150/(2*lgth) + Math.random()*150/(2*lgth);     //divide by hallway length to prevent too many sections slowing everything down
var min = 20;
var max = 50;

var config = {

    size : sze,                               //the level will fit a square with sides of this length
    hallways : hlwys,                          //this many hallways will be generated within the square (some may overlap each other)
    length : lgth,                              //this is the maximum length of each hallway
    min_squares : min,                        //minimum number of square segments in the level
    max_squares : max,                        //maximum number of square segments in the level
    stroke : 'rgba(0,0,0,1)',                //color for the stroke of each polygon
    fill : {                                 
        ceiling : ['rgba(100,100,100,1)'],   //color to fill the ceiling
        floor : ['rgba(50,50,50,1'],         //color to fill the floor 
        wall : ['rgba(100,100,100,1)'],      //color to fill the walls
        door : ['rgba(50,50,50,1']           //color to fill any doors (doors not implemented yet)
    },
};
world.random_level(config,world,viewPort);



//start the animation loop
var zmap = [];
drawAndUpdate(zmap);
