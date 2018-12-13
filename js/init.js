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
                addMoney(15);
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
            var enemy = getEnemy(this.x, this.y, 120);
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
                this.nextTic = time + 300;      
            }
        }

});

var Bullet = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Image,
 
    initialize:
 
    function Bullet (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'laserBullet');
 
        this.dx = 0;
        this.dy = 0;
        this.lifespan = 0;
 
        this.speed = Phaser.Math.GetSpeed(900, 1);
    },
 
    fire: function (x, y, angle)
    {
        this.setActive(true);
        this.setVisible(true);
 
        //  Bullets fire from the middle of the screen to the given x/y
        this.setPosition(x, y);
 
        //  we don't need to rotate the bullets as they are round
        this.setRotation(angle);
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




// create the grids on the board. but hide them.
function drawGrid(graphics) {
    graphics.lineStyle(0, 0x0000ff, 0.8);
    for(var i = 0; i < 17; i++) {
        graphics.moveTo(0, i * 40);
        graphics.lineTo(840, i * 40);
    }
    for(var j = 0; j < 21; j++) {
        graphics.moveTo(j * 40, 0);
        graphics.lineTo(j * 40, 650);
    }
    graphics.strokePath();
}

// set which grid squares we can place turrets on. MAP is in global.js
function canPlaceTurret(i, j) {
    return map[i][j] === 0;
}


function placeTurret(pointer) {
    var i = Math.floor(pointer.y/40);
    var j = Math.floor(pointer.x/40);
    if(canPlaceTurret(i, j) && MONEY >= TURRET_COST && !startGame) {
        var turret = turrets.get();
        if (turret)
        {
            turret.setActive(true);
            turret.setVisible(true);
            turret.place(i, j);
            subtractMoney(TURRET_COST);
        }   
    }
}


function addBullet(x, y, angle) {
    var bullet = bullets.get();
    if (bullet)
    {
        bullet.fire(x, y, angle);
    }
}

function getEnemy(x, y, distance) {
    var enemyUnits = enemies.getChildren();
    for(var i = 0; i < enemyUnits.length; i++) {       
        if(enemyUnits[i].active && Phaser.Math.Distance.Between(x, y, enemyUnits[i].x, enemyUnits[i].y) <= distance)
            return enemyUnits[i];
    }
    return false;
}

function damageEnemy(enemy, bullet) {  
    // only if both enemy and bullet are alive
    if (enemy.active === true && bullet.active === true) {
        // we remove the bullet right away
        bullet.setActive(false);
        bullet.setVisible(false);
        // decrease the enemy hp with damage of the bullets
        enemy.receiveDamage(BULLET_DAMAGE);
       
    }
}

// Populate some sort of text to highlight that the round is over
function endOfRoundTextPopulate(){
    ROUND_OVER_COUNTER -= 1;
    console.log('Round Over Counter ' + ROUND_OVER_COUNTER);
    // console.log('Max level qty is ' + CURRENT_LVL_QTY);
    if(ROUND_OVER_COUNTER -1 === 0 && startGame && CURRENT_LVL_QTY === ENEMY_MAX_QTY){
        console.log(textRoundOver.alpha);
        textRoundOver.alpha = 1;
        pauseButton.alpha = 0;
        startButton.alpha = 1;
    }
}

// add score for each enemy killed
function addScore(amount){
    PLAYER_SCORE += amount;
    textScore.text = 'Score: ' + PLAYER_SCORE;
}

// add money for every enemy killed
function addMoney(amount){
    MONEY += amount;
    textCurrency.text = 'Money: $' + MONEY;
}

// remove money when turrets are placed/purchased
function subtractMoney(amount){
    MONEY -= amount;
    textCurrency.text = 'Money: $' + MONEY;
}

// next level function should reset the counters and increase lvl/enemy max qty/enemy speed
function nextLevel(){
    if(!startGame){
        console.log('Start game is ' + startGame);
    }
    else if(startGame && textRoundOver.alpha === 1){
        LEVEL++;
        ENEMY_MAX_QTY += 3;
        ENEMY_SPEED += .000012;
        ENEMY_LIFE += 65;
        CURRENT_LVL_QTY = 0;
        textRoundOver.alpha = 0;
        startGame = false;
        textLevel.text = 'Level: ' + LEVEL;
        console.log(startGame);
    }
    console.log('Current Level is ' + LEVEL);
}

// start the game
function start(){
    startGame = true;
        if(textRoundOver.alpha === 1){
            ROUND_OVER_COUNTER = 1;
        }
        else {
            startButton.alpha = 0;
            pauseButton.alpha = 1;
        }
}

function pauseGame(){
    if(textRoundOver.alpha === 0){
        this.scene.pause();
        pauseButton.alpha = 0;
        startButton.alpha = 1;
    }
}













