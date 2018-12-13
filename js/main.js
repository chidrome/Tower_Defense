


var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
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
    this.load.image('bg', 'assets/grass-background.png');
    this.load.image('start', 'assets/start.png');
    this.load.image('nextLevel', 'assets/next_level.png');
    this.load.image('restart', 'assets/restart.png');
    this.load.image('blueBox', 'assets/blue-box.png');
    this.load.image('title', 'assets/red-tower-defense-title.png');
    this.load.image('pause', 'assets/pause.png');
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

            // set HP for each enemy
            this.hp = ENEMY_LIFE;

        },

        receiveDamage: function(damage) {
            this.hp -= BULLET_DAMAGE;           
            
            // if hp drops below 0 we deactivate this enemy
            if(this.hp <= 0) {
                this.setActive(false);
                this.setVisible(false);
                addScore(10);
                addMoney(25);
                endOfRoundTextPopulate(); // when there are no more enemies on the board round over text will display
            }
        },

        update: function (time, delta)
        {
            // move the t point along the path, 0 is the start and 0 is the end
            this.follower.t += ENEMY_SPEED * delta;
            
            // get the new x and y coordinates in vec
            enemyPosition = path.getPoint(this.follower.t, this.follower.vec);
            
            // update enemy x and y to the newly obtained x and y
            this.setPosition(this.follower.vec.x, this.follower.vec.y);
       
            // if we have reached the end of the path, remove the enemy
            if (this.follower.t >= 1)
            {
                this.setActive(false);
                this.setVisible(false);
            };
            // lose a life when an enemy gets to the end point
            if (enemyPosition === path.getPoint(860, 580)){
            	PLAYER_LIFE -= 1;
            	textLife.text = 'Life: ' + PLAYER_LIFE;
            	endOfRoundTextPopulate(); // when there are no more enemies on the board round over text will display
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
 
    	// 	we don't need to rotate the bullets as they are round
    	//	this.setRotation(angle);
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
    var background = this.add.tileSprite(0, 0, this.width, this.height, 'bg');
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
    
    graphics.lineStyle(0, 0x7575a3, 1);
    // visualize the path
    path.draw(graphics);

	// create enemies
	enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
	this.nextEnemy = 0;

	// user input
	turrets = this.add.group({ classType: Turret, runChildUpdate: true });
	this.input.on('pointerdown', placeTurret);
    

	// create bullets
	bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });

	// bullets need to overlap with the enemy
	this.physics.add.overlap(enemies, bullets, damageEnemy);

	// Display the message box where the text will be held
	this.add.sprite(GAME_WIDTH -350, 437, 'blueBox');

	// Display title
	this.add.sprite(GAME_WIDTH -400, 40, 'title');

	// create start, pause and restart buttons
	startButton = this.add.sprite(GAME_WIDTH -130, 400, 'start');
	pauseButton = this.add.sprite(GAME_WIDTH -130, 400, 'pause');
	nextLevelButton = this.add.sprite(GAME_WIDTH -130, 440, 'nextLevel');
	restartButton = this.add.sprite(GAME_WIDTH -130, 480, 'restart');
    startButton.alpha = 1;
    pauseButton.alpha = 0;
    nextLevelButton.alpha = 1;


    startButton.setInteractive();
    nextLevelButton.setInteractive();
    restartButton.setInteractive();
    pauseButton.setInteractive();

    startButton.on('pointerdown', start);
    // Phaser 3 won't let me call a function since "this" doesn't refer to the global object
    pauseButton.on('pointerdown', function(){
    	if(textRoundOver.alpha === 0){
	        this.scene.pause();
	        pauseButton.alpha = 0;
	        startButton.alpha = 1;
	    }
	});

    nextLevelButton.on('pointerdown', nextLevel);


	// Display life and Score
    textLife = this.add.text(GAME_WIDTH - 480, 400, 'Life: ' + PLAYER_LIFE, {fill: '#fff'});
    textScore = this.add.text(GAME_WIDTH - 480, 420, 'Score: ' + PLAYER_SCORE, {fill: '#fff'});
    textCurrency = this.add.text(GAME_WIDTH - 480, 440, 'Money: $' + MONEY, {fill: '#fff'});
    textLevel = this.add.text(GAME_WIDTH -480, 460, 'Level: ' + LEVEL, {fill: '#fff', fontWeight: 'bold'});


    // Set game over sprite to be transparent untill it's game over.
    textRoundOver = this.add.text(GAME_WIDTH - 500, 293, 'ALL ENEMIES CLEARED', {fill: '#fff'});
    textRoundOver.alpha = 0; // setting the opacity to be 0 and then when enemies are cleared it'll be set to 1 so that it shows on the game board.



}

function update(time, delta) { 
	if(!startGame){
		console.log('Place a turret to start');
	}
	else if(startGame) {
    	// if its time for the next enemy
		    if (time > this.nextEnemy && CURRENT_LVL_QTY < ENEMY_MAX_QTY) {        
		    	var enemy = enemies.get();
		        if (enemy) {
		            enemy.setActive(true);
		            enemy.setVisible(true);
		            
		            // place the enemy at the start of the path
		            enemy.startOnPath();
		            
		            this.nextEnemy = time + 1000;
		            ROUND_OVER_COUNTER ++;
		            CURRENT_LVL_QTY ++;
		        }

		    } 
	}

}

