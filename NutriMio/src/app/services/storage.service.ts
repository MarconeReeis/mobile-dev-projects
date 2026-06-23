import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private ready = false;

  constructor(private readonly storage: Storage) {}

  async init(): Promise<void> {
    if (this.ready) {
      return;
    }

    await this.storage.create();
    this.ready = true;
  }

  async get<T>(key: string): Promise<T | null> {
    await this.ensureReady();
    return (await this.storage.get(key)) ?? null;
  }

  async set(key: string, value: unknown): Promise<void> {
    await this.ensureReady();
    await this.storage.set(key, value);
  }

  async remove(key: string): Promise<void> {
    await this.ensureReady();
    await this.storage.remove(key);
  }

  private async ensureReady(): Promise<void> {
    if (!this.ready) {
      await this.init();
    }
  }
}
