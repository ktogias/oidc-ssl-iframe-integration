import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { KeycloakProfile } from 'keycloak-js';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'Portal Dashboard';
  isAuthenticated = false;
  profile?: KeycloakProfile;
  tokenClaims: Record<string, unknown> | null = null;

  constructor(private readonly keycloak: KeycloakService) {}

  async ngOnInit(): Promise<void> {
    this.isAuthenticated = await this.keycloak.isLoggedIn();
    if (this.isAuthenticated) {
      this.profile = await this.keycloak.loadUserProfile();
      this.tokenClaims = this.keycloak.getKeycloakInstance().tokenParsed ?? null;
    }
  }

  logout(): Promise<void> {
    return this.keycloak.logout(window.location.origin);
  }
}
