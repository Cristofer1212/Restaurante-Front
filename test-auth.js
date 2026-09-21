/**
 * TEST AUTOMATIZADO DE CONTRATOS, MODELOS Y VALIDACIONES
 * 
 * Verifica que todos los DTOs y adaptadores cumplan los contratos
 * simétricos con el backend Java com.restaurant.auth.
 */

import { RegisterUserRequest, LoginPinRequest, ClockRequest } from './src/modules/auth/models/auth.models.js';
import { sessionStore } from './src/core/storage/session-store.js';
import { inactivityTimer } from './src/core/security/inactivity-timer.js';
import { apiClient } from './src/core/http/api-client.js';
import { ENV } from './src/core/config/env.js';

async function runTests() {
  console.log('=== Verificando Modelos y Contratos Hexagonales ===');

  // 1. Validar RegisterUserRequest (Backoffice DTO)
  console.log('\n[1] Verificando RegisterUserRequest:');
  
  // 1.a Debe fallar si el PIN no tiene 4 dígitos
  try {
    const invalidReq = new RegisterUserRequest({
      rolId: 3,
      tipoDocumento: 'DNI',
      numeroDocumento: '72849102',
      nombre: 'Marco',
      apellido: 'Bartra',
      nombreUsuario: 'chef.marco',
      pin: '123', // Inválido
    });
    invalidReq.validate();
    console.error('FAIL: Debió fallar por PIN menor a 4 dígitos');
    process.exit(1);
  } catch (err) {
    console.log('✓ PASS: Rechazó PIN de 3 dígitos:', err.message);
  }

  // 1.b Debe serializar adecuadamente los datos requeridos por AuthHttpHandler
  const validRegReq = new RegisterUserRequest({
    rolId: 3,
    tipoDocumento: 'DNI',
    numeroDocumento: '72849102',
    nombre: 'Marco',
    apellido: 'Bartra',
    nombreUsuario: 'chef.marco',
    pin: '1234',
  });
  validRegReq.validate();
  const jsonReg = validRegReq.toJSON();
  if (jsonReg.rolId !== 3 || jsonReg.pin !== '1234' || jsonReg.numeroDocumento !== '72849102') {
    console.error('FAIL: Serialización incorrecta de RegisterUserRequest');
    process.exit(1);
  }
  console.log('✓ PASS: RegisterUserRequest serializa y valida con éxito');

  // 2. Validar LoginPinRequest (Terminal DTO)
  console.log('\n[2] Verificando LoginPinRequest:');
  try {
    const pinReq = new LoginPinRequest('', '1234');
    pinReq.validate();
    console.error('FAIL: Debió fallar por identificador vacío');
    process.exit(1);
  } catch (err) {
    console.log('✓ PASS: Rechazó identificador vacío:', err.message);
  }

  const validPinReq = new LoginPinRequest('72849102', '1234');
  validPinReq.validate();
  console.log('✓ PASS: LoginPinRequest validó DNI y PIN de 4 dígitos correctamente');

  // 3. Validar ClockRequest (Asistencia DTO)
  console.log('\n[3] Verificando ClockRequest:');
  try {
    const clockReq = new ClockRequest(0);
    clockReq.validate();
    console.error('FAIL: Debió fallar por usuarioId <= 0');
    process.exit(1);
  } catch (err) {
    console.log('✓ PASS: Rechazó ID de usuario inválido:', err.message);
  }
  const validClock = new ClockRequest(1);
  validClock.validate();
  console.log('✓ PASS: ClockRequest validó usuarioId');

  // 4. Validar SessionStore y RoleUiMetadata
  console.log('\n[4] Verificando SessionStore e InactivityTimer:');
  sessionStore.saveSession({
    token: 'jwt_test_token_123',
    usuarioId: 1,
    nombreCompleto: 'Marco Bartra',
    nombreUsuario: 'chef.marco',
    rol: 'COCINA',
    requiresClockIn: true,
    uiMetadata: {
      roleName: 'COCINA',
      inactivityTimeoutSeconds: 0,
      autoLock: false,
      fixedScreen: true,
    },
  });

  if (!sessionStore.isAuthenticated()) {
    console.error('FAIL: sessionStore no reconoció autenticación');
    process.exit(1);
  }
  console.log('✓ PASS: sessionStore guardó y recuperó sesión');

  inactivityTimer.configure(sessionStore.getUiMetadata());
  if (!inactivityTimer.isFixedScreen) {
    console.error('FAIL: InactivityTimer no reconoció fixedScreen para Cocina');
    process.exit(1);
  }
  console.log('✓ PASS: InactivityTimer configuró pantalla fija KDS para Cocina');

  // 5. Validar URL del backend real (sin modo mock)
  console.log('\n[5] Verificando ApiClient y endpoints reales:');
  if (apiClient.baseUrl !== 'http://localhost:8080') {
    console.error('FAIL: ApiClient no apunta a http://localhost:8080');
    process.exit(1);
  }
  console.log('✓ PASS: ApiClient configurado estrictamente hacia', apiClient.baseUrl);

  // Limpiar sesión de prueba
  sessionStore.clearSession();

  console.log('\n======================================================');
  console.log('✓ TODOS LOS CONTRATOS DEL SISTEMA PASARON AL 100%');
  console.log('======================================================\n');
  process.exit(0);
}

runTests();
