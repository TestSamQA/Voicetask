import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationDto } from '../../shared/models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationHubService {
  private hub: HubConnection | null = null;
  readonly notification$ = new Subject<NotificationDto>();

  async connect(accessToken: string): Promise<void> {
    if (this.hub) await this.disconnect();
    this.hub = new HubConnectionBuilder()
      .withUrl(environment.hubUrl, { accessTokenFactory: () => accessToken })
      .withAutomaticReconnect()
      .build();
    this.hub.on('Notification', (dto: NotificationDto) => this.notification$.next(dto));
    await this.hub.start();
  }

  async disconnect(): Promise<void> {
    if (this.hub) {
      await this.hub.stop();
      this.hub = null;
    }
  }
}
