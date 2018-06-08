var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

function writeKeyPair (keyPair) {

	var open = indexedDB.open("KeyStore", 1);

	open.onupgradeneeded = function() {
	    var db = open.result;
	    var store = db.createObjectStore("keyPair", {keyPath: "id", autoIncrement: true});
	    writeKeyPair(keyPair);
	};

	open.onsuccess = function() {
		var db = open.result;
	    var tx = db.transaction("keyPair", "readwrite");
	    var store = tx.objectStore("keyPair");

	   	store.put(keyPair);
	   	console.log(3);
	    tx.oncomplete = function() {
	        db.close();
	    };
	}

	open.onerror = function(error){
		console.error(error);
	}
}

function readKeyPairs(){

	var open = indexedDB.open("KeyStore", 1);

	open.onupgradeneeded = function() {
	    console.error("DB isn't exist!");
	};

	open.onsuccess = function() {
	    var db = open.result;
	    var tx = db.transaction("keyPair", "readwrite");
	    var store = tx.objectStore("keyPair");


	   	var keyPairs = store.getAll();

	    getJohn.onsuccess = function() {
	        console.log(keyPairs);
	    };

	    tx.oncomplete = function() {
	        db.close();
	    };
	}

	open.onerror = function(error){
		console.error(error);
	}
}