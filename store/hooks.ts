import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from './store';

// Hooks tipados: las pantallas usan estos en lugar de useDispatch/useSelector
// para que TypeScript conozca la forma del estado y los thunks.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
