import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';

@Component({
  selector: 'app-test',
  standalone: true,
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  @ViewChild('map', { static: true }) mapContainer?: ElementRef;
  private map!: L.Map;
  private markerClusterGroup!: L.MarkerClusterGroup;

  constructor() {}

  ngOnInit(): void {
    this.initMap();
    this.loadMarkers();
  }

  private initMap(): void {
    if (!this.mapContainer?.nativeElement) {
      console.error('Element de la carte non trouvé.');
      return;
    }

    this.map = L.map(this.mapContainer.nativeElement).setView([46.603354, 1.888334], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.markerClusterGroup = L.markerClusterGroup();
    this.map.addLayer(this.markerClusterGroup);
  }

  private loadMarkers(): void {
    // Ici, nous générons des marqueurs fictifs pour la démonstration.
    // Remplace cette partie par une requête HTTP pour charger des marqueurs dynamiques.

    const markersData = Array.from({ length: 100 }, (_, i) => ({
      lat: 46.5 + Math.random() * 2,
      lng: 1.5 + Math.random() * 2,
      title: `Marker ${i + 1}`
    }));

    markersData.forEach(data => {
      const marker = L.marker([data.lat, data.lng])
        .bindPopup(`<strong>${data.title}</strong><br><em>Details here</em>`);

      this.markerClusterGroup.addLayer(marker);
    });
  }
}
