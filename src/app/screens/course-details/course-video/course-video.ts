import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  inject,
  input,
  output,
  Renderer2,
} from '@angular/core';
import { CourssatVideoDirective } from '@directives/courssat-video';
import { CourseLesson } from '@models/course';
import { SafeUrlPipe } from '@pipes/safe-url-pipe';

@Component({
  selector: 'app-course-video',
  imports: [SafeUrlPipe, CourssatVideoDirective],
  templateUrl: './course-video.html',
  styleUrl: './course-video.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseVideo {
  title = input.required();
  isFavourite = input.required<boolean>();
  courseLoading = input.required<boolean>();
  nextVideo = output<CourseLesson>();
  toggleFavCourse = output();
  renderer = inject(Renderer2);
  document = inject(DOCUMENT);
  activeLesson = input.required<CourseLesson | null>();

  videoEndHandler() {
    this.nextVideo.emit(this.activeLesson()!);
  }
}
