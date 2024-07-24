import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BottomBarComponent } from '../components/bottom-bar/bottom-bar.component';


@Component({
  selector: 'app-map-test',
  standalone: true,
  imports: [BottomBarComponent,CommonModule,FormsModule],
  templateUrl: './map-test.component.html',
  styleUrl: './map-test.component.css'
})
export class MapTestComponent {

  private map: L.Map | undefined;
  private markers: L.MarkerClusterGroup = L.markerClusterGroup();
  private userMarker: L.Marker | undefined;

  public selectedTypeProjet: string = '';
  public selectedTypeActivite: string = '';
  public selectedTechniqueProd: string = '';
  public selectedActivite: string = '';

  public typesProjets: { value: string; label: string }[] = [];
  public typesActivites: { value: string; label: string }[] = [];
  public techniquesProd: { value: string; label: string }[] = [];
  public activites: { value: string; label: string }[] = [];

  private allMarkers: { marker: L.Marker; typeProjet: string[]; typeActivite: string[]; techniqueProd: string[]; activite: string[] }[] = [];

  public numberOfEstablishments: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.initMap();
    this.loadMarkers();
    this.showUserLocation();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [46.603354, 1.888334],
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

  private getIconColor(type: string): string {
    switch (type) {
      case 'ferme-urbaine-participative': return 'red';
      case 'ferme-urbaine-specialisee': return 'blue';
      case 'jardin-potager': return 'green';
      case 'herbes-aromatiques': return 'purple';
      case 'legumes': return 'orange';
      case 'plants': return 'pink';
      default: return 'grey';
    }
  }

  private createMarkerIcon(type: string): L.Icon {
    const color = this.getIconColor(type);
    return L.divIcon({
      className: 'custom-icon',
      html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%;"></div>`,
      iconSize: [32, 32]
    }) as L.Icon; // Type assertion to make sure TypeScript recognizes it correctly
  }


  private loadMarkers(): void {
    this.http.get<any[]>('https://www.observatoire-agriculture-urbaine.org/json/listsites.php?v=1720789221209')
      .subscribe({
        next: data => {
          if (this.map) {
            const projetsSet = new Set<string>();
            const activitesSet = new Set<string>();
            const techniquesSet = new Set<string>();
            const typesProdSet = new Set<string>();

            data.forEach(item => {
              item.list_typeprojet.forEach((type: string) => projetsSet.add(type));
              item.list_typeactivite.forEach((type: string) => activitesSet.add(type));
              item.list_techniqueprod.forEach((tech: string) => techniquesSet.add(tech));
              item.list_typeprod.forEach((act: string) => typesProdSet.add(act));
            });

            this.typesProjets = Array.from(projetsSet).map(value => ({
              value: value,
              label: this.formatLabel(value)
            }));

            this.typesActivites = Array.from(activitesSet).map(value => ({
              value: value,
              label: this.formatLabel(value)
            }));

            this.techniquesProd = Array.from(techniquesSet).map(value => ({
              value: value,
              label: this.formatLabel(value)
            }));

            this.activites = Array.from(typesProdSet).map(value => ({
              value: value,
              label: this.formatLabel(value)
            }));

            this.allMarkers = data.map(item => {
              const lat = parseFloat(item.lat);
              const lng = parseFloat(item.lng);
              const title = item.title || 'No Title';
              const typeProjet = item.list_typeprojet[0] || 'default'; // Utiliser le premier type ou 'default' si vide

              const marker = L.marker([lat, lng], {
                icon: this.createMarkerIcon(typeProjet)
              }).bindPopup(`<b>${title}</b>`);

              return {
                marker: marker,
                typeProjet: item.list_typeprojet,
                typeActivite: item.list_typeactivite,
                techniqueProd: item.list_techniqueprod,
                activite: item.list_typeprod
              };
            });

            this.applyFilters();
          }
        },
        error: err => console.error('Erreur lors du chargement des marqueurs:', err)
      });
  }

  private formatLabel(value: string): string {
    return value
      .replace(/-/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  private showUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (this.map) {
          this.userMarker = L.marker([lat, lng], {
            icon: L.icon({
              iconUrl: 'https://example.com/user-icon.png',
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32]
            })
          }).bindPopup('Vous êtes ici').addTo(this.map);

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
    if (!this.map) return;

    this.markers.clearLayers();

    const filteredMarkers = this.allMarkers.filter(({ typeProjet, typeActivite, techniqueProd, activite }) => {
      const typeProjetsMatch = !this.selectedTypeProjet || typeProjet.includes(this.selectedTypeProjet);
      const typeActivitesMatch = !this.selectedTypeActivite || typeActivite.includes(this.selectedTypeActivite);
      const techniqueProdMatch = !this.selectedTechniqueProd || techniqueProd.includes(this.selectedTechniqueProd);
      const activiteMatch = !this.selectedActivite || activite.includes(this.selectedActivite);
      return typeProjetsMatch && typeActivitesMatch && techniqueProdMatch && activiteMatch;
    });

    this.numberOfEstablishments = filteredMarkers.length;

    filteredMarkers.forEach(({ marker }) => this.markers.addLayer(marker));
  }

  public resetFilters(): void {
    this.selectedTypeProjet = '';
    this.selectedTypeActivite = '';
    this.selectedTechniqueProd = '';
    this.selectedActivite = '';
    this.applyFilters();
  }

}
