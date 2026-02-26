import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch,withInterceptors } from '@angular/common/http'; // <--- THIS WAS MISSING
import { authInterceptor } from './core/interceptors/auth.interceptor'; 
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Now this will work because the import exists above
    provideHttpClient(withFetch(),withInterceptors([authInterceptor])),
    provideCharts(withDefaultRegisterables()),
    
    provideClientHydration(withEventReplay())
  ]
};