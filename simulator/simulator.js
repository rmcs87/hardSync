var d = require("../dal.js");
var dal = new d.DAL();

var dalGold = new d.DAL();

var nVideos = 40;

//Timeline de 10 minutos
var start = 0;//Segundo inicial da timeline
var duration = 599;//Duracao do Evento em segundos

var min = 5;//tamanho minimo do video
var max = 300;//tamanho maximo do video

// % de chance de um worker contribuir corretamente
var crowdReputation = process.argv[2];

var users = new Array();
users[0] = new d.User('faux-user-001', 90);
users[1] = new d.User('faux-user-002', 70);
users[2] = new d.User('faux-user-003', 30);
users[3] = new d.User('faux-user-004', 10);


//Vetor de videos gerados 
//var videos = generateVideos(nVideos,start,duration,min,max);
var videos = loadVideos(nVideos);
//for(var video in videos) videos[video].print();

var nGold=0;
var nGoldInfered=0;
var nGoldImpossible=0;
var gold = geraGold(videos);

//console.log(JSON.stringify(gold));
//console.log('Gold');
//printGold(gold);


var cd;
for(var contr=0,cd=0; newContribution() ; contr++,cd++);

var cg;
for(var contr=0,cg=0; newGoldContribution(users[0]) ; contr++,cg++);

console.log('#'+process.argv[3]);
console.log('Crowd Reputation: '+crowdReputation+'%');

countGold(dalGold);

var slots = (nVideos*nVideos -nVideos)/2;

console.log('Slots: '+ slots);
console.log('Gold Contributions: '+cg);
console.log('Initial Gold Entries: ',nGold);
console.log('Infered Gold Entries: ',nGoldInfered);
console.log('Impossible Gold Entries: ',nGoldImpossible);
console.log('DAL Contributions: '+cd);

//dal.inferUnknown();

dal.compareDals(dalGold);

///FUNCOES

function printGold(gold) {
    for(var A in gold){
        for(var B in gold[A]){
            console.log('['+A+','+B+'] = '+gold[A][B]);
        }
    }
}

function countGold(dalGold){
    
    var x=0;
	for(var A = 0; A < dalGold.assets.length-1; A++){
		for(var R in dalGold.assets[A].relations){
        x++;
            var delta = dalGold.assets[A].relations[R].delta;
            //console.log(dalGold.assets[A].relations[R].frm.label + ' <- ('+ delta +' ) ->' +dalGold.assets[A].relations[R].to.label);
		    if(delta == 'I' || delta =='N' || delta == null){
		        nGoldImpossible++;
		    }else{
		        if(dalGold.assets[A].relations[R].isInfered()){
		            nGoldInfered++;
		        }else{
		            nGold++;
		        }
		    }
        }
    }
    //console.log(x);
}

function geraGold(videos){
    var gold = new Array();
    for(var A in videos){
        gold[A] = new Array();
        for(var B in videos){
		    var delta = getDelta(videos[A],videos[B]);
		    //if(delta != 'I' && delta !='N' && A != B) nGold++;
            gold[A][B] = delta;
        }
    }

    //nGold = nGold/2 ;

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
    if(sb > (sa+dur)) delta = 'N';//No Overlap
    return delta;
}

function newContribution(){
	var userClass = Math.random() * 1000 % 100;
    var userSubClass = Math.floor(Math.random() * 1000 % 2);
	var userId;
	var user;
	var id;

    	var chance = Math.random() * 1000 % 100;

   	if(userClass < crowdReputation){ // Confiavel
		if(userSubClass == 0){
			id = 0;
		}else{
			id = 1;
		}
	}else{ 				// Nao Confiavel
		if(userSubClass == 0){
			id = 2;
		}else{
			id = 3;
		}
	}

	//console.log("Grupo "+id);

	user = users[id];
   
	if(chance < user.lvl){
        	return newValidContribution(user);
    	}else{
        	//return newValidContribution(user);
        	return newRandomContribution(user);
    	}
}

function newGoldContribution(user){
    var pair = dalGold.chooseNextPair(user.id);

    if(pair == null) return false;

    var delta =  gold[pair.frm.label][pair.to.label];

    dalGold.addContribution(pair.frm, pair.to,delta,user);

    return true;
}

function newValidContribution(user){
    var pair = dal.chooseNextPair(user.id);

    if(pair == null) return false;

    var delta = gold[pair.frm.label][pair.to.label];

    dal.addContribution(pair.frm, pair.to,delta,user);

    return true;
}

function newRandomContribution(user){
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
    
	//console.log('{"start":"'+start_seg+'","dur":"'+duration+'","label":"'+label+'","uri":"'+uri+'"}');
 
        dal.addAsset(new d.Asset(uri, label, duration));
        videos[video.getLabel()] = video;
    }
    return videos;
}

function loadVideos(number){
    	var videos = new Array();
		
	var jsonVideos='[{"start":"397.2041234690696","duration":"191.47188626928255","label":"V0","uri":"http://videos.dataset.io/V0.webm"},{"start":"516.1790329483338","duration":"53.43629731214605","label":"V1","uri":"http://videos.dataset.io/V1.webm"},{"start":"292.8311471347697","duration":"185.7042348913617","label":"V2","uri":"http://videos.dataset.io/V2.webm"},{"start":"304.7582625611685","duration":"243.35463362629525","label":"V3","uri":"http://videos.dataset.io/V3.webm"},{"start":"482.8035937687382","duration":"74.49665280524641","label":"V4","uri":"http://videos.dataset.io/V4.webm"},{"start":"442.6111010275781","duration":"281.94712736294605","label":"V5","uri":"http://videos.dataset.io/V5.webm"},{"start":"428.24627637071535","duration":"26.67247560690157","label":"V6","uri":"http://videos.dataset.io/V6.webm"},{"start":"363.9548941385001","duration":"134.1645577957388","label":"V7","uri":"http://videos.dataset.io/V7.webm"},{"start":"209.22350331256166","duration":"159.86370727449304","label":"V8","uri":"http://videos.dataset.io/V8.webm"},{"start":"158.05349981877953","duration":"130.02148414100535","label":"V9","uri":"http://videos.dataset.io/V9.webm"},{"start":"348.81773290690035","duration":"63.61335534369573","label":"V10","uri":"http://videos.dataset.io/V10.webm"},{"start":"268.8887109667994","duration":"211.07610808928223","label":"V11","uri":"http://videos.dataset.io/V11.webm"},{"start":"9.253188143018633","duration":"6.038779875316532","label":"V12","uri":"http://videos.dataset.io/V12.webm"},{"start":"306.83546415390447","duration":"212.68219219404273","label":"V13","uri":"http://videos.dataset.io/V13.webm"},{"start":"103.10434024920687","duration":"80.9131353407955","label":"V14","uri":"http://videos.dataset.io/V14.webm"},{"start":"273.03209609445184","duration":"183.81365701721217","label":"V15","uri":"http://videos.dataset.io/V15.webm"},{"start":"283.7779732965864","duration":"262.96315347068054","label":"V16","uri":"http://videos.dataset.io/V16.webm"},{"start":"427.669098702725","duration":"222.5463464600034","label":"V17","uri":"http://videos.dataset.io/V17.webm"},{"start":"168.5377055122517","duration":"24.67066124523938","label":"V18","uri":"http://videos.dataset.io/V18.webm"},{"start":"325.643668489065","duration":"162.9799554857891","label":"V19","uri":"http://videos.dataset.io/V19.webm"},{"start":"372.3707575504668","duration":"48.57081097783521","label":"V20","uri":"http://videos.dataset.io/V20.webm"},{"start":"15.45826906338334","duration":"7.607727603197692","label":"V21","uri":"http://videos.dataset.io/V21.webm"},{"start":"405.8660073732026","duration":"188.62379989237525","label":"V22","uri":"http://videos.dataset.io/V22.webm"},{"start":"593.8333565420471","duration":"28.605110395001248","label":"V23","uri":"http://videos.dataset.io/V23.webm"},{"start":"587.6280985958874","duration":"226.6823595506139","label":"V24","uri":"http://videos.dataset.io/V24.webm"},{"start":"112.49977036565542","duration":"13.827958724375716","label":"V25","uri":"http://videos.dataset.io/V25.webm"},{"start":"271.593993994873","duration":"7.270274262176062","label":"V26","uri":"http://videos.dataset.io/V26.webm"},{"start":"384.09003611886874","duration":"138.49817994399928","label":"V27","uri":"http://videos.dataset.io/V27.webm"},{"start":"177.1422244841233","duration":"26.851813312170833","label":"V28","uri":"http://videos.dataset.io/V28.webm"},{"start":"462.06173750478774","duration":"95.79371514730155","label":"V29","uri":"http://videos.dataset.io/V29.webm"},{"start":"183.64499889640138","duration":"66.68125518165056","label":"V30","uri":"http://videos.dataset.io/V30.webm"},{"start":"83.24243661528453","duration":"75.10623528017202","label":"V31","uri":"http://videos.dataset.io/V31.webm"},{"start":"76.82523979153484","duration":"24.065366050571534","label":"V32","uri":"http://videos.dataset.io/V32.webm"},{"start":"406.25870894966647","duration":"139.77584682987072","label":"V33","uri":"http://videos.dataset.io/V33.webm"},{"start":"262.2064693248831","duration":"28.531653581694716","label":"V34","uri":"http://videos.dataset.io/V34.webm"},{"start":"265.980759404134","duration":"119.62209422338809","label":"V35","uri":"http://videos.dataset.io/V35.webm"},{"start":"470.5463282773271","duration":"271.1594023182988","label":"V36","uri":"http://videos.dataset.io/V36.webm"},{"start":"166.8677668357268","duration":"48.567859270817074","label":"V37","uri":"http://videos.dataset.io/V37.webm"},{"start":"507.23158389376476","duration":"159.84023174270988","label":"V38","uri":"http://videos.dataset.io/V38.webm"},{"start":"403.94956387300044","duration":"196.39556895708665","label":"V39","uri":"http://videos.dataset.io/V39.webm"},{"start":"504.29396363766864","duration":"150.06921219290234","label":"V40","uri":"http://videos.dataset.io/V40.webm"},{"start":"238.7445046757348","duration":"28.59725412795284","label":"V41","uri":"http://videos.dataset.io/V41.webm"},{"start":"168.6467427527532","duration":"45.348784195948","label":"V42","uri":"http://videos.dataset.io/V42.webm"},{"start":"242.35943903867155","duration":"130.71921031111833","label":"V43","uri":"http://videos.dataset.io/V43.webm"},{"start":"397.1946924198419","duration":"127.01098939403892","label":"V44","uri":"http://videos.dataset.io/V44.webm"},{"start":"123.7555955410935","duration":"86.13286193790749","label":"V45","uri":"http://videos.dataset.io/V45.webm"},{"start":"493.37975468160585","duration":"296.0106221202295","label":"V46","uri":"http://videos.dataset.io/V46.webm"},{"start":"122.80223432462662","duration":"117.33782483008638","label":"V47","uri":"http://videos.dataset.io/V47.webm"},{"start":"421.9993711700663","duration":"159.17630854761228","label":"V48","uri":"http://videos.dataset.io/V48.webm"},{"start":"117.93382124463096","duration":"96.885056418367","label":"V49","uri":"http://videos.dataset.io/V49.webm"},{"start":"308.3911676700227","duration":"58.27577365213074","label":"V50","uri":"http://videos.dataset.io/V50.webm"},{"start":"86.96845341986045","duration":"80.68791599532885","label":"V51","uri":"http://videos.dataset.io/V51.webm"},{"start":"245.91233609477058","duration":"140.227781316862","label":"V52","uri":"http://videos.dataset.io/V52.webm"},{"start":"318.3510308419354","duration":"141.76959605538286","label":"V53","uri":"http://videos.dataset.io/V53.webm"},{"start":"164.58981411904097","duration":"20.063031851742295","label":"V54","uri":"http://videos.dataset.io/V54.webm"},{"start":"400.71255869884044","duration":"16.456369168590754","label":"V55","uri":"http://videos.dataset.io/V55.webm"},{"start":"214.92666465602815","duration":"208.96225708837022","label":"V56","uri":"http://videos.dataset.io/V56.webm"},{"start":"498.7853313763626","duration":"96.46528662764467","label":"V57","uri":"http://videos.dataset.io/V57.webm"},{"start":"189.16120011685416","duration":"169.18196640484976","label":"V58","uri":"http://videos.dataset.io/V58.webm"},{"start":"11.397553184069693","duration":"6.292532979757324","label":"V59","uri":"http://videos.dataset.io/V59.webm"},{"start":"324.78803450101987","duration":"210.65273100626655","label":"V60","uri":"http://videos.dataset.io/V60.webm"},{"start":"62.12037970032543","duration":"60.55660234883968","label":"V61","uri":"http://videos.dataset.io/V61.webm"},{"start":"119.81808463623747","duration":"23.547517357924043","label":"V62","uri":"http://videos.dataset.io/V62.webm"},{"start":"260.9047848242335","duration":"105.70558423702519","label":"V63","uri":"http://videos.dataset.io/V63.webm"},{"start":"218.4276231736876","duration":"61.331846045372984","label":"V64","uri":"http://videos.dataset.io/V64.webm"},{"start":"468.1644192370586","duration":"152.06233542296104","label":"V65","uri":"http://videos.dataset.io/V65.webm"},{"start":"155.37348376540467","duration":"51.772631006896376","label":"V66","uri":"http://videos.dataset.io/V66.webm"},{"start":"24.908093397971243","duration":"9.782670375528383","label":"V67","uri":"http://videos.dataset.io/V67.webm"},{"start":"263.39480144297704","duration":"23.622695209043524","label":"V68","uri":"http://videos.dataset.io/V68.webm"},{"start":"297.48021266935393","duration":"220.54628852405642","label":"V69","uri":"http://videos.dataset.io/V69.webm"},{"start":"249.31511956406757","duration":"237.98760124893062","label":"V70","uri":"http://videos.dataset.io/V70.webm"},{"start":"26.22460118122399","duration":"11.554965228992597","label":"V71","uri":"http://videos.dataset.io/V71.webm"},{"start":"217.05936397379264","duration":"153.04438327139295","label":"V72","uri":"http://videos.dataset.io/V72.webm"},{"start":"126.12839978514239","duration":"106.97176116771624","label":"V73","uri":"http://videos.dataset.io/V73.webm"},{"start":"289.58401497872546","duration":"96.84618010756262","label":"V74","uri":"http://videos.dataset.io/V74.webm"},{"start":"500.6967917387374","duration":"58.398088657995686","label":"V75","uri":"http://videos.dataset.io/V75.webm"},{"start":"394.181740634609","duration":"293.8571720721666","label":"V76","uri":"http://videos.dataset.io/V76.webm"},{"start":"389.28610527468845","duration":"192.66456771292724","label":"V77","uri":"http://videos.dataset.io/V77.webm"},{"start":"458.0117816128768","duration":"143.95238388795406","label":"V78","uri":"http://videos.dataset.io/V78.webm"},{"start":"459.1676931162365","duration":"193.9316070312634","label":"V79","uri":"http://videos.dataset.io/V79.webm"},{"start":"229.35461809439585","duration":"32.30839390099038","label":"V80","uri":"http://videos.dataset.io/V80.webm"},{"start":"423.1684192321263","duration":"236.19797810679302","label":"V81","uri":"http://videos.dataset.io/V81.webm"},{"start":"420.77242889627814","duration":"103.8949501386378","label":"V82","uri":"http://videos.dataset.io/V82.webm"},{"start":"296.2718163370155","duration":"68.7702041776688","label":"V83","uri":"http://videos.dataset.io/V83.webm"},{"start":"301.28674370981753","duration":"101.19178370106965","label":"V84","uri":"http://videos.dataset.io/V84.webm"},{"start":"58.651222760323435","duration":"31.885442730007902","label":"V85","uri":"http://videos.dataset.io/V85.webm"},{"start":"69.34227078640833","duration":"63.61632344863802","label":"V86","uri":"http://videos.dataset.io/V86.webm"},{"start":"170.3460989673622","duration":"156.47380468974376","label":"V87","uri":"http://videos.dataset.io/V87.webm"},{"start":"132.0373937226832","duration":"40.24300477885687","label":"V88","uri":"http://videos.dataset.io/V88.webm"},{"start":"564.6902248980477","duration":"148.7417983810883","label":"V89","uri":"http://videos.dataset.io/V89.webm"},{"start":"324.21011014375836","duration":"54.611331233754754","label":"V90","uri":"http://videos.dataset.io/V90.webm"},{"start":"124.34346155636013","duration":"64.45833206829826","label":"V91","uri":"http://videos.dataset.io/V91.webm"},{"start":"356.40224280161783","duration":"118.01137255737558","label":"V92","uri":"http://videos.dataset.io/V92.webm"},{"start":"138.1904928162694","duration":"92.82868901653472","label":"V93","uri":"http://videos.dataset.io/V93.webm"},{"start":"122.72797145042568","duration":"50.63096957152498","label":"V94","uri":"http://videos.dataset.io/V94.webm"},{"start":"168.47135472297668","duration":"139.55195483967398","label":"V95","uri":"http://videos.dataset.io/V95.webm"},{"start":"231.42875644937158","duration":"208.42752346963695","label":"V96","uri":"http://videos.dataset.io/V96.webm"},{"start":"232.35916129266843","duration":"63.22253643621301","label":"V97","uri":"http://videos.dataset.io/V97.webm"},{"start":"65.27236090647057","duration":"24.07733846871107","label":"V98","uri":"http://videos.dataset.io/V98.webm"},{"start":"455.4953340748325","duration":"56.91181788803078","label":"V99","uri":"http://videos.dataset.io/V99.webm"}]';


	var vetVideos = JSON.parse(jsonVideos);
    
	for(var i=0; i<number; i++){
       	 	var video = new Video(parseFloat(vetVideos[i].start),parseFloat(vetVideos[i].duration),vetVideos[i].label,vetVideos[i].uri);
		    dal.addAsset(new d.Asset(vetVideos[i].uri, vetVideos[i].label, parseFloat(vetVideos[i].duration)));
		    dalGold.addAsset(new d.Asset(vetVideos[i].uri, vetVideos[i].label, parseFloat(vetVideos[i].duration)));
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

    this.getStart = function getStart(){return start;}

    this.getDuration = function getDuration(){return dur;}

    this.print = function print(){
        console.log('{"start": "'+start+'","duration": "'+dur+'", "label": "'+label+'", "uri": "'+uri+'"}');
    }
    
}

