 const http = require('http');
 const express = require('express');
 const path = require('path');
 const app = express();
 const server = http.createServer(app);
 const io = require('socket.io')(server);

 app.use(express.static(path.join(__dirname, "./public")));

 app.get('/',(req,res)=>{
    
 });

 let activeSockets = [];

 io.on("connection", socket => {
     const existingSocket = activeSockets.find(
       existingSocket => existingSocket === socket.id
     );
 
     if (!existingSocket) {
       activeSockets.push(socket.id);
 
       socket.emit("update-user-list", {
         users: activeSockets.filter(
           existingSocket => existingSocket !== socket.id
         )
       });
 
       socket.broadcast.emit("update-user-list", {
         users: [socket.id]
       });
     }

     socket.on("disconnect", () => {
          activeSockets = activeSockets.filter(
            existingSocket => existingSocket !== socket.id
          );
          socket.broadcast.emit("remove-user", {
            socketId: socket.id
          });
      });

      socket.on("call-user", data => {
          socket.to(data.to).emit("call-made", {
            offer: data.offer,
            socket: socket.id
          });
      });
     
      socket.on("make-answer", data => {
          socket.to(data.to).emit("answer-made", {
            socket: socket.id,
            answer: data.answer
          });
       });

   });

 let port = process.env.PORT || 5000;

 server.listen(port,()=>{
    console.log(`Listening to port : ${port}`)
 });