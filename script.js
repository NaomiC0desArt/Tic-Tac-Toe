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

    if (!isCellEmpty) return false;

    const addToken = board[row][column].addToken(player);
    return true;
  };

  const printBoard = () => {
    const boardWithCellValues = board.map((row) =>
      row.map((cell) => cell.getValue())
    );

    console.log(boardWithCellValues);
  };

  const cleanBoard = () => {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        board[i][j] = Cell();
      }
    }
  };

  return { getBoard, dropToken, printBoard, cleanBoard };
}

function GameController(
  playerOneName = "Player One",
  playerTwoName = "Player Two"
) {
  const board = Gameboard();

  const players = [
    {
      name: playerOneName,
      token: "🌿",
    },
    {
      name: playerTwoName,
      token: "◯",
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
    const moveSuccessfull = board.dropToken(
      column,
      row,
      getActivePlayer().token
    );

    if (!moveSuccessfull) {
      console.log("Invalid move! Cell is occupied.");
      return { result: "invalid" };
    }
    //2. Check for win
    if (checkForWin(getActivePlayer().token)) {
      console.log(`${getActivePlayer().name} has won this round.`);
      board.printBoard();
      return { result: "win", winner: getActivePlayer().name };
    }
    //3. check for tie
    if (checkIfBoardIsFull()) {
      console.log(`It's a tie!!`);
      return { result: "tie" };
    }
    //4. Switch turns
    switchPlayerTurn();

    //5. Announce new round
    printNewRound();
    return { result: "ongoing" };
  };

  const resetGame = () => {
    board.cleanBoard();
    activePlayer = players[0];
  };

  printNewRound();

  return { playRound, getActivePlayer, getBoard: board.getBoard, resetGame };
}

function ScreenController() {
  const dialog = document.querySelector("#dialog");
  const form = document.querySelector("#nameForm");

  dialog.showModal();

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const Player1name = document.querySelector("#player-one").value;
    const Player2name = document.querySelector("#player-two").value;

    dialog.close();

    const game = GameController(Player1name, Player2name);

    //ui
    const playerTurnDiv = document.querySelector(".display-turn");
    const boardDiv = document.querySelector(".buttons-container");

    const updateScreen = () => {
      boardDiv.textContent = "";

      const board = game.getBoard();
      const activePlayer = game.getActivePlayer();

      playerTurnDiv.textContent = `${activePlayer.name}'s turn...`;

      board.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
          const cellButton = document.createElement("button");
          cellButton.classList.add("cell");

          cellButton.dataset.column = cellIndex;
          cellButton.dataset.row = rowIndex;

          const cellValue = cell.getValue();
          cellButton.textContent = cellValue === 0 ? "" : cellValue;

          boardDiv.appendChild(cellButton);
        });
      });
    };

    function clickHandlerBoard(e) {
      if (!e.target.dataset.row) return;

      const selectedRow = parseInt(e.target.dataset.row);
      const selectedColumn = parseInt(e.target.dataset.column);

      const result = game.playRound(selectedColumn, selectedRow);

      if (result.result === "invalid") {
        playerTurnDiv.textContent = "Invalid move! Cell is occupied.";
        return;
      }

      updateScreen();

      if (result.result === "win") {
        boardDiv.removeEventListener("click", clickHandlerBoard);
        playerTurnDiv.textContent = `Game Over! ${result.winner} has won`;
      }
      if (result.result === "tie") {
        boardDiv.removeEventListener("click", clickHandlerBoard);
        playerTurnDiv.textContent = `Game Over! It's a tie`;
      }
    }

    boardDiv.addEventListener("click", clickHandlerBoard);
    updateScreen();

    const resetBtn = document.querySelector(".reset-btn");

    resetBtn.addEventListener("click", () => {
      game.resetGame();
      boardDiv.addEventListener("click", clickHandlerBoard);
      updateScreen();
    });
  });
}

ScreenController();
