import { isDevMode } from '@angular/core';

export const API_URL = isDevMode()
  ? 'http://localhost:4200'
  : 'https://patricio-capparelli-tp2-prog4-2026-c2.onrender.com/';
