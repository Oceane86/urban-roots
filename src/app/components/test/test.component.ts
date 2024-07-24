import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet'; // Correction de l'importation de Leaflet
import 'leaflet.markercluster'; // Importation du plugin MarkerCluster
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [],
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  private map: L.Map | undefined;
  private markers: L.MarkerClusterGroup = L.markerClusterGroup(); // Initialiser avec une valeur par défaut

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.initMap();
    this.loadMarkers();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [46.603354, 1.888334], // Centre approximatif de la France
      zoom: 6,
      layers: [
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        })
      ]
    });

    // Ajout du groupe de clusters à la carte
    if (this.map) {
      this.map.addLayer(this.markers);
    }
  }

  private loadMarkers(): void {
    this.http.get<any[]>('https://www.observatoire-agriculture-urbaine.org/json/listsites.php?v=1720789221209').subscribe(data => {
      // Assurez-vous que this.markers n'est pas undefined avant de l'utiliser
      if (this.markers) {
        data.forEach(item => {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lng);
          const title = item.title || 'No Title';
          const iconUrl = item.img || 'https://example.com/default-icon.png'; // URL d'un icône par défaut

          const marker = L.marker([lat, lng], {
            icon: L.icon({
              iconUrl: iconUrl,
              iconSize: [32, 32], // Taille de l'icône
              iconAnchor: [16, 32], // Ancrage de l'icône
              popupAnchor: [0, -32] // Ancrage de la popup
            })
          }).bindPopup(`<b>${title}</b>`);

          this.markers.addLayer(marker); // Ajout du marqueur au groupe de clusters
        });
      }
    });
  }
}
