class defineBody {
  userdata={};
  uniquename;
  fixDef = new b2FixtureDef;
  bodyDef = new b2BodyDef;
  b2dobj;
  constructor(density, friction, restitution, x, y,SCALE) {
    this.fixDef.density=density;
    this.fixDef.friction=friction;
    this.fixDef.restitution=restitution;
    this.bodyDef.position.x = x / SCALE;
    this.bodyDef.position.y = y / SCALE;
  }
  createObj(world) {
    this.b2dobj = world.CreateBody(this.bodyDef).CreateFixture(this.fixDef);
  }
  changeUserData(property, newvalue) {
    let objdata = this.GetBody().GetUserData();
    this.userdata = typeof objdata === undefined || objdata === null?{}:this.userdata;
    this.userdata[property]=newvalue;
    this.GetBody().SetUserData(this.userdata);
  }

  GetBody(){
    return this.b2dobj.GetBody();
  }
 }

class defineSB extends defineBody {

   constructor(density, friction, restitution, x, y, width, height, objid,uniquename, angle,category,mask,SCALE,world) {
     super(density, friction, restitution, x, y,SCALE,world);
     this.bodyDef.type = b2Body.b2_staticBody;
     this.bodyDef.angle = angle;
     this.fixDef.shape = new b2PolygonShape;
     this.fixDef.shape.SetAsBox(width/SCALE, height/SCALE);
     
     this.fixDef.filter.categoryBits = category;
     this.fixDef.filter.maskBits = mask;
     
     this.createObj(world);
     this.changeUserData("id",objid);
     this.changeUserData("uniquename",uniquename);
   }
 }

class defineDB extends defineBody {
  constructor(density, friction, restitution, x, y, width, height, objid,uniquename, angle,category,mask,SCALE,world) {
    super(density, friction, restitution, x, y,SCALE,world);
    this.bodyDef.type = b2Body.b2_dynamicBody;
    this.bodyDef.angle = angle;
    this.fixDef.shape = new b2PolygonShape;
    this.fixDef.shape.SetAsBox(width/SCALE, height/SCALE);

    this.fixDef.filter.categoryBits = category;
    this.fixDef.filter.maskBits = mask;

    this.createObj(world);
    this.changeUserData("id",objid);
    this.changeUserData("uniquename",uniquename);
  }
}

class defineDCB extends defineBody {

  /**
   * 
   * @param {number} density 
   * @param {*} friction 
   * @param {*} restitution 
   * @param {*} x 
   * @param {*} y 
   * @param {*} r 
   * @param {string} objid 
   * @param {*} uniquename 
   * @param {*} SCALE 
   * @param {object} world 
   */
  constructor(density, friction, restitution, x, y, r, objid,uniquename,category,mask,SCALE,world) {
    super(density, friction, restitution, x, y,SCALE,world);
    this.bodyDef.type = b2Body.b2_dynamicBody;
    this.fixDef.shape = new b2CircleShape(r/SCALE);

    this.fixDef.filter.categoryBits = category;
    this.fixDef.filter.maskBits = mask;

    this.createObj(world);
    this.changeUserData("id",objid);
    this.changeUserData("uniquename",uniquename);
  }


}

class defineRJ {
  joint;

  constructor(body1, body2, world) {
    this.joint = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
    this.joint.Initialize(body1.GetBody(),body2.GetBody(),body1.GetBody().GetWorldCenter());
    world.CreateJoint(this.joint);
  }
  
}