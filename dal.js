/*
	In this version we are not allowing Hierarchies (Struct DAL from model),
	or removihg anything, nor any error Handling is used.
*/
////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////Constructors///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//Imports for Node
var ss = require("./simple-statistics.min.js");

//Defines
var convergence_threshold = 1;
var impossible_threshold = 1;
var no_overlap_threshhold = 1;

var z=0;
var zz=0;

/*contructor for DAL:*/
function DAL(){

	this.it = 0;

	this.assets = new Array();
	/*Function to add an Asset:
		a (Asset): an Asset to be related in this DAL;
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
		
		//console.log(rel.frm.label+' <-('+delta+')-> '+rel.to.label);
		
		rel.infered = false;
		if( delta == 'I'){
			rel.impossible++;
		}else{
			if(delta == 'N'){
				rel.noOverlap++;
			}else{
				rel.add(new Contribution(user,delta));
				if(rel.impossible > 0) rel.impossible--;
				this.updateConvergence(a,b);
				//this.clearInference();
			}	
			this.inferUnknown();		
		}
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

		var nc = 0;//next possible candidate
		var ncc = 0;//next possible candidate counter

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
				if(j == nc){
					if(ncc >= cc){ 
						c = j;
						cc = ncc;
						ncc = 0;
					}else{
						nc++;
					}
				}else{
						nc = j;
						ncc = 1;
				}
			}

			if(cc == convergence_threshold){
				ca = c;
				rel.converged = true;
			}

		}	

		rel.delta = ss.mode(groups[ca]);
	}

	/*Function to get a relation */
	this.getRelation = function getRelation(a,b){
		var pa = this.assets.indexOf(a);
		var pb = this.assets.indexOf(b);
		var rel;
		if(pa < pb){
			return a.getRelation(b);
		}
		return b.getRelation(a);
	}

	//Funcao recursiva que procura o caminho pelo principio da transitividade
	this.search = function search(a,b){
		if(this.it > 15){ 
			return null;
		}		

		//Relação direta entre A e B
		var rel = this.getRelation(a,b);
	
		//Caso exista esta relação direta
		if(rel.delta != null && rel.isConverged()){
			//Se o for beco sem saida, faz o rollback, ou nao é confiavel ainda	
			if(!rel.isPossible()){
				return null;
			}else{
				var dr = rel.delta;
				if(rel.frm == b){
					dr = -dr
				}
				z=this.it;
				//Zera a altura da arvore de recursão
				this.it=0;
				return dr;
			}
		}

		//Caso não haja relacao direta entre A e B, se verifica as
		//outras relações que partem de A para verificar transitividade até B.
		var rels = a.relations;

		//Atualiza a altura da arvore de recursão, desceu mais 1 nível
		this.it++;

		for(var i=0; i < rels.length; i++){
			var r = rels[i];

			if(r.delta == null || r.delta == 'I' || r.delta == 'N' || !r.isPossible() || !r.isConverged()){
				continue;
			}

			var d = this.search(r.to,b);
			if(d == null || d == 'I' || d == 'N') continue;
			
			
			if(this.it < this.assets.length){
				//Verifica o "sentido" do delta;
				dr = r.delta;
				if(r.frm == b){
					dr = -dr
				}
				//this.it--;
				return dr + d;
			}
		}
		
		return null;
	}

	this.clearInference = function clearInference(){
		for(var A in this.assets){
			var rels = this.assets[A].relations;
			for(var B in rels){
				var rel = rels[B];

				if(!rel)continue;
				if(rel.infered){
					//console.log('Deleting Inference: '+rel.frm.label+' <-> '+rel.to.label);
					this.assets[A].relations[B] = new Relation(rel.frm,rel.to);
				}
			}
		}
	}




	/*Function to infer the unknown Deltas between A and B using a Depth-First Search.*/
	this.inferUnknown = function inferUnknown(){
		for(var A = 0; A < this.assets.length; A++){
			
			var rels = this.assets[A].relations;
			for(var B = 0; B < rels.length; B++){
				this.it = 0;
				var rel = rels[B];
				//if( (rel.count == 0 || rel.isInfered()) && rel.isPossible()){
				//if( rel.count == 0 && !rel.isInfered() && rel.isPossible()){
				if( rel.delta == null && rel.isPossible() ){
					
					var delta = this.search(rel.frm, rel.to);

					if(delta == null){
						delta = this.searchBackPath(rel.frm, rel.to);
					}
					
					
					if(delta != null){
						
						if(z > zz) zz = z;
						
						//console.log('I ('+z+')- '+rel.frm.label+' <-('+delta+')-> '+rel.to.label);
						
						rel.delta = delta;
						rel.infered = true;
						rel.impossible = 0;

					}
				}
			}		
		}
		return false;
	}

	this.searchBackPath = function searchBackPath(a,b){
				for(var A = 0; A < this.assets.indexOf(a); A++){
					
					var d1 = this.search(this.assets[A],a);
					if(d1 == null) continue;

					
					var d2 = this.search(this.assets[A],b);
					if(d2 == null) continue;
					
					return d2 - d1;
					
				}
				return null;
	}


	/*Function to show on console all relations.*/
	this.print = function print(){
		for(var A in this.assets){
			
			for(var B in this.assets[A].relations){
				var rel = this.assets[A].relations[B];
				console.log('Converged: '+rel.isConverged());
				console.log('Infered: '+rel.isInfered());
				console.log('Possible: '+rel.isPossible());
				console.log('Can Have Overlap: '+rel.hasOverlap());
				console.log(rel.frm.label+'<->'+rel.to.label+'='+rel.delta+'\n');
			}
		}
	}
	

	var converger_true=0;
	var converger_false=0
	var infered_true=0;
	var infered_false=0;
	var impossible_true=0;
	var impossible_false=0;
	var total=0;

	this.compareDals = function compareDals(gold){


		//for(var A in gold.assets){
		for(var A = 0; A < gold.assets.length-1; A++){
			for(var R in gold.assets[A].relations){
				var rg = gold.assets[A].relations[R];
				var rd = this.assets[A].relations[R];
				
				total++;
				
				
				if(rd.isConverged()){
					if(rd.delta == rg.delta){
						converger_true++;
					}else{
						converger_false++;
				//console.log('C: '+rg.frm.label + ' <- ('+rg.delta+','+rd.delta+') -> '+rg.to.label+' , Converged: '+rd.isConverged()+' , Possible: '+rd.isPossible()+' , Infered: '+rd.isInfered()+ ' Has Overlap: '+rd.hasOverlap());
					}
				}else{
					if(rd.isInfered()){
						if(rd.delta == rg.delta){
							infered_true++;	
						}else{
							infered_false++;
				//console.log('I: '+rg.frm.label + ' <- ('+rg.delta+','+rd.delta+') -> '+rg.to.label+' , Converged: '+rd.isConverged()+' , Possible: '+rd.isPossible()+' , Infered: '+rd.isInfered()+ ' Has Overlap: '+rd.hasOverlap());
						}
					}else{
						if(!rd.isPossible() || !rd.hasOverlap()){
							if(rg.delta == null){
								impossible_true++;
							}else{
								impossible_false++;
							}
						}
					}
				}
				
			}
			
		}
		
	/*	console.log('Total DAL Relations: '+total);
		console.log('Converged True: '+converger_true);
		console.log('Converged False: '+converger_false);
		console.log('Infered True: '+infered_true);
		console.log('Infered False: '+infered_false);
		console.log('Impossible True: '+impossible_true);
		console.log('Impossible False: '+impossible_false);
		console.log('Longest Inference: '+zz);	*/
		console.log(total+','+converger_true+','+converger_false+','+infered_true+','+infered_false+','+impossible_true+','+impossible_false+','+zz);
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
		//console.log(pst);
		return pst;
	}


	this.countContributions = function countContributions(R){
		return R.relations.length;
	}


	//Prioridade: 1. Quase convergindo, 2. Não convergido, 3. Convergido.
	this.chooseNextRelation = function chooseNextRelation(A){

		var rels = A.relations;
		var cc=null, ncc=null;//converged and non-converged candidates	

		for(var i=0; i < rels.length; i++){
			var rel = rels[i];


		////console.log('Candidate ('+rel.count+':'+rel.converged+')');// : '+rel.frm.label+' <-> '+rel.to.label);
		
			//Se a relação é marcada como impossivel, passa para a proxima
			if( !rel.isPossible() || !rel.hasOverlap() || rel.isInfered()) continue;

			if(rel.isConverged()){
				if(cc == null){
					cc = rel;
				}else{
					//Menor convergenvia tem prioridade
					if(cc.countContributions > rel.countCountributions){
						cc = rel;
					}
				}	
			}else{

				if(ncc == null){
					ncc = rel;
				}else{
					//Prioridade para quem já está quase convergindo
					if(ncc.countContributions > rel.countCountributions){
						ncc = rel;
					}
				}
			}
		}

		//Somente retorna um par que ja convergiu caso
		//não houverem mais pares que ainda não convergiram
		if(ncc == null) return cc;
		
		return ncc;
	}
	
	
	

	this.chooseNextAsset = function chooseNextAsset(){
		var l = this.assets.length; 
		
		//a ponta inferior da Matriz Triangular Superior, por isso ' < l' .
		//Seleciona apenas os Assets que ainda não convergiram
		var candidates = new Array();
		for(var a=0; a<l; a++){
			var v = this.assets[a];
			var nc = !v.isConverged();
			var p = v.isPossible();
			var o = v.hasOverlap();
			if(nc && p && o){
				candidates.push(a);
			}
		}
	
		//console.log(candidates);
		
		l = candidates.length;
		if(l >= 0){
			//Retorna um Asset aleatório entre os que ainda não convergiram
			a = Math.floor(Math.random() * l);
			//console.log('Choosen: '+candidates[a]);

			//a=0;//Comentar esta linha para habilitar a escolha aleatoria do Asset

			return this.assets[candidates[a]];
		}

		//Se não houverem mais pares não-convergidos, retorna null
		return null;
	
	}

	//choose the next pair to distribute and get a contribution
	this.chooseNextPair = function chooseNextPair(user_id){

		//console.log('USER ID: '+user_id);
		var A = this.chooseNextAsset();

		//Se a DAL já convergiu, retorna null
		if(A == null) return null;
		
		var R = this.chooseNextRelation(A);
		//console.log('Asset: '+A.label);
		//console.log('Relation: '+R.frm.label+' <-> '+R.to.label);
		return R;
	}


	//Se todos os Assets já convergiram, a DAL tb convergiu
	//obs:	outra forma de saber se a DAL convergiu é usar a chooseNextPair
	//		pois ela retorna NULL se a DAL já convergiu.
	this.isConverged = function isConverged(){
		for(var i=0; i<this.assets.length-1; i++){
			if(!this.assets[i].isConverged()){
				return false;
			}
		}
		return true;
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
	
	//Se todas as Relations já convergiram, o Asset tb convergiu
	this.isConverged = function isConverged(){
		for(var i=0; i<this.relations.length; i++){
			if(!this.relations[i].isConverged() && !this.relations[i].isInfered() && this.relations[i].isPossible() && this.relations[i].hasOverlap()){
				return false;
			}
		}
		return true;
	}

	this.isPossible = function isPossible(){
		for(var i=0; i<this.relations.length; i++){
			if(this.relations[i].isPossible()){	
				return true;
			}
		}
		return false;
	}

	this.hasOverlap = function hasOverlap(){
		for(var i=0; i<this.relations.length; i++){
			if(this.relations[i].hasOverlap()){	
				return true;
			}
		}
		return false;
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
	this.noOverlap = 0;


	/*function to add Contributions to a Relation
		c(Contribution): a contribtuion from an User
	*/
	this.add = function addContribution(c){
		//console.log('Contribution ('+this.frm.label+' <- ('+c.value+') -> '+this.to.label+')');
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
		if(this.impossible < impossible_threshold ){
			return true;
		}
		return false;
	}

	this.hasOverlap = function hasOverlap(){
		if(this.noOverlap < no_overlap_threshhold){
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


function testDal(){

	//Creating users who will generate the sugestions
	var users = new Array();
	users[0] = new User('Confiavel', 90);
	users[1] = new User('Meio Confiavel', 70);
	users[2] = new User('Pouco Confiavel', 30);
	users[3] = new User('Nao Confiavel', 10);

	var X = users[0];
	var Y = users[1];
	var Z = users[2];
	var W = users[3];

	//Creating sub-arrays for videos assuming 4 videos on this test - A, B, C and D
	var dal = new DAL();
	dal.addAsset(new Asset("0.webm","A",10));
	dal.addAsset(new Asset("1.webm","B",15));
	dal.addAsset(new Asset("2.webm","C",23));
	dal.addAsset(new Asset("3.webm","D",2));
	var assets = dal.assets;

	var A = dal.getAsset('A');
	var B = dal.getAsset('B');
	var C = dal.getAsset('C');
	var D = dal.getAsset('D');

	dal.addContribution(A,B,3,X);

	dal.addContribution(B,C,7,X);

	dal.addContribution(C,D,11,X);
	dal.addContribution(C,D,11,X);
	dal.addContribution(C,D,13,X);
	dal.addContribution(C,D,12,X);

	//I means impossible to relate 
	dal.addContribution(C,D,'I',X);


	dal.addContribution(C,D,26,X);
	dal.addContribution(C,D,26,X);
	dal.addContribution(C,D,27,X);
	dal.addContribution(C,D,25.1,X);
	dal.addContribution(C,D,25.2,X);
	dal.addContribution(C,D,25.1,X);
	dal.addContribution(C,D,27,X);
	dal.addContribution(C,D,28,X);



	dal.addContribution(C,D,'I',X);


	dal.print();
}



module.exports.DAL = DAL;
module.exports.Asset = Asset;
module.exports.Relation = Relation;
module.exports.Contribution = Contribution;
module.exports.User = User;

//testDal();


