import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster'; // Correct import for the plugin
import 'leaflet.fullscreen'; // Correct import for the plugin

@Component({
  selector: 'app-leaflet-map',
  templateUrl: './leaflet-map.component.html',
  styleUrls: ['./leaflet-map.component.css'],
})
export class LeafletMapComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private markers!: L.MarkerClusterGroup;

  ngAfterViewInit(): void {
    this.loadMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initializeMarkerClusterGroup(): L.MarkerClusterGroup {
    return L.markerClusterGroup(); // Initialize marker cluster group
  }

  private loadMap(): void {
    if (this.map) {
      return; // Map is already initialized
    }

    this.map = L.map('map', {
      center: [46.603354, 1.888334],
      zoom: 6,
      layers: [L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')]
    });

    this.markers = this.initializeMarkerClusterGroup(); // Initialize marker cluster group
    this.map.addLayer(this.markers);

    // Add some markers to demonstrate functionality
    const marker = L.marker([46.603354, 1.888334]);
    this.markers.addLayer(marker);
    this.map.addLayer(this.markers);
  }
}
