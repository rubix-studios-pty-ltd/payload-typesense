import type { PayloadHandler } from 'payload'

export const customEndpointHandler: PayloadHandler = () => {
  return Response.json({ message: 'Custom endpoint response' })
}
