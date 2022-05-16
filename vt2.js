"use strict";
//@ts-check
// voit tutkia käsiteltävää dataa suoraan osoitteesta
// https://appro.mit.jyu.fi/cgi-bin/tiea2120/randomize.cgi
// data muuttuu hieman jokaisella latauskerralla

// seuraava lataa datan ja luo sen käsittelyyn tarvittavan parserin
// xmldata-muuttuja sisältää kaiken tarvittavan datan
// vinkki: muunna xmldata ensimmäisen viikkotehtävän tyyppiseksi rakenteeksi

let xmldata; // globaalimuuttuja, jotta lisäykset voidaan tehdä tähän rakenteeseen

window.addEventListener("load", function() {
	fetch('https://appro.mit.jyu.fi/cgi-bin/tiea2120/randomize.cgi')
	  .then(response => response.text())
	  .then(function(data) {
		let parser = new window.DOMParser();
	    xmldata = parser.parseFromString( data, "text/xml" );
		// tästä eteenpäin omaa koodia
		console.log(xmldata);	
		let leimaustavat = kopioiLeimaustavat(xmldata.children[0].children[2].children);
		let rastit = kopioiRastit(xmldata.documentElement.getElementsByTagName("rasti"));
		let sarjat = kopioSarjat(xmldata.documentElement.getElementsByTagName("sarja"));
		let joukkueet = kopioiJoukkueet(xmldata.documentElement.getElementsByTagName("joukkue"), rastit);

		let ob = new objekti(joukkueet, rastit, leimaustavat, sarjat);

		console.log(ob.joukkueet);
		console.log(ob.leimaustavat);
		console.log(ob.rastit);
		console.log(ob.sarjat);

		teeTuloksetTaulukko(ob.joukkueet, ob.sarjat);
		luoRastiLista(ob.rastit);
		
		luoLisaaRastiForm();
		luoLisaaJasenForm(leimaustavat);

		document.getElementById("rastiForm").addEventListener("submit", tarkistaValidius);
		//document.getElementById("NappiLisaaRasti").addEventListener("submit", lisaaRasti(ob.rastit));

		let inputit = document.getElementsByClassName("uusiJasenInput");
		let formJasen = document.getElementById("fielsetJasenet");
    	inputit[0].addEventListener("input", addNew);
		inputit[1].addEventListener("input", addNew);
		
		console.log("Toimii tähän asti");
	  }	
	);
});

function luoLisaaRastiForm(){

	let rastiform = document.getElementById("rastiForm");
	
	let rastifieldset = document.createElement("fieldset");
	rastiform.appendChild(rastifieldset);

	let legend = document.createElement("legend");
	legend.textContent = "Rastin tiedot";
	rastifieldset.appendChild(legend);

	luoPElementti(rastifieldset, "latitude", "Lat", "9", "lat", "Anna tähän latitude");
	luoPElementti(rastifieldset, "longitude", "Lon", "9", "lon", "Anna tähän longitude");
	luoPElementti(rastifieldset, "koodi", "Koodi", "1", "koodi", "Anna tähän rastin koodi");
	
	let pNappi = document.createElement("p");
	let inputNappi = document.createElement("input");
	inputNappi.setAttribute("id", "NappiLisaaRasti");
	inputNappi.setAttribute("type", "submit");
	inputNappi.setAttribute("value", "Lisaa Rasti");
	inputNappi.addEventListener("click", lisaaRasti);

	rastifieldset.appendChild(pNappi);
	pNappi.appendChild(inputNappi);
}

function luoPElementti(fieldset, labelFor, textCon, minLen, nimi, titleText){
	let p = document.createElement("p");
	p.setAttribute("class", "bl");
	let label = document.createElement("label");
	label.setAttribute("class", "vasen");
	label.setAttribute("for", labelFor);
	label.textContent = textCon;
	let input = document.createElement("input");
	input.setAttribute("minlength", minLen);
	input.setAttribute("required", "true");
	input.setAttribute("class", "oikea");
	input.setAttribute("id", labelFor);
	input.setAttribute("type", "text");
	input.setAttribute("name", nimi);
	input.setAttribute("value", "");
	input.setAttribute("title", titleText);

	fieldset.appendChild(p);
	p.appendChild(label);
	p.appendChild(input);

}

function addNew(e){
	let jasenForm = document.forms.joukkueForm;
	let inputit = jasenForm.getElementsByClassName("uusiJasenInput");

	let tyhja = false;

	for(let i=inputit.length-1 ; i>-1; i--) {
		let input = inputit[i];

		 if ( input.value.trim() == "" && tyhja) { 
			inputit[i].parentNode.remove(); 
		}

		if ( input.value.trim() == "") {
			tyhja = true;
	}
}

if ( !tyhja) {
	let p = document.createElement("p");
	let label = document.createElement("label");
	label.textContent = "Jäsen";
	let input = document.createElement("input");
	input.setAttribute("type", "text");
	input.setAttribute("class", "uusiJasenInput");
	input.addEventListener("input", addNew);
	document.forms[1].fieldsetJasenet.appendChild(p);
	p.appendChild(label);
	p.appendChild(input);
}

	for(let i=0; i<inputit.length; i++) { 
		let label = inputit[i].parentNode.children[0];
		label.firstChild.nodeValue = "Jäsen " + (i+1); 
	}

	

	
	console.log("PÖÖ");
}


function luoLisaaJasenForm(leimaustavat){
	let form = document.getElementById("lisaaJoukkueForm");
	let fieldset = document.createElement("fieldset");
	let legend = document.createElement("legend");
	legend.textContent = "Uusi joukkue";

	let pNimi = document.createElement("p");
	pNimi.setAttribute("id", "pNimi");
	let labelNimi = document.createElement("label");
	labelNimi.textContent = "Anna joukkueen nimi";
	let inputNimi = document.createElement("input");

	let fieldetJasenet = document.createElement("fieldset");
	fieldetJasenet.setAttribute("id", "fieldsetJasenet");
	let legendJasenet = document.createElement("legend");
	legendJasenet.textContent = "Anna jäsenien nimet";

	let labelJasen1Nimi = document.createElement("label");
	labelJasen1Nimi.textContent = "Jäsen 1";
	let inputJasen1Nimi = document.createElement("input");

	let labelJasen2Nimi = document.createElement("label");
	labelJasen2Nimi.textContent = "Jäsen 2";
	let inputJasen2Nimi = document.createElement("input");

	let pNappi = document.createElement("p");
	let inputNappi = document.createElement("input");
	inputNappi.setAttribute("id", "tallennaMuutoksetNappi");
	inputNappi.setAttribute("type", "submit");
	inputNappi.setAttribute("value", "Tallenna muutokset");

	let pLabelJasen1 = document.createElement("p");
	let pLabelJasen2 = document.createElement("p");

	form.appendChild(fieldset);
	fieldset.appendChild(legend);
	fieldset.appendChild(pNimi);
	
	fieldset.appendChild(fieldetJasenet);

	fieldetJasenet.appendChild(pLabelJasen1);
	fieldetJasenet.appendChild(pLabelJasen2);
	fieldetJasenet.appendChild(legendJasenet);

	pLabelJasen1.appendChild(labelJasen1Nimi);
	pLabelJasen1.appendChild(inputJasen1Nimi);
	inputJasen1Nimi.setAttribute("class", "uusiJasenInput");

	pLabelJasen2.appendChild(labelJasen2Nimi);
	pLabelJasen2.appendChild(inputJasen2Nimi);
	inputJasen2Nimi.setAttribute("class", "uusiJasenInput");

	let fieldsetLeimaustavat = document.createElement("fieldset");
	fieldset.appendChild(fieldsetLeimaustavat);
	let legendLeimaustavat = document.createElement("legend");
	legendLeimaustavat.textContent = "Valitse leimaustavat";
	

	for(let i = 0; i<leimaustavat.length; i++){

		let pLeimaustavat = document.createElement("p");
		fieldsetLeimaustavat.appendChild(pLeimaustavat);
		let leimaustapa = leimaustavat[i];
		let labelLeimaustavat = document.createElement("label");
		labelLeimaustavat.setAttribute("for", leimaustapa);
		labelLeimaustavat.textContent = leimaustapa;
		let inputLeimaustavat = document.createElement("input");
		inputLeimaustavat.setAttribute("type", "checkbox");
		inputLeimaustavat.setAttribute("name", "leimaustapa");
		inputLeimaustavat.setAttribute("id", leimaustapa);
		inputLeimaustavat.setAttribute("value", leimaustapa);
		pLeimaustavat.appendChild(labelLeimaustavat);
		pLeimaustavat.appendChild(inputLeimaustavat);
	}

	fieldset.appendChild(pNappi);
	pNappi.appendChild(inputNappi);
	pNimi.appendChild(labelNimi);
	pNimi.appendChild(inputNimi);

}

function kopioSarjat(sarjatHTML){
	let sarjat = [];

	for(let i = 0; i<sarjatHTML.length; i++){
		let sarja = kopioSarja(sarjatHTML[i]);
		sarjat.push(sarja);
	}

	return sarjat;
}

function kopioSarja(sarjaHTML){
	let id = sarjaHTML.attributes.id.textContent;
	let alkuaika = sarjaHTML.attributes.alkuaika.textContent;
	let kesto = sarjaHTML.attributes.kesto.textContent;
	let loppuaika = sarjaHTML.attributes.loppuaika.textContent;
	let nimi = sarjaHTML.attributes.nimi.textContent;

	let sarjaObjekti = new SarjaObjekti(id, alkuaika, kesto, loppuaika, nimi);

	return sarjaObjekti;
}

class SarjaObjekti{
	constructor(id, alkuaika, kesto, loppuaika, nimi){
		this.id = id;
		this.alkuaika = alkuaika;
		this.kesto = kesto;
		this.loppuaika = loppuaika;
		this.nimi = nimi;
	}
}

function kopioiRastit(rastitHTML){
	let rastit = [];

	for(let i = 0; i<rastitHTML.length; i++){
		let objekti = kopioiRasti(rastitHTML[i]);
		rastit.push(objekti);
	}
	return rastit;
}

function kopioiRasti(rastiHTML){
	let id = rastiHTML.attributes[0].textContent;
	let lat = rastiHTML.attributes[2].textContent;
	let lon = rastiHTML.attributes[3].textContent;
	let koodi = rastiHTML.attributes[1].textContent;

	let rastiObjekti = new RastiObjeti(id, koodi, lat, lon);

	return rastiObjekti;
}

class RastiObjeti{
	constructor(id, koodi, lat, lon){
		this.id = id;
		this.koodi = koodi;
		this.lat = lat;
		this.lon = lon;
	}
}

function kopioiLeimaustavat(leimaustavatHTML){
	let leimaustavat = [];
	
	for(let i = 0 ; i<leimaustavatHTML.length; i++){
		let leimaustapa = leimaustavatHTML[i];
		leimaustavat.push(leimaustapa.textContent);
	}

	return leimaustavat;
}


function kopioiJoukkueet(joukkueetHTML, rastit){
	let joukkueet = [];
	for(let joukkue of joukkueetHTML){
		let kopioJoukkueesta = kopioiJoukkue(joukkue, rastit);
		joukkueet.push(kopioJoukkueesta);
	}
	return joukkueet;
}

function kopioiJoukkue(joukkueHTML, rastit){
	let nimi = joukkueHTML.attributes.nimi.textContent;
	let aika = joukkueHTML.attributes.aika.textContent;
	let matka = joukkueHTML.attributes.matka.textContent;
	let pisteet = joukkueHTML.attributes.pisteet.textContent;
	let sarja = joukkueHTML.attributes.sarja.textContent;

	let jasenet = kopioJasenet(joukkueHTML.children[0]);
	
	let rastileimaukset =  kopioiRastileimaukset(joukkueHTML.children[1], rastit);
	
	let leimaustapa = kopioLeimaustapa(joukkueHTML.children[2]);

	let joukkue = new Joukkue(nimi, aika, matka, pisteet, sarja, jasenet, rastileimaukset, leimaustapa);
	return joukkue;
}

function kopioLeimaustapa(leimaustapaHTML){
	let leimaustavat = [];

	for(let leimaustapa of leimaustapaHTML.children){
		leimaustavat.push(leimaustapa.textContent);
	}
	return leimaustavat;
}

function kopioiRastileimaukset(rastileimauksetHTML, rastit){
	let rastileimaukset = [];

	for(let i= 0; i<rastileimauksetHTML.children.length; i++){
		let rastiLeimausObjekti = kopioiLeimaus(rastileimauksetHTML.children[i], rastit);
		rastileimaukset.push(rastiLeimausObjekti);
	}
	return rastileimaukset;
}

function kopioiLeimaus(leimausHTML, rastit){

	let aika = "";
	let id = "";

	if(typeof leimausHTML.attributes.rasti != "undefined"){
		aika = leimausHTML.attributes.aika.textContent;
		id = leimausHTML.attributes.rasti.textContent;
	}

	let rasti = etsiKoodi(rastit, id);
	let leimausObjekti = new Leimaus(aika, rasti, id);

	return leimausObjekti;
}

function etsiKoodi(rastit, id){

	for(let i = 0; i<rastit.length; i++){
		if(rastit[i].id === id ){return rastit[i].koodi;}
	}
}

class Leimaus{
	constructor(aika, rasti, id){
		this.aika = aika;
		this.rasti = rasti;
		this.id = id;
	}
}

function kopioJasenet(jasenetHTML){
	let jasenet = [];
	for(let jasen of jasenetHTML.children){
	jasenet.push(jasen.textContent);
	}
	return jasenet;
}

class Joukkue{
	constructor(nimi, aika, matka, pisteet, sarja, jasenet, rastileimaukset, leimaustapa){
		this.nimi = nimi;
		this.aika = aika;
		this.matka = matka;
		this.pisteet = pisteet;
		this.sarja = sarja;
		this.jasenet = jasenet;
		this.rastileimaukset = rastileimaukset;
		this.leimaustapa = leimaustapa;
	}
}

function lisaaRasti(e){

	e.preventDefault();

	let lomake = document.forms["rastiForm"];
	let inputit = lomake.getElementsByTagName("input");
	let boo = true;

	for(let f of inputit){
		if(f.type == "text" && f.id != "koodi"){boo = testaaValidius(f.value);}
	}

	let lati = parseFloat(inputit[0].value);
	let long = parseFloat(inputit[1].value);
	let koodi = inputit[2].value;

	if(isNaN(lati)){boo = false;}
	if(isNaN(long)){boo = false;}

	let data = xmldata.children;
	let datanLapset = data[0].children;
	let r = datanLapset[0];
	let rastit = r.children;

	if(boo === true){
		let id = luoUusiId(rastit);

		let uusiRASTI = document.createElement("rasti");
		uusiRASTI.setAttribute("id", id);
		uusiRASTI.setAttribute("koodi", koodi);
		uusiRASTI.setAttribute("lat", lati);
		uusiRASTI.setAttribute("lon", long);
		
		rastit.appendChild(uusiRASTI);
		//rastit.push(uusiRasti);
		rastit.sort(jarjestaRastit);
		luoRastiLista(rastit);
	}

	tyhjennaInputKentat();
}

function tyhjennaInputKentat(){
	let inputit = document.getElementsByClassName("oikea");
	for(let i = 0; i<inputit.length; i++){
		inputit[i].value = "";
	}
}
/**
 * Tulipa tätäkin treenattua vaikka ei olisi tarvinnut.
 * Huomasin, että en tällä varsinaisesti helposti olisi saanut rastia lisättyä dataan,
 * jos tarkoituksena on vältellä globaaleja muuttujia.
 * @param {*} e 
 */
function tarkistaValidius(e){
	e.preventDefault();
	let lomake = document.forms["rastiForm"];

	let inputit = lomake.getElementsByTagName("input");
	let validius = false;
	for(let f of inputit){
		
		console.log(f.value);
		if(f.type == "text" && f.id != "koodi"){validius = testaaValidius(f.value);

		if(validius == false){
			f.setCustomValidity("Tämä kenttä on pakollinen. Syötä koordinaatit muodossa 'xx.xxxxxx'");
		
		}}
	}

	lomake.reportValidity();
}

function luoUusiId(rastit){
	let id = 0;

	for(let i of rastit){
		let iidee = parseInt(i.id);
		if(iidee > id){
			id = iidee;
		}
	}

	id = id +1;
	id = "" + id;
	return id;
}


function testaaValidius(value){

	let totuus = true;

	for(let i = 0; i<2; i++){
		let v = parseInt(value[i]);
		if(isNaN(v)){totuus = false;}
	}
	for(let i=3; i<9; i++){
		let v = parseInt(value[i]);
		if(isNaN(v)){totuus = false;}
	}

	if(value[2] != "."){totuus = false;}

	return totuus;
}

/**
 * Järjestellään rastit ja asetetaan ne näkyville
 * @param {*} rastit 
 */
function luoRastiLista(rastit){

	let t = [];
	for(let r of rastit){
		let koodi = r.koodi;
		t.push(koodi);
	}
	t.sort(jarjestaRastit);
	laitaRastitNakyviin(t);
} 

function laitaRastitNakyviin(taulukko){
	let ul = document.getElementById("rastilista");

	while(ul.lastChild){
		ul.removeChild(ul.lastChild);
	}
	
	for(let alkio of taulukko){
		let li = document.createElement("li");
		li.textContent = alkio;
		ul.appendChild(li);
	}
}

function jarjestaRastit(a,b){
	let koodi1 = a;
	let koodi2 = b;

	if(koodi1 > koodi2){return 1;}
	if(koodi1 < koodi2){return -1;}
	if(koodi1 == koodi2){return 0;}
}

class Rasti{
	constructor(id, koodi, lat, lon){
		this.id = id;
		this.koodi = koodi;
		this.lat = lat;
		this.lon = lon;
	}
}

class objekti {
	constructor(joukkueet, rastit, leimaustavat, sarjat) {
		this.joukkueet = joukkueet;
		this.rastit = rastit;
		this.leimaustavat = leimaustavat;
		this.sarjat = sarjat;
	}
}

class obj {
	constructor(sarja, nimi, jasenet, pisteet){
		this.sarja = sarja;
		this.nimi = nimi;
		this.jasenet = jasenet;
		this.pisteet = pisteet;
	}
}

/**
 * Taso 1
 * Muodostetaan tulokset-taulukko.
 * Haetaan silmukassa yksi joukkue ja joukkueen sarja ja nimi
 * Tehdään uusi rivi taulukkoon haettujen tietojen kanssa.
 * @param {Object} joukkueet 
 */
function teeTuloksetTaulukko(joukkueet, sarjat){

	let valiaikainenTaulukko = [];

	for(let joukkue of joukkueet){

		let joukkueenSarja = joukkue.sarja; // numerosarja
		let joukkueenSarjanNimi = etsiSarjanNimi(joukkueenSarja, sarjat);

		let sarja = joukkueenSarjanNimi;
		let nimi = joukkue.nimi;
		let jasenet = tahanJasenet(joukkue);
		let pisteet = laskePisteet(joukkue);

		let ob = new obj(sarja, nimi, jasenet, pisteet);

		valiaikainenTaulukko.push(ob);
	}

	valiaikainenTaulukko.sort(jarjestaJoukkueet);
	valiaikainenTaulukko.sort(jarjestaJoukkueetPisteidenMukaan);
	laitaTaulukkoEsille(valiaikainenTaulukko);
}

function jarjestaJoukkueetPisteidenMukaan(a,b){
	let sarjanNimiA = parseInt(a.sarja);
	let sarjanNimiB = parseInt(b.sarja);
	let pisteetA = parseInt(a.pisteet);
	let pisteetB = parseInt(b.pisteet);

	if(sarjanNimiA === sarjanNimiB && pisteetA > pisteetB){return -1;}
	if(sarjanNimiA === sarjanNimiB && pisteetA < pisteetB){return 1;}
	return 0;
}

function laskePisteet(joukkue){
	let leimaukset = joukkue.rastileimaukset;
	leimaukset.sort(jarjestaLeimauksetAikajarjestykseen);

	let lahtoLeimaus = etsiLahtoleimaus(leimaukset); // Tähän palautuu lahtoleimauksen indeksi
	let maaliLeimaus = etsiMaalileimaus(leimaukset); // Tähän palautuu maalileimauksen indeksi
	//
	let karsittuLeimausTaulukko = etsiHalututLeimaukset(lahtoLeimaus, maaliLeimaus, leimaukset);
	let pisteet = laskePisteetTaulukosta(karsittuLeimausTaulukko);
	return pisteet;
}

/**
 * Lasketaan muokatusta rastileimaukset taulukosta pisteet
 * @param {Array} taulukko 
 */
 function laskePisteetTaulukosta(taulukko){

	let pisteet = 0;
  
	for(let i=0; i<taulukko.length; i++){
	  if(typeof taulukko[i] != 'undefined'){
		let leimaus = taulukko[i];
		if(typeof leimaus.rasti != 'undefined'){
		    let rasti = leimaus.rasti;
			let eka = parseInt(rasti.charAt(0));
			if(!(isNaN(eka))){
			  pisteet += eka;			
		  }
		}
	  }
	}
  
	return pisteet;
  }

function etsiHalututLeimaukset(lahto, maali, leimaukset){
	let palautusTaulukko = [];

	for(let i = lahto; i<maali+1; i++){
		palautusTaulukko[i] = leimaukset[i];
	}

	poistaTuplat(palautusTaulukko);
	return palautusTaulukko;
}

function poistaTuplat(leimausTaulukko){

	for(let i= 1; i<leimausTaulukko.length-2; i++){
		if(typeof leimausTaulukko[i].rasti != 'undefined'){
			let idI = leimausTaulukko[i].id;
			for(let j = i+1; j<leimausTaulukko.length-1; j++){
			
				let leimaus2 = leimausTaulukko[j];
      			if(typeof leimaus2 != 'undefined'){
					let idJ = leimausTaulukko[j].id;
					if(idI === idJ){
						leimausTaulukko.splice(j,1);j--;
					}
				}
			}
		}
	}
}
function etsiMaalileimaus(leimaukset){

	for(let i=0; i<leimaukset.length; i++){
		if(leimaukset[i].rasti === "MAALI"){return i;}
	}
}

function etsiLahtoleimaus(leimaukset){
	for(let i=0; i<leimaukset.length; i++){
		if(leimaukset[i].rasti === "LAHTO"){return i;}
	}
}

function jarjestaLeimauksetAikajarjestykseen(a,b){
	let aikaA = parsiSekunneiksi(a.aika);
	let aikaB = parsiSekunneiksi(b.aika);
  
	return aikaA-aikaB;
  }
  
  function parsiSekunneiksi(aika){
	let aikaTunnit = parseInt(aika.substring(11,13)); 
	let aikaMinuutit = parseInt(aika.substring(14,16));
	let aikaSekunnit = parseInt(aika.substring(17,19));
	let aikaSekunneissa = (aikaTunnit*60*60) + (aikaMinuutit * 60)+ aikaSekunnit;
  
	return aikaSekunneissa;
  }

function tahanJasenet(joukkue){
	let palautus = "";

	for(let jasen of joukkue.jasenet){
		palautus = palautus + jasen + ", ";
	}
	let pituus = palautus.length - 2;
	palautus = palautus.substring(0,pituus);
	return palautus;
}


function laitaTaulukkoEsille(valiaikainenTaulukko){

	let taulukko = document.getElementById("tulokset");

	for(let alkio of valiaikainenTaulukko){
	
	let tr = document.createElement("tr");
	let td1 = document.createElement("td");
	let td2 = document.createElement("td");
	//let td3 = document.createElement("td");
	let td4 = document.createElement("td");
	let ul = document.createElement("ul");
	let li1 = document.createElement("li");
	let li2 = document.createElement("li");

	td1.textContent = alkio.sarja;
	//td2.textContent = alkio.nimi;
	
	td4.textContent = alkio.pisteet + "p";
	li1.textContent = alkio.nimi;
	li2.textContent = alkio.jasenet;

	taulukko.appendChild(tr);
	tr.appendChild(td1); // Joukkueen sarja
	tr.appendChild(td2); // Tyhjä td johon tulee lista joukkueen nimestä ja jäsenistä
	td2.appendChild(ul); 
	ul.appendChild(li1); // Joukkueen nimi
	ul.appendChild(li2); // Joukkueen jasenet
	tr.appendChild(td4); // Joukkueen pisteet
	}
}

function jarjestaJoukkueet(a,b){
	let sarjanNimiA = parseInt(a.sarja);
	let sarjanNimiB = parseInt(b.sarja);
	let joukkueenNimiA = a.nimi;
	let joukkueenNimiB = b.nimi;

	if(sarjanNimiA == sarjanNimiB && joukkueenNimiA > joukkueenNimiB){
		return 1;
	}
	
	if(sarjanNimiA == sarjanNimiB && joukkueenNimiA < joukkueenNimiB){
		return -1;
	}

	if(sarjanNimiA == sarjanNimiB){
		return 0;
	}

	if(sarjanNimiA < sarjanNimiB){
		return -1;
	}

	if(sarjanNimiA > sarjanNimiB){
		return 1;
	}
}

function etsiSarjanNimi(joukkueenSarja, sarjat){

	let nimi = "";

	for(let sarja of sarjat){
		let id = sarja.id;
		if(id === joukkueenSarja){
			nimi = sarja.nimi;
			return nimi;
		}
	}
	return nimi;
}