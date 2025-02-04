import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:5000/api/generate';
  private readonly MAX_RETRIES = 3;

  constructor() {}

  generateResponse(prompt: string, model: string = 'deepseek-r1:1.5b'): Observable<string> {
    return new Observable(subscriber => {
      let retryCount = 0;
      let accumulatedText = '';

      const connectEventSource = () => {
        const eventSource = new EventSource(
          `${this.apiUrl}?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(model)}`
        );

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.error) {
              subscriber.error(data.error);
              eventSource.close();
              return;
            }

            if (data.complete) {
              subscriber.complete();
              eventSource.close();
              return;
            }

            if (data.text) {
              accumulatedText += data.text;
              subscriber.next(data.text);
            }
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('EventSource error:', error);
          eventSource.close();

          if (retryCount < this.MAX_RETRIES) {
            retryCount++;
            console.log(`Retrying connection (${retryCount}/${this.MAX_RETRIES})...`);
            setTimeout(connectEventSource, 1000 * retryCount); // Exponential backoff
          } else {
            subscriber.error('Maximum retry attempts reached');
          }
        };

        return () => {
          eventSource.close();
        };
      };

      return connectEventSource();
    });
  }
}