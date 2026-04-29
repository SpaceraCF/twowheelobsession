import type { CollectionConfig } from 'payload'

export const ServiceRequests: CollectionConfig = {
  slug: 'service-requests',
  admin: {
    useAsTitle: 'displayTitle',
    defaultColumns: ['createdAt', 'name', 'bikeMake', 'bikeModel', 'serviceType', 'preferredDate', 'status'],
    group: 'Enquiries',
  },
  access: {
    create: () => true,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.name && data.bikeMake && data.bikeModel) {
          const year = data.bikeYear ? `${data.bikeYear} ` : ''
          data.displayTitle = `${data.name} — ${year}${data.bikeMake} ${data.bikeModel}`.trim()
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'bikeMake', type: 'text', required: true },
    { name: 'bikeModel', type: 'text', required: true },
    { name: 'bikeYear', type: 'number' },
    { name: 'bikeKms', type: 'number', label: 'Kilometres' },
    { name: 'bikeRego', type: 'text', label: 'Registration plate' },
    {
      name: 'serviceType',
      type: 'select',
      required: true,
      options: [
        { label: 'Scheduled service', value: 'scheduled' },
        { label: 'Repair', value: 'repair' },
        { label: 'Tyres', value: 'tyres' },
        { label: 'Roadworthy / inspection', value: 'inspection' },
        { label: 'Warranty', value: 'warranty' },
        { label: 'Other', value: 'other' },
      ],
    },
    { name: 'preferredDate', type: 'date' },
    { name: 'description', type: 'textarea', required: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'In workshop', value: 'in-workshop' },
        { label: 'Ready for pickup', value: 'ready' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    { name: 'bookedDate', type: 'date' },
    { name: 'estimatedCost', type: 'number' },
    { name: 'actualCost', type: 'number' },
    { name: 'workshopNotes', type: 'textarea' },
    { name: 'displayTitle', type: 'text', admin: { readOnly: true, description: 'Auto-generated from name + bike.' } },
  ],
}
