import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'course-detail', pathMatch: 'full'
    },
    {
        path: 'course-detail',
        loadComponent: () => import('./views/course/course-detail/course-detail.component')
          .then(mod => mod.CourseDetailComponent)
    },
    // {
    //     path: 'discussion',
    //     loadComponent: () => import('./views/course/discussion/discussion.component')
    //       .then(mod => mod.DiscussionComponent)
    // },
    {
        path: 'quiz',
        loadComponent: () => import('./views/quiz/attempt-quiz/attempt-quiz.component')
          .then(mod => mod.AttemptQuizComponent)
    },
    // {
    //     path: 'create-organization',
    //     loadComponent: () => import('./views/Auth/create-organization/create-organization.component')
    //       .then(mod => mod.CreateOrganizationComponent)
    // }
];