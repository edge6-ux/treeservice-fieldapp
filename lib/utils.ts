export function fmtDate(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function fmtDateTime(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    new: 'New',
    reviewed: 'Reviewed',
    quoted: 'Quoted',
    won: 'Won',
    lost: 'Lost',
  }
  return labels[status] || status
}

export function statusColors(status: string): { bg: string; color: string } {
  const map: Record<string, { bg: string; color: string }> = {
    new: { bg: '#EDE9FE', color: '#6D28D9' },
    reviewed: { bg: '#DBEAFE', color: '#1D4ED8' },
    quoted: { bg: '#FEF3C7', color: '#92400E' },
    won: { bg: '#D1FAE5', color: '#065F46' },
    lost: { bg: '#F3F4F6', color: '#6B7280' },
  }
  return map[status] || { bg: '#F3F4F6', color: '#6B7280' }
}
