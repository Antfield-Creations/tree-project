import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';
import View from 'ol/View';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {OSM, Vector as VectorSource} from 'ol/source';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {useGeographic} from 'ol/proj';
import {Select} from "ol/interaction";
import {Overlay} from "ol";

useGeographic();

// Load geospatial features
const res = await fetch ('image-locations.geo.json');
const locations = await res.json();

const vectorLayer = new VectorLayer({
  source: new VectorSource({
    features: new GeoJSON().readFeatures(locations),
  })
});

const attributions =
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

const map = new Map({
  layers: [
    new TileLayer({source: new OSM({attributions: attributions})}),
    vectorLayer,
  ],
  target: 'map',
  view: new View({
    center: [5.3793066, 52.12315674],
    zoom: 14,
  }),
});

let selectStyle = function () {
  let fill = new Fill({
    color: '#326de5',
  });

  let stroke = new Stroke({
    color: '#a30f4f',
    width: 1.5
  });

  return [
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
}

map.addInteraction(new Select({style: selectStyle}));

// Add popover handler
const element = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function () {
  popup.setPosition(undefined);
  closer.blur();
  return false;
};

const popup = new Overlay({
  element: element,
  positioning: 'bottom-center',
  stopEvent: false,
});
map.addOverlay(popup);

let popover;
function disposePopover() {
  if (popover) {
    popover.dispose();
    popover = undefined;
  }
}
// display popup on click
map.on('click', function (evt) {
  const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });
  disposePopover();
  if (!feature) {
    return;
  }
  popup.setPosition(feature.getGeometry().getCoordinates());
  content.innerHTML = '<img src="'+ feature.get('image') + '">' + '</img>';
});
