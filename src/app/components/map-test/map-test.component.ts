import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';

@Component({
  selector: 'app-map-test',
  templateUrl: './map-test.component.html',
  styleUrls: ['./map-test.component.css']
})
export class MapTestComponent implements OnInit {
  private map: L.Map | undefined;

  ngOnInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [48.8566, 2.3522],
      zoom: 12
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    const markers = L.markerClusterGroup();
    for (let i = 0; i < 100; i++) {
      const marker = L.marker(this.getRandomLatLng());
      markers.addLayer(marker);
    }

    this.map.addLayer(markers);
  }

  private getRandomLatLng(): L.LatLngExpression {
    const lat = 48.8566 + (Math.random() - 0.5) * 0.1;
    const lng = 2.3522 + (Math.random() - 0.5) * 0.1;
    return [lat, lng];
  }
}
