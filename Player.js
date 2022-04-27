/**************************
***    PLAYER OBJECT    ***
**************************/
class Player {
	/** OBJECT VARIABLES **/
	SPEED = 5;
	MAXSPEED = 7;
	ANGULAR_SPEED = 1;
	ANGULAR_MAX = 3;
	scale;
	world;
	body;
	health;
	sprite;
	fireLaser = false;
	laserFired = false;
	keyhandler = [];

	constructor(health, body, scale) {
		this.health = health;
	    this.body = body;
		this.scale = scale;

		// Set b2body linear damping and set health as objects userdata
	    this.body.GetBody().SetLinearDamping(0.5);
  		this.body.changeUserData(
	      	"health",
	     	this.health
	    );
  	}

	/********************
	***    GETTERS    ***
	********************/
    getCurrentHealth = () => {
    	return this.getBody().GetBody().GetUserData().health;
    }

  	getPlayerHealth = () => {
    	return this.health;
    }

  	getPlayerPosX = () => {
    	return this.body.GetBody().GetPosition().x * this.scale;
    }

    getPlayerPosY = () => {
    	return this.body.GetBody().GetPosition().y * this.scale;
    }

  	getBody = () => {
    	return this.body;
    }

  	getIsFireLaser = () => {
    	return this.fireLaser;
    }

    getPlayerAngle = () => {
    	return this.body.GetBody().GetAngle();
    }

    getSprite = () => {
    	return this.sprite;
    }

    getPlayerWorldPos = () => {
    	return this.body.GetBody().GetWorldCenter();
    }

	/********************
	***    SETTERS    ***
	********************/
    setPlayerImpulse = (velocity, position) => {
    	this.body.GetBody().ApplyImpulse(velocity, position);
    }

    setIsFireLaser = (fireLaser) => {
    	this.fireLaser = fireLaser;
    }

    setSprite = (sprite) => {
    	this.sprite = sprite;
    }

    setSpritePos = () => {
    	this.sprite.x = this.getPlayerPosX();
	    this.sprite.y = this.getPlayerPosY();
	    this.sprite.rotation = this.getPlayerAngle() * (180 / Math.PI);
    }

	// Remove health points from player body data
	damage = (damage) => {
		let newHealth = this.getBody().GetBody().GetUserData().health - damage;
		
		// Set to zero if less than zero
		if (newHealth <= 0) {
			this.body.changeUserData("health", 0);
		} else {
			this.body.changeUserData("health", newHealth);
		}
	}

	addKeyHandler(type, runfunc) {
		this.keyhandler.push(new keyHandler(type, runfunc));
	}

	/****************************
	***    PLAYER CONTROLS    ***
	****************************/
    handleKeyDown = (e) => { 
	    let angle = this.body.GetBody().GetAngle(); // current body angle in radians.
	    let xVec = Math.cos(angle) * this.SPEED; // x velocity for current angle 
	    let yVec = Math.sin(angle) * this.SPEED; // y velocity for current angle 
	    let maxXVec = Math.cos(angle) * this.MAXSPEED; // max x velocity for current angle 
	    let maxYVec = Math.sin(angle) * this.MAXSPEED; // max y velocity for current angle 
		let currentXVel = Math.abs(this.body.GetBody().GetLinearVelocity().x); // current x velocity for current angle
		let currentYVel = Math.abs(this.body.GetBody().GetLinearVelocity().y); // current y velocity for current angle

		// If up or w key pressed use forward impulse with set max velocity
	    if(e.keyCode == 87 || e.keyCode == 38) {
			if(currentXVel > Math.abs(maxXVec) || currentYVel > Math.abs(maxYVec)) {
				this.body.GetBody().SetLinearVelocity(new b2Vec2(maxXVec, maxYVec), this.body.GetBody().GetWorldCenter());
			} else {
				this.body.GetBody().ApplyImpulse(new b2Vec2(xVec, yVec), this.body.GetBody().GetWorldCenter());
			}
	    }
		// If down or s key pressed use forward impulse with set max velocity
	    if(e.keyCode == 83 || e.keyCode == 40) {
			if(currentXVel > Math.abs(maxXVec) || currentYVel > Math.abs(maxYVec)) {
				this.body.GetBody().SetLinearVelocity(new b2Vec2(-maxXVec, -maxYVec), this.body.GetBody().GetWorldCenter());
			} else {
				this.body.GetBody().ApplyImpulse(new b2Vec2(-xVec, -yVec), this.body.GetBody().GetWorldCenter());
			}
	    }
		// If left or a key pressed use angular velocity incrementing up untill set max
	    if(e.keyCode == 65 || e.keyCode == 37) {
	        var av = this.body.GetBody().GetAngularVelocity();
	        if(av > -this.ANGULAR_MAX) {
	        	this.body.GetBody().SetAngularVelocity(av - this.ANGULAR_SPEED); 
	        } else {
	        	this.body.GetBody().SetAngularVelocity(-this.ANGULAR_MAX);  
	        }
		    this.body.GetBody().SetAngularDamping(0);
	    }
	    if(e.keyCode == 68 || e.keyCode == 39) {
		    var av = this.body.GetBody().GetAngularVelocity();
		    if(av < this.ANGULAR_MAX) {
		        this.body.GetBody().SetAngularVelocity(av + this.ANGULAR_SPEED); 
		    } else {
		    	this.body.GetBody().SetAngularVelocity(this.ANGULAR_MAX); 
		    }
			this.body.GetBody().SetAngularDamping(0);
	    }
		// If space bar pressed then fire laser
	    if(e.keyCode == 32) { 
			if(this.laserFired == false) {
				this.fireLaser = true;
				this.laserFired = true;
			}
	    }
  	};

  	handleKeyUp = (e) => {
		// Set angular damping after releasing left or right turning 
		if((e.keyCode == 65 || e.keyCode == 37) || (e.keyCode == 68 || e.keyCode == 39)) {
      		this.body.GetBody().SetAngularDamping(4);
    	}

		// Ready to fire another laser after releasing space bar
		if(e.keyCode == 32) { 
		  	this.laserFired = false;
	  	}
  	};
}