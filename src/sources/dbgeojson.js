import DataSource, {NetworkSource, NetworkTileSource} from './data_source'; //think about tiling
import {GeoJSONSource, GeoJSONTileSource} from './geojson';  
import {MVTSource} from './mvt';
import Geo from '../geo';

// For tiling GeoJSON client-side
import geojsonvt from 'geojson-vt';

/**
 DBGeoJSON standalone (non-tiled) source, following GeoJSON
 Uses geojson-vt split into tiles client-side
*/

export class DBGeoJSONSource extends DataSource {

    constructor(source) {
		console.log('dbgeojsonsource in constructor',source)
        super(source);
		this.load(source); //see if that lets you do whole replace???
        this.tiled = true;  //want to figure out how to use tiling to help with visibility
        this.load_data = null;
        this.sfdata = source.sfdata;
		this.collect_name = source.collect_name;
        
        this.tile_indexes = {}; // geojson-vt tile indices, by layer name
        this.max_zoom = Math.max(this.max_zoom || 0, 15); // TODO: max zoom < 15 causes artifacts/no-draw at 20, investigate
        this.pad_scale = 0; // we don't want padding on auto-tiled sources
        this.enforce_winding = (source.enforce_winding === false) ? false : true; // default on, can be forced off
    }

    _load(dest) {
		console.log('inside _load',this)
        let source_data = dest.source_data;
        //source_data.url = this.url;
        source_data.error = null;
        dest.debug = dest.debug || {};
        dest.debug.network = +new Date();
        
        console.log('dest.sfdata',dest.sfdata)
        //wrap this all in the return promise??
        return new Promise((resolve, reject) => {
            let promise = dest.sfdata;
       
         /*   
        if (!this.load_data) {
            this.load_data = super._load({ source_data: { layers: {} } }).then(data => {
                let layers = data.source_data.layers;
                for (let layer_name in layers) {
                    this.tile_indexes[layer_name] = geojsonvt(layers[layer_name], {
                        maxZoom: this.max_zoom,  // max zoom to preserve detail on
                        tolerance: 3, // simplification tolerance (higher means simpler)
                        extent: Geo.tile_scale, // tile extent (both width and height)
                        buffer: 0     // tile buffer on each side
                    });
                }

                this.loaded = true;
                return data;
            });
        }

        return this.load_data.then(() => {
			console.log('this in end of load',this)
            for (let layer_name in this.tile_indexes) {
                dest.source_data.layers[layer_name] = GeoJSONSource.getFeatures(dest, layer_name);
            }
            return dest;
        });
            */
            
        promise.then((body) => {
            console.log('promise.then',body)
//            console.log('promiseready?',body.ready())
//            console.log('promiseas meteor?',body.findOne())
                dest.debug.response_size = body.length || body.byteLength;
                dest.debug.network = +new Date() - dest.debug.network;
                dest.debug.parsing = +new Date();
                this.parseSourceData(body);
                dest.debug.parsing = +new Date() - dest.debug.parsing;
                resolve(dest);
            }).catch((error) => {
				console.log('error from promise',error)
                source_data.error = error.toString();
                resolve(dest); // resolve request but pass along error
            });
            
        });
    }

    formatUrl (dest) { //still need to replace other??
		console.log('in formatURL')
        return this.url;
    }

    parseSourceData (obj) {
        console.log(obj)
        let data = JSON.parse(obj);
		source.layers = {} 
		source.layers = this.getLayers(obj);
		console.log('in parse',dest,this,source)
    }

    // Detect single or multiple layers in returned data
    getLayers (data) {
		console.log('in getLayers')
        if (data.type === 'Feature' || data.type === 'FeatureCollection') {
            return { _default: data };
        }
        else {
            return data;
        }
    }

}

DataSource.register(DBGeoJSONSource, 'DBGeoJSON');
//DataSource.register(DBGeoJSONDataSource, 'DBGeoJSONData');
