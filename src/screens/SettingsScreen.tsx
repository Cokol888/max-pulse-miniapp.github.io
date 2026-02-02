import { useMemo, useState } from 'react';
import { Panel, Container, Grid, Typography, Button } from '@maxhub/max-ui';
import { getWebApp, isInMax, openLink, requestContact } from '../lib/max';
import { validateInitData, type ValidationState } from '../lib/validation';

const SettingsScreen = () => {
  const webApp = getWebApp();
  const [contact, setContact] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [validation, setValidation] = useState<ValidationState | null>(null);
  const [screenCaptureEnabled, setScreenCaptureEnabled] = useState<boolean>(
    webApp?.ScreenCapture?.isScreenCaptureEnabled ?? false,
  );

  const userInfo = useMemo(() => webApp?.initDataUnsafe.user, [webApp]);
  const chatInfo = useMemo(() => webApp?.initDataUnsafe.chat, [webApp]);

  const handleRequestContact = async () => {
    setStatus('');
    const result = await requestContact();
    if (result?.phone) {
      setContact(result.phone);
      setStatus('Телефон получен.');
    } else {
      setStatus('Телефон не получен.');
    }
  };

  const handleValidate = async () => {
    setStatus('');
    const result = await validateInitData();
    setValidation(result);
  };

  const toggleScreenCapture = () => {
    if (!webApp?.ScreenCapture) {
      setStatus('ScreenCapture недоступен.');
      return;
    }

    if (screenCaptureEnabled) {
      webApp.ScreenCapture.disableScreenCapture();
      setScreenCaptureEnabled(false);
    } else {
      webApp.ScreenCapture.enableScreenCapture();
      setScreenCaptureEnabled(true);
    }
  };

  const handleMaxBrightness = () => {
    webApp?.requestScreenMaxBrightness?.();
  };

  const handleRestoreBrightness = () => {
    webApp?.restoreScreenBrightness?.();
  };

  return (
    <Panel>
      <Container>
        <Grid>
          <Typography.Title variant="large-strong">Настройки</Typography.Title>
          <Typography.Body variant="small">
            Platform: {webApp?.platform ?? 'unknown'} | Version: {webApp?.version ?? 'unknown'}
          </Typography.Body>

          <Grid>
            <Typography.Label variant="small-strong">Пользователь</Typography.Label>
            <Typography.Body variant="small">
              {userInfo
                ? `${userInfo.first_name ?? ''} ${userInfo.last_name ?? ''} (@${userInfo.username ?? '-'}) id=${userInfo.id}`
                : 'Нет данных'}
            </Typography.Body>
          </Grid>

          <Grid>
            <Typography.Label variant="small-strong">Чат</Typography.Label>
            <Typography.Body variant="small">
              {chatInfo ? `id=${chatInfo.id} type=${chatInfo.type ?? '-'}` : 'Нет данных'}
            </Typography.Body>
          </Grid>

          <Grid>
            <Button onClick={handleRequestContact}>Запросить телефон</Button>
            {contact && <Typography.Body variant="small">Телефон: {contact}</Typography.Body>}
          </Grid>

          <Grid>
            <Typography.Label variant="small-strong">Security / Validation</Typography.Label>
            <Button onClick={handleValidate}>Проверить подлинность</Button>
            {validation && validation.skipped && (
              <Typography.Body variant="small">
                Skipped: {validation.reason ?? 'not in MAX'}
              </Typography.Body>
            )}
            {validation && validation.ok && (
              <Typography.Body variant="small">
                ✅ Validated: user=
                {String(
                  (validation.data?.user as { id?: number; username?: string })?.id ?? '-',
                )}{' '}
                {String((validation.data?.user as { username?: string })?.username ?? '')}{' '}
                start_param=
                {validation.data?.start_param ?? '-'}
              </Typography.Body>
            )}
            {validation && !validation.ok && !validation.skipped && (
              <Typography.Body variant="small">
                ❌ Not validated: {validation.reason}
              </Typography.Body>
            )}
          </Grid>

          <Grid>
            <Typography.Label variant="small-strong">Документы</Typography.Label>
            <Grid>
              <Button onClick={() => openLink('/privacy.html')}>Политика конфиденциальности</Button>
              <Button onClick={() => openLink('/terms.html')}>Пользовательское соглашение</Button>
            </Grid>
          </Grid>

          <Grid>
            <Typography.Label variant="small-strong">Запретить скриншоты</Typography.Label>
            <Typography.Body variant="small">
              Статус: {screenCaptureEnabled ? 'включен (запрет активен)' : 'выключен'}
            </Typography.Body>
            <Button onClick={toggleScreenCapture}>
              {screenCaptureEnabled ? 'Выключить запрет' : 'Включить запрет'}
            </Button>
          </Grid>

          <Grid>
            <Typography.Label variant="small-strong">Focus mode</Typography.Label>
            <Grid>
              <Button onClick={handleMaxBrightness}>Яркость на максимум (30 сек)</Button>
              <Button onClick={handleRestoreBrightness}>Вернуть яркость</Button>
            </Grid>
          </Grid>

          {!isInMax() && (
            <Typography.Body variant="small">
              Некоторые функции доступны только внутри MAX.
            </Typography.Body>
          )}

          {status && <Typography.Body variant="small">{status}</Typography.Body>}
        </Grid>
      </Container>
    </Panel>
  );
};

export default SettingsScreen;