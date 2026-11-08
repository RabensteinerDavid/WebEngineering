export async function checkResponse(response: Response): Promise<void> {
  if (response.ok) return;

  let detail = 'The request failed.';
  if (
    response.headers
      .get('content-type')
      ?.includes('application/problem+json') === true
  ) {
    const problem: unknown = await response.json();
    if (
      typeof problem === 'object' &&
      problem !== null &&
      'detail' in problem &&
      typeof problem.detail === 'string'
    ) {
      ({ detail } = problem);
    }
  }
  throw new Error(detail);
}
