import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../shared/_services/Course/course.service';

interface ChatMessage {
  question: string;
  answer: string;
  isStreaming?: boolean;
  error?: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-discussion',
  imports: [CommonModule, FormsModule],
  templateUrl: './discussion.component.html',
  styleUrl: './discussion.component.css'
})
export class DiscussionComponent {
  @Input() currentSlideContent: string = '';
  @ViewChild('chatMessages') chatMessages!: ElementRef;
  
  isOpen = false;
  currentQuestion = '';
  chatHistory: ChatMessage[] = [];
  
  constructor(
    private course: CourseService,
    private cdr: ChangeDetectorRef
  ) {}

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  askQuestion(): void {
    if (!this.currentQuestion.trim()) return;
    
    const question = this.currentQuestion;
    
    // Create new message
    const newMessage: ChatMessage = {
      question: question,
      answer: '',
      isStreaming: true,
      timestamp: new Date()
    };

    // Add to chat history
    this.chatHistory.push(newMessage);
    
    // Clear input
    this.currentQuestion = '';

    // Make API call
    this.course.generateResponse(question)
      .subscribe({
        next: (chunk: string) => {
          try {
            if (chunk.trim()) {
              // Update the message's answer
              newMessage.answer += chunk;
              this.cdr.detectChanges();
              this.scrollToBottom();
            }
          } catch (e) {
            console.error('Error processing chunk:', e);
          }
        },
        error: (error: any) => {
          console.error('Error:', error);
          if (!newMessage.answer) {
            // Only show error if no answer was received yet
            newMessage.answer = 'Sorry, there was an error processing your request. Please try again.';
          } else {
            // Append error message to partial answer
            newMessage.answer += '\n\n[Error: Connection lost. Partial response shown above.]';
          }
          newMessage.error = true;
          newMessage.isStreaming = false;
          this.cdr.detectChanges();
          this.scrollToBottom();
        },
        complete: () => {
          newMessage.isStreaming = false;
          this.cdr.detectChanges();
          this.scrollToBottom();
        }
      });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatMessages) {
        const element = this.chatMessages.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    });
  }
}