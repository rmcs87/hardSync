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
var videos = [   //videos 1 and 2; ([6/7]  3 and 4 = 1 and 2 - para testar o getNextPair quando acabar os chunks)
        {dur: 240, chunks:48, label:"https://dl.dropboxusercontent.com/u/13768488/hardSync/climb/01/01", chunk:1, full_url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/climb/01/01.webm"},
        {dur: 135, chunks:27, label:"https://dl.dropboxusercontent.com/u/13768488/hardSync/climb/02/02", chunk:1, full_url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/climb/02/02.webm"},
        {dur: 230, chunks:46, label:"https://dl.dropboxusercontent.com/u/13768488/hardSync/climb/03/03", chunk:1, full_url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/climb/03/03.webm"},
        {dur: 140, chunks:28, label:"https://dl.dropboxusercontent.com/u/13768488/hardSync/climb/04/04", chunk:1, full_url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/climb/04/04.webm"},
        {dur: 330, chunks:66, label:"https://dl.dropboxusercontent.com/u/13768488/hardSync/climb/05/05", chunk:1, full_url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/climb/05/05.webm"},
        {dur: 98, chunks:19, label:"https://dl.dropboxusercontent.com/u/13768488/hardSync/climb/06/06", chunk:1, full_url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/climb/06/06.webm"},
        {dur: 35, chunks:7, label:"https://dl.dropboxusercontent.com/u/13768488/hardSync/climb/07/07", chunk:1, full_url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/climb/07/07.webm"},
        {dur: 105, chunks:21, label:"https://dl.dropboxusercontent.com/u/13768488/hardSync/climb/08/08", chunk:1, full_url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/climb/08/08.webm"},
        {dur: 80, chunks:16, label:"https://dl.dropboxusercontent.com/u/13768488/hardSync/climb/09/09", chunk:1, full_url:"https://dl.dropboxusercontent.com/u/13768488/hardSync/climb/09/09.webm"}
      ];        
var vChunks = new Array(); //random order of chunks in Videos
var scores = {};          //Lista com a pontuação dos participantes;
//var nextpair = [];       //lista de prioridades a serem checadas;
//var confirm = [];        //lista que aguarda confirmação;
//var done = false;        //saber se já encontrou todas as relações;
//var count = 0;
var vi = 0;
var vj = 1;

//Initialize DAL:
//for(var i=0; i<videos.length; i++){
for(var i=0; i<2; i++){
  dal.addAsset(new d.Asset(videos[i].full_url,videos[i].label,videos[i].dur));
  vChunks[i] = new Array(videos[i].chunks +1);
  for(var c=0; c <= videos[i].chunks; c++){
    vChunks[i][c] = c;
  }
  shuffle(vChunks[i]);
  console.log(vChunks[i]);
}

//Escolhendo  par inicial de videos
var next = dal.chooseNextPair();
vi = getVideoIndex(next.frm.label);
vj = getVideoIndex(next.to.label);
videos[vi].chunk = 1;    
videos[vj].chunk = 1;

//Ao conectar;
io.on('connection', function (socket) {

    console.log("Connection estabilished");
    
    //Adiciona o socket à lista de conexões;
    sockets.push(socket);
    //Quando desconectar
    socket.on('disconnect', function () {
        //remove o socket da lista;
      sockets.splice(sockets.indexOf(socket), 1);

    });
   
    socket.send(JSON.stringify({id:vi*10+vj ,act:"sync", v1_url:videos[vi].label ,v2_url:videos[vj].label, v1_c:vChunks[vi][videos[vi].chunk] ,v2_c:vChunks[vj][videos[vj].chunk], type:"confirm"}));
    console.log('Video: '+vi+' - Chunk: ('+videos[vi].chunk+') '+vChunks[vi][videos[vi].chunk]); 
    console.log('Video: '+vj+' - Chunk: ('+videos[vj].chunk+') '+vChunks[vj][videos[vj].chunk]); 
   
    
    //Ao receber a mensagem
    socket.on('message', function (msg) {
      var confirm = false;
      var delta = 'I';
      
      console.log("Recebeu", msg);
      console.log("");
      //transforma a mensagem em um objeto;
      var obj = JSON.parse(msg);
      
      console.log("ACT");
      console.log(obj.act);
      
      switch (obj.act) {
        case 'getScore':
          socket.send(JSON.stringify({act:"score", data:scores[obj.user_id]}));
          break;
          
        case 'sync':
          switch (obj.status){
            case 'confirm' :
                addScore(obj.user_id,100);
                confirm = true;
                //não existe o break pq a ação default acontece inclusive neste caso.  
            default:
              if( (videos[vj].chunk == videos[vj].chunks && videos[vi].chunk == videos[vi].chunks) || confirm ){
                if(confirm){
                  //Contribution (overrides Impossible to sync)
                 confirm = false;
                 delta = obj.delta;
                }

                dal.addContribution(dal.getAsset(videos[vi].label), dal.getAsset(videos[vj].label), delta, obj.user_id);
                  
                console.log('New Videos');
                var next = dal.chooseNextPair(obj.user_id);
                if(next == null){
                  socket.send(JSON.stringify( {act:"end"} ));
                }else{
                  vi = getVideoIndex(next.frm.label);
                  vj = getVideoIndex(next.to.label);
                  videos[vi].chunk = 1;    
                  videos[vj].chunk = 1;
                }
              }else{
                console.log('New Chunks');
                addScore(obj.user_id,10);
                if(videos[vi].chunk < videos[vi].chunks){
                  videos[vi].chunk++;
                }else{
                  videos[vi].chunk = 1;
                  videos[vj].chunk++;
                }
              } 
          }
      }

      socket.send( JSON.stringify(dal.getPresentation()) );

    });
  });
  


//Retorna o indice do vídeos, utilizado para relacionar com o vetor de chunks aleatorios
function getVideoIndex(label){
  for(var i=0; i < videos.length; i++){
    if(label == videos[i].label){
      return i;
    }
  }
  return -1;
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

//Random Shuffling An Array for the Knuth method
function shuffle(array) {
  var currentIndex = array.length-1, temporaryValue, randomIndex ;

  // While there remain elements to shuffle... (chunk arrays start in 1)
  while (currentIndex > 1) {

    // Pick a remaining element...
    randomIndex = Math.ceil(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

