import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Import the JSON with type assertion
import jsonData from '../../../../assets/data/course_quiz.json';
import { Router } from '@angular/router';

// Define type for the JSON data structure
interface QuizJson {
  quizzes: QuizData[];
}

interface QuizOption {
  id: string;
  text: string;
}

interface SlideReference {
  slideId: number;
  slideName: string;
}

interface Question {
  id: number;
  questionText: string;
  slideReference: SlideReference;
  options: QuizOption[];
  correctAnswer: string;
}

interface LessonQuiz {
  lessonId: number;
  lessonTitle: string;
  questions: Question[];
}

interface QuizData {
  courseId: number;
  lessonQuizzes: LessonQuiz[];
}

@Component({
  selector: 'app-attempt-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attempt-quiz.component.html',
  styleUrls: ['./attempt-quiz.component.css']
})
export class AttemptQuizComponent implements OnInit {
  quizData!: QuizData;
  userAnswers: { [key: number]: string } = {};
  showResults: boolean = false;
  isQuizCompleted: boolean = false;
  incorrectQuestions: { question: Question, userAnswer: string }[] = [];
  Object = Object; // Add this to use Object.keys in template
  
  constructor(private router: Router) {}

  ngOnInit() {
    try {
      const data = (jsonData as any).default || jsonData;
      this.quizData = data.quizzes[0];
    } catch (error) {
      console.error('Error loading quiz data:', error);
    }
  }

  // Add these new methods
  getTotalQuestions(): number {
    if (!this.quizData) return 0;
    return this.quizData.lessonQuizzes.reduce(
      (total, lesson) => total + lesson.questions.length,
      0
    );
  }

  getScore(): number {
    if (!this.quizData || this.incorrectQuestions.length === 0) return 100;
    const totalQuestions = this.getTotalQuestions();
    const correctAnswers = totalQuestions - this.incorrectQuestions.length;
    return Math.round((correctAnswers / totalQuestions) * 100);
  }

  getLessonTitle(questionId: number): string {
    for (const lesson of this.quizData?.lessonQuizzes || []) {
      if (lesson.questions.some(q => q.id === questionId)) {
        return lesson.lessonTitle;
      }
    }
    return '';
  }

  // Keep your existing methods
  selectAnswer(questionId: number, answerId: string) {
    this.userAnswers[questionId] = answerId;
  }

  isAnswerSelected(questionId: number, answerId: string): boolean {
    return this.userAnswers[questionId] === answerId;
  }

  get allQuestionsAnswered(): boolean {
    if (!this.quizData) return false;
    return Object.keys(this.userAnswers).length === this.getTotalQuestions();
  }

  submitQuiz() {
    if (!this.allQuestionsAnswered) {
      alert('Please answer all questions before submitting.');
      return;
    }

    this.incorrectQuestions = [];
    let allCorrect = true;

    this.quizData?.lessonQuizzes.forEach(lessonQuiz => {
      lessonQuiz.questions.forEach(question => {
        const userAnswer = this.userAnswers[question.id];
        if (userAnswer !== question.correctAnswer) {
          allCorrect = false;
          this.incorrectQuestions.push({
            question,
            userAnswer
          });
        }
      });
    });

    this.isQuizCompleted = true;
    this.showResults = true;
  }

  retakeQuiz() {
    this.userAnswers = {};
    this.showResults = false;
    this.isQuizCompleted = false;
    this.incorrectQuestions = [];
  }

  // Add this to your existing component class
  goBackToCourse() {
    // Add your navigation logic here
    // For example, if using Router:
    console.log("//////////")
    this.router.navigate(['/course-detail']);
  }
}