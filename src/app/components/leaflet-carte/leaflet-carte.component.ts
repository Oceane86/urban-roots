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
  @ViewChild('map', { static: true }) mapContainer?: ElementRef; // Modifié pour accepter undefined
  private map!: L.Map;
  private markerClusterGroup!: L.MarkerClusterGroup;
  private currentLocationMarker?: L.Marker;

  private markers: L.Marker[] = [];
  private allMarkersData: any[] = [];
  private selectedProjectFilters: Set<string> = new Set();
  private selectedProductFilters: Set<string> = new Set();

  public filteredFilters = [
    { type: 'ferme-urbaine-participative', label: 'Ferme Urbaine Participative' },
    { type: 'jardin-potager', label: 'Jardin Potager' },
    { type: 'herbes-aromatiques', label: 'Herbes Aromatiques' },
    { type: 'legumes', label: 'Légumes' },
    { type: 'plants', label: 'Plants' }
  ];

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

    this.map = L.map(this.mapContainer.nativeElement).setView([46.603354, 1.888334], 6); // Centrer la carte sur la France

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
      })
        .bindPopup(popupContent);

      this.markerClusterGroup.addLayer(marker);
    });
  }

  private isVisible(site: any): boolean {
    const projectTypes: string[] = site.list_typeprojet || [];
    const productTypes: string[] = site.list_typeprod || [];
    const isProjectTypeVisible = this.selectedProjectFilters.size === 0 || projectTypes.some(type => this.selectedProjectFilters.has(type));
    const isProductTypeVisible = this.selectedProductFilters.size === 0 || productTypes.some(type => this.selectedProductFilters.has(type));
    return isProjectTypeVisible && isProductTypeVisible;
  }

  public onFilterChange(filterType: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const isChecked = inputElement.checked;

    if (['herbes-aromatiques', 'jardin-potager', 'legumes', 'plants'].includes(filterType)) {
      if (isChecked) {
        this.selectedProductFilters.add(filterType);
      } else {
        this.selectedProductFilters.delete(filterType);
      }
    } else {
      if (isChecked) {
        this.selectedProjectFilters.add(filterType);
      } else {
        this.selectedProjectFilters.delete(filterType);
      }
    }
    this.updateMarkers();
  }

  public resetFilters(): void {
    this.selectedProjectFilters.clear();
    this.selectedProductFilters.clear();
    this.updateMarkers();
    // Réinitialiser les cases à cocher dans le template
    const checkboxes = document.querySelectorAll('.filters input[type="checkbox"]');
    checkboxes.forEach(checkbox => (checkbox as HTMLInputElement).checked = false);
  }

  public onSearch(query: string): void {
    query = query.toLowerCase();
    this.filteredFilters = this.filteredFilters.filter(filter =>
      filter.label.toLowerCase().includes(query)
    );
  }

  public centerOnCurrentLocation(): void {
    if (this.currentLocationMarker) {
      const latLng = this.currentLocationMarker.getLatLng();
      this.map.setView(latLng, 14);
    }
  }

  private addCurrentLocationMarker(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (this.currentLocationMarker) {
          this.map.removeLayer(this.currentLocationMarker);
        }

        this.currentLocationMarker = L.marker([lat, lng]).addTo(this.map);
        this.map.setView([lat, lng], 14);
      }, error => {
        console.error('Erreur de géolocalisation', error);
      });
    } else {
      console.error('Géolocalisation non supportée par ce navigateur.');
    }
  }
}
