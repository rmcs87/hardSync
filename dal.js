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
var convergence_threshold = 2;
var impossible_threshold = 2;

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
		//console.log(a);
		//console.log(b);
		var rel = this.getRelation(a,b);
		
		rel.infered = false;
		
		if( delta == 'I'){
			rel.impossible++;
		}else{
			rel.add(new Contribution(user,delta));
		}
		this.updateConvergence(a,b);
		this.clearInference();
		this.inferUnknown();			
		this.inferUnknown();	
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
					if(ncc >= cc){ //new
						c = j;
						//cc = 1;
						cc = ncc;//new
						ncc = 0;//new
					}else{//new - all
						nc++;
					}
				}else{//new - all
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

		//Existe relação direta entre A e B
		var rel = this.getRelation(a,b);
		if(rel.delta != null){
			var dr = rel.delta;
			if(rel.frm == b){
				dr = -dr
			}
			//Zera a altura da arvore de recursão
			this.it=0;
			return dr;
		}

		var rels = a.relations;

		//Atualiza a altura da arvore de recursão
		this.it++;

		for(var i=0; i < rels.length; i++){
			var r = rels[i];

			if(r.delta == null){
				continue;
			}

			var d = this.search(r.to,b);
			if(this.it > this.assets.length || d){
				//Verifica o "sentido" do delta;
				dr = r.delta;
				if(r.frm == b){
					dr = -dr
				}
				this.it--;
				return dr + d;
			}
		}
		return null;
	}

	this.clearInference = function clearInference(){
		for(var i = 0; i < this.assets.length; i++){
			for(var j = i; j < this.assets.length; j++){
				var rel = this.assets[i].relations[j];
				if(!rel)continue;
				if(rel.infered){
					//console.log('Deleting Inference: '+rel.frm.label+' <-> '+rel.to.label);
					this.assets[i].relations[j] = new Relation(rel.frm,rel.to);
				}
			}
		}
	}



	/*Function to infer the unknown Deltas.*/
	//Procura transitividade entre A e B recursivamente
	this.inferUnknown = function inferUnknown(){
	
		//Passo 1 - Percorre as contribuições e infere por transitividade tudo que for possivél;

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


		//Passo 2 - Percorre os Assets, e quando acha uma lacuna, tenta encontrar um caminha até ela.

		//Percorre os Assets e tenta inferir as lacunas
		for(var i = 0; i < this.assets.length; i++){
		
			var rels = this.assets[i].relations;
			
			for(j=0; j < rels.length; j++){
				var rel = rels[j];
				
				if(rel.count == 0){
					rel.delta = this.search(rel.frm, rel.to);
					if(rel.delta != null){
						rel.infered = true;
					}
				}
			}		
		}
		
	}

	/*Function to show on console all relations.*/
	this.print = function print(){
		for(var i = 0; i < this.assets.length; i++){
			for(var j = 0; j < this.assets.length; j++){
				if(this.assets[i].label != this.assets[j].label){
					var rel = this.getRelation(this.getAsset(this.assets[i].label),this.getAsset(this.assets[j].label));
					//console.log('Converged: '+rel.converged);
					//console.log('Infered: '+rel.infered);
					//console.log(this.assets[i].label+'<->'+this.assets[j].label+'='+this.getDiff(this.assets[i],this.assets[j])+'\n');
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
			if( !rel.isPossible() ) continue;

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
			if(!this.assets[a].isConverged()){
				candidates.push(a);
			}
		}
	
		//console.log(candidates);
		
		l = candidates.length;
		if(l >= 0){
			//Retorna um Asset aleatório entre os que ainda não convergiram
			a = Math.floor(Math.random() * l);
			//console.log('Choosen: '+candidates[a]);
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
			if(!this.relations[i].isConverged() && !this.relations[i].isInfered() && this.relations[i].isPossible()){
				return false;
			}
		}
		return true;
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


module.exports.DAL = DAL;
module.exports.Asset = Asset;
module.exports.Relation = Relation;
module.exports.Contribution = Contribution;
module.exports.User = User;



