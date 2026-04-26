import documentsJson from '@/data/docs/documents.json';
import lessonsJson from '@/data/lessons/investing-basics.json';
import type { KnowledgeDocument, Lesson } from '@/types/content';
import { filterByQuery } from '@/utils/search';

const lessons = lessonsJson as Lesson[];
const documents = documentsJson as KnowledgeDocument[];

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
  return documents;
}

export function getDocumentById(id: string): KnowledgeDocument | undefined {
  return documents.find((document) => document.id === id);
}

export function searchDocuments(query: string): KnowledgeDocument[] {
  return filterByQuery(documents, query);
}

export function searchKnowledge(query: string): Array<Lesson | KnowledgeDocument> {
  return [...searchLessons(query), ...searchDocuments(query)];
}
