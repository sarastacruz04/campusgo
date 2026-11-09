import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/ui/IconButton';
import { SelectField } from '@/components/ui/SelectField';
import { TextField } from '@/components/ui/TextField';
import { spacing, TOUCH_GAP } from '@/theme/layout';
import type { Sector } from '@/types/database';

const ALL_SECTORS = 'todos';

type TripFiltersProps = {
  sectores: Sector[];
  sectorId: number | null;
  onChangeSector: (sectorId: number | null) => void;
  cupos: string;
  onChangeCupos: (text: string) => void;
  onSearch: () => void;
};

/**
 * Filtros del inicio de pasajero (pantalla 10), sobre la banda del título. Los sectores
 * vienen de la tabla real. Controles azules con texto claro y visible (V-03).
 */
export function TripFilters({
  sectores,
  sectorId,
  onChangeSector,
  cupos,
  onChangeCupos,
  onSearch,
}: TripFiltersProps) {
  const options = useMemo(
    () => [
      { value: ALL_SECTORS, label: 'Todos los sectores' },
      ...sectores.map((sector) => ({ value: String(sector.id), label: sector.nombre })),
    ],
    [sectores],
  );

  return (
    <View style={styles.container}>
      <SelectField
        label="Sectores"
        tone="brand"
        options={options}
        value={sectorId === null ? ALL_SECTORS : String(sectorId)}
        onChange={(value) => onChangeSector(value === ALL_SECTORS ? null : Number(value))}
      />
      <View style={styles.row}>
        <View style={styles.field}>
          <TextField
            label="Cantidad de puestos disponibles"
            tone="brand"
            value={cupos}
            onChangeText={onChangeCupos}
            inputMode="numeric"
            keyboardType="number-pad"
            maxLength={1}
            returnKeyType="search"
            onSubmitEditing={onSearch}
          />
        </View>
        <IconButton icon="magnify" accessibilityLabel="Buscar viajes" onPress={onSearch} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: TOUCH_GAP,
  },
  field: {
    flex: 1,
  },
});
