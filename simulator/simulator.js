var d = require("../dal.js");
var dal = new d.DAL();

var nVideos = 100;

//Timeline de 10 minutos
var start = 0;//Segundo inicial da timeline
var duration = 599;//Duracao do Evento em segundos

var min = 5;//tamanho minimo do video
var max = 300;//tamanho maximo do video

// % de chance de um worker contribuir corretamente
var crowdReputation = 100;

var user = new d.User('faux-user-001', crowdReputation);


//Vetor de videos gerados 
var videos = generateVideos(nVideos,start,duration,min,max);
//var videos = loadVideos(nVideos);
//for(var video in videos) videos[video].print();


var gold = geraGold(videos);
//console.log(JSON.stringify(gold));
//console.log('Gold');
//printGold(gold);

for(var i=0; newContribution() ; i++);


dal.compare(gold);

console.log('Contributions: '+i);

//dal.print();



///FUNCOES

function printGold(gold) {
    for(var A in gold){
        for(var B in gold[A]){
            console.log('['+A+','+B+'] = '+gold[A][B]);
        }
    }
}

function geraGold(videos){
    var gold = new Array();
    for(var A in videos){
        gold[A] = new Array();
        for(var B in videos){
            gold[A][B] = getDelta(videos[A],videos[B]);
        }
    }
    return gold;
}

function getDelta(A,B){
    if(A==null || B==null) return 'I';
    
    var delta = B.getStart() - A.getStart()
    
    var sa = A.getStart();
    var sb = B.getStart();
    var dur = A.getDuration();
    if(B.getStart( ) < A.getStart()){
        sa = B.getStart();
        sb = A.getStart();
        dur = B.getDuration();
    }
    
    if(sb > (sa+dur)) delta = 'I';
    
    return delta;
}

function newContribution(){
    var chance = Math.random() * 1000 % 100;
    if(chance < user.lvl){
        return newValidContribution();
    }else{
        return newRandomContribution();
    }
}

function newValidContribution(){
    var pair = dal.chooseNextPair(user.id);

    if(pair == null) return false;

    var delta =  getDelta(videos[pair.frm.label], videos[pair.to.label]);

    dal.addContribution(pair.frm, pair.to,delta,user);

    return true;
}

function newRandomContribution(){
    var pair = dal.chooseNextPair(user.id);
    
    if(pair == null) return false;
    
    var delta = Math.random() * 1000 % Math.min(pair.frm.dur, pair.to.dur);
    
    dal.addContribution(pair.frm, pair.to,delta,user);
    
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
        videos[video.getLabel()] = video;
    }
    return videos;
}

function loadVideos(number){
    	var videos = new Array();
var jsonVideos = '[{"start":"497.454911025241","dur":"249.48013540939428, "label": V0, "uri": "http://videos.dataset.io/V0.webm"} {"start": "198.92319187661633","dur": "69.79160538384222,"label":V1,"uri":"http://videos.dataset.io/V1.webm"},{"start":"22.24725062120706","dur":"11.251929277250813, "label": V2, "uri": "http://videos.dataset.io/V2.webm"} {"start": "398.75533592374995","dur": "288.9894784754142,"label":V3,"uri":"http://videos.dataset.io/V3.webm"},{"start":"583.3172850990668","dur":"16.53672386542894, "label": V4, "uri": "http://videos.dataset.io/V4.webm"} {"start": "73.29305157251656","dur": "55.15859252025192,"label":V5,"uri":"http://videos.dataset.io/V5.webm"},{"start":"116.94375926163048","dur":"103.98610850839454, "label": V6, "uri": "http://videos.dataset.io/V6.webm"} {"start": "18.139702014625072","dur": "16.645980540335813,"label":V7,"uri":"http://videos.dataset.io/V7.webm"},{"start":"74.50260811531916","dur":"62.901459678221194, "label": V8, "uri": "http://videos.dataset.io/V8.webm"} {"start": "161.5295046144165","dur": "37.375013772833825,"label":V9,"uri":"http://videos.dataset.io/V9.webm"},{"start":"595.6259420085698","dur":"134.39759026980028, "label": V10, "uri": "http://videos.dataset.io/V10.webm"} {"start": "454.73713702056557","dur": "34.44827462895773,"label":V11,"uri":"http://videos.dataset.io/V11.webm"},{"start":"15.072238869965076","dur":"11.86232562317869, "label": V12, "uri": "http://videos.dataset.io/V12.webm"} {"start": "558.951960999053","dur": "137.74137026048265,"label":V13,"uri":"http://videos.dataset.io/V13.webm"},{"start":"94.87625971529633","dur":"20.614764392257303, "label": V14, "uri": "http://videos.dataset.io/V14.webm"} {"start": "145.72332860482857","dur": "75.12224596507122,"label":V15,"uri":"http://videos.dataset.io/V15.webm"},{"start":"154.8043627073057","dur":"151.6108843596217, "label": V16, "uri": "http://videos.dataset.io/V16.webm"} {"start": "276.60952035104856","dur": "112.09826431327065,"label":V17,"uri":"http://videos.dataset.io/V17.webm"},{"start":"241.11648823926225","dur":"212.64359703082334, "label": V18, "uri": "http://videos.dataset.io/V18.webm"} {"start": "520.513479527086","dur": "222.61281537706964,"label":V19,"uri":"http://videos.dataset.io/V19.webm"},{"start":"105.950068351347","dur":"22.10890245261054, "label": V20, "uri": "http://videos.dataset.io/V20.webm"} {"start": "292.9035154180601","dur": "244.0158514287768,"label":V21,"uri":"http://videos.dataset.io/V21.webm"},{"start":"223.4391227462329","dur":"119.28812812118623, "label": V22, "uri": "http://videos.dataset.io/V22.webm"} {"start": "169.80068664206192","dur": "54.84307127223039,"label":V23,"uri":"http://videos.dataset.io/V23.webm"},{"start":"94.04222135292366","dur":"78.23500032770863, "label": V24, "uri": "http://videos.dataset.io/V24.webm"} {"start": "44.77482167631388","dur": "22.30780953656236,"label":V25,"uri":"http://videos.dataset.io/V25.webm"},{"start":"302.262882752344","dur":"33.93248294829391, "label": V26, "uri": "http://videos.dataset.io/V26.webm"} {"start": "187.9552838052623","dur": "49.41700164338151,"label":V27,"uri":"http://videos.dataset.io/V27.webm"},{"start":"111.78350325394422","dur":"27.21025247433601, "label": V28, "uri": "http://videos.dataset.io/V28.webm"} {"start": "97.18947348091751","dur": "29.12857236542636,"label":V29,"uri":"http://videos.dataset.io/V29.webm"},{"start":"499.0706531163305","dur":"194.78984171524644, "label": V30, "uri": "http://videos.dataset.io/V30.webm"} {"start": "401.9190677702427","dur": "21.34709897218272,"label":V31,"uri":"http://videos.dataset.io/V31.webm"},{"start":"82.1747644492425","dur":"32.210670629251354, "label": V32, "uri": "http://videos.dataset.io/V32.webm"} {"start": "88.39300405653194","dur": "18.667719777675977,"label":V33,"uri":"http://videos.dataset.io/V33.webm"},{"start":"40.18127350555733","dur":"32.09547568290225, "label": V34, "uri": "http://videos.dataset.io/V34.webm"} {"start": "566.0258052744903","dur": "24.136647699633613,"label":V35,"uri":"http://videos.dataset.io/V35.webm"},{"start":"467.0282201091759","dur":"21.005445022601634, "label": V36, "uri": "http://videos.dataset.io/V36.webm"} {"start": "154.24475208343938","dur": "16.110120247224856,"label":V37,"uri":"http://videos.dataset.io/V37.webm"},{"start":"55.38337734155357","dur":"10.795695618188674, "label": V38, "uri": "http://videos.dataset.io/V38.webm"} {"start": "508.4141048635356","dur": "78.02879389375448,"label":V39,"uri":"http://videos.dataset.io/V39.webm"},{"start":"266.0555536323227","dur":"255.13727174649506, "label": V40, "uri": "http://videos.dataset.io/V40.webm"} {"start": "21.657598996534944","dur": "15.854959580867133,"label":V41,"uri":"http://videos.dataset.io/V41.webm"},{"start":"70.45531798293814","dur":"56.81941110083405, "label": V42, "uri": "http://videos.dataset.io/V42.webm"} {"start": "522.9753099051304","dur": "165.79501301283017,"label":V43,"uri":"http://videos.dataset.io/V43.webm"},{"start":"395.4734081029892","dur":"48.01350811962038, "label": V44, "uri": "http://videos.dataset.io/V44.webm"} {"start": "547.8660875018686","dur": "251.5693761408329,"label":V45,"uri":"http://videos.dataset.io/V45.webm"},{"start":"7.152026523835957","dur":"5.930628355403831, "label": V46, "uri": "http://videos.dataset.io/V46.webm"} {"start": "472.7728050737642","dur": "175.77231125207618,"label":V47,"uri":"http://videos.dataset.io/V47.webm"},{"start":"341.32464660098776","dur":"185.63601350178942, "label": V48, "uri": "http://videos.dataset.io/V48.webm"} {"start": "173.9298008629121","dur": "136.7406461089043,"label":V49,"uri":"http://videos.dataset.io/V49.webm"},{"start":"423.8126613246277","dur":"151.9172755035106, "label": V50, "uri": "http://videos.dataset.io/V50.webm"} {"start": "259.766864950303","dur": "29.613990645769707,"label":V51,"uri":"http://videos.dataset.io/V51.webm"},{"start":"526.0476344823837","dur":"187.35399078112096, "label": V52, "uri": "http://videos.dataset.io/V52.webm"} {"start": "280.7685072598979","dur": "163.11180556728596,"label":V53,"uri":"http://videos.dataset.io/V53.webm"},{"start":"367.44392443681136","dur":"151.02836807258427, "label": V54, "uri": "http://videos.dataset.io/V54.webm"} {"start": "126.74303735606372","dur": "31.630984367263032,"label":V55,"uri":"http://videos.dataset.io/V55.webm"},{"start":"506.20239201840013","dur":"48.59939947724342, "label": V56, "uri": "http://videos.dataset.io/V56.webm"} {"start": "438.7825337331742","dur": "245.63518534065224,"label":V57,"uri":"http://videos.dataset.io/V57.webm"},{"start":"213.05425466271117","dur":"54.16859383447495, "label": V58, "uri": "http://videos.dataset.io/V58.webm"} {"start": "490.50023678084835","dur": "197.27156277629547,"label":V59,"uri":"http://videos.dataset.io/V59.webm"},{"start":"318.791513340082","dur":"209.75295897573233, "label": V60, "uri": "http://videos.dataset.io/V60.webm"} {"start": "210.11392190121114","dur": "18.389454285733244,"label":V61,"uri":"http://videos.dataset.io/V61.webm"},{"start":"29.42384509369731","dur":"9.405485712944348, "label": V62, "uri": "http://videos.dataset.io/V62.webm"} {"start": "98.34978227736428","dur": "48.77889387546735,"label":V63,"uri":"http://videos.dataset.io/V63.webm"},{"start":"276.6669589979574","dur":"53.87129616652709, "label": V64, "uri": "http://videos.dataset.io/V64.webm"} {"start": "282.96795249404386","dur": "90.04678772178166,"label":V65,"uri":"http://videos.dataset.io/V65.webm"},{"start":"289.52714889962226","dur":"75.98521242835008, "label": V66, "uri": "http://videos.dataset.io/V66.webm"} {"start": "170.03639067942277","dur": "67.74154723308715,"label":V67,"uri":"http://videos.dataset.io/V67.webm"},{"start":"192.49129444360733","dur":"169.68642107483424, "label": V68, "uri": "http://videos.dataset.io/V68.webm"} {"start": "517.234137665946","dur": "47.89049074053764,"label":V69,"uri":"http://videos.dataset.io/V69.webm"},{"start":"327.05228127213195","dur":"140.85771272308193, "label": V70, "uri": "http://videos.dataset.io/V70.webm"} {"start": "256.95093402359635","dur": "137.33405547131673,"label":V71,"uri":"http://videos.dataset.io/V71.webm"},{"start":"529.7318574329838","dur":"132.7817461336963, "label": V72, "uri": "http://videos.dataset.io/V72.webm"} {"start": "575.2272054385394","dur": "149.54530200921,"label":V73,"uri":"http://videos.dataset.io/V73.webm"},{"start":"309.6696897284128","dur":"265.46026456868276, "label": V74, "uri": "http://videos.dataset.io/V74.webm"} {"start": "540.3032360216603","dur": "98.448159302352,"label":V75,"uri":"http://videos.dataset.io/V75.webm"},{"start":"394.3092714003287","dur":"261.1083875852637, "label": V76, "uri": "http://videos.dataset.io/V76.webm"} {"start": "541.5191697804257","dur": "138.7476828158833,"label":V77,"uri":"http://videos.dataset.io/V77.webm"},{"start":"298.4993775547482","dur":"197.20059302362898, "label": V78, "uri": "http://videos.dataset.io/V78.webm"} {"start": "12.583375270012766","dur": "6.343139265006973,"label":V79,"uri":"http://videos.dataset.io/V79.webm"},{"start":"168.0808132761158","dur":"157.51290367559596, "label": V80, "uri": "http://videos.dataset.io/V80.webm"} {"start": "395.8565143281594","dur": "29.522193528246135,"label":V81,"uri":"http://videos.dataset.io/V81.webm"},{"start":"443.1951854676008","dur":"234.92287063156255, "label": V82, "uri": "http://videos.dataset.io/V82.webm"} {"start": "347.32617786852643","dur": "239.3065736524295,"label":V83,"uri":"http://videos.dataset.io/V83.webm"},{"start":"298.9436179785989","dur":"72.40581657533566, "label": V84, "uri": "http://videos.dataset.io/V84.webm"} {"start": "348.86825579218566","dur": "126.72602979349904,"label":V85,"uri":"http://videos.dataset.io/V85.webm"},{"start":"507.0723162754439","dur":"185.61890529468656, "label": V86, "uri": "http://videos.dataset.io/V86.webm"} {"start": "159.85625182138756","dur": "86.25914829428626,"label":V87,"uri":"http://videos.dataset.io/V87.webm"},{"start":"25.61158920498565","dur":"20.62529019321631, "label": V88, "uri": "http://videos.dataset.io/V88.webm"} {"start": "32.26319763949141","dur": "18.14824229014217,"label":V89,"uri":"http://videos.dataset.io/V89.webm"},{"start":"199.7604761729017","dur":"112.01317923408389, "label": V90, "uri": "http://videos.dataset.io/V90.webm"} {"start": "445.1811597212218","dur": "51.636393959634006,"label":V91,"uri":"http://videos.dataset.io/V91.webm"},{"start":"245.74386631604284","dur":"100.98297326310536, "label": V92, "uri": "http://videos.dataset.io/V92.webm"} {"start": "207.84049454471096","dur": "193.62171999780065,"label":V93,"uri":"http://videos.dataset.io/V93.webm"},{"start":"130.44734001066536","dur":"112.98811639954623, "label": V94, "uri": "http://videos.dataset.io/V94.webm"} {"start": "272.4472126872279","dur": "27.374758603342627,"label":V95,"uri":"http://videos.dataset.io/V95.webm"},{"start":"188.9105509533547","dur":"28.16936495346878, "label": V96, "uri": "http://videos.dataset.io/V96.webm"} {"start": "267.90280577074736","dur": "17.723220810370634,"label":V97,"uri":"http://videos.dataset.io/V97.webm"},{"start":"310.6183538143523","dur":"115.17935291631147, "label": V98, "uri": "http://videos.dataset.io/V98.webm"} {"start": "527.6891977218911","dur": "149.64391525019892,"label":V99,"uri":"http://videos.dataset.io/V99.webm"}]';    

  	var vetVideos = JSON.parse(jsonVideos);
    
	for(var i=0; i<number; i++){
       	 	var video = new Video(vetVideos[i].start,vetVideos[i].dur,vetVideos[i].label,vetVideos[i].uri);
        	dal.addAsset(new d.Asset(vetVideos[i].uri, vetVideos[i].label, vetVideos[i].dur));
        	videos[video.getLabel()] = video;
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

    this.getLabel = function getLabel(){return label;}

    this.getStart = function getLabel(){return start;}

    this.getDuration = function getLabel(){return dur;}

    this.print = function print(){
        console.log('{start: '+start+',duration: '+dur+', label: '+label+', uri: '+uri+'}');
    }
    
}

