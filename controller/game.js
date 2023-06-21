const { clog } = require('../config/utils');
// --------------------------------------------------------------------

let players = []; // 存储玩家连接
let currentPlayer = 0; // 当前玩家索引
let board = ['', '', '', '', '', '', '', '', '']; // 游戏棋盘
let gameOver = false; // 游戏结束标志

// 检查游戏胜利条件
function checkWinCondition(board, currentPlayer) {
  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // 水平线
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // 垂直线
    [0, 4, 8], [2, 4, 6] // 对角线
  ];

  return winningCombos.some((combo) => {
    const [a, b, c] = combo;
    return (
      board[a] === board[b] &&
      board[b] === board[c] &&
      board[a] === (currentPlayer === 0 ? 'X' : 'O')
    );
  });
}
exports.game = (io) => {
    // io 連接伺服器
    io.on('connection', (socket) => {
      clog('遊戲已連接!');
      // 向前端發送歷史紀錄至聊天室
      io.emit('game joined', "user_body");
      // 向前端發送事件，通知角色已加入聊天室
      io.emit('game left', "user_list");
  
      // -----------------------------------------------------------------
    
      // 如果当前玩家数量已满，拒绝连接
      if (players.length >= 2) {
        socket.emit('connectionRejected');
        socket.disconnect();
        return;
      }
  
      // 添加新玩家
      players.push(socket);
  
      // 发送玩家编号给客户端
      socket.emit('playerId', players.length);
  
      // 游戏开始
      if (players.length === 2) {
        clog('A user connected');
        io.emit('gameStart');
      }
  
      // 处理玩家下棋
      socket.on('makeMove', (index) => {
        if (socket === players[currentPlayer] && !gameOver && board[index] === '') {
          board[index] = currentPlayer === 0 ? 'X' : 'O';
          io.emit('moveMade', { index, symbol: board[index] });
  
          // 检查游戏结果
          if (checkWinCondition(board, currentPlayer)) {
            io.emit('gameOver', currentPlayer + 1);
            gameOver = true;
          } else if (board.every((cell) => cell !== '')) {
            io.emit('gameOver', 0); // 平局
            gameOver = true;
          } else {
            currentPlayer = (currentPlayer + 1) % 2; // 切换到下一个玩家
            io.emit('nextTurn', currentPlayer + 1);
          }
        }
      });
  
      // 处理重新开始
      socket.on('restartGame', () => {
        if (players.length === 2 && gameOver) {
          currentPlayer = 0;
          board = ['', '', '', '', '', '', '', '', ''];
          gameOver = false;
          io.emit('gameRestart');
        }
      });
  
      // 处理玩家断开连接
      socket.on('disconnect', () => {
        players = players.filter((player) => player !== socket);
        if (players.length < 2 && gameOver) {
          gameOver = false;
        }
      });
    });
  }