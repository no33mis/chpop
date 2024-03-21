import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Map, NavigationControl, useControl } from 'react-map-gl';
import { CPUGridLayer } from '@deck.gl/aggregation-layers';
import { MapboxOverlay as DeckOverlay } from '@deck.gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

// define your constants for the data, the token and the initial state of the map
const DATA_URL = "https://eeon-statpop.s3.eu-central-2.amazonaws.com/statpop_2022.json";
const MAPBOX_TOKEN = "pk.eyJ1Ijoibm8zM21pcyIsImEiOiJjbHRqMGpzN2MwaDd5MmtuejkwcGJyMjc4In0.X-tRk93a9l5ESNvp4YBdTw";
const INITIAL_VIEW_STATE = {
  latitude: 46.8182,
  longitude: 8.2275,
  zoom: 7,
  bearing: 0,
  pitch: 30
};
const MAP_STYLE = 'mapbox://styles/mapbox/dark-v9';

// define a control card
function ControlCard({ onCellSizeChange, currentCellSize }) { // Add currentCellSize to the parameters
  return (
    <div style={{ 
      position: 'absolute', 
      top: '10px', 
      right: '10px', 
      backgroundColor: 'white', 
      padding: '20px',
      width: '300px', 
      borderRadius: '5px', 
      zIndex: 999,
      fontFamily: 'Lato, sans-serif', // Set the font family to Lato
      fontSize: '16px' // Adjust the font size as needed
    }}>
      <h3>Switzerland, population distribution</h3>
      <div style={{ marginTop: '20px' }}>
        This grid represents the population distribution across Switzerland. Each cell's color intensity corresponds to the population density in that area, providing a visual representation of demographic distribution.
        The standard value is 100, which corresponds to 100 x 100 meters.
      </div>
      <div style={{ marginTop: '20px' }}>Cell Size: {currentCellSize}</div> {/* Use currentCellSize here */}
      <input type="range" 
             min="100" 
             max="1000" 
             step="100" 
             value={currentCellSize} // Set the input's value to reflect currentCellSize
             onChange={e => onCellSizeChange(e.target.value)} />
      <div>Adjust the grid cell size.</div>
      <div style={{ marginTop: '20px', fontSize: '12px' }}>
        Source: Population and Households Statistics (STATPOP), Federal Statistical Office, 2022 
      </div>
    </div>
  );
}

function DeckGLOverlay(props) {
  const overlay = useControl(() => new DeckOverlay(props));
  overlay.setProps(props);
  return null;
}

// define the dynamic cpuGridLayer layer
function Root() {
  const [cellSize, setCellSize] = useState(100);

  const cpuGridLayer = new CPUGridLayer({
    id: 'grid-layer',
    data: DATA_URL,
    pickable: true,
    extruded: true,
    cellSize: cellSize,
    elevationScale: 40,
    opacity: 0.4,
    colorAggregation: "SUM",
    getPosition: d => [d.LON, d.LAT],
    getElevationWeight: d => d.B22BTOT,
    getColorWeight: d => d.B22BTOT,
    colorRange: [
      [255, 255, 204], [199, 233, 180], [127, 205, 187], [29, 145, 192],
      [8, 104, 172], [8, 78, 158], [8, 48, 107], [4, 24, 87]
    ],
  });

  return (
    <>
      <Map
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle={MAP_STYLE}
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <DeckGLOverlay layers={[cpuGridLayer]} />
        <NavigationControl position='top-left' />
      </Map>
      <ControlCard 
        onCellSizeChange={value => setCellSize(Number(value))} 
        currentCellSize={cellSize} 
      />
    </>
  );
}

const container = document.body.appendChild(document.createElement('div'));
createRoot(container).render(<Root />);
