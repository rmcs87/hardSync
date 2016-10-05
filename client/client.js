var socket;
var id;
var user_id;
var type;
var player1 = {};
var player2 = {};
var status = "play";
var score = 0;
window.onload = init;

//Start the WS and interface;
function init(){
    //User fingerprinting:
    new Fingerprint2().get(function(result, components){
        this.user_id = result;
    });
    //Coupler IP;
    socket = io('wss://hard-sync-rmcs87.c9users.io/');
    //Se a conexão for perdida:
    socket.on("disconnect", coupler_close);
    //Ao receber uma mensagem:
    socket.on("message", coupler_message);
    //Ao conectar:
    socket.on("connect",  coupler_connect);
    //Esconde os elementos de edição:
    hidevideo();
    hidelogic();
    hideNavigation();
    //Listeners
    document.getElementById("b_confirm").addEventListener("click",confirm);
    document.getElementById("b_negate").addEventListener("click",negate);
}

function coupler_message(e){
    //Se não ha dados na mensagem;
    if(!e){return}
    //Converte o objeto recebido;
    var obj = JSON.parse(e);
    console.log(obj)
    if(obj.act=="sync"){
      id = obj.id;
      type = obj.type;
      
      player1.url = obj.v1_url;
      player1.chunk = obj.v1_c;

      player2.url = obj.v2_url;
      player2.chunk = obj.v2_c;

      loadVideos();
  }else if(obj.act=="end"){
    alert("No More JOBS!!!");
  }else if(obj.act=="score"){
    score = obj.data;
    document.getElementById("status").innerHTML = "ONLINE with ID = " + user_id +" - SCORE =" + score;
  }
}

function loadVideos(){
  //Cria os dois videos e dá o play;  
  player1.element = new Video({'vidId': 'v1', 'src': player1.url +"0"+player1.chunk +".webm",'width': 300, 'heigth': 300,'autoplay': 1,'loop': 1,'controls': 0});
  player2.element = new Video({'vidId': 'v2', 'src': player2.url +"0"+player2.chunk +".webm",'width': 300, 'heigth': 300,'autoplay': 1,'loop': 1,'controls': 0});

  //Start contribution;
  player1.element.load();
  player2.element.load();
  showvideo();
  setTimeout(showlogic, 5000);
}

function confirm(){
  //Se ele disser que tem overlap;
  initSync();
}

function initSync(){
  document.getElementById("sync-info").innerHTML = "Please, synchronize them navigating to the same point!"+
                                                    "After you you find the point submit your answer. You made a mistake, negate the overlaping.";
  hidelogic();
  shownavigation();
  player1.element.pause();
  player2.element.pause();
  document.getElementById("b1").addEventListener("click",bwd);
  document.getElementById("f1").addEventListener("click",fwd);
  document.getElementById("b2").addEventListener("click",bwd);
  document.getElementById("f2").addEventListener("click",fwd);
  
  document.getElementById("b_confirm").removeEventListener("click",confirm);
  document.getElementById("b_negate").removeEventListener("click",negate);

  document.getElementById("b_confirm").addEventListener("click",confirmSend);
  document.getElementById("b_negate").addEventListener("click",negate);

  setTimeout(showlogic, 5000);
}

function fwd(event){
  console.log(event)
  if(event.target.id == "f1"){
    player1.element.setCurrentTime(player1.element.getCurrentTime() + 0.25);
  }else{
    player2.element.setCurrentTime(player2.element.getCurrentTime() + 0.25);
  }
}

function bwd(event){
  if(event.target.id == "b1"){
    player1.element.setCurrentTime(player1.element.getCurrentTime() - 0.25);
  }else{
    player2.element.setCurrentTime(player2.element.getCurrentTime() - 0.25);
  }
}

function confirmSend(){
  //Se ele disser que tem overlap;
  var delta = (player1.element.getCurrentTime() + player1.chunk*5) - (player2.element.getCurrentTime() + player2.chunk*5);
  var obj1 = {user_id: user_id, id:id, act:"sync", status:type, c:"true", delta:delta, v1_url:player1.url, v2_url:player2.url};
  var c = JSON.stringify(obj1);
  storeContribution(c)
  socket.emit("message",c);
  hidelogic();
  hidevideo();
  location.reload();
}

function negate(){
  //Se ele disser que tem overlap;
  var obj1 = {user_id: user_id, id:id, act:"sync", status:type, c:"false"};
  var c = JSON.stringify(obj1);
  storeContribution(c)
  socket.emit("message",c);
  hidelogic();
  hidevideo();
  location.reload();
}

function coupler_connect(){
  var obj1 = {user_id: user_id, act:"getScore"};
  var c = JSON.stringify(obj1);
  socket.emit("message",c);
  //Mostra que ta conectado:
  document.getElementById("status").innerHTML = "ONLINE with ID = " + user_id +" - SCORE =" + score;
}

function coupler_close(){
//
}

function hidelogic(){
  document.getElementById("b_confirm").style.display = "none";
  document.getElementById("b_negate").style.display = "none";
}

function showlogic(){
  document.getElementById("b_confirm").style.display = "inline";
  document.getElementById("b_negate").style.display = "inline";
}

function hidevideo(){
  document.getElementById("v1").style.display = "none";
  document.getElementById("v2").style.display = "none";
}

function showvideo(){
  document.getElementById("v1").style.display = "inline";
  document.getElementById("v2").style.display = "inline";
}

function hideNavigation(){
  document.getElementById("b1").style.display = "none";
  document.getElementById("b2").style.display = "none";
  document.getElementById("f1").style.display = "none";
  document.getElementById("f2").style.display = "none";
}

function shownavigation(){
  document.getElementById("b1").style.display = "inline";
  document.getElementById("b2").style.display = "inline";
  document.getElementById("f1").style.display = "inline";
  document.getElementById("f2").style.display = "inline";
}

//Sends teh contribution to the Database
function storeContribution(c){
  //Your Spreadsheet URL;
  var url = "https://docs.google.com/forms/d/e/1FAIpQLSdyDoaZMe44exYNO7KYi5qCSBizzQyVBYM0hBUwFDx1IQn42g";
  //The form we send our infromation;
  var action = 'formResponse';
  //The field's id extraceted earlier:
  var fields = ['entry.1033519793'];
  //We construct the URL to the database;
  var str = url+'/'+action+'?'  +
    fields[0]+'='+c;
  //We send the form;
  fetch(str,{mode: 'no-cors'});
}