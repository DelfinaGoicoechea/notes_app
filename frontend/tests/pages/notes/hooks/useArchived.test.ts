import { renderHook, waitFor } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { toast } from 'react-hot-toast';
import { useArchived } from "../../../../src/pages/notes/hooks/useArchived";
import * as notesService from '../../../../src/services/notes.service';