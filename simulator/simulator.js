var d = require("../dal.js");
var dal = new d.DAL();


//Timeline de 10 minutos
var start = 0;//Segundo inicial da timeline
var duration = 599;//Duracao do Evento em segundos

var min = 5;//tamanho minimo do video
var max = 300;//tamanho maximo do video

//Vetor de videos gerados 
var videos = generateVideos(10,start,duration,min,max);

var i = 0;
while( newRandomContribution() ){
    console.log(i);
    i++;
}


function newRandomContribution(){
    var userId = 'fauxUser-001';
    var pair = dal.chooseNextPair(userId);
    
    if(pair == null) return false;
    
    var delta = 1;
    
    pair.add(new d.Contribution(userId,delta));
    
    return true;
}

function generateVideos(number,start,dur,min,max){
    var videos = new Array();

    for(var i=0; i<number; i++){
        var start_seg = Math.random() * (dur - min) + start + min;        
        var duration = Math.random() * Math.min(max - min, start_seg - min) + min;
        var label= 'V'+i;
        var uri = 'http://videos.dataset.io/'+label+'.webm';
        
        var video = new Video(start_seg,duration,label,uri);
     
        dal.addAsset(new d.Asset(uri, label, duration));
        
     //   video.print();
        videos.push(video);
    }
    
    return videos;
}


//Each video generates an Asset
function Video(start_seg, duration, label_id, url){
    //Start for Gold and Verification.. for simulation only.
    var start = start_seg;
    var dur = duration;
    var label = label_id;
    var uri= url;

    this.print = function print(){
        console.log('{start: '+start+',duration: '+dur+', label: '+label+', uri: '+uri+'}');
    }
    
}

