import { apiRequest } from '../../lib/apiClient'

interface LoginResponse {
  token: string
}

export async function login(
  username: string,
  password: string,
): Promise<string> {
  const { token } = await apiRequest<LoginResponse>('/auth/login/', {
    method: 'POST',
    body: { username, password },
  })
  return token
}
