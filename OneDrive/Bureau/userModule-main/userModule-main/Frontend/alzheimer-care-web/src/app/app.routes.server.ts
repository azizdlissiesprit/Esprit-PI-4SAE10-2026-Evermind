import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'app/alerts/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'app/reclamations/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'app/backoffice/reclamations/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
