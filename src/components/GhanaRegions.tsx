'use client'

interface GhanaRegionsProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
  className?: string
}

const regions = [
  'Ashanti',
  'Ahafo',
  'Bono',
  'Bono East',
  'Central',
  'Eastern',
  'Greater Accra',
  'Northern',
  'North East',
  'Oti',
  'Savannah',
  'Upper East',
  'Upper West',
  'Volta',
  'Western',
  'Western North'
 
   
]

export default function GhanaRegions({ value, onChange, required = false, className = '' }: GhanaRegionsProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className={`w-full border rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-pink-500 ${className}`}
    >
      <option value="">Select Region</option>
      {regions.map((region) => (
        <option key={region} value={region}>
          {region}
        </option>
      ))}
    </select>
  )
}