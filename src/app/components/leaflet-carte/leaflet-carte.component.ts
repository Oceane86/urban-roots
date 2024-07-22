import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  private markerClusterGroup!: L.MarkerClusterGroup;
  private currentLocationMarker?: L.Marker;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.initMap();
    this.loadMarkers();
    this.addCurrentLocationMarker();
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement).setView([46.603354, 1.888334], 6); // Centrer la carte sur la France

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.markerClusterGroup = L.markerClusterGroup();
    this.map.addLayer(this.markerClusterGroup);
  }

  private loadMarkers(): void {
    this.http.get<any[]>('https://www.observatoire-agriculture-urbaine.org/json/listsites.php?v=1720789221209')
      .subscribe(data => {
        if (data && data.length) {
          this.addMarkers(data);
        }
      });
  }

  public centerOnCurrentLocation(): void {
    if (this.currentLocationMarker) {
      const latLng = this.currentLocationMarker.getLatLng();
      this.map.setView(latLng, 13);
    }
  }

  private addMarkers(data: any[]): void {
    data.forEach(site => {
      const lat = parseFloat(site.lat); // Convertir en nombre
      const lng = parseFloat(site.lng); // Convertir en nombre
      const title = site.title || 'Sans titre';
      const img = site.img ? `<img src="${site.img}" alt="${title}" style="width:100px;height:auto;">` : '';

      const popupContent = `
        <div>
          <strong>${title}</strong><br>
          ${img}<br>
          ${site.ville}, ${site.cp}<br>
          Type de projet: ${site.list_typeprojet.join(', ')}<br>
          Activités: ${site.list_typeactivite.join(', ')}
        </div>
      `;

      const marker = L.marker([lat, lng])
        .bindPopup(popupContent);

      this.markerClusterGroup.addLayer(marker);
    });
  }

  private addCurrentLocationMarker(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Ajouter un marqueur pour la localisation actuelle
          if (this.currentLocationMarker) {
            this.map.removeLayer(this.currentLocationMarker);
          }

          this.currentLocationMarker = L.marker([lat, lng], { icon: L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] }) })
            .bindPopup('Vous êtes ici')
            .addTo(this.map);

          // Centrer la carte sur la localisation actuelle
          this.map.setView([lat, lng], 13);
        },
        (error) => {
          console.error('Erreur de géolocalisation :', error);
        }
      );
    } else {
      console.error('Géolocalisation non supportée par ce navigateur.');
    }
  }
}
