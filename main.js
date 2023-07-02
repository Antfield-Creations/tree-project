import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';
import View from 'ol/View';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {OSM, Vector as VectorSource} from 'ol/source';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {useGeographic} from 'ol/proj';
import {Select} from "ol/interaction";

useGeographic();

const res = await fetch ('image-locations.geo.json');
const locations = await res.json();



const style = new Style({
  fill: new Fill({
    color: '#eeeeee',
  }),
});

const vectorLayer = new VectorLayer({
  source: new VectorSource({
    features: new GeoJSON().readFeatures(locations),
  })
});

const map = new Map({
  layers: [
    new TileLayer({source: new OSM()}),
    vectorLayer,
  ],
  target: 'map',
  view: new View({
    center: [5.3793066, 52.12315674],
    zoom: 14,
  }),
});

const selected = new Style({
  fill: new Fill({
    color: '#eeeeee',
  }),
  stroke: new Stroke({
    color: 'rgba(255, 255, 255, 0.7)',
    width: 2,
  }),
});

let selectStyle = function (feature) {
  let fill = new Fill({
    color: '#326de5',
  });

  let stroke = new Stroke({
    color: '#a30f4f',
    width: 1.5
  });

  let styles = [
    new Style({
      image: new CircleStyle({
        fill: fill,
        stroke: stroke,
        radius: 6
      }),
      fill: fill,
      stroke: stroke
    })
  ];
  return styles;
}

map.addInteraction(new Select({style: selectStyle}));
