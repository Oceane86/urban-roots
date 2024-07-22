import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Importation nécessaire pour ngModel

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [FormsModule], // Importer FormsModule ici
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  private map: L.Map | undefined;
  private markers: L.MarkerClusterGroup = L.markerClusterGroup(); // Initialiser avec une valeur par défaut

  public selectedTypeProjet: string = '';
  public selectedTypeActivite: string = '';

  public typesProjets: string[] = [];
  public typesActivites: string[] = [];

  private allMarkers: { marker: L.Marker; typeProjet: string[]; typeActivite: string[] }[] = [];

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

    if (this.map) {
      this.map.addLayer(this.markers);
    }
  }

  private loadMarkers(): void {
    this.http.get<any[]>('https://www.observatoire-agriculture-urbaine.org/json/listsites.php?v=1720789221209').subscribe(data => {
      if (this.markers) {
        this.typesProjets = [...new Set(data.flatMap(item => item.list_typeprojet))];
        this.typesActivites = [...new Set(data.flatMap(item => item.list_typeactivite))];

        this.allMarkers = data.map(item => {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lng);
          const title = item.title || 'No Title';
          const iconUrl = item.img || 'https://example.com/default-icon.png'; // URL d'un icône par défaut

          const marker = L.marker([lat, lng], {
            icon: L.icon({
              iconUrl: iconUrl,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32]
            })
          }).bindPopup(`<b>${title}</b>`);

          return {
            marker: marker,
            typeProjet: item.list_typeprojet,
            typeActivite: item.list_typeactivite
          };
        });

        this.applyFilters(); // Appliquer les filtres après chargement des marqueurs
      }
    });
  }

  public applyFilters(): void {
    this.markers.clearLayers();

    const filteredMarkers = this.allMarkers.filter(({ marker, typeProjet, typeActivite }) => {
      const typeProjetsMatch = !this.selectedTypeProjet || typeProjet.includes(this.selectedTypeProjet);
      const typeActivitesMatch = !this.selectedTypeActivite || typeActivite.includes(this.selectedTypeActivite);
      return typeProjetsMatch && typeActivitesMatch;
    });

    filteredMarkers.forEach(({ marker }) => this.markers.addLayer(marker));
  }
}
