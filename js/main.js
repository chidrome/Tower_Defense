






// class mainScene extends Phaser.Scene {

// constructor()
// {
// 	super({ key: 'mainScene', active: true});
// }

var mainScene = new Phaser.Class({

	Extends: Phaser.Scene,

	initialize:

	function mainScene()
	{
		Phaser.Scene.call(this, 'mainScene');
	},

	preload: function() {
	    // load the game assets – enemy and turret atlas
	    // this.load.atlas('sprites', 'assets/spritesheet.png', 'assets/spritesheet.json');    
	    this.load.image('bullet', 'assets/img/bullet.png');
	    this.load.image('enemy', 'assets/img/enemySprite.png');
	    this.load.image('turret', 'assets/img/turretSprite.png');
	    this.load.image('bg', 'assets/img/grass-background.png');
	    this.load.image('start', 'assets/img/start.png');
	    this.load.image('nextLevel', 'assets/img/next_level.png');
	    this.load.image('restart', 'assets/img/restart.png');
	    this.load.image('blueBox', 'assets/img/blue-box.png');
	    this.load.image('title', 'assets/img/red-tower-defense-title.png');
	    this.load.image('pause', 'assets/img/pause.png');
	    this.load.image('laserBullet', 'assets/img/beam.png');

	    // load some audio
	    this.load.audio('pewpew', '/assets/audio/laser.mp3');
	    this.load.audio('music', '/assets/audio/battle.m4a');
	},

	 
	create: function(){
	    // this graphics element is only for visualization, 
	    // its not related to our path
	    let background = this.add.tileSprite(0, 0, this.width, this.height, 'bg');
	    let graphics = this.add.graphics();
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

	 //    // create music
	 //    var pewpew = this.sound.add('pewpew', 0.3);
	 //    var music = this.sound.add('music', {
	 //    mute: false,
	 //    volume: 1,
	 //    rate: 1,
	 //    detune: 0,
	 //    seek: 0,
	 //    loop: true,
	 //    delay: 0
		// });

	 //    music.play();

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
	    	pauseButton.alpha = 0;
	    	startButton.alpha = 0;
	    	// this.scene.launch('pauseScene');
	    	this.scene.switch('pauseScene');
	    }, this);
	    restartButton.on('resume', function(){
	    	console.log('game is resumed');
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



	},

	update: function(time, delta) { 
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

});

/////////////////////////////////////////// BELOW WILL BE THE PAUSE SCENE///////////////////////////////////////

// class pauseScene extends Phaser.Scene{

// constructor()
// {
// 	super({ key: 'pauseScene', active: true});
// }
var pauseScene = new Phaser.Class({

	Extends: Phaser.Scene,

	initialize:

	function pauseScene()
	{
		Phaser.Scene.call(this, {key: 'pauseScene'});
	},

	preload: function()
	{
		this.load.image('resume', 'assets/img/resume.png');
	},

	create: function()
	{
		textGamePaused = this.add.text(GAME_WIDTH - 500, 293, 'GAME PAUSED', {fill: '#fff'});
		resumeButton = this.add.sprite(GAME_WIDTH -130, 400, 'resume');
		resumeButton.setInteractive();
    	resumeButton.on('pointerdown', function(){
	    	pauseButton.alpha = 1;
	    	// startButton.alpha = 0;
	    	this.scene.switch('mainScene');
    	}, this);
	}

});



var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    physics: {
    	default: 'arcade'
    },
    scene: [mainScene, pauseScene]
};


var game = new Phaser.Game(config);





