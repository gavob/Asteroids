/*************************************
***   LEVEL CONFIGURATION OBJECT   ***
*************************************/
class Config {
    /** OBJECT VARIABLES **/
	level;
    ufoSpeed;
	ufoFireRate;
    ufoFastFireRate;
    ufoHealth;
    ufoPowerFireRate;
	ufoLaserSpeed;
    ufoSwoopSpeed;
	asteroidCount;
	asteroidSpeed;
    teleportRate;
	collisionCategories = [];

	constructor(level) {
		this.level = level;
        this.setUfoSpeed();
        this.setUfoFireRate();
        this.setUfoFastFireRate();
        this.setUfoHealth();
        this.setUfoPowerFireRate();
        this.setUfoLaserSpeed();
        this.setUfoSwoopSpeed();
        this.setAsteroidCount();
        this.setAsteroidSpeed();
		this.setCollisionCategories();
        this.setTeleportRate();
    }
    
    /******************
    ***   GETTERS   ***
    *******************/
    getUfoSpeed = () => {
        return this.ufoSpeed;
    }

    getUfoFireRate = () => {
    	return this.ufoFireRate;
    }

    getUfoFastFireRate = () => {
        return this.ufoFastFireRate;
    }

    getUfoHealth = () => {
        return this.ufoHealth;
    }

    getUfoPowerFireRate = () => {
        return this.ufoPowerFireRate;
    }

    getUfoLaserSpeed = () => {
        return this.ufoLaserSpeed;
    }

    getUfoSwoopSpeed = () => {
        return this.ufoSwoopSpeed;
    }

    getAsteroidCount = () => {
    	return this.asteroidCount;
    }

    getAsteroidSpeed = () => {
    	return this.asteroidSpeed;
    }

    getCollisionCategory = (category) => {
        return this.collisionCategories[category];
    }

    getTeleportRate = () => {
        return this.teleportRate;
    }

    /******************
    ***   SETTERS   ***
    *******************/
    setUfoSpeed = () => {
        if(0.9 + (this.level * 0.1) >= 5) {
            this.ufoSpeed = 5;
        } else {
            this.ufoSpeed = 0.9 + (this.level * 0.1);
        }
    }

    setUfoFireRate = () => {
        if(2000 - (this.level * 50) <= 800) {
            this.ufoFireRate = 800;
        } else {
            this.ufoFireRate = 2000 - (this.level * 50);
        }
    }

    setUfoFastFireRate = () => {
        if(105 - (this.level * 5) <= 50) {
            this.ufoFastFireRate = 50;
        } else {
            this.ufoFastFireRate = 105 - (this.level * 5);
        }
    }

    setUfoHealth = () => {
        if(500 + (this.level * 50) >= 2000) {
            this.ufoHealth = 2000;
        } else {
            this.ufoHealth = 500 + (this.level * 50);
        }
    }

    setUfoPowerFireRate = () => {
        if(20 - this.level <= 1) {
            this.ufoPowerFireRate = 1;
        } else {
            this.ufoPowerFireRate = 20 - this.level;
        }
    }

    setUfoLaserSpeed = () => {
        if(5 + (this.level * 0.1) >= 8) {
            this.ufoLaserSpeed = 8;
        } else {
            this.ufoLaserSpeed = 5 + (this.level * 0.1);
        }
    }

    setUfoSwoopSpeed = () => {
        if(4 + (this.level * 0.1) >= 7) {
            this.ufoSwoopSpeed = 7;
        } else {
            this.ufoSwoopSpeed = 4 + (this.level * 0.1);
        }
    }

    setAsteroidCount = () => {
        if(3 + (this.level * 0.2) >= 6) {
            this.asteroidCount = 6;
        } else {
            this.asteroidCount = parseInt(3 + (this.level * 0.2));
        }
    }

    setAsteroidSpeed = () => {
        if(5 + (this.level * 0.1) >= 10) {
            this.asteroidSpeed = 10;
        } else {
            this.asteroidSpeed = 5 + (this.level * 0.1);
        }
    }

    setTeleportRate = () => {
        if(16000 - (this.level * 500) <= 6000) {
            this.teleportRate = 6000;
        } else {
            this.teleportRate = 16000 - (this.level * 500);
        }
    }

    setCollisionCategories = () => {
    	this.collisionCategories.push(1);
    	this.collisionCategories.push(2);
    	this.collisionCategories.push(4);
    	this.collisionCategories.push(8);
    	this.collisionCategories.push(16);
    	this.collisionCategories.push(32);
    }
}


