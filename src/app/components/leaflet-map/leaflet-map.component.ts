// src/app/components/leaflet-map/leaflet-map.component.ts
import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscriber } from 'rxjs';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-leaflet-map',
  templateUrl: './leaflet-map.component.html',
  styleUrls: ['./leaflet-map.component.css'],
  standalone: true,
  imports: [FormsModule]
})
export class LeafletMapComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private mapInitialized = false;
  public searchQuery: string = '';
  public filteredGardens: any[] = [];
  public selectedGarden: any = null;
  private markers!: L.MarkerClusterGroup;
  public filters = {
    typeprojet: '',
    typeactivite: '',
    techniqueprod: ''
  };
  private urbanSpaces: any[] = [];
  public resultsCount: number = 0; // Ajouter cette propriété

  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    if (!this.mapInitialized) {
      this.loadMap();
      this.mapInitialized = true;
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private getCurrentPosition(): Observable<any> {
    return new Observable((observer: Subscriber<any>) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position: GeolocationPosition) => {
            observer.next({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
            observer.complete();
          },
          (error: GeolocationPositionError) => observer.error(error)
        );
      } else {
        observer.error('Geolocation not available');
      }
    });
  }

  private loadMap(): void {
    const mapContainer = document.getElementById('map');
    if (mapContainer && mapContainer.innerHTML !== '') {
      return;
    }

    this.map = L.map('map').setView([46.603354, 1.888334], 6); // Center of France

    L.tileLayer('https://api.mapbox.com/styles/v1/chainez-mlh/clu751mt600dd01pieymr79xk/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2hhaW5lei1tbGgiLCJhIjoiY2x5aW5xNTZlMGZ6ajJyczg4ZjdncWk5NyJ9.ZDbzpR-2xmnBF2NeiFwpug', {
      attribution: '',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: environment.mapbox.accessToken,
    }).addTo(this.map);

    this.markers = L.markerClusterGroup();
    this.loadMarkers();

    this.getCurrentPosition().subscribe((position: any) => {
      const userIcon = L.icon({
        iconUrl: 'assets/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      const userMarker = L.marker([position.latitude, position.longitude], { icon: userIcon })
        .addTo(this.map);

      L.circle([position.latitude, position.longitude], {
        radius: position.accuracy / 2,
        color: 'red',
        fillColor: 'red',
        fillOpacity: 0.2,
      }).addTo(this.map);

      this.markers.addLayer(userMarker);
      this.map.fitBounds(this.markers.getBounds());
    }, (error: any) => {
      console.error('Failed to get user position:', error);
    });
  }

  private loadMarkers(): void {
    this.http.get('https://www.observatoire-agriculture-urbaine.org/json/listsites.php?v=1720789221209')
      .subscribe((data: any) => {
        this.urbanSpaces = data; // Store the urban spaces data
        this.applyFilters(); // Apply filters when the data is loaded
      });
  }

  private createPopupContent(garden: any): string {
    let content = `<b>${garden.title}</b><br>`;
    content += `<p>${garden.ville}, ${garden.cp}</p>`;
    content += `<p>Type de projet: ${garden.list_typeprojet.join(', ')}</p>`;
    content += `<p>Activités: ${garden.list_typeactivite.join(', ')}</p>`;
    content += `<p>Techniques de production: ${garden.list_techniqueprod.join(', ')}</p>`;
    content += `<p>Types de production: ${garden.list_typeprod.join(', ')}</p>`;
    if (garden.img) {
      content += `<img src="${garden.img}" alt="${garden.title}" style="width:100px;height:auto;">`;
    }
    return content;
  }

  private updatePopupContent(garden: any): void {
    this.selectedGarden = garden;
    console.log(this.selectedGarden);
  }

  public applyFilters(): void {
    this.filteredGardens = this.urbanSpaces.filter(space => {
      const matchesTypeProjet = this.filters.typeprojet ? space.list_typeprojet.includes(this.filters.typeprojet) : true;
      const matchesTypeActivite = this.filters.typeactivite ? space.list_typeactivite.includes(this.filters.typeactivite) : true;
      const matchesTechniqueProd = this.filters.techniqueprod ? space.list_techniqueprod.includes(this.filters.techniqueprod) : true;
      return matchesTypeProjet && matchesTypeActivite && matchesTechniqueProd;
    });
    this.resultsCount = this.filteredGardens.length; // Mise à jour du nombre de résultats
    this.updateMapMarkers();
  }

  public resetFilters(): void {
    // Réinitialiser les valeurs des filtres
    this.filters = {
      typeprojet: '',
      typeactivite: '',
      techniqueprod: ''
    };
    // Appliquer les filtres réinitialisés
    this.applyFilters();
  }

  private updateMapMarkers(): void {
    if (this.markers) {
      this.markers.clearLayers();
    }

    const gardenIcon = L.icon({
      iconUrl: 'assets/images/garden-icon.png',
      iconSize: [70, 70],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    this.filteredGardens.forEach((garden: any) => {
      const gardenMarker = L.marker([parseFloat(garden.lat), parseFloat(garden.lng)], { icon: gardenIcon })
        .bindPopup(this.createPopupContent(garden))
        .on('click', () => this.updatePopupContent(garden))
        .addTo(this.markers);
    });

    this.map.addLayer(this.markers);
  }
}
