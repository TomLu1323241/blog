import { Api } from '../shared/api';

export async function revalidate(path: string): Promise<void> {
  await fetch(`/${Api.api}/${Api.revalidate}?path=${path}`);
}
