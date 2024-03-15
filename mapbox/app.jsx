import React from 'react';
import {createRoot} from 'react-dom/client';
import {Map, NavigationControl, useControl} from 'react-map-gl';
import {HexagonLayer, CPUGridLayer} from '@deck.gl/aggregation-layers';
import {MapboxOverlay as DeckOverlay} from '@deck.gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

// URL to your data or a JS array
const DATA_URL = "https://eeon-statpop.s3.eu-central-2.amazonaws.com/statpop_2022.json";

// Set your Mapbox token here or via environment variable
const MAPBOX_TOKEN = "pk.eyJ1Ijoibm8zM21pcyIsImEiOiJjbHRqMGpzN2MwaDd5MmtuejkwcGJyMjc4In0.X-tRk93a9l5ESNvp4YBdTw"; // eslint-disable-line

// set initial state
const INITIAL_VIEW_STATE = {
  latitude: 46.8182,
  longitude: 8.2275,
  zoom: 7,
  bearing: 0,
  pitch: 30
};

// set basemap
const MAP_STYLE = 'mapbox://styles/mapbox/dark-v9';
function DeckGLOverlay(props) {
  const overlay = useControl(() => new DeckOverlay(props));
  overlay.setProps(props);
  return null;
}

function Root() {
  const onClick = info => {
    if (info.object) {
      // eslint-disable-next-line
      alert(`${info.object.properties.name} (${info.object.properties.abbrev})`);
    }
  };

// define the CPUGridLayer
const cpuGridLayer = new CPUGridLayer({
  id: 'grid-layer',
  data: DATA_URL,
  pickable: true,
  extruded: true,
  cellSize: 100,
  elevationScale: 40,
  opacity: 0.4,
  colorAggregation: "SUM",
  getPosition: d => [d.LON, d.LAT],
  getElevationWeight: d => d.B22BTOT,
  getColorWeight: d => d.B22BTOT,
  colorRange: [
    [255, 255, 204], // Light yellow for the lowest values
    [199, 233, 180], // Light green
    [127, 205, 187], // Light teal, last of the lighter shades
    [29, 145, 192],  // Start to darken more noticeably here
    [8, 104, 172],   // Dark blue, starting the transition earlier
    [8, 78, 158],    // Even darker blue, decreasing variation
    [8, 48, 107],    // Darker still, less variation among the darkest
    [4, 24, 87]      // Darkest blue for the highest values, very similar to previous
  ],  
});

  return (
    <Map
      initialViewState={INITIAL_VIEW_STATE}
      mapStyle={MAP_STYLE}
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      <DeckGLOverlay layers={[cpuGridLayer]} /*interleaved*/ />
      <NavigationControl position='top-left' />
    </Map>
  );
}

/* global document */
const container = document.body.appendChild(document.createElement('div'));
createRoot(container).render(<Root />);
