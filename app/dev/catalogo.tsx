import { Redirect, router } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View, type HostInstance } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { BottomTabBar, type TabItem } from '@/components/ui/BottomTabBar';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog, type DialogTone } from '@/components/ui/ConfirmDialog';
import { IconButton } from '@/components/ui/IconButton';
import { LoadingState } from '@/components/ui/LoadingState';
import { Logo } from '@/components/ui/Logo';
import { PhotoPicker } from '@/components/ui/PhotoPicker';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { ScreenLayout, type AppMode } from '@/components/ui/ScreenLayout';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { SwitchRow } from '@/components/ui/SwitchRow';
import { TextField, type TextInputRef } from '@/components/ui/TextField';
import { useAnnounce } from '@/hooks/useAnnounce';
import { useHaptics } from '@/hooks/useHaptics';
import { radius, spacing } from '@/theme/layout';
import { useTheme, type ThemePreference } from '@/theme/ThemeProvider';

type TabKey = 'inicio' | 'reservas' | 'curso';

const TABS: TabItem<TabKey>[] = [
  { key: 'inicio', label: 'Inicio', icon: 'home-outline' },
  { key: 'reservas', label: 'Reservas', icon: 'map-marker-radius-outline' },
  { key: 'curso', label: 'Curso', icon: 'road-variant' },
];

type DialogDemo = {
  tone: DialogTone;
  title: string;
  message: string;
  confirm: string;
  cancel?: string;
};

const DIALOGS: Record<DialogTone, DialogDemo> = {
  question: {
    tone: 'question',
    title: '¿Está seguro que desea cancelar esta reserva?',
    message: 'Esta acción no se puede deshacer.',
    confirm: 'Sí, cancelar reserva',
    cancel: 'No, volver',
  },
  error: {
    tone: 'error',
    title: 'No se pudo iniciar sesión',
    message: 'El correo o la contraseña no son correctos.',
    confirm: 'Volver',
  },
  success: {
    tone: 'success',
    title: 'Reserva realizada con éxito',
    message: 'Tu reserva quedó pendiente de la confirmación del conductor.',
    confirm: '¡Listo!',
  },
};

/**
 * Catálogo de componentes, solo en desarrollo (__DEV__). Sirve para revisar cada
 * componente con TalkBack, con el texto al 200 % y en los tres temas antes de
 * usarlo en una pantalla real. En una compilación de producción redirige al inicio.
 */
export default function CatalogScreen() {
  if (!__DEV__) return <Redirect href="/" />;
  return <Catalog />;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      <AppText variant="subtitle" accessibilityRole="header">
        {title}
      </AppText>
      {children}
    </View>
  );
}

function Catalog() {
  const { preferences, setPreference } = useTheme();
  const announce = useAnnounce();
  const haptics = useHaptics();
  const [mode, setMode] = useState<AppMode>('pasajero');
  const [tab, setTab] = useState<TabKey>('inicio');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [hasCar, setHasCar] = useState<'no' | 'si'>('no');
  const [loading, setLoading] = useState(false);
  const [dialogTone, setDialogTone] = useState<DialogTone>('question');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [lastPicker, setLastPicker] = useState<string | null>(null);
  const passwordRef = useRef<TextInputRef>(null);
  // Un ref por botón: al cerrar el diálogo, el foco vuelve al que lo abrió (S-08).
  const questionRef = useRef<HostInstance>(null);
  const errorRef = useRef<HostInstance>(null);
  const successRef = useRef<HostInstance>(null);
  const openerRef = { question: questionRef, error: errorRef, success: successRef }[dialogTone];

  const idError = id.length > 0 && !/^\d{10}$/.test(id) ? 'Debe tener exactamente 10 dígitos.' : '';
  const activeDialog = DIALOGS[dialogTone];
  const openDialog = (tone: DialogTone) => {
    setDialogTone(tone);
    setDialogVisible(true);
  };

  const simulateSubmit = () => {
    setLoading(true);
    announce('Enviando');
    setTimeout(() => {
      setLoading(false);
      haptics.success();
      announce('Envío terminado');
    }, 1500);
  };

  return (
    <ScreenLayout
      title="Catálogo de componentes"
      mode={mode}
      onChangeMode={setMode}
      onPressProfile={() => router.push('/settings/accessibility')}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      bottomBar={<BottomTabBar tabs={TABS} activeKey={tab} onPressTab={setTab} />}
    >
      <Section title="Tema">
        <RadioGroup<ThemePreference>
          label="Tema de la app"
          options={[
            { value: 'light', label: 'Claro' },
            { value: 'dark', label: 'Oscuro' },
            { value: 'highContrast', label: 'Alto contraste' },
            { value: 'system', label: 'Sistema' },
          ]}
          value={preferences.theme}
          onChange={(value) => setPreference('theme', value)}
        />
      </Section>

      <Section title="Logo">
        <Logo size="large" />
        <Logo size="small" />
      </Section>

      <Section title="Botones">
        <Button
          label="Iniciar Sesión"
          onPress={simulateSubmit}
          loading={loading}
          loadingLabel="Enviando…"
        />
        <Button label="Registrarse" variant="secondary" onPress={() => announce('Registrarse')} />
        <Button label="Botón deshabilitado" disabled onPress={() => undefined} />
        <View style={styles.row}>
          <IconButton
            icon="plus"
            variant="filled"
            accessibilityLabel="Reservar viaje"
            onPress={() => announce('Más')}
          />
          <IconButton
            icon="magnify"
            compact
            accessibilityLabel="Buscar viajes"
            onPress={() => announce('Buscar')}
          />
          <IconButton
            icon="trash-can-outline"
            compact
            accessibilityLabel="Cancelar reserva"
            onPress={() => announce('Papelera')}
          />
          <IconButton
            icon="pencil"
            compact
            accessibilityLabel="Editar perfil"
            onPress={() => announce('Editar')}
          />
          <IconButton
            icon="power"
            accessibilityLabel="Cerrar sesión"
            onPress={() => announce('Cerrar sesión')}
          />
        </View>
      </Section>

      <Section title="Campos de texto">
        <TextField
          label="ID de la Universidad"
          hint="10 dígitos"
          value={id}
          onChangeText={setId}
          inputMode="numeric"
          maxLength={10}
          error={idError}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          placeholder="0000123456"
        />
        <TextField
          ref={passwordRef}
          label="Contraseña"
          hint="Al menos 6 caracteres"
          value={password}
          onChangeText={setPassword}
          password
          autoComplete="password"
          textContentType="password"
          returnKeyType="done"
        />
      </Section>

      <Section title="Opciones">
        <RadioGroup
          label="¿Quieres registrar un carro?"
          direction="row"
          options={[
            { value: 'no', label: 'No' },
            { value: 'si', label: 'Sí' },
          ]}
          value={hasCar}
          onChange={setHasCar}
        />
        <SwitchRow
          label="Vibración"
          description="Vibra al confirmar una acción o cuando ocurre un error."
          value={preferences.haptics}
          onValueChange={(value) => setPreference('haptics', value)}
        />
      </Section>

      <Section title="Registro y fotos">
        <StepIndicator current={2} total={6} />
        <PhotoPicker
          variant="avatar"
          label="Foto de perfil"
          hint="Abre la galería o la cámara"
          onPress={() => setLastPicker('Foto de perfil')}
        />
        <PhotoPicker
          label="Foto del SOAT vigente"
          hint="Abre la galería o la cámara"
          onPress={() => setLastPicker('Foto del SOAT vigente')}
        />
        {lastPicker ? (
          <StatusBanner
            tone="info"
            haptic={false}
            message={`Tocaste "${lastPicker}". La galería y la cámara se conectan en la Etapa 4.`}
          />
        ) : null}
      </Section>

      <Section title="Estados">
        <LoadingState message="Cargando viajes…" />
        <StatusBanner
          tone="offline"
          haptic={false}
          message="Sin conexión: mostrando datos guardados"
        />
        <StatusBanner
          tone="error"
          haptic={false}
          message="No se pudieron cargar los viajes."
          onRetry={() => announce('Reintentando')}
        />
        <StatusBanner tone="success" haptic={false} message="Viaje creado con éxito." />
      </Section>

      <Section title="Diálogos">
        <Button
          ref={questionRef}
          label="Diálogo de confirmación"
          onPress={() => openDialog('question')}
        />
        <Button
          ref={errorRef}
          label="Diálogo de error"
          variant="secondary"
          onPress={() => openDialog('error')}
        />
        <Button
          ref={successRef}
          label="Diálogo de éxito"
          variant="secondary"
          onPress={() => openDialog('success')}
        />
      </Section>

      <ConfirmDialog
        visible={dialogVisible}
        tone={activeDialog.tone}
        title={activeDialog.title}
        message={activeDialog.message}
        confirmLabel={activeDialog.confirm}
        cancelLabel={activeDialog.cancel}
        returnFocusRef={openerRef}
        onCancel={() => setDialogVisible(false)}
        onConfirm={() => {
          if (activeDialog.tone === 'error') haptics.error();
          else haptics.success();
          setDialogVisible(false);
        }}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    alignItems: 'center',
  },
});
