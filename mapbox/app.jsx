import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Map, NavigationControl, useControl } from 'react-map-gl';
import { CPUGridLayer } from '@deck.gl/aggregation-layers';
import { MapboxOverlay as DeckOverlay } from '@deck.gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

// define your constants for the data, the token and the initial state of the map
const DATA_URL = "https://eeon-statpop.s3.eu-central-2.amazonaws.com/statpop_2022.json";

const MAPBOX_TOKEN = "pk.eyJ1Ijoibm8zM21pcyIsImEiOiJjbHZ1cGJ2eWYxYmo4MmltaG51YzZrd3dtIn0.MIsk2At_hfwQ9ZTCCb080w";
console.log(MAPBOX_TOKEN)
const INITIAL_VIEW_STATE = {
  latitude: 46.8182,
  longitude: 8.2275,
  zoom: 7,
  bearing: 0,
  pitch: 30
};
const MAP_STYLE = 'mapbox://styles/mapbox/dark-v9';

const translations = {
  en: {
    title: "Switzerland, population distribution",
    description: "This grid represents the population distribution across Switzerland. Each cell's color intensity and height corresponds to the population density in that area, providing a visual representation of demographic distribution. The standard value is 100, which corresponds to 100 x 100 meters.",
    cellSize: "Cell Size:",
    adjust: "Adjust the grid cell size.",
    source: "Source: Population and Households Statistics (STATPOP), Federal Statistical Office, 2022"
  },
  de: {
    title: "Schweiz, Bevölkerungsverteilung",
    description: "Das Geo-Gitter stellt die Bevölkerungs-verteilung in der Schweiz dar. Die Farbe und Höhe jeder Zelle entspricht der Bevölkerungsdichte an diesem Ort, was eine visuelle Repräsentation der demographischen Verteilung ermöglicht. Der Standardwert beträgt 100, was einer Fläche von 100 x 100 Metern entspricht.",
    cellSize: "Zellgrösse:",
    adjust: "Die Zellgrösse anpassen.",
    source: "Quelle: Statistik der Bevölkerung und der Haushalte (STATPOP), Bundesamt für Statistik, 2022"
  }
};

function ControlCard({ onCellSizeChange, currentCellSize }) {
  const [language, setLanguage] = useState('en');

  const buttonStyle = {
    cursor: 'pointer',
    padding: '5px 10px',
    margin: '0 5px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    backgroundColor: 'white', // Ensure inactive buttons have a white background
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#333', // Dark grey background for active button
    color: 'white',
    borderColor: '#333' // Dark grey border for active button
  };

  const sliderStyle = {
    WebkitAppearance: 'none',
    width: '100%',
    height: '2px',
    backgroundColor: '#333', // Dark grey background for the slider
    outline: 'none',
    opacity: '0.7',
    WebkitTransition: '.2s', // Smooth transition for slider thumb
    transition: 'opacity .2s',
  };

  const sliderThumbStyle = {
    WebkitAppearance: 'none',
    appearance: 'none',
    width: '25px',
    height: '25px',
    backgroundColor: '#333', // Dark grey background for the slider thumb
    cursor: 'pointer',
    borderRadius: '50%',
  };

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
      fontFamily: 'Lato, sans-serif',
      fontSize: '16px'
    }}>
      {/* English Button */}
      <button
        onClick={() => setLanguage('en')}
        style={language === 'en' ? activeButtonStyle : buttonStyle}
      >
        EN
      </button>
      {/* German Button */}
      <button
        onClick={() => setLanguage('de')}
        style={language === 'de' ? activeButtonStyle : buttonStyle}
      >
        DE
      </button>
      <h3>{translations[language].title}</h3>
      <div style={{ marginTop: '20px' }}>{translations[language].description}</div>
      <div style={{ marginTop: '20px' }}>{translations[language].cellSize} {currentCellSize}</div>
      {/* Slider Input */}
      <input type="range"
             min="100"
             max="1000"
             step="100"
             value={currentCellSize}
             onChange={e => onCellSizeChange(e.target.value)}
             style={sliderStyle}
             className="slider"
      />
      {/* Additional styles for the slider thumb */}
      <style>
        {`.slider::-webkit-slider-thumb { background-color: #333; width: 25px; height: 25px; border-radius: 50%; cursor: pointer; }
          .slider::-moz-range-thumb { background-color: #333; width: 25px; height: 25px; border-radius: 50%; cursor: pointer; }`}
      </style>
      <div style={{ marginTop: '10px' }}>{translations[language].adjust}</div>
      <div style={{ marginTop: '20px', fontSize: '12px' }}>
        {translations[language].source}
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
    opacity: 0.3,
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
