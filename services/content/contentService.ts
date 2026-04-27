import lessonsJson from '@/data/lessons/investing-basics.json';
import type { KnowledgeDocument, Lesson } from '@/types/content';
import { filterByQuery } from '@/utils/search';

const lessons = lessonsJson as Lesson[];

export function getLessons(): Lesson[] {
  return lessons;
}

export function getFeaturedLesson(): Lesson {
  return lessons[0];
}

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}

export function getLessonsByCategory(category: string): Lesson[] {
  if (category === 'All') {
    return lessons;
  }

  return lessons.filter((lesson) => lesson.category === category);
}

export function searchLessons(query: string, category = 'All'): Lesson[] {
  return filterByQuery(getLessonsByCategory(category), query);
}

export function getDocuments(): KnowledgeDocument[] {
  return [];
}

export function getDocumentById(_id: string): KnowledgeDocument | undefined {
  return undefined;
}

export function searchDocuments(_query: string): KnowledgeDocument[] {
  return [];
}

export function searchKnowledge(query: string): Array<Lesson | KnowledgeDocument> {
  return [...searchLessons(query), ...searchDocuments(query)];
}
