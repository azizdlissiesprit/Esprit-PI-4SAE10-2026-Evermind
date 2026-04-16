/**
 * 🎓 EXEMPLE RÉALISTE D'INTÉGRATION - À ADAPTER À VOTRE CODE
 * 
 * Cet exemple montre comment intégrer le tracking dans votre application EverMind
 * De manière pratique et réaliste
 */

import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TimeTrackerWidgetComponent } from '@app/features/formation/components/time-tracker-widget.component';
import { LearningDashboardComponent } from '@app/features/formation/components/learning-dashboard.component';
import { ActivityTrackingService } from '@app/core/services/activity-tracking.service';

/**
 * ═══════════════════════════════════════════════════════════════
 * EXEMPLE 1: Page de Course avec widget (RECOMMANDÉ)
 * ═══════════════════════════════════════════════════════════════
 */
@Component({
  selector: 'app-course-view-realistic',
  standalone: true,
  imports: [CommonModule, TimeTrackerWidgetComponent],
  template: `
    <div class="course-container">
      <!-- Header du cours -->
      <header class="course-header">
        <h1>{{ course?.title }}</h1>
        <p class="description">{{ course?.description }}</p>
      </header>

      <!-- 🎯 WIDGET DE SUIVI - AJOUT SIMPLE -->
      <section class="tracking-section">
        <app-time-tracker-widget 
          [userId]="currentUserId" 
          [courseId]="currentCourseId">
        </app-time-tracker-widget>
      </section>

      <!-- Contenu principal du cours -->
      <main class="course-content">
        
        <!-- Vidéo du cours -->
        <div class="video-container">
          <video #videoPlayer 
                 controls 
                 (play)="onVideoPlay()"
                 (pause)="onVideoPause()">
            <source [src]="course?.videoUrl" type="video/mp4">
            Votre navigateur ne supporte pas la vidéo HTML5
          </video>
        </div>

        <!-- Contenu textuel -->
        <article class="course-text">
          <h2>Contenu du cours</h2>
          <p [innerHTML]="course?.content"></p>
        </article>

        <!-- Ressources -->
        <section class="resources">
          <h3>📚 Ressources supplémentaires</h3>
          <ul>
            <li *ngFor="let resource of course?.resources">
              <a [href]="resource.url" target="_blank">
                {{ resource.title }}
              </a>
            </li>
          </ul>
        </section>

        <!-- Quiz -->
        <section class="quiz" *ngIf="course?.hasQuiz">
          <h3>✅ Quiz</h3>
          <button (click)="navigateToQuiz()">Démarrer le quiz</button>
        </section>

      </main>

      <!-- Barre de progression -->
      <aside class="sidebar">
        <div class="progress-panel">
          <h4>Votre progression</h4>
          <div class="progress-item">
            <label>Contenu regardé</label>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="videoProgress"></div>
            </div>
            <span class="percentage">{{ videoProgress }}%</span>
          </div>
        </div>
      </aside>
    </div>
  `,
  styles: [`
    .course-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      display: grid;
      grid-template-columns: 1fr 250px;
      gap: 20px;
    }

    .course-header {
      grid-column: 1 / -1;
      margin-bottom: 30px;
    }

    .course-header h1 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 32px;
    }

    .description {
      color: #666;
      font-size: 16px;
      margin: 0;
    }

    .tracking-section {
      grid-column: 1 / -1;
      margin-bottom: 30px;
    }

    .course-content {
      grid-column: 1;
    }

    .video-container {
      width: 100%;
      margin-bottom: 30px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    video {
      width: 100%;
      height: auto;
      display: block;
    }

    .course-text {
      line-height: 1.8;
      color: #555;
      margin-bottom: 30px;
    }

    .resources, .quiz {
      margin: 30px 0;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .resources h3, .quiz h3 {
      margin-top: 0;
      color: #333;
    }

    .resources ul {
      list-style: none;
      padding: 0;
    }

    .resources li {
      margin-bottom: 10px;
    }

    .resources a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .resources a:hover {
      text-decoration: underline;
    }

    .quiz button {
      padding: 12px 24px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .quiz button:hover {
      background: #764ba2;
      transform: translateY(-2px);
    }

    .sidebar {
      grid-column: 2;
      grid-row: 2 / -1;
      position: sticky;
      top: 20px;
    }

    .progress-panel {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .progress-panel h4 {
      margin-top: 0;
      color: #333;
    }

    .progress-item {
      margin-bottom: 15px;
    }

    .progress-item label {
      display: block;
      font-size: 12px;
      color: #666;
      margin-bottom: 6px;
      text-transform: uppercase;
    }

    .progress-bar {
      width: 100%;
      height: 6px;
      background: #eee;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transition: width 0.3s ease;
    }

    .percentage {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #667eea;
      margin-top: 6px;
    }

    @media (max-width: 768px) {
      .course-container {
        grid-template-columns: 1fr;
      }

      .sidebar {
        grid-column: 1;
        grid-row: auto;
        position: static;
      }

      .course-header h1 {
        font-size: 24px;
      }
    }
  `]
})
export class CourseViewComponent implements OnInit, OnDestroy {
  @Input() courseId: number = 5;
  
  currentUserId: number = 1;  // À récupérer du service auth
  currentCourseId: number = 5;
  
  course: any = {
    title: 'Introduction à l\'apprentissage supervisé',
    description: 'Découvrez les fondamentaux du machine learning',
    videoUrl: '/assets/course-video.mp4',
    content: 'Contenu détaillé du cours...',
    resources: [
      { title: 'PDF de cours', url: '/docs/cours.pdf' },
      { title: 'Exercices pratiques', url: '/docs/exercices.pdf' }
    ],
    hasQuiz: true
  };

  videoProgress: number = 0;

  constructor(
    private activityTracking: ActivityTrackingService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID du cours depuis les paramètres de route
    this.route.params.subscribe(params => {
      this.currentCourseId = params['courseId'] || 5;
    });

    // Récupérer l'ID utilisateur du service auth
    // this.currentUserId = this.authService.getCurrentUserId();

    console.log(`🎓 Chargement du cours ${this.currentCourseId} pour l'utilisateur ${this.currentUserId}`);
  }

  ngOnDestroy(): void {
    // Le service s'arrête automatiquement
    console.log('👋 Utilisateur quitte la page du cours');
  }

  onVideoPlay(): void {
    console.log('▶️ Vidéo en lecture');
    // Vous pouvez ici envoyer un événement supplémentaire si nécessaire
  }

  onVideoPause(): void {
    console.log('⏸️ Vidéo en pause');
  }

  navigateToQuiz(): void {
    console.log('📝 Navigation vers le quiz');
    // router.navigate(['/quiz', this.currentCourseId]);
  }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * EXEMPLE 2: Page de Stats Utilisateur avec Dashboard Complet
 * ═══════════════════════════════════════════════════════════════
 */
@Component({
  selector: 'app-user-learning-stats',
  standalone: true,
  imports: [CommonModule, LearningDashboardComponent],
  template: `
    <div class="stats-page">
      <header class="page-header">
        <h1>Mon espace d'apprentissage</h1>
        <p>Suivez votre progression et consultez vos statistiques</p>
      </header>

      <!-- 🎯 DASHBOARD COMPLET -->
      <section class="dashboard-section">
        <app-learning-dashboard 
          [userId]="currentUserId" 
          [courseId]="currentCourseId">
        </app-learning-dashboard>
      </section>

      <!-- Recommandations -->
      <section class="recommendations">
        <h2>💡 Recommandations</h2>
        <div class="recommendation-cards">
          <div class="rec-card">
            <h3>Maintenez la régularité</h3>
            <p>Pour des meilleurs résultats, étudiez au moins 30 minutes par jour.</p>
            <button class="btn-secondary">En savoir plus</button>
          </div>
          <div class="rec-card">
            <h3>Prenez des pauses</h3>
            <p>Notre système détecte les pauses. C'est normal et bon pour la santé!</p>
            <button class="btn-secondary">Conseils de pause</button>
          </div>
          <div class="rec-card">
            <h3>Testez vos connaissances</h3>
            <p>Les quiz aident à mémoriser. Complétez tous les quizz disponibles.</p>
            <button class="btn-secondary">Voir les quiz</button>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .stats-page {
      padding: 40px 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }

    .page-header {
      text-align: center;
      margin-bottom: 50px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 40px;
      color: #333;
    }

    .page-header p {
      margin: 10px 0 0 0;
      color: #666;
      font-size: 18px;
    }

    .dashboard-section {
      max-width: 1200px;
      margin: 0 auto 50px;
    }

    .recommendations {
      max-width: 1200px;
      margin: 0 auto;
    }

    .recommendations h2 {
      color: #333;
      margin-bottom: 30px;
      font-size: 24px;
    }

    .recommendation-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .rec-card {
      background: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .rec-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .rec-card h3 {
      margin-top: 0;
      color: #667eea;
      font-size: 18px;
    }

    .rec-card p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 15px;
    }

    .btn-secondary {
      padding: 10px 20px;
      border: 2px solid #667eea;
      background: white;
      color: #667eea;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      background: #667eea;
      color: white;
    }
  `]
})
export class UserLearningStatsComponent implements OnInit {
  currentUserId: number = 1;
  currentCourseId: number = 5;

  ngOnInit(): void {
    console.log('📊 Page de statistiques chargée');
  }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * EXEMPLE 3: Module de Formation avec Multiples Cours
 * ═══════════════════════════════════════════════════════════════
 */
@Component({
  selector: 'app-formation-module',
  standalone: true,
  imports: [CommonModule, TimeTrackerWidgetComponent],
  template: `
    <div class="formation-module">
      <h1>Module: {{ moduleName }}</h1>
      
      <div class="courses-grid">
        <div class="course-card" *ngFor="let course of courses">
          <h3>{{ course.title }}</h3>
          
          <!-- Widget par cours -->
          <app-time-tracker-widget 
            [userId]="currentUserId" 
            [courseId]="course.id">
          </app-time-tracker-widget>

          <p>{{ course.description }}</p>
          <button (click)="openCourse(course.id)">Accéder au cours</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .formation-module {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .courses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
      margin-top: 30px;
    }

    .course-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .course-card h3 {
      margin-top: 0;
      color: #333;
    }

    .course-card p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 15px;
    }

    .course-card button {
      width: 100%;
      padding: 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      margin-top: 15px;
    }

    .course-card button:hover {
      background: #764ba2;
    }
  `]
})
export class FormationModuleComponent implements OnInit {
  currentUserId: number = 1;
  moduleName: string = 'Formation Complète - Alzheimer Care';
  
  courses = [
    { id: 1, title: 'Introduction', description: 'Les bases de la formation' },
    { id: 2, title: 'Module 1', description: 'Concepts fondamentaux' },
    { id: 3, title: 'Module 2', description: 'Pratiques avancées' },
    { id: 4, title: 'Module 3', description: 'Cas d\'étude réels' }
  ];

  ngOnInit(): void {
    console.log('📚 Module de formation chargé');
  }

  openCourse(courseId: number): void {
    console.log(`📖 Ouverture du cours ${courseId}`);
    // router.navigate(['/course', courseId]);
  }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * UTILISATION DANS LES ROUTES (app.routes.ts)
 * ═══════════════════════════════════════════════════════════════
 * 
 * export const routes: Routes = [
 *   {
 *     path: 'course/:courseId',
 *     component: CourseViewComponent
 *   },
 *   {
 *     path: 'stats',
 *     component: UserLearningStatsComponent
 *   },
 *   {
 *     path: 'formation/:moduleId',
 *     component: FormationModuleComponent
 *   }
 * ];
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * POINTS CLÉ À RETENIR
 * ═══════════════════════════════════════════════════════════════
 * 
 * 1. ✅ Importer les composants et services:
 *    import { TimeTrackerWidgetComponent } from '@app/features/formation/components/...';
 *    import { ActivityTrackingService } from '@app/core/services/activity-tracking.service';
 * 
 * 2. ✅ Ajouter au imports du composant:
 *    @Component({
 *      imports: [TimeTrackerWidgetComponent]
 *    })
 * 
 * 3. ✅ Utiliser dans le template:
 *    <app-time-tracker-widget [userId]="userId" [courseId]="courseId"></app-time-tracker-widget>
 * 
 * 4. ✅ Le tracking démarre automatiquement quand le composant se charge
 *    Le tracking s'arrête automatiquement quand le composant se détruit
 * 
 * 5. ✅ Pour plus de contrôle, injecter le service:
 *    constructor(private tracking: ActivityTrackingService) {}
 * 
 * 6. ✅ Vous n'avez RIEN à faire manuellement:
 *    - Les pings se font tout seul
 *    - L'inactivité se détecte automatiquement
 *    - Les sessions se ferment automatiquement
 * 
 * 🎉 C'est prêt à l'emploi!
 */
