var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

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
var dal = new d.DAL();
//Variaveis da aplicação
var videos = [   //videos 1 and 2;
        {dur: 30, chuncks:6, url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/b01_", chunk:1, full_url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/b01.webm"},
        {dur: 35, chuncks:7, url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/b02_", chunk:1, full_url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/b02.webm"},
        {dur: 30, chuncks:6, url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/b03_", chunk:1, full_url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/b03.webm"},
        {dur: 35, chuncks:7, url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/b04_", chunk:1, full_url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/b04.webm"}
      ];          
var scores = {};          //Lista com a pontuação dos participantes;
var currentPair = {};     //par de ASSETS sendo analisados no momento;
var nextpair = [];        //lista de prioridades a serem checadas;
var confirm = [];         //lista que aguarda confirmação;
var done = false;         //saber se já encontrou todas as relações;
var count = 0;
var vi = 0;
var vj = 1;

//Initialize DAL:
for(var i=0; i<videos.length; i++){
  dal.addAsset(new d.Asset(videos[i].full_url,videos[i].url,videos[i].dur));
}

//Ao conectar;
io.on('connection', function (socket) {
    console.log("Connection estabilished");
    
    if(done){
      socket.send(JSON.stringify( {act:"end"} ));
    }else{
      socket.send(JSON.stringify( getNextPair() ));
    }
    
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
        //Incrementa a pontuação por ter contribuido;
        addScore(obj.user_id,10);
        //verifica se é uma confirmação
        if(obj.status == "confirm"){
          //+ 1 por ter encontrado algo;
          addScore(obj.user_id,1);
          //Como são apenas dois videos, se achar um acabou;
          if(obj.c == "true"){
            //BINGO
            addScore(obj.user_id,100);
            dal.addContribution(dal.getAsset(obj.v1_url), dal.getAsset(obj.v2_url), obj.delta);
            //dal.updateAll();
            //dal.print();
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
      }else if (obj.act == "getPresentation") {
        socket.send( JSON.stringify(dal.getPresentation()) );
      }
      else if (obj.act == "getScore") {
        var obj1 = {act:"score", data:scores[obj.user_id]};
        var c = JSON.stringify(obj1);
        socket.send(c);
      }
    });
  });
  
function getNextPair(){
  console.log("Proximo Par:");
  var cp = dal.chooseNextPair();
  currentPair = [getLocalindex(cp.frm,videos),getLocalindex(cp.to,videos)];  //Indices dos videos no vetor local;
  console.log(currentPair);
  if(nextpair.length == 0){
    count++;
    return {id:count, act:"sync", v1_url:videos[currentPair[0]].url ,v2_url:videos[currentPair[1]].url, v1_c:videos[currentPair[0]].chunk ,v2_c:videos[currentPair[1]].chunk, type:"new"};
  }else{
    var o = nextpair.pop();
    return {id:nextpair.length ,act:"sync", v1_url:videos[currentPair[0]].url ,v2_url:videos[currentPair[1]].url, v1_c:o[currentPair[0]] ,v2_c:o[currentPair[1]], type:"confirm"};
  }
}

//Retorna o indice daquele asset no vetor local inicial;
function getLocalindex(asset,v){
  for(var i=0; i<v.length; i++){
    if(v[i].url == asset.label){
      return i;
    }
  }
}

function addScore(user,value){
  if(scores[user] == null){
    scores[user] = value;
  } else{
    scores[user] += value;
  }
  console.log(scores);
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});
