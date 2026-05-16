// src/__tests__/components/DoctorCard.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DoctorCard from '../../components/DoctorCard'

const mockDoctor = {
  id: 'doc-123',
  fullName: 'Priya Sharma',
  specialty: 'Cardiologist',
  city: 'Mumbai',
  rating: 4.8,
  reviewCount: 120,
  consultationFee: 800,
  experienceYears: 12,
  profileImageUrl: null,
  isAvailable: true,
}

const renderCard = (props = {}) =>
  render(
    <MemoryRouter>
      <DoctorCard doctor={{ ...mockDoctor, ...props }} />
    </MemoryRouter>
  )

describe('DoctorCard', () => {
  it('renders doctor name', () => {
    renderCard()
    expect(screen.getByText('Dr. Priya Sharma')).toBeInTheDocument()
  })

  it('renders specialty', () => {
    renderCard()
    expect(screen.getByText('Cardiologist')).toBeInTheDocument()
  })

  it('renders consultation fee', () => {
    renderCard()
    expect(screen.getByText('₹800')).toBeInTheDocument()
  })

  it('renders experience years', () => {
    renderCard()
    expect(screen.getByText('12y')).toBeInTheDocument()
  })

  it('renders rating', () => {
    renderCard()
    expect(screen.getByText('4.8')).toBeInTheDocument()
  })

  it('renders avatar initials when no profile image', () => {
    renderCard()
    expect(screen.getByText('PS')).toBeInTheDocument()
  })

  it('renders "Book Now" link pointing to /book/doc-123', () => {
    renderCard()
    const bookLink = screen.getByRole('link', { name: /book now/i })
    expect(bookLink).toHaveAttribute('href', '/book/doc-123')
  })

  it('renders "View Profile" link', () => {
    renderCard()
    const profileLink = screen.getByRole('link', { name: /view profile/i })
    expect(profileLink).toHaveAttribute('href', '/doctors/doc-123')
  })

  it('shows green availability dot when doctor is available', () => {
    renderCard({ isAvailable: true })
    const dot = document.querySelector('.bg-green-400')
    expect(dot).toBeInTheDocument()
  })
})
