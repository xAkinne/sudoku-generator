// difficulty level controll
// default value: 60
let rmc = 60;
let answerShown = false; // answer button state

// generate full sudoku
function generateSudoku() {
    // gen board with "empty" slots - 0
    let board = Array.from({length: 9}, () => Array(9).fill(0));

    // fill board req
    function fillCell(row, col) {
        if (row === 9) return true; // Cała plansza wypełniona

        // next box
        let nextRow = col === 8 ? row + 1 : row;
        let nextCol = (col + 1) % 9;

        // rand gen
        let numbers = [1,2,3,4,5,6,7,8,9];
        numbers.sort(() => Math.random() - 0.5);

        for (let num of numbers) {
            if (isValid(board, row, col, num)) {
                board[row][col] = num;
                if (fillCell(nextRow, nextCol)) {
                    return true;
                }
                board[row][col] = 0;
            }
        }
        return false; // fail
    }

    fillCell(0, 0);
    return board;
}

// check if col and row in table board is correct
function isValid(board, row, col, num) {
    // check rows
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
    }
    // check cols
    for (let y = 0; y < 9; y++) {
        if (board[y][col] === num) return false;
    }
    // check box
    const startRow = row - row % 3;
    const startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num) return false;
        }
    }
    return true;
}

// check
function sudokuCheck(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            let num = board[row][col];
            if (num === 0) continue; // skip empty
            board[row][col] = 0;
            if (!isValid(board, row, col, num)) {
                board[row][col] = num;
                return false;
            }
            board[row][col] = num;
        }
    }
    return true;
}

// corrector
function sudokuCor(board) {
    // generate new board if something is wrong with current
    if (!sudokuCheck(board)) {
        return generateSudoku();
    }
    return board;
}

// fields removal to create puzzle
function removeNumbersDistributed(board, removalCount) {
    // clear limitations:
    // if rmc <= 27 -> 2 nums per block, else - no limits
    const maxPerBlock = removalCount <= 27 ? 2 : 9;

    // split to 9 block sections (0 -> 8)
    // [blockRow, blockCol] -> [0, 1, 2]
    let blocks = [];
    for (let b = 0; b < 9; b++) {
        blocks[b] = [];
    }
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            let blockIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);
            blocks[blockIndex].push({ row, col });
        }
    }

    let blockRemovalCount = Array(9).fill(0);
    let totalRemoved = 0;
    // loop removes numbers until limit cap or nothing else
    while (totalRemoved < removalCount) {
        // select random block (0 -> 8)
        let blk = Math.floor(Math.random() * 9);
        // if removed maxPerBlock, skip
        if (blockRemovalCount[blk] >= maxPerBlock) continue;

        // select others (no 0)
        let available = blocks[blk].filter(pos => board[pos.row][pos.col] !== 0);
        if (available.length === 0) continue; // every field is empty

        // select random pos
        let pos = available[Math.floor(Math.random() * available.length)];
        board[pos.row][pos.col] = 0;
        blockRemovalCount[blk]++;
        totalRemoved++;
    }

    return board;
}

// generate puzzle and save solution to it
function generatePuzzle(removalCount) {
    let solution = generateSudoku();
    // save solution to public var: sudokuAns
    window.sudokuAns = solution.map(row => row.slice());
    // create backup of solution, and save puzzle to public var: puzzle
    window.puzzle = solution.map(row => row.slice());
    removeNumbersDistributed(puzzle, removalCount);
    return puzzle;
}

// write into html - ustawiamy także disabled dla pól zawierających wartość
function writeInto(board, selector) {
    const inputs = document.querySelectorAll(selector + " td input");
    let idx = 0;
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const input = inputs[idx];
            if (board[row][col] === 0) {
                input.value = "";
                input.disabled = false;
            } else {
                input.value = board[row][col];
                input.disabled = true; // filled field are disabled
            }
            idx++;
        }
    }
}

// no reload generate
function generateNewSudoku() {
    // removal count - difficulty level controll
    let removalCount = rmc;
    let puzzle = generatePuzzle(removalCount);
    writeInto(puzzle, ".sudoku-table");
    // Reset przycisku answer
    answerShown = false;
    document.getElementById("answerBtn").textContent = "Show Answer";
}

// dynamic change rmc value
document.addEventListener("DOMContentLoaded", () => {
    // default slider value
    const diffSlider = document.getElementById("diffSlider");
    diffSlider.value = rmc;
    diffSlider.addEventListener("input", () => {
        rmc = parseInt(diffSlider.value, 10);

    });

    generateNewSudoku();
    // button activator
    document.getElementById("generateSudokuBtn").addEventListener("click", generateNewSudoku);

    // answer button – toggle
    document.getElementById("answerBtn").addEventListener("click", () => {
        if (!answerShown) {
            // show ans
            writeInto(window.sudokuAns, ".sudoku-table");
            document.getElementById("answerBtn").textContent = "Hide Answer";
            answerShown = true;
        } else {
            // show puzz
            writeInto(window.puzzle, ".sudoku-table");
            document.getElementById("answerBtn").textContent = "Show Answer";
            answerShown = false;
        }
    });
});
