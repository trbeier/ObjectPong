// Oject Pong Clone In JavaScript
// By: Matt Mongeau
// https://jsfiddle.net/kHJr6/2/
// Modified by:  Tony Beier May 10, 2020

const maxPaddleSpeed = 4;
const paddleHeight = 10;
const paddleWidth = 50;

const topPlayer = -1;
var topPlayerScore = document.getElementById("topPlayerScore");

const bottomPlayer = 1;
var bottomPlayerScore = document.getElementById("bottomPlayerScore");

const ballSize = 5;

// By:  Tony Beier May 10, 2020
class Paddle extends Character {
    constructor(playerPosition, playerImageID) {
        var row = 0;

        if (playerPosition === bottomPlayer)
            row = canvas.height - (paddleHeight * 2);
        else if (playerPosition === topPlayer)
            row = paddleHeight;
        else
            alert("Invalid Player #" + playerPosition);

        super(CenterColOfCanvas(paddleWidth), row, paddleWidth, paddleHeight, "#0000FF", "rectangle");

        this.playerPosition = playerPosition;

        if (playerImageID) { // == undefined || playerImageID == null || playerImageID == "")
        //    this.playerImage = null;
        //else {
            this.playerImage = document.getElementById(playerImageID);
            if (playerPosition == topPlayer)
                this.playerImage.className = "topPlayer";
            else
                this.playerImage.className = "bottomPlayer";
            this.playerImage.style.display = "inline-block";
        }

        this.colSpeed = 0;
        this.rowSpeed = 0;

        this.wins = 0;
    }

    // By:  Tony Beier May 10, 2020
    CheckSpeed() {
        // By: Matt Mongeau
        // Reduce speed to the allowed maximum (no cheating)
        if (this.colSpeed < 0 && this.colSpeed < -maxPaddleSpeed) { // max speed left
            this.colSpeed = -maxPaddleSpeed;
        } else if (this.colSpeed > 0 && this.colSpeed > maxPaddleSpeed) { // max speed right
            this.colSpeed = maxPaddleSpeed;
        }
    }

    // By:  Tony Beier May 10, 2020
    DrawIt() {
        super.DrawIt()

        if (this.playerImage != null)
            this.playerImage.style.left = this.col + "px";
    }

    // By: Matt Mongeau
    MoveIt() {
        this.CheckSpeed();

        super.MoveIt();

        if (LeftOfCanvas(this.col)) {
            this.col = 0;
            this.colSpeed = 0;
        } else if (RightOfCanvas(this.right)) {
            this.col = canvas.width - this.width;
            this.colSpeed = 0;
        }
    }

    // By:  Tony Beier May 10, 2020
    Wins() {
        this.wins++;
        if (this.playerPosition == topPlayer)
            topPlayerScore.innerHTML = "Top: " + this.wins;
        else
            bottomPlayerScore.innerHTML = "Bottom: " + this.wins;
    }
}

// By:  Tony Beier May 10, 2020
class Player extends Paddle {
    constructor(playerPosition, playerImageID) {
        super(playerPosition, playerImageID);
    }

    // By: Matt Mongeau
    Update(ball) {
        for (var key in keysDown) {
            var value = Number(key);
            if (value == leftArrowKey) {
                this.colSpeed = -maxPaddleSpeed;
            } else if (value == rightArrowKey) {
                this.colSpeed = maxPaddleSpeed;
            } else {
                this.colSpeed = 0;  // stop moving
            }
            this.MoveIt();
        }
    }
}



// *** Computer AI ****
// By: Matt Mongeau
class Computer extends Paddle {
    constructor(playerPosition) {
        super(playerPosition);
    }

    Update(ball) {
        this.colSpeed = ball.col - this.colCenter;

        this.MoveIt();
    }
}

// *** Tony AI ****
// By:  Tony Beier May 10, 2020
class Tony extends Paddle {
    constructor(playerPosition) {
        super(playerPosition, "tony");
    }

    Update(ball) {
        if (this.HeadingToMyRow(ball)) {
            this.colSpeed = ball.col - this.colCenter;
            this.colSpeed *= 2;
            this.CheckSpeed();

            var rowDistance = Math.abs(this.row - ball.row) / canvas.height;
            if (rowDistance < 0.25)
                this.colSpeed /= 1;
            else
                if (rowDistance < 0.5)
                    this.colSpeed /= 2;
                else
                    if (rowDistance < 0.75)
                        this.colSpeed /= 3;
                    else
                        this.colSpeed /= 4;
        } else {
            this.colSpeed = CenterColOfCanvas(this.width) - this.col;
            this.colSpeed = Math.sign(this.colSpeed);
        }

        this.MoveIt();
    }
}


// *** Cheating  AI ****
// By:  Tony Beier May 10, 2020
class Cheater extends Paddle {
    constructor(playerPosition) {
        super(playerPosition);
    }

    Update(ball) {
        if (this.HeadingToMyRow(ball)) {
            if (!this.weHaveCalculated) {
                this.weHaveCalculated = false;

                var simCol = ball.col;
                var simColSpeed = ball.colSpeed;
                var simRow = ball.row;

                // Simulate the balls movement.
                while (this.DistanceToMyRow(simRow) > 0) {
                    simCol += simColSpeed;
                    simRow += ball.rowSpeed;

                    if (LeftOfCanvas(simCol + ball.radius)) {
                        simCol = ball.radius;
                        simColSpeed = -simColSpeed;
                    } else if (RightOfCanvas(simCol - ball.radius)) {
                        simCol = canvas.width - ball.radius;
                        simColSpeed = -simColSpeed;
                    }
                }
                // Calculate where we have to be.
                this.colSpeed = simCol - this.colCenter;
                // Calculate how much time we have to get there.
                this.colSpeed /= this.DistanceToMyRow(ball.row) / Math.abs(ball.rowSpeed);
            }
        } else {
            this.weHaveCalculated = false;
            this.colSpeed = CenterColOfCanvas(this.width) - this.col;
            // Calculate how much time we have to get there.
            this.colSpeed = Math.sign(this.colSpeed);
        }

        this.MoveIt();
    }
}


// By: Matt Mongeau
class Ball extends Character {
    // By:  Tony Beier May 10, 2020
    constructor(col, row) {
        super(col, row, ballSize * 2, ballSize * 2, "#000000", "ball");

        this.colSpeed = 1;
        this.rowSpeed = 3;
        this.radius = ballSize;
    }

    // By:  Tony Beier May 10, 2020
    Reset() {
        this.colSpeed = 1;
        this.rowSpeed = 3;
        this.col = canvas.width / 2;
        this.row = canvas.height / 2;
    }

    // By: Matt Mongeau
    Update(paddle1, paddle2) {
        super.MoveIt();

        if (AboveCanvas(this.row)) {
            paddle1.Wins();
            this.Reset();
            return;
        } else if (BelowCanvas(this.row)) {
            paddle2.Wins();
            this.Reset();
            return;
        }

        if (LeftOfCanvas(this.left)) {
            this.col = this.radius;
            this.colSpeed = -this.colSpeed;
        } else if (RightOfCanvas(this.right)) {
            this.col = canvas.width - this.radius;
            this.colSpeed = -this.colSpeed;
        }

        var collideWith = this.WeHaveCollidedWith();
        if (collideWith != NoCollission) {
            this.colSpeed += Math.sign(this.colSpeed) * Math.random() * (maxPaddleSpeed / 2);
            this.rowSpeed = -this.rowSpeed;
            if (Math.abs(this.rowSpeed) < this.height / 2)
                this.rowSpeed += Math.sign(this.rowSpeed);
            this.row += this.rowSpeed;
        }
    }
}

var keysDown = {};

var player1 = new Cheater(bottomPlayer);
var player2 = new Cheater(topPlayer);
var ball = new Ball(canvas.width / 2, canvas.height / 2);

// By: Matt Mongeau
var DrawEverything = function () {
    Canvas2D.fillStyle = "#FF00FF";
    Canvas2D.fillRect(0, 0, canvas.width, canvas.height);
    player1.DrawIt();
    player2.DrawIt();
    ball.DrawIt();
}


// By: Matt Mongeau
var UpdateEverything = function () {
    player1.Update(ball);
    player2.Update(ball);
    ball.Update(player1, player2);
}


// By: Matt Mongeau
window.addEventListener("keydown", function (event) {
    keysDown[event.keyCode] = true;
});
window.addEventListener("keyup", function (event) {
    delete keysDown[event.keyCode];
});
