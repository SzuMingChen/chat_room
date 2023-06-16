const { clog } = require('../config/utils');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "*",//! 允許來源，也可以為網域 "*"為允許所有來源 
        method: ["GET", "POST"],//! 設置只允許這兩種請求方式
        credentials: true //! 可允許攜帶身分憑證 ex:cookie
    }
});

// 包成fn引出
module.exports = function (io) {
    //! 須拆出來到獨立區域才不會有重複綁定的問題，因為原本都請求再同一個路由
    // io 連接伺服器
    io.on('connection', (socket) => {
        clog('用戶已連接!');

        // 取得當前連線的人數
        const connectedClients = io.sockets.server.engine.clientsCount;
        clog('目前連線人數:' + connectedClients);

        // 發送聊天訊息事件
        socket.on('chat message', (message) => {
            clog('收到訊息:' + message);
            io.emit('chat message', message); // 廣播訊息給所有客戶端
        });

        // 當客戶端斷開連接時
        socket.on('disconnect', () => {
            clog('用戶連接中斷!');
        });
    });
}
