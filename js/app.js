// Enemies our player must avoid
var Enemy = function () {
    "use strict";
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.x = -70;
    this.y = 2;
    this.speed = 200;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    "use strict";
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function () {
    "use strict";
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y * 83 - 30);
};

var Player = function () {
    "use strict";
    this.sprite = 'images/char-boy.png';
    this.x = 2;
    this.y = 5;
    this.won = false;
    this.lost = false;
    this.lifes = 3;
    this.wins = 0;
};

Player.prototype.update = function (dt) {
    "use strict";
    if (this.y === 0) {
        this.won = true;
    }
};

Player.prototype.render = function () {
    "use strict";
    ctx.drawImage(Resources.get(this.sprite), this.realX(), this.realY());
};

Player.prototype.realX = function () {
    "use strict";
    return this.x * 101;
};

Player.prototype.realY = function () {
    "use strict";
    return this.y * 83 - 30;
};

function isBlockingObstackle(x, y) {
    "use strict";
    var isBlocking = false;
    allObstackles.forEach(function (obstackle) {
        if (obstackle.x === x && obstackle.y === y) {
            isBlocking = true;
        }
    });
    return isBlocking;
}

Player.prototype.handleInput = function (key) {
    "use strict";
    switch (key) {
        case 'up':
            if (this.y > 0 && !isBlockingObstackle(this.x, this.y - 1)) {
                this.y--;
            }
            break;
        case 'down':
            if (this.y < 5 && !isBlockingObstackle(this.x, this.y + 1)) {
                this.y++;
            }
            break;
        case 'left':
            if (this.x > 0 && !isBlockingObstackle(this.x - 1, this.y)) {
                this.x--;
            }
            break;
        case 'right':
            if (this.x < 4 && !isBlockingObstackle(this.x + 1, this.y)) {
                this.x++;
            }
            break;
    }
};

var Obstackle = function () {
    "use strict";
    this.sprite = 'images/Rock.png';
    this.x = 1;
    this.y = 1;
};

Obstackle.prototype.realX = function () {
    "use strict";
    return this.x * 101;
};

Obstackle.prototype.realY = function () {
    "use strict";
    return this.y * 83 - 30;
};

Obstackle.prototype.render = function () {
    "use strict";
    ctx.drawImage(Resources.get(this.sprite), this.realX(), this.realY());
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
var allObstackles = [];
var player = new Player();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function (e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});