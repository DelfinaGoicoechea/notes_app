import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Body() createNoteDto: CreateNoteDto) {
    return this.notesService.create(createNoteDto);
  }

  @Get()
  findAll(@Query('category') category?: string) {
    return this.notesService.findAll(category);
  }

  @Get('archived')
  findArchived(@Query('category') category?: string) {
    return this.notesService.findArchived(category);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    return this.notesService.update(+id, updateNoteDto);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string) {
    return this.notesService.archive(+id);
  }

  @Patch(':id/unarchive')
  unarchive(@Param('id') id: string) {
    return this.notesService.unarchive(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notesService.remove(+id);
  }

  @Post(':id/categories')
  addCategory(@Param('id') id: string, @Body() body: { name?: string }) {
    return this.notesService.addCategory(+id, body?.name ?? '');
  }

  @Delete(':id/categories')
  removeCategory(@Param('id') id: string, @Query('name') name?: string) {
    return this.notesService.removeCategory(+id, name ?? '');
  }
}
