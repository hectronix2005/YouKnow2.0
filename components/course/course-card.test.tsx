import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CourseCard } from './course-card'

// Mock useLanguage
vi.mock('@/components/providers/language-provider', () => ({
  useLanguage: () => ({
    t: {
      courses: {
        instructor: 'Por {name}',
        continue: 'Continuar',
        view: 'Ver Curso',
      },
      dashboard: {
        progress: '{percent}% completado',
      },
    },
  }),
}))

const mockCourse = {
  id: 'course-1',
  title: 'Test Course',
  subtitle: 'Course subtitle',
  slug: 'test-course',
  category: 'Programming',
  level: 'Beginner',
  thumbnail: null,
  price: 0,
  isFree: true,
  instructor: {
    name: 'John Instructor',
  },
}

describe('CourseCard', () => {
  it('renders course title', () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getByText('Test Course')).toBeInTheDocument()
  })

  it('renders course subtitle', () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getByText('Course subtitle')).toBeInTheDocument()
  })

  it('renders instructor name', () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getByText('Por John Instructor')).toBeInTheDocument()
  })

  it('renders category badge', () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getByText('Programming')).toBeInTheDocument()
  })

  it('renders level badge', () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getByText('Beginner')).toBeInTheDocument()
  })

  it('renders first letter when no thumbnail', () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('renders thumbnail when provided', () => {
    const courseWithThumbnail = {
      ...mockCourse,
      thumbnail: 'https://example.com/image.jpg',
    }
    render(<CourseCard course={courseWithThumbnail} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
    expect(img).toHaveAttribute('alt', 'Test Course')
  })

  it('renders "Ver Curso" button when not showing progress', () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getByText('Ver Curso')).toBeInTheDocument()
  })

  it('links to course page', () => {
    render(<CourseCard course={mockCourse} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/courses/test-course')
  })

  it('shows progress when showProgress is true and enrollment exists', () => {
    render(
      <CourseCard
        course={mockCourse}
        enrollment={{ progressPercent: 50, completedLessons: 5 }}
        showProgress
      />
    )
    expect(screen.getByText('50% completado')).toBeInTheDocument()
  })

  it('renders "Continuar" button when showing progress', () => {
    render(
      <CourseCard
        course={mockCourse}
        enrollment={{ progressPercent: 50, completedLessons: 5 }}
        showProgress
      />
    )
    expect(screen.getByText('Continuar')).toBeInTheDocument()
  })

  it('links to learn page when showing progress', () => {
    render(
      <CourseCard
        course={mockCourse}
        enrollment={{ progressPercent: 50, completedLessons: 5 }}
        showProgress
      />
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/learn/test-course')
  })

  it('does not show progress bar when showProgress is false', () => {
    render(
      <CourseCard
        course={mockCourse}
        enrollment={{ progressPercent: 50, completedLessons: 5 }}
        showProgress={false}
      />
    )
    expect(screen.queryByText('50% completado')).not.toBeInTheDocument()
  })

  it('does not render subtitle when not provided', () => {
    const courseWithoutSubtitle = { ...mockCourse, subtitle: null }
    render(<CourseCard course={courseWithoutSubtitle} />)
    expect(screen.queryByText('Course subtitle')).not.toBeInTheDocument()
  })
})
