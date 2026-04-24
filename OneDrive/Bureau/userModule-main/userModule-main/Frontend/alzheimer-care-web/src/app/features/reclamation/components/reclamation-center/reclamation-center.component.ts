import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  Input,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AdminUser } from '../../../../core/models/admin-user.model';
import {
  AttachmentType,
  CreateReclamationRequest,
  Reclamation,
  ReclamationAttachment,
  ReclamationCategory,
  ReclamationComment,
  ReclamationHistoryEvent,
  ReclamationPriority,
  ReclamationStatus
} from '../../../../core/models/reclamation.model';
import { ReclamationService } from '../../../../core/services/reclamation.service';
import { UsersService } from '../../../../core/services/users.service';
import { AuthService } from '../../../../core/services/auth.service';
import { getRoleReclamationsRoute } from '../../../../core/utils/role-routing';

type WorkspaceMode = 'user' | 'admin';
type WorkspaceView = 'list' | 'detail' | 'create';

@Component({
  selector: 'app-reclamation-center',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule
  ],
  templateUrl: './reclamation-center.component.html',
  styleUrls: ['./reclamation-center.component.scss']
})
export class ReclamationCenterComponent implements OnInit, OnDestroy {
  private readonly descriptionSuggestionsByCategory: Record<ReclamationCategory, string[]> = {
    [ReclamationCategory.TECHNIQUE]: [
      'Le bracelet GPS ne remonte plus la position du patient depuis ce matin.',
      'Le capteur ne transmet plus les alertes de chute dans l application.',
      'Je rencontre un probleme de synchronisation des donnees medicales.',
      'Une erreur apparait lors de l envoi de la reclamation depuis l application.'
    ],
    [ReclamationCategory.SERVICE]: [
      'Je n ai recu aucun retour du service apres ma derniere demande.',
      'Le suivi de mon dossier prend trop de temps malgre plusieurs relances.',
      'Je souhaite signaler un manque de reactivite dans la prise en charge.',
      'Le rendez-vous prevu avec le service a ete annule sans explication.'
    ],
    [ReclamationCategory.FACTURATION]: [
      'Je constate une anomalie dans la facture de ce mois.',
      'Un montant supplementaire a ete preleve sans explication claire.',
      'Je souhaite une verification du detail de la facturation du service.',
      'La facture affiche un abonnement qui ne correspond pas a mon contrat.'
    ],
    [ReclamationCategory.SECURITE]: [
      'Le bouton SOS ne reagit pas correctement en situation d urgence.',
      'Les notifications critiques n apparaissent plus sur le telephone de l aidant.',
      'Je souhaite signaler un probleme de securite dans le suivi du patient.',
      'Une alerte importante n a pas ete envoyee alors que l incident a eu lieu.'
    ],
    [ReclamationCategory.FONCTIONNALITE]: [
      'Je n arrive plus a consulter le profil du patient dans l application.',
      'Certaines fonctionnalites du tableau de bord ne repondent plus.',
      'Le message vocal enregistre ne peut pas etre lu apres envoi.',
      'Je propose une amelioration du parcours de creation de reclamation.'
    ],
    [ReclamationCategory.AUTRE]: [
      'Je souhaite signaler un probleme general lie a l utilisation de la plateforme.',
      'Une situation inhabituelle impacte mon suivi et necessite une verification.',
      'Je rencontre une difficulte qui ne correspond a aucune categorie proposee.',
      'Je souhaite transmettre un retour important concernant mon experience utilisateur.'
    ]
  };

  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reclamationService = inject(ReclamationService);
  private readonly usersService = inject(UsersService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  @Input({ required: true }) mode: WorkspaceMode = 'user';
  @Input() view: WorkspaceView = 'list';

  readonly reclamationStatus = ReclamationStatus;
  readonly categoryOptions = Object.values(ReclamationCategory);
  readonly priorityOptions = Object.values(ReclamationPriority);
  readonly statusFilterOptions = ['ALL', ...Object.values(ReclamationStatus)] as const;
  readonly dateFilterOptions = ['ALL', 'TODAY'] as const;
  readonly sortOptions = ['NEWEST', 'OLDEST', 'PRIORITY'] as const;

  currentUser: AdminUser | null = null;

  reclamations: Reclamation[] = [];
  filteredReclamations: Reclamation[] = [];

  selectedReclamation: Reclamation | null = null;
  selectedAttachments: ReclamationAttachment[] = [];
  selectedComments: ReclamationComment[] = [];
  selectedHistory: ReclamationHistoryEvent[] = [];

  attachmentPreviewUrls: Record<number, string> = {};
  selectedStatusFilter: (typeof this.statusFilterOptions)[number] = 'ALL';
  selectedDateFilter: (typeof this.dateFilterOptions)[number] = 'ALL';
  selectedSort: (typeof this.sortOptions)[number] = 'NEWEST';
  searchTerm = '';
  currentPage = 1;
  readonly pageSize = 6;

  isLoading = true;
  isDetailLoading = false;
  isSubmittingCreate = false;
  isSavingAdmin = false;
  isSendingMessage = false;
  isUploadingAttachment = false;
  isRecording = false;

  workspaceError = '';
  detailError = '';
  recordingError = '';
  selectedOwnerName = '';
  isChatOpen = false;
  descriptionSuggestion = '';

  createAttachments: File[] = [];
  recordedAudioBlob: Blob | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;
  private recordingChunks: Blob[] = [];
  private refreshIntervalId: number | null = null;
  private routeReclamationId: number | null = null;

  readonly createForm = this.fb.group({
    subject: ['', [Validators.required, Validators.maxLength(200)]],
    category: [ReclamationCategory.TECHNIQUE, Validators.required],
    priority: [ReclamationPriority.MOYENNE, Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]]
  });

  readonly adminUpdateForm = this.fb.group({
    status: [ReclamationStatus.EN_ATTENTE, Validators.required],
    response: ['']
  });

  readonly messageForm = this.fb.group({
    message: ['', [Validators.required, Validators.maxLength(5000)]]
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const rawId = params.get('id');
      this.routeReclamationId = rawId ? Number(rawId) : null;
      this.tryOpenRouteReclamation();
    });

    this.loadCurrentUser();
  }

  ngOnDestroy(): void {
    this.stopLiveRefresh();
    this.stopRecordingTracks();
    this.clearAttachmentPreviews();
  }

  get title(): string {
    if (this.isCreateView) {
      return 'Nouvelle Reclamation';
    }
    return this.mode === 'admin' ? 'Pilotage des Reclamations' : 'Mes Reclamations';
  }

  get subtitle(): string {
    if (this.isCreateView) {
      return 'Cree une reclamation et joins les fichiers utiles.';
    }
    return this.mode === 'admin'
      ? 'Suivi des reclamations, statuts et echanges.'
      : 'Suivi de vos reclamations et des echanges avec l administration.';
  }

  get canCreate(): boolean {
    return this.mode === 'user';
  }

  get canModerate(): boolean {
    return this.mode === 'admin';
  }

  get isDetailView(): boolean {
    return this.view === 'detail';
  }

  get isCreateView(): boolean {
    return this.view === 'create';
  }

  get openReclamationCount(): number {
    return this.reclamations.filter(
      (item) =>
        item.status !== ReclamationStatus.RESOLUE && item.status !== ReclamationStatus.REJETEE
    ).length;
  }

  get resolvedReclamationCount(): number {
    return this.reclamations.filter((item) => item.status === ReclamationStatus.RESOLUE).length;
  }

  get selectedAudioLabel(): string {
    if (this.recordedAudioBlob) return 'Message vocal pret';
    return 'Aucun audio enregistre';
  }

  get pendingReclamationCount(): number {
    return this.reclamations.filter((item) => item.status === ReclamationStatus.EN_ATTENTE).length;
  }

  get inProgressReclamationCount(): number {
    return this.reclamations.filter((item) => item.status === ReclamationStatus.EN_COURS).length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredReclamations.length / this.pageSize));
  }

  get pagedReclamations(): Reclamation[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredReclamations.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  get paginationLabel(): string {
    if (!this.filteredReclamations.length) {
      return '0 resultat';
    }

    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.filteredReclamations.length);
    return `${start}-${end} sur ${this.filteredReclamations.length}`;
  }

  get displayedColumns(): string[] {
    const columns = ['subject', 'category', 'status', 'priority', 'createdAt'];
    if (this.mode === 'user') {
      columns.push('actions');
    }
    return columns;
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.applyFilters();
  }

  onSearchInput(event: Event): void {
    this.onSearchChange((event.target as HTMLInputElement | null)?.value || '');
  }

  onStatusFilterChange(value: string): void {
    this.selectedStatusFilter = value as (typeof this.statusFilterOptions)[number];
    this.applyFilters();
  }

  onStatusFilterInput(event: Event): void {
    this.onStatusFilterChange((event.target as HTMLSelectElement | null)?.value || 'ALL');
  }

  onDateFilterChange(value: string): void {
    this.selectedDateFilter = value as (typeof this.dateFilterOptions)[number];
    this.applyFilters();
  }

  onCreateCategoryChange(category: ReclamationCategory): void {
    this.createForm.patchValue({ category });
    this.updateDescriptionSuggestion(this.createForm.getRawValue().description ?? '');
  }

  onSortChange(value: string): void {
    this.selectedSort = value as (typeof this.sortOptions)[number];
    this.applyFilters();
  }

  onCreateAttachmentsSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.createAttachments = input.files ? Array.from(input.files) : [];
  }

  onDescriptionInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement | null)?.value ?? '';
    this.updateDescriptionSuggestion(value);
  }

  onDescriptionKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !this.descriptionSuggestion) {
      return;
    }

    event.preventDefault();
    const currentValue = this.createForm.getRawValue().description ?? '';
    const nextValue = `${currentValue}${this.descriptionSuggestion}`;
    this.createForm.patchValue({ description: nextValue });
    this.descriptionSuggestion = '';
  }

  onDetailAttachmentsSelected(event: Event): void {
    if (!this.selectedReclamation) return;

    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    if (!files.length) return;

    this.isUploadingAttachment = true;
    forkJoin(
      files.map((file) =>
        this.reclamationService.uploadAttachment(this.selectedReclamation!.reclamationId, file)
      )
    )
      .pipe(finalize(() => (this.isUploadingAttachment = false)))
      .subscribe({
        next: () => this.loadSelectedResources(this.selectedReclamation!.reclamationId),
        error: () => {
          this.detailError = 'Impossible de televerser les pieces jointes.';
        }
      });
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const value = this.createForm.getRawValue();
    const request: CreateReclamationRequest = {
      userId: this.currentUser?.userId ?? null,
      subject: value.subject ?? '',
      description: value.description ?? '',
      category: value.category ?? ReclamationCategory.TECHNIQUE,
      priority: value.priority ?? ReclamationPriority.MOYENNE
    };

    this.isSubmittingCreate = true;
    this.workspaceError = '';

    this.reclamationService
      .createReclamation(request)
      .pipe(finalize(() => (this.isSubmittingCreate = false)))
      .subscribe({
        next: (created) => {
          this.uploadPendingCreateAttachments(created.reclamationId);
          this.createForm.reset({
            category: ReclamationCategory.TECHNIQUE,
            priority: ReclamationPriority.MOYENNE,
            subject: '',
            description: ''
          });
          this.descriptionSuggestion = '';
          this.createAttachments = [];
          this.recordedAudioBlob = null;
          this.loadWorkspace();
          if (this.isCreateView) {
            this.router.navigate([this.getDetailRoute(created.reclamationId)]);
          } else {
            this.openReclamation(created);
          }
        },
        error: () => {
          this.workspaceError = 'Impossible de creer la reclamation.';
        }
      });
  }

  openReclamation(reclamation: Reclamation): void {
    if (!this.isDetailView) {
      this.router.navigate([this.getDetailRoute(reclamation.reclamationId)]);
      return;
    }

    this.selectedReclamation = reclamation;
    this.isChatOpen = false;
    this.detailError = '';
    this.messageForm.reset();
    this.adminUpdateForm.patchValue({
      status: reclamation.status,
      response: reclamation.response ?? ''
    });
    this.loadSelectedResources(reclamation.reclamationId);
    this.startLiveRefresh();
  }

  saveAdminUpdate(): void {
    if (!this.selectedReclamation || this.adminUpdateForm.invalid) return;

    const value = this.adminUpdateForm.getRawValue();
    this.isSavingAdmin = true;
    this.detailError = '';

    this.reclamationService
      .updateReclamation(this.selectedReclamation.reclamationId, {
        status: value.status ?? undefined,
        response: value.response?.trim() || null,
        respondedBy: this.currentUser?.userId ?? null
      })
      .pipe(finalize(() => (this.isSavingAdmin = false)))
      .subscribe({
        next: (updated) => {
          this.mergeUpdatedReclamation(updated);
          this.openReclamation(updated);
        },
        error: () => {
          this.detailError = 'Impossible de mettre a jour la reclamation.';
        }
      });
  }

  submitMessage(): void {
    if (!this.selectedReclamation || this.messageForm.invalid) {
      this.messageForm.markAllAsTouched();
      return;
    }

    this.isSendingMessage = true;
    this.detailError = '';

    this.reclamationService
      .addComment(this.selectedReclamation.reclamationId, {
        senderId: this.currentUser?.userId ?? null,
        message: this.messageForm.getRawValue().message ?? ''
      })
      .pipe(finalize(() => (this.isSendingMessage = false)))
      .subscribe({
        next: () => {
          this.messageForm.reset();
          this.loadSelectedComments(this.selectedReclamation!.reclamationId);
        },
        error: () => {
          this.detailError = 'Impossible d envoyer le message.';
        }
      });
  }

  deleteAttachment(attachment: ReclamationAttachment): void {
    if (!this.selectedReclamation) return;

    this.reclamationService.deleteAttachment(attachment.attachmentId).subscribe({
      next: () => this.loadSelectedAttachments(this.selectedReclamation!.reclamationId)
    });
  }

  downloadAttachment(attachment: ReclamationAttachment): void {
    this.reclamationService.downloadAttachment(attachment.attachmentId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.originalFileName;
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  }

  async startRecording(): Promise<void> {
    this.recordingError = '';

    if (!navigator.mediaDevices?.getUserMedia) {
      this.recordingError = 'Le navigateur ne supporte pas l enregistrement audio.';
      return;
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.recordingChunks = [];
      this.mediaRecorder = new MediaRecorder(this.mediaStream);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordingChunks.push(event.data);
        }
      };
      this.mediaRecorder.onstop = () => {
        this.recordedAudioBlob = new Blob(this.recordingChunks, { type: 'audio/webm' });
        this.stopRecordingTracks();
      };
      this.mediaRecorder.start();
      this.isRecording = true;
    } catch {
      this.recordingError = 'Impossible d acceder au microphone.';
    }
  }

  stopRecording(): void {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') return;
    this.mediaRecorder.stop();
    this.isRecording = false;
  }

  clearRecordedAudio(): void {
    this.recordedAudioBlob = null;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      ALL: 'Tous',
      EN_ATTENTE: 'En attente',
      EN_COURS: 'En cours',
      RESOLUE: 'Resolue',
      REJETEE: 'Rejetee'
    };
    return labels[status] || status;
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      BASSE: 'Basse',
      MOYENNE: 'Moyenne',
      HAUTE: 'Haute',
      URGENTE: 'Urgente'
    };
    return labels[priority] || priority;
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      TECHNIQUE: 'Technique',
      SERVICE: 'Service',
      FACTURATION: 'Facturation',
      SECURITE: 'Securite',
      FONCTIONNALITE: 'Fonctionnalite',
      AUTRE: 'Autre'
    };
    return labels[category] || category;
  }

  getStatusClass(status: ReclamationStatus): string {
    switch (status) {
      case ReclamationStatus.EN_ATTENTE:
        return 'pending';
      case ReclamationStatus.EN_COURS:
        return 'progress';
      case ReclamationStatus.RESOLUE:
        return 'resolved';
      case ReclamationStatus.REJETEE:
        return 'rejected';
      default:
        return 'pending';
    }
  }

  getPriorityClass(priority: ReclamationPriority): string {
    switch (priority) {
      case ReclamationPriority.BASSE:
        return 'low';
      case ReclamationPriority.MOYENNE:
        return 'medium';
      case ReclamationPriority.HAUTE:
        return 'high';
      case ReclamationPriority.URGENTE:
        return 'urgent';
      default:
        return 'medium';
    }
  }

  isAudioAttachment(attachment: ReclamationAttachment): boolean {
    return (
      attachment.attachmentType === AttachmentType.AUDIO ||
      attachment.contentType?.toLowerCase().startsWith('audio/')
    );
  }

  isImageAttachment(attachment: ReclamationAttachment): boolean {
    return (
      attachment.attachmentType === AttachmentType.IMAGE ||
      attachment.contentType?.toLowerCase().startsWith('image/')
    );
  }

  getAttachmentPreviewUrl(attachmentId: number): string | null {
    return this.attachmentPreviewUrls[attachmentId] || null;
  }

  isOutgoingComment(comment: ReclamationComment): boolean {
    return this.mode === 'admin' ? comment.senderRole === 'ADMIN' : comment.senderRole !== 'ADMIN';
  }

  getCommentAuthorLabel(comment: ReclamationComment): string {
    if (comment.senderRole === 'ADMIN') {
      return this.mode === 'admin'
        ? this.currentUserDisplayName
        : 'Administration';
    }

    return this.mode === 'admin'
      ? this.selectedOwnerName || 'Client'
      : this.currentUserDisplayName;
  }

  get currentUserDisplayName(): string {
    const first = this.currentUser?.firstName?.trim() || '';
    const last = this.currentUser?.lastName?.trim() || '';
    return `${first} ${last}`.trim() || 'Vous';
  }

  get selectedOwnerDisplayName(): string {
    if (this.mode === 'user') {
      return this.currentUserDisplayName;
    }

    return this.selectedOwnerName || 'Client';
  }

  get chatPresenceLabel(): string {
    return this.mode === 'admin' ? 'Canal reclamation actif' : 'Administration disponible';
  }

  getChatAvatarLabel(comment?: ReclamationComment): string {
    const name = comment ? this.getCommentAuthorLabel(comment) : this.selectedOwnerDisplayName;
    return this.getInitials(name);
  }

  toggleChatPanel(): void {
    this.isChatOpen = !this.isChatOpen;
  }

  getBackRoute(): string {
    return this.mode === 'admin'
      ? getRoleReclamationsRoute('ADMIN')
      : getRoleReclamationsRoute(this.authService.getRole());
  }

  getCreateRoute(): string {
    return `${this.getBackRoute()}/new`;
  }

  getDetailRoute(reclamationId: number): string {
    return getRoleReclamationsRoute(
      this.mode === 'admin' ? 'ADMIN' : this.authService.getRole(),
      reclamationId
    );
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
  }

  canDeleteReclamation(reclamation: Reclamation): boolean {
    return (
      this.mode === 'user' &&
      reclamation.status === ReclamationStatus.EN_ATTENTE &&
      !reclamation.response
    );
  }

  deleteReclamation(reclamation: Reclamation, event?: Event): void {
    event?.stopPropagation();

    if (!this.canDeleteReclamation(reclamation)) return;

    const confirmed = window.confirm(
      `Supprimer la reclamation "${reclamation.subject}" ? Cette action est irreversible.`
    );

    if (!confirmed) return;

    this.reclamationService.deleteReclamation(reclamation.reclamationId).subscribe({
      next: () => {
        this.reclamations = this.reclamations.filter(
          (item) => item.reclamationId !== reclamation.reclamationId
        );
        this.filteredReclamations = this.filteredReclamations.filter(
          (item) => item.reclamationId !== reclamation.reclamationId
        );

        if (this.selectedReclamation?.reclamationId === reclamation.reclamationId) {
          this.selectedReclamation = null;
          this.selectedAttachments = [];
          this.selectedComments = [];
          this.selectedHistory = [];
          this.stopLiveRefresh();
        }

        this.clampCurrentPage();
      },
      error: (error) => {
        const status = (error as { status?: number })?.status;
        this.workspaceError =
          status === 403
            ? 'Suppression refusee. Reconnectez-vous pour obtenir un token a jour.'
            : 'Impossible de supprimer la reclamation.';
      }
    });
  }

  private loadCurrentUser(): void {
    this.createForm.controls.description.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.updateDescriptionSuggestion(value ?? ''));

    this.usersService
      .getCurrentUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          this.loadWorkspace();
        },
        error: () => {
          this.workspaceError = 'Impossible de charger l utilisateur connecte.';
          this.isLoading = false;
        }
      });
  }

  private loadWorkspace(): void {
    this.isLoading = true;
    this.workspaceError = '';

    this.loadReclamations();
  }

  private loadReclamations(): void {
    const request$ =
      this.mode === 'admin'
        ? this.reclamationService.getAllReclamations()
        : this.reclamationService.getMyReclamations();

    request$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (reclamations) => {
          this.reclamations = reclamations;
          this.applyFilters();
          this.tryOpenRouteReclamation();
          if (this.selectedReclamation) {
            const updated = reclamations.find(
              (item) => item.reclamationId === this.selectedReclamation!.reclamationId
            );
            if (updated) {
              this.selectedReclamation = updated;
              this.adminUpdateForm.patchValue({
                status: updated.status,
                response: updated.response ?? ''
              });
            }
          }
        },
        error: () => {
          this.workspaceError = 'Impossible de charger les reclamations.';
          this.reclamations = [];
          this.filteredReclamations = [];
        }
      });
  }

  private loadSelectedResources(reclamationId: number): void {
    this.isDetailLoading = true;
    this.detailError = '';
    this.resolveSelectedOwnerName();

    forkJoin({
      attachments: this.reclamationService
        .getAttachments(reclamationId)
        .pipe(catchError(() => of([]))),
      comments: this.reclamationService.getComments(reclamationId).pipe(catchError(() => of([]))),
      history: this.reclamationService.getHistory(reclamationId).pipe(catchError(() => of([])))
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isDetailLoading = false))
      )
      .subscribe({
        next: ({ attachments, comments, history }) => {
          this.selectedAttachments = attachments;
          this.selectedComments = comments;
          this.selectedHistory = history;
          this.prepareAttachmentPreviews(attachments);
        },
        error: () => {
          this.detailError = 'Impossible de charger le detail de la reclamation.';
        }
      });
  }

  private loadSelectedComments(reclamationId: number): void {
    this.reclamationService.getComments(reclamationId).subscribe({
      next: (comments) => {
        this.selectedComments = comments;
      }
    });
  }

  private loadSelectedAttachments(reclamationId: number): void {
    this.reclamationService.getAttachments(reclamationId).subscribe({
      next: (attachments) => {
        this.selectedAttachments = attachments;
        this.prepareAttachmentPreviews(attachments);
      }
    });
  }

  private startLiveRefresh(): void {
    this.stopLiveRefresh();

    this.refreshIntervalId = window.setInterval(() => {
      this.loadReclamations();
      if (this.selectedReclamation) {
        this.loadSelectedComments(this.selectedReclamation.reclamationId);
        this.loadSelectedAttachments(this.selectedReclamation.reclamationId);
      }
    }, 5000);
  }

  private stopLiveRefresh(): void {
    if (this.refreshIntervalId !== null) {
      window.clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }

  private uploadPendingCreateAttachments(reclamationId: number): void {
    const uploads = [...this.createAttachments];

    if (this.recordedAudioBlob) {
      uploads.push(new File([this.recordedAudioBlob], 'voice-reclamation.webm', { type: 'audio/webm' }));
    }

    if (!uploads.length) return;

    forkJoin(uploads.map((file) => this.reclamationService.uploadAttachment(reclamationId, file))).subscribe({
      next: () => {
        if (this.selectedReclamation?.reclamationId === reclamationId) {
          this.loadSelectedAttachments(reclamationId);
        }
      }
    });
  }

  private applyFilters(): void {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();
    const today = new Date();

    this.filteredReclamations = this.reclamations.filter((item) => {
      const matchesStatus =
        this.selectedStatusFilter === 'ALL' || item.status === this.selectedStatusFilter;
      const createdAt = new Date(item.createdAt);
      const matchesDate =
        this.selectedDateFilter === 'ALL' ||
        (createdAt.getDate() === today.getDate() &&
          createdAt.getMonth() === today.getMonth() &&
          createdAt.getFullYear() === today.getFullYear());
      const matchesSearch =
        !normalizedSearch ||
        item.subject.toLowerCase().includes(normalizedSearch) ||
        item.description.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesDate && matchesSearch;
    });

    this.filteredReclamations = [...this.filteredReclamations].sort((left, right) => {
      switch (this.selectedSort) {
        case 'OLDEST':
          return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
        case 'PRIORITY': {
          const priorityWeight: Record<ReclamationPriority, number> = {
            [ReclamationPriority.URGENTE]: 4,
            [ReclamationPriority.HAUTE]: 3,
            [ReclamationPriority.MOYENNE]: 2,
            [ReclamationPriority.BASSE]: 1
          };
          return priorityWeight[right.priority] - priorityWeight[left.priority];
        }
        case 'NEWEST':
        default:
          return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      }
    });

    this.clampCurrentPage();
  }

  private clampCurrentPage(): void {
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.currentPage = Math.max(this.currentPage, 1);
  }

  private prepareAttachmentPreviews(attachments: ReclamationAttachment[]): void {
    this.clearAttachmentPreviews();

    attachments
      .filter((attachment) => this.isAudioAttachment(attachment) || this.isImageAttachment(attachment))
      .forEach((attachment) => {
        this.reclamationService.downloadAttachment(attachment.attachmentId).subscribe({
          next: (blob) => {
            this.attachmentPreviewUrls[attachment.attachmentId] = URL.createObjectURL(blob);
          }
        });
      });
  }

  private clearAttachmentPreviews(): void {
    Object.values(this.attachmentPreviewUrls).forEach((url) => URL.revokeObjectURL(url));
    this.attachmentPreviewUrls = {};
  }

  private stopRecordingTracks(): void {
    this.mediaStream?.getTracks().forEach((track) => track.stop());
    this.mediaStream = null;
  }

  private mergeUpdatedReclamation(updated: Reclamation): void {
    this.reclamations = this.reclamations.map((item) =>
      item.reclamationId === updated.reclamationId ? updated : item
    );
    this.applyFilters();
  }

  private tryOpenRouteReclamation(): void {
    if (!this.routeReclamationId || !this.reclamations.length) return;

    const target = this.reclamations.find(
      (item) => item.reclamationId === this.routeReclamationId
    );

    if (target) {
      if (!this.selectedReclamation || this.selectedReclamation.reclamationId !== target.reclamationId) {
        this.selectedReclamation = target;
        this.detailError = '';
        this.messageForm.reset();
        this.adminUpdateForm.patchValue({
          status: target.status,
          response: target.response ?? ''
        });
        this.loadSelectedResources(target.reclamationId);
        this.startLiveRefresh();
      }
    }
  }

  private resolveSelectedOwnerName(): void {
    if (!this.selectedReclamation) return;

    if (this.mode === 'user') {
      this.selectedOwnerName = this.currentUserDisplayName;
      return;
    }

    this.usersService.getUserById(this.selectedReclamation.userId).subscribe({
      next: (user) => {
        this.selectedOwnerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Client';
      },
      error: () => {
        this.selectedOwnerName = 'Client';
      }
    });
  }

  private getInitials(value: string): string {
    const parts = value
      .split(' ')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 2);

    if (!parts.length) return '??';
    return parts.map((item) => item[0]?.toUpperCase() || '').join('');
  }

  private updateDescriptionSuggestion(value: string): void {
    const normalized = value.trim().toLowerCase();

    if (!normalized || normalized.length < 3) {
      this.descriptionSuggestion = '';
      return;
    }

    const category = this.createForm.getRawValue().category ?? ReclamationCategory.TECHNIQUE;
    const suggestions = this.descriptionSuggestionsByCategory[category] ?? [];

    const suggestion = suggestions.find((candidate) =>
      candidate.toLowerCase().startsWith(normalized)
    );

    if (suggestion) {
      this.descriptionSuggestion = suggestion.slice(value.length);
      return;
    }

    const lastWord = normalized.split(/\s+/).pop() ?? '';
    const tokenSuggestion = suggestions.find((candidate) =>
      candidate.toLowerCase().includes(lastWord)
    );

    if (!tokenSuggestion) {
      this.descriptionSuggestion = '';
      return;
    }

    const lowerValue = value.toLowerCase();
    const index = tokenSuggestion.toLowerCase().indexOf(lastWord);
    if (index < 0) {
      this.descriptionSuggestion = '';
      return;
    }

    const rebuilt = tokenSuggestion.slice(index);
    if (!rebuilt.toLowerCase().startsWith(lastWord) || lowerValue.endsWith(rebuilt.toLowerCase())) {
      this.descriptionSuggestion = '';
      return;
    }

    this.descriptionSuggestion = rebuilt.slice(lastWord.length);
  }
}
