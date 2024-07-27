import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscriber } from 'rxjs';
import * as L from 'leaflet';
import 'leaflet.fullscreen'; // Import the fullscreen plugin
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  standalone: true,
  imports: [FormsModule]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private markersLayerGroup!: L.LayerGroup;
  private markers: L.Marker[] = [];
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
      zoom: 6,
      layers: [
        L.tileLayer('https://api.mapbox.com/styles/v1/chainez-mlh/clu751mt600dd01pieymr79xk/tiles/{z}/{x}/{y}?access_token=' + environment.mapbox.accessToken, {
          attribution: '',
          maxZoom: 18,
          tileSize: 512,
          zoomOffset: -1
        })
      ]
    });

    this.markersLayerGroup = L.layerGroup().addTo(this.map);

    this.loadMarkers();

    this.getCurrentPosition().subscribe(
      (position: any) => {
        const userIcon = L.icon({
          iconUrl: 'assets/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        });

        const userMarker = L.marker([position.latitude, position.longitude], { icon: userIcon });

        L.circle([position.latitude, position.longitude], {
          radius: position.accuracy / 2,
          color: 'red',
          fillColor: 'red',
          fillOpacity: 0.2,
        }).addTo(this.map);

        userMarker.addTo(this.map);
        this.map.setView([position.latitude, position.longitude], 13); // Center the map on the user's location
      },
      (error: any) => {
        console.error('Failed to get user position:', error);
      }
    );

    this.map.on('zoomend', () => this.updateClusters());
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
    this.resultsCount = this.filteredGardens.length; // Update the number of results
    this.updateClusters();
  }

  public resetFilters(): void {
    this.filters = {
      typeprojet: '',
      typeactivite: '',
      techniqueprod: ''
    };
    this.applyFilters();
  }

  private updateClusters(): void {
    this.markersLayerGroup.clearLayers();

    const zoomLevel = this.map.getZoom();
    const maxZoomForClusters = 12; // Define a max zoom level for clustering

    if (zoomLevel <= maxZoomForClusters) {
      // Group markers based on their proximity for clustering effect
      this.createClusters();
    } else {
      // Show individual markers if zoomed in
      this.filteredGardens.forEach((garden: any) => {
        const gardenMarker = L.marker([parseFloat(garden.lat), parseFloat(garden.lng)], { icon: this.getGardenIcon() })
          .bindPopup(this.createPopupContent(garden))
          .on('click', () => this.updatePopupContent(garden));

        gardenMarker.addTo(this.markersLayerGroup);
      });
    }
  }

  private createClusters(): void {
    const markerGroups: L.Marker[][] = [];
    const clusterRadius = 0.05; // Approximate distance to group markers into clusters

    this.filteredGardens.forEach((garden: any) => {
      const position = L.latLng(parseFloat(garden.lat), parseFloat(garden.lng));
      let addedToCluster = false;

      markerGroups.forEach(group => {
        if (group.length > 0 && position.distanceTo(group[0].getLatLng()) < clusterRadius * 100000) {
          group.push(this.createMarker(garden));
          addedToCluster = true;
        }
      });

      if (!addedToCluster) {
        markerGroups.push([this.createMarker(garden)]);
      }
    });

    markerGroups.forEach(group => {
      if (group.length === 1) {
        group[0].addTo(this.markersLayerGroup);
      } else {
        this.addClusterToMap(group);
      }
    });
  }

  private createMarker(garden: any): L.Marker {
    return L.marker([parseFloat(garden.lat), parseFloat(garden.lng)], { icon: this.getGardenIcon() })
      .bindPopup(this.createPopupContent(garden))
      .on('click', () => this.updatePopupContent(garden));
  }

  private addClusterToMap(group: L.Marker[]): void {
    const clusterGroup = L.layerGroup(group);
    clusterGroup.addTo(this.markersLayerGroup);

    // Optional: Create a custom icon or popup for the cluster
    const clusterIcon = L.divIcon({
      className: 'cluster-icon',
      html: `<div>${group.length}</div>`,
      iconSize: [40, 40]
    });

    const clusterMarker = L.marker(group[0].getLatLng(), { icon: clusterIcon });
    clusterMarker.bindPopup(`Group of ${group.length} markers`);
    clusterMarker.addTo(this.markersLayerGroup);
  }

  private getGardenIcon(): L.Icon {
    return L.icon({
      iconUrl: 'assets/images/garden-icon.png',
      iconSize: [70, 70],
      iconAnchor: [35, 70], // Center the icon properly
      popupAnchor: [0, -70], // Adjust popup position relative to icon
    });
  }
}
