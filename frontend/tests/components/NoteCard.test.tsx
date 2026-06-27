import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { toast } from 'react-hot-toast';
import NoteCard from '../../src/components/NoteCard';
import * as noteService from '../../src/services/notes.service';

vi.mock('react-hot-toast');
vi.mock('../../src/services/notes.service');

describe('NoteCard - Error Handling (FE-003)', () => {
  const mockNote = {
    id: 1,
    title: 'Test Note',
    content: 'Test content',
    archived: false,
    categories: [{ id: 1, name: 'work' }]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Update Note', () => {
    test('shows error toast when update fails', async () => {
      //mocks API to fail, edit and save, should show toast error
    });

    test('preserves form values when update fails', async () => {
      //on error, should not exit edit mode, should not modify the changes
    });

    test('logs errors to console for debugging', async () => {
      //verify console.error is called with proper message
    });

    test('enters edit mode when Edit button clicked', () => {
      //async?
      //click "Edit", should show input fields with current values
    });

    test('updates note and calls onUpdated when update succeeds', async () => {
      //edit title/content, click save, exits edit mode, calls onUpdated
    }); 

    test('cancels edit mode when Cancel button clicked', () => {
      //async?
      //click "Cancel", returns to view mode without saving
    });
  });
});