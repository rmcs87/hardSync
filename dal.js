/*
	In this version we are not allowing Hierarchies (Struct DLA from model),
	or removihg anything, nor any error Handling is used.
*/
////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////Constructors///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//Imports for Node
var ss = require("./simple-statistics.min.js");

//Defines
var convergence_threshold = 3;
var impossible_threshold = 3;

/*contructor for DLA:*/
function DLA(){

	this.it = 0;

	this.assets = new Array();
	/*Function to add an Asset:
		a (Asset): an Asset to be related in this DLA;
	*/

	this.addAsset = function addAsset(a){
		for(var x=0; x < this.assets.length; x++){
			this.assets[x].addRelation( new Relation(this.assets[x],a) );
		}
		this.assets.push(a);
	}

	/*Function to add a Contribution:
		a,b (Asset): Assets to be related;
		delta (NUMBER): the difference time between a and b;
	*/
	this.addContribution = function addContribution(a,b,delta,user){
		var rel = this.getRelation(a,b);
		if( delta == 'I'){
			rel.impossible++;
		}else{
			rel.add(new Contribution(user,delta));
		}
		this.updateConvergence(a,b);
	}

	/*Function to recover an Asset
		label (STRING): the asset laber (id)
	*/
	this.getAsset = function getAsset(label){
		for(var i = 0; i < this.assets.length; i++){
			if(label == this.assets[i].label){
				return this.assets[i];
			}
		}
	}

	/*Function that returns the difference between two assets
		a,b (Asset): the asset wich we want the difference
	*/
	this.getDiff = function getDiff(a,b){
		var pa = this.assets.indexOf(a);
		var pb = this.assets.indexOf(b);
		var rel;
		if(pa < pb){
			return a.getRelation(b).delta;
		}else{
			var x = b.getRelation(a).delta;
			if(x){return -x}else{return x};
		}
	}


	// Function to check the convergence of contributions, and update deltas with mode value
	this.updateConvergence = function updateConvergence(a,b){

		var c = 0;//current(last) slot selected
		var cc = 0;//convergence consecutive counter
		var ca = 0;//convergence candidate

		var rel = this.getRelation(a,b);
		var n = rel.contributions.length;
		if(n == 0) return new Array();

		for(var vet = new Array(), i = 0; i < rel.contributions.length; vet.push(rel.contributions[i++].value));
	
		var max = Math.max.apply(null, vet);
		var min = Math.min.apply(null, vet);
		var step = 0.25;//0.1 sec of tolerance

		for(var pos = 0, ini = min, groups = new Array(), counters = new Array(); ini <= max ; ini+=step, pos++, groups.push(new Array()), counters.push(0));
		
		for(var i=0; i < vet.length; i++){

			for(var j=0, ini=min+step; ini < vet[i]; ini+=step, j++);

			groups[j].push(vet[i]);
			counters[j]++;
	
	
			if(j == c){
				cc++;
			}else{
				c = j;
				cc = 1;
			}

			if(cc == convergence_threshold){
				ca = c;
				rel.converged = true;
			}

		}	

		rel.delta = ss.mode(groups[ca]);
	}

	/*Function to calculate the difference of two assets. We use the Geometric mean:
		"In mathematics, the geometric mean is a type of mean or average, which indicates
		the central tendency or typical value of a set of numbers by using the product
		of their values (as opposed to the arithmetic mean which uses their sum)" (wikipedia)"
		"http://buzzardsbay.org/geomean.htm"
		"http://simplestatistics.org/docs/#geometricMean"
		a,b (Asset): the Assets wich we want the difference.
		OBS!!!!: essas medias não funcionam com valores negativos, entao no momento é usada a média normal.
	*/
	this.updateGeometricMean = function updateGeometricMean(a,b){
		var rel = this.getRelation(a,b);
		var vet = new Array();
		for(var i = 0; i < rel.contributions.length; i++){
			vet.push(rel.contributions[i].value);
		}
		//console.log('S',ss.geometricMean;
		rel.delta = ss.mean(vet);
		//rel.delta = ss.geometricMean(vet);
		//rel.delta=vet[0];
		//rel.delta = ss.harmonicMean(vet);
	}

	/*Function to calculate the difference of two assets. This one user average mean.
		a,b (Asset): the Assets wich we want the difference.
	*/
	this.updateAverage = function updateAverage(a,b){
		var rel = this.getRelation(a,b);
		var sum = 0;
		for(var i =0; i < rel.contributions.length; i++){
			sum += rel.contributions[i].value;
		}
		rel.delta = sum/rel.count;
	}

	/*Function to get a relation */
	this.getRelation = function getRelation(a,b){
		var pa = this.assets.indexOf(a);
		var pb = this.assets.indexOf(b);
		var rel;
		if(pa < pb){
			rel = a.getRelation(b);
		}else{
			rel = b.getRelation(a);
		}
		return rel;
	}

	/*Function to update all Deltas of known relations.*/
	this.updateAll = function updateAll(){
		for(var i = 0; i < this.assets.length; i++){
			for(var j = 0; j < this.assets.length; j++){
				if(this.assets[i].label != this.assets[j].label){
					this.updateConvergence(this.assets[i],this.assets[j]);
				}
			}
		}
	}

	//Funcao recursiva que procura o caminho pelo principio da transitividade
	this.search = function search(a,b){
		rel = this.getRelation(a,b);
		if(rel.delta){
			dr = rel.delta;
			if(rel.frm == b){
				dr = -dr
				//console.log(rel.to.label+'->'+rel.frm.label);
			}else{
				//console.log(rel.frm.label+'->'+rel.to.label);
			}
			this.it=0;
			return dr;
		}
		var rels = a.relations;
		this.it++;
		for(i=0; i < rels.length; i++){
			var r = rels[i];
			if(!r.delta) continue;
			var d = this.search(r.to,b);
			if(this.it > this.assets.length){
				this.it--;
				return r.delta+d;
			}
			if(d){
				dr = r.delta;
				if(r.frm == b) dr = -dr
				//console.log(r.frm.label+'->'+r.to.label);
				this.it--;
				return dr + d;
			}
		}
		return null;
	}

	/*Function to infer the unknown Deltas.*/
	//Procura transitividade entre A e B recursivamente
	this.inferUnknown = function inferUnknown(){
	

		//Passo 1 - Iterativo

		//Percorre todos assets, menos o ultimo, pois ele não tem relacoes;
		for(var i = 0; i < this.assets.length - 1; i++){
			//Percorre todos assets à direita, menos o último;
			for(var j = i+1; j < this.assets.length - 1; j++){
				var rel = this.assets[i].relations[j-i-1];
				//Se ha relação entre Ai e Aj;
				if(rel.count > 0){
					//Percorre todas contribuições para ver se tem algo que Ai sabe e Aj não;
					for(var k = 0; k < this.assets.length - j - 1; k++){
						//Se Ai sabe e Aj não, infere;
						if( ( this.assets[i].relations[k+1].count > 0) && (this.assets[j].relations[k].count == 0) ){
							//BC = -BA + AC
							this.assets[j].relations[k].delta = -this.assets[i].relations[j-1-i].delta + this.assets[i].relations[k+j-i].delta;

							var rel = this.getRelation(this.getAsset(this.assets[i].label),this.getAsset(this.assets[j].label));
							rel.infered = true;

						}
					}
				}
			}
		}


		//Passo 2 - Recursivo

		for(var i = 0; i < this.assets.length; i++){
		
			var rels = this.assets[i].relations;
			//console.log(rels);
			for(j=0; j < rels.length; j++){
				var rel = rels[j];
				
				if(!rel.count){
					//console.log('#'+this.assets[i].label+'->'+rel.to.label);
					rel.delta = this.search(rel.frm, rel.to);
					rel.infered = true;
				}
			}		
		}
		
	}

	/*Function to show on console all relations.*/
	this.print = function print(){
		for(var i = 0; i < this.assets.length; i++){
			for(var j = 0; j < this.assets.length; j++){
				if(this.assets[i].label != this.assets[j].label){
					rel = this.getRelation(this.getAsset(this.assets[i].label),this.getAsset(this.assets[j].label));
					console.log('Converged: '+rel.converged);
					console.log('Infered: '+rel.infered);
					console.log(this.assets[i].label+'<->'+this.assets[j].label+'='+this.getDiff(this.assets[i],this.assets[j])+'\n');
				}
			}
		}
	}

	/*Function that returns an object with all info necessary to play the assets.
		-the {base asset,dur} (the one with more relations)
		-a vetor with: {asset, asset dur, delta to base]
		!nessa implementação, retorno o primeiro asset como base, mas deveria ver aquele
		com mais relações!
		Ex: "{"assetBase":{"uri":"ws://10.9.7.127:8084","dur":0},"relations":["ws://10.9.7.130:8084",0,-5.42]}"
	*/
	this.getPresentation = function getPresentation(){
		if(this.assets.length <= 0){return}
		var vet = new Array();
		var objBase={
				uri:this.assets[0].uri, 
				dur:this.assets[0].dur, 
				delta:0
			}
		vet.push(objBase);
		for(var i = 1; i < this.assets.length; i++){
			var obj={
				uri:this.assets[i].uri, 
				dur:this.assets[i].dur, 
				delta:this.getDiff(this.assets[0],this.assets[i])
			}
			vet.push(obj);
		}
		var pst = {act:"presentation", relations:vet};
		console.log(pst);
		return pst;
	}


	this.countContributions = function countContributions(R){
		return R.relations.lenght;
	}

	this.chooseNextRelation = function chooseNextRelation(A){
		var rels = A.relations;
		var cc=null, ncc=null;//converged and non-converged candidates	

		for(var i=0; i < rels.length; i++){
			var rel = rels[i];


			if( !rel.isPossible() ) continue;

			if( rel.isConverged() ){
				if(cc == null){
					cc = rel;
				}else{
					if(cc.countContributions > rel.countCountributions){
						cc = rel;
					}
				}
			}else{
				if(ncc == null){
					ncc = rel;
				}else{
					if(ncc.countContributions > rel.countCountributions){
						ncc = rel;
					}
	
				}
			}
			
		}

		if(cc != null) return cc;
		return ncc;
	}

	this.chooseNextAsset = function chooseNextAsset(){
		var l = this.assets.length;
		var i = Math.floor(Math.random() * l);
		var A = this.assets[i];
		if(A.relations.length == 0){
			return this.chooseNextAsset();
		}
		return A;
	}

	//choose the next pair to distribute and get a contribution
	this.chooseNextPair = function chooseNextPair(){
		A = this.chooseNextAsset();
		R = this.chooseNextRelation(A);
		return R;
	}




}

/*contructor for Asset:
	uri (STRING): path to the video
	label (STRING): Asset identification
	dur (NUMBER): duration of thi Asset
*/
function Asset(uri,label,dur){
	this.uri = uri;
	this.label = label;
	this.dur = dur;
	this.relations = new Array;			//a vector to store this asset relations;

	/*Function to add a Relation to an Asset:
		r (Relation): a relation from the this asset to other;
	*/
	this.addRelation = function addRelation(r){
			this.relations.push(r);
	}
	/*Function to get a Relation to an Asset:
		r (Relation): a relation from the this asset to other;
	*/
	this.getRelation = function getRelation(b){
			for(var i = 0; i < this.relations.length; i++){
				if(this.relations[i].to.label == b.label){
					return this.relations[i];
				}
			}
	}
}


/*contructor for Relation:
	frm (Asset): the base Asset
	to (Asset): the asset to be related with the base
*/
function Relation(frm, to){
	this.frm = frm;
	this.to = to;
	this.delta = null;						//the supposed delta for this Relation
	this.confidence = null;				//the confidence that the delta is correct
	this.count = 0;								//the number of contributions for this Relation;
	this.contributions = new Array;	//vector to store contributions for this Relation
	this.infered = false;
	this.converged = false;
	this.impossible = 0;


	/*function to add Contributions to a Relation
		c(Contribution): a contribtuion from an User
	*/
	this.add = function addContribution(c){
		this.contributions.push(c);
		this.count++;
	}

	this.isInfered = function isInfered(){
		return this.infered;
	}

	this.isConverged = function isConverged(){
		return this.converged;
	}

	this.isPossible = function isPossible(){
		if(this.impossible < impossible_threshold){
			return true;
		}
		return false;
	}
}

/*constructor for Contribution
	user (User): the user that made the Contribution
	value (NUMBER): the value of the Contribution
*/
function Contribution(user,value){
	this.user = user;
	this.value = value;

	/*function to show an contribution on console*/
	this.show = function showContribution(){
		var result = this.user.id + " :(" + this.value + ")";
		console.log(result);
	}
}

/*constructor for User
	id (NUMBER): an unique id that identifies an User
	lvl (NUMBER): determines the confidence degree of that User
*/
function User(id, lvl) {
	this.id = id;
  this.lvl = lvl;

	/*function to show the user Details	on console*/
	this.show = function showUser() {
		var result = this.id + ":(" + this.lvl + ")";
		console.log(result);
	}
}


module.exports.DLA = DLA;
module.exports.Asset = Asset;
module.exports.Relation = Relation;
module.exports.Contribution = Contribution;
module.exports.User = User;



////////////////////////////////////////////////////////////////////////////////
/******************************* EXAMPLE **************************************/
////////////////////////////////////////////////////////////////////////////////

//Creating users who will generate the sugestions
var users = new Array();
users[0] = new User(0, 3);
users[1] = new User(1, 5);
users[2] = new User(2, 7);
users[3] = new User(3, 1);

var X = users[0];
var Y = users[1];
var Z = users[2];
var W = users[3];

//Creating sub-arrays for videos assuming 4 videos on this test - A, B, C and D
var dla = new DLA();
dla.addAsset(new Asset("0.webm","A",10));
dla.addAsset(new Asset("1.webm","B",15));
dla.addAsset(new Asset("2.webm","C",23));
dla.addAsset(new Asset("3.webm","D",2));
var assets = dla.assets;

var A = dla.getAsset('A');
var B = dla.getAsset('B');
var C = dla.getAsset('C');
var D = dla.getAsset('D');

dla.addContribution(A,B,3,X);

dla.addContribution(B,C,7,X);

dla.addContribution(C,D,11,X);
dla.addContribution(C,D,11,X);
dla.addContribution(C,D,13,X);
dla.addContribution(C,D,12,X);

//I means impossible to relate 
dla.addContribution(C,D,'I',X);

dla.addContribution(C,D,26,X);
dla.addContribution(C,D,26,X);
dla.addContribution(C,D,27,X);
dla.addContribution(C,D,25.1,X);
dla.addContribution(C,D,25.2,X);
dla.addContribution(C,D,25.1,X);
dla.addContribution(C,D,27,X);
dla.addContribution(C,D,28,X);


//dla.updateAll();
dla.print();

//console.log('------------------- INFERING -----------------');

//Step 1 - Inferir
dla.inferUnknown();

//Step 2 - Inferir o que falta a partir dos deltas atualizados
dla.inferUnknown();

dla.print();

var next = dla.chooseNextPair();
console.log(next);


//console.log('Next Pair: ['+dla.chooseNextPair().frm+','+dla.chooseNextPair().to+ ']');


//console.log(dla);

//dla.updateGeometricMean(A,B);
//console.log(dla.getDiff(B,A));
//console.log(dla.getDiff(A,B));

//determining the most probable delta by contributions convergence 



