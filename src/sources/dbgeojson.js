import DataSource, {NetworkSource, NetworkTileSource} from './data_source'; //think about tiling
import {GeoJSONSource, GeoJSONTileSource} from './geojson';  
import {MVTSource} from './mvt';
import Geo from '../geo';
import geojsonvt from 'geojson-vt';

//needs to get both networksource from data_source.js and geojsonsource
export class DBGeoJSONSource extends DataSource {

    constructor (source) {
        super(source);
		console.log('source in db constructor',source)
		this.loaded = false;
		this.dbdata = source.dbdata; 
		this.layer_name = source.layer_name;
        this.tiled = true;
        this.load_data = null;
        this.tile_indexes = {}; // geojson-vt tile indices, by layer name
        this.max_zoom = Math.max(this.max_zoom || 0, 15); // TODO: max zoom < 15 causes artifacts/no-draw at 20, investigate
        this.pad_scale = 0; // we don't want padding on auto-tiled sources
        this.enforce_winding = (source.enforce_winding === false) ? false : true; // default on, can be forced off
    }
	

    _load (dest) {
		console.log('in _load DBG',dest)
        let source_data = dest.source_data;
		source_data.error = null;
        dest.debug = dest.debug || {};
        dest.debug.network = +new Date();

        return new Promise((resolve, reject) => {
			//represents work done by NetworkSource; return a promise not working; now creates whole in tangram-integration
			
			source_data.layers = {};
            //let layers = data.source_data.layers; //returned from promise, if we could get it to work
			let layer_name = this.layer_name;
			console.log('layer_name in dbg load',layer_name,this.dbdata,
			this.tile_indexes[layer_name] = geojsonvt(this.dbdata, {
				maxZoom: this.max_zoom,  // max zoom to preserve detail on
				tolerance: 3, // simplification tolerance (higher means simpler)
				extent: Geo.tile_scale, // tile extent (both width and height)
				buffer: 0     // tile buffer on each side
			}) );
			console.log('tile_indexes no getTile',this.tile_indexes)
			console.log('tile_indexes',this.tile_indexes[layer_name].getTile(12,964,1694))
			this.loaded = true; //not sure if needed 
			console.log('b4 layers',dest.source_data)
			dest.source_data.layers[layer_name] = this.getTileFeatures(dest, layer_name);
			console.log('after layers',dest.source_data)
			resolve(dest)
        })
	}
    getTileFeatures(tile, layer_name) {   
		console.log('tile',tile,layer_name)
        let coords = Geo.wrapTile(tile.coords, { x: true });
		console.log('coords',coords)
        // request a particular tile
        let t = this.tile_indexes[layer_name].getTile(coords.z, coords.x, coords.y);
		console.log('t after getTile',t)
        // Convert from MVT-style JSON struct to GeoJSON
        let collection;
        if (t && t.features) {
            collection = {
                type: 'FeatureCollection',
                features: []
            };

            for (let feature of t.features) {
                // GeoJSON feature
                let f = {
                    type: 'Feature',
                    geometry: {},
                    properties: feature.tags
                };

                if (feature.type === 1) {
                    f.geometry.coordinates = feature.geometry.map(coord => [coord[0], coord[1]]);
                    f.geometry.type = 'MultiPoint';
                }
                else if (feature.type === 2 || feature.type === 3) {
                    f.geometry.coordinates = feature.geometry.map(ring =>
                        ring.map(coord => [coord[0], coord[1]])
                    );

                    if (feature.type === 2) {
                        f.geometry.type = 'MultiLineString';
                    }
                    else  {
                        f.geometry = MVTSource.decodeMultiPolygon(f.geometry); // un-flatten rings
                    }
                }
                else {
                    continue;
                }

                collection.features.push(f);
            }
        }
		console.log('collection',collection)
        return collection;
    }
}

DataSource.register(DBGeoJSONSource, 'DBGeoJSON');
