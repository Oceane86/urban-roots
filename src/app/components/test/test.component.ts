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
  private userMarker: L.Marker | undefined; // Marqueur pour la position de l'utilisateur

  public selectedTypeProjet: string = '';
  public selectedTypeActivite: string = '';
  public selectedTechniqueProd: string = ''; // Ajouté
  public selectedTypeProd: string = ''; // Ajouté

  public typesProjets: string[] = [];
  public typesActivites: string[] = [];
  public techniquesProd: string[] = []; // Ajouté
  public typesProd: string[] = []; // Ajouté

  private allMarkers: { marker: L.Marker; typeProjet: string[]; typeActivite: string[] }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.initMap();
    this.loadMarkers();
    this.showUserLocation(); // Ajouté pour afficher la position de l'utilisateur
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
      if (this.map) {
        this.typesProjets = [...new Set(data.flatMap(item => item.list_typeprojet))];
        this.typesActivites = [...new Set(data.flatMap(item => item.list_typeactivite))];
        this.techniquesProd = [...new Set(data.flatMap(item => item.list_techniqueprod))]; // Ajouté
        this.typesProd = [...new Set(data.flatMap(item => item.list_typeprod))]; // Ajouté

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

  private showUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (this.map) {
          // Ajouter un marqueur pour la position de l'utilisateur
          if (this.userMarker) {
            this.map.removeLayer(this.userMarker); // Supprimer le précédent marqueur de l'utilisateur s'il existe
          }

          this.userMarker = L.marker([lat, lng], {
            icon: L.icon({
              iconUrl: 'https://example.com/user-icon.png', // URL d'un icône pour l'utilisateur
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32]
            })
          }).bindPopup('Vous êtes ici').addTo(this.map);

          // Centrer la carte sur la position de l'utilisateur
          this.map.setView([lat, lng], 12);
        }
      }, error => {
        console.error('Erreur de géolocalisation:', error);
      });
    } else {
      console.error('La géolocalisation n\'est pas supportée par ce navigateur.');
    }
  }

  public applyFilters(): void {
    if (!this.map) return; // Vérifie si la carte est définie

    this.markers.clearLayers(); // Efface les anciens marqueurs

    const filteredMarkers = this.allMarkers.filter(({ typeProjet, typeActivite }) => {
      const typeProjetsMatch = !this.selectedTypeProjet || typeProjet.includes(this.selectedTypeProjet);
      const typeActivitesMatch = !this.selectedTypeActivite || typeActivite.includes(this.selectedTypeActivite);
      return typeProjetsMatch && typeActivitesMatch;
    });

    filteredMarkers.forEach(({ marker }) => this.markers.addLayer(marker));
  }
}
