import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { DiscussionComponent } from "../discussion/discussion.component";
import data from '../../../../assets/data/course_outline_sample.json';

interface Slide {
  id: number;
  name: string;
  text: string;
  sequence: number;
  slideAssets?: Array<{
    id: number;
    assettype: string;
    content: string;
    orientationkey: string;
    version: string;
  }>;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  sequence: number;
  guid: string;
  allowQuiz: boolean;
  slideList: Slide[];
}

interface Course {
  id: number;
  name: string;
  description?: string;
  topicId: string;
  lessonList: Lesson[];
  topicscovered: string;
}

@Component({
  selector: 'app-course-detail',
  imports: [CommonModule, DiscussionComponent],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.css',
  encapsulation: ViewEncapsulation.None,
  standalone: true
})
export class CourseDetailComponent {
  course!: Course;
  currentLessonIndex: number = 0;
  currentSlideIndex: number = 0;

  constructor() {
    // Initialize the first course from the data
    this.course = data.courses[0];
  }

  get currentLesson(): Lesson {
    return this.course.lessonList[this.currentLessonIndex];
  }

  get currentSlide(): Slide {
    return this.currentLesson.slideList[this.currentSlideIndex];
  }

  get progress(): number {
    const totalSlides = this.course.lessonList.reduce(
      (total, lesson) => total + lesson.slideList.length, 
      0
    );
    const currentSlideNumber = this.course.lessonList
      .slice(0, this.currentLessonIndex)
      .reduce((total, lesson) => total + lesson.slideList.length, 0) + 
      this.currentSlideIndex + 1;
    
    return (currentSlideNumber / totalSlides) * 100;
  }

  selectLesson(index: number): void {
    this.currentLessonIndex = index;
    this.currentSlideIndex = 0;
  }

  selectSlide(lessonIndex: number, slideIndex: number): void {
    this.currentLessonIndex = lessonIndex;
    this.currentSlideIndex = slideIndex;
  }

  sanitizeHTML(html: string): string {
    // Remove the <p> and other HTML tags from the title
    return html.replace(/<\/?[^>]+(>|$)/g, "");
  }
}