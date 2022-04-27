"use strict";

let mygame = null;
let playerInitHealth;
let ufoInitHealth;
let intervals = [];

$(document).ready(function() {

    $("#gotologin").click(function(){
      openScreen("login");
    }); 

    $(".start").click(function(){
      if(mygame == null) {
        $("#pausescreen").hide();
        startGame();
        $("#startscreen").show();
      }
        openScreen("game");
    }); 

    $(".highscores").click(function(){
        openScreen("highscores");
    }); 

    $(".help").click(function(){
        openScreen("help");
    }); 

    $(".quit").click(function(){
      for(let i=0; i<100; i++) {
        window.clearInterval(i);
      }
      $("#endgame").hide();
      $("#hud").hide();
      mygame = null;
        openScreen("home");
    }); 

    $("#endplay").click(function(){
      for(let i=0; i<100; i++) {
        window.clearInterval(i);
      }
      $("#endgame").hide();
      $("#hud").hide();
      mygame = null;
        startGame();
      $("#startscreen").show();
    }); 


    $(".highscores").click(function(){
        openScreen("highscores");
    }); 

    $(".help").click(function(){
        openScreen("help");
    }); 

    $(".quit").click(function(){
      for(let i=0; i<100; i++) {
        window.clearInterval(i);
      }
      $("#endgame").hide();
      $("#hud").hide();
      mygame = null;
        openScreen("home");
    });

    $("#startgame").click(function(){
        $("#startscreen").hide();
        $("#hud").show();
        $("#pause").show();
        mygame.pause = false;
    }); 

    $("#pause").click(function(){
        mygame.pause = true;
        $("#pause").blur();
        $("#pause").hide();
        $("#pausescreen").show();
    }); 

    $("#resume").click(function(){
        mygame.pause = false;
        $("#resume").blur();
        $("#pausescreen").hide();
        $("#pause").show();
    });
});

function openScreen(screen) {
  switch(screen) {
    case "game":
      $("#splash").hide();
      $("#hiscores").hide();
      $("#about").hide();
      $("#game").show();
      break;
    case "highscores":
      $("#splash").hide();
      $("#hiscores").show();
      $("#about").hide();
      $("#game").hide();
      break;
    case "help":
      $("#splash").hide();
      $("#hiscores").hide();
      $("#about").show();
      $("#game").hide();
      break;
    case "home":
      $("#splash").show();
      $("#hiscores").hide();
      $("#about").hide();
      $("#game").hide();
      break;
    case "login":
      $("#splash").hide();
      $("#loginform").show();
  }
}

function startGame() {
  mygame = new AGame(600, 800, 30, 0, 0, 60, "b2dcan", level);
  mygame.createObjects();
  mygame.init();
  mygame.setIntervals();

  playerInitHealth = mygame.player.getPlayerHealth();
  ufoInitHealth = mygame.ufo.getUfoHealth();

  mygame.player.addKeyHandler("keydown", mygame.player.handleKeyDown);
  mygame.player.addKeyHandler("keyup", mygame.player.handleKeyUp);

  mygame.world.SetContactListener(SpaceContact);

  $("#ufohealth #healthbar").css("width","100%");
  $("#playerhealth #healthbar").css("width","100%");
}

function finishGame(win) {
  let result;

  if(win) {
    result = "YOU WIN";
    mygame.destroylist.push(mygame.ufo.getBody().GetBody());
    mygame.score += 50 * level; 

    $("#ufohealth #healthbar").css("width","0%");
    $("#pause").hide();
    $("#score").html(mygame.score);
    $('#newscore').val(mygame.score);
    $("#finalscore").html(mygame.score);
    $("#totalscore").html(mygame.score+totalScore);
  } else {
    result = "YOU LOSE";
    mygame.destroylist.push(mygame.player.getBody().GetBody());
    
    $("#playerhealth #healthbar").css("width","0%"); 
    $('#uid').val(0);
    $("#finalscore").html(0);
    $("#totalscore").html(totalScore);
  }
  
  setTimeout(function(){
    $("#result").text(result);
    $("#endgame").show();
    mygame.pause = true;
  }, 1000);
}

let SpaceContact = b2Listener;

SpaceContact.PreSolve = (contact, oldManifold) => {
  let fixa = contact.GetFixtureA().GetBody().GetUserData();
  let fixb = contact.GetFixtureB().GetBody().GetUserData();

  // Handles pushing asteroids in teleport list if they are going to collide with border
  if ((fixa.id == "asteroid" && fixb.id == "border") || (fixb.id == "asteroid" && fixa.id == "border")) {
    let asteroid, border; 
    
    if(fixa.id == "asteroid") {
      asteroid = contact.GetFixtureA();
      border = contact.GetFixtureB().GetBody().GetUserData().uniquename;
    } else {
      asteroid = contact.GetFixtureB();
      border = contact.GetFixtureA().GetBody().GetUserData().uniquename;
    }

    mygame.teleport.push([asteroid, border]);
  }
  
  // Small impulse based on which border to keep ufo from getting stuck to sides of screen
  if ((fixa.id=="ufo" && fixb.id=="border") || (fixb.id=="ufo" && fixa.id == "border")) {
  	let border = (fixa.uniquename == "ufo") ? fixb.uniquename : fixa.uniquename;
  	let ix, iy;

    switch(border) {
		case "top":
			ix = 0;
			iy = 1;
			break;
		case "bottom":
			ix = 0;
			iy = -1;
			break;
		case "left":
			ix = 1;
			iy = 0;
			break;
		case "right":
			ix = -1;
			iy = 0;
			break;
	  }
	
	  mygame.ufo.setUfoImpulse(new b2Vec2(ix, iy), mygame.ufo.getUfoWorldPos());
  }
}

SpaceContact.BeginContact = (contact) => {
  let laser, target;

  if (contact.GetFixtureA().GetBody().GetUserData().id == "laser") {
    laser = contact.GetFixtureA();
    target = contact.GetFixtureB();
  } else {
    laser = contact.GetFixtureB();
    target = contact.GetFixtureA();
  }

  if(target.GetBody().GetUserData().id == "border" && laser.GetBody().GetUserData().id == "laser") {
    mygame.destroylist.push(laser.GetBody());
  }

  if(target.GetBody().GetUserData().id == "asteroid" && laser.GetBody().GetUserData().id == "laser") {

    for(let i in mygame.asteroids.getAsteroids()) {
      
      if(mygame.asteroids.getAsteroid(i).GetBody() == target.GetBody()) {
        mygame.asteroids.damageAsteroid(25, i);

        if(mygame.asteroids.getCurrentHealth(i) == 0) { 
          mygame.destroylist.push(target.GetBody());

          if(laser.GetBody().GetUserData().uniquename == "spaceshiplaser") {
            mygame.score += 5;
            $("#score").html(mygame.score);
          }
        }
      }
    }

    mygame.destroylist.push(laser.GetBody());
  }

  if((target.GetBody().GetUserData().id == "ufo" || target.GetBody().GetUserData().id == "spaceship") && laser.GetBody().GetUserData().id == "laser") {
    let damage, healthWidth;

    if(mygame.ufo.getBody().GetBody() == target.GetBody()) {
      damage = 50; // player damage
      mygame.ufo.damage(damage);

      if (mygame.ufo.getCurrentHealth() == 0) {
        finishGame(true);
      } else {
        healthWidth = ((mygame.ufo.getCurrentHealth() / ufoInitHealth) * 100) + "%";
        $("#ufohealth #healthbar").css("width",healthWidth);
      }
    } else {
      damage = (laser.GetBody().GetUserData().uniquename == "ufopowerlaser") ? 100 : 50; // ufo damage
      mygame.player.damage(damage);

      if (mygame.player.getCurrentHealth() == 0) {
        finishGame(false);
      } else {
        healthWidth = ((mygame.player.getCurrentHealth() / playerInitHealth) * 100) + "%";
        $("#playerhealth #healthbar").css("width",healthWidth);
      }
    }

    mygame.destroylist.push(laser.GetBody());
  }
};

SpaceContact.PostSolve = (contact, impulse) => {
  let fixa = contact.GetFixtureA().GetBody().GetUserData();
  let fixb = contact.GetFixtureB().GetBody().GetUserData();

  // Handles collision between asteroid and player //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  if((fixa.id=="spaceship" && fixb.id=="asteroid") || (fixb.id=="spaceship" && fixa.id=="asteroid")) { 
    mygame.player.damage(impulse.normalImpulses[0] * 20);
    
    if(mygame.player.getCurrentHealth() == 0) {
      mygame.destroylist.push(mygame.player.getBody().GetBody());
      finishGame(false);
    } else {
      let healthWidth = ((mygame.player.getCurrentHealth() / playerInitHealth) * 100) + "%";
      $("#playerhealth #healthbar").css("width",healthWidth);
    }

  }
};