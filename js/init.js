
///////////////////////////////////////////////// Game Objects Class ///////////////////////////////////////////////// 

var Enemy = new Phaser.Class({
 
        Extends: Phaser.GameObjects.Sprite,
 
        initialize:
 
        function Enemy (scene)
        {
            Phaser.GameObjects.Sprite.call(this, scene, 0, 0, 'spider');
            Phaser.GameObjects.Sprite.call(this, scene, 0, 0, 'walkRight');
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

            // animate the spider
            this.anims.play('walkStraight');

        },

        receiveDamage: function(damage) {
            this.hp -= BULLET_DAMAGE;           
            
            // if hp drops below 0 we deactivate this enemy
            if(this.hp <= 0) {
                this.setActive(false);
                this.setVisible(false);
                addScore(10);
                addMoney(MONEY_PER_KILL);
                checkWin(); // when there are no more enemies on the board round over text will display
            }
        },


        update: function (time, delta)
        {
            // move the t point along the path, 0 is the start and 0 is the end
            this.follower.t += ENEMY_SPEED * delta;
            
            // get the new x and y coordinates in vec
            enemyPosition = path.getPoint(this.follower.t, this.follower.vec);
            
            // update enemy x and y to the newly obtained x and y
            moveToPoint = this.setPosition(this.follower.vec.x, this.follower.vec.y);
       
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
                checkWin(); // when there are no more enemies on the board round over text will display
            }
            else if (enemyPosition === path.getPoint(100, 138))
            {
                this.anims.stop();
                // this.anims.play('walkRight');
            };
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
 
        this.speed = Phaser.Math.GetSpeed(1100, 1);
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



///////////////////////////////////////////////// End of Game Objects Class ///////////////////////////////////////////////// 


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
    var turretPlacementArray = TURRET_NUMBER
    var i = Math.floor(pointer.y/40);
    var j = Math.floor(pointer.x/40);
    if(canPlaceTurret(i, j) && MONEY >= TURRET_COST && !startGame) {
        var turret = turrets.get();
        if (turret)
        {
            turret.setActive(true);
            turret.setVisible(true);
            // turret.setInteractive();
            turret.place(i, j);
            subtractMoney(TURRET_COST);
            turretPlacementArray.push(turretPlacementArray.length + 1);
        }
        console.log(turretPlacementArray);
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

// Populate some sort of text to highlight that the round is over or if the player has won or lost
function checkWin(){
    ROUND_OVER_COUNTER -= 1;
    if(PLAYER_LIFE === 0)
    {
        gameOverLose.alpha = 1;
    }
    else if(PLAYER_LIFE > 0 && ROUND_OVER_COUNTER -1 === 0 && LEVEL === MAX_LEVEL)
    {
        gameOverWin.alpha = 1;
    }
    else if(ROUND_OVER_COUNTER -1 === 0 && startGame && CURRENT_LVL_QTY === ENEMY_MAX_QTY){
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
    switch(true){
        case (LEVEL > 14 && startGame && textRoundOver.alpha === 1):
            ENEMY_MAX_QTY += 10;
            // ENEMY_SPEED += .000001; 
            ENEMY_LIFE += 700;
            LEVEL++;
            textRoundOver.alpha = 0;
            startGame = false;
            textLevel.text = 'Level: ' + LEVEL;
            CURRENT_LVL_QTY = 0;
            textNextLevel.alpha = 1;
            break;
        case (LEVEL > 12 && startGame && textRoundOver.alpha === 1):
            ENEMY_MAX_QTY += 7;
            // ENEMY_SPEED += .000003; 
            ENEMY_LIFE += 500;
            LEVEL++;
            textRoundOver.alpha = 0;
            startGame = false;
            textLevel.text = 'Level: ' + LEVEL;
            CURRENT_LVL_QTY = 0;
            textNextLevel.alpha = 1;
            break;
        case (LEVEL > 11 && startGame && textRoundOver.alpha === 1):
            ENEMY_MAX_QTY += 7;
            ENEMY_LIFE += 125;
            LEVEL++;
            textRoundOver.alpha = 0;
            startGame = false;
            textLevel.text = 'Level: ' + LEVEL;
            CURRENT_LVL_QTY = 0;
            textNextLevel.alpha = 1;
            break;
        case (LEVEL > 10 && startGame && textRoundOver.alpha === 1):
            ENEMY_MAX_QTY += 7;
            // ENEMY_SPEED += .000007; 
            ENEMY_LIFE += 125;
            LEVEL++;
            textRoundOver.alpha = 0;
            startGame = false;      
            textLevel.text = 'Level: ' + LEVEL;
            CURRENT_LVL_QTY = 0;
            textNextLevel.alpha = 1;
            break;
         case (LEVEL > 8 && startGame && textRoundOver.alpha === 1):
            ENEMY_MAX_QTY += 5;
            // ENEMY_SPEED += .000001; 
            ENEMY_LIFE += 400;
            LEVEL++;
            textRoundOver.alpha = 0;
            startGame = false;
            textLevel.text = 'Level: ' + LEVEL;
            CURRENT_LVL_QTY = 0;
            textNextLevel.alpha = 1;
            break;
        case (LEVEL > 7 && startGame && textRoundOver.alpha === 1):
            MONEY_PER_KILL -= 15;
            ENEMY_MAX_QTY += 5;
            ENEMY_SPEED += .000002; 
            ENEMY_LIFE += 125;
            LEVEL++;
            textRoundOver.alpha = 0;
            startGame = false;
            textLevel.text = 'Level: ' + LEVEL;
            CURRENT_LVL_QTY = 0;
            textNextLevel.alpha = 1;
            break;
        case (LEVEL > 3 && startGame && textRoundOver.alpha === 1):               
            ENEMY_MAX_QTY += 3;
            ENEMY_SPEED += .000005; // only incrementing the enemy speed by half of what it was the first 5 levels
            SPAWN_TIME -= 100;
            ENEMY_LIFE += 200;   
            LEVEL++;
            textRoundOver.alpha = 0;
            startGame = false;
            textLevel.text = 'Level: ' + LEVEL;
            CURRENT_LVL_QTY = 0;
            textNextLevel.alpha = 1;
            upgradeTurrets(turrets.getChildren());
            break;
        case (startGame && textRoundOver.alpha === 1):
            ENEMY_MAX_QTY += 3;
            ENEMY_SPEED += .000012;
            ENEMY_LIFE += 100;
            LEVEL++;
            textRoundOver.alpha = 0;
            startGame = false;
            textLevel.text = 'Level: ' + LEVEL;
            CURRENT_LVL_QTY = 0;
            textNextLevel.alpha = 1;
            upgradeTurrets(turrets.getChildren());
            break;
        default:
    }
}

// start the game
function start(){
    startGame = true;
    textNextLevel.alpha = 0;
        if(textRoundOver.alpha === 1){
            ROUND_OVER_COUNTER = 1;
        }
        else {
            startButton.alpha = 0;
            pauseButton.alpha = 1;
        }
}

// set buttons to be interactive
function setInteractive(buttonsArray){
    buttonsArray.forEach(function(button){
        button.setInteractive();
    });
}

// change the size of the buttons when the pointer is over it
function interactiveButtons(buttonsArray){
    buttonsArray.forEach(function(button){      
        button.on('pointerover', function()
        {
            button.setScale(1.2, 1.2);
        });
        button.on('pointerout', function()
        {
            button.setScale(1, 1);
        });
    })
}

function upgradeTurrets(turretsArray){
    turretsArray.forEach(function(turret){
        turret.setInteractive();
        turret.on('pointerover', function()
        {
            if(!startGame){
                turret.setScale(1.2, 1.2);
                textNextLevel.alpha = 0;
                upgrade.alpha = 1;
            }
        });
        turret.on('pointerout', function()
        {
            if(!startGame){
                turret.setScale(1, 1);
                textNextLevel.alpha = 1;
                upgrade.alpha = 0;
            }

        });
        turret.on('pointerdown', function(){
            if(!startGame && MONEY >= 450){
                BULLET_DAMAGE += 50;
                MONEY -= 450;
                turret.setTint(0xFF0000);
                turret.disableInteractive();
                textCurrency.text = 'Money: ' + MONEY;
                console.log(BULLET_DAMAGE);
            }

        });
    })
}


// be able to switch scenes.
function switchButton(button, thegame, whichScene){
    button.on('pointerdown', function()
        {
        pauseButton.alpha = 1;
        thegame.scene.switch(whichScene);
        }, thegame);
    console.log('start alpha is ' + startButton.alpha);
    console.log('pause alpha is ' + pauseButton.alpha);
    // console.log('resume alpha is ' + resumeButton.alpha);
}













