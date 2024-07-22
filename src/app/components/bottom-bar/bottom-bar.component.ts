// src/app/components/bottom-bar/bottom-bar.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bottom-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-bar.component.html',
  styleUrl: './bottom-bar.component.css'
})
export class BottomBarComponent {
  constructor(private router: Router) {}
  navigateTo(path: string) {
    this.router.navigate([`/${path}`]);

  }


}
