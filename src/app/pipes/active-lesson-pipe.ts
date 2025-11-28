import { Pipe, PipeTransform } from '@angular/core';
import { CourseLesson, CourseTopic } from '@models/course';

@Pipe({
  name: 'activeLesson',
  standalone: true,
})
export class ActiveLessonPipe implements PipeTransform {
  transform(topics?: CourseTopic[]): CourseLesson | null {
    if (!topics) {
      return null;
    }
    let lesson;
    for (let tIndex = 0; tIndex < topics.length; tIndex++) {
      for (let lIndex = 0; lIndex < topics[tIndex].lessonList.length; lIndex++) {
        if (topics[tIndex].lessonList[lIndex].isActive) {
          lesson = {
            ...topics[tIndex].lessonList[lIndex],
            lIndex,
            tIndex,
          };
          break;
        }
      }
      if (lesson) {
        break;
      }
    }
    return lesson!;
  }
}
