/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    "use strict";
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        nextSpawn = 1,
        statusMessage = '',
        statusMessageDuration = 3000,
        statusMessageStart, lastSpawn, lastTime, gameStart, gameDuration, requestId;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;
        gameDuration = (now - gameStart) / 1000.0;


        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);

        if (player.won || player.lost) {
            reset();
        }

        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        requestId = win.requestAnimationFrame(main);
        if (player.lifes === 0) {
            if (requestId) {
                win.cancelAnimationFrame(requestId);
                requestId = undefined;
            }
        }
    }

    /* This function creates a visible message in the middle of the screen for certain amount
     * of time, if you specify duration, it overwrites the default value
    */

    function setMessage(msg, duration) {
        statusMessage = msg;
        statusMessageStart = Date.now();
        if (duration !== undefined) {
            statusMessageDuration = duration;
        }
    }

    /* This function is a clean-up function that removes the enemies off-screen
     * It's called every second
    */

    function removeEntities() {
        var i = allEnemies.length;
        while (i--) {
            if (allEnemies[i].x > 606) {
                allEnemies.splice(i, 1);
            }
        }
        setTimeout(removeEntities, 1000);
    }

    function generateObstackles() {
        var obsCount = 3;
        for (var i=0;i<obsCount;i++) {
            var obstackle = new Obstackle();
            obstackle.y = 4;
            obstackle.x = Math.floor((Math.random()*5));
            allObstackles.push(obstackle);
        }
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        lastSpawn = 0;
        nextSpawn = Math.random()*3000;
        setMessage('Start!', 2000);
        setTimeout(removeEntities, 1000);
        generateObstackles();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        checkCollisions();
    }

    /* This function is called by main and takes care of status messages,
     * specifically the information about the player status - the game has
     * started, the player either won or lost
    */
    function updateStatusMessage() {
        if (statusMessage !== '') {
            if (statusMessageStart + statusMessageDuration >= Date.now()) {
                displayStatusMessage();
            } else {
                statusMessage = '';
            }
        }
    }

    /* This function is called by updateStatusMessage() function and outputs
     * the content of the variable statusMessage on the context
    */
    function displayStatusMessage() {
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = '48px sans-serif';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.fillText(statusMessage, canvas.width/2, canvas.height/2);
        ctx.strokeText(statusMessage, canvas.width/2, canvas.height/2);
    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        if (lastSpawn + nextSpawn < Date.now()) {
            // add an enemy and generate when should next enemy spawn
            var enemy = new Enemy();
            // randomly pick the path (1-3)
            enemy.y = Math.floor((Math.random()*3)+1);
            // randomly set the speed (200-500)
            enemy.speed = Math.random()*300+200;
            allEnemies.push(enemy);
            // randomly pick when next enemy should spawn (0-3000ms)
            nextSpawn = Math.random()*2000;
            lastSpawn = Date.now();
        }

        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();
    }

    function drawLifes() {
        if (player.lifes > 0) {
            for(var i=0;i<player.lifes;i++) {
                ctx.drawImage(Resources.get('images/Heart.png'), 80+25*i, 47, 25, 42);
            }
        }
    }

    /* This function is called by the render function and displays the current
     * game duration in the top right corner
    */
    function renderPermanentText() {
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'right';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        var text = 'Time: '+Math.floor(gameDuration, 2);
        ctx.fillText(text, canvas.width-10, 70);
        ctx.strokeText(text, canvas.width-10, 70);
        text = 'Won: '+player.wins;
        ctx.fillText(text, canvas.width-10, 100);
        ctx.strokeText(text, canvas.width-10, 100);
        ctx.textAlign = 'left';
        text = 'Lifes:';
        drawLifes();
        ctx.fillText(text, 10, 70);
        ctx.strokeText(text, 10, 70);
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        renderEntities();
        renderPermanentText();
        updateStatusMessage();
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        allObstackles.forEach(function(obstackle) {
            obstackle.render();
        });

        player.render();
    }

    function checkCollisions() {
        allEnemies.forEach(function(enemy) {
            if (enemy.x >= player.realX()-70 && enemy.x <= player.realX()+70 &&
                enemy.y === player.y) {
                player.lost = true;
            }
        });
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        if (player.won) {
            setMessage('You won!', 2000);
            player.wins++;
        }
        if (player.lost) {
            player.lifes--;
            if (player.lifes === 0) {
                setMessage('GAME OVER', 2000);
            } else {
                setMessage('You lost!', 2000);
            }
        }
        player.x = 2;
        player.y = 5;
        player.won = false;
        player.lost = false;
        gameStart = Date.now();
        lastSpawn = 0;
        nextSpawn = Math.random()*3000;
        allEnemies = [];
        allObstackles = [];
        generateObstackles();
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/Heart.png',
        'images/Rock.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);