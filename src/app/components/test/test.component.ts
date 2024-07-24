import { Component, OnInit } from '@angular/core';
import L from 'leaflet';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [],
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
    private map: L.Map | undefined;

    ngOnInit(): void {
      this.initMap();
    }

    private initMap(): void {
      this.map = L.map('map', {
        center: [46.603354, 1.888334], // Centre approximatif de la France
        zoom: 6, // Zoom ajusté pour voir une vue plus large de la France
        layers: [
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          })
        ]
      });

      const markers = L.markerClusterGroup();

      // Ajouter des marqueurs
      for (let i = 0; i < 100; i++) {
        const marker = L.marker([
          46.603354 + Math.random() * 5 - 2.5, // Latitude ajustée pour la France
          1.888334 + Math.random() * 10 - 5 // Longitude ajustée pour la France
        ]);
        markers.addLayer(marker);
      }

      this.map.addLayer(markers);
    }
}
