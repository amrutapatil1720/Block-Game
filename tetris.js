
const cvs = document.getElementById("tetris"); //select element of canvas
const ctx = cvs.getContext("2d"); // getContext() allows us various things to draw on canvas
const scoreElement = document.getElementById("score");

const row = 20;
const col = column = 10;
const SQ = squareSize = 20;
const vacant = "white"; // color of an empty square
var score = 0;

// draw a square
function drawSquare(x,y,color)
{
    ctx.fillStyle = color;
    ctx.fillRect(x*SQ,y*SQ,SQ,SQ);

    ctx.strokeStyle = "black";
    ctx.strokeRect(x*SQ,y*SQ,SQ,SQ);
}

// create the board

let board = []; //define board as empty array
for( r = 0; r <row; r++)
{
    board[r] = [];  //initiate rows with empty array
    for(c = 0; c < col; c++)
	{
        board[r][c] = vacant;  //all squares are vacant initially 
    }
}



// draw the board
function drawBoard()
{
    for( r = 0; r <row; r++){
        for(c = 0; c < col; c++)
		{
            drawSquare(c,r,board[r][c]);  //c=distance from x-axis from left ,r=distance from y-axis from left, board[r][c]=color which is the color of vacant variable
        }
    }
}

drawBoard();

// the pieces and their colors

const PIECES = [
    [Z,"orange"],
    [S,"blue"],
    [T,"purple"],
    [O,"green"],
    [L,"yellow"],
    [I,"pink"],
    [J,"red"]
];



// generate random pieces

function randomPiece()
{
    let r = randomN = Math.floor(Math.random() * PIECES.length) //piece length is 0 till 6
    return new Piece( PIECES[r][0],PIECES[r][1]);
}

let p = randomPiece();

// The Object Piece
//construction function

function Piece(block,color)  //ex. let piece =new piece(z,"blue");
{  
    this.block = block;  //all pattern matrix of Z
    this.color = color;
    
    this.blockNo = 0; // 0 bcz we need to start from first pattern i.e  z[0]
    this.activeBlock = this.block[this.blockNo];   //this.block means 'Z' and this.blockNo is '0' so this.activeBlock=z[0]
    
    //we need to create the pattern before the board start and at the middle position 
    this.x = 3;
    this.y = -2;
}

// fill function

Piece.prototype.fill = function(color)
{
    for( r = 0; r < this.activeBlock.length; r++)
	{
        for(c = 0; c < this.activeBlock.length; c++)
		{
            // we draw only occupied squares
            if( this.activeBlock[r][c])
			{
                drawSquare(this.x + c,this.y + r, color);
            }
        }
    }
}


// draw a piece to the board
Piece.prototype.draw = function()
{
    this.fill(this.color);  // draw the piece with its own color
}

// undraw a piece
// undraw a piece- when we want to move piece from its current position to left then at this time we first have to undraw its current position and then draw to desired position by decreementing x axis value as we are shifting block to left
Piece.prototype.unDraw = function()
{
    this.fill(vacant); //draw the piece with white or color of a  vacant square 
}

// keyPressed the piece by keyword left,right,up and down button 
//Every key on keyboard has a code . left=37, toparrow=38, right=39, down=40
document.addEventListener("keydown",keyPressed);

function keyPressed(event)
{
    if(event.keyCode == 37)
	{
        p.moveLeft();
        dropStart = Date.now();
    }else if(event.keyCode == 38)
	{
        p.rotate();
        dropStart = Date.now();
    }else if(event.keyCode == 39)
	{
        p.moveRight();
        dropStart = Date.now();
    }else if(event.keyCode == 40)
	{
        p.moveDown();
    }
}


// move Down the piece
Piece.prototype.moveDown = function()
{
    if(!this.collision(0,1,this.activeBlock))
	{
        this.unDraw();
        this.y++;
        this.draw();
    }else{
        // we lock the piece and generate a new one
        this.lock();
        p = randomPiece();
    }
    
}

// move Right the piece
Piece.prototype.moveRight = function()
{
    if(!this.collision(1,0,this.activeBlock))
	{
        this.unDraw();
        this.x++;
        this.draw();
    }
}

// move Left the piece
Piece.prototype.moveLeft = function()
{
    if(!this.collision(-1,0,this.activeBlock))
	{
        this.unDraw();
        this.x--;
        this.draw();
    }
}

// rotate the piece
Piece.prototype.rotate = function()
{
    let nextPattern = this.block[(this.blockNo + 1)%this.block.length];
    let wall = 0;
    
    if(this.collision(0,0,nextPattern))
	{
        if(this.x > col/2){
            // it's the right wall
            wall = -1; // we need to move the piece to the left
        }else{
            // it's the left wall
            wall = 1; // we need to move the piece to the right
        }
    }
    
    if(!this.collision(wall,0,nextPattern))
	{
        this.unDraw();
        this.x += wall;
        this.blockNo = (this.blockNo + 1)%this.block.length; // (0+1)%4 => 1
        this.activeBlock = this.block[this.blockNo];
        this.draw();
    }
}



Piece.prototype.lock = function()
{
    for( r = 0; r < this.activeBlock.length; r++)
	{
        for(c = 0; c < this.activeBlock.length; c++){
            // we skip the vacant squares
            if( !this.activeBlock[r][c]){
                continue;
            }
            // pieces to lock on top = game over
            if(this.y + r < 0){
                alert("Game Over");
                // stop request animation frame
                gameOver = true;
                break;
            }
            // we lock the piece
            board[this.y+r][this.x+c] = this.color;
        }
    }
    // remove full rows
    for(r = 0; r < row; r++)
	{
        let isrowFull = true;
        for( c = 0; c < col; c++)
		{
            isrowFull = isrowFull && (board[r][c] != vacant);
        }
        if(isrowFull){
            // if the row is full
            // we move down all the rows above it
            for( y = r; y > 1; y--)
			{
                for( c = 0; c < col; c++)
				{
                    board[y][c] = board[y-1][c];
                }
            }
            // the top row board[0][..] has no row above it
            for( c = 0; c < col; c++)
			{
                board[0][c] = vacant;
            }
            // increment the score
            score += 10;
        }
    }
    // update the board
    drawBoard();
    
    // update the score
    scoreElement.innerHTML = score;
}

// collision fucntion
Piece.prototype.collision = function(x,y,piece)
{
    for( r = 0; r < piece.length; r++)
	{
        for(c = 0; c < piece.length; c++)
		{
            // if square is vacant ,we goto the next movement
            if(!piece[r][c])
			{
                continue;
            }
            // New cordinate of piece after movement
            let newX = this.x + c + x;
            let newY = this.y + r + y;
            
			//if any of the square is beyound the boundries
            if(newX < 0 || newX >= col || newY >= row)
			{
                return true;
            }
            // skip newY < 0; board[-1] will crush our game
            if(newY < 0)
			{
                continue;
            }
            // check if there is a locked piece alrady in place
            if( board[newY][newX] != vacant)
			{
                return true;
            }
        }
    }
    return false;
}


// drop the piece every 1sec

let dropStart = Date.now();
let gameOver = false;
function drop()
{
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > 1000) 
	{
        p.moveDown();
        dropStart = Date.now();
    }
    if( !gameOver) 
	{
        requestAnimationFrame(drop);
    }
}

drop();











