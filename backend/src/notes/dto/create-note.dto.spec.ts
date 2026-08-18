import { describe, expect, it } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateNoteDto } from './create-note.dto';
import { UpdateNoteDto } from './update-note.dto';

describe('CreateNoteDto', () => {
  const validateCreate = async (input: object) => {
    const dto = plainToInstance(CreateNoteDto, input);
    return validate(dto);
  };

  it('accepts a title with visible characters', async () => {
    const errors = await validateCreate({
      title: 'Shopping list',
      content: 'Milk',
    });
    expect(errors).toHaveLength(0);
  });

  it('allows an empty content field', async () => {
    const errors = await validateCreate({ title: 'Shopping list' });
    expect(errors).toHaveLength(0);
  });

  it('rejects a missing title', async () => {
    const errors = await validateCreate({ content: 'Milk' });
    expect(errors.some((error) => error.property === 'title')).toBe(true);
  });

  it('rejects an empty title', async () => {
    const errors = await validateCreate({ title: '' });
    const titleError = errors.find((error) => error.property === 'title');
    expect(titleError?.constraints).toMatchObject({
      isNotEmpty: 'Title cannot be empty',
    });
  });

  it('rejects a whitespace-only title', async () => {
    const errors = await validateCreate({ title: '   ' });
    const titleError = errors.find((error) => error.property === 'title');
    expect(titleError?.constraints).toMatchObject({
      isNotEmpty: 'Title cannot be empty',
    });
  });

  it('trims surrounding whitespace from the title', async () => {
    const dto = plainToInstance(CreateNoteDto, { title: '  Hello  ' });
    expect(dto.title).toBe('Hello');
    expect(await validate(dto)).toHaveLength(0);
  });
});

describe('UpdateNoteDto', () => {
  const validateUpdate = async (input: object) => {
    const dto = plainToInstance(UpdateNoteDto, input);
    return validate(dto);
  };

  it('allows updating content without sending a title', async () => {
    const errors = await validateUpdate({ content: 'Updated content' });
    expect(errors).toHaveLength(0);
  });

  it('rejects clearing the title', async () => {
    const errors = await validateUpdate({ title: '' });
    expect(errors.some((error) => error.property === 'title')).toBe(true);
  });

  it('rejects replacing the title with whitespace', async () => {
    const errors = await validateUpdate({ title: '   ' });
    expect(errors.some((error) => error.property === 'title')).toBe(true);
  });
});
