"use strict"
let b2Listener = new Box2D.Dynamics.b2ContactListener();
b2Listener.BeginContact=(contact)=>{};
b2Listener.EndContact=(contact)=>{};
b2Listener.PreSolve=(contact, oldManifold)=>{};
b2Listener.PostSolve=(contact, impulse)=>{};


/*****
 * Mouse Controls
 */

class mouseHandler {
  constructor(target, type, runfunc) {
    target.addEventListener(type, (e) => {
      runfunc(e);
    });
  }
}

/*****
 * Keyboard Controls
 */

class keyHandler {
  constructor(type, runfunc) {
    document.addEventListener(type, (e) => {
      runfunc(e);
    });
  }
}