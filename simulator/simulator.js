var d = require("../dal.js");
var dal = new d.DAL();

var nVideos = 10;

//Timeline de 10 minutos
var start = 0;//Segundo inicial da timeline
var duration = 599;//Duracao do Evento em segundos

var min = 5;//tamanho minimo do video
var max = 300;//tamanho maximo do video

var user = new d.User('faux-user-001', 70);//70% de chance de contribuir corretamente


//Vetor de videos gerados 
//var videos = generateVideos(nVideos,start,duration,min,max);
var videos = loadVideos(nVideos);

var gold = geraGold(videos);

//printGold(gold);

//for(var i=0; newRandomContribution(); i++);

//for(var i=0; newValidContribution(); i++);


for(var i=0; newContribution(); i++);

console.log(i);


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
    return B.getStart() - A.getStart();
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
    
    var delta = Math.random() * 1000 % 5;
    
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
    var jsonVideos = '[{"start":"215.6441515861079","dur":"191.90954230579786","label":"V0","uri":"http://videos.dataset.io/V0.webm"},{"start":"222.48544772388414","dur":"146.74567929058026","label":"V1","uri":"http://videos.dataset.io/V1.webm"},{"start":"512.2226870520972","dur":"283.4541045431979","label":"V2","uri":"http://videos.dataset.io/V2.webm"},{"start":"544.7231246535666","dur":"179.09744778764434","label":"V3","uri":"http://videos.dataset.io/V3.webm"},{"start":"382.25045514432713","dur":"16.541575364535674","label":"V4","uri":"http://videos.dataset.io/V4.webm"},{"start":"344.80949397338554","dur":"118.12687833444215","label":"V5","uri":"http://videos.dataset.io/V5.webm"},{"start":"62.466530131176114","dur":"24.580622662106126","label":"V6","uri":"http://videos.dataset.io/V6.webm"},{"start":"222.49328070040792","dur":"173.88026541423673","label":"V7","uri":"http://videos.dataset.io/V7.webm"},{"start":"555.5972949387506","dur":"206.55679261428304","label":"V8","uri":"http://videos.dataset.io/V8.webm"},{"start":"77.8614717614837","dur":"46.540438653082845","label":"V9","uri":"http://videos.dataset.io/V9.webm"},{"start":"118.81469952594489","dur":"94.69225839275164","label":"V10","uri":"http://videos.dataset.io/V10.webm"},{"start":"252.59035871410742","dur":"75.45323824530008","label":"V11","uri":"http://videos.dataset.io/V11.webm"},{"start":"288.4744538073428","dur":"98.58927316963484","label":"V12","uri":"http://videos.dataset.io/V12.webm"},{"start":"325.97173780947924","dur":"151.74616987351328","label":"V13","uri":"http://videos.dataset.io/V13.webm"},{"start":"556.926926695276","dur":"19.317343469010666","label":"V14","uri":"http://videos.dataset.io/V14.webm"},{"start":"78.90489540435374","dur":"7.50092155722409","label":"V15","uri":"http://videos.dataset.io/V15.webm"},{"start":"579.0006959973834","dur":"249.36766976956278","label":"V16","uri":"http://videos.dataset.io/V16.webm"},{"start":"293.8825727584772","dur":"214.14771667813469","label":"V17","uri":"http://videos.dataset.io/V17.webm"},{"start":"338.281743157655","dur":"67.91909335763194","label":"V18","uri":"http://videos.dataset.io/V18.webm"},{"start":"272.43608288187534","dur":"173.59040928441235","label":"V19","uri":"http://videos.dataset.io/V19.webm"},{"start":"592.9445356111974","dur":"40.64910906483419","label":"V20","uri":"http://videos.dataset.io/V20.webm"},{"start":"548.8967179884203","dur":"61.69273137114942","label":"V21","uri":"http://videos.dataset.io/V21.webm"},{"start":"42.064742079004645","dur":"5.076371796517407","label":"V22","uri":"http://videos.dataset.io/V22.webm"},{"start":"98.75110680796206","dur":"54.221188988607985","label":"V23","uri":"http://videos.dataset.io/V23.webm"},{"start":"574.3449466326274","dur":"168.39707644539885","label":"V24","uri":"http://videos.dataset.io/V24.webm"},{"start":"419.7187128630467","dur":"29.61599167319946","label":"V25","uri":"http://videos.dataset.io/V25.webm"},{"start":"317.55897981720045","dur":"40.9777700714767","label":"V26","uri":"http://videos.dataset.io/V26.webm"},{"start":"522.7127550654113","dur":"117.82218854408711","label":"V27","uri":"http://videos.dataset.io/V27.webm"},{"start":"448.3502620877698","dur":"42.648052115691826","label":"V28","uri":"http://videos.dataset.io/V28.webm"},{"start":"5.106740469112992","dur":"5.006552735384487","label":"V29","uri":"http://videos.dataset.io/V29.webm"},{"start":"475.202327137813","dur":"66.3289908634033","label":"V30","uri":"http://videos.dataset.io/V30.webm"},{"start":"241.24317329190671","dur":"165.58858334337737","label":"V31","uri":"http://videos.dataset.io/V31.webm"},{"start":"584.449404750485","dur":"108.47449371474795","label":"V32","uri":"http://videos.dataset.io/V32.webm"},{"start":"218.30826643574983","dur":"149.1261172224071","label":"V33","uri":"http://videos.dataset.io/V33.webm"},{"start":"143.87565755145624","dur":"76.2069989077394","label":"V34","uri":"http://videos.dataset.io/V34.webm"},{"start":"308.55454505281523","dur":"19.72229590290226","label":"V35","uri":"http://videos.dataset.io/V35.webm"},{"start":"462.2718987944536","dur":"186.2019462918397","label":"V36","uri":"http://videos.dataset.io/V36.webm"},{"start":"7.988091001752764","dur":"7.038324325376805","label":"V37","uri":"http://videos.dataset.io/V37.webm"},{"start":"41.0377095034346","dur":"6.757009116550579","label":"V38","uri":"http://videos.dataset.io/V38.webm"},{"start":"12.251830297056586","dur":"5.7700765477914775","label":"V39","uri":"http://videos.dataset.io/V39.webm"},{"start":"323.0119732860476","dur":"225.6680080294609","label":"V40","uri":"http://videos.dataset.io/V40.webm"},{"start":"529.0315155894496","dur":"96.60257648327388","label":"V41","uri":"http://videos.dataset.io/V41.webm"},{"start":"511.4626534935087","dur":"9.548920763190836","label":"V42","uri":"http://videos.dataset.io/V42.webm"},{"start":"65.41378764389083","dur":"44.39961482766637","label":"V43","uri":"http://videos.dataset.io/V43.webm"},{"start":"292.7300901617855","dur":"216.70656030431678","label":"V44","uri":"http://videos.dataset.io/V44.webm"},{"start":"138.75805120682344","dur":"16.87146113031406","label":"V45","uri":"http://videos.dataset.io/V45.webm"},{"start":"86.03057767311111","dur":"50.471769823496444","label":"V46","uri":"http://videos.dataset.io/V46.webm"},{"start":"422.1762240882963","dur":"275.5091797374189","label":"V47","uri":"http://videos.dataset.io/V47.webm"},{"start":"175.61562580661848","dur":"11.013545665161782","label":"V48","uri":"http://videos.dataset.io/V48.webm"},{"start":"196.1472379383631","dur":"182.82748170218727","label":"V49","uri":"http://videos.dataset.io/V49.webm"},{"start":"381.5408105952665","dur":"122.57363587035798","label":"V50","uri":"http://videos.dataset.io/V50.webm"},{"start":"556.4317681207322","dur":"267.5347608199809","label":"V51","uri":"http://videos.dataset.io/V51.webm"},{"start":"506.29096825793386","dur":"29.665163567988202","label":"V52","uri":"http://videos.dataset.io/V52.webm"},{"start":"356.98369785537943","dur":"263.5534266452305","label":"V53","uri":"http://videos.dataset.io/V53.webm"},{"start":"331.1304525863379","dur":"60.67640968831256","label":"V54","uri":"http://videos.dataset.io/V54.webm"},{"start":"471.4835163895041","dur":"136.38674790039659","label":"V55","uri":"http://videos.dataset.io/V55.webm"},{"start":"183.73055048426613","dur":"29.001160333163536","label":"V56","uri":"http://videos.dataset.io/V56.webm"},{"start":"66.36040403926745","dur":"23.219413976975947","label":"V57","uri":"http://videos.dataset.io/V57.webm"},{"start":"307.9475107397884","dur":"169.54073765082285","label":"V58","uri":"http://videos.dataset.io/V58.webm"},{"start":"274.8254429101944","dur":"26.766693160975425","label":"V59","uri":"http://videos.dataset.io/V59.webm"},{"start":"235.4559162594378","dur":"32.83026495772542","label":"V60","uri":"http://videos.dataset.io/V60.webm"},{"start":"227.45252709882334","dur":"50.467677709209894","label":"V61","uri":"http://videos.dataset.io/V61.webm"},{"start":"172.15682653523982","dur":"129.51325590198735","label":"V62","uri":"http://videos.dataset.io/V62.webm"},{"start":"250.65818674862385","dur":"170.32247444404655","label":"V63","uri":"http://videos.dataset.io/V63.webm"},{"start":"497.0568108535372","dur":"205.81854492542334","label":"V64","uri":"http://videos.dataset.io/V64.webm"},{"start":"585.0535877034999","dur":"236.22305851778947","label":"V65","uri":"http://videos.dataset.io/V65.webm"},{"start":"94.4091582079418","dur":"90.79229321612115","label":"V66","uri":"http://videos.dataset.io/V66.webm"},{"start":"262.71070710988715","dur":"168.9731878874051","label":"V67","uri":"http://videos.dataset.io/V67.webm"},{"start":"542.5414357981645","dur":"64.75738071720116","label":"V68","uri":"http://videos.dataset.io/V68.webm"},{"start":"250.5749983168207","dur":"16.722972880909424","label":"V69","uri":"http://videos.dataset.io/V69.webm"},{"start":"406.8348764642142","dur":"6.29836690844968","label":"V70","uri":"http://videos.dataset.io/V70.webm"},{"start":"254.19165854295716","dur":"195.5048548971923","label":"V71","uri":"http://videos.dataset.io/V71.webm"},{"start":"421.07452811766416","dur":"125.58796635014005","label":"V72","uri":"http://videos.dataset.io/V72.webm"},{"start":"167.96416876697913","dur":"73.84197061586949","label":"V73","uri":"http://videos.dataset.io/V73.webm"},{"start":"234.22672700276598","dur":"188.15550169075078","label":"V74","uri":"http://videos.dataset.io/V74.webm"},{"start":"170.51387613266706","dur":"23.620474159956576","label":"V75","uri":"http://videos.dataset.io/V75.webm"},{"start":"142.5571197802201","dur":"31.254179357189663","label":"V76","uri":"http://videos.dataset.io/V76.webm"},{"start":"132.251054729335","dur":"56.61026172564295","label":"V77","uri":"http://videos.dataset.io/V77.webm"},{"start":"222.5326256514527","dur":"199.64591489625246","label":"V78","uri":"http://videos.dataset.io/V78.webm"},{"start":"540.2152995644137","dur":"253.98243736941367","label":"V79","uri":"http://videos.dataset.io/V79.webm"},{"start":"279.5680734924972","dur":"92.91023158480779","label":"V80","uri":"http://videos.dataset.io/V80.webm"},{"start":"530.9925365359522","dur":"187.27034613955766","label":"V81","uri":"http://videos.dataset.io/V81.webm"},{"start":"147.16650802548975","dur":"56.73939603957496","label":"V82","uri":"http://videos.dataset.io/V82.webm"},{"start":"350.50046114390716","dur":"77.47101855115034","label":"V83","uri":"http://videos.dataset.io/V83.webm"},{"start":"154.6734791006893","dur":"13.6136689988866","label":"V84","uri":"http://videos.dataset.io/V84.webm"},{"start":"320.792290546","dur":"102.71230893675238","label":"V85","uri":"http://videos.dataset.io/V85.webm"},{"start":"57.60313725378364","dur":"35.98816590774483","label":"V86","uri":"http://videos.dataset.io/V86.webm"},{"start":"94.9148099864833","dur":"33.09521158805016","label":"V87","uri":"http://videos.dataset.io/V87.webm"},{"start":"356.23123035160825","dur":"35.91278618434444","label":"V88","uri":"http://videos.dataset.io/V88.webm"},{"start":"233.11335147870705","dur":"203.9995463693283","label":"V89","uri":"http://videos.dataset.io/V89.webm"},{"start":"456.78406747896224","dur":"121.63310084841214","label":"V90","uri":"http://videos.dataset.io/V90.webm"},{"start":"280.5864544855431","dur":"7.685745964788836","label":"V91","uri":"http://videos.dataset.io/V91.webm"},{"start":"392.06760745029896","dur":"249.8602264688816","label":"V92","uri":"http://videos.dataset.io/V92.webm"},{"start":"398.534036392346","dur":"67.95136454282328","label":"V93","uri":"http://videos.dataset.io/V93.webm"},{"start":"408.3669723458588","dur":"165.64968666411005","label":"V94","uri":"http://videos.dataset.io/V94.webm"},{"start":"480.5355290491134","dur":"37.15936567168683","label":"V95","uri":"http://videos.dataset.io/V95.webm"},{"start":"390.3356313286349","dur":"96.51075172820129","label":"V96","uri":"http://videos.dataset.io/V96.webm"},{"start":"11.515844309702516","dur":"9.030781165730467","label":"V97","uri":"http://videos.dataset.io/V97.webm"},{"start":"289.7768220701255","dur":"16.034267163023344","label":"V98","uri":"http://videos.dataset.io/V98.webm"},{"start":"391.90115161659196","dur":"185.1923779968638","label":"V99","uri":"http://videos.dataset.io/V99.webm"}]';;
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
