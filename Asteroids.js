/****************************
***    ASTEROID OBJECT    ***
****************************/
class Asteroids {
	/** OBJECT VARIABLES **/
	ASTEROID_HEALTH = 100;
	world;
	stage;
	scale;
	speed;
	asteroids = [];
	asteroidSprites = [];
	asteroidAnimation;

	constructor(speed, scale, world) {
		this.speed = speed;
		this.scale = scale;
		this.world = world;
  	}

	/***************************
	***    PUSH ASTEROIDS    ***
	***************************/
  	pushAsteroids = () => {
	    let xVel, yVel;

		// For each asteroid create a random velocity vector and apply to asteroid
	    for(let i in this.asteroids) {
		    xVel = Math.random() * (this.speed - (-this.speed)) + (-this.speed);
		    yVel = Math.random() * (this.speed - (-this.speed)) + (-this.speed);
		    this.asteroids[i].GetBody().SetLinearVelocity(new b2Vec2(xVel, yVel), this.asteroids[i].GetBody().GetWorldCenter());
	    }
  	}

	/***************************
	***    SPLIT ASTEROID    ***
	***************************/
  	splitAsteroid = (index, escale, num) => {
	    for(let i=0; i<num; i++) {
			// Create b2body for asteroid and add to class array
	        this.addAsteroid(
		      	new defineDCB(1.0, 0.5, 0.1, 
		        this.getAsteroid(index).GetBody().GetPosition().x * this.scale,
		        this.getAsteroid(index).GetBody().GetPosition().y * this.scale, 
		        (this.getAsteroid(index).GetBody().m_fixtureList.m_shape.m_radius * this.scale) * 0.66, 
		        "asteroid", "asteroid", 
		        8, 4|2|1, 
		        this.scale, this.world)
	        );
			
			// Create sprite using animation frames and add to stage
	        this.addAsteroidSprite(new createjs.Sprite(this.getAnimation(), "stand"));
	        this.getAsteroidSprite(this.asteroidSprites.length-1).scaleX = escale;
	        this.getAsteroidSprite(this.asteroidSprites.length-1).scaleY = escale;
	        this.stage.addChild(this.getAsteroidSprite(this.asteroidSprites.length-1));

			// Create and apply random direction and force for asteroid
	        let xVec = Math.random() * (this.speed - (-this.speed)) + (-this.speed);
	        let yVec = Math.random() * (this.speed - (-this.speed)) + (-this.speed);
	        this.asteroids[this.asteroids.length - 1].GetBody().SetLinearVelocity(new b2Vec2(xVec, yVec), this.asteroids[this.asteroids.length - 1].GetBody().GetWorldCenter());
	    }
  	}

	/********************
	***    GETTERS    ***
	********************/
	getCurrentHealth = (index) => {
    	return this.asteroids[index].GetBody().GetUserData().health;
    }

  	getAsteroids = () => {
  		return this.asteroids;
  	}

  	getAsteroid = (index) => {
  		return this.asteroids[index];
  	}

  	getAsteroidSprites = () => {
  		return this.asteroidSprites;
  	}

  	getAsteroidSprite = (index) => {
  		return this.asteroidSprites[index];
  	}

  	getAnimation = () => {
  		return this.animation;
  	}

	/********************
	***    SETTERS    ***
	********************/

  	setStage = (stage) => {
  		this.stage = stage;
  	} 

  	setSpritePos = () => {
  		for(let i in this.asteroidSprites) {
	       this.asteroidSprites[i].x = this.asteroids[i].GetBody().GetPosition().x * this.scale;
	       this.asteroidSprites[i].y = this.asteroids[i].GetBody().GetPosition().y * this.scale;
	       this.asteroidSprites[i].rotation = this.asteroids[i].GetBody().GetAngle() * (180/Math.PI);
	    }
  	}

	// Remove health points from an asteroid body data
	damageAsteroid = (damage, index) => {
		let newHealth = this.asteroids[index].GetBody().GetUserData().health - damage;
		
	  // Set to zero if less than zero
		if (newHealth <= 0) {
			this.asteroids[index].changeUserData("health", 0);
		} else {
			this.asteroids[index].changeUserData("health", newHealth);
		}
	}

	addAnimation = (animation) => {
		this.animation = animation;
	}

	addAsteroid = (body) => {
		// Set health of every asteroid added to object array
		body.changeUserData(
		 	"health",
			this.ASTEROID_HEALTH
	  	);
	  	this.asteroids.push(body);
	}

	addAsteroidSprite = (sprite) => {
	  this.asteroidSprites.push(sprite);
	};
  	
}