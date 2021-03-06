onload = init;                  //Inicializa a APP;
var socket;                     //WebSockett;
var video_list = new Array();   //Lista de Vídeos;
var video_players = [];
var flagSyncProc = false;       //flag para indicar se parou por causa do processo de SYNC ou outro motivo;
var msg = "";                   //Mensagem para identificar o que esta ocorrendo;

//Responsável por mostrar a mensagem na div identificada;
function showMsg(id,msg){
  document.getElementById(id).innerHTML = msg;
}
//Start the WS and interface;
function init(){
  //Conecta ao Coupler;
  //ws = new WebSocket( 'ws://10.9.7.127:4080' );
  //socket = io('wss://hard-sync-rmcs87.c9users.io/');
  socket = io('wss://hardsync-novaes.c9users.io/');
  //Se a conexão for perdida:
  //Se a conexão for perdida:
  socket.on("disconnect", coupler_close);
  //Ao receber uma mensagem:
  socket.on("message", coupler_message);
  //Ao conectar:
  socket.on("connect",  coupler_connect);
}
//Caso a conexão não seja bem sucedida;
function coupler_close(){
  alert("Conection Failed. Click OK to reload!");
  location.reload();
}
//Ao conectar;
function coupler_connect(){
  var obj1 = {act:"getPresentation"};
  var c = JSON.stringify(obj1);
  socket.emit("message",c);
}
//Ao receber uma mensagem;
function coupler_message(e){
  //Se não houver dados na mensagem, cancela;
  console.log(e);
  if(!e){return;}
  //Transforma a mensagem em um objeto;
  var obj = JSON.parse(e);
  //Se é um objeto contendo os dados de apresentação {act:"presentation",relations:{uri:"",dur:number,delta:number}}
  if(obj.act=="presentation"){
    video_list = obj.relations;
    //Se há pelo menos um vídeo:
    if(video_list.length > 0){
      displayVideos();
    }
  }
}
//Inicia os videos;
function displayVideos(){
  for(var i=0; i<video_list.length; i++){
    //Cria os dois videos e dá o play;  
    video_players[i] = new Video({'vidId': 'video_area', 'src': video_list[i].uri, 'width': 300, 'heigth': 300,'autoplay': 1,'loop': 0,'controls': 0});
    video_players[i].addEventListener("onStateChange",videoListener);    
  }
}

//Escuta os videos para identificar bufferização e resincronizar;
function videoListener(event){
  console.log(event);
  //Se pausou ou esta armazenando buffer;
  if (event.data == 2 || event.data == 3 || event.data == 3){
  //se começou a reproduzir;
  }else if(event.data == 1){
    //Verifica se todos os players estão nesse estado:
    var allIn = true;
    for(var i=0; i<video_players.length; i++){
      if(video_players[i].getPlayerState() != 1){
        allIn = false;
      }
    }
    //se todos estiverem tocando, inicia a sincronização:
    if(allIn){
      console.log("Todos os vídeos estão prontos");
      //Verifica se é o final do processo de sync, ou se é o final da bufferização de alguém;
      if(flagSyncProc == false){
        console.log("Prontos e não foi uma pausa para sync. Iniciando Sync.");
        flagSyncProc = true;
        sync();
      }else{
        console.log("Prontos e foi uma pausa para sync.");
        flagSyncProc = false;
      }
    }
  }
}
//Sincroniza os vídeos:
function sync(){
  console.log("InSYNC");
  //showMsg("msg_field", "SYNCHRONIZING");
  var delta = [];
  var diffNow = [];
  var diffReal = [];
  //Calcula o delta deles, um a um com o primeiro;
  for(var i=0; i<video_players.length; i++){
    //Se alguém não tiver delta, marca como null para não sincronizar;
    if(video_list[0].delta == null  || video_list[ i].delta == null){
      delta[i] = null;
    //Caso contrário, calcula em relação ao primeiro;
    }else{
      delta[i] = video_list[i].delta;
      //delta[i] = -video_list[0].delta + video_list[i].delta;
    }
    //Calcula a direrença agora na apresentação;
    diffNow[i] = video_players[0].getCurrentTime() - video_players[i].getCurrentTime();
    //Calcula a diferença real (se delta é conhecido);
    if(delta[i] != null){
      diffReal[i] = delta[i] - diffNow[i];
    }else{
      diffReal[i] = null;
    }
    console.log("diffs:",delta[i],diffNow[i],diffReal[i]);
  }
  
  //Acha quem ta mais atrasado, para os outros se alinharem a ele:
  var min = Infinity;
  var id = -1;          //Contem o video mais atrasado;
  for(var i=0; i<video_players.length; i++){
    if(diffReal[i]!=null){
      if(diffReal[i] < min){
        min = diffReal[i];
        id = i;
      }
    }
  }
  //Vai pausando todos em relação ao video mais atrasado;
  for(var i=0; i<video_players.length; i++){
    if(diffReal[i]!=null){
      var timer = min - diffReal[i];
      video_players[i].pause();
      console.log(timer,i);
      console.log(new Date());
      doSetTimeout(-timer*1000,i);      
    }
  }
  
}
//Função para criar um escopo para cada timeOut;
function doSetTimeout(timer,i) {
  setTimeout(function(){console.log("play",i,timer,new Date()); video_players[i].play();}, timer);  
}
