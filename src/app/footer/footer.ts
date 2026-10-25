import { Component } from '@angular/core';

import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';

@Component({
  imports: [MatDivider, MatIcon, MatToolbar],
  selector: 'app-footer',
  styleUrl: './footer.scss',
  templateUrl: './footer.html',
})
export class Footer {
  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}
