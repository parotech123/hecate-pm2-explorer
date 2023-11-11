import { writable } from 'svelte/store';
import type { ProcessData } from '../PM2Wrapper';

export const selectedProcess = writable < ProcessData | null > (null);