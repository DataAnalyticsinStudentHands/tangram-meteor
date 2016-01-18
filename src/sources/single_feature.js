//need it to load the promise from the meteor call
//change it back to being the db call only???

import DataSource, {NetworkSource} from './data_source';
import {GeoJSONSource, GeoJSONTileSource} from './geojson';
import geojsonvt from 'geojson-vt';


export class SingleFeatureGeoJSONSource extends GeoJSONSource {

    constructor (source) {
        super(source);
		this._load(source);
        this.sfdata = source.sfdata;
		this.collect_name = source.collect_name;
    }

    formatUrl (dest) { //have to decide whether to use - could just strip?
		return 'SingleFeatureData'
    }

    parseSourceData (dest, source) {
		source.layers = {} 
		source.layers = this.getLayers(dest.source_data.layers);
		console.log('in parse',dest,this,source)
    }

    // Detect single or multiple layers in returned data
    getLayers (data) {
		console.log('getLayers in sf',data,data.type)
        if (data.type === 'Feature' || data.type === 'FeatureCollection') {
            return { _default: data };
        }
        else {
            return data;
        }
    }

}
DataSource.register(SingleFeatureGeoJSONSource, 'SingleFeatureGeoJSON');