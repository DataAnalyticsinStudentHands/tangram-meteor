import DataSource, {NetworkSource, NetworkTileSource} from './data_source';
//import DataSource from './data_source';
//import {GeoJSONSource, GeoJSONTileSource} from './geojson';
import {MVTSource} from './mvt';
import Geo from '../geo';

// For tiling GeoJSON client-side
import geojsonvt from 'geojson-vt';

/**
 GeoJSON standalone (non-tiled) source
 Uses geojson-vt split into tiles client-side
*/

//Could probably do as extends on GeoJSONSource simply

export class DBGeoJSONSource extends NetworkSource {
//export class DBGeoJSONSource extends DataSource {

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
//figure out how data comes in - if I can put it in the call, then have it work through here as layers...
	//could gather and send it in as a stream, I guess - but I think there are other questions about which pieces to make reactive that we have to get to first...
	//can we track everyone by its production in the "new from the ng side??"
	
    _load(dest) {
		console.log('inside _load',this)
		this.parseSourceData(dest,source_data)
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
                dest.source_data.layers[layer_name] = this.getDBFeatures(dest, layer_name);
            }
            return dest;
        });
    }
    getDBFeatures(tile, layer_name) {
        console.log('inside getTileFeatures dbg',tile,layer_name)
        let coords = Geo.wrapTile(tile.coords, { x: true });

        // request a particular tile
        let t = this.tile_indexes[layer_name].getTile(coords.z, coords.x, coords.y);

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

        return collection;
    }

    formatUrl (dest) {
		console.log('in formatURL')
        return this.url;
    }

    parseSourceData (dest, data) {
		source.layers = {} 
		source.layers = this.getLayers(dest.source_data.layers);
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
