import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Dynamic routes: render on server per request (no prerender)
  { path: 'app/alerts/:id', renderMode: RenderMode.Server },
  { path: 'app/user-interface/programme/:id', renderMode: RenderMode.Server },
  { path: 'app/user-interface/programme/:programmeId/module/:moduleId', renderMode: RenderMode.Server },
  { path: 'app/user-interface/quiz/:moduleId', renderMode: RenderMode.Server },
  // Static routes: prerender
  { path: '**', renderMode: RenderMode.Prerender }
];
