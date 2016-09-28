var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);
var d = require("./dal.js");

router.use(express.static(path.resolve(__dirname, 'client')));
var messages = [];
var sockets = [];
var dal = new d.DLA();
//Variaveis da aplicação
var videos = [   //videos 1 and 2;
        {dur: 30, chuncks:6, url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/b01_", chunk:1},
        {dur: 35, chuncks:7, url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/b02_", chunk:1}
      ];          
var nextpair = [];       //lista de prioridades a serem checadas;
var confirm = [];        //lista que aguarda confirmação;
var done = false;        //saber se já encontrou todas as relações;
var count = 0;
var vi = 0;
var vj = 1;

//Initialize DAL:
for(var i=0; i<videos.length; i++){
  dal.addAsset(new d.Asset(videos[i].url,videos[i].url,videos[i].dur));
}

//Ao conectar;
io.on('connection', function (socket) {
    console.log("Connection estabilished");
    
    if(done){
      io.send(JSON.stringify( {act:"end"} ));
    }else{
      console.log("Sent Videos");
      io.send(JSON.stringify( getNextPair() ));
    }
    
    //socket.emit("message", JSON.stringify(dal.getPresentation()) );
    //socket.emit("message", JSON.stringify(dal.getPresentation()) );
    //Adiciona o socket à lista de conexões;
    sockets.push(socket);
    //Quando desconectar
    socket.on('disconnect', function () {
        //remove o socket da lista;
      sockets.splice(sockets.indexOf(socket), 1);

    });
    //Ao receber a mensagem
    socket.on('message', function (msg) {
        console.log("");
        console.log("Recebeu", msg);
        console.log("");
        //transforma a mensagem em um objeto;
        var obj = JSON.parse(msg);
        if(obj.act == "sync"){
        //verifica se é uma confirmação
        if(obj.status == "confirm"){
          //Como são apenas dois videos, se achar um acabou;
          if(obj.c == "true"){
            dal.addContribution(dal.getAsset(obj.v1_url),dal.getAsset(obj.v2_url),obj.delta);
            dal.updateAll();
            dal.print();
            done = true;
          }else{
            //Se não confirmar, remove;
            confirm.splice(obj.id,1);
          }
        //Se não é confirmação, é new:
        //Se não achou:
        }else if(obj.c == "false"){
          //Pega o proximo chunck do video"i"
          videos[vi].chunk++;
          //Se chegou no ultimo chunck, anda com o "j" e reinicializa o "i"
          if(videos[vi].chunk > videos[vi].chuncks){
            videos[vi].chunk = 1;
            videos[vj].chunk++;
          }
          //Se video "j" chego uao ultimo chunck, não achou nada :(
          if(videos[vj].chunk > videos[vj].chuncks){
            done = true;
          }    
        //Se achou, vai para a confirmação:
        }else if(obj.c == "true"){
          nextpair.push([videos[vi].chunk,videos[vj].chunk]);
        }
      }
    });
  });
  
function getNextPair(){
  if(nextpair.length == 0){
    count++;
    return {id:count, act:"sync", v1_url:videos[0].url ,v2_url:videos[1].url, v1_c:videos[0].chunk ,v2_c:videos[1].chunk, type:"new"};
  }else{
    var o = nextpair.pop();
    return {id:nextpair.length ,act:"sync", v1_url:videos[0].url ,v2_url:videos[1].url, v1_c:o[0] ,v2_c:o[1], type:"confirm"};
  }
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});
