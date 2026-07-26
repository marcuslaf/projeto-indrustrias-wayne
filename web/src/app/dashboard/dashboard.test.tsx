import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DashboardClient } from './dashboard-client'
import type { DashboardStats } from './dashboard-client'

const mockStats: DashboardStats = {
  totalResources: 4,
  equipmentInUse: 1,
  vehiclesInUse: 1,
  securityDevicesActive: 0,
  available: 2,
  inMaintenance: 1,
  recentLogs: [
    { id: 1, access_area: 'Sala de Controle', access_time: '2026-07-26T10:00:00Z', status: 'sucesso' },
  ],
  maintenanceResources: [
    { id: 1, name: 'Drone', type: 'dispositivo_seguranca', status: 'em_manutencao', last_maintenance_date: '2026-06-01', serial_number: null, plate: null, location: 'Hangar', acquisition_date: '2025-01-01' },
  ],
  resourcesByType: [
    { name: 'equipamento', value: 2 },
    { name: 'veiculo', value: 1 },
    { name: 'dispositivo_seguranca', value: 1 },
  ],
  resourcesByStatus: [
    { name: 'disponivel', value: 2 },
    { name: 'em_uso', value: 1 },
    { name: 'em_manutencao', value: 1 },
  ],
  logsByDay: [
    { day: '20/07/2026', sucesso: 3, falha: 0 },
    { day: '21/07/2026', sucesso: 1, falha: 1 },
  ],
}

describe('DashboardClient', () => {
  it('renders welcome message with user name', () => {
    render(<DashboardClient profile={{ role: 'admin_seguranca', nome: 'Bruce' }} stats={mockStats} userRole="admin_seguranca" />)
    expect(screen.getByText(/Bruce/)).toBeTruthy()
  })

  it('renders stat cards', () => {
    render(<DashboardClient profile={{ role: 'admin_seguranca', nome: 'Bruce' }} stats={mockStats} userRole="admin_seguranca" />)
    expect(screen.getByText('1')).toBeTruthy()
    expect(screen.getByText('2')).toBeTruthy()
  })

  it('renders recent logs section', () => {
    render(<DashboardClient profile={{ role: 'funcionario', nome: 'Test' }} stats={mockStats} userRole="funcionario" />)
    expect(screen.getByText('Sala de Controle')).toBeTruthy()
  })

  it('shows empty state when no logs', () => {
    const emptyStats = { ...mockStats, recentLogs: [] }
    render(<DashboardClient profile={{ role: 'funcionario', nome: 'Test' }} stats={emptyStats} userRole="funcionario" />)
    expect(screen.getByText('Nenhuma atividade registrada ainda.')).toBeTruthy()
  })
})
