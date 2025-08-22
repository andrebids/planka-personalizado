/*!
 * Script de Teste de Compatibilidade Sharp + FFmpeg
 * Testa se Sharp e FFmpeg funcionam juntos sem conflitos
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Iniciando testes de compatibilidade Sharp + FFmpeg...\n');

// Teste 1: Verificar se Sharp está funcionando
console.log('📋 Teste 1: Verificar Sharp');
try {
  const sharp = require('sharp');
  console.log('✅ Sharp carregado com sucesso');
  console.log('   Versão:', sharp.versions);
  console.log('   Formatos suportados:', Object.keys(sharp.format));
} catch (error) {
  console.error('❌ Erro ao carregar Sharp:', error.message);
  process.exit(1);
}

// Teste 2: Verificar se fluent-ffmpeg está disponível
console.log('\n📋 Teste 2: Verificar fluent-ffmpeg');
try {
  const ffmpeg = require('fluent-ffmpeg');
  console.log('✅ fluent-ffmpeg carregado com sucesso');
  console.log('   ffprobe disponível:', !!ffmpeg.ffprobe);
} catch (error) {
  console.error('❌ fluent-ffmpeg não instalado. Execute: npm install fluent-ffmpeg');
  console.log('   Continuando apenas com Sharp...');
}

// Teste 3: Verificar se FFmpeg está no sistema
console.log('\n📋 Teste 3: Verificar FFmpeg no sistema');
const { execSync } = require('child_process');

try {
  const ffmpegVersion = execSync('ffmpeg -version', { encoding: 'utf8' });
  console.log('✅ FFmpeg encontrado no sistema');
  console.log('   Versão:', ffmpegVersion.split('\n')[0]);
} catch (error) {
  console.error('❌ FFmpeg não encontrado no sistema');
  console.log('   Instale FFmpeg via: apk add ffmpeg (Alpine) ou apt-get install ffmpeg (Ubuntu)');
}

try {
  const ffprobeVersion = execSync('ffprobe -version', { encoding: 'utf8' });
  console.log('✅ ffprobe encontrado no sistema');
  console.log('   Versão:', ffprobeVersion.split('\n')[0]);
} catch (error) {
  console.error('❌ ffprobe não encontrado no sistema');
}

// Teste 4: Testar integração Sharp + FFmpeg (se ambos disponíveis)
console.log('\n📋 Teste 4: Testar integração Sharp + FFmpeg');

const testVideoPath = process.argv[2] || 'test-video.mp4';

if (!fs.existsSync(testVideoPath)) {
  console.log('⚠️  Arquivo de vídeo de teste não encontrado:', testVideoPath);
  console.log('   Execute: node test-sharp-ffmpeg-compatibility.js /path/to/video.mp4');
  console.log('   Ou crie um arquivo test-video.mp4 no diretório atual');
} else {
  console.log('🎬 Testando com vídeo:', testVideoPath);

  try {
    const ffmpeg = require('fluent-ffmpeg');
    const sharp = require('sharp');

    // Extrair frame com FFmpeg
    console.log('   Extraindo frame com FFmpeg...');

    await new Promise((resolve, reject) => {
      ffmpeg(testVideoPath)
        .screenshots({
          timestamps: ['00:00:01'],
          filename: 'test-frame.png',
          folder: './'
        })
        .on('end', () => {
          console.log('   ✅ Frame extraído com sucesso');
          resolve();
        })
        .on('error', (err) => {
          console.error('   ❌ Erro ao extrair frame:', err.message);
          reject(err);
        });
    });

    // Processar com Sharp
    console.log('   Processando frame com Sharp...');

    const frameBuffer = await sharp('test-frame.png')
      .resize(360, 360, {
        fit: 'outside',
        withoutEnlargement: true
      })
      .png({ quality: 75 })
      .toBuffer();

    console.log('   ✅ Frame processado com Sharp:', frameBuffer.length, 'bytes');

    // Salvar resultado
    await sharp(frameBuffer).toFile('test-thumbnail-360.png');
    console.log('   ✅ Thumbnail salvo: test-thumbnail-360.png');

    // Limpar arquivo temporário
    fs.unlinkSync('test-frame.png');
    console.log('   ✅ Arquivo temporário removido');

    console.log('\n🎉 Integração Sharp + FFmpeg funcionando perfeitamente!');

  } catch (error) {
    console.error('❌ Erro na integração:', error.message);
    console.error('   Stack trace:', error.stack);
  }
}

// Teste 5: Verificar compatibilidade com Docker
console.log('\n📋 Teste 5: Verificar compatibilidade Docker');

const isDocker = fs.existsSync('/.dockerenv');
console.log('   Executando em Docker:', isDocker ? 'Sim' : 'Não');

if (isDocker) {
  console.log('   Verificando permissões...');
  try {
    fs.writeFileSync('/tmp/test-write', 'test');
    fs.unlinkSync('/tmp/test-write');
    console.log('   ✅ Permissões de escrita OK');
  } catch (error) {
    console.error('   ❌ Problema com permissões:', error.message);
  }
}

// Teste 6: Verificar memória e recursos
console.log('\n📋 Teste 6: Verificar recursos do sistema');

const memUsage = process.memoryUsage();
console.log('   Uso de memória:');
console.log('     RSS:', Math.round(memUsage.rss / 1024 / 1024), 'MB');
console.log('     Heap Used:', Math.round(memUsage.heapUsed / 1024 / 1024), 'MB');
console.log('     Heap Total:', Math.round(memUsage.heapTotal / 1024 / 1024), 'MB');

// Teste 7: Verificar versões Node.js e npm
console.log('\n📋 Teste 7: Verificar ambiente Node.js');

console.log('   Node.js:', process.version);
console.log('   Plataforma:', process.platform);
console.log('   Arquitetura:', process.arch);

try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log('   npm:', npmVersion);
} catch (error) {
  console.log('   npm: Não disponível');
}

console.log('\n📊 Resumo dos Testes:');
console.log('=====================');

// Contar resultados
let passed = 0;
let failed = 0;
let warnings = 0;

// Verificar resultados dos testes
if (require('sharp')) passed++;
if (require('fluent-ffmpeg')) passed++;
else warnings++;

try {
  execSync('ffmpeg -version', { stdio: 'ignore' });
  passed++;
} catch (error) {
  failed++;
}

try {
  execSync('ffprobe -version', { stdio: 'ignore' });
  passed++;
} catch (error) {
  failed++;
}

console.log(`✅ Testes passados: ${passed}`);
console.log(`❌ Testes falhados: ${failed}`);
console.log(`⚠️  Avisos: ${warnings}`);

if (failed === 0) {
  console.log('\n🎉 Todos os testes críticos passaram!');
  console.log('   O sistema está pronto para processamento de vídeos.');
} else {
  console.log('\n⚠️  Alguns testes falharam.');
  console.log('   Verifique as dependências antes de prosseguir.');
}

console.log('\n📝 Próximos passos:');
console.log('1. Se todos os testes passaram, você pode prosseguir com a implementação');
console.log('2. Se algum teste falhou, corrija as dependências primeiro');
console.log('3. Execute este script novamente após as correções');
console.log('4. Para testar em Docker, execute: docker run --rm -v $(pwd):/app node:18-alpine sh -c "cd /app && apk add ffmpeg && npm install && node test-sharp-ffmpeg-compatibility.js"');
