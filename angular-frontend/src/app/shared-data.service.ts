import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  private data: any = {};

  set(key: string, value: any) {
    this.data[key] = value;
  }

  get(key: string): any {
    return this.data[key];
  }

  clear(key: string) {
    delete this.data[key];
  }

  clearAll() {
    this.data = {};
  }
}
