import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { BottomBarComponent } from '../bottom-bar/bottom-bar.component';

@Component({
  selector: 'app-leaflet-carte',
  standalone: true,
  imports: [BottomBarComponent],
  templateUrl: './leaflet-carte.component.html',
  styleUrls: ['./leaflet-carte.component.css']
})
export class LeafletCarteComponent implements OnInit {
  @ViewChild('map', { static: true }) mapContainer?: ElementRef;
  private map!: L.Map;
  private markerClusterGroup!: L.MarkerClusterGroup;
  private currentLocationMarker?: L.Marker;
  private currentLocationCircle?: L.Circle;

  private markers: L.Marker[] = [];
  private allMarkersData: any[] = [];
  private selectedProjectFilters: Set<string> = new Set();
  private selectedProductFilters: Set<string> = new Set();
  private selectedTechniqueFilter: string = 'toutes';

  public filteredFilters = [
    { type: 'ferme-urbaine-participative', label: 'Ferme Urbaine Participative' },
    { type: 'jardin-potager', label: 'Jardin Potager' },
    { type: 'herbes-aromatiques', label: 'Herbes Aromatiques' },
    { type: 'legumes', label: 'Légumes' },
    { type: 'plants', label: 'Plants' }
  ];

  public totalLocations: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.initMap();
    this.loadMarkers();
    this.addCurrentLocationMarker();
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
    this.http.get<any[]>('https://www.observatoire-agriculture-urbaine.org/json/listsites.php?v=1720789221209')
      .subscribe({
        next: data => {
          if (data && Array.isArray(data) && data.length) {
            this.allMarkersData = data;
            this.updateMarkers();
          } else {
            console.warn('Aucune donnée de marqueur trouvée.');
          }
        },
        error: error => {
          console.error('Erreur lors du chargement des marqueurs', error);
        }
      });
  }

  private updateMarkers(): void {
    if (!this.markerClusterGroup) {
      console.error('Groupe de cluster de marqueurs non initialisé.');
      return;
    }

    this.markerClusterGroup.clearLayers();
    const filteredData = this.allMarkersData.filter(site => this.isVisible(site));
    this.totalLocations = filteredData.length;
    filteredData.forEach(site => {
      const lat = parseFloat(site.lat);
      const lng = parseFloat(site.lng);
      const title = site.title || 'Sans titre';
      const img = site.img ? `<img src="${site.img}" alt="${title}" style="width:100px;height:auto;">` : '';

      const popupContent = `
        <div class="custom-popup">
          <strong>${title}</strong><br>
          ${img}<br>
          <strong>Ville:</strong> ${site.ville}<br>
          <strong>Code Postal:</strong> ${site.cp}<br>
          <strong>Ouvert au public:</strong> ${site.ouvertpublic === '1' ? 'Oui' : 'Non'}<br>
          <strong>Prix solidaires:</strong> ${site.prixsolidaires ? 'Oui' : 'Non'}<br>
          <strong>HLM:</strong> ${site.hlm === '1' ? 'Oui' : 'Non'}<br>
          <strong>QP:</strong> ${site.qpv === '1' ? 'Oui' : 'Non'}<br>
          <strong>Type de projet:</strong> ${site.list_typeprojet.join(', ')}<br>
          <strong>Activités:</strong> ${site.list_typeactivite.join(', ')}<br>
          <strong>Techniques de production:</strong> ${site.list_techniqueprod.join(', ')}<br>
          <strong>Types de production:</strong> ${site.list_typeprod.join(', ')}
        </div>
      `;

      const marker = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: 'https://example.com/your-custom-marker-icon.png',
          iconSize: [38, 38],
          iconAnchor: [19, 38],
          popupAnchor: [0, -38]
        })
      }).bindPopup(popupContent);

      this.markerClusterGroup.addLayer(marker);
    });
  }

  private isVisible(site: any): boolean {
    const projectTypes: string[] = site.list_typeprojet || [];
    const productTypes: string[] = site.list_typeprod || [];
    const techniqueTypes: string[] = site.list_techniqueprod || [];

    const isProjectTypeVisible = this.selectedProjectFilters.size === 0 || projectTypes.some(type => this.selectedProjectFilters.has(type));
    const isProductTypeVisible = this.selectedProductFilters.size === 0 || productTypes.some(type => this.selectedProductFilters.has(type));
    const isTechniqueTypeVisible = this.selectedTechniqueFilter === 'toutes' || techniqueTypes.includes(this.selectedTechniqueFilter);

    return isProjectTypeVisible && isProductTypeVisible && isTechniqueTypeVisible;
  }


  public onFilterChange(filterType: string, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    console.log(`Filter Type: ${filterType}`);
    console.log(`Selected Value: ${selectElement.value}`);

    if (filterType === 'techniqueProduction') {
      this.selectedTechniqueFilter = selectElement.value;
    } else if (filterType === 'typeActivite') {
      const value = selectElement.value;
      if (value === 'toutes') {
        this.selectedProjectFilters.clear();
      } else {
        if (selectElement.selectedOptions.length) {
          this.selectedProjectFilters.add(value);
        } else {
          this.selectedProjectFilters.delete(value);
        }
      }
    } else {
      const value = selectElement.value;
      if (selectElement.selectedOptions.length) {
        this.selectedProductFilters.add(value);
      } else {
        this.selectedProductFilters.delete(value);
      }
    }

    console.log('Selected Project Filters:', this.selectedProjectFilters);
    console.log('Selected Product Filters:', this.selectedProductFilters);
    console.log('Selected Technique Filter:', this.selectedTechniqueFilter);

    this.updateMarkers();
  }


  public resetFilters(): void {
    this.selectedProjectFilters.clear();
    this.selectedProductFilters.clear();
    this.selectedTechniqueFilter = 'toutes';
    this.updateMarkers();
  }

  public applyFilters(): void {
    this.updateMarkers();
  }

  private addCurrentLocationMarker(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;

        if (this.currentLocationMarker) {
          this.map.removeLayer(this.currentLocationMarker);
        }

        if (this.currentLocationCircle) {
          this.map.removeLayer(this.currentLocationCircle);
        }

        this.currentLocationMarker = L.marker([latitude, longitude]).addTo(this.map)
          .bindPopup('Vous êtes ici').openPopup();

        this.currentLocationCircle = L.circle([latitude, longitude], {
          color: 'blue',
          fillColor: '#30f',
          fillOpacity: 0.2,
          radius: 500
        }).addTo(this.map);

        this.map.setView([latitude, longitude], 13);
      });
    } else {
      console.error('La géolocalisation n\'est pas supportée par ce navigateur.');
    }
  }

  public centerOnCurrentLocation(): void {
    if (this.currentLocationMarker) {
      this.map.setView(this.currentLocationMarker.getLatLng(), 13);
    } else {
      this.addCurrentLocationMarker();
    }
  }
}
