/***********************
***    UFO OBJECT    ***
***********************/
class Ufo {
	/** OBJECT VARIABLES **/
	DODGE_DISTANCE = 90;
	SPIN_DISTANCE = 110;
	SPIN_SPEED = 5;
	SWOOP_DISTANCE = 300;
	SWOOP_LASERS = 5;
	height;
	width;
	scale;
	speed;
	health;
	powerFireRate;
	world;
	stage;
	body;
	sprite;
	teleportAnimation;
	teleport;
	fire = false;
  	fastFire = false;
  	powerFire = false;
  	swoopFire = false;
  	swoopMarker = 10;
  	ufoCounter = 1;

	constructor(body, health, speed, powerFire, height, width, scale, world) {
	    this.body = body;
	    this.health = health;
	    this.speed = speed;
	    this.powerFireRate = powerFire;
	    this.height = height;
		this.width = width;
		this.scale = scale;
		this.world = world;

		// Set b2body linear damping and set health as objects userdata
	    this.body.GetBody().SetLinearDamping(0.5);
  		this.body.changeUserData(
	      	"health",
	     	this.health
	    );
  	}

	/*******************************
	***    UFO BEHAVIOUR TREE    ***
	*******************************/
	behaviour = (player, lasers) => {
		let uX = this.getUfoPosX(); // Ufo x position
		let uY = this.getUfoPosY(); // Ufo y position
		let pX = player.GetBody().GetPosition().x * this.scale; // Player x position
		let pY = player.GetBody().GetPosition().y * this.scale; // Player y position
		let distToPlayer = Math.sqrt(((uX - pX)**2)+((uY - pY)**2)); // Calculate the distance between player and ufo
		let playerLasers = 0;

		// Get count of player lasers fired
		for(let i in lasers) {
			if(lasers[i].GetBody().GetUserData().uniquename == "spaceshiplaser") {
				playerLasers++;
			}
		}

		if(distToPlayer < this.SPIN_DISTANCE) { // if close to player - spin attack
			this.setUfoAngularVel(this.SPIN_SPEED);
			this.fastFire = true;
			this.fire = false;
		} else {
			if(this.fastFire == true) { // Turn off spin attack
				this.fastFire = false;
				this.setUfoAngularVel(0);
			}

			this.ufoTrackPlayer(uX, uY, pX, pY); // Track and shoot player

			// Activate power laser at every nth laser
			if(this.ufoCounter % this.powerFireRate == 0) {
				this.powerFire = true; 
			}

			// Swoop attack if great enough distance and few player laser being fired
			if(distToPlayer > this.SWOOP_DISTANCE && playerLasers < this.SWOOP_LASERS) {
				this.swoopFire = true;
			} else { 
				this.ufoDodgeLaser(uX, uY, lasers); // Focus on dodging player lasers
			}
	  	}
	}

	/********************
	***    GETTERS    ***
	********************/
    getCurrentHealth = () => {
    	return this.getBody().GetBody().GetUserData().health;
    }

  	getUfoHealth = () => {
    	return this.health;
    }

    getIsFire = () => {
    	return this.fire;
    }

    getIsFastFire = () => {
    	return this.fastFire;
    }

    getIsSwoopFire = () => {
    	return this.swoopFire;
    }

    getIsPowerFire = () => {
    	return this.powerFire;
    }

    getSwoopMarker = () => {
    	return this.swoopMarker;
    }

    getUfoCounter = () => {
		return this.ufoCounter;
    }

    getUfoLinearVelX = () => {
    	return this.body.GetBody().GetLinearVelocity().x;
    }

    getUfoLinearVelY = () => {
    	return this.body.GetBody().GetLinearVelocity().y;
    }

    getUfoPosX = () => {
    	return this.body.GetBody().GetPosition().x * this.scale;
    }

    getUfoPosY = () => {
    	return this.body.GetBody().GetPosition().y * this.scale;
    }

    getUfoAngle = () => {
    	return this.body.GetBody().GetAngle();
    }

    getUfoWorldPos = () => {
    	return this.body.GetBody().GetWorldCenter();
    }

    getSprite = () => {
    	return this.sprite;
    }

    getBody = () => {
    	return this.body;
    }

    getTeleport = () => {
    	return this.teleport;
    } 

	/********************
	***    SETTERS    ***
	********************/

    setTeleportAnimation = (item) => {
    	this.teleportAnimation = item;
    }

    setSprite = (sprite) => {
    	this.sprite = sprite;
    }

    setHealth = (damage) => {
    	let newHealth = this.getHealth() - damage;
    	this.body.changeUserData("health", newHealth);
    }

    setUfoAngle = (angle) => {
    	this.body.GetBody().SetAngle(angle);
    }

    setUfoLinearVel = (velocity, position) => {
    	this.body.GetBody().SetLinearVelocity(velocity, position);
    }

    setUfoImpulse = (velocity, position) => {
    	this.body.GetBody().ApplyImpulse(velocity, position);
    }

    setUfoAngularVel = (velocity) => {
    	this.body.GetBody().SetAngularVelocity(velocity);
    }

    setIsSwoopFire = (isSwoop) => {
    	this.swoopFire = isSwoop;
    }

    setIsPowerFire = (isPower) => {
    	this.powerFire = isPower;
    }

	setUfoPosition = (x, y) => {
    	this.body.GetBody().SetPosition(new b2Vec2(x/this.scale, y/this.scale));
    }

    setSpritePos = () => {
    	this.sprite.x = this.getUfoPosX();
	    this.sprite.y = this.getUfoPosY();
	    this.sprite.rotation = this.getUfoAngle() * (180 / Math.PI);
    }

    setTeleportPos = () => {
    	this.teleport.x = this.getUfoPosX();
	    this.teleport.y = this.getUfoPosY();
    }

    setTeleport = (item) => {
    	this.teleport = item;
    }

    setStage = (stage) => {
  		this.stage = stage;
  	}

	incrementCounter = () => {
    	this.ufoCounter++;
    }

    decrementSwoopMarker = () => {
    	this.swoopMarker--;
    }

    resetSwoopMarker = () => {
    	this.swoopMarker = 10;
    }

	// Remove health points from ufo body data
	damage = (damage) => {
		let newHealth = this.getBody().GetBody().GetUserData().health - damage;
		
	  	// Set to zero if less than zero
		if (newHealth <= 0) {
			this.body.changeUserData("health", 0);
		} else {
			this.body.changeUserData("health", newHealth);
		}
	}

	/*************************
	***    UFO TELEPORT    ***
	*************************/
  	teleportUfo = () => {
		// Generate random coordinates to teleport to
		let x = Math.random() * this.width;
		let y = Math.random() * this.height;

		// Play teleport audio
		$('#teleport')[0].currentTime=0;
    	$('#teleport')[0].play();

		// Create sprite for teleport animation and add to stage
    	this.teleport = new createjs.Sprite(this.teleportAnimation, "teleport");
    	this.teleport.x = this.getBody().GetBody().GetPosition().x * this.scale;
    	this.teleport.y = this.getBody().GetBody().GetPosition().y * this.scale;
    	this.stage.addChild(this.getTeleport());

		// Set the ufo position to random coordinates
  		this.setUfoPosition(x, y);
  	}
	
	/************************************
	***    UFO DODGE PLAYER LASERS    ***
	************************************/
  	ufoDodgeLaser = (uX, uY, lasers) => {
		for(let i in lasers) { 
	      	if(lasers[i].GetBody().GetUserData().uniquename == "spaceshiplaser") {
		        let lX = lasers[i].GetBody().GetPosition().x * this.scale; // x position of laser
		        let lY = lasers[i].GetBody().GetPosition().y * this.scale; // y position of laser
		        let distToL = Math.sqrt(((uX - lX)**2)+((uY - lY)**2)); // calculate distance between laser and ufo

				// Dodge laser if close to ufo
		        if(distToL < this.DODGE_DISTANCE) { 
			        let xVelocity, yVelocity;
					// Get current linear velocity
			        let prevXVelocity = Math.abs(this.getUfoLinearVelX());
			        let prevYVelocity = Math.abs(this.getUfoLinearVelY());

					// if laser x greater than ufo then negative x for dodge
			        if(lX > uX) {
			            xVelocity = this.speed;
			        } else {
			            xVelocity = -this.speed;
			        }

					// if laser y greater than ufo then negative y for dodge
			        if(lY > uY) {
			        	yVelocity = -this.speed;
			        } else {
			            yVelocity = this.speed;
			        }

					// Turn off x velocity if against left or right border and y off for top and bottom
			        if((uX < this.width * 0.15) || (uX > this.width * 0.85)) { 
			            xVelocity = 0;
			        } else if((uY < this.height * 0.15) || (uY > this.height * 0.85)) {
			            yVelocity = 0;
			        }
			          
					// Apply impulse to dodge and use a set linear velocity for setting max speed
			        if(prevXVelocity >= this.speed || prevYVelocity >= this.speed) {
			            this.setUfoLinearVel(new b2Vec2(xVelocity, yVelocity), this.getUfoWorldPos());
			        } else {
			            this.setUfoImpulse(new b2Vec2(xVelocity, yVelocity), this.getUfoWorldPos());
			        }

		        }
	      	}
	    }
  	}

  	/***********************************
	***    TRACK AND SHOOT PLAYER    ***
	***********************************/
  	ufoTrackPlayer = (uX, uY, pX, pY) => {
		let playerAngle = Math.atan2((pY - uY), (pX - uX)) * (180/Math.PI); // Get angle from ufo to player and convert to degrees
	    let ufoAngle = this.getUfoAngle() * (180/Math.PI); //Get ufo current angle in degrees

		// Convert angles to be in 0 to 360 degree range
	    if(playerAngle < 0) {
	      	playerAngle += 360;
	    } else if(playerAngle >= 360) {
	      	playerAngle -= 360;
	    }
	    if(ufoAngle < 0) {
	      	ufoAngle += 360;
	    } else if(ufoAngle >= 360) {
	      	ufoAngle -= 360;
	    }

		// If ufo facing player then shoot
	  	if(ufoAngle > playerAngle - 5 && ufoAngle < playerAngle + 5) { 
	  	  	this.setUfoAngularVel(0);
	  	  	this.fire = true;
	  	} else { 
	  		this.fire = false; 
	  	}
	  	
		// If ufo angle doesnt match then turn shortest route to point at player
  		if((ufoAngle < playerAngle && ufoAngle > playerAngle - 180) || ufoAngle > playerAngle+180) { 
  	  		this.setUfoAngularVel(this.speed);
  		} else {
	  	  	this.setUfoAngularVel(-this.speed);
  		} 
  	}
}