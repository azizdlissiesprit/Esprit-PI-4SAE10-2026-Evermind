import { Injectable } from '@angular/core';
import { Appointment } from './interfaces';

export interface CalDAVEvent {
  uid: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
  };
  end: {
    dateTime: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  categories?: string[];
}

export interface CalDAVCalendar {
  url: string;
  username: string;
  password: string;
  name: string;
  color?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CalDAVService {
  private calendars: CalDAVCalendar[] = [];
  private isInitialized: boolean = false;

  constructor() {
    this.loadCalendars();
  }

  private loadCalendars(): void {
    const savedCalendars = localStorage.getItem('caldav_calendars');
    if (savedCalendars) {
      this.calendars = JSON.parse(savedCalendars);
    }
  }

  // Calendar Management
  getCalendars(): CalDAVCalendar[] {
    return [...this.calendars];
  }

  addCalendar(calendar: CalDAVCalendar): void {
    this.calendars.push(calendar);
    this.saveCalendars();
  }

  updateCalendar(index: number, calendar: Partial<CalDAVCalendar>): void {
    if (index >= 0 && index < this.calendars.length) {
      this.calendars[index] = { ...this.calendars[index], ...calendar };
      this.saveCalendars();
    }
  }

  deleteCalendar(index: number): void {
    if (index >= 0 && index < this.calendars.length) {
      this.calendars.splice(index, 1);
      this.saveCalendars();
    }
  }

  private saveCalendars(): void {
    localStorage.setItem('caldav_calendars', JSON.stringify(this.calendars));
  }

  // CalDAV Operations
  async testConnection(calendar: CalDAVCalendar): Promise<boolean> {
    try {
      console.log('Testing CalDAV connection to:', calendar.url);
      
      // Simulate CalDAV connection test
      const response = await this.makeCalDAVRequest('PROPFIND', calendar.url, {
        'Depth': '1',
        'Content-Type': 'application/xml; charset=utf-8'
      });

      console.log('CalDAV connection test response:', response);
      return response.includes('200 OK') || response.includes('207 Multi-Status');
    } catch (error) {
      console.error('CalDAV connection test failed:', error);
      return false;
    }
  }

  async createEvent(calendar: CalDAVCalendar, appointment: Appointment): Promise<CalDAVEvent | null> {
    try {
      const calDavEvent: CalDAVEvent = {
        uid: `appointment-${Date.now()}`,
        summary: `RDV - ${appointment.client}`,
        description: `Motif: ${appointment.motif}\nLieu: ${appointment.location}\nStatut: ${appointment.status}${appointment.notes ? '\nNotes: ' + appointment.notes : ''}`,
        start: {
          dateTime: `${appointment.date}T${appointment.time}:00`
        },
        end: {
          dateTime: `${appointment.date}T${appointment.endTime || this.addMinutesToTime(appointment.time, 30)}:00`
        },
        categories: [appointment.motif]
      };

      const response = await this.makeCalDAVRequest('PUT', `${calendar.url}/events/${calDavEvent.uid}.ics`, calDavEvent);
      
      console.log('CalDAV event created:', response);
      return calDavEvent;
    } catch (error) {
      console.error('Error creating CalDAV event:', error);
      return null;
    }
  }

  async updateEvent(calendar: CalDAVCalendar, eventId: string, appointment: Appointment): Promise<CalDAVEvent | null> {
    try {
      const calDavEvent: CalDAVEvent = {
        uid: eventId,
        summary: `RDV - ${appointment.client}`,
        description: `Motif: ${appointment.motif}\nLieu: ${appointment.location}\nStatut: ${appointment.status}${appointment.notes ? '\nNotes: ' + appointment.notes : ''}`,
        start: {
          dateTime: `${appointment.date}T${appointment.time}:00`
        },
        end: {
          dateTime: `${appointment.date}T${appointment.endTime || this.addMinutesToTime(appointment.time, 30)}:00`
        },
        categories: [appointment.motif]
      };

      const response = await this.makeCalDAVRequest('PUT', `${calendar.url}/events/${eventId}.ics`, calDavEvent);
      
      console.log('CalDAV event updated:', response);
      return calDavEvent;
    } catch (error) {
      console.error('Error updating CalDAV event:', error);
      return null;
    }
  }

  async deleteEvent(calendar: CalDAVCalendar, eventId: string): Promise<boolean> {
    try {
      const response = await this.makeCalDAVRequest('DELETE', `${calendar.url}/events/${eventId}.ics`);
      
      console.log('CalDAV event deleted:', response);
      return response.includes('200 OK') || response.includes('204 No Content');
    } catch (error) {
      console.error('Error deleting CalDAV event:', error);
      return false;
    }
  }

  async getEvents(calendar: CalDAVCalendar, startDate: string, endDate: string): Promise<CalDAVEvent[]> {
    try {
      const response = await this.makeCalDAVRequest('GET', `${calendar.url}/events?start=${startDate}&end=${endDate}`);
      
      console.log('CalDAV events retrieved:', response);
      
      // Parse iCal response (simplified)
      if (response.includes('BEGIN:VCALENDAR')) {
        return this.parseICal(response);
      }
      
      return [];
    } catch (error) {
      console.error('Error retrieving CalDAV events:', error);
      return [];
    }
  }

  // Utility Methods
  private async makeCalDAVRequest(method: string, url: string, data?: any): Promise<string> {
    // Simulate CalDAV HTTP request
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResponse = method === 'PROPFIND' 
          ? 'HTTP/1.1 207 Multi-Status\r\nDAV:1,2,3,4,5,6,7,8,9,10,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,321,480\r\nContent-Type: application/xml; charset=utf-8\r\n\r\n<D:multistatus xmlns:D="DAV:">\n<D:response>\n<D:href>/</D:href>\n<D:propstat xmlns:D="DAV:">HTTP/1.1 200 OK</D:propstat>\n</D:response>\n</D:multistatus>'
          : 'HTTP/1.1 200 OK\r\nContent-Type: text/calendar\r\n\r\nBEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Example Corp.//CalDAV Server//EN\r\nBEGIN:VEVENT\r\nUID:event-123@example.com\r\nDTSTART:20260403T090000Z\r\nDTEND:20260403T093000Z\r\nSUMMARY:RDV - Test Event\r\nEND:VEVENT\r\nEND:VCALENDAR';
        
        resolve(mockResponse);
      }, 1000);
    });
  }

  private parseICal(icalData: string): CalDAVEvent[] {
    const events: CalDAVEvent[] = [];
    const lines = icalData.split('\n');
    
    let currentEvent: Partial<CalDAVEvent> = {};
    
    for (const line of lines) {
      if (line.startsWith('UID:')) {
        currentEvent.uid = line.split(':')[1]?.trim();
      } else if (line.startsWith('SUMMARY:')) {
        currentEvent.summary = line.split(':')[1]?.trim();
      } else if (line.startsWith('DTSTART:')) {
        currentEvent.start = { dateTime: line.split(':')[1]?.trim() };
      } else if (line.startsWith('DTEND:')) {
        currentEvent.end = { dateTime: line.split(':')[1]?.trim() };
      } else if (line.startsWith('END:VEVENT') && currentEvent.uid) {
        events.push(currentEvent as CalDAVEvent);
        currentEvent = {};
      }
    }
    
    return events;
  }

  private addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  }

  // Configuration
  getConfigurationStatus(): { configured: boolean; needsSetup: boolean } {
    return {
      configured: this.calendars.length > 0,
      needsSetup: this.calendars.length === 0
    };
  }

  // Sync with multiple calendars
  async syncToAllCalendars(appointment: Appointment): Promise<string[]> {
    const results: string[] = [];
    
    for (const calendar of this.calendars) {
      try {
        const event = await this.createEvent(calendar, appointment);
        if (event) {
          results.push(`${calendar.name}: ${event.uid}`);
        }
      } catch (error) {
        console.error(`Failed to sync to ${calendar.name}:`, error);
      }
    }
    
    return results;
  }
}
