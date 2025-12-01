import { vi } from 'vitest'

export const prisma = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  course: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  module: {
    findMany: vi.fn(),
    create: vi.fn(),
    deleteMany: vi.fn(),
  },
  lesson: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  enrollment: {
    findUnique: vi.fn(),
  },
  lessonQuiz: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    upsert: vi.fn(),
    deleteMany: vi.fn(),
  },
  quizAttempt: {
    findFirst: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
  },
}
