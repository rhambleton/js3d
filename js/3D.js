//TODO - implement code for terrain
//TODO - full perspective projection

//define what a vertex is
var Vertex = function (x, y, z) {

    //
    //        |   
    //        |  /
    //        | / Z
    //      Y |/
    //        +-----
    //          X
    //

    this.x = parseFloat(x);
    this.y = parseFloat(y);
    this.z = parseFloat(z);

};

//define what a 2d vertex is
var Vertex2D = function(x, y) {

    //
    //     |
    //   Y |
    //     |
    //     +--------
    //         X


    this.x = parseFloat(x);
    this.y = parseFloat(y);

}; // end of vertex2D

//define what a face is
var Face = function(config) {

    // config.ctr = Vertex(x,y,z)       // coordinates of the center of the face
    // config.depth;                    // depth along the z-axis
    // config.width;                    // width along the x-axis
    // config.height;                   // height along the y-axis
    // config.id;                       // ID/name of this face
    // config.fill;                     // color to use to fill the face
    // config.stroke;                   // color to use for outline of the face

    //populate properties
    this.ctr = config.ctr;
    this.depth = config.depth;
    this.width = config.width;
    this.height = config.height;
    this.config = {};
    this.config.id = config.id;
    this.config.fill = config.fill;
    this.config.stroke = config.stroke;

    //define empty vertices array
    this.vertices = [];

    if(config.width == 0) {
        this.vertices[this.vertices.length] = new Vertex(this.ctr.x, this.ctr.y-this.height/2,this.ctr.z-this.depth/2);
        this.vertices[this.vertices.length] = new Vertex(this.ctr.x, this.ctr.y+this.height/2,this.ctr.z-this.depth/2);
        this.vertices[this.vertices.length] = new Vertex(this.ctr.x, this.ctr.y+this.height/2,this.ctr.z+this.depth/2);
        this.vertices[this.vertices.length] = new Vertex(this.ctr.x, this.ctr.y-this.height/2,this.ctr.z+this.depth/2);
    } else if(config.depth == 0) {
        this.vertices[this.vertices.length] = new Vertex(this.ctr.x-this.width/2, this.ctr.y-this.height/2,this.ctr.z);
        this.vertices[this.vertices.length] = new Vertex(this.ctr.x-this.width/2, this.ctr.y+this.height/2,this.ctr.z);
        this.vertices[this.vertices.length] = new Vertex(this.ctr.x+this.width/2, this.ctr.y+this.height/2,this.ctr.z);        
        this.vertices[this.vertices.length] = new Vertex(this.ctr.x+this.width/2, this.ctr.y-this.height/2,this.ctr.z);
    } else if(config.height == 0) {
        this.vertices[this.vertices.length] = new Vertex(this.ctr.x-this.width/2, this.ctr.y,this.ctr.z-this.depth/2);
        this.vertices[this.vertices.length] = new Vertex(this.ctr.x+this.width/2, this.ctr.y,this.ctr.z-this.depth/2);
        this.vertices[this.vertices.length] = new Vertex(this.ctr.x+this.width/2, this.ctr.y,this.ctr.z+this.depth/2);
        this.vertices[this.vertices.length] = new Vertex(this.ctr.x-this.width/2, this.ctr.y,this.ctr.z+this.depth/2);                
    } else {
        console.log("Unable to Create Face - all 3 dimensions are none zero");
    }

} //end of Face

//define what a collision box is
var collision_box = function(config) {

    // config.ctr = Vertex(x,y,z)       // coordinates of the center of the face
    // config.depth;                    // depth along the z-axis
    // config.width;                    // width along the x-axis
    // config.height;                   // height along the y-axis
    // config.state = 0 | 1 | 2;        // 0 = inactive, 1=active, 2=transparent
    // config.triggerID = XX;           // the ID of the trigger to activate
    // config.triggerCode = 0;          // this ode will bbe passed to the 'activate' method of the trigger - used to select from multiple actions

    this.max_x = config.ctr.x + (config.width/2);
    this.min_x = config.ctr.x - (config.width/2);

    this.max_y = config.ctr.y + (config.height/2);
    this.min_y = config.ctr.y - (config.height/2);

    this.max_z = config.ctr.z + (config.depth/2);
    this.min_z = config.ctr.z - (config.depth/2);

    this.state = config.state;

    this.triggerID = config.triggerID;
    this.triggerCode = config.triggerCode;

}; //end collision box definition

// define what a viewPort is
var viewPort = function (input) {

    //a viewPort represents the view of the world (such as the player's screen)
    //it has a location in the 3d space - represented by a 3d vertex at the center of the screen
    //it has a width and a height - represented by scalar objects
    //it has three angles that specify it's orientation vs the world
    //  pitch is the angle of rotation around the X-Axis 
    //  yaw is the angle of rotation around the Y-axis        
    //  roll is the angle of rotation around the Z-Axis
    //moving the viewport's location will move the view within the 3d world
    //viewPorts are rectangular
    //
    //   0         3
    //   +---------+
    //   |         |
    //   |    +    |
    //   |         |
    //   +---------+
    //   1         2
    //

    this.location = input.location;
    this.width = input.width;
    this.height = input.height;
    this.pitch = input.pitch;
    this.yaw = input.yaw;
    this.roll = input.roll;
    this.mass = 1;
    this.max_distance = input.max_distance;

    //represent x,y,z components of force, speed and accleration with vertex objects
    this.speed = new Vertex(0,0,0);
    this.velocity = new Vertex(0,0,0);
    this.acceleration = new Vertex(0,0,0);
    this.force = new Vertex(0,0,0);

    //represent angular velcocity, acceleration and moments with 3 components of vertex objects
    this.turn = new Vertex(0,0,0);                      //to be removed later
    this.angular_velocity = new Vertex(0,0,0);
    this.angular_acceleration = new Vertex(0,0,0);
    this.moments = new Vertex(0,0,0);

    //calculate the locations of the vertices
    this.vertices = [

        new Vertex(this.location.x - this.width/2, this.location.y + this.height/2, this.location.z), // 0
        new Vertex(this.location.x - this.width/2, this.location.y - this.height/2, this.location.z), // 1
        new Vertex(this.location.x + this.width/2, this.location.y - this.height/2, this.location.z), // 2
        new Vertex(this.location.x + this.width/2, this.location.y + this.height/2, this.location.z)  // 3

    ]; //end of vertices

    //define the update function
    this.update = function () {

        //apply the forces to update the acceleration
        this.acceleration.x = this.force.x / this.mass;
        this.acceleration.y = this.force.y / this.mass;
        this.acceleration.z = this.force.z / this.mass;

        //apply the acceleration to update the velocity
        this.speed.x += this.acceleration.x;
        this.speed.y += this.acceleration.y;
        this.speed.z += this.acceleration.z;

        //apply the speed to update the location
        this.location.x += this.speed.x;
        this.location.y += this.speed.y;
        this.location.z += this.speed.z;

    }


}; // end of view port definition


//function to project the 3D space onto our 2D viewing window
function project(M, type, viewPort) {

    switch(type) {

        case "orthographic" :
            return new Vertex2D(M.x, M.y)
        
        case "weak-perspective" :
            
            //generally reliable
            var d = 200; //focal length       
            var r = d / M.z;
            return new Vertex2D(r*M.x, r*M.y);

        case "better-perspective" :

            //better is relative - this doesn't really work at all
            var d = 650; //focal length
            var r = d / Math.sqrt((M.x*M.x)+(M.z*M.z))
            return new Vertex2D(r*M.x, r*M.y);

        case "full-perspective" :
            // incomplete and non-functional
            var focal_length = 200;

            //define a temporary point which we will then rotate
            var tempVtx = new Vertex(0, 0, 0);
            var x = M.x - viewPort.x;
            var y = M.y - viewPort.y;
            var z = M.z - viewPort.z;

            //TOD DO using wikipedia var cx = Math.cos(viewPort.)

            //tempVtx.x = (Math.cos(viewPort.pitch) * ((Math.sin(viewPort.yaw)*y) + (Math.cos(viewPort.pitch)*x))) - Math.sin(viewPort.pitch);
            
            var dx = (Math.cos(viewPort.yaw)*((Math.sin(viewPort.roll)*y)+(Math.cos(viewPort.roll)*x))) - (Math.sin(viewPort.yaw)*z);
            var dy = (Math.sin(viewPort.pitch)*((Math.cos(viewPort.yaw)*z)+(Math.sin(viewPort.yaw)*((Math.sin(viewPort.roll)*y)+Math.cos(viewPort.roll)*x)))) + (Math.cos(viewPort.pitch)*((Math.cos(viewPort.roll)*y)+(Math.sin(viewPort.roll)*x)));
            var dz = (Math.cos(viewPort.pitch)*((Math.cos(viewPort.yaw)*z)+(Math.sin(viewPort.yaw)*((Math.sin(viewPort.roll)*y)+Math.cos(viewPort.roll)*x)))) - (Math.sin(viewPort.pitch)*((Math.cos(viewPort.roll)*y)+(Math.sin(viewPort.roll)*x)));

            tempVtx.x = (focal_length/dz)*dx;
            tempVtx.y = (focal_length/dz)*dy;

            return new Vertex2D(tempVtx.x, tempVtx.y);

    } // end switch

}; // end of project()


function distance_sorter(faces, sorted, viewPort) {

    //faces = an unsorted array of face objects
    //sorted = a sorted array of face objects (can be empty)
    //viewport = a viewport object

    //inserts the items in 'faces' into 'sorted' according to painters algorithm
    
    //initialize counter for how many faces are inserted on this pass
    var inserted = 0;

    //loop over the provided array and move each face 1 by 1
    for(var i=0; i<faces.length; i++) {

        //remove any faces with a minimum distance > the view distance
        if(faces[i].max_z < 0) {

            //EXPERIMENTAL FEATURE - currently creates issues if almost all faces are outside max_distance
            if(faces.length > 5) {
                faces.splice(i,1);    
            }
            
        
        } else {
             //loop over the new_faces array and find the spot to insert the current face
             for(var j=0; j<sorted.length; j++) {

                //check if face[i] is definitely in front of sorted[j]
                if(quick_behind_check(faces[i],sorted[j],1, viewPort)) {

                    //check if face[i] is definitely behind sorted[j]
                    if(behind_check(faces[i],sorted[j],viewPort)) {

                        //check if the faces to overlap
                        if(overlap_check(faces[i],sorted[j],viewPort)) {

                            //the faces overlap, so faces[i] should be drawn first
                            sorted.splice(j,0,faces[i]);
                            j=sorted.length;
                            faces.splice(i,1);
                            i = i - 1;
                            inserted++; 

                        } //end quick_overlap_check();

                    } //end behind_check()

                } //end quick_behind_check()

             } //end loop over sorted array
        
        } //end check for maximum view distance.

    } //end loop over faces in unsorted array

    //if we didn't insert anything, force the last face in the unsorted array into the end of the sorted array
    if(inserted == 0) {
        sorted.splice(sorted.length,0,faces[faces.length-1]);
        faces.splice(faces.length-1,1);
    }

    //recursively repeat this process until all the unsorted faces have been placed
    if(faces.length > 0) {
        sorted = distance_sorter(faces, sorted, viewPort);
    }

    return sorted;

} //end of distance sorter


function quick_behind_check(face1, face2, tolerance, viewPort) {

    //checks farthest point of face1 against nearest point of face2
    //if the face1 is more than "tolerance" closer than face2
    //then face1 can be considered in front of face2 

    //loop over all vertices on face1 and find the distance to the farthest one
    var max_dist = 0;
    var min_dist = 100000000;
    for(var i=0; i<face1.vp_vertices.length; i++) {

        var tst_dist = ((face1.vp_vertices[i].x * face1.vp_vertices[i].x) + (face1.vp_vertices[i].y * face1.vp_vertices[i].y) + (face1.vp_vertices[i].z * face1.vp_vertices[i].z));
        if(tst_dist > max_dist) { 
            max_dist = tst_dist;
        }

        var tst_dist = ((face2.vp_vertices[i].x * face2.vp_vertices[i].x) + (face2.vp_vertices[i].y * face2.vp_vertices[i].y) + (face2.vp_vertices[i].z * face2.vp_vertices[i].z));
        if(tst_dist < min_dist) { 
            min_dist = tst_dist;
        }
    }

    if((max_dist + tolerance) < min_dist) {
        return false;
    }
    return true;
}

function behind_check(face1, face2, viewPort) {

    //accepts two 3d faces as arrays containing vertex coordinates
    //accepts one viewPort object
    //checks if the face1 is behind face2 when viewed from the viewPort

    //populate the plane object with the first 3 vertices of face2
    var plane = {
        "vertices" : [
            face2.vertices[0],
            face2.vertices[1],
            face2.vertices[2]
        ]
    };

    //populate the test point with one of the vertices from the face we trying to check
    var test = face1.vertices[0];

    //check orientation of plane and point
    var check = process_t_value(find_intersection(plane, test, viewPort.location, 1));

    //try and find a point that is NOT on the plane
    var p = 1;
    while(check==0 && p<face1.vertices.length) {
        test=face1.vertices[p];
        check = process_t_value(find_intersection(plane, test, viewPort.location, 1));
        p++;
    }

    //returns true if face1 is behind face2, otherwise returns false
    if(check == 1) {
        return true;
    }
    return false;

} //end of behind_check()

function process_t_value(t) {

        //PROCESS T VALUE RETURNED BY find_intersection()
        //
        //returns
        // -1 => test1 is in front of the plane (when viewed from test2)
        // -1 => the plane is behind test2 (when viewing test1)         
        //  0 => test1 is on the plane
        //  1 => the plane is between test2 and test1 (test1 is behind the plane if viewed from test2)


        if(t > 1) {
            //the plane is farther from test2 than test1 is.
            //the plane is behind test1 (if viewed from test2)
            return -1;
        } else if (t <= 0) {
            //test2 is between test1 and the plane (or test2 is on the plane)
            //the plane is behind test2 (if viewing test1 from test2)
            return -1;
        } else if (t == 1) {
            //test1 is on the plane
            return 0;
        } else {
            return 1;
        }

} //end process_t_value();

function find_intersection(plane, test1, test2, return_t) {

    //accepts 3 points on a plane and 2 test points
    //
    //  plane.vertices[0] = {
    //      "x" : <x-coordinate of point on the plane>
    //      "y" : <y-coordinate of point on the plane>
    //      "z" : <z-coordinate of point on the plane> 
    //  }; 
    //  plane.vertices[1] = second point on the plane
    //  plane.vertices[2] = third point on the plane
    //
    //  test1 = {
    //      "x" : <x-coordinate of test point>
    //      "y" : <y-coordinate of test point>
    //      "z" : <z-coordinate of test point>
    //  };
    //  test2 = second test point in same format

    //determines the intersection of the line between test and test 1 with the plane defined by the 3 provided points

    //Returns the following information
    //  if return_t == 1 the 't-value' will be returned - can be processed with 'process_t_value()'
    //  if return_t == 0 the coordinates of the intesection between the plane and the line from the test2 to test will be returned
    //  if no such intersection exists, the function will return false.
    
    //initialize object to hold the calculated intersection point
    var intersection = {
        "x" : 0,
        "y" : 0,
        "z" : 0
    };

    //equation for a plane:  ax + by + cz + d = 0
    //a,b,c and d can be fonud with the following equations
    var x1 = plane.vertices[0].x;
    var x2 = plane.vertices[1].x;
    var x3 = plane.vertices[2].x;

    var y1 = plane.vertices[0].y;
    var y2 = plane.vertices[1].y;
    var y3 = plane.vertices[2].y;

    var z1 = plane.vertices[0].z;
    var z2 = plane.vertices[1].z;
    var z3 = plane.vertices[2].z;

    var a = y1*(z2-z3) + y2*(z3-z1) + y3*(z1-z2);
    var b = z1*(x2-x3) + z2*(x3-x1) + z3*(x1-x2);
    var c = x1*(y2-y3) + x2*(y3-y1) + x3*(y1-y2);
    var d = (x1*(y2*z3 - y3*z2) + x2*(y3*z1 - y1*z3) + x3*(y1*z2 - y2*z1)) * -1;   

    //check if the first point is on the plane
    var check1 = a*(test1.x) + b*(test1.y) + c*(test1.z) + d;

    //check if the second point is on the plane
    var check2 = a*(test2.x) + b*(test2.y) + c*(test2.z) + d;


    //check if test1 is on the plane
    if(Math.abs(check1) <= 0.000001) {

        //test1 is on the plane
        if(return_t == 0) {
            return test1;
        } else {
            return 1;
        }

    } //end check if test1 is on the plane

    //check if test2 is on the plane
    else if(Math.abs(check2) <= 0.000001) {

        //test2 is on the plane
        if(return_t == 0) {
            return test1;
        } else {
            return 0;
        }

    } //end check if test2 is on the plane

    else {

        // neither test 1 or test 2 are on the plane - so we need to check the points on the line through them
        //
        // all points on the line between test1 to the test2 point will have the form
        //
        //  (x,y,z) = (test2.x + t*(test1.x-test2.x), test2.y + t*(test1.y-test2.y), test2.z+t*(test1.z-test2.z)
        //
        // we need to plug this into the equatin for the plane ->  a(x-x0)+b(y-y0)+c(z-z0)+d=0
        //
        //                      -1 * (a*x1 + b*y1 + c*z1 + d)
        // t =  --------------------------------------------------------------------
        //       a*(test1.x - test2.x) + b*(test1.y - test2.y) + c*(test1.z-test2.z)
        //
        // verify t exists (denominator is not 0)

        var denominator = a*(test1.x - test2.x) + b*(test1.y - test2.y) + c*(test1.z - test2.z);
        if(denominator == 0) {
            
            //the ray is parallel to the plane - so infinite or no intersection exists
            return false;

        } else {

            // t exists, so calculate it
            var t = -1 * (a*test2.x + b*test2.y + c*test2.z + d) / denominator;

            if(return_t == 0) {

                intersection.x = test2.x + t*(test1.x-test2.x);
                intersection.y = test2.y + t*(test1.y-test2.y);
                intersection.z = test2.z + t*(test1.z-test2.z);
                return intersection; 

            } else {

                return t;

            }
        }
    }

} //end of find_intersection()

function overlap_check(face1, face2, viewPort) {

    //accepts two 3D faces and 1 viewport object
    //returns true if the two faces overlap when viewed from viewPort, false if they do not

    //create temporary variables to allow easier manipulation
    var vtx1 = face1.vp_vertices;
    var vtx2 = face2.vp_vertices;

    //console.log(face1.config.id);
    //console.log(face2.config.id);


    //first we do a quick check of max/min x and y coordinates the rule out faces that obviously do NOT overlap
    //this is currently done without a loop (the loop seemed to slow things down a LOT)
    //note that we are also using the 'weak-perspective' method to convert from 3d to 2d coordinates - but we are doing it in place (again seems faster)
    //we use Math.max() to move any negative 'z' values to 1 - this is an inexpensive, innaccurate version of polygonzclip()

    //THIS SHOULD BE QUICKER - and gets away from hard coding vtx counts - but for some reason it creates a clipping problem
    // var x_limits_1 = min_max_x(vtx1);
    // var y_limits_1 = min_max_y(vtx1);

    // var x_limits_2 = min_max_x(vtx2);
    // var y_limits_2 = min_max_y(vtx2);

    // var max_x_1 = x_limits_1[1];
    // var min_x_1 = x_limits_1[0];
    // var max_y_1 = y_limits_1[1];
    // var min_y_1 = y_limits_1[0];
    // var max_x_2 = x_limits_2[1];
    // var min_x_2 = x_limits_2[0];
    // var max_y_2 = y_limits_2[1];
    // var min_y_2 = y_limits_2[0];

    if(vtx1.length >= 4) {
        var max_x_1 = Math.max(200*vtx1[0].x/Math.max(vtx1[0].z,1), 200*vtx1[1].x/Math.max(vtx1[1].z,1), 200*vtx1[2].x/Math.max(vtx1[2].z,1), 200*vtx1[3].x/Math.max(vtx1[3].z,1));
        var min_x_1 = Math.min(200*vtx1[0].x/Math.max(vtx1[0].z,1), 200*vtx1[1].x/Math.max(vtx1[1].z,1), 200*vtx1[2].x/Math.max(vtx1[2].z,1), 200*vtx1[3].x/Math.max(vtx1[3].z,1));
        var max_y_1 = Math.max(200*vtx1[0].y/Math.max(vtx1[0].z,1), 200*vtx1[1].y/Math.max(vtx1[1].z,1), 200*vtx1[2].y/Math.max(vtx1[2].z,1), 200*vtx1[3].y/Math.max(vtx1[3].z,1));
        var min_y_1 = Math.min(200*vtx1[0].y/Math.max(vtx1[0].z,1), 200*vtx1[1].y/Math.max(vtx1[1].z,1), 200*vtx1[2].y/Math.max(vtx1[2].z,1), 200*vtx1[3].y/Math.max(vtx1[3].z,1));        
    }

    if(vtx2.length >= 4) {
        var max_x_2 = Math.max(200*vtx2[0].x/Math.max(vtx2[0].z,1), 200*vtx2[1].x/Math.max(vtx2[1].z,1), 200*vtx2[2].x/Math.max(vtx2[2].z,1), 200*vtx2[3].x/Math.max(vtx2[3].z,1));
        var min_x_2 = Math.min(200*vtx2[0].x/Math.max(vtx2[0].z,1), 200*vtx2[1].x/Math.max(vtx2[1].z,1), 200*vtx2[2].x/Math.max(vtx2[2].z,1), 200*vtx2[3].x/Math.max(vtx2[3].z,1));
        var max_y_2 = Math.max(200*vtx2[0].y/Math.max(vtx2[0].z,1), 200*vtx2[1].y/Math.max(vtx2[1].z,1), 200*vtx2[2].y/Math.max(vtx2[2].z,1), 200*vtx2[3].y/Math.max(vtx2[3].z,1));
        var min_y_2 = Math.min(200*vtx2[0].y/Math.max(vtx2[0].z,1), 200*vtx2[1].y/Math.max(vtx2[1].z,1), 200*vtx2[2].y/Math.max(vtx2[2].z,1), 200*vtx2[3].y/Math.max(vtx2[3].z,1));
    }

    //check for clear cases in which the two faces do not overlap
    if(max_x_1 <= min_x_2 || min_x_1 >= max_x_2) {
        return false;
    }

    if(max_y_1 <= min_y_2 || min_y_1 >= max_y_2) {
        return false;
    }
    
    //since the quick check failed, run some more expensive checks.

    //project the faces into 2D so we can do these checks
    var face1_2D = { vertices : [] };
    var face2_2D = { vertices : [] };

    //clip the faces to avoid issues with negative z-values
    var vtx1 = polygonZClip(face1.vp_vertices);
    var vtx2 = polygonZClip(face2.vp_vertices);

    //loop over each vertex of face1
    for(var i=0; i<vtx1.length; i++) {

        //project this vertex into 2D
        var tmpVtx = project(vtx1[i], "weak-perspective", viewPort);

        //populate face1_2D with the updated vertex
        face1_2D.vertices[face1_2D.vertices.length] = tmpVtx;
    }

    //loop over each vertex of face2
    for(var i=0; i<vtx2.length; i++) {

        //project this vertex into 2D
        var tmpVtx = project(vtx2[i], projectionType, viewPort);

        //populate face2_2D with the updated vertex
        face2_2D.vertices[face2_2D.vertices.length] = tmpVtx;

    }

    //check if any of the edges of faces1 intersect the edges of face2 (ignore edge case)
    if(intersection_check(face1_2D, face2_2D)) {
        return true;
    }

    //check if face1_2D is fully enclosed within face2_2D
    if(full_enclosure_check(face1_2D, face2_2D)) {
        return true;
    }

    //check if face2_2D is fully enclosed within face1_2D
    if(full_enclosure_check(face2_2D, face1_2D)) {
        return true; 
    }

    //all tests failed, so the faces must not overlap.
    return false;

} //end overlap_check

function min_max_x(vtx) {

    //NOT CURRENTLY USED - creates a clipping issue

    //accepts an array of vertices (such as face1.vp_vertices)
    //returns a 2 element array [min, max]
    //min is the lowest x value found
    //max is the highest x value found

    var min_x = 200*vtx[0].x/Math.max(vtx[0].z,1);
    var max_x = min_x;

    for(var i=1, len=vtx.length; i<len; i++) {
        var v = 200*vtx[i].x/Math.max(vtx[0].z,1);
        min_x = (v < min_x) ? v : min_x;
        max_x = (v > max_x) ? v : max_x;
    }

    return [min_x, max_x];
}

function min_max_y(vtx) {

    //NOT CURRENTLY USED - creates a clipping issue

    //accepts an array of vertices (such as face1.vp_vertices)
    //does a dirty clip to eliminate negative z-values
    //does a dirty 2D project (weak-perspective)
    //returns a 2 element array [min, max]
    //min is the lowest y value found
    //max is the highest y value found

    var min_y = 200*vtx[0].y/Math.max(vtx[0].z,1);
    var max_y = min_y;

    for(var i=1, len=vtx.length; i<len; i++) {
        var v = 200*vtx[i].y/Math.max(vtx[0].z,1);
        min_y = (v < min_y) ? v : min_y;
        max_y = (v > max_y) ? v : max_y;
    }

    return [min_y, max_y];
}


function intersection_check(face1, face2) {

    //accepts two 2D faces and checks if any of the edge segments of face 1 intersect any of the edge segments of face 2

    //loop over each vertex of face1
    for(var i=0; i<face1.vertices.length; i++) {

        //check if this is the last vertex
        if(i==face1.vertices.length - 1) {
            //if so the next vertex is 0
            var ni = 0;
            
        } else {

            //if not the next vertex is i+1
            var ni = i+1;
        }

        //loop over each vertex of face 2
        for(var j=0; j<face2.vertices.length; j++) {

            //check if this is the last vertex
            if(j==face2.vertices.length -1) {

                //if so the next vertex is 0
                var nj = 0;

            } else {

                //if not the next verteix is m+1
                var nj = j+1;
            }

            //populate are endpoint variables for each line (p1 to q1) and (p2 to q2)
            var p1 = face1.vertices[i];
            var q1 = face1.vertices[ni];
            var p2 = face2.vertices[j];
            var q2 = face2.vertices[nj];

            //check if the line segments intersect
            if(segment_intersection_check(p1,q1,p2,q2)) {
            
                //if yes - return true;
                return true;

            }

        } //end loop over face2

    } //end loop over face1

    return false;
}

function full_enclosure_check(face1, face2) {

    //accepts two 2D faces
    //returns true if all vertices of face1 fall within the boundaries of face2

    if(face1.vertices.length > 0) {

        //for(v=0; v<face1.vertices.length; v++) {
            
            if(!point_inside_face(face1.vertices[0], face2)) {

                //if we found one that isn't, return false
                return false;

            }
        //}
    
    }

    return true;

} //end of full_enclosure_check

function point_inside_face(p, face) {

    //accepts one point [x, y] and one face in 2D space
    //returns true if point falls on face
    //returns false if point is not on face

    //check for empty face
    if(face.vertices.length <= 0) {
        return false;
    }

    //theory:
    // extend a line along the positive X-axis count how many edges it intersects.
    // if the number is even - the point is outside the face, otherwise it is inside
    // need to watch out if a vertex is on the line - but if we check the edges 1 by 1, then these will automatically count twice - unless we start on an edge

    //if the test point is on an edge, it should be considered outside of the polygon

    //variable to count intersections
    var isect_count = 0;

    //loop over each vertex of face2
    for(var i=0; i<face.vertices.length; i++) {

        if(i == face.vertices.length-1) {
            var ni = 0;
        } else {
            ni = i+1;
        }

        //case 1 - both points are to the right of our point
        if(face.vertices[i].x >= p.x && face.vertices[ni].x >= p.x) {

            //check if one y is above and the other is below
            if((face.vertices[i].y >= p.y && face.vertices[ni].y <= p.y) || (face.vertices[i].y <= p.y && face.vertices[ni].y >= p.y)) {
                isect_count++;
            }
        
        //case 2 - check if one point is on either side (horizontally)
        } else if((face.vertices[ni].x <= p.x && face.vertices[i].x >= p.x) || (face.vertices[ni.x >= p.x && face.vertices[i].x <= p.x])) {

            if((face.vertices[ni].y >= p.y && face.vertices[i].y <= p.y) || (face.vertices[ni].y <= p.y && face.vertices[i].y >= p.y)) {

                var test_x = face.vertices[i].x + (((face.vertices[i].y - p.y) / (face.vertices[i].y - face.vertices[ni].y)) * (face.vertices[i].x - face.vertices[ni].x))
                
                if(test_x >= p.x) {
                    isect_count++;
                } else if (test_x == p.x) {
                    //the test point is on segment, treat this point as being outside
                }

            }
        }
    }

    if(isect_count % 2 == 0) {
        return false;
    }
    return true;
}

function segment_intersection_check(p1, q1, p2, q2) {

    //accepts the end points of two line segments in 2D space
        //line 1 - p1 to q1
        //line 2 - p2 to q2
        //all inputs are vertexes in 2D space

    //returns true if the two line segments intersect
    //returns false if the two line segments do not intersect

    //based on: https://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/   
    //based on: http://www.dcs.gla.ac.uk/~pat/52233/slides/Geometry1x1.pdf

    //find the four orientations we need
    var o1 = find_orientation_2D(p1, q1, p2);
    var o2 = find_orientation_2D(p1, q1, q2);
    var o3 = find_orientation_2D(p2, q2, p1);
    var o4 = find_orientation_2D(p2, q2, q1);

    //COMMENTED CODE LEFT IN PLACE FOR LATER REFERENCE/USE

    //general case
    //if(o1 != o2 && o3 != o4 && o1 != 0 && o2 != 0 && o3 != 0 && o4 != 0) {
    if(o1 != o2 && o3 != o4) {
        return true;
    }

    // //first special case - colinear points - p2 is on p1,q1
    // if(o1 == 0 && point_on_segment(p1, p2, q1)) {
    //     return true;
    // }

    // //second special case - colinear points - q2 is on p1, q1
    // if(o2 == 0 && point_on_segment(p1, q2, q1)) {
    //     return true;
    // }

    // //third special case -  colinear points - p1 is on p2, q2
    // if(o3 == 0 && point_on_segment(p2, p1, q2)) {
    //     return true;
    // }

    // //fourth special case - colinear points - q1 is on p2, q2
    // if(o4 == 0 && point_on_segment(p2, q1, q2)) {
    //     return true;
    // }

    //none of the above cases are true - therefore the segments do NOT intersect
    return false;

} //end segment_intersection_check

function find_orientation_2D(p, q, r) {

    //given ordered triplet (p, q, r)
    //returns the following values:
        // 0 --> the three points are colinear
        // 1 --> clockwise
        // 2 --> counterclockwise

    var val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

    if(val == 0) {
        return 0;
    } else if (val > 0) {
        return 1;
    } else {
        return 2;
    }

}

function point_on_segment(p, q, r) {

    //not currently used - but can may be needed to properly handle overlapping parallel segments in find_orientation_2D

    //given 3 colinear points: p, q and r
    //returns true if q lies on the segment from p to r
    //otherwise returns false
    if(q.x <= Math.max(p.x,r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) {
        return true;
    }
    return false;

}

//function to render all the faces in the world
function render (viewPort, faces, ctx, zmap, dx, dy) {

    //extract all object faces into a single faces array
    var all_faces = [];

    //loop over each face, dumping it into the all_faces array
    for (var j=0; j < faces.length; j++) {

        //place holder variables for calculating the average z and average distances values
        var vtx_count = 0;
        var dist_sum = 0;
        var min_dist = viewPort.max_distance*2;
        var tmp_dist = 0;
        var max_z = -1;
        faces[j].vp_vertices = [];

        //loop over each vertex populating the above variables
        for (var k=0; k < faces[j].vertices.length; k++) {

            tmp = changeToViewPortBasis(faces[j].vertices[k], viewPort);
            faces[j].vp_vertices[k] = tmp;
            tmp_dist = Math.sqrt((tmp.x*tmp.x)+(tmp.z*tmp.z)+(tmp.y*tmp.y));
            dist_sum += tmp_dist;
            min_dist = tmp_dist < min_dist ? tmp_dist : min_dist;
            max_z = tmp.z > max_z ? tmp.z : max_z;
            vtx_count++;
        }
    
        //add this face to the end of the all_faces array
        all_faces[all_faces.length] = faces[j];

        //add the average and minimum distance values
        all_faces[all_faces.length-1].average_dist = dist_sum/vtx_count;
        all_faces[all_faces.length-1].min_dist = min_dist;
        all_faces[all_faces.length-1].max_z = max_z;
    }



    //display the unsorted array of faces (for troubleshooting distance_sorter())
    // console.log("before");
    // for(var f=0; f<all_faces.length;f++) {
    //     console.log(JSON.stringify(all_faces[f].config.id));
    // }
    // console.log("");

    //sort all the faces based on their average distance from the viewerport (painters algorithm)
    all_faces = distance_sorter(all_faces, [], viewPort);
    
    //display the sort results for troubleshooting
    // console.log("after");
    // for(var f=0; f<all_faces.length;f++) {
    //     console.log(JSON.stringify(all_faces[f].config.id));
    // }
    // console.log("");

    //for each face
    for (var j=0; j < all_faces.length; j++) {

        //set the colors for drawing the face
        ctx.strokeStyle = all_faces[j].config.stroke;
        ctx.fillStyle = all_faces[j].config.fill;

        var x_values = [];
        var y_values = [];
        var z_values = [];

        //clip the temporary face to remove anything behind the camera
        tmpFace = polygonZClip(all_faces[j].vp_vertices);

        //make sure there is still something left to render
        if(tmpFace.length != 0) {

            //draw the face on the workSpace canvas
    
                //draw the first vertex
                var P = project(tmpFace[0], projectionType, viewPort);
                
                //create the path for this face and move to starting point
                var pth = new Path2D();
                pth.moveTo(P.x + dx, -P.y +dy);

                //draw the other vertices
                for (var k = 1; k < tmpFace.length; k++) {
                    P = project(tmpFace[k], projectionType, viewPort);
                    pth.lineTo(P.x + dx, -P.y + dy);

                } // end loop over the other vertices

                //close the path and draw the face
                ctx.stroke(pth);
                ctx.fill(pth);

        } // end check that there was still something to render

    } // end loop over faces

}; // end render()

function draw_crosshair(ctx, size, color) {
    var pth = new Path2D();
    ctx.strokeStyle = color;
    pth.moveTo((canvas.width-size)/2,canvas.height/2);
    pth.lineTo((canvas.width+size)/2, canvas.height/2);
    ctx.stroke(pth);

    pth.moveTo(canvas.width/2,(canvas.height-size)/2);
    pth.lineTo(canvas.width/2,(canvas.height+size)/2);
    ctx.stroke(pth);
}

// Rotate a vertex
function rotate(M, center, pitch, yaw, roll) {

    // Rotation matrix coefficients
    var ct = Math.cos(pitch);
    var st = Math.sin(pitch);
    var cp = Math.cos(yaw);
    var sp = Math.sin(yaw);
    var ca = Math.cos(roll);
    var sa = Math.sin(roll);

    // shift center of object to the the orign to apply rotation
    var x = M.x - center.x;
    var y = M.y - center.y;
    var z = M.z - center.z;

    //Rotate around the x-axis
    var x1 = 1 * x + 0 * y + 0 * z;
    var y1 = 0 * x + ct * y - st * z;
    var z1 = 0 * x + st * y + ct * z;

    //Rotate around the y-axis
    var x2 = cp * x1 + 0 * y1 + sp * z1;
    var y2 = 0 * x1 + 1 * y1 + 0 * z1;
    var z2 = -sp * x1 + 0 * y1 + cp * z1;

    //Rotate around the z-axis
    var x3 = ca * x2 - sa * y2 + 0 * z2;
    var y3 = sa * x2 + ca * y2 + 0 * z2;
    var z3 = 0 * x2 + 0 * y2 + 1 * z2;

    // shift center of object back to the proper spot
    M.x = x3 + center.x;
    M.y = y3 + center.y;
    M.z = z3 + center.z;

}; // end rotate

//remove all areas of a polygon with a Z coordinate less than z
function polygonZClip (vertices) {

    var newVertices = [];
    var x1 = 0;
    var x2 = 0;
    var xd = 0;
    var y1 = 0;
    var y2 = 0;
    var yd = 0;
    var z1 = 0;
    var z2 = 0;
    var zd = 0;
    var t = 0;
    var next_vertex = 0;
    var previous_vertex = 0;
    var new_x = 0;
    var new_y = 0;
    var new_z = 0;
    var clip_z = 1; //previously 1

    //BASIC APPROACH TO CLIPPING

        //check the current point
            //if it is in front of us, add it to the new polygon
            //if it is behind us
                //look at the previous point
                    //is the previous point also behind us
                        //do nothing - this point can be dropped without impact
                    //if the previous point in front of us
                        //move this point towards the previous point until it is on the plane, add that point to the polygon
                //look at the next point
                    //if the next point also behind us
                        //do nothing can drop this point without impact
                    //if the next point is in front of us
                        //move this point towards the next point until it is on the plane, add that point to the polygon

            //note: if the previous and next points are BOTH in front of us, then the point behind us will be replaced with 2 points


    //HOW TO CHECK IF A POINT IS IN FRONT OR BEHIND US
        //all coordinates have already been shifted to the viewport coordinate system
            //therefore if z<0 should indicate that the point is behind us - we are using the 'clip_z' variable to allow tuning 

    //loop over all the verticies
    for(var i=0; i<vertices.length; i++) {

        //calculate indexes for previous and next vertices
        if(i==0) {
            next_vertex = i+1;
            previous_vertex = vertices.length-1;
        }
        else if (i == vertices.length - 1) {
            next_vertex = 0;
            previous_vertex = i-1;
        }
        else {
            next_vertex = i+1;
            previous_vertex = i-1;
        }

        //copy existing vertex to a temporary object we can play with
        var tmpVtx = JSON.parse(JSON.stringify(vertices[i]));

        //check if current vertex is in front of us
        if(vertices[i].z >= clip_z) {

            //the point is infront of us, so add it to our new polygon
            newVertices.push(tmpVtx);

        } else {

            //the point is behind us, so we are going to need to fix it

            //check if the previous point was in front of us
            if(vertices[previous_vertex].z > clip_z) {

                //the previous point was in front of us
                //calcualte the intersection between the edge between these two points and the plane of our camera

                x1 = vertices[i].x;
                y1 = vertices[i].y;
                z1 = vertices[i].z;
                x2 = vertices[previous_vertex].x;
                y2 = vertices[previous_vertex].y;
                z2 = vertices[previous_vertex].z;

                //calculate distances
                xd = x2 - x1;
                yd = y2 - y1;
                zd = z2 - z1;

                //calculate the parameter t
                t = (clip_z-z1)/zd;

                //calculate the new coordinates
                new_x = x1 + xd*t;
                new_y = y1 + yd*t;
                new_z = z1 + zd*t;

                //add the new point to the new polygon
                tmpVtx.x = new_x;
                tmpVtx.y = new_y;
                tmpVtx.z = new_z;
                newVertices.push(tmpVtx);

            } //end check if previous point is in front of us

            //copy existing vertex to a temporary object we can play with
            var tmpVtx = JSON.parse(JSON.stringify(vertices[i]));

            //check if the next point is in front of us
            if(vertices[next_vertex].z > clip_z) {

                x2 = vertices[i].x;
                y2 = vertices[i].y;
                z2 = vertices[i].z;
                x1 = vertices[next_vertex].x;
                y1 = vertices[next_vertex].y;
                z1 = vertices[next_vertex].z;

                //calculate distances
                xd = x2 - x1;
                yd = y2 - y1;
                zd = z2 - z1;

                //calculate the parameter t
                t = (clip_z-z1)/zd;

                //calculate the new coordinates
                new_x = x1 + xd*t;
                new_y = y1 + yd*t;
                new_z = z1 + zd*t;

                //add the new point to the new polygon
                tmpVtx.x = new_x;
                tmpVtx.y = new_y;
                tmpVtx.z = new_z;
                newVertices.push(tmpVtx);

            }
        }

    } // end loop over vertices

    return newVertices;

}; // end polgyonZClip

//get coordinates relative to the viewPort
function changeToViewPortBasis(vtx, viewPort) {

    var tmpVtx = JSON.parse(JSON.stringify(vtx));

    //rotate the world coordinates by pitch, yaw and roll around the viewport
    rotate(tmpVtx, viewPort.location,  viewPort.pitch, -viewPort.yaw, viewPort.roll);

    //offset the world coordinates to match the camera coordinates 
    tmpVtx.x -= viewPort.location.x;
    tmpVtx.y -= viewPort.location.y;
    tmpVtx.z -= viewPort.location.z;

    return tmpVtx;
}; //end changeToViewPortBasis


//get coordinates relative to the world
function changeToWorldBasis (vertex, viewPort) {

    tmpVertex = JSON.parse(JSON.stringify(vertex));

    // rotate teh world coordinates by pitch, yaw and roll around the veiwport
    rotate(tmpVertex, new Vertex(0,0,0), -viewPort.pitch, viewPort.yaw, -viewPort.roll);

    return tmpVertex;

}; //end changeToWorldBasis


//function to check for collsions between a test collision_box and an array of objects
function check_collision(test, hitboxes) {

    var collision = {};
    var x_axis_test;
    var y_axis_test;
    var z_axis_test;
    collision.test = 0;
    collision.indexList = [];
    collision.hitboxes = [];

    //loop over the hitboxes for this target
    for (var j=0; j<hitboxes.length; j++) {

        x_axis_test = (test.min_x <= hitboxes[j].max_x && test.max_x >= hitboxes[j].min_x);
        y_axis_test = (test.min_y <= hitboxes[j].max_y && test.max_y >= hitboxes[j].min_y);
        z_axis_test = (test.min_z <= hitboxes[j].max_z && test.max_z >= hitboxes[j].min_z);

        if(x_axis_test && y_axis_test && z_axis_test ) {

            //the test object has collided with the target object
            collision.test = 1;
            collision.indexList[collision.indexList.length] = j;
            collision.hitboxes[collision.hitboxes.length] = hitboxes[j];

        } //end test for collision with this hitbox

    } // end loop over this targets hitboxes

    // console.log("inside: "+JSON.stringify(collision));
    return collision;

}; //end check_collision