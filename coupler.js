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
var videos = [   //videos 1 and 2; (3 and 4 = 1 and 2 - para testar o getNextPair quando acabar os chunks)
        {dur: 30, chuncks:6, url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/b01_", chunk:1, full_url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/b01.webm"},
        {dur: 35, chuncks:7, url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/b02_", chunk:1, full_url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/b02.webm"},
        {dur: 30, chuncks:6, url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/b03_", chunk:1, full_url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/b03.webm"},
        {dur: 35, chuncks:7, url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/b04_", chunk:1, full_url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/b04.webm"}      
      ];        
var vChunks = new Array(); //random order of chunks in Videos
var scores = {};          //Lista com a pontuação dos participantes;
var nextpair = [];       //lista de prioridades a serem checadas;
var confirm = [];        //lista que aguarda confirmação;
var done = false;        //saber se já encontrou todas as relações;
var count = 0;
var vi = 0;
var vj = 1;

//Initialize DAL:
for(var i=0; i<videos.length; i++){
  dal.addAsset(new d.Asset(videos[i].full_url,videos[i].url,videos[i].dur));
  vChunks[i] = new Array(videos[i].chuncks);
  for(var c=1; c <= videos[i].chuncks; c++){
    vChunks[i][c] = c;
  }
  shuffle(vChunks[i])
}




//Ao conectar;
io.on('connection', function (socket) {
    console.log("Connection estabilished");
    
    if(done){
      if(vj < videos.length-1){
        vi++;
        vj++;
        videos[vi].chunk = 1;
        done = false;
        console.log("Sent new Videos");
        socket.send(JSON.stringify( getNextPair() ));
      }else{
        socket.send(JSON.stringify( {act:"end"} ));
      }
    }else{
      console.log("Sent new chunks");
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

          if(obj.c == "true"){
            //BINGO
            addScore(obj.user_id,100);
            dal.addContribution(dal.getAsset(obj.v1_url), dal.getAsset(obj.v2_url), obj.delta);
            dal.print();
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
          
          //avisa que houve uma identificacao em um par de chunks, entao vai para o proximo par de videos                
          done = true;

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
  console.log('Vi:'+vi+',Vj:'+vj);
  console.log('Ci:'+videos[vi].chunk+'('+vChunks[vi][videos[vi].chunk]+'),Cj:'+videos[vj].chunk+'('+ vChunks[vj][videos[vj].chunk]+ ')');
  console.log('Done:'+done);

  if(nextpair.length == 0){
    count++;
    return {id:count, act:"sync", v1_url:videos[vi].url ,v2_url:videos[vj].url, v1_c:vChunks[vi][videos[vi].chunk] ,v2_c:vChunks[vj][videos[vj].chunk], type:"new"};
  }else{
    var o = nextpair.pop();
    return {id:nextpair.length ,act:"sync", v1_url:videos[vi].url ,v2_url:videos[vj].url, v1_c:o[vi] ,v2_c:o[vj], type:"confirm"};
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

//Random Shuffling An Array the Fisher-Yates (aka Knuth) Way
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle... (chunk arrays start in 1)
  while (currentIndex > 1) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

