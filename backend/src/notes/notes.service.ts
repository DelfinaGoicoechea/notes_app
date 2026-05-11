import { Injectable } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Note } from './entities/note.entity';
import { Category } from './entities/category.entity';

@Injectable()
export class NotesService {

  constructor(
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  create(createNoteDto: CreateNoteDto) {
    const note = this.noteRepository.create(createNoteDto);
    return this.noteRepository.save(note);
  }

  findAll(categoryName?: string) {
    const qb = this.noteRepository
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.categories', 'category')
      .where('note.archived = :archived', { archived: false })
      .distinct(true)
      .orderBy('note.createdAt', 'DESC')
      .addOrderBy('note.updatedAt', 'DESC');

    this.applyCategoryPrefixFilter(qb, categoryName);

    return qb.getMany();
  }

  update(id: number, updateNoteDto: UpdateNoteDto) {
    return this.noteRepository.update(id, updateNoteDto);
  }

  remove(id: number) {
    return this.noteRepository.delete(id);
  }

  async archive(id: number) {
    const note = await this.noteRepository.findOneBy({ id });

    if (!note) return null;

    note.archived = true;
    return this.noteRepository.save(note);
  }

  async unarchive(id: number) {
    const note = await this.noteRepository.findOneBy({ id });

    if (!note) return null;

    note.archived = false;
    return this.noteRepository.save(note);
  }

  findArchived(categoryName?: string) {
    const qb = this.noteRepository
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.categories', 'category')
      .where('note.archived = :archived', { archived: true })
      .distinct(true)
      .orderBy('note.createdAt', 'DESC')
      .addOrderBy('note.updatedAt', 'DESC');

    this.applyCategoryPrefixFilter(qb, categoryName);

    return qb.getMany();
  }

  /** Canonical form for storage and matching */
  private normalizeCategoryName(name?: string): string | null {
    const n = name?.trim().toLowerCase();
    return n ? n : null;
  }

  /** Match while typing: stored names are lowercase; filter is normalized then prefix-matched. */
  private applyCategoryPrefixFilter(
    qb: SelectQueryBuilder<Note>,
    categoryName?: string,
  ) {
    const prefix = this.normalizeCategoryName(categoryName);
    if (!prefix) return;
    qb.andWhere('category.name LIKE :categoryPrefix', {
      categoryPrefix: `${prefix}%`,
    });
  }

  private async getOrCreateCategoryByName(name: string) {
    const canonical = this.normalizeCategoryName(name);
    if (!canonical) return null;

    const existing = await this.categoryRepository.findOne({
      where: { name: canonical },
    });
    if (existing) return existing;

    const created = this.categoryRepository.create({ name: canonical });
    return this.categoryRepository.save(created);
  }

  async addCategory(noteId: number, categoryName: string) {
    const note = await this.noteRepository.findOne({
      where: { id: noteId },
      relations: { categories: true },
    });
    if (!note) return null;

    const canonical = this.normalizeCategoryName(categoryName);
    if (!canonical) return note;

    const category = await this.getOrCreateCategoryByName(categoryName);
    if (!category) return note;

    const hasAlready = (note.categories ?? []).some(
      (c) => this.normalizeCategoryName(c.name) === canonical,
    );
    if (!hasAlready) {
      note.categories = [...(note.categories ?? []), category];
      await this.noteRepository.save(note);
    }

    return this.noteRepository.findOne({
      where: { id: noteId },
      relations: { categories: true },
    });
  }

  async removeCategory(noteId: number, categoryName: string) {
    const canonical = this.normalizeCategoryName(categoryName);
    if (!canonical) return null;

    const note = await this.noteRepository.findOne({
      where: { id: noteId },
      relations: { categories: true },
    });
    if (!note) return null;

    note.categories = (note.categories ?? []).filter(
      (c) => c.name.trim().toLowerCase() !== canonical,
    );
    await this.noteRepository.save(note);

    return this.noteRepository.findOne({
      where: { id: noteId },
      relations: { categories: true },
    });
  }
}
