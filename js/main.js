

///////////////////////////////////////////////// Scenes /////////////////////////////////////////////////

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
	    this.load.image('win', 'assets/img/game-over-win.png');
	    this.load.image('lose', 'assets/img/game-over-lose.png');

	    // load some audio
	    this.load.audio('pewpew', '/assets/audio/laser.mp3');
	    this.load.audio('music', '/assets/audio/battle.m4a');

	    // enemy moving sprites
	    this.load.path = 'assets/img/';
	    this.load.image('spider', 'spider04_05.png');
	    this.load.image('spider2', 'spider04_06.png');
	    this.load.image('spider3', 'spider04_07.png');
	    this.load.image('spider4', 'spider04_08.png');
	    this.load.image('spider5', 'spider04_09.png');
	    this.load.image('spider6', 'spider04_10.png');
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



	    // draw a circle around the towers for firing radius

	    // create the animation
        this.anims.create({
            key: 'walkStraight',
                frames: [
                    { key: 'spider'},
                    { key: 'spider2'},
                    { key: 'spider3'},
                    { key: 'spider4'},
                    { key: 'spider5'},
                    { key: 'spider6', duration: 100}
                ],
                frameRate: 8,
            repeat: -1

        });


	    // create music
	    var pewpew = this.sound.add('pewpew', 0.3);
	    var music = this.sound.add('music', {
	    mute: false,
	    volume: 1,
	    rate: 1,
	    detune: 0,
	    seek: 0,
	    loop: true,
	    delay: 0
		});

	    music.play();

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

	    // make each button interactive
	    setInteractive([startButton, nextLevelButton, restartButton, pauseButton]);

	    // make buttons interactive when hovered over
	    interctiveButtons([startButton, nextLevelButton, restartButton, pauseButton]);

	    startButton.on('pointerdown', start);
	   	nextLevelButton.on('pointerdown', nextLevel);
	   	switchButton(pauseButton, this, 'pauseScene'); // switch between pause and resume button when switching scenes
	    restartButton.on('pointerdown', function(){
			console.log("Just refresh the page");
	    }, this);

		// Display life and Score
	    textLife = this.add.text(GAME_WIDTH - 480, 400, 'Life: ' + PLAYER_LIFE, {fill: '#fff'});
	    textScore = this.add.text(GAME_WIDTH - 480, 420, 'Score: ' + PLAYER_SCORE, {fill: '#fff'});
	    textCurrency = this.add.text(GAME_WIDTH - 480, 440, 'Money: $' + MONEY, {fill: '#fff'});
	    textLevel = this.add.text(GAME_WIDTH -480, 460, 'Level: ' + LEVEL, {fill: '#fff', fontWeight: 'bold'});


	    // Set game over sprite to be transparent untill it's game over.
	    gameOverWin = this.add.sprite(GAME_WIDTH -410, 293, 'win');
	    gameOverWin.alpha = 0;
	    gameOverLose = this.add.sprite(GAME_WIDTH -410, 293, 'lose');
	    gameOverLose.alpha = 0;

	    // next level text and info
	    textRoundOver = this.add.text(GAME_WIDTH - 620, 293, 'ALL ENEMIES CLEARED. CLICK NEXT LEVEL TO CONTINUE', {fill: '#fff'});
	    textRoundOver.alpha = 0; // setting the opacity to be 0 and then when enemies are cleared it'll be set to 1 so that it shows on the game board.
	    textNextLevel = this.add.text(GAME_WIDTH - 530, 293, 'PLACE YOUR TOWERS AND CLICK START', {fill: '#fff'});
	    textNextLevel.alpha = 0;


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
			            
			            this.nextEnemy = time + SPAWN_TIME;
			            ROUND_OVER_COUNTER ++;
			            CURRENT_LVL_QTY ++;
			        }

			    } 
		}

	}

});

// BELOW WILL BE THE PAUSE SCENE //

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
		interctiveButtons([resumeButton]);
		switchButton(resumeButton, this, 'mainScene');
	}

});


///////////////////////////////////////////////// Config ///////////////////////////////////////////////// 

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



