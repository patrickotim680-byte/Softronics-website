'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { requireServerSupabase } from '@/lib/supabase/server';
import { fieldErrors, projectSchema } from '@/lib/validation/schemas';
import { slugify } from '@/lib/utils';
import { errorState, successState, type ActionState } from './types';
import { checkbox, integer, nullableInteger, optional, text } from './form';
import type { ProjectStatus } from '@/types/database';

function readProjectForm(formData: FormData) {
  const name = text(formData, 'name');
  const slugInput = text(formData, 'slug').trim();

  return {
    name,
    slug: slugInput.length > 0 ? slugify(slugInput) : slugify(name),
    summary: optional(formData, 'summary'),
    description: optional(formData, 'description'),
    sector: optional(formData, 'sector'),
    status: (text(formData, 'status') || 'in_progress') as ProjectStatus,
    year: nullableInteger(formData, 'year'),
    image_url: optional(formData, 'image_url'),
    is_published: checkbox(formData, 'is_published'),
    sort_order: integer(formData, 'sort_order', 0),
  };
}

export async function saveProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin('/admin/projects');
  const id = optional(formData, 'id');

  const parsed = projectSchema.safeParse(readProjectForm(formData));
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Check the highlighted fields.',
      errors: fieldErrors(parsed.error),
    };
  }

  const supabase = await requireServerSupabase();
  let projectId = id;

  try {
    if (id) {
      const { error } = await supabase.from('projects').update(parsed.data).eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      const { data, error } = await supabase
        .from('projects')
        .insert(parsed.data)
        .select('id')
        .single();
      if (error) throw new Error(error.message);
      projectId = (data as { id: string }).id;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('duplicate key') && message.includes('slug')) {
      return errorState('That slug is already used by another project.', {
        slug: 'This slug is already taken.',
      });
    }
    return errorState(`Could not save the project: ${message}`);
  }

  revalidatePath('/about');
  revalidatePath('/admin/projects');

  if (!id && projectId) redirect(`/admin/projects/${projectId}?saved=1`);
  return successState('Project saved.');
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  await requireAdmin('/admin/projects');
  const id = optional(formData, 'id');
  if (!id) return;

  const supabase = await requireServerSupabase();
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw new Error(`Could not delete the project: ${error.message}`);

  revalidatePath('/about');
  revalidatePath('/admin/projects');
  redirect('/admin/projects?deleted=1');
}
