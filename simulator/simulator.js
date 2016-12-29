var d = require("../dal.js");
var dal = new d.DAL();

var dalGold = new d.DAL();

var nVideos = 89;

//Timeline de 10 minutos
var start = 0;//Segundo inicial da timeline
var duration = 4328;//Duracao do Evento em segundos

var min = 5;//tamanho minimo do video
var max = 300;//tamanho maximo do video

// % de chance de um worker contribuir corretamente
var crowdReputation = process.argv[2];


var c_true=0, c_false=0;

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

var c_true=0, c_false=0;


var cd;
for(var contr=0,cd=0; newContribution() ; contr++,cd++);

var cg;
for(var contr=0,cg=0; newGoldContribution(users[0]) ; contr++,cg++);

console.log('Contribution True: '+c_true);
console.log('Contribution False: '+c_false);

console.log('Contributions True: '+c_true);
console.log('Contributions False: '+c_false);

//console.log('#'+process.argv[3]);
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
console.log(cd+';');
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
	        c_true++;
        	return newValidContribution(user);
    	}else{
    	    c_false++;
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
	
	
		var jsonVideos='[{"start":"115.12","duration":"143.66","label":"albert\/video-2013-01-08-14-31-00","uri":"albert\/video-2013-01-08-14-31-00"},{"start":"307.46","duration":"503.92","label":"albert\/video-2013-01-08-14-34-12","uri":"albert\/video-2013-01-08-14-34-12"},{"start":"972.84","duration":"192.09","label":"albert\/video-2013-01-08-14-45-17","uri":"albert\/video-2013-01-08-14-45-17"},{"start":"1407.65","duration":"648.93","label":"albert\/video-2013-01-08-14-52-33","uri":"albert\/video-2013-01-08-14-52-33"},{"start":"2307.97","duration":"1028.83","label":"albert_ixus70\/longvid.avi","uri":"albert_ixus70\/longvid.avi"},{"start":"206.15","duration":"34.96","label":"anoop\/DSC_1346","uri":"anoop\/DSC_1346"},{"start":"269.31","duration":"18.96","label":"anoop\/DSC_1347","uri":"anoop\/DSC_1347"},{"start":"310.14","duration":"26.96","label":"anoop\/DSC_1348","uri":"anoop\/DSC_1348"},{"start":"690.26","duration":"28.96","label":"anoop\/DSC_1356","uri":"anoop\/DSC_1356"},{"start":"921.51","duration":"99.96","label":"anoop\/DSC_1363","uri":"anoop\/DSC_1363"},{"start":"1106.15","duration":"19.96","label":"anoop\/DSC_1364","uri":"anoop\/DSC_1364"},{"start":"1200.77","duration":"44.96","label":"anoop\/DSC_1365","uri":"anoop\/DSC_1365"},{"start":"1339.99","duration":"77.96","label":"anoop\/DSC_1367","uri":"anoop\/DSC_1367"},{"start":"2742.30","duration":"46.96","label":"anoop\/DSC_1386","uri":"anoop\/DSC_1386"},{"start":"3495.03","duration":"37.96","label":"anoop\/DSC_1391","uri":"anoop\/DSC_1391"},{"start":"140.53","duration":"330.42","label":"danila\/CIMG8266","uri":"danila\/CIMG8266"},{"start":"932.55","duration":"89.87","label":"danila\/CIMG8275","uri":"danila\/CIMG8275"},{"start":"619.42","duration":"160.24","label":"danila_nokia5800\/08012013234","uri":"danila_nokia5800\/08012013234"},{"start":"1131.81","duration":"95.60","label":"danila_nokia5800\/08012013236","uri":"danila_nokia5800\/08012013236"},{"start":"1328.12","duration":"200.45","label":"danila_nokia5800\/08012013237","uri":"danila_nokia5800\/08012013237"},{"start":"1950.39","duration":"97.09","label":"danila_nokia5800\/08012013238","uri":"danila_nokia5800\/08012013238"},{"start":"2242.41","duration":"110.06","label":"danila_nokia5800\/08012013239","uri":"danila_nokia5800\/08012013239"},{"start":"3132.18","duration":"77.64","label":"danila_nokia5800\/08012013241","uri":"danila_nokia5800\/08012013241"},{"start":"3387.30","duration":"175.71","label":"danila_nokia5800\/08012013242","uri":"danila_nokia5800\/08012013242"},{"start":"4026.68","duration":"56.55","label":"danila_nokia5800\/08012013243","uri":"danila_nokia5800\/08012013243"},{"start":"190.16","duration":"99.90","label":"franck\/20130108_143405","uri":"franck\/20130108_143405"},{"start":"430.33","duration":"224.73","label":"franck\/20130108_143805","uri":"franck\/20130108_143805"},{"start":"718.78","duration":"197.66","label":"franck\/20130108_144253","uri":"franck\/20130108_144253"},{"start":"980.36","duration":"102.20","label":"franck\/20130108_144715","uri":"franck\/20130108_144715"},{"start":"1413.64","duration":"728.07","label":"franck\/20130108_145428","uri":"franck\/20130108_145428"},{"start":"2187.36","duration":"610.30","label":"franck\/20130108_150722","uri":"franck\/20130108_150722"},{"start":"3463.64","duration":"759.53","label":"franck\/20130108_152839","uri":"franck\/20130108_152839"},{"start":"95.38","duration":"138.87","label":"gopro_1\/GOPR0008","uri":"gopro_1\/GOPR0008"},{"start":"672.11","duration":"281.61","label":"gopro_1\/GOPR0010","uri":"gopro_1\/GOPR0010"},{"start":"1078.04","duration":"566.10","label":"gopro_1\/GOPR0011","uri":"gopro_1\/GOPR0011"},{"start":"3313.95","duration":"1013.35","label":"gopro_1\/GOPR0015","uri":"gopro_1\/GOPR0015"},{"start":"840.89","duration":"180.93","label":"gopro_120fps\/GOPR0005","uri":"gopro_120fps\/GOPR0005"},{"start":"1304.21","duration":"212.85","label":"gopro_2\/GOPR0001","uri":"gopro_2\/GOPR0001"},{"start":"101.61","duration":"233.28","label":"guillaume\/00399","uri":"guillaume\/00399"},{"start":"426.65","duration":"208.32","label":"guillaume\/00400","uri":"guillaume\/00400"},{"start":"690.97","duration":"505.92","label":"guillaume\/00401","uri":"guillaume\/00401"},{"start":"237.51","duration":"83.96","label":"heng_nikon\/DSC_0005","uri":"heng_nikon\/DSC_0005"},{"start":"640.00","duration":"136.96","label":"heng_nikon\/DSC_0009","uri":"heng_nikon\/DSC_0009"},{"start":"1106.15","duration":"46.96","label":"heng_nikon\/DSC_0012","uri":"heng_nikon\/DSC_0012"},{"start":"1203.52","duration":"44.96","label":"heng_nikon\/DSC_0013","uri":"heng_nikon\/DSC_0013"},{"start":"1316.98","duration":"166.96","label":"heng_nikon\/DSC_0015","uri":"heng_nikon\/DSC_0015"},{"start":"1791.38","duration":"269.96","label":"heng_nikon\/DSC_0019","uri":"heng_nikon\/DSC_0019"},{"start":"2516.80","duration":"201.96","label":"heng_nikon\/DSC_0022","uri":"heng_nikon\/DSC_0022"},{"start":"3036.97","duration":"96.96","label":"heng_nikon\/DSC_0024","uri":"heng_nikon\/DSC_0024"},{"start":"3462.53","duration":"103.96","label":"heng_nikon\/DSC_0028","uri":"heng_nikon\/DSC_0028"},{"start":"3599.74","duration":"584.96","label":"heng_nikon\/DSC_0029","uri":"heng_nikon\/DSC_0029"},{"start":"429.12","duration":"598.20","label":"jerome\/IMG_0138","uri":"jerome\/IMG_0138"},{"start":"1281.56","duration":"238.87","label":"jerome\/IMG_0139","uri":"jerome\/IMG_0139"},{"start":"2032.09","duration":"545.44","label":"jerome\/IMG_0141","uri":"jerome\/IMG_0141"},{"start":"2652.24","duration":"242.67","label":"jerome\/IMG_0143","uri":"jerome\/IMG_0143"},{"start":"2928.30","duration":"1259.06","label":"jerome\/IMG_0144","uri":"jerome\/IMG_0144"},{"start":"233.44","duration":"110.73","label":"philippe_2\/SAM_1575","uri":"philippe_2\/SAM_1575"},{"start":"350.75","duration":"151.67","label":"philippe_2\/SAM_1576","uri":"philippe_2\/SAM_1576"},{"start":"516.20","duration":"175.10","label":"philippe_2\/SAM_1577","uri":"philippe_2\/SAM_1577"},{"start":"694.42","duration":"364.07","label":"philippe_2\/SAM_1578","uri":"philippe_2\/SAM_1578"},{"start":"1322.81","duration":"158.70","label":"philippe_2\/SAM_1582","uri":"philippe_2\/SAM_1582"},{"start":"1634.29","duration":"423.67","label":"philippe_2\/SAM_1585","uri":"philippe_2\/SAM_1585"},{"start":"2187.55","duration":"330.07","label":"philippe_2\/SAM_1587","uri":"philippe_2\/SAM_1587"},{"start":"2564.32","duration":"105.27","label":"philippe_2\/SAM_1588","uri":"philippe_2\/SAM_1588"},{"start":"3464.88","duration":"74.27","label":"philippe_3\/MOV_0066","uri":"philippe_3\/MOV_0066"},{"start":"148.72","duration":"744.78","label":"philippe_canon_eos\/MVI_3967","uri":"philippe_canon_eos\/MVI_3967"},{"start":"1001.89","duration":"94.58","label":"philippe_canon_eos\/MVI_3974","uri":"philippe_canon_eos\/MVI_3974"},{"start":"1295.44","duration":"239.54","label":"philippe_canon_eos\/MVI_3976","uri":"philippe_canon_eos\/MVI_3976"},{"start":"1537.84","duration":"515.98","label":"philippe_canon_eos\/MVI_3978","uri":"philippe_canon_eos\/MVI_3978"},{"start":"2198.49","duration":"83.58","label":"philippe_canon_eos\/MVI_3979","uri":"philippe_canon_eos\/MVI_3979"},{"start":"2377.72","duration":"157.64","label":"philippe_canon_eos\/MVI_3980","uri":"philippe_canon_eos\/MVI_3980"},{"start":"2573.91","duration":"232.95","label":"philippe_canon_eos\/MVI_3981","uri":"philippe_canon_eos\/MVI_3981"},{"start":"2822.57","duration":"362.30","label":"philippe_canon_eos\/MVI_3982","uri":"philippe_canon_eos\/MVI_3982"},{"start":"3190.20","duration":"173.09","label":"philippe_canon_eos\/MVI_3985","uri":"philippe_canon_eos\/MVI_3985"},{"start":"3921.66","duration":"260.01","label":"philippe_canon_eos\/MVI_3990","uri":"philippe_canon_eos\/MVI_3990"},{"start":"1783.19","duration":"66.97","label":"stan\/DSCF5687","uri":"stan\/DSCF5687"},{"start":"1904.59","duration":"77.97","label":"stan\/DSCF5689","uri":"stan\/DSCF5689"},{"start":"2288.12","duration":"122.97","label":"stan\/DSCF5691","uri":"stan\/DSCF5691"},{"start":"2697.01","duration":"99.97","label":"stan\/DSCF5696","uri":"stan\/DSCF5696"},{"start":"0.38","duration":"248.18","label":"yang\/00011","uri":"yang\/00011"},{"start":"254.66","duration":"240.50","label":"yang\/00012","uri":"yang\/00012"},{"start":"502.31","duration":"69.14","label":"yang\/00013","uri":"yang\/00013"},{"start":"635.45","duration":"403.22","label":"yang\/00014","uri":"yang\/00014"},{"start":"1053.61","duration":"246.26","label":"yang\/00015","uri":"yang\/00015"},{"start":"1342.79","duration":"352.34","label":"yang\/00016","uri":"yang\/00016"},{"start":"1734.19","duration":"326.88","label":"yang\/00017","uri":"yang\/00017"},{"start":"2663.53","duration":"407.06","label":"yang\/00020","uri":"yang\/00020"},{"start":"3217.12","duration":"354.26","label":"yang\/00021","uri":"yang\/00021"},{"start":"1986.56","duration":"64.00","label":"stan\/DSCF5690","uri":"stan\/DSCF5690"}]';


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

