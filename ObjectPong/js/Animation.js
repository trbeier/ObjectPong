// Basic Code for Animations
// By:  Tony Beier May 10 - 20, 2020


// ***** Start Key Codes Constants *****
const leftArrowKey = 37;
const upArrowKey = 38;
const rightArrowKey = 39;
const downArrowKey = 40;
// ***** End Key Codes Constants *****


// ***** Start Setup the Canvas *****
class Canvas {

}
var canvas = document.getElementById('canvas1');
var Canvas2D = canvas.getContext('2d');

function drawDot(col, row) { Canvas2D.fillRect(col, row, 1, 1); }
function drawLine(col1, row1, col2, row2) {
    Canvas2D.beginPath();
    Canvas2D.moveTo(col1, row1);
    Canvas2D.lineTo(col2, row2);
    Canvas2D.stroke();
}
function drawCircle(col, row, radius) {
    Canvas2D.beginPath();
    Canvas2D.arc(col, row, radius, 2 * Math.PI, false);
}
function drawBall(col, row, radius) {
    drawCircle(col, row, radius);
    Canvas2D.fill();
}

function LeftOfCanvas(col) { return (col < 0); }
function CenterColOfCanvas(itemWidth=0) { return (canvas.width - itemWidth) / 2; }
function RightOfCanvas(col) { return (col > canvas.width); }

function AboveCanvas(row) { return (row < 0); }
function CenterRowOfCanvas(itemHeight = 0) { return (canvas.height - itemHeight) / 2; }
function BelowCanvas(row) { return (row > canvas.height); }
// ***** End Setup the Canvas *****


// ***** Start Basic Animation Setup *****
var animate = window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	function (callback) { window.setTimeout(callback, 1000 / 60) };

// These routines will be overridden;
var UpdateEverything = function () { };
var DrawEverything = function () { };

// The animation cycle:  Update, Draw, Wait for next refresh and then do it all again!
var RefreshTheScreen = function () {
	UpdateEverything();
	DrawEverything();
	animate( RefreshTheScreen);
};

// Start the animation;
animate(RefreshTheScreen);

// ***** End Basic Animation Setup *****


// ***** Start Character Object *****
const NoCollission = null;
var characterList = [];

class Character {
    constructor(col, row, width, height, color, shape) {
        this.col = col;
        this.row = row;

        this.width = width;
        this.height = height;

        this.color = color;

        this.isRectangle = (shape.toLowerCase().startsWith("r"));
        this.isBall = (shape.toLowerCase().startsWith("b"));
        if (!this.isBall && !this.isRectangle)
            alert("Unknown shape " + shape);

        this.colSpeed = 0;
        this.rowSpeed = 0;

        this.characterNumber = characterList.push(this) -1;
    }

    get colCenter() { return this.col + (this.width / 2); }
    get rowCenter() { return this.row + (this.height / 2); }
    get top() { return this.row - (this.isBall ? this.radius : 0); }
    get bottom() { return this.row + (this.isBall ? this.radius : this.height); }
    get left() { return this.col - (this.isBall ? this.radius : 0); }
    get right() { return this.col + (this.isBall ? this.radius : this.width); }

    DistanceToMyRow(thatRow) {
        var ret;
        if (this.row == thatRow)
            ret = 0;  // We are already there
        else if (this.row > thatRow)
            ret = this.top - thatRow;
        else
            ret = thatRow - this.bottom;
        return ret;
    }
    HeadingToMyRow(that) {
        if (this.row == that.row)
            return false;  // We are already there
        else if (this.row > that.row)
            return that.rowSpeed > 0;
        else
            return that.rowSpeed < 0;
        // This might work????
        // return Math.sign(this.row - that.row) == Math.sign(that.rowSpeed);
    }

    Collision(that) {
        // Don't check if it collides with itself
        if (this.WeAreTheSame(that))
            return false;
        else
            return (this.top < that.bottom && this.bottom > that.top
                && this.left < that.right && this.right > that.left);
    }
    WeHaveCollidedWith() {
        for (var indeX = 0; indeX < characterList.length; indeX++) {
            if (this.Collision(characterList[indeX]))
                return characterList[indeX];
        }
        // If we get here there was no collission.
        return NoCollission;
    }

    DrawIt() {
        Canvas2D.fillStyle = this.color;
        if (this.isRectangle)
            Canvas2D.fillRect(this.col, this.row, this.width, this.height);
        else if (this.isBall) {
            Canvas2D.beginPath();
            Canvas2D.arc(this.col, this.row, this.radius, 2 * Math.PI, false);
            Canvas2D.fill();
        }
        else
            alert("Unknown shape");
    }

    MoveIt() {
        this.col += this.colSpeed;
        this.row += this.rowSpeed;
    }

    WeAreTheSame(that) {
        return this.characterNumber == that.characterNumber;
    }
}
// ***** End Character Object *****


// get random whole numbers in a specific range
// @see https://stackoverflow.com/a/1527820/2124254
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
// get random whole numbers in a specific range
