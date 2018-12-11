
var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 840,
    height: 650,
    physics: {
    	default: 'arcade'
    },
    scene: {
        key: 'main',
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
 
function preload() {
    // load the game assets – enemy and turret atlas
    this.load.atlas('sprites', 'assets/spritesheet.png', 'assets/spritesheet.json');    
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('enemy', 'assets/enemySprite.png');
    this.load.image('turret', 'assets/turretSprite.png');
}

var Enemy = new Phaser.Class({
 
        Extends: Phaser.GameObjects.Image,
 
        initialize:
 
        function Enemy (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'enemy');
			this.follower = { t: 0, vec: new Phaser.Math.Vector2() };

 
        },

		startOnPath: function ()
        {
            // set the t parameter at the start of the path
            this.follower.t = 0;
            
            // get x and y of the given t point            
            path.getPoint(this.follower.t, this.follower.vec);
            
            // set the x and y of our enemy to the received from the previous step
            this.setPosition(this.follower.vec.x, this.follower.vec.y);

            // set HP
            this.hp = 100;
            
        },

        receiveDamage: function(damage) {
            this.hp -= damage;           
            
            // if hp drops below 0 we deactivate this enemy
            if(this.hp <= 0) {
                this.setActive(false);
                this.setVisible(false);      
            }
        },

        update: function (time, delta)
        {
            // move the t point along the path, 0 is the start and 0 is the end
            this.follower.t += ENEMY_SPEED * delta;
            
            // get the new x and y coordinates in vec
            path.getPoint(this.follower.t, this.follower.vec);
            
            // update enemy x and y to the newly obtained x and y
            this.setPosition(this.follower.vec.x, this.follower.vec.y);
 
            // if we have reached the end of the path, remove the enemy
            if (this.follower.t >= 1)
            {
                this.setActive(false);
                this.setVisible(false);
            }
        }
 
});


var Turret = new Phaser.Class({
 
        Extends: Phaser.GameObjects.Image,
 
        initialize:
 
        function Turret (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'turret');
            this.nextTic = 0;
        },
        // we will place the turret according to the grid
        place: function(i, j) {            
            this.y = i * 40 + 40/2;
            this.x = j * 40 + 40/2;
            map[i][j] = 1;            
        },

        fire: function() {
            var enemy = getEnemy(this.x, this.y, 100);
            if(enemy) {
                var angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
                addBullet(this.x, this.y, angle);
                this.angle = (angle + Math.PI/2) * Phaser.Math.RAD_TO_DEG;
            }
        },

        update: function (time, delta)
        {
            // time to shoot
            if(time > this.nextTic) {   
            	this.fire();             
                this.nextTic = time + 1000;
            }
        }



});

var Bullet = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Image,
 
    initialize:
 
    function Bullet (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
 
        this.dx = 0;
        this.dy = 0;
        this.lifespan = 0;
 
        this.speed = Phaser.Math.GetSpeed(600, 1);
    },
 
    fire: function (x, y, angle)
    {
        this.setActive(true);
        this.setVisible(true);
 
        //  Bullets fire from the middle of the screen to the given x/y
        this.setPosition(x, y);
 
    //  we don't need to rotate the bullets as they are round
    //  this.setRotation(angle);
 
        this.dx = Math.cos(angle);
        this.dy = Math.sin(angle);
 
        this.lifespan = 300;
    },
 
    update: function (time, delta)
    {
        this.lifespan -= delta;
 
        this.x += this.dx * (this.speed * delta);
        this.y += this.dy * (this.speed * delta);
 
        if (this.lifespan <= 0)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }
 
});


 
function create() {
    // this graphics element is only for visualization, 
    // its not related to our path
    var graphics = this.add.graphics();
    drawGrid(graphics); 
    
    // the path for our enemies
    // parameters are the start x and y of our path
    path = this.add.path(100, 655);
    path.lineTo(100, 138); // first turn
    path.lineTo(700, 138); // second turn
    path.lineTo(700, 300); // third turn
    path.lineTo(220, 300); // fourth turn
    path.lineTo(220, 580); // fifth turn
    path.lineTo(860, 580); // end


    
    graphics.lineStyle(6, 0xffffff, 1);
    // visualize the path
    path.draw(graphics);

	enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
	this.nextEnemy = 0;

	// user input
	turrets = this.add.group({ classType: Turret, runChildUpdate: true });
	this.input.on('pointerdown', placeTurret);

	// create bullets
	bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });

	// bullets need to overlap with the enemy
	this.physics.add.overlap(enemies, bullets, damageEnemy);

}

function update(time, delta) {  
 
    // if its time for the next enemy
    if (time > this.nextEnemy)
    {        
        var enemy = enemies.get();
        if (enemy)
        {
            enemy.setActive(true);
            enemy.setVisible(true);
            
            // place the enemy at the start of the path
            enemy.startOnPath();
            
            this.nextEnemy = time + 2000;
        }       
    }


}