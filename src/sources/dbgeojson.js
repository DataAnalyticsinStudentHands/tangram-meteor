import DataSource, {NetworkSource, NetworkTileSource} from './data_source'; //think about tiling
import {GeoJSONSource, GeoJSONTileSource} from './geojson';  
import {MVTSource} from './mvt';
import Utils from '../utils/utils';
import Geo from '../geo';
import geojsonvt from 'geojson-vt';
declare var Meteor:any;

export class DBGeoJSONSource extends DataSource {

    constructor (source) {
        super(source);
		console.log('source in db constructor',source)
        this.response_type = ""; // use to set explicit XHR type
		this.loaded = false;
		//this calls Meteor and prints results to console, etc., but throws error as well:
		//console.log('inside constructor',Meteor.default_connection._mongo_livedata_collections.monitors.find().fetch())
//		let constPromise = Meteor.default_connection._mongo_livedata_collections.monitors.find().fetch();
		var list4promise = []
		// constPromise.forEach(function(m){
// 			list4promise.push(m)
//  			//console.log(m) - is there a way to add output to dest in constructor??
// 		})//.then(function(){this.loaded=true})
		//console.log(list4promise.count)
		//this.list4promise = list4promise;
		/*
		this.collname = 'monitors'
		this.asyncEach3 = function(collname, callback) {
			var arr = [1]
			//var arr = Meteor.default_connection._mongo_livedata_collections.monitors.find().fetch();
		    // Utility inner function to create a wrapper function for the callback
		    function makeCallbackWrapper(arr, i, callback) {
		        // Create our function scope for use inside the loop
		        return function() {
		            callback(arr[i]);
		        }
		    }

		    for (var i = 0; i < arr.length; ++i) {
		        setTimeout(makeCallbackWrapper(arr, i, callback), 0);
		    }
		}
		var self = this;
		this.logItem = function(item) {
			self.list4promise = Meteor.default_connection._mongo_livedata_collections[self.collname].find().fetch();
			console.log('list4promise in callback',list4promise)
		}
		this.asyncEach3(this.collname,this.logItem)  //this one works
		*/
    }
	

    _load (dest) {
	
        let source_data = dest.source_data;
        source_data.collection = 'monitors';
        dest.debug = dest.debug || {};
        dest.debug.network = +new Date();
//		console.log('list4promise',this.list4promise)
		
		// return new Promise((resolve, reject) => {
		//             dest.debug.response_size = body.length || body.byteLength;
		//             dest.debug.network = +new Date() - dest.debug.network;
		//             dest.debug.parsing = +new Date();
		// 	dest.debug.parsing = +new Date() - dest.debug.parsing;
		// 	console.log('list4promise',self.list4promise)
		// 	//if (self.loaded){
		// 	resolve(dest)
		// 		//}
		// });
		// }

        return new Promise((resolve, reject) => {
            source_data.error = null;
            
   //         let promise = Utils.db('monitors');
    	//
		//	console.log('Meteor inside promise',Meteor)
		   var promise = new Promise((resolve, reject) => {
			   		
			 })


				            promise.then((body) => {
				                dest.debug.response_size = body.length || body.byteLength;
				                dest.debug.network = +new Date() - dest.debug.network;
				                dest.debug.parsing = +new Date();
				                console.log('body as respnse from db?',body)
				                JSON.parse(body)
				                //this.parseSourceData(dest, source_data, body);
				                dest.debug.parsing = +new Date() - dest.debug.parsing;
				                resolve(dest);
				            }).catch((error) => {
				console.log('error from promise',error)
				                source_data.error = error.toString();
				                resolve(dest); // resolve request but pass along error
				            });
        })
	}
}
    // Sub-classes must implement:

//    formatUrl (dest) {
//        throw new MethodNotImplemented('formatUrl');
//    }
//
//    parseSourceData (dest, source, reponse) {
//        throw new MethodNotImplemented('parseSourceData');
//    }
//}


/*** Generic network tile loading - abstract class 

export class DBNetworkTileSource extends NetworkSource {

    constructor (source) {
        super(source);
//console.log('NetworkTileSource',source)
        this.tiled = true;
        this.url_hosts = null;
        var host_match = this.url.match(/{s:\[([^}+]+)\]}/);
        if (host_match != null && host_match.length > 1) {
            this.url_hosts = host_match[1].split(',');
            this.next_host = 0;
        }
    }

    formatUrl(tile) {
        let coords = Geo.wrapTile(tile.coords, { x: true });
        var url = this.url.replace('{x}', coords.x).replace('{y}', coords.y).replace('{z}', coords.z);

        if (this.url_hosts != null) {
            url = url.replace(/{s:\[([^}+]+)\]}/, this.url_hosts[this.next_host]);
            this.next_host = (this.next_host + 1) % this.url_hosts.length;
        }
        return url;
    }

    // Checks for the x/y/z tile pattern in URL template
    urlHasTilePattern(url) {
        return url &&
            url.search('{x}') > -1 &&
            url.search('{y}') > -1 &&
            url.search('{z}') > -1;
    }

}
***/

DataSource.register(DBGeoJSONSource, 'DBGeoJSON');
//DataSource.register(DBGeoJSONDataSource, 'DBGeoJSONData');
