'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'


const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/candy.png">'

// Model:
var gBoard
var gGamerPos
var gBallsCollected = 0
var gBallExsist = 2
var gInteval
var gIsGlue = false



function onInitGame() {
    gGamerPos = { i: 2, j: 9 }
    gBoard = buildBoard()
    renderBoard(gBoard)
    gInteval = setInterval(renderBall, 4000)
    setInterval(renderGlue, 5000)

}

function buildBoard() {
    const board = []
    // DONE: Create the Matrix 10 * 12 
    // DONE: Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < 10; i++) {
        board[i] = []
        for (var j = 0; j < 12; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 || i === 9 || j === 0 || j === 11) {
                board[i][j].type = WALL
            }
        }
    }
    // DONE: Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[5][5].gameElement = BALL
    board[7][2].gameElement = BALL
    board[0][5].type = FLOOR
    board[9][5].type = FLOOR
    board[5][0].type = FLOOR
    board[5][11].type = FLOOR

    return board
}

// Render the board to an HTML table
function renderBoard(board) {

    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            var cellClass = getClassName({ i: i, j: j })
            // console.log('cellClass:', cellClass)

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >\n`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            }


            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
    if (gIsGlue) return

    // Calculate distance to make sure we are moving to a neighbor cell
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)

    // If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

        if (j === -1) j = 11
        else if (j === 12) j = 0
        else if (i === -1) i = 9
        else if (i === 10) i = 0

        const targetCell = gBoard[i][j]
        if (targetCell.type === WALL) return

        if (targetCell.gameElement === BALL) {
            gBallsCollected++
            var header = document.querySelector('h2')
            header.innerText = `Ball Collected:${gBallsCollected}`
            var audio = new Audio('pop.wav')
            audio.play()

        }
        if (targetCell.gameElement === GLUE) {
            gIsGlue = true
            setTimeout(() => {
                gIsGlue = false
            }, 3000);

        }
        // DONE: Move the gamer
        // REMOVING FROM
        // update Model
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        // update DOM
        renderCell(gGamerPos, '')
        // ADD TO
        // update Model
        targetCell.gameElement = GAMER
        gGamerPos = { i, j }
        // update DOM
        renderCell(gGamerPos, GAMER_IMG)
        countNegs()
        setTimeout(() => {
            stopGame()
        }, 10);
    }


}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location) // cell-i-j
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value

}

// Move the player by keyboard arrows
function onHandleKey(event) {
    const i = gGamerPos.i
    const j = gGamerPos.j

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
            moveTo(i + 1, j)
            break
    }
}

// Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function findEmptyCells() {
    const emptyCells = []

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.type === FLOOR) {
                emptyCells.push({ i, j })
            }
        }
    }

    return emptyCells
}


function renderBall() {

    var emptyCells = findEmptyCells()
    var cellPos = emptyCells[getRandom(0, emptyCells.length - 1)]

    //update the dom
    renderCell(cellPos, BALL_IMG)
    //update the model
    ++gBallExsist
    gBoard[cellPos.i][cellPos.j].gameElement = BALL

}


function stopGame() {
    if (gBallExsist === gBallsCollected) {
        clearInterval(gInteval)
        alert('Victory')
        var restartBtn = document.querySelector('.restart-btn')
        restartBtn.style.display = "block"
    }

}


function resetBtn() {
    var restartBtn = document.querySelector('.restart-btn')
    restartBtn.style.display = "none"
    gBallExsist = 2
    gBallsCollected = 0
    var header = document.querySelector('h2')
    header.innerText = `Ball Collected:${gBallsCollected}`
    onInitGame()
}


function countNegs() {
    var negsCount = 0
    var gBallsAroundGamer = document.querySelector('.balls-around')

    for (var i = gGamerPos.i - 1; i <= gGamerPos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = gGamerPos.j - 1; j <= gGamerPos.j + 1; j++) {
            if (i === gGamerPos.i && j === gGamerPos.j) continue
            if (j < 0 || j >= gBoard[i].length) continue
            // if (mat[i][j] === LIFE || mat[i][j] === SUPER_LIFE) negsCount++
            if (gBoard[i][j].gameElement === BALL) negsCount++
            // if (gBoard[i][j]) negsCount++
        }
    }
    gBallsAroundGamer.innerText = `Balls Around The Player:${negsCount}`
    return negsCount
}

function renderGlue() {

    var emptyCells = findEmptyCells()
    var cellPos = emptyCells[getRandom(0, emptyCells.length - 1)]
    gBoard[cellPos.i][cellPos.j].gameElement = GLUE
    renderCell(cellPos, GLUE_IMG)
    setTimeout(() => {
        if (gBoard[cellPos.i][cellPos.j].gameElement = GLUE) {
            gBoard[cellPos.i][cellPos.j].gameElement = null
            renderCell(cellPos, '')
        }
    }, 3000);

}






