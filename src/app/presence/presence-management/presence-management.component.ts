import { Component, OnInit } from '@angular/core';
import { PresenceService, PresenceResponse, PresenceRequest, PresenceStatus, PresenceStatisticsResponse } from '../../service/presence.service';
import { UserService, User } from '../../service/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-presence-management',
  templateUrl: './presence-management.component.html',
  styleUrls: ['./presence-management.component.css']
})
export class PresenceManagementComponent implements OnInit {
[x: string]: any;
  presences: PresenceResponse[] = [];
  agents: User[] = [];
  agentsWithoutPresence: User[] = [];
  loading = false;
  selectedDate = new Date().toISOString().split('T')[0];
  selectedStatus: PresenceStatus | '' = '';
  selectedAgent: string = '';

  // Statistics
  statistics: PresenceStatisticsResponse | null = null;

  // Enums for template
  PresenceStatus = PresenceStatus;
  presenceStatuses = Object.values(PresenceStatus);

  // Bulk operations
  bulkRequests: PresenceRequest[] = [];
  showBulkForm = false;

  constructor(
    private presenceService: PresenceService,
    private userService: UserService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadAgents();
    this.loadPresencesForDate();
    this.loadAgentsWithoutPresence();
  }

  loadAgents(): void {
    this.userService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.agents = users.filter((user: User) => user.role === 'ROLE_AGENT');
      },
      error: (error: any) => {

      }
    });
  }

  loadPresencesForDate(): void {
    this.loading = true;
    this.presenceService.getPresencesByDate(this.selectedDate).subscribe({
      next: (presences) => {
        this.presences = presences;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading presences:', error);
        this.toastr.error('Erreur lors du chargement des présences');
        this.loading = false;
      }
    });
  }

  loadAgentsWithoutPresence(): void {
    this.presenceService.getAgentsWithoutPresence(this.selectedDate).subscribe({
      next: (agents) => {
        this.agentsWithoutPresence = agents;
      },
      error: (error) => {
        console.error('Error loading agents without presence:', error);
      }
    });
  }

  onDateChange(): void {
    this.loadPresencesForDate();
    this.loadAgentsWithoutPresence();
  }

  onStatusFilterChange(): void {
    if (this.selectedStatus) {
      this.presenceService.getPresencesByDateAndStatus(this.selectedDate, this.selectedStatus).subscribe({
        next: (presences) => {
          this.presences = presences;
        },
        error: (error) => {
          console.error('Error filtering presences:', error);
          this.toastr.error('Erreur lors du filtrage');
        }
      });
    } else {
      this.loadPresencesForDate();
    }
  }

  markPresence(userId: string, status: PresenceStatus, notes?: string): void {
    const request: PresenceRequest = {
      userId: userId,
      date: this.selectedDate,
      status: status,
      notes: notes
    };

    this.presenceService.markPresence(request).subscribe({
      next: (presence) => {
        this.toastr.success('Présence marquée avec succès');
        this.loadPresencesForDate();
        this.loadAgentsWithoutPresence();
      },
      error: (error) => {
        console.error('Error marking presence:', error);
        this.toastr.error('Erreur lors du marquage de la présence');
      }
    });
  }

  updatePresence(presence: PresenceResponse, newStatus: PresenceStatus, notes?: string): void {
    const request: PresenceRequest = {
      userId: presence.userId,
      date: presence.date,
      status: newStatus,
      checkInTime: presence.checkInTime,
      checkOutTime: presence.checkOutTime,
      notes: notes || presence.notes
    };

    this.presenceService.updatePresence(presence.id, request).subscribe({
      next: (updatedPresence) => {
        this.toastr.success('Présence mise à jour avec succès');
        this.loadPresencesForDate();
      },
      error: (error) => {
        console.error('Error updating presence:', error);
        this.toastr.error('Erreur lors de la mise à jour');
      }
    });
  }

  deletePresence(presenceId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette présence ?')) {
      this.presenceService.deletePresence(presenceId).subscribe({
        next: () => {
          this.toastr.success('Présence supprimée avec succès');
          this.loadPresencesForDate();
          this.loadAgentsWithoutPresence();
        },
        error: (error) => {
          console.error('Error deleting presence:', error);
          this.toastr.error('Erreur lors de la suppression');
        }
      });
    }
  }

  // Bulk operations
  prepareBulkMarking(): void {
    this.bulkRequests = this.agentsWithoutPresence.map(agent => ({
      userId: agent.id,
      date: this.selectedDate,
      status: PresenceStatus.ABSENT,
      notes: 'Marquage en lot'
    }));
    this.showBulkForm = true;
  }

  markBulkPresences(): void {
    this.presenceService.markMultiplePresences(this.bulkRequests).subscribe({
      next: (presences) => {
        this.toastr.success(`${presences.length} présences marquées avec succès`);
        this.showBulkForm = false;
        this.loadPresencesForDate();
        this.loadAgentsWithoutPresence();
      },
      error: (error) => {
        console.error('Error marking bulk presences:', error);
        this.toastr.error('Erreur lors du marquage en lot');
      }
    });
  }

  updateBulkStatus(status: PresenceStatus): void {
    this.bulkRequests = this.bulkRequests.map(request => ({
      ...request,
      status: status
    }));
  }

  // Statistics
  loadStatistics(userId: string): void {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    const endDate = new Date();

    this.presenceService.getPresenceStatistics(
      userId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    ).subscribe({
      next: (stats) => {
        this.statistics = stats;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  // Helper methods
  getStatusLabel(status: PresenceStatus): string {
    return this.presenceService.getPresenceStatusLabel(status);
  }

  getStatusClass(status: PresenceStatus): string {
    return this.presenceService.getPresenceStatusClass(status);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  formatTime(timeString?: string): string {
    if (!timeString) return '-';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getAgentName(userId: string): string {
    const agent = this.agents.find(a => a.id === userId);
    return agent ? `${agent.firstname} ${agent.lastname}` : 'Agent inconnu';
  }
}
