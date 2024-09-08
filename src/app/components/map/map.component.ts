import * as L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.fullscreen';
import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscriber } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BottomBarComponent } from '../bottom-bar/bottom-bar.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, BottomBarComponent]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private markersLayerGroup!: L.MarkerClusterGroup;
  public searchQuery: string = '';
  public filteredGardens: any[] = [];
  public selectedGarden: any = null;
  public filters = {
    typeprojet: '',
    typeactivite: '',
    techniqueprod: ''
  };
  private urbanSpaces: any[] = [];
  public resultsCount: number = 0;

  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    this.loadMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove(); // Clean up the map instance
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
    if (this.map) {
      return; // Map is already initialized
    }

    this.map = L.map('map', {
      center: [46.603354, 1.888334],
      zoom: 10 // Niveau de zoom initial
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);


    this.markersLayerGroup = new window.L.MarkerClusterGroup(); // Initialize MarkerClusterGroup
    this.map.addLayer(this.markersLayerGroup); // Add to the map

    this.loadMarkers();

    this.getCurrentPosition().subscribe(
      (position: any) => {
        const userIcon = L.icon({
          iconUrl: 'assets/images/marker-icon.png',
          iconSize: [50, 50],
          iconAnchor: [25, 30],
          popupAnchor: [0, -50],
        });

        const userMarker = L.marker([position.latitude, position.longitude], { icon: userIcon });

        L.circle([position.latitude, position.longitude], {
          radius: Math.max(position.accuracy / 2, 100),         
          color: '#20493C',
          fillColor: '#20493C',
          fillOpacity: 0.2,
        }).addTo(this.map);

        userMarker.addTo(this.map);
        this.map.setView([position.latitude, position.longitude], 13); // Center the map on the user's location
      },
      (error: any) => {
        console.error('Failed to get user position:', error);
      }
    );
  }

  private loadMarkers(): void {
    this.http.get('https://www.observatoire-agriculture-urbaine.org/json/listsites.php?v=1720789221209')
      .subscribe(
        (data: any) => {
          this.urbanSpaces = data; // Store the urban spaces data
          this.applyFilters(); // Apply filters when the data is loaded
        },
        (error: any) => {
          console.error('Failed to load markers:', error);
        }
      );
  }

  private createPopupContent(garden: any): string {
    return `
      <div style="display: flex; align-items: center; max-width: 300px;">
        <img src="${garden.img}" alt="${garden.title}" style="width: 100px; height: auto; margin-right: 10px; border-radius: 8px;">
        <div>
          <h4 style="margin: 0; font-size: 16px;">${garden.title}</h4>
          <p style="margin: 5px 0;">${garden.ville}, ${garden.cp}</p>
          <p style="margin: 5px 0;"><strong>Type de projet:</strong> ${garden.list_typeprojet.join(', ')}</p>
          <p style="margin: 5px 0;"><strong>Activités:</strong> ${garden.list_typeactivite.join(', ')}</p>
          <p style="margin: 5px 0;"><strong>Techniques de production:</strong> ${garden.list_techniqueprod.join(', ')}</p>
          <p style="margin: 5px 0;"><strong>Types de production:</strong> ${garden.list_typeprod.join(', ')}</p>
        </div>
      </div>
    `;
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
    this.resultsCount = this.filteredGardens.length; // Update the number of results
    this.updateMapMarkers();
  }

  public resetFilters(): void {
    this.filters = {
      typeprojet: '',
      typeactivite: '',
      techniqueprod: ''
    };
    this.applyFilters();
  }

  private updateMapMarkers(): void {
    this.markersLayerGroup.clearLayers(); // Clear existing markers

    const gardenIcon = L.icon({
      iconUrl: 'assets/images/garden-icon.png',
      iconSize: [40, 40],
      iconAnchor: [35, 70], // Center the icon properly
      popupAnchor: [0, -70], // Adjust popup position relative to icon
    });

    this.filteredGardens.forEach((garden: any) => {
      const gardenMarker = L.marker([parseFloat(garden.lat), parseFloat(garden.lng)], { icon: gardenIcon })
        .bindPopup(this.createPopupContent(garden))
        .on('click', () => this.updatePopupContent(garden));

      this.markersLayerGroup.addLayer(gardenMarker); // Add to MarkerClusterGroup
    });
  }
}
