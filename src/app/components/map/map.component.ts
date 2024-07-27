import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    this.initMap();
  }

  private initMap(): void {
    const map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const markers = L.markerClusterGroup();

    for (let i = 0; i < 100; i++) {
      const lat = 51.505 + (Math.random() - 0.5) * 0.1;
      const lng = -0.09 + (Math.random() - 0.5) * 0.1;
      const marker = L.marker([lat, lng]);
      markers.addLayer(marker);
    }

    map.addLayer(markers);
  }
}
