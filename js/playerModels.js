//this file defines the various player models
//player models define the movement physics and player controls
//player models must include an 'update()' method which is called by the main game loop to update the model
//player models must include a 'control()' method which is called by the keyboard handler to process the user input

//currently implemented models
//player - simulates a pedestrain who can jump and has a jetpack
//vehicle - simulates a basic vehicle with acceleration, breaking, and steering


//define the player model
var Player_Model = function(config) {

    //define the site/shape of the player
    this.height = config.height;
    this.width = config.width;
    this.depth = config.depth;

    //define the location of the player
    this.location = config.location;

    //define the mass of the player (for physics calculations)
    this.mass = config.mass;

    //define the hitbox for the player
    this.hitbox = new collision_box({

    	ctr : config.location,
    	height : config.height,
    	width : config.width,
    	depth : config.depth,
    	state : 1,
    	triggerID : "",
    	triggerCode : ""

    });

    //define force variables (used to help move the player around)
    this.force = {
    	x : config.force.x,
    	y : config.force.y,
    	z : config.force.z
    };

    this.inputForce = {
    	x : config.inputForce.x,
    	y : config.inputForce.y,
    	z : config.inputForce.z
    };

    //define the velocity of the player
    this.velocity = {
    	x : config.velocity.x,
    	y : config.velocity.y,
    	z : config.velocity.z
    };

    //define the acceleration of the player
    this.acceleration = {
    	x : config.acceleration.x,
    	y : config.acceleration.y,
    	z : config.acceleration.z
    };

    //define direction of the player
    this.angle = {
    	pitch : config.angles.pitch,				//rotation around the x axis
    	yaw : config.angles.yaw,				//rotation around the y axis
    	roll : config.angles.roll 				//rotation around the z axis
    };

    //define the angular velocities of the player
    this.angle.velocities = {
    	pitch : config.angles.velocities.pitch,
    	yaw : config.angles.velocities.yaw,
    	roll : config.angles.velocities.roll
    };

    //define the angular accelerations of the player
    this.angle.accelerations = {
    	pitch : config.angles.accelerations.pitch,
    	yaw : config.angles.accelerations.yaw,
    	roll : config.angles.accelerations.roll
    };

    //define player strength (used to help move the player around)
    this.strength = {
    	x : config.strength.x,
    	y : config.strength.y,
    	z : config.strength.z
    };

    //define other state variables
    this.health = config.health;
    this.jetpack = config.jetpack;
    this.active_hitboxes = 0;

    //control function accepts keyboard event and updates player state based on user input
    this.control = function(e) {

    	if(e.type == 'keydown') {

	        //if we are touching something or our jetpack is turned on
	        if(this.active_hitboxes > 0 || this.jetpack == 1) {

	            if (e.keyCode == 65) {
	                //A
	                this.inputForce.x = -1*this.strength.x;
	            }
	            if (e.keyCode == 68) {
	                //D
	                this.inputForce.x = this.strength.x;
	            }
	            if (e.keyCode == 87) {
	                //W
	                this.inputForce.z = this.strength.z;
	            }
	            if (e.keyCode == 83) {
	                //S
	                this.inputForce.z = -1*this.strength.z;
	            }
	            if (e.keyCode == 38) {
	                //UP
	                this.inputForce.y = this.strength.y;                    
	            }
	            if (e.keyCode == 40) {   
	                this.inputForce.y = -1*this.strength.y;
	            }

	        }

	        if (e.keyCode == 37) {
	            this.angle.velocities.yaw = -1 * Math.PI / 120;
	        }
	        if (e.keyCode == 39) {
	            this.angle.velocities.yaw = Math.PI / 120;
	        }

	        if (e.keyCode == 74) {
	            //J
	            if(this.jetpack == 0) {
	                this.jetpack = 1;
	            } else { this.jetpack = 0; }
	            console.log("jetpack: "+this.jetpack);
	        }

    	} //e.type == 'keydown'

        if (e.type == 'keyup') {
            if(e.keyCode == 65 || e.keyCode == 68) {
                this.inputForce.x = 0;
            }
            if(e.keyCode == 87 || e.keyCode == 83) {
                this.inputForce.z = 0;
            }
            if(e.keyCode == 38 || e.keyCode == 40) {
                this.inputForce.y = 0;
            }
            if(e.keyCode == 37 || e.keyCode == 39) {
                this.angle.velocities.yaw = 0;
            }
        } //e.type == 'keyup'

    } //end this.control()

    //update the player model based on player state
    this.update = function() {

	    //initialize array to store all hitboxes that collide with the model
	    var all_hitboxes = [];

	    //update the model direction
	    this.angle.yaw += this.angle.velocities.yaw;
	    this.angle.pitch += this.angle.velocities.pitch;
	    this.angle.roll += this.angle.velocities.roll;

	    //backup old values - force, acceleration, velocity, location
	    var old = {
	        force : {
	            x : this.force.x,
	            y : this.force.y,
	            z : this.force.z
	        },
	        acceleration: {
	            x : this.acceleration.x,
	            y : this.acceleration.y,
	            z : this.acceleration.z
	        },
	        velocity: {
	            x : this.velocity.x,
	            y : this.velocity.y,
	            z : this.velocity.z
	        },
	        location: {
	            x : this.location.x,
	            y : this.location.y,
	            z : this.location.z
	        }
	    };


	    //convert force to world coordinates
	    var worldForce = changeToWorldBasis(this.inputForce, viewPort);

	    this.force.x = worldForce.x - world.config.friction*this.velocity.x;
	    this.acceleration.x = this.force.x / this.mass;
	    this.velocity.x += this.acceleration.x;      
	    if(this.velocity.x < 0) {
	        this.velocity.x = Math.max(-375, this.velocity.x);
	    } else {
	        this.velocity.x = Math.min(375, this.velocity.x);
	    }

	    this.force.y = worldForce.y - world.config.gravity - world.config.friction*this.velocity.y;
	    this.acceleration.y = this.force.y / viewPort.mass;
	    this.velocity.y += this.acceleration.y;        
	    if(this.velocity.y < 0) {
	        this.velocity.y = Math.max(-375, this.velocity.y);
	    } else {
	        this.velocity.y = Math.min(375, this.velocity.y);
	    }

	    
	    this.force.z = worldForce.z - world.config.friction*this.velocity.z;
	    this.acceleration.z = this.force.z / this.mass;
	    this.velocity.z += this.acceleration.z;
	    if(this.velocity.z < 0) {
	        this.velocity.z = Math.max(-375, this.velocity.z);
	    } else {
	        this.velocity.z = Math.min(375, this.velocity.z);
	    }

	    var worldVelocity = this.velocity;

	    //apply x direction motion
	    this.location.x += worldVelocity.x;

	    //check for collisions
	    this.hitbox = new collision_box({
	        ctr : this.location,
	        width : this.width,
	        height : this.height,
	        depth : this.depth,
	        state : 1,
	        triggerID : "",
	        triggerCode : ""
	    });
	    var collision = check_collision(this.hitbox, world.hitboxes);

	    //loop over all the faces we hit and see if we have hit any active hitboxes
	    var collision_counter = 0;
	    for(h=0; h<collision.hitboxes.length; h++) {

	        //copy this hitbox into the 'all_hitboxes' array
	        all_hitboxes.splice(all_hitboxes.length,0,collision.hitboxes[h]);

	        //check if this hitbox is active
	        if(collision.hitboxes[h].state == 1) {
	            collision_counter++;
	        } //end check if this hitbox is active

	    } //end loop over faces we hit

	    //check if we found any active collisions
	    if(collision_counter != 0) {

	        //we have hit an active hitbox - we cannot move this way (could modify this to create bouncy walls)
	        this.force.x = 0;
	        this.acceleration.x = 0;
	        this.velocity.x = 0;
	        this.location.x = old.location.x;

	    } //end check if we found any active collisions


	    //apply y direction motion
	    if(this.jetpack == 0) {
	        this.location.y += this.velocity.y;    
	    } else if (this.inputForce.y > 0) {
	        this.location.y += 10;
	    } else if (this.inputForce.y < -0) {
	        this.location.y -= 10;
	    }
	    
	    //check for collisions
	    this.hitbox = new collision_box({
	        ctr : this.location,
	        width : this.width,
	        height : this.height,
	        depth : this.depth,
	        state : 1,
	        triggerID : "",
	        triggerCode : ""
	    });
	    var collision = check_collision(this.hitbox, world.hitboxes);

	     //loop over all the faces we hit and see if we have hit any active hitboxes
	    var collision_counter = 0;
	    for(h=0; h<collision.hitboxes.length; h++) {

	        //copy this hitbox into the 'all_hitboxes' array
	        all_hitboxes.splice(all_hitboxes.length,0,collision.hitboxes[h]);

	        //check if this hitbox is active
	        if(collision.hitboxes[h].state == 1) {
	            collision_counter++;
	        } //end check if this hitbox is active

	    } //end loop over faces we hit

	    //check if we found any active collisions
	    if(collision_counter != 0) {

	        //we have hit an active hitbox - we cannot move this way (could modify this to create a bouncy floor...)
	        this.force.y = 0;
	        this.acceleration.y = 0;
	        this.velocity.y = 0;        
	        this.location.y = old.location.y;

	    } //end check if we found any active collisions

	    //apply z-direction motion
	    this.location.z += worldVelocity.z;

	    //update the player hitbox
	    this.hitbox = new collision_box({
	        ctr : this.location,
	        width : this.width,
	        height : this.height,
	        depth : this.depth,
	        state : 1,
	        triggerID : "",
	        triggerCode : ""
	    });

	    //check for collisions
	    var collision = check_collision(this.hitbox, world.hitboxes);

	    //loop over all the facess we hit and see if we have hit any active hitboxes
	    var collision_counter = 0;
	    for(h=0; h<collision.hitboxes.length; h++) {

	        //copy this hitbox into the 'all_hitboxes' array
	        all_hitboxes.splice(all_hitboxes.length,0,collision.hitboxes[h]);

	        //check if this hitbox is active
	        if(collision.hitboxes[h].state == 1) {
	            collision_counter++;
	        } //end check if this hitbox is active

	    } //end loop over objects we hit

	    //check if we found any active collisions
	    if(collision_counter != 0) {

	        //we have hit an active hitbox - we cannot move this way (could modify this to create bouncy walls)
	        this.force.z = 0;
	        this.acceleration.z = 0;
	        this.velocity.z = 0;
	        this.location.z = old.location.z;

	    } //end check if we found any active collisions

	    //update the player hitbox with the final location and finalize the collision list
	    this.hitbox = new collision_box({

	        ctr : this.location,
	        width : this.width,
	        height : this.height,
	        depth : this.depth,
	        state : 1,
	        triggerID : "",
	        triggerCode : ""

	    });
	    
	    //used to see if we can move
	    this.active_hitboxes = 0;

	    //loop over all the hitboxes we have collided with - check for triggers
	    for(c=0; c<all_hitboxes.length; c++) {

	        // check that this hitbox is not inactive
	        if(all_hitboxes[c].state != 0) {

	            //count how many hit boxes are active
	            this.active_hitboxes++;

	            //active this trigger
	            var this_triggerID = all_hitboxes[c].triggerID;
	            if(this_triggerID !== "") {
	                world.triggers[this_triggerID].activate(all_hitboxes[c].triggerCode);
	            }    

	        }  // end check that hitbox is not inactive

	    }

    }

};