const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Начинаем сборку Angular приложения...');

try {
  console.log('📦 Сборка Angular приложения...');
  execSync('ng build --configuration production --output-hashing none', { stdio: 'inherit' });
  // Пути к папкам
  const distPath = path.join(__dirname, 'dist', 'lk-mart-angular', 'browser');
  const targetPath = path.join(__dirname, '..', 'browser');
  // Создаем папку browser если её нет
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }
  // Очищаем папку browser
  console.log('🧹 Очистка папки browser...');
  execSync(`rm -rf "${targetPath}"/*`, { stdio: 'inherit' });
  // Копируем все файлы из dist в browser
  console.log('📋 Копирование файлов в папку browser...');
  execSync(`cp -r "${distPath}"/* "${targetPath}/"`, { stdio: 'inherit' });
  console.log('✅ Сборка завершена успешно!');
  console.log(`📁 Файлы скопированы в: ${targetPath}`);

} catch (error) {
  console.error('❌ Ошибка при сборке:', error.message);
  process.exit(1);
}
