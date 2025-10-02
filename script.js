function Cell() {
  let value = 0;

  const addToken = (player) => {
    value = player;
  };

  const getValue = () => value;

  return { addToken, getValue };
}

function Gameboard() {
  const rows = 3;
  const columns = 3;
  const board = [];

  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      board[i].push(Cell());
    }
  }

  const getBoard = () => board;

  const dropToken = (column, row, player) => {
    const cellValue = board[row][column].getValue();
    const isCellEmpty = cellValue === 0;

    if (!isCellEmpty) return;

    const addToken = board[row][column].addToken(player);
  };

  const printBoard = () => {
    const boardWithCellValues = board.map((row) =>
      row.map((cell) => cell.getValue())
    );

    console.log(boardWithCellValues);
  };

  return { getBoard, dropToken, printBoard };
}

function GameController(
  playerOneName = "Player One",
  playerTwoName = "Player Two"
) {
  const board = Gameboard();

  const players = [
    {
      name: playerOneName,
      token: "X",
    },
    {
      name: playerTwoName,
      token: "O",
    },
  ];

  let activePlayer = players[0];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const getActivePlayer = () => activePlayer;

  const printNewRound = () => {
    board.printBoard();
    console.log(`${getActivePlayer().name}'s turn.`);
  };

  //winning logic
  const checkRows = (board, token) => {
    for (let i = 0; i < 3; i++) {
      if (board[i].every((cell) => cell.getValue() === token)) {
        return true;
      }
    }
    return false;
  };

  const checkColumns = (board, token) => {
    for (let i = 0; i < 3; i++) {
      let winColumn = true;

      for (let j = 0; j < 3; j++) {
        if (board[j][i].getValue() !== token) {
          winColumn = false;
          break;
        }
      }
      if (winColumn) {
        return true;
      }
    }
    return false;
  };

  const checkDiagonals = (board, token) => {
    const isMainDiagonalWin =
      board[0][0].getValue() === token &&
      board[1][1].getValue() === token &&
      board[2][2].getValue() === token;

    const isAntiDiagonalWin =
      board[0][2].getValue() === token &&
      board[1][1].getValue() === token &&
      board[2][0].getValue() === token;

    if (isMainDiagonalWin || isAntiDiagonalWin) {
      return true;
    }

    return false;
  };

  const checkForWin = (token) => {
    if (checkRows(board.getBoard(), token)) {
      return true;
    }
    if (checkColumns(board.getBoard(), token)) {
      return true;
    }
    if (checkDiagonals(board.getBoard(), token)) {
      return true;
    }
    return false;
  };

  const checkIfBoardIsFull = () => {
    const flatBoard = board.getBoard().flat();

    if (flatBoard.some((cell) => cell.getValue() === 0)) {
      return false;
    }
    return true;
  };

  //play round logic
  const playRound = (column, row) => {
    // 1. Drop the token
    board.dropToken(column, row, getActivePlayer().token);

    //2. Check for win
    if (checkForWin(getActivePlayer().token)) {
      console.log(`${getActivePlayer().name} has won this round.`);
      board.printBoard();
      return;
    }
    //3. check for tie
    if (checkIfBoardIsFull()) {
      console.log(`It's a tie!!`);
      return;
    }
    //4. Switch turns
    switchPlayerTurn();

    //5. Announce new round
    printNewRound();
  };

  printNewRound();

  return { playRound, getActivePlayer };
}

