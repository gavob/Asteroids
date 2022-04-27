/************************
***    GAME OBJECT    ***
************************/
class Game {
	/** OBJECT VARIABLES **/
	// Game configuration variables
	config;
	height;
	width;
	scale;
	gravity;
	framerate;
	b2dcanvas;
	b2dctx;
	intervals = [];
	// Game state
	start = true;
	pause = true;
	// Game body handlers
	destroylist = [];
	teleport = [];
	// Game bodies
	borders = []; 
	asteroids;
	player;
	ufo;
	laserlist = [];
	//EaselJS variables
	easelCan; 
	easelctx; 
	loader; 
	stage; 
	stageheight; 
	stagewidth;
	eBackground;
	eExplosion;
	eLasers = [];    
	eExplosions = []; 

	constructor(height, width, scale, gx, gy, framerate, canvasname, level) {
		this.height = height;
		this.width = width;
		this.scale = scale;
		this.gravity = new b2Vec2(gx, gy);
		this.framerate = framerate;
		this.b2dcanvas = document.getElementById(canvasname);
		this.b2dctx = this.b2dcanvas.getContext("2d");
		this.world = new b2World(this.gravity, true); 
		this.config = new Config(level);
	}

	/**************************************
	***    INITIALISE EASELJS CANVAS    ***
	**************************************/
  	init = () => {
		this.easelCan=document.getElementById("easelcan");
		this.easelctx=this.easelCan.getContext("2d");
		this.stage = new createjs.Stage(this.easelCan);
		this.stage.snapPixelsEnabled=true;
		this.stagewidth = this.stage.canvas.width;
		this.stageheight = this.stage.canvas.height;

		// Link sprites to images stored on server
		var manifest = [
			{src:"background.png", id:"background"},
			{src:"spaceship.png", id:"spaceship"},
			{src:"ufo.png", id:"ufo"},
			{src:"laser.png", id:"spaceshiplaser"},
			{src:"asteroid.png", id:"asteroid"},
			{src:"explosionframes.png", id:"explode"},
			{src:"ufolaser.png", id:"ufolaser"},
			{src:"ufopowerlaser.png", id:"ufopowerlaser"},
			{src:"teleport.png", id:"teleportframes"}
		];

		// Create loader for retrieving and storing images
		this.loader = new createjs.LoadQueue(false);
		this.loader.addEventListener("complete", this.handleComplete);
		this.loader.loadManifest(manifest, true, "./images/");

		// Debug Draw
		let b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
		let debugDraw = new b2DebugDraw();
		debugDraw.SetSprite(this.b2dctx);
		debugDraw.SetDrawScale(this.scale);
		debugDraw.SetFillAlpha(0.3);
		debugDraw.SetLineThickness(1.0);
		debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
		this.world.SetDebugDraw(debugDraw);
  	};

	/***********************************
	***    CREATE EASELJS SPRITES    ***
	***********************************/
  	handleComplete = () => {
		// Create background sprite
		this.eBackground = this.makeBitmap(this.loader.getResult("background"), this.stagewidth, this.stageheight);
		this.eBackground.x = 0;
		this.eBackground.y = 0;
		
		// Create player sprite
		let playerSprite = this.makeBitmap(this.loader.getResult("spaceship"), 30, 30);
		playerSprite.x = this.stagewidth/2;
		playerSprite.y = this.stageheight/2;
		this.player.setSprite(playerSprite);

		// Create ufo sprite
		let ufoSprite = this.makeBitmap(this.loader.getResult("ufo"), 30, 30);
		ufoSprite.x = this.stagewidth/2;
		ufoSprite.y = this.stageheight/2;
		this.ufo.setSprite(ufoSprite);

		this.stage.addChild(this.eBackground, this.player.getSprite(), this.ufo.getSprite());

		// Create animations using spritesheet images
		this.asteroids.addAnimation(new createjs.SpriteSheet({
			framerate: 30,
			"images": [this.loader.getResult("asteroid")],
			"frames": {
				"regX": 42, "regY": 50,
				"width": 85, "height": 100,
				"count": 30
			},
			"animations": {
				"stand": [0, 29, "stand", 0.5]
			}
		})); 
		this.ufo.setTeleportAnimation(new createjs.SpriteSheet({
			framerate: 30,
			"images": [this.loader.getResult("teleportframes")],
			"frames": {
				"regX": 86, "regY": 86,
				"width": 192, "height": 192,
				"count": 35
			},
			"animations": {
				"teleport": [0, 34, false, 1]
			}
		}));
		this.eExplosion = (new createjs.SpriteSheet({
			framerate: 30,
			"images": [this.loader.getResult("explode")],
			"frames": {
				"regX": 82, "regY": 60,
				"width": 122, "height": 118,
				"count": 20,
				"margin": 4
			},
			"animations": {
				"explode": [0, 19, false, 1]
			}
		}));

		this.asteroids.setStage(this.stage);
		this.ufo.setStage(this.stage);

		// Create sprite for every asteroid
		for(var i in this.asteroids.getAsteroids()) {
			this.asteroids.addAsteroidSprite(new createjs.Sprite(this.asteroids.getAnimation(), "stand"));
			this.asteroids.getAsteroidSprites()[this.asteroids.getAsteroidSprites().length-1].scaleX=0.75;
			this.asteroids.getAsteroidSprites()[this.asteroids.getAsteroidSprites().length-1].scaleY=0.75;
			this.stage.addChild(this.asteroids.getAsteroidSprites()[this.asteroids.getAsteroidSprites().length-1]);
		}

		// Create tick function which will call at framerate to update game display every tick
		createjs.Ticker.framerate = 60;
		createjs.Ticker.timingMode = createjs.Ticker.RAF;
		createjs.Ticker.addEventListener("tick", this.tick);
  	}

	// Tick called every frame to call updates
	tick = (e) => {
		if(!this.pause) {
			this.update();
			this.stage.update(e);
		}
	}
	
	/************************
	***    FRAME UPDATE   ***
	************************/
  	update = () => {
    	this.world.Step(
			1 / this.framerate, // framerate
			10, // velocity iterations
			10 // position iterations
   		);
		
		// Set asteroid sprites to asteroid b2 bodies
    	this.asteroids.setSpritePos();

		// Set laser sprites to laser b2 bodies
		for(let i in this.eLasers) {
			this.eLasers[i].x = this.laserlist[i].GetBody().GetPosition().x * this.scale;
			this.eLasers[i].y = this.laserlist[i].GetBody().GetPosition().y * this.scale;
		}

		// Set player and ufo sprites to their b2 bodies
    	if(this.player) {
			this.player.setSpritePos()
			this.ufo.setSpritePos();
			// keep ufo angle in normal radian range
      		if(this.ufo.getUfoAngle() >= 6.283) {
        		this.ufo.setUfoAngle(0);
      		} else if(this.ufo.getUfoAngle() <= 0) {
        		this.ufo.setUfoAngle(6.28);
      		}
    	}

		// Set teleport sprite to ufo and remove it if completed its animation
    	if(this.ufo.getTeleport()) {
      		this.ufo.setTeleportPos();
      		if(this.ufo.getTeleport().paused) {
        		this.stage.removeChild(this.teleport);
        		this.ufo.setTeleport(null);
      		}
    	}
    
		// Call other updates
		this.gameLogic();
		this.world.DrawDebugData();
		this.world.ClearForces();
		this.destroyList();
  	};

	gameLogic = () => { };

	/*************************************
	***    GAME ARRAY ADD FUNCTIONS    ***
	*************************************/
  	addInterval = (item) => {
    	this.intervals.push(item);
  	};

	addItem = (item) => {
		this.borders.push(item);
	};

	addLaser = (item) => {
		this.laserlist.push(item);
	};

	addELaser = (item) => {
		this.eLasers.push(item);
	};

	addExplosion = (item) => {
		this.eExplosions.push(item);
	};

	addTeleport = (item) => {
		this.teleport.push(item);
	};

	// Destroy all objects in destory list
	destroyList = () => {
		for (let i in this.destroylist) {
			this.world.DestroyBody(this.destroylist[i]);
		}
		this.destroylist.length = 0;
	};

	/********************************
	***    CREATE GAME OBJECTS    ***
	********************************/
  	createObjects = () => {
		// Retrieve collision categories
		let BORDER = this.config.getCollisionCategory(0);
		let PLAYER = this.config.getCollisionCategory(1);
		let LASER = this.config.getCollisionCategory(2);
		let ASTEROID = this.config.getCollisionCategory(3);
		let UFO = this.config.getCollisionCategory(4);
		let UFO_LASER = this.config.getCollisionCategory(5);
		
		// Create borders
		this.addItem(
			new defineSB(1.0, 0.5, 0.2, 400, 610, 400, 1, // object physical properties
				"border", "bottom", // id and unique name
				0,  // angle
				BORDER, PLAYER|LASER|ASTEROID|UFO|UFO_LASER, // collision categories
				this.scale, this.world) 
		);
		this.addItem(
			new defineSB(1.0, 0.5, 0.2, 400, -10, 400, 1, // object physical properties
				"border", "top",  // id and unique name
				0, // angle
				BORDER, PLAYER|LASER|ASTEROID|UFO|UFO_LASER, // collision categories
				this.scale, this.world)
		);
		this.addItem(
			new defineSB(1.0, 0.5, 0.2, -10, 300, 1, 300, // object physical properties
				"border", "left", // id and unique name
				0, // angle
				BORDER, PLAYER|LASER|ASTEROID|UFO|UFO_LASER, // collision categories
				this.scale, this.world)
		);
		this.addItem(
			new defineSB(1.0, 0.5, 0.2, 810, 300, 1, 300, // object physical properties
				"border", "right", // id and unique name 
				0, // angle
				BORDER, PLAYER|LASER|ASTEROID|UFO|UFO_LASER, // collision categories
				this.scale, this.world)
		);

		// create player b2body
		let playerBody = new defineDB(1.0, 0.5, 0.1, 70, 520, 20, 25, // object physical properties
			"spaceship", "spaceship", // id and unique name 
			0, // angle
			PLAYER, BORDER|ASTEROID|UFO|UFO_LASER, // collision categories
			this.scale, this.world
		);
		// create player object
		this.player = new Player(1000, playerBody, this.scale);

		//create ufo b2body
		let ufoBody = new defineDB(1.0, 0.5, 0.1, 400, 200, 25, 25, // object physical properties
			"ufo", "ufo",  // id and unique name 
			0, // angle
			UFO, BORDER|PLAYER|LASER, // collision categories
			this.scale, this.world
		);
		// create ufo object
		this.ufo = new Ufo(ufoBody, this.config.getUfoHealth(), 
			this.config.getUfoSpeed(), 
			this.config.getUfoPowerFireRate(), 
			this.height, this.width, this.scale, this.world, this.stage
		);
		
		// Create asteroid objects
		this.asteroids = new Asteroids(this.config.getAsteroidSpeed(), 
			this.scale, this.world
		);
		
		for(let i=0; i<this.config.getAsteroidCount(); i++) {
			// Set random starting position for each asteroid
			let xPos = Math.random() * (750 - (400)) + (400);
			let yPos = Math.random() * (500 - (100)) + (100);

			// Create asteroid
			let asteroid = new defineDCB(
				1.0, 0.5, 0.1, xPos, yPos, 25, // object physical properties
				"asteroid", "asteroid", // id and unique name 
				ASTEROID, LASER|PLAYER|BORDER|UFO_LASER, // collision categories
				this.scale, this.world
			);
			
			// Add asteroid to asteroids object
			this.asteroids.addAsteroid(asteroid);
		}
  	}

	// Helper function for creating easeljs sprites which set rotaion point to center
  	makeBitmap(ldrimg, b2x, b2y) {
		var theimage = new createjs.Bitmap(ldrimg);
		var scalex = (b2x*2)/theimage.image.naturalWidth;
		var scaley = (b2y*2)/theimage.image.naturalHeight;
		theimage.scaleX = scalex;
		theimage.scaleY = scaley;
		theimage.regX = theimage.image.width/2;
		theimage.regY = theimage.image.height/2;
		return theimage;
  	}
}

/**************************
***    GAME SUB-CLASS   ***
**************************/
class AGame extends Game {
  score = 0; // Game score starts at 0
  
	// Destroy any objects queued for destruction
  	destroyList = () => {
		// Remove any finished explosions
		for(var i in this.eExplosions) { 
			if(this.eExplosions[i].paused) {
				this.stage.removeChild(this.eExplosions[i]);
				this.eExplosions.splice(i,1);
			}
		}

		for (let i in this.destroylist) {
			// Adjust laser arrays for deleted lasers
			if (this.destroylist[i].GetUserData().id == "laser") {
				for(let j in this.laserlist) {
					if(this.laserlist[j].GetBody() == this.destroylist[i]) { 
						this.stage.removeChild(this.eLasers[j]);
						this.eLasers.splice(j,1);
						this.laserlist.splice(j,1);
					}
				}
			}
			
			// Delete any asteroids and adjust asteroid objects array
			if (this.destroylist[i].GetUserData().id == "asteroid") {
				for(let j in this.asteroids.getAsteroids()) {
					if(this.asteroids.getAsteroid(j).GetBody() == this.destroylist[i]) { 
						this.explodeObject(this.asteroids.getAsteroid(j));
						this.stage.removeChild(this.asteroids.getAsteroidSprite(j));
						this.asteroids.getAsteroidSprites().splice(j,1);
						this.asteroids.getAsteroids().splice(j,1);
					}
				}
			}
			
			// Destroy ufo or player
			if(this.destroylist[i].GetUserData().id == "ufo") {
				this.explodeObject(this.ufo.getBody());
				this.stage.removeChild(this.ufo.getSprite());
			} else if(this.destroylist[i].GetUserData().id == "spaceship") {
				this.explodeObject(this.player.getBody());
				this.stage.removeChild(this.player.getSprite());
			}

			this.world.DestroyBody(this.destroylist[i]);
		}
		this.destroylist.length = 0;
  	};

	/**********************
	***    GAME LOGIC   ***
	**********************/
  	gameLogic = () => {
		// If games first update beginning then run these functions
    	if(this.start) {
			this.asteroids.pushAsteroids();
			this.start = false;
			// these impulses of 0 force prevent a bug where ufo and player do not move without and initial force (possibly due to lack of gravity)
			this.player.setPlayerImpulse(new b2Vec2(0, 0), this.player.getPlayerWorldPos()); 
			this.ufo.setUfoImpulse(new b2Vec2(0, 0), this.ufo.getUfoWorldPos());
			// Set initial zero score to game hud display
			$("#score").html(this.score); 
    	}
		
		// if player tries to fire laser then make laser
    	if(this.player.getIsFireLaser()) {
			this.player.setIsFireLaser(false);
			this.makeLaser(this.player.getBody(), this.player.getPlayerAngle());
    	}

		// Check for asteroids that are in teleport array and set their position to oppsite side of screen with their same velocity
    	for(var i in this.teleport) {
			let xVec = this.teleport[i][0].GetBody().GetLinearVelocity().x;
			let yVec = this.teleport[i][0].GetBody().GetLinearVelocity().y;

      		switch(this.teleport[i][1]) {
        		case "top":
					this.teleport[i][0].GetBody().SetPosition(new b2Vec2(this.teleport[i][0].GetBody().GetPosition().x, 570/this.scale));
					this.teleport[i][0].GetBody().SetLinearVelocity(new b2Vec2(xVec, -Math.abs(yVec)), this.teleport[i][0].GetBody().GetWorldCenter());
					break;
        		case "bottom":
					this.teleport[i][0].GetBody().SetPosition(new b2Vec2(this.teleport[i][0].GetBody().GetPosition().x, 30/this.scale));
					this.teleport[i][0].GetBody().SetLinearVelocity(new b2Vec2(xVec, Math.abs(yVec)), this.teleport[i][0].GetBody().GetWorldCenter());
					break;
        		case "left":
					this.teleport[i][0].GetBody().SetPosition(new b2Vec2(770/this.scale,this.teleport[i][0].GetBody().GetPosition().y));
					this.teleport[i][0].GetBody().SetLinearVelocity(new b2Vec2(-Math.abs(xVec), yVec), this.teleport[i][0].GetBody().GetWorldCenter());
					break;
        		case "right":
					this.teleport[i][0].GetBody().SetPosition(new b2Vec2(30/this.scale,this.teleport[i][0].GetBody().GetPosition().y));
					this.teleport[i][0].GetBody().SetLinearVelocity(new b2Vec2(Math.abs(xVec), yVec), this.teleport[i][0].GetBody().GetWorldCenter());
					break;
        		default:
          			console.log("border error");
      		}
    	}
		// reset teleport list to empty
    	this.teleport.length=0;
		
		// Call ufo behavior tree
	  	this.ufo.behaviour(this.player.getBody(), this.laserlist);
  	}
  
	/**************************
	***    GAME INTERVAlS   ***
	**************************/
  	setIntervals = () => { 
		// Ufo normal shooting interval
		this.addInterval(setInterval(function() {
			if(mygame.ufo.getIsFire() == true && mygame.pause == false) {
				let ufoAngle = mygame.ufo.getUfoAngle(); // Ufo angle to shoot

				mygame.ufo.incrementCounter();
				mygame.makeLaser(mygame.ufo.getBody(),ufoAngle); // create laser
			}
		}, mygame.config.getUfoFireRate())); 
		// Ufo fast fire shooting interval
	  	this.addInterval(setInterval(function() {
      		if(mygame.ufo.getIsFastFire() == true && mygame.pause == false) { 
				let ufoAngle = mygame.ufo.getUfoAngle(); // Ufo angle to shoot
			
				mygame.ufo.incrementCounter();
				mygame.makeLaser(mygame.ufo.getBody(),ufoAngle); // create laser
      		}
    	}, mygame.config.getUfoFastFireRate()));
		// Ufo swoop interval
		this.addInterval(setInterval(function() {
			if((mygame.ufo.getIsFire() && mygame.ufo.getIsSwoopFire() == true) && mygame.pause == false) {
				// if swoop has run for 10 steps then reset 
				if(mygame.ufo.getSwoopMarker() == 0) {
					mygame.ufo.resetSwoopMarker();
					mygame.ufo.setIsSwoopFire(false);
				}

				// Get speed and direction then apply linear velocity
				let velocity = mygame.config.getUfoSwoopSpeed();  
				let angle = mygame.ufo.getUfoAngle(); 
				let xVec = Math.cos(angle) * velocity;
				let yVec = Math.sin(angle) * velocity;
				mygame.ufo.setUfoLinearVel(new b2Vec2(xVec, yVec), mygame.ufo.getUfoWorldPos());
				mygame.ufo.decrementSwoopMarker();
			}
		}, 50));

		// Teleport ufo at every interval
		this.addInterval(setInterval(function() {
			if(mygame.pause == false) {
				mygame.ufo.teleportUfo();
			}
		}, mygame.config.getTeleportRate()));
  	}

	/*************************
	***   EXPLODE OBJECT   ***
	*************************/
  	explodeObject = (object) => {
		// Play explosion audio
		$('#explode')[0].currentTime=0;
		$('#explode')[0].play();

		// If exploding an asteroid, then retrieve that asteroid and split it if large enough
		if(object.GetBody().GetUserData().id == "asteroid") {
      		let scaleX, scaleY;
			for(let i in this.asteroids.getAsteroids()) {
				if(this.asteroids.getAsteroid(i).GetBody() == object.GetBody()) {
					if(this.asteroids.getAsteroidSprite(i).scaleX==0.75) {
						this.asteroids.splitAsteroid(i,0.5,2);
					} else if(this.asteroids.getAsteroidSprite(i).scaleX==0.5) {
						this.asteroids.splitAsteroid(i,0.25,2);
					}
				}
			}
    	}

		// Create explosion sprite and add to stage
		this.addExplosion(new createjs.Sprite(this.eExplosion, "explode"));
		this.eExplosions[this.eExplosions.length - 1].x = object.GetBody().GetPosition().x * this.scale;
		this.eExplosions[this.eExplosions.length - 1].y = object.GetBody().GetPosition().y * this.scale;
		this.stage.addChild(this.eExplosions[this.eExplosions.length - 1]);
  	}

	/***********************
	***   CREATE LASER   ***
	***********************/
  	makeLaser = (shooter, angle) => {
		let target, category, xScale, yScale, uniquename, eLaser;
		let shooterId = shooter.GetBody().GetUserData().id;
		let velocity = (shooterId == "ufo") ? this.config.getUfoLaserSpeed() : 7; // Ufo uses level laser speed
		let xVec = Math.cos(angle) * velocity; // Get x velocity
		let yVec = Math.sin(angle) * velocity; // Get y velocity
      
		// Set collision categories according to who shot the laser
  		if(shooterId == "spaceship") {
			target = 16;
			category = 4;
      	} else {
			target = 2;
			category = 32;
      	}
  	
		// If ufo power laser being fired then different unique name and scale
  		if(this.ufo.getIsPowerFire() && shooterId == "ufo") {
			xScale = 20;
			yScale = 6;
			uniquename = "ufopowerlaser";
			eLaser = this.makeBitmap(this.loader.getResult(uniquename), 20, 6);
  		} else { 
			xScale = 15;
			yScale = 4;
			uniquename = shooterId + "laser";
			eLaser = this.makeBitmap(this.loader.getResult(uniquename), 15, 3);
  		}

		// Create laser b2body
      	let laser = new defineDB(1.0,0.1,0.1,
			shooter.GetBody().GetWorldCenter().x*this.scale,
			shooter.GetBody().GetWorldCenter().y*this.scale,
			xScale, yScale,
			"laser", uniquename,
			shooter.GetBody().GetAngle(),
			category,1|8|target,
			this.scale,this.world
      	);
  	
		// Play laser audio for laser type
  		if(this.ufo.getIsPowerFire() && shooterId == "ufo") {
			this.ufo.setIsPowerFire(false);
			$('#ufopowerlaser')[0].currentTime=0;
			$('#ufopowerlaser')[0].play();
  		} else if(shooterId == "ufo") {
			$('#ufolaser')[0].currentTime=0;
			$('#ufolaser')[0].play();
  		} else { 
			$('#playerlaser')[0].currentTime=0;
			$('#playerlaser')[0].play();
  		}

		// Set trajectory and speed of laser
		laser.GetBody().SetLinearVelocity(new b2Vec2(xVec, yVec), laser.GetBody().GetWorldCenter());
		this.addLaser(laser);
		  
		// Set laser sprite to its b2body
		eLaser.x = laser.GetBody().GetPosition().x*this.scale;
		eLaser.y = laser.GetBody().GetPosition().y*this.scale;
		eLaser.rotation = laser.GetBody().GetAngle()*(180/Math.PI);
		this.stage.addChild(eLaser);
		this.addELaser(eLaser);
  	};
}