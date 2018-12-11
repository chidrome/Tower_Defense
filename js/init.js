



function drawGrid(graphics) {
    graphics.lineStyle(1, 0x0000ff, 0.8);
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

function placeTurret(pointer) {
    var i = Math.floor(pointer.y/40);
    var j = Math.floor(pointer.x/40);
    if(canPlaceTurret(i, j)) {
        var turret = turrets.get();
        if (turret)
        {
            turret.setActive(true);
            turret.setVisible(true);
            turret.place(i, j);
        }   
    }
}

function canPlaceTurret(i, j) {
    return map[i][j] === 0;
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
        enemy.receiveDamage(bullet_damage);
    }
}

















