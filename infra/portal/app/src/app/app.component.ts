import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { KeycloakProfile } from 'keycloak-js';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Portal Dashboard';
  isAuthenticated = false;
  profile?: KeycloakProfile;
  tokenClaims: Record<string, unknown> | null = null;
  partnerReady = false;
  partnerConnectLoading = false;
  partnerError?: string;
  private handshakeWindow: Window | null = null;
  private handshakeWatcher?: number;

  private readonly messageHandler = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) {
      return;
    }
    if (event.data?.type === 'oidc-token-response' || event.data?.type === 'partner-handshake-complete') {
      this.partnerReady = true;
      this.partnerConnectLoading = false;
      this.partnerError = undefined;
      this.closeHandshakeWindow();
    }
  };

  constructor(private readonly keycloak: KeycloakService) {}

  async ngOnInit(): Promise<void> {
    window.addEventListener('message', this.messageHandler);
    this.isAuthenticated = await this.keycloak.isLoggedIn();
    if (this.isAuthenticated) {
      this.profile = await this.keycloak.loadUserProfile();
      this.tokenClaims = this.keycloak.getKeycloakInstance().tokenParsed ?? null;
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.messageHandler);
    this.clearHandshakeWatcher();
  }

  connectPartnerSession(): void {
    if (!this.isAuthenticated || this.partnerReady || this.partnerConnectLoading) {
      return;
    }
    this.partnerConnectLoading = true;
    this.partnerError = undefined;
    const popup = window.open(
      '/partner/?popup_handshake=true',
      'partner-handshake',
      'width=460,height=640'
    );
    if (!popup) {
      this.partnerConnectLoading = false;
      this.partnerError = 'Popup blocked. Allow popups for portal.localhost and try again.';
      return;
    }
    this.handshakeWindow = popup;
    this.clearHandshakeWatcher();
    this.handshakeWatcher = window.setInterval(() => {
      if (!this.handshakeWindow || this.handshakeWindow.closed) {
        this.clearHandshakeWatcher();
        this.handshakeWindow = null;
        if (!this.partnerReady) {
          this.partnerConnectLoading = false;
          this.partnerError = 'Partner authentication was cancelled. Please try again.';
        }
      }
    }, 500);
  }

  logout(): Promise<void> {
    return this.keycloak.logout(window.location.origin);
  }

  private closeHandshakeWindow(): void {
    if (this.handshakeWindow && !this.handshakeWindow.closed) {
      this.handshakeWindow.close();
    }
    this.handshakeWindow = null;
    this.clearHandshakeWatcher();
  }

  private clearHandshakeWatcher(): void {
    if (this.handshakeWatcher !== undefined) {
      window.clearInterval(this.handshakeWatcher);
      this.handshakeWatcher = undefined;
    }
  }
}
