import DataSource, {NetworkSource, NetworkTileSource} from './data_source'; //think about tiling
import {GeoJSONSource, GeoJSONTileSource} from './geojson';  
import {MVTSource} from './mvt';
import Utils from '../utils/utils';
import Geo from '../geo';
import geojsonvt from 'geojson-vt';

//declare var Meteor:any;

export class DBGeoJSONSource extends DataSource {

    constructor (source) {
        super(source);
        this.response_type = ""; // use to set explicit XHR type
        //this.Meteor = Meteor || null;
    }

    _load (dest) {
        // super.load(dest);
        
        
        //let url = this.formatUrl(dest);
		
        let source_data = dest.source_data;
        source_data.collection = 'monitors';
        dest.debug = dest.debug || {};
        dest.debug.network = +new Date();

        return new Promise((resolve, reject) => {
        Meteor = this.Meteor;
            source_data.error = null;
            console.log('resolving outside')
            //let promise = Utils.db('monitors');
    	setTimeout(function(){
    var promise = new Promise((resolve, reject) => {
		  var sub = Meteor.subscribe('monitors');
		        if (sub.ready()) {
    				console.log('subready',sub,tst)
                    var coll = "monitors";  
                    resolve(Meteor.default_connection._mongo_livedata_collections.monitors.find().fetch())
		        }
		
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
            }, 10000)
        }); 
    }

    // Sub-classes must implement:

//    formatUrl (dest) {
//        throw new MethodNotImplemented('formatUrl');
//    }
//
//    parseSourceData (dest, source, reponse) {
//        throw new MethodNotImplemented('parseSourceData');
//    }
}


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
