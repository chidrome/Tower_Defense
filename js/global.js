var map = [	[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
			[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
			[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 				  -1, -1, -1],
			[ -1, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0,   -1, -1],
			[ -1, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 				  -1, -1],
			[ -1, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 				  -1, -1],
			[ -1, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 				  -1, -1],
			[ -1, 0, -1, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 	  -1, -1],
			[ -1, 0, -1, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 				  -1, -1],
			[ -1, 0, -1, 0, 0, -1, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
			[ -1, 0, -1, 0, 0, -1, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
			[ -1, 0, -1, 0, 0, -1, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
			[ -1, 0, -1, 0, 0, -1, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
			[ -1, 0, -1, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[ -1, 0, -1, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
			[ -1, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[ -1, 0, -1, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],	];


//constants
var GAME_WIDTH= 840;
var GAME_HEIGHT = 650;
var BULLET_DAMAGE = 50;
var ENEMY_SPEED = .2/10000;
var ENEMY_MAX_QTY = 10;
var TURRET_MAX_QTY = 4;
var ENEMY_LIFE = 150;
var ROUND_OVER_COUNTER = 1; // uses round over counter to end the round once it hits 0. 
var TURRET_COST = 250;
var CURRENT_LVL_QTY = 0; // used for stopping enemies from spawning when the current lvl qty === enemy max qty
var LEVEL = 1;
var SPAWN_TIME = 1000;
var MAX_LEVEL = 25;
var MONEY_PER_KILL = 25;
var TURRET_NUMBER = [];


// I Defined these
PLAYER_LIFE = 100;
PLAYER_SCORE = 0;
MONEY = 250;
startGame = false; // toggle to true when the game starts


// variables
var graphics;
var path;
var enemies;
var turrets;
var bullets;
var startButton;
var pauseButton;
var restartButton;
var nextLevelButton;
var textLife;
var textScore;
var textCurrency;
var textLevel;
var start;
var textRoundOver;
var textGamePaused;
var textNextLevel;
var gameOverWin;
var gameOverLose;
var enemyPosition;
var upgrade;









