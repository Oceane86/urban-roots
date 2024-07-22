import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';

@Component({
  selector: 'app-leaflet-carte',
  standalone: true,
  templateUrl: './leaflet-carte.component.html',
  styleUrls: ['./leaflet-carte.component.css']
})
export class LeafletCarteComponent implements OnInit {
  @ViewChild('map', { static: true }) mapContainer!: ElementRef;

  private map!: L.Map;
  private markers: L.Marker[] = [];
  private markerClusterGroup!: L.MarkerClusterGroup;

  ngOnInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement).setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Initialize the marker cluster group
    this.markerClusterGroup = L.markerClusterGroup();
    this.map.addLayer(this.markerClusterGroup);

    // Add some markers to the cluster group
    this.addMarkers();
  }

  private addMarkers(): void {
    const locations = [
      { lat: 51.5, lng: -0.09 },
      { lat: 51.51, lng: -0.1 },
      { lat: 51.49, lng: -0.08 },
      { lat: 51.48, lng: -0.1 },
      { lat: 51.47, lng: -0.09 }
    ];

    locations.forEach(location => {
      const marker = L.marker([location.lat, location.lng])
        .bindPopup('Marker at [' + location.lat + ', ' + location.lng + ']');
      this.markerClusterGroup.addLayer(marker);
    });
  }
}
