# 📋 Plano de Implementação Corrigido: Thumbnails de Vídeo
## Versão Compatível com Sistema Atual + Testes Sharp + FFmpeg

---

## 🎯 **Objetivo Geral**
Integrar thumbnails de vídeo no sistema Planka **mantendo total compatibilidade** com módulos existentes e **testando adequadamente** a compatibilidade Sharp + FFmpeg.

---

## ✅ **CORREÇÕES APLICADAS AO PLANO ORIGINAL:**

### **1. MANTER VERSÕES NODE.JS ATUAIS**
- ❌ **Plano Original:** Mudar para `node:20-alpine`
- ✅ **Plano Corrigido:** Manter `node:18-alpine` e `node:lts`

### **2. SEGUIR PADRÃO DE THUMBNAILS EXISTENTE**
- ❌ **Plano Original:** `videoThumbnailUrls.frame0360`
- ✅ **Plano Corrigido:** `videoThumbnails.outside360` (igual às imagens)

### **3. CRIAR HELPER SEPARADO PARA VÍDEOS**
- ❌ **Plano Original:** Modificar `process-uploaded-file.js`
- ✅ **Plano Corrigido:** Criar `video-thumbnail-generator.js` separado

### **4. INTEGRAR SEM QUEBRAR PHOTOSWIPE**
- ❌ **Plano Original:** Forçar integração com Photoswipe
- ✅ **Plano Corrigido:** Usar componente separado para vídeos

### **5. MANTER DOCKERFILES ATUAIS**
- ❌ **Plano Original:** Mudanças drásticas no Dockerfile
- ✅ **Plano Corrigido:** Apenas adicionar FFmpeg

---

## 🚀 **FASE 1: TESTES DE COMPATIBILIDADE SHARP + FFMPEG**

### **1.1 Teste de Compatibilidade Sharp Atual**
```bash
# Verificar versão Sharp atual
cd boards/server
npm list sharp

# Testar Sharp isoladamente
node -e "
const sharp = require('sharp');
console.log('Sharp version:', sharp.versions);
console.log('Sharp working:', !!sharp.versions);
console.log('Sharp formats:', sharp.format);
"
```

### **1.2 Teste de Instalação FFmpeg (Sem Mudar Dockerfile)**
```bash
# Testar se FFmpeg pode ser instalado via apk
docker run --rm node:18-alpine sh -c "
apk add ffmpeg --no-cache
ffmpeg -version
ffprobe -version
"

# Testar se Sharp continua funcionando com FFmpeg
docker run --rm node:18-alpine sh -c "
apk add ffmpeg --no-cache
node -e \"
const sharp = require('sharp');
console.log('Sharp OK:', !!sharp.versions);
\"
"
```

### **1.3 Teste de Compatibilidade fluent-ffmpeg**
```bash
# Instalar fluent-ffmpeg temporariamente
cd boards/server
npm install fluent-ffmpeg --save

# Testar se funciona com FFmpeg do sistema
node -e "
const ffmpeg = require('fluent-ffmpeg');
console.log('fluent-ffmpeg OK:', !!ffmpeg);
console.log('ffprobe available:', !!ffmpeg.ffprobe);
"

# Testar extração de frame simples
node -e "
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

if (fs.existsSync('test-video.mp4')) {
  ffmpeg('test-video.mp4')
    .screenshots({
      timestamps: ['00:00:01'],
      filename: 'test-frame.png',
      folder: './'
    })
    .on('end', () => console.log('Frame extraído com sucesso'))
    .on('error', (err) => console.error('Erro:', err.message));
} else {
  console.log('Arquivo test-video.mp4 não encontrado');
}
"
```

### **1.4 Teste de Integração Sharp + FFmpeg**
```bash
# Testar se Sharp consegue processar frames do FFmpeg
node -e "
const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp');
const fs = require('fs');

async function testIntegration() {
  try {
    // Extrair frame com FFmpeg
    await new Promise((resolve, reject) => {
      ffmpeg('test-video.mp4')
        .screenshots({
          timestamps: ['00:00:01'],
          filename: 'test-frame.png',
          folder: './'
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Processar com Sharp
    const buffer = await sharp('test-frame.png')
      .resize(360, 360, { fit: 'outside' })
      .png()
      .toBuffer();

    console.log('Integração Sharp + FFmpeg OK:', buffer.length, 'bytes');

    // Limpar
    fs.unlinkSync('test-frame.png');
  } catch (error) {
    console.error('Erro na integração:', error.message);
  }
}

testIntegration();
"
```

---

## 🔧 **FASE 2: IMPLEMENTAÇÃO CORRIGIDA**

### **2.1 Atualizar Dockerfile (Mínimo)**
**Arquivo:** `boards/Dockerfile`

```dockerfile
FROM node:18-alpine AS server-dependencies

RUN apk -U upgrade \
  && apk add build-base python3 ffmpeg --no-cache
  # ↑ APENAS ADICIONAR FFMPEG

WORKDIR /app

COPY server/package.json server/package-lock.json server/requirements.txt ./
COPY server/setup-python.js ./

RUN npm install npm --global \
  && npm install --omit=dev

FROM node:lts AS client

WORKDIR /app

COPY client .

RUN npm install npm --global \
  && npm install --omit=dev

RUN DISABLE_ESLINT_PLUGIN=true npm run build

FROM node:18-alpine

RUN apk -U upgrade \
  && apk add bash python3 ffmpeg --no-cache \
  # ↑ APENAS ADICIONAR FFMPEG
  && npm install npm --global

USER node
WORKDIR /app

COPY --chown=node:node server ./
COPY --from=server-dependencies --chown=node:node /app/setup-python.js ./

RUN python3 -m venv .venv \
  && .venv/bin/pip install -r requirements.txt --no-cache-dir \
  && mv env.sample .env \
  && ls -la \
  && chmod +x start.sh \
  && ls -la start.sh \
  && npm config set update-notifier false

COPY --from=server-dependencies --chown=node:node /app/node_modules node_modules

# Copy client build files to public
COPY --from=client --chown=node:node /app/dist public
COPY --from=client --chown=node:node /app/dist/index.html views

# Copy server public files (this will merge with client files)
COPY --chown=node:node server/public/* public/

VOLUME /app/public/favicons
VOLUME /app/public/user-avatars
VOLUME /app/public/background-images
VOLUME /app/private/attachments

EXPOSE 1337

HEALTHCHECK --interval=10s --timeout=2s --start-period=15s \
  CMD node ./healthcheck.js

CMD ["bash", "-c", "export NODE_ENV=production && node db/init.js && exec node app.js --prod"]
```

### **2.2 Atualizar Dockerfile.dev (Mínimo)**
**Arquivo:** `boards/Dockerfile.dev`

```dockerfile
FROM node:lts-alpine

RUN apk -U upgrade \
  && apk add bash build-base python3 xdg-utils ffmpeg --no-cache \
  # ↑ APENAS ADICIONAR FFMPEG
  && npm install npm --global

WORKDIR /app
```

### **2.3 Instalar fluent-ffmpeg**
```bash
cd boards/server
npm install fluent-ffmpeg --save
```

### **2.4 Criar Helper de Thumbnails de Vídeo (Separado)**
**Arquivo:** `boards/server/api/helpers/attachments/video-thumbnail-generator.js`

```javascript
/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
  inputs: {
    videoPath: {
      type: 'string',
      required: true,
    },
    outputDir: {
      type: 'string',
      required: true,
    },
    filename: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const { videoPath, outputDir, filename } = inputs;

    console.log('🎬 Iniciando geração de thumbnails para vídeo:', filename);

    // Verificar se FFmpeg está disponível
    try {
      await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err) => {
          if (err && err.message.includes('ffmpeg')) {
            reject(new Error('FFmpeg não está disponível no sistema'));
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('❌ FFmpeg não disponível:', error.message);
      throw new Error('FFmpeg não está instalado ou não está no PATH do sistema');
    }

    // Criar diretório de saída se não existir
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (error) {
      console.error('❌ Erro ao criar diretório:', error.message);
      throw error;
    }

    // Definir timestamps para extração de frames (1s, 5s, 10s)
    const timestamps = ['00:00:01', '00:00:05', '00:00:10'];
    const thumbnails = [];

    try {
      // Obter metadados do vídeo
      const metadata = await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
          if (err) reject(err);
          else resolve(metadata);
        });
      });

      console.log('📊 Metadados do vídeo obtidos:', {
        duration: metadata.format.duration,
        width: metadata.streams[0]?.width,
        height: metadata.streams[0]?.height
      });

      // Gerar thumbnails para cada timestamp
      for (let i = 0; i < timestamps.length; i++) {
        const timestamp = timestamps[i];
        const tempFramePath = path.join(outputDir, `temp-frame-${i}.png`);

        console.log(`🖼️ Extraindo frame ${i + 1}/3 no timestamp ${timestamp}`);

        // Extrair frame com FFmpeg
        await new Promise((resolve, reject) => {
          ffmpeg(videoPath)
            .screenshots({
              timestamps: [timestamp],
              filename: `temp-frame-${i}.png`,
              folder: outputDir,
              size: '720x720'
            })
            .on('end', () => {
              console.log(`✅ Frame ${i + 1} extraído:`, tempFramePath);
              resolve();
            })
            .on('error', (err) => {
              console.error(`❌ Erro ao extrair frame ${i + 1}:`, err.message);
              reject(err);
            });
        });

        // Processar com Sharp (igual ao sistema de imagens)
        console.log(`🖼️ Processando frame ${i + 1} com Sharp`);

        const frameBuffer = await fs.readFile(tempFramePath);

        // Usar Sharp para criar thumbnails (igual ao sistema de imagens)
        const outside360Buffer = await sharp(frameBuffer)
          .resize(360, 360, {
            fit: 'outside',
            withoutEnlargement: true,
          })
          .png({
            quality: 75,
            force: false,
          })
          .toBuffer();

        const outside720Buffer = await sharp(frameBuffer)
          .resize(720, 720, {
            fit: 'outside',
            withoutEnlargement: true,
          })
          .png({
            quality: 75,
            force: false,
          })
          .toBuffer();

        // Salvar thumbnails processados
        const thumbnail360Path = path.join(outputDir, `frame-${i}-360.png`);
        const thumbnail720Path = path.join(outputDir, `frame-${i}-720.png`);

        await fs.writeFile(thumbnail360Path, outside360Buffer);
        await fs.writeFile(thumbnail720Path, outside720Buffer);

        // Limpar frame temporário
        await fs.unlink(tempFramePath);

        thumbnails.push({
          frame360: thumbnail360Path,
          frame720: thumbnail720Path
        });

        console.log(`✅ Thumbnails ${i + 1} processados com Sharp`);
      }

      console.log('🎉 Geração de thumbnails concluída:', thumbnails.length, 'frames');

      return {
        thumbnails,
        metadata: {
          duration: metadata.format.duration,
          width: metadata.streams[0]?.width,
          height: metadata.streams[0]?.height,
          format: metadata.format.format_name
        }
      };

    } catch (error) {
      console.error('❌ Erro durante processamento de vídeo:', error.message);
      throw error;
    }
  },
};
```

### **2.5 Atualizar package.json**
**Arquivo:** `boards/server/package.json`

```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "3.726.1",
    "bcrypt": "^5.1.1",
    "cross-env": "^7.0.3",
    "dotenv": "^16.5.0",
    "dotenv-cli": "^7.4.4",
    "escape-html": "^1.0.3",
    "escape-markdown": "^1.0.4",
    "fluent-ffmpeg": "^2.1.2",
    "fs-extra": "^11.3.0",
    "ico-to-png": "^0.2.2",
    "istextorbinary": "^9.5.0",
    "jsonwebtoken": "^9.0.2",
    "knex": "^3.1.0",
    "lodash": "^4.17.21",
    "mime": "^3.0.0",
    "moment": "^2.30.1",
    "nodemailer": "^6.10.1",
    "openid-client": "^5.7.1",
    "patch-package": "^8.0.0",
    "read": "^4.1.0",
    "rimraf": "^5.0.10",
    "sails": "^1.5.14",
    "sails-hook-orm": "^4.0.3",
    "sails-hook-sockets": "^3.0.2",
    "sails-postgresql": "^5.0.1",
    "serve-static": "^1.16.2",
    "sharp": "^0.33.5",
    "uuid": "^9.0.1",
    "validator": "^13.15.15",
    "winston": "^3.17.0",
    "zxcvbn": "^4.4.2"
  }
}
```

---

## 🎨 **FASE 3: FRONTEND CORRIGIDO**

### **3.1 Criar Componente de Thumbnail de Vídeo (Sem Photoswipe)**
**Arquivo:** `boards/client/src/components/attachments/Attachments/video/VideoThumbnail.jsx`

```javascript
/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Icon } from 'semantic-ui-react';

import styles from './VideoThumbnail.module.scss';

const VideoThumbnail = React.memo(({ attachment, size = '360' }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const thumbnailUrl = useMemo(() => {
    if (!attachment.data.videoThumbnails) {
      return null;
    }

    // Usar thumbnail do tamanho especificado (360 ou 720)
    const frameKey = `frame0${size}`; // Usar primeiro frame
    return attachment.data.videoThumbnails[frameKey] || null;
  }, [attachment.data.videoThumbnails, size]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!thumbnailUrl) {
    return (
      <div className={classNames(styles.container, styles.error)}>
        <div className={styles.errorMessage}>
          {t('common.noVideoPreviewAvailable')}
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={classNames(styles.container, styles.error)}>
        <div className={styles.errorMessage}>
          {t('common.errorLoadingVideoPreview')}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {isLoading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>{t('common.loadingVideoPreview')}</span>
        </div>
      )}

      <div className={classNames(styles.preview, { [styles.hidden]: isLoading })}>
        <img
          src={thumbnailUrl}
          alt={attachment.name}
          onLoad={handleLoad}
          onError={handleError}
          className={styles.thumbnail}
        />

        {/* Indicador de vídeo */}
        <div className={styles.videoIndicator}>
          <Icon name="video" />
          {t('common.video')}
        </div>

        {/* Duração do vídeo */}
        {attachment.data.video && (
          <div className={styles.videoDuration}>
            {Math.round(attachment.data.video.duration)}s
          </div>
        )}
      </div>
    </div>
  );
});

VideoThumbnail.propTypes = {
  attachment: PropTypes.object.isRequired,
  size: PropTypes.oneOf(['360', '720']),
};

export default VideoThumbnail;
```

### **3.2 Criar Estilos para VideoThumbnail**
**Arquivo:** `boards/client/src/components/attachments/Attachments/video/VideoThumbnail.module.scss`

```scss
.container {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
}

.preview {
  position: relative;
  width: 100%;
  height: auto;
}

.thumbnail {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6c757d;
  font-size: 14px;

  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #e9ecef;
    border-top: 2px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 8px;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.hidden {
  display: none;
}

.error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  background-color: #f8d7da;
  border-color: #f5c6cb;

  .errorMessage {
    color: #721c24;
    font-size: 14px;
    text-align: center;
    padding: 16px;
  }
}

.videoIndicator {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 4px;
}

.videoDuration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  z-index: 1;
}
```

---

## 🧪 **FASE 4: TESTES DE COMPATIBILIDADE**

### **4.1 Teste de Build Docker**
```bash
# Testar build de produção
cd boards
docker build -t planka-video-test .

# Verificar se FFmpeg está disponível
docker run --rm planka-video-test ffmpeg -version

# Verificar se ffprobe está disponível
docker run --rm planka-video-test ffprobe -version

# Testar build de desenvolvimento
docker build -f Dockerfile.dev -t planka-dev-video-test .

# Verificar se FFmpeg está disponível no container dev
docker run --rm planka-dev-video-test ffmpeg -version
```

### **4.2 Teste de Runtime**
```bash
# Testar se Sharp continua funcionando
docker run --rm planka-video-test node -e "
const sharp = require('sharp');
console.log('Sharp version:', sharp.versions);
console.log('Sharp working:', !!sharp.versions);
"

# Testar se fluent-ffmpeg funciona
docker run --rm planka-video-test node -e "
const ffmpeg = require('fluent-ffmpeg');
console.log('fluent-ffmpeg OK:', !!ffmpeg);
console.log('ffprobe available:', !!ffmpeg.ffprobe);
"

# Testar integração Sharp + FFmpeg
docker run --rm -v /path/to/test-video:/video planka-video-test node -e "
const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp');
const fs = require('fs');

async function testIntegration() {
  try {
    // Extrair frame
    await new Promise((resolve, reject) => {
      ffmpeg('/video/test.mp4')
        .screenshots({
          timestamps: ['00:00:01'],
          filename: 'test-frame.png',
          folder: '/tmp'
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Processar com Sharp
    const buffer = await sharp('/tmp/test-frame.png')
      .resize(360, 360, { fit: 'outside' })
      .png()
      .toBuffer();

    console.log('✅ Integração Sharp + FFmpeg OK:', buffer.length, 'bytes');
  } catch (error) {
    console.error('❌ Erro na integração:', error.message);
  }
}

testIntegration();
"
```

### **4.3 Teste de Rollback**
```bash
# Se algo der errado, remover ffmpeg dos Dockerfiles
# e desinstalar fluent-ffmpeg
cd boards/server
npm uninstall fluent-ffmpeg

# Rebuild sem FFmpeg
docker build -t planka-rollback .
```

---

## ✅ **CHECKLIST DE COMPATIBILIDADE:**

- [ ] ✅ **Manter versões Node.js:** 18-alpine e lts (não mudar)
- [ ] ✅ **Seguir padrão thumbnails:** `videoThumbnails.outside360`
- [ ] ✅ **Criar helper separado:** Não modificar `process-uploaded-file.js`
- [ ] ✅ **Integrar sem Photoswipe:** Componente separado para vídeos
- [ ] ✅ **Mudanças mínimas Docker:** Apenas adicionar FFmpeg
- [ ] ✅ **Testar Sharp + FFmpeg:** Compatibilidade antes da implementação
- [ ] ✅ **Preparar rollback:** Procedimento de reversão

---

## 🎯 **CRITÉRIOS DE SUCESSO:**

1. ✅ Sharp continua funcionando para imagens
2. ✅ Photoswipe continua funcionando para galerias
3. ✅ Thumbnails de vídeo funcionam
4. ✅ Build Docker produção funciona
5. ✅ Build Docker desenvolvimento funciona
6. ✅ FFmpeg funciona no container
7. ✅ Integração Sharp + FFmpeg funciona
8. ✅ Rollback possível se necessário

---

**📅 Timeline Estimado:** 2-3 dias com testes incrementais
**👥 Recursos Necessários:** 1 desenvolvedor full-stack
**🔧 Ferramentas:** FFmpeg (sistema), Sharp (existente), fluent-ffmpeg (novo)

**🚨 IMPORTANTE:** Esta versão corrigida mantém total compatibilidade com o sistema atual e testa adequadamente a integração Sharp + FFmpeg antes da implementação.
