import { Component, OnInit } from '@angular/core';
import L from 'leaflet';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent implements OnInit {
    private map: L.Map | undefined;

    ngOnInit(): void {
      this.initMap();
    }

    private initMap(): void {
      this.map = L.map('map', {
        center: [51.505, -0.09],
        zoom: 13,
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
          51.5 + Math.random() * 0.1,
          -0.09 + Math.random() * 0.1
        ]);
        markers.addLayer(marker);
      }

      this.map.addLayer(markers);
    }

}
