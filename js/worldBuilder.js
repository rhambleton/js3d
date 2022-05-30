//TODO - automated random mazes
//	   - cofigure length of correct path
//TODO - implement a finsih line
//TODO - implment a timer to track how long it take the user to solve the maze
//TODO - 
//TODO - ramps
//TODO - doors
//TODO - switches








//define the world object
var World = function(config) {			

	this.faces = [];					//array to hold all faces that exist in the world
	this.hitboxes = [];					//array to hold all hitboxes in the world
	this.triggers = [];					//array to hold all triggers in the world
	this.collisions = [];

	//object to hold world configuration data
	this.config = {						
		gravity : config.gravity,
		friction : config.friction
	};									

	this.new_hallway = function(hallway,wrld) {
		
		//hallway.location = Vertex; 					a vertex representating the center location of the hallway (index format)
		//hallway.typeList = [];	  					a list of typeID's stored in an array
		//hallway.force_direction = 1 or 0; 			1=force direction to config.direction; 0=derive direction from piece type
		//hallway.direction = 0,1,2,3; 					0=positive z-axis; 1=positive x-axis; 2=negative z-axis; 3=negative x-axis
		//hallway.stroke = 'rgba(255,255,255,1)'; 		(Color to use for the outline of each polygon);
		//hallway.fill.ceiling = 'rgba(255,255,255,1)'; (Color to use to fill the ceiling of the hallway)
		//hallway.fill.floor = 'rgba(255,255,255,1)'; 	(Color to use to fill the floor of the hallway)
		//hallway.fill.wall = 'rgba(255,255,255,1)'; 	(Color to use to fill the walls of the hallway)
		//hallway.fill.door = 'rgba(255,255,255,1)'; 	(Color to use to fill front/back faces of a door)

			// Supported typeID's
			//
			// Straight Sections
			// 		00 = positive z-axis
			//		01 = positive x-axis
			//		02 = negative z-axis
			//		03 = negative x-axis
			//
			// Right 90 degree Elbows
			//		10 = Right 	(positive Z-axis)
			// 		11 = Right  (positive X-axis)
			//		12 = Right 	(Negative Z-Axis)
			//		13 = Right  (Negative X-Axis)
			//
			// Left 90 degree Elbows
			//		20 = left (positive Z-axis)
			// 		21 = left (positive X-axis)
			//		22 = left (negative Z-axis)
			//		23 = left (negative X-axis)
			//	
			// Right Tee's
			//		30 = Right 	(Positive Z-axis)    
			// 		31 = Right  (Positive X-axis)
			//		32 = Right  (Negative Z-Axis)
			//		33 = Right  (Negative X-Axis)
			//	
			// Left Tee's
			//		40 = Left  (Positive Z-axis)    
			// 		41 = Left  (Positive X-axis)
			//		42 = Left  (Negative Z-Axis)
			//		43 = Left  (Negative X-Axis)
			//
			// Crossroads
			//		50 = Positive Z-axis  
			// 		51 = Positive X-axis
			//		52 = Negative Z-Axis
			//		53 = Negative X-Axis
			//
			// Start
			//		60 = Positive Z-Axis Start 
			//      61 = Positive X-Axis Start 
			//		62 = Positive Z-Axis Start
			//		63 = Positive X-Axis Start 
			//
			// End
			//		70 = Positive Z-Axis End
			//      71 = Positive X-Axis End
			//		72 = Positive Z-Axis End
			//		73 = Positive X-Axis End 
			//
			// blank space
			//
			//		80 = positive z-axis
			//		81 = positive x-axis
			//		82 = negative z-axis
			//		83 = negative x-axis
			//
			// Doors
			//		90 = positive Z-axis
			//		91 = positive X-axis
			//		92 = negative Z-axis
			//		93 = negative Z-axis
			//

		//define details that apply to *ALL* sections in this hallway
		var section = {

			length : canvas.width,
			width : canvas.width,
			height : canvas.height,
			location : new Vertex(hallway.location.x*canvas.width, hallway.location.y*canvas.height,hallway.location.z*canvas.width),
			door_thickness : canvas.width / 10

		};

		//loop over each section, populating the required variables and drawing the necessary faces
		for (var i=0; i<hallway.typeList.length; i++) {

			section.type = hallway.typeList[i];

			//define travel direction
			if(hallway.force_direction == 1) {
				section.travel_direction = hallway.direction;
			} 
			else {
				section.travel_direction = section.type % 10;	
			}

			//break direction into x and y components
			switch(section.travel_direction) {

				case 0:
					//positive z-axis
					section.travel_x = 0;
					section.travel_z = 1;
					break;

				case 1:
					//positive x-axis
					section.travel_x = 1;
					section.travel_z = 0;
					break;

				case 2:
					//negative z-axis
					section.travel_x = 0;
					section.travel_z = -1;
					break;

				case 3:
					//negative x-axis
					section.travel_x = -1;
					section.travel_z = 0;
					break;
			}

			//check if we care about turns
			if(hallway.force_direction != 1) {
			
				//check for right turns	
				if(section.type >= 10 && section.type <=13) {

					//adjust direction accordingly
					if(section.travel_x !=0) {
						section.travel_z = -1*section.travel_x;
						section.travel_x = 0;
					} else if (section.travel_z != 0) {
						section.travel_x = section.travel_z;
						section.travel_z = 0;
					}

				} //end check for right turns

				//check for left turns
				if(section.type >=20 && section.type <=23) {

					//adjust direction accordingly
					if(section.travel_x != 0) {
						section.travel_z = section.travel_x;
						section.travel_x = 0;
					} else if (section.travel_z != 0) {
						section.travel_x = -1*section.travel_z;
						section.travel_z = 0;
					}

				} //end check for left turns

			} //end check if we care about turns

			//get the stroke color for this section
			section.stroke = hallway.stroke;

			//get the fill colors for this section
			section.fill = {};
			section.fill_index = i % hallway.fill.floor.length;
			section.fill.floor = hallway.fill.floor[section.fill_index];
			section.fill_index = i % hallway.fill.wall.length;
			section.fill.wall = hallway.fill.wall[section.fill_index];
			section.fill_index = i % hallway.fill.ceiling.length;
			section.fill.ceiling = hallway.fill.ceiling[section.fill_index];
			section.fill_index = i % hallway.fill.door.length;
			section.fill.door = hallway.fill.door[section.fill_index];

			
			//check if we need to draw the floor and ceiling in one shot (all types <80)
			if(Math.floor(section.type/10) < 8) {

				//create face and hitbox for the floor
			    var config = {
			    	ctr : new Vertex(section.location.x, section.location.y-section.height/2, section.location.z),
			    	width : section.length,
			    	height : 0,
			    	depth : section.width,
			    	id : "face"+this.faces.length,
			    	fill : section.fill.floor,
			    	stroke : section.stroke,
			    	state : 1,
			    	triggerID : "",
			    	triggerCode : ""
			    }
			    this.faces[this.faces.length] = new Face(config);
			    this.hitboxes[this.hitboxes.length] = new collision_box(config);


				//add ceiling to faces and hitbox
				var config = {
					ctr : new Vertex(section.location.x, section.location.y+section.height/2, section.location.z),
					width : section.length,
					height : 0,
					depth : section.width,
					id : "face"+this.faces.length,
					fill : section.fill.ceiling,
					stroke : section.stroke,
					state: 1,
					triggerID : "",
					triggerCode : ""
				}
			    this.faces[this.faces.length] = new Face(config);
			    this.hitboxes[this.hitboxes.length] = new collision_box(config);

			} //end one piece floor and ceiling

			//draw left side of hallway (along z-axis) (for types: 0,2,10,13,22,23,30,42,60,61,62,70,72,73)
			var types_array = [0,2,10,13,22,23,30,42,60,61,62,70,72,73];
			if(types_array.indexOf(section.type) !== -1 ) {

				//add left side of hallway to faces, and add the hitbox to hitboxes
				var config = {
					ctr : new Vertex(section.location.x-section.width/2, section.location.y, section.location.z),
					width : 0,
					height : section.height,
					depth : section.length,
					id : "face"+this.faces.length,
					fill : section.fill.ceiling,
					stroke : section.stroke,
					state : 1,
					triggerID : "",
					triggerCode : "",
				}
				this.faces[this.faces.length] = new Face(config);
				this.hitboxes[this.hitboxes.length] = new collision_box(config);
			
			} //end left side (z-axis)

			//draw right side of hallway (along z-axis) (for types: 0,2,11,12,20,21,32,40,60,62,63,70,71,72)
			var types_array = [0,2,11,12,20,21,32,40,60,62,63,70,71,72];
			if(types_array.indexOf(section.type) !== -1 ) {

				//add right side of hallway to faces, and add the hitbox to hitboxes
				//add left side of hallway to faces, and add the hitbox to hitboxes
				var config = {
					ctr : new Vertex(section.location.x+section.width/2, section.location.y, section.location.z),
					width : 0,
					height : section.height,
					depth : section.length,
					id : "face"+this.faces.length,
					fill : section.fill.ceiling,
					stroke : section.stroke,
					state : 1,
					triggerID : "",
					triggerCode : "",
				}
				this.faces[this.faces.length] = new Face(config);
				this.hitboxes[this.hitboxes.length] = new collision_box(config);

			} //end right side (z-axis)

			//draw "top/front" side of hallway (along z-axis) (for types: 1,3,10,11,20,23,31,43,61,62,63,70,71,73)
			var types_array = [1,3,10,11,20,23,31,43,61,62,63,70,71,73];
			if(types_array.indexOf(section.type) !== -1 ) {

				//add left side of hallway to faces, and add the hitbox to hitboxes
				var config = {
					ctr : new Vertex(section.location.x, section.location.y, section.location.z+section.width/2),
					width : section.length,
					height : section.height,
					depth : 0,
					id : "face"+this.faces.length,
					fill : section.fill.ceiling,
					stroke : section.stroke,
					state : 1,
					triggerID : "",
					triggerCode : "",
				}
				this.faces[this.faces.length] = new Face(config);
				this.hitboxes[this.hitboxes.length] = new collision_box(config);

			} //end left side (x-axis)

			//draw "bottom/back" side of hallway (along z-axis) (for types: 1,3,12,13,21,22,33,41,60,61,63,71,72,73)
			var types_array = [1,3,12,13,21,22,33,41,60,61,63,71,72,73];
			if(types_array.indexOf(section.type) !== -1 ) {

				//add right side of hallway to faces, and add the hitbox to hitboxes
				var config = {
					ctr : new Vertex(section.location.x, section.location.y, section.location.z-section.width/2),
					width : section.length,
					height : section.height,
					depth : 0,
					id : "face"+this.faces.length,
					fill : section.fill.ceiling,
					stroke : section.stroke,
					state : 1,
					triggerID : "",
					triggerCode : "",
				}
				this.faces[this.faces.length] = new Face(config);
				this.hitboxes[this.hitboxes.length] = new collision_box(config);

			} //end right side (x-axis)

			//create a door
			var types_array = [90,92,91,93];
			if(types_array.indexOf(section.type) !== -1) {

				//start adding the door to to the global array of triggers
				this.triggers[this.triggers.length] = {
					type : "door",					//describe what type of trigger this is
					is_closed : 1,					//1 = door is closed, 0 = door is not closed
					is_open : 0,					//1 = door is open, 0 = door is not open
					is_opening : 0, 				//1 = door is in the process of opening
					is_closing : 0,					//1 = door is in the process of closing
					open_limit : 0, 				//to be corrected below (vertical coordinate associated with open - y)
					closed_limit : 0,				//to be corrected below (vertical coordinate associated with closed - y)
					open_speed : 10,				//the speed at which the door will open
					close_speed : 10,				//the speed at which the door will close
					frontID : "",					//to be corrected below (face ID of the front face of the door)
					frontIndex : 0,					//to be corrected below (index in faces array of the front face)
					frontHBIndex : 0,				//to be corrected below (index in hitboxes array of the front face hitbox)
					backID : "",					//to be corrected below (face ID of the back face of the door)
					backIndex : 0,					//to be corrected below (index in faces array of the back face)
					backHBIndex : 0,				//to be corrected below (index in hitboxes array of the back face hitbox)
					bottomID : "",					//to be corrected below (face ID of the bottom face of the door)
					bottomIndex : 0,				//to be corrected below (index in faces array of the bottom face)
					buffer : 25,					//how many pixels of door should hang down once open

					activate : function(code) {

						//close the door if it is not already closed
						if(code == 0) {

							//check if door is closed - if not, close it
							if(this.is_closed != 1) {
								this.is_closing=1;
								this.is_opening = 0;
								this.is_open = 0;
							} //end check if door is closed

						} //end check if we need to close the door

						//open the door if it is not already open
						if(code == 1) {

							//check if the door is open - if not, open it
							if(this.is_open != 1) {
								this.is_opening=1;
								this.is_closing=0;
								this.is_closed=0;
							} //end check if door is open
						} //end check if we need to close the door

					}, //end of activate function for this trigger

					update : function(wrld) {

						//if the door is opening 
						if(this.is_opening == 1) {
							
							if(wrld.faces[this.frontIndex].vertices[0].y < this.open_limit ) {

								//if it has not reached the open limit, continue opening it
								wrld.faces[this.frontIndex].vertices[0].y += this.open_speed;
								wrld.faces[this.frontIndex].vertices[3].y += this.open_speed;
								wrld.faces[this.backIndex].vertices[0].y += this.open_speed;
								wrld.faces[this.backIndex].vertices[3].y += this.open_speed;
								wrld.faces[this.bottomIndex].vertices[0].y += this.open_speed;
								wrld.faces[this.bottomIndex].vertices[1].y += this.open_speed;
								wrld.faces[this.bottomIndex].vertices[2].y += this.open_speed;
								wrld.faces[this.bottomIndex].vertices[3].y += this.open_speed
								//size the face hitboxes to match
								wrld.hitboxes[this.frontHBIndex].min_y += this.open_speed;
								wrld.hitboxes[this.backHBIndex].min_y += this.open_speed;
								wrld.hitboxes[this.bottomHBIndex].min_y += this.open_speed;
								wrld.hitboxes[this.bottomHBIndex].max_y += this.open_speed;


							} else {
								
								//if it has reached the open limit, mark the door as open and stop opening it
								wrld.is_open = 1;
								wrld.is_opening = 0;
								wrld.is_closed = 0;
								wrld.is_closing = 0;						

							} //end check if the door is fully open

						//if the door closing
						} else if(this.is_closing == 1) {

							if(wrld.faces[this.frontIndex].vertices[0].y > this.closed_limit) {

								//if it has not reached the closed limit, continue closing it
								wrld.faces[this.frontIndex].vertices[0].y -= this.close_speed;
								wrld.faces[this.frontIndex].vertices[3].y -= this.close_speed;
								wrld.faces[this.backIndex].vertices[0].y -= this.close_speed;
								wrld.faces[this.backIndex].vertices[3].y -= this.close_speed;
								wrld.faces[this.bottomIndex].vertices[0].y -= this.close_speed;
								wrld.faces[this.bottomIndex].vertices[1].y -= this.close_speed;
								wrld.faces[this.bottomIndex].vertices[2].y -= this.close_speed;
								wrld.faces[this.bottomIndex].vertices[3].y -= this.close_speed;

								//resize the face hitboxes to match
								wrld.hitboxes[this.frontHBIndex].min_y -= this.close_speed;
								wrld.hitboxes[this.backHBIndex].min_y -= this.close_speed;
								wrld.hitboxes[this.bottomHBIndex].min_y -= this.close_speed;
								wrld.hitboxes[this.bottomHBIndex].max_y -= this.close_speed;

							} else {

								//the door has finished closing - leave it alone
								this.is_closed = 1;
								this.is_closing = 0;
								this.is_open = 0;
								this.is_opening = 0;

							} //end check if the door is fully closed

						} //end check if the door is opening/closing (if/else if)

					} //end update function

				} //end setup of trigger for the door



				//add first part of the left side of the doorway section
				var config = {
					ctr : new Vertex(section.location.x-section.width/2, section.location.y, section.location.z-section.length/4-section.door_thickness/4),
					width : 0,
					height : section.height,
					depth : section.length/2 - section.door_thickness/2,
					id : "face"+this.faces.length,
					fill : section.fill.wall,
					stroke : section.stroke,
					state : 1,
					triggerID : "",
					tiggerCode : ""
				}

				var types_array = [91,93];
				if(types_array.indexOf(section.type) !== -1) {
				
					config.width = config.depth;
					config.depth = 0;
					config.ctr = new Vertex(section.location.x-section.length/4-section.door_thickness/4, section.location.y, section.location.z-section.width/2);

				}

				this.faces[this.faces.length] = new Face(config);
				this.hitboxes[this.hitboxes.length] = new collision_box(config);
				
				//add second part of the left side of the doorway section
				var config = {
					ctr : new Vertex(section.location.x-section.width/2, section.location.y, section.location.z+section.length/4+section.door_thickness/4),
					width : 0,
					height : section.height,
					depth : section.length/2 - section.door_thickness/2,
					id : "face"+this.faces.length,
					fill : section.fill.wall,
					stroke : section.stroke,
					state : 1,
					triggerID : "",
					tiggerCode : ""
				}

				var types_array = [91,93];
				if(types_array.indexOf(section.type) !== -1) {

					config.width = config.depth;
					config.depth = 0;
					config.ctr = new Vertex(section.location.x+section.length/4+section.door_thickness/4, section.location.y, section.location.z-section.width/2);

				}

				this.faces[this.faces.length] = new Face(config);
				this.hitboxes[this.hitboxes.length] = new collision_box(config);


				//add first part of the right side of the doorway section
				var config = {
					ctr : new Vertex(section.location.x+section.width/2, section.location.y, section.location.z-section.length/4-section.door_thickness/4),
					width : 0,
					height : section.height,
					depth : section.length/2 - section.door_thickness/2,
					id : "face"+this.faces.length,
					fill : section.fill.wall,
					stroke : section.stroke,
					state : 1,
					triggerID : "",
					tiggerCode : ""
				}

				var types_array = [91,93];
				if(types_array.indexOf(section.type) !== -1) {
				
					config.width = config.depth;
					config.depth = 0;
					config.ctr = new Vertex(section.location.x-section.length/4-section.door_thickness/4, section.location.y, section.location.z+section.width/2);

				}

				this.faces[this.faces.length] = new Face(config);
				this.hitboxes[this.hitboxes.length] = new collision_box(config);
				
				//add second part of the left side of the doorway section
				var config = {
					ctr : new Vertex(section.location.x+section.width/2, section.location.y, section.location.z+section.length/4+section.door_thickness/4),
					width : 0,
					height : section.height,
					depth : section.length/2 - section.door_thickness/2,
					id : "face"+this.faces.length,
					fill : section.fill.wall,
					stroke : section.stroke,
					state : 1,
					triggerID : "",
					tiggerCode : ""
				}

				var types_array = [91,93];
				if(types_array.indexOf(section.type) !== -1) {

					config.width = config.depth;
					config.depth = 0;
					config.ctr = new Vertex(section.location.x+section.length/4+section.door_thickness/4, section.location.y, section.location.z+section.width/2);

				}

				this.faces[this.faces.length] = new Face(config);
				this.hitboxes[this.hitboxes.length] = new collision_box(config);

				//add the first part of the floor of the doorway section
				var config = {
					ctr : new Vertex(section.location.x, section.location.y-section.height/2, section.location.z-section.length/4-section.door_thickness/4),
					width : section.width,
					height : 0,
					depth : section.length/2 - section.door_thickness/2,
					id : "face"+this.faces.length,
					fill : section.fill.floor,
					stroke : section.stroke,
					state : 1,
					triggerID : "",
					triggerCode : ""
				}

				var types_array = [91,93];
				if(types_array.indexOf(section.type) !== -1) {

					config.width = config.depth;
					config.depth = section.width;
					config.ctr = new Vertex(section.location.x-section.length/4-section.door_thickness/4, section.location.y-section.height/2, section.location.z);

				}				

				this.faces[this.faces.length] = new Face(config);
				this.hitboxes[this.hitboxes.length] = new collision_box(config);

				//add the second part of the floor of the doorway section
				var config = {
					ctr : new Vertex(section.location.x, section.location.y-section.height/2, section.location.z+section.length/4+section.door_thickness/4),
					width : section.width,
					height : 0,
					depth : section.length/2 - section.door_thickness/2,
					id : "face"+this.faces.length,
					fill : section.fill.floor,
					stroke : section.stroke,
					state : 1,
					triggerID : "",
					triggerCode : ""
				}

				var types_array = [91,93];
				if(types_array.indexOf(section.type) !== -1) {

					config.width = config.depth;
					config.depth = section.width;
					config.ctr = new Vertex(section.location.x+section.length/4+section.door_thickness/4, section.location.y-section.height/2, section.location.z);

				}				

				this.faces[this.faces.length] = new Face(config);
				this.hitboxes[this.hitboxes.length] = new collision_box(config);


				//add the first part of the ceiling of the doorway section
				var config = {
					ctr : new Vertex(section.location.x, section.location.y+section.height/2, section.location.z-section.length/4-section.door_thickness/4),
					width : section.width,
					height : 0,
					depth : section.length/2 - section.door_thickness/2,
					id : "face"+this.faces.length,
					fill : section.fill.ceiling,
					stroke : section.stroke,
					state : 1,
					triggerID : "",
					triggerCode : ""
				}

				var types_array = [91,93];
				if(types_array.indexOf(section.type) !== -1) {

					config.width = config.depth;
					config.depth = section.width;
					config.ctr = new Vertex(section.location.x-section.length/4-section.door_thickness/4, section.location.y+section.height/2, section.location.z);

				}				

				this.faces[this.faces.length] = new Face(config);
				this.hitboxes[this.hitboxes.length] = new collision_box(config);

				//add the second part of the ceiling of the doorway section
				var config = {
					ctr : new Vertex(section.location.x, section.location.y+section.height/2, section.location.z+section.length/4+section.door_thickness/4),
					width : section.width,
					height : 0,
					depth : section.length/2 - section.door_thickness/2,
					id : "face"+this.faces.length,
					fill : section.fill.ceiling,
					stroke : section.stroke,
					state : 1,
					triggerID : "",
					triggerCode : ""
				}

				var types_array = [91,93];
				if(types_array.indexOf(section.type) !== -1) {

					config.width = config.depth;
					config.depth = section.width;
					config.ctr = new Vertex(section.location.x+section.length/4+section.door_thickness/4, section.location.y+section.height/2, section.location.z);

				}				
				this.faces[this.faces.length] = new Face(config);
				this.hitboxes[this.hitboxes.length] = new collision_box(config);

				//add the front face of the door
				var config = {
					ctr : new Vertex(section.location.x, section.location.y,section.location.z-section.door_thickness/2),
					width : section.width,
					height : section.height,
					depth : 0,
					id : "face"+this.faces.length,
					fill : section.fill.door,
					stroke : section.stroke,
					state : 1,
					triggerID : this.triggers.length-1,
					triggerCode : 1
				}
				var types_array = [91,93];
				if(types_array.indexOf(section.type) !== -1) {
					
					config.depth = config.width;
					config.width = 0;
					config.ctr = new Vertex(section.location.x-section.door_thickness/2, section.location.y, section.location.z);

				}
				this.triggers[this.triggers.length - 1].frontID = config.id;
				this.triggers[this.triggers.length - 1].frontIndex = this.faces.length;
				this.triggers[this.triggers.length - 1].frontHBIndex = this.hitboxes.length;
				this.triggers[this.triggers.length - 1].closed_limit = config.ctr.y - config.height/2;
				this.triggers[this.triggers.length - 1].open_limit = config.ctr.y + config.height/2 - this.triggers[this.triggers.length-1].buffer;
				this.faces[this.faces.length] = new Face(config);
				this.hitboxes[this.hitboxes.length] = new collision_box(config);

				if([90,92].indexOf(section.type) !== -1) {
					config.ctr.z = config.ctr.z - section.length/2 + section.door_thickness/2;
				} else {
				 	config.ctr.x = config.ctr.x - section.length/2 + section.door_thickness/2					
				}
				config.triggerCode = 0;
				config.state = 2;
				this.hitboxes[this.hitboxes.length] = new collision_box(config);

				//add the back face of the door
				var config = {
					ctr : new Vertex(section.location.x, section.location.y,section.location.z+section.door_thickness/2),
					width : section.width,
					height : section.height,
					depth : 0,
					id : "face"+this.faces.length,
					fill : section.fill.door,
					stroke : section.stroke,
					state : 1,
					triggerID : this.triggers.length-1,
					triggerCode : 1
				}
				var types_array = [91,93];
				if(types_array.indexOf(section.type) !== -1) {
					
					config.depth = config.width;
					config.width = 0;
					config.ctr = new Vertex(section.location.x+section.door_thickness/2, section.location.y, section.location.z);

				}
				this.triggers[this.triggers.length - 1].backID = config.id;
				this.triggers[this.triggers.length - 1].backIndex = this.faces.length;
				this.triggers[this.triggers.length - 1].backHBIndex = this.hitboxes.length;
				this.faces[this.faces.length] = new Face(config);
				this.hitboxes[this.hitboxes.length] = new collision_box(config);
				if([90,92].indexOf(section.type) !== -1) {
					config.ctr.z = config.ctr.z + section.length/2 - section.door_thickness/2;
				} else {
				 	config.ctr.x = config.ctr.x + section.length/2 - section.door_thickness/2					
				}
				config.triggerCode = 0;
				config.state = 2;
				this.hitboxes[this.hitboxes.length] = new collision_box(config);

				//add the bottom face of the door
				var config = {
					ctr : new Vertex(section.location.x,section.location.y-section.height/2, section.location.z),
					width : section.width,
					height : 0,
					depth : section.door_thickness,
					id : "face"+this.faces.length,
					fill : section.fill.door,
					stroke : section.stroke,
					state : 1,
					triggerID : "",
					triggerCode : ""
				}
				if([91,93].indexOf(section.type) !== -1) {
					config.width = section.door_thickness;
					config.depth = section.width;
				}
				this.triggers[this.triggers.length - 1].bottomID = config.id;
				this.triggers[this.triggers.length - 1].bottomIndex = this.faces.length;
				this.triggers[this.triggers.length - 1].bottomHBIndex = this.hitboxes.length;
				this.faces[this.faces.length] = new Face(config);
				this.hitboxes[this.hitboxes.length] = new collision_box(config);

				//add middle section of hallway floor
				var config = {
					ctr : new Vertex(section.location.x, section.location.y-section.height/2,section.location.z),
					width : section.width,
					height : 0,
					depth : section.door_thickness,
					id : "face"+this.faces.length,
					fill : section.fill.floor,
					stroke : section.stroke,
					state : 1,
					triggerID : "",
					triggerCode : ""
				}
				var types_array = [91,93];
				if(types_array.indexOf(section.type) !== -1) {
					
					config.depth = config.width;
					config.width = section.door_thickness;

				}		
				this.faces[this.faces.length] = new Face(config);
				this.hitboxes[this.hitboxes.length] = new collision_box(config);

				//add middle section of hallway ceiling
				config.ctr.y = section.location.y+section.height/2;
				
				this.faces[this.faces.length] = new Face(config);
				this.hitboxes[this.hitboxes.length] = new collision_box(config);

				//add middle section of left side of hallway
				var config = {
					ctr : new Vertex(section.location.x-section.width/2, section.location.y,section.location.z),
					width : 0,
					height : section.height,
					depth : section.door_thickness,
					id : "face"+this.door_thickness,
					fill : section.fill.floor,
					stroke : section.stroke,
					state : 1,
					triggerID : "",
					triggerCode : ""
				}
				var types_array = [91,93];
				if(types_array.indexOf(section.type) !== -1) {
					config.width = config.depth;
					config.depth = 0;
					config.ctr = new Vertex(section.location.x,section.location.y,section.location.z-section.width/2);
				}
				this.faces[this.faces.length] = new Face(config);
				this.hitboxes[this.hitboxes.length] = new collision_box(config);

				//add middle section of right side of hallway
				if([91,93].indexOf(section.type) !== -1) {
					config.ctr.z = section.location.z+section.width/2;
				} else {
					config.ctr.x = section.location.x+section.width/2;	
				}				

				this.faces[this.faces.length] = new Face(config);
				this.hitboxes[this.hitboxes.length] = new collision_box(config);

			} //end create a door

	 		//calculate location of next section
	 		section.location = new Vertex(section.location.x+(section.travel_x*canvas.width), section.location.y,section.location.z+((section.travel_z)*canvas.width));

		} //end loop over each section in the hallway
	};

	this.random_hallway = function(maze,wrld) {

		//maze.location = start location of maze
		//maze.initial_direction = direction of the first piece of the maze
		//maze.length = length of the main route
		//maze.branches = number of branch points along the main path (must be less than config.length)
		//maze.branchiness = 10; 0 = no branches; 100 = lots of branches  
		//maze.bendiness = 10;  0 = no bends; 100 = lots of bends	
		//maze.door_frequency = 100;  (% chance a given straight section is a door)

		//maze.branch_limit = 1;  minimum space between branches
		//maze.turn_limit = 1; minimum space between turns
		//maze.straight_limit = 10; maximum number of consecutive straifghts

		//maze.stroke = 'rgba(255,255,255,1)'; (list of color to use for the outline of each polygon - matches fill if blank "");
		//maze.fill.ceiling = ['rgba(255,255,255,1)']; (color to use to fill the ceiling of the hallway)
		//maze.fill.floor = ['rgba(255,255,255,1)']; (Color to use to fill the floor of the hallway)
		//maze.fill.wall = ['rgba(255,255,255,1)']; (Color to use to fill the walls of the hallway)
		//maze.fill.door = ['rgba(255,255,255,1)']; (Color to use to fill front/back faces of a door)

		//assume maze is not complete
		maze.complete = 0;
		maze.exit = 0;

		//main loop to build the maze
		while(maze.complete == 0 && maze.exit < 10000) {

			//setup an empty array to hold the map of the maze
			maze.map = [];

			//loop over columns (x coordinates)
			for(i=0; i<=2*maze.length; i++) {

				maze.map[i] = [];

				//loop over rows
				for(j=0; j<=2*maze.length; j++) {

					maze.map[i][j] = 80;

				}

			}

			//loop over the map adding in the path
			var path_x = 0;											//tracks x-coordinate (column #) of the path
			var path_y = maze.length;								//tracks y-coordinate (row #) of the path
			maze.map[path_x][path_y] = 0+maze.initial_direction;	//set the first piece to a '1' - positive z-axis straight piece
			var piece_count = 0;									//initialize the piece counter

			var branchiness = maze.branchiness;					// % of total pieces that are branches (1=10%, 5=50%)
			var bendiness = maze.bendiness;						// % of total pieces that are bends (including branches) (1=10%, 5=50%)
			var last_branch = 0;									// we haven't inserted any piece's since the last branch point
			var branch_limit = maze.branch_limit;  				// minimum spacing between branch points
			var last_turn = 1;										// assume we have inserted 1 piece since the last turn
			var turn_limit = maze.turn_limit; 					// minimum spacing between turns
			var straight_limit = maze.straight_limit; 			//maximum length of straight sections

			var direction = maze.initial_direction;				//initialize direction to positive z-axis
			var old_direction = 1;									//iniitalize previous direction to positive z-axis

			var next_type = 0;										//place holder for selecting the next section type

			//generate the desired # of sections
			for(i=0;i<2*config.length; i++) {

				//move path forward based on direction of previous piece
				var old_path_y = path_y;
				var old_path_x = path_x;

				switch(direction) {

					case 0:
						//positive y-axis
						path_y++;
						break;

					case 1:
						//positive  x-axis
						path_x++;
						break;

					case 2:
						//negative y-axis
						path_y--;
						break;

					case 3:
						//negative x-axis
						path_x--
						break;
				}

				//check if we are leaving the map - or crossing our self
				if(path_x > 2*maze.length || path_y > 2*maze.length || path_x < 0 || path_y < 0 || maze.map[path_x][path_y]!=80) {
					path_x = old_path_x;
					path_y = old_path_y;
					direction = old_direction;
					piece_count--;
				}

				//check if we should turn
				if((last_turn >= turn_limit && Math.floor(Math.random()*100)+1<bendiness) || last_turn > straight_limit) {

					//we should turn - so pick a direction (Random)
					next_type = (Math.floor(Math.random()*2)+1)*10;

				} else {

					//no turns - we should go straight - but should we install a door?
					if(Math.floor(Math.random()*100) < maze.door_frequency) {
						next_type = 90;
					} else {
						next_type = 0;	
					}
					
				}

				//insert the corresponding piece into the map
				maze.map[path_x][path_y] = next_type + direction;

				//store current direction in case we need to reload it
				var old_direction = direction;

				switch(next_type) {

					case 0:
						//straight section
						last_turn++;
						last_branch++;
						break;
					
					case 10:
						//right elbow
						last_turn=0;
						last_branch++;
						direction++;
						break;

					case 20:
						//left elbow
						last_turn=0;
						last_branch++;
						direction--;
						break;

					case 30:
						//right tee
						last_branch=0;
						if(Math.random < 0.5) {
							last_turn=0;
							direction++;
						} else { last_turn++; }
						break;

					case 40:
						//left tee
						last_branch=0;
						if(Math.random < 0.5) {
							last_turn=0;
							direction--;
						} else { last_turn++; }
						break;
				}

				//update direction

				//keep direction between 0 and 3 inclusive
				if(direction < 0) { direction += 4; }
				if(direction > 3) { direction -= 4; }

				//keep track of how many pieces - force loop exit when limit is reached.	
				piece_count++;

				if(piece_count == maze.length) {
					
					i=2*config.length;

					switch(direction) {

						case 0:
							//positive y-axis
							path_y++;
							break;

						case 1:
							//positive  x-axis
							path_x++;
							break;

						case 2:
							//negative y-axis
							path_y--;
							break;

						case 3:
							//negative x-axis
							path_x--
							break;
					}

					if(path_x <= 2*maze.length && path_y <= 2*maze.length && path_x > 0 && path_y > 0) {
						if(maze.map[path_x][path_y] == 80) {
							complete = 1;
						}
					}

				}



			} //end loop to generate sections

			maze.exit++;

		} //end of main loop to build the maze

		// //output the map to the console for trouble shooting purposes
		// for(var p=0; p<=2*config.length; p++) {
		// 	console.log(JSON.stringify(this.map[p]	));	
		// }

		//display map 1 column at a time
		for(i=0;i<=2*maze.length; i++) {

			var section = {
			    location : new Vertex(i,0,-1*maze.length),    //define the start of our hallway (based on main grid)
			    typeList : maze.map[i],             			//define the sections of our hallway
			    force_direction : 1,                            //over ride direction and just build things in a straight line
			    direction : 0,                                  //set the direction
			    stroke : maze.stroke,                       	//set the outline color for the polygons
			    fill : {
			        ceiling : maze.fill.ceiling,          	//set the fill color for 'ceiling' polygons
			        floor : maze.fill.floor,            	 	//set the fill color for 'floor' polygons
			        wall : maze.fill.wall,             		//set the fill color for 'wall' polygons
			        door : maze.fill.door                 	//set the fill color for 'door' polygons
			    }
			}

			this.new_hallway(section,wrld);

		} // end loop to display the map

	}; //end of this.new_maze()

	this.draw_level = function(level,wrld,vPort) {

		//map is an array of arrays
			//each inner array represents the list of 'section types' for one column of the map
			//section types correspond to those listed in the comments for the new_hallway() method

		//display map 1 column at a time
		for(i=0;i<level.map[0].length; i++) {

			var section = {
			    location : new Vertex(i,0,0),    //define the start of our hallway (based on main grid)
			    typeList : level.map[i],             			//define the sections of our hallway
			    force_direction : 1,                            //over ride direction and just build things in a straight line
			    direction : 0,                                  //set the direction
			    stroke : level.config.stroke,                       	//set the outline color for the polygons
			    fill : {
			        ceiling : level.config.fill.ceiling,          	//set the fill color for 'ceiling' polygons
			        floor : level.config.fill.floor,            	 	//set the fill color for 'floor' polygons
			        wall : level.config.fill.wall,             		//set the fill color for 'wall' polygons
			        door : level.config.fill.door                 	//set the fill color for 'door' polygons
			    }
			}

			this.new_hallway(section,wrld);

		} // end loop to display the map

		//move viewPort to player start location
		vPort.location.z = (level.config.player_start.column-1) * canvas.width;
		vPort.location.x = (level.config.player_start.row-1) * canvas.width;
		vPort.location.y = 0;
		vPort.yaw = Math.PI/2 * level.config.player_start.direction;


	}; //end of this.draw_map()


	this.random_map = function(config) {
		//config.size = XX;				size of one side of the map array
		//config.hallways = xx;			number of individual hallways to generate (some may overlap)
		//config.length = xx;			maximum length of each hallway

		//initialize the array of direction
		var directions = [[0,1],[1,0],[0,-1],[-1,0]];


		//initialize empty map
		var map = [];
		for (var x=0; x<config.size; x++) {
			map[x] = [];
			for(var y=0; y<config.size; y++) {
				map[x][y] = 0;
			}
		}
		
		//pick a random starting point
		x = Math.floor(Math.random()*config.size);
		y = Math.floor(Math.random()*config.size);

		//fill in the ending point
		map[x][y] = 1;

		//loop over the rest of the path
		for(h=0;h<config.hallways;h++){

			//pick a random direction
			var d = Math.floor(Math.random()*4)
			//0=up, 1=right, 2=down, 3=left

			//correct for the top/bottom edges of the map
			while((y==0 && d==2) || (y==map[x].length-1 && d==0) || (x==0 && d==3) || (x==map.length-1 && d==1)) {
				//generate a new random direction
				var d=Math.floor(Math.random()*4);
			}

			//generate a random length
			var length = Math.floor(Math.random()*config.length)
			var l=0;


			do {

				//update x and y coordinates
				x += directions[d][0];
				y += directions[d][1];

				map[x][y] = 1;
				l++;


			} while (((d==2 && y!=0) || (d==0 && y!=map[x].length-1) || (d==3 && x!=0) || (d==1 && x!=map.length-1)) && l<=length);
		}

		return map;
	}


	this.random_level = function(config, wrld, vPort) {

		//config.size = XX;				size of one side of the map array
		//config.hallways = xx;			number of individual hallways to generate (some may overlap)
		//config.length = xx;			maximum length of each hallway
		//config.min_squares = xx;      minimum number of squares the map must occupy
		//config.max_squares = xx;      maximum number of squares the map may occupy

		//initialize the array of direction
		var directions = [[0,1],[1,0],[0,-1],[-1,0]];

		//loop over the map and count squares
		var square_count = 0;

		var tries = 0;
		while((square_count < config.min_squares || square_count > config.max_squares) && tries < 1000) {

			var end_x = 0;
			var end_y = 0;
			var square_count = 0;

			var map = this.random_map(config); 
			
			for(x=0;x<map.length;x++) {
				for(y=0;y<map[x].length;y++) {
					if(map[x][y]==1) {
						if(end_x == 0 && end_y == 0) { 
							end_x = x;
							end_y = y;
						}
						square_count++;
					}
				}
			}
			tries++;
		}
		console.log(tries+": "+square_count);

		end_dist = 0;
		for(x=0;x<map.length;x++) {
			for(y=0;y<map[x].length;y++) {

				//check if we should move the player here
				var dist = Math.sqrt(((end_x-x)*(end_x-x))+((end_y-y)*(end_y-y)));
				if(dist > end_dist && map[x][y] == 1) {
					//move viewPort to player start location
					vPort.location.z = (y) * canvas.width;
					vPort.location.x = (x) * canvas.width;
					vPort.location.y = 5000;
					end_dist = dist;
					var start_x = x;
					var start_y = y;
				}
			}
		}

		//loop over the map and move the end to the farthest point from the start
		end_dist = 0;
		for(x=0;x<map.length;x++) {
			for(y=0;y<map[x].length;y++) {
				dist = Math.sqrt(((start_x-x)*(start_x-x))+((start_y-y)*(start_y-y)));
				if(dist > end_dist && map[x][y] == 1) {
					end_x = x;
					end_y = y;
					end_dist = dist;
				}
			}
		}


		//loop over the map drawing the walls
		for(x=0;x<map.length;x++) {
			for(y=0;y<map[x].length;y++) {

				//check if we need a floor and ceiling
				var floor = map[x][y]
				if((x==end_x && y==end_y)) {
					floor = 0;
				}
				
				var ceiling = map[x][y];

				//check if we need a left wall
				if(x==0 && map[x][y]==1) {
					var left_wall = 1;
				} else if (x>0 && map[x-1][y] == 0 && map[x][y] == 1) {
					var left_wall = 1;
				} else {
					var left_wall = 0;
				}

				//check if we need a right wall
				if(x==map.length-1 && map[x][y] == 1) {
					var right_wall = 1;
				} else if (x<map.length-1 && map[x+1][y] == 0 && map[x][y] == 1) {
					var right_wall = 1;
				} else {
					var right_wall = 0;
				}

				//check if we need a 'bottom' wall
				if(y==0 && map[x][y] == 1) {
					var bottom_wall = 1;
				} else if (y>0 && map[x][y-1] == 0 && map[x][y] == 1) {
					var bottom_wall = 1;
				} else {
					var bottom_wall = 0;
				}

				//check if we need a right wall
				if(y==map.length-1 && map[x][y] == 1) {
					var top_wall = 1;
				} else if (y<map.length-1 && map[x][y+1] == 0 && map[x][y] == 1) {
					var top_wall = 1;
				} else {
					var top_wall = 0;
				}

				//define details that apply to *ALL* sections in this hallway
				var section = {

					length : canvas.width,
					width : canvas.width,
					height : canvas.height,
					location : new Vertex(x*canvas.width, 0,y*canvas.width),	//y can later be used to make multiple floors
					door_thickness : canvas.width / 10

				};

				//draw the faces we need
				
				if(floor == 1) {

					//create face and hitbox for the floor
				    var cfg = {
				    	ctr : new Vertex(section.location.x, section.location.y-canvas.height/2, section.location.z),
				    	width : section.width,
				    	height : 0,
				    	depth : section.length,
				    	id : "face"+wrld.faces.length,
				    	fill : config.fill.floor,
				    	stroke : config.stroke,
				    	state : 1,
				    	triggerID : "",
				    	triggerCode : ""
				    }
				    wrld.faces[wrld.faces.length] = new Face(cfg);
				    wrld.hitboxes[wrld.hitboxes.length] = new collision_box(cfg);	

				}

				
				if(ceiling == 1) {

					//add ceiling to faces and hitbox
					var cfg = {
						ctr : new Vertex(section.location.x, section.location.y+section.height/2, section.location.z),
						width : section.length,
						height : 0,
						depth : section.width,
						id : "face"+this.faces.length,
						fill : config.fill.ceiling,
						stroke : config.stroke,
						state: 1,
						triggerID : "",
						triggerCode : ""
					}
				    //ceilings add a bunch of polygons so it slows everything WAY down - only adding the hitbox creates a 'false' roof
				    //this.faces[this.faces.length] = new Face(cfg);
				    //this.hitboxes[this.hitboxes.length] = new collision_box(cfg);

				}

				if(left_wall == 1) {

					//add left side of hallway to faces, and add the hitbox to hitboxes
					var cfg = {
						ctr : new Vertex(section.location.x-section.width/2, section.location.y, section.location.z),
						width : 0,
						height : section.height,
						depth : section.length,
						id : "face"+this.faces.length,
						fill : config.fill.ceiling,
						stroke : config.stroke,
						state : 1,
						triggerID : "",
						triggerCode : "",
					}
					this.faces[this.faces.length] = new Face(cfg);
					this.hitboxes[this.hitboxes.length] = new collision_box(cfg);

				}

				if(right_wall == 1) {

					//add right side of hallway to faces, and add the hitbox to hitboxes
					var cfg = {
						ctr : new Vertex(section.location.x+section.width/2, section.location.y, section.location.z),
						width : 0,
						height : section.height,
						depth : section.length,
						id : "face"+this.faces.length,
						fill : config.fill.ceiling,
						stroke : config.stroke,
						state : 1,
						triggerID : "",
						triggerCode : "",
					}
					this.faces[this.faces.length] = new Face(cfg);
					this.hitboxes[this.hitboxes.length] = new collision_box(cfg);
				}

				if(top_wall == 1) {

					//add left side of hallway to faces, and add the hitbox to hitboxes
					var cfg = {
						ctr : new Vertex(section.location.x, section.location.y, section.location.z+section.width/2),
						width : section.length,
						height : section.height,
						depth : 0,
						id : "face"+this.faces.length,
						fill : config.fill.ceiling,
						stroke : config.stroke,
						state : 1,
						triggerID : "",
						triggerCode : "",
					}
					this.faces[this.faces.length] = new Face(cfg);
					this.hitboxes[this.hitboxes.length] = new collision_box(cfg);

				}

				if(bottom_wall == 1) {

					//add right side of hallway to faces, and add the hitbox to hitboxes
					var cfg = {
						ctr : new Vertex(section.location.x, section.location.y, section.location.z-section.width/2),
						width : section.length,
						height : section.height,
						depth : 0,
						id : "face"+this.faces.length,
						fill : config.fill.ceiling,
						stroke : config.stroke,
						state : 1,
						triggerID : "",
						triggerCode : "",
					}
					this.faces[this.faces.length] = new Face(cfg);
					this.hitboxes[this.hitboxes.length] = new collision_box(cfg);

				}
			}
		}

	}; //end of this.random_level() function

};

