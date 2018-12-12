
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
        ENEMY_MAX_QTY += 2;
        ENEMY_SPEED += .00001;
        CURRENT_LVL_QTY = 0;
        textRoundOver.alpha = 0;
        startGame = false;
        textLevel.text = 'Level: ' + LEVEL;
        console.log(startGame);
    }
    console.log('Current Level is ' + LEVEL);
}















