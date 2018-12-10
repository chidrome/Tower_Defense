var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 840,
    height: 650,   
    scene: {
        key: 'main',
        preload: preload,
        create: create,
        update: update
    }
};
var game = new Phaser.Game(config);
 
var graphics;
var path;
 
function preload() {
    // load the game assets – enemy and turret atlas
    this.load.atlas('sprites', 'assets/spritesheet.png', 'assets/spritesheet.json');    
    this.load.image('bullet', 'assets/bullet.png');
}
 
function create() {
    // this graphics element is only for visualization, 
    // its not related to our path
    var graphics = this.add.graphics();    
    
    // the path for our enemies
    // parameters are the start x and y of our path
    path = this.add.path(100, 655);
    path.lineTo(100, 150); // first turn
    path.lineTo(107, 130);
    path.lineTo(125, 117);
    path.lineTo(150, 112);
    path.lineTo(225, 100);
    path.lineTo(275, 95);
    path.lineTo(300, 93);
    path.lineTo(350, 90);
    path.lineTo(425, 93);
    path.lineTo(475, 100);
    path.lineTo(550, 125);
    path.lineTo(600, 150); // second turn
    path.lineTo(633, 200);
    path.lineTo(650, 250);
    path.lineTo(633, 300);
    path.lineTo(600, 350); // third turn
    path.lineTo(450, 280);
    path.lineTo(300, 300); // fourth turn
    path.lineTo(250, 440);
    path.lineTo(300, 580); // fifth turn
    path.lineTo(450, 620);
    path.lineTo(860, 400); // end


    
    graphics.lineStyle(6, 0xffffff, 1);
    // visualize the path
    path.draw(graphics);
}
 
function update() {
    
}