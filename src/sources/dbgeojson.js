import DataSource, {NetworkSource, NetworkTileSource} from './data_source'; //think about tiling
import {GeoJSONSource, GeoJSONTileSource} from './geojson';  
import {MVTSource} from './mvt';
//import geojsonvt from 'geojson-vt';
import Geo from '../geo';

// For tiling GeoJSON client-side
import geojsonvt from 'geojson-vt';

/**
 DBGeoJSON standalone (non-tiled) source, following GeoJSON
 Uses geojson-vt split into tiles client-side
*/

export class DBGeoJSONSource extends DataSource {
//export class DBGeoJSONSource extends NetworkSource { //tries to load http

    constructor(source) {
		console.log('dbgeojsonsource in constructor',source)
        super(source);
		this.load(source); //see if that lets you do whole replace???
        this.tiled = true;  //want to figure out how to use tiling to help with visibility
        this.load_data = null;
        //this.load_sfdata = null;
        this.sfdata = null; //source.sfdata;
		this.collect_name = source.collect_name;
        
        this.tile_indexes = {}; // geojson-vt tile indices, by layer name
        this.max_zoom = Math.max(this.max_zoom || 0, 15); // TODO: max zoom < 15 causes artifacts/no-draw at 20, investigate
        this.pad_scale = 0; // we don't want padding on auto-tiled sources
        this.enforce_winding = (source.enforce_winding === false) ? false : true; // default on, can be forced off
    }

    _load(dest) {
		console.log('inside _load',this,dest)
        let source_data = dest.source_data;
        source_data.error = null;
        dest.debug = dest.debug || {};
        dest.debug.network = new Date();
        
        
        this.load_sfdata = new Promise((resolve, reject) => {
            //setTimeout(function(){
                
            console.log('trying to make sfdata this is dest',dest)
                var sfdata = dest.sfdata;
            
            console.log('sfdata b4 if',sfdata, Object.keys(sfdata).length)
                //if(sfdata != undefined && (Object.keys(sfdata).length>0)){
                 //   console.log('sfdata in if',sfdata)
                    resolve(sfdata)
                //}
            //},13000)
        })
        this.load_sfdata.then((sfdata) =>{
            var self = this;
            console.log('this sfdata', sfdata, Object.keys(sfdata.collection))
            console.log('secondtry',sfdata.collection.findOne())
//            sfdata.collection.find().forEach(function(m){
//		          console.log('in ang2',m)
//              dest.source_data.layers[layer_name] = self.getFeatures(m);
//            })
        })
       
       if (!this.load_data){
            
            this.load_data = super._load({ source_data: { layers: {} } })
        /*        .then(this.load_sfdata)
                .then(data => {
                    //setTimeout(function(){
                    let layers = data.source_data.layers;
                console.log('end of nested promises',data)
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
                    //},13000)
                
                
            }); */
        }
        return this.load_data.then(() => {
//            for (let layer_name in this.tile_indexes) {
//                dest.source_data.layers[layer_name] = this.getTileFeatures(dest, layer_name);
//            }
            console.log('do I get into the return loop?',dest)
            return dest;
        });
    }
    
    
 /*       return this.load_data.then(() => {
            for (let layer_name in this.tile_indexes) {
                dest.source_data.layers[layer_name] = this.getTileFeatures(dest, layer_name);
            }
            return dest;
        });*/
    //}
        //console.log('dest.sfdata',dest.sfdata)
		// dest.sfdata.forEach(function(p){
// 			console.log('in for Each',p,dest.sfdata[p])
// 		})
        //wrap this all in the return promise??
    //    var self = this;
//        return new Promise((resolve, reject) => {
			
//            let data = dest.sfdata;
	//		return Promise.resolve(data).then((body) => {
            //console.log('data',data)
	//		if(data!=undefined && Object.keys(data).length>0){
	//		  body.forEach(function(m){
	//			  console.log(m)
    //                dest.source_data.layers[layer_name] = self.getFeatures(m);
  //              })//;
				//console.log('data inside foreach',data)
			  
//			}else{console.log('no data yet')}
//		})
		//resolve(dest)
	//})
		 
          //  if(data!=undefined && Object.keys(data).length>0){
            //console.log('Object.keys(data)',Object.keys(data).length,Object.keys(data))
            //let data = this.sfdata;
            //if (typeof data == 'object'){
            //if (Object.keys(data).length > 0){
               // console.log('inside if data',data)
/*			data.then((body) => {
				console.log('inside data.then')
                console.log('body',body)
                //set tile_indexes??
                let layer_name = dest.source;
                //set max zoom?? tolerance?? extent?? buffer??
                
                body.forEach(function(m){
                    dest.source_data.layers[layer_name] = self.getFeatures(m);
                });
			  resolve(dest)
            })
            }
*/			
           // }}
//		});
       
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
            
/*        promise.then((body) => {
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
			*/
            
        
    
    
    getFeatures (t) {
            let coords = t.loc.coords;

        // request a particular tile
        //let t = this.tile_indexes[layer_name].getTile(coords.z, coords.x, coords.y);

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
        console.log("collection",collection)

        return collection;
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
