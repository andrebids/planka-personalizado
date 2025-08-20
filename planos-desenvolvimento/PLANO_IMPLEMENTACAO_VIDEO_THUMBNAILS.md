# 📋 Plano de Implementação: Thumbnails de Vídeo
## Integração do react-thumbnails-video-preview no Sistema Planka

---

## 🎯 **Objetivo Geral**
Integrar a biblioteca `react-thumbnails-video-preview` no projeto Planka para gerar thumbnails automáticos de vídeos, seguindo as diretrizes estabelecidas e mantendo a arquitetura modular existente.

---

## 📊 **Análise Inicial**

### ✅ **Estado Atual**
- **Imagens:** Sistema completo de thumbnails funcionando
- **Vídeos:** Apenas reprodução, sem thumbnails
- **Arquitetura:** Modular e bem estruturada
- **Tecnologias:** React 18.2.0, Vite, Sharp (imagens)
- **Barra Direita:** Sistema de atividades com thumbnails de imagens já implementado

### 🎯 **Objetivos Específicos**
1. Gerar thumbnails automáticos de vídeos no upload
2. Integrar preview de thumbnails na interface
3. **Integrar thumbnails de vídeo na barra direita do histórico**
4. Manter compatibilidade com sistema existente
5. Seguir padrões de segurança e performance

---

## 🚀 **FASE 1: PREPARAÇÃO E INSTALAÇÃO**

### **1.1 Instalar Dependências**
```bash
# Navegar para o diretório do cliente
cd DEV/planka-personalizado/client

# Instalar react-thumbnails-video-preview
npm install react-thumbnails-video-preview

# Verificar instalação
npm list react-thumbnails-video-preview
```

### **1.2 Instalar Dependências do Backend**
```bash
# Navegar para o diretório do servidor
cd DEV/planka-personalizado/server

# Instalar fluent-ffmpeg para processamento de vídeo
npm install fluent-ffmpeg

# Instalar @ffmpeg-installer/ffmpeg para binários
npm install @ffmpeg-installer/ffmpeg
```

### **1.3 Verificar Compatibilidade**
- ✅ React 18.2.0
- ✅ Vite build system
- ✅ ESM modules
- ✅ Node.js 16+

### **1.4 Criar Estrutura de Diretórios**
```bash
# Criar diretórios para thumbnails de vídeo
mkdir -p DEV/planka-personalizado/server/api/helpers/attachments/video-processing
mkdir -p DEV/planka-personalizado/client/src/components/attachments/Attachments/video
```

---

## 🔧 **FASE 2: BACKEND - PROCESSAMENTO DE VÍDEO**

### **2.1 Criar Helper de Processamento de Vídeo**
**Arquivo:** `server/api/helpers/attachments/video-processing/generate-thumbnails.js`

```javascript
/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const fs = require('fs').promises;
const path = require('path');

// Configurar caminho do FFmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

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
        const outputPath = path.join(outputDir, `frame-${i}.jpg`);
        
        console.log(`🖼️ Gerando thumbnail ${i + 1}/3 no timestamp ${timestamp}`);
        
        await new Promise((resolve, reject) => {
          ffmpeg(videoPath)
            .screenshots({
              timestamps: [timestamp],
              filename: `frame-${i}.jpg`,
              folder: outputDir,
              size: '360x360'
            })
            .on('end', () => {
              console.log(`✅ Thumbnail ${i + 1} gerado:`, outputPath);
              thumbnails.push(outputPath);
              resolve();
            })
            .on('error', (err) => {
              console.error(`❌ Erro ao gerar thumbnail ${i + 1}:`, err.message);
              reject(err);
            });
        });
      }

      console.log('🎉 Geração de thumbnails concluída:', thumbnails.length, 'arquivos');
      
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

### **2.2 Atualizar Processamento de Uploads**
**Arquivo:** `server/api/helpers/attachments/process-uploaded-file.js`

```javascript
// Adicionar no início do arquivo, após os imports existentes
const generateVideoThumbnails = require('./video-processing/generate-thumbnails');

// Adicionar constante para tipos de vídeo
const VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/ogg',
  'video/webm',
  'video/avi',
  'video/mov',
  'video/wmv'
];

// Modificar a função fn para incluir processamento de vídeo
// Adicionar após o processamento de imagens (linha ~140)

// Processamento de vídeo para thumbnails
if (VIDEO_MIME_TYPES.includes(mimeType)) {
  console.log('🎬 Detectado arquivo de vídeo:', filename);
  
  try {
    const videoThumbnailsDir = `${dirPathSegment}/video-thumbnails`;
    
    console.log('🖼️ Iniciando geração de thumbnails de vídeo');
    
    const videoResult = await generateVideoThumbnails({
      videoPath: filePath,
      outputDir: videoThumbnailsDir,
      filename: filename
    });

    // Salvar thumbnails usando fileManager
    for (let i = 0; i < videoResult.thumbnails.length; i++) {
      const thumbnailPath = videoResult.thumbnails[i];
      const thumbnailBuffer = await fsPromises.readFile(thumbnailPath);
      
      await fileManager.save(
        `${videoThumbnailsDir}/frame-${i}.jpg`,
        thumbnailBuffer,
        'image/jpeg'
      );
      
      console.log(`✅ Thumbnail ${i} salvo no fileManager`);
    }

    // Adicionar dados de vídeo ao objeto data
    data.video = {
      width: videoResult.metadata.width,
      height: videoResult.metadata.height,
      duration: videoResult.metadata.duration,
      format: videoResult.metadata.format,
      thumbnailsCount: videoResult.thumbnails.length,
      thumbnailsExtension: 'jpg'
    };
    
    console.log('✅ Dados de vídeo adicionados:', data.video);
    
  } catch (error) {
    console.error('❌ Erro ao processar vídeo:', error.message);
    console.error('❌ Stack trace:', error.stack);
    sails.log.warn(error.stack);
    
    // Limpar diretório de thumbnails em caso de erro
    try {
      await fileManager.deleteDir(`${dirPathSegment}/video-thumbnails`);
    } catch (cleanupError) {
      console.error('❌ Erro ao limpar diretório de thumbnails:', cleanupError.message);
    }
  }
}
```

### **2.3 Atualizar Present-One Helper**
**Arquivo:** `server/api/helpers/attachments/present-one.js`

```javascript
// Adicionar após a linha 29 (após thumbnailUrls)

// URLs de thumbnails de vídeo
if (inputs.record.data.video && inputs.record.data.video.thumbnailsCount > 0) {
  data.videoThumbnailUrls = {};
  
  for (let i = 0; i < inputs.record.data.video.thumbnailsCount; i++) {
    data.videoThumbnailUrls[`frame${i}`] = 
      `${sails.config.custom.baseUrl}/attachments/${inputs.record.id}/download/video-thumbnails/frame-${i}.jpg`;
  }
  
  console.log('🎬 URLs de thumbnails de vídeo geradas:', Object.keys(data.videoThumbnailUrls));
}
```

### **2.4 Adicionar Rota para Thumbnails de Vídeo**
**Arquivo:** `server/config/routes.js`

```javascript
// Adicionar após a linha 225 (após a rota de thumbnails de imagem)

'GET r|^/attachments/(\\w+)/download/video-thumbnails/([\\w-]+).(\\w+)$|id,fileName,fileExtension': {
  action: 'file-attachments/download-video-thumbnail',
  skipAssets: false,
},
```

### **2.5 Criar Controlador para Download de Thumbnails de Vídeo**
**Arquivo:** `server/api/controllers/file-attachments/download-video-thumbnail.js`

```javascript
/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  FILE_ATTACHMENT_NOT_FOUND: {
    fileAttachmentNotFound: 'File attachment not found',
  },
};

const FILE_NAMES = ['frame-0', 'frame-1', 'frame-2'];

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    fileName: {
      type: 'string',
      isIn: FILE_NAMES,
      required: true,
    },
    fileExtension: {
      type: 'string',
      maxLength: 128,
      required: true,
    },
  },

  exits: {
    fileAttachmentNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    console.log('🎬 Download de thumbnail de vídeo solicitado:', {
      attachmentId: inputs.id,
      fileName: inputs.fileName,
      fileExtension: inputs.fileExtension
    });

    const { attachment, board, project } = await sails.helpers.attachments
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.FILE_ATTACHMENT_NOT_FOUND);

    if (attachment.type !== Attachment.Types.FILE) {
      console.log('❌ Anexo não é do tipo FILE');
      throw Errors.FILE_ATTACHMENT_NOT_FOUND;
    }

    if (!attachment.data.video) {
      console.log('❌ Anexo não possui dados de vídeo');
      throw Errors.FILE_ATTACHMENT_NOT_FOUND;
    }

    if (inputs.fileExtension !== attachment.data.video.thumbnailsExtension) {
      console.log('❌ Extensão de arquivo não corresponde');
      throw Errors.FILE_ATTACHMENT_NOT_FOUND;
    }

    // Verificações de permissão
    if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
          board.id,
          currentUser.id,
        );

        if (!boardMembership) {
          console.log('❌ Usuário não tem permissão para acessar o anexo');
          throw Errors.FILE_ATTACHMENT_NOT_FOUND;
        }
      }
    }

    const fileManager = sails.hooks['file-manager'].getInstance();

    let readStream;
    try {
      const thumbnailPath = `${sails.config.custom.attachmentsPathSegment}/${attachment.data.fileReferenceId}/video-thumbnails/${inputs.fileName}.${inputs.fileExtension}`;
      
      console.log('📁 Tentando ler thumbnail:', thumbnailPath);
      
      readStream = await fileManager.read(thumbnailPath);
      
      console.log('✅ Thumbnail lido com sucesso');
    } catch (error) {
      console.error('❌ Erro ao ler thumbnail:', error.message);
      throw Errors.FILE_ATTACHMENT_NOT_FOUND;
    }

    this.res.type('image/jpeg');
    this.res.set('Cache-Control', 'private, max-age=900');

    console.log('📤 Enviando thumbnail de vídeo');

    return exits.success(readStream);
  },
};
```

---

## 🎨 **FASE 3: FRONTEND - COMPONENTES DE INTERFACE**

### **3.1 Criar Componente de Preview de Vídeo**
**Arquivo:** `client/src/components/attachments/Attachments/video/VideoPreview.jsx`

```javascript
/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo, useState } from 'react';
import ReactVideosPreview from 'react-thumbnails-video-preview';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import styles from './VideoPreview.module.scss';

const VideoPreview = React.memo(({ attachment }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const videoPreviewData = useMemo(() => {
    if (!attachment.data.videoThumbnailUrls) {
      return null;
    }

    // Converter URLs de thumbnails para o formato esperado
    const thumbnailUrls = Object.values(attachment.data.videoThumbnailUrls);
    
    if (thumbnailUrls.length === 0) {
      return null;
    }

    return [
      {
        imgList: thumbnailUrls,
        imgError: 'https://dummyimage.com/200x200/111/fff&text=error-loading'
      }
    ];
  }, [attachment.data.videoThumbnailUrls]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!videoPreviewData) {
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
        <ReactVideosPreview 
          list={videoPreviewData}
          imgError="https://dummyimage.com/200x200/111/fff&text=error-loading"
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
      
      {attachment.data.video && (
        <div className={styles.videoInfo}>
          <span className={styles.duration}>
            {t('common.duration')}: {Math.round(attachment.data.video.duration)}s
          </span>
          <span className={styles.resolution}>
            {attachment.data.video.width}x{attachment.data.video.height}
          </span>
        </div>
      )}
    </div>
  );
});

VideoPreview.propTypes = {
  attachment: PropTypes.object.isRequired,
};

export default VideoPreview;
```

### **3.2 Criar Estilos para VideoPreview**
**Arquivo:** `client/src/components/attachments/Attachments/video/VideoPreview.module.scss`

```scss
.container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
}

.preview {
  width: 100%;
  
  :global(.react-videos-preview) {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    img {
      border-radius: 4px;
      transition: transform 0.2s ease;
      
      &:hover {
        transform: scale(1.05);
      }
    }
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

.videoInfo {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  font-size: 12px;
  color: #6c757d;
  
  .duration,
  .resolution {
    font-weight: 500;
  }
}
```

### **3.3 Criar Índice para Componentes de Vídeo**
**Arquivo:** `client/src/components/attachments/Attachments/video/index.js`

```javascript
export { default as VideoPreview } from './VideoPreview';
```

### **3.4 Atualizar Componente Item.jsx**
**Arquivo:** `client/src/components/attachments/Attachments/Item.jsx`

```javascript
// Adicionar import no início do arquivo
import { VideoPreview } from './video';

// Modificar o case de vídeo (linha ~63)
case 'video/mp4':
case 'video/ogg':
case 'video/webm':
case 'video/avi':
case 'video/mov':
case 'video/wmv':
  content = (
    <div className={styles.videoContainer}>
      <VideoPreview attachment={attachment} />
      <video 
        controls 
        src={attachment.data.url} 
        className={styles.content}
        preload="metadata"
      />
    </div>
  );
  break;
```

### **3.5 Atualizar Estilos do Item**
**Arquivo:** `client/src/components/attachments/Attachments/Item.module.scss`

```scss
// Adicionar após os estilos existentes

.videoContainer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  
  .content {
    width: 100%;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}
```

### **3.6 Atualizar Utilitários de Tipo de Arquivo**
**Arquivo:** `client/src/utils/fileTypeUtils.js`

```javascript
// Adicionar após a linha 15
const SUPPORTED_VIDEO_TYPES = ['mp4', 'ogg', 'webm', 'avi', 'mov', 'wmv'];

// Modificar a função getFileType (linha ~25)
export const getFileType = (filename) => {
  const extension = getFileExtension(filename);
  
  return {
    extension,
    isImage: SUPPORTED_IMAGE_TYPES.includes(extension),
    isVideo: SUPPORTED_VIDEO_TYPES.includes(extension),
    isPdf: extension === 'pdf',
    isDocument: SUPPORTED_DOCUMENT_TYPES.includes(extension),
    isArchive: SUPPORTED_ARCHIVE_TYPES.includes(extension),
    isPreviewable: SUPPORTED_IMAGE_TYPES.includes(extension) || 
                   SUPPORTED_VIDEO_TYPES.includes(extension) ||
                   SUPPORTED_DOCUMENT_TYPES.includes(extension),
    mimeType: getMimeType(extension)
  };
};

// Adicionar tipos MIME de vídeo na função getMimeType (linha ~45)
export const getMimeType = (extension) => {
  const mimeTypes = {
    // Imagens (existentes)
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    
    // Vídeos (novos)
    mp4: 'video/mp4',
    ogg: 'video/ogg',
    webm: 'video/webm',
    avi: 'video/avi',
    mov: 'video/quicktime',
    wmv: 'video/x-ms-wmv',
    
    // Documentos (existentes)
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    
    // Arquivos (existentes)
    zip: 'application/zip',
    rar: 'application/vnd.rar',
    '7z': 'application/x-7z-compressed'
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
};

// Atualizar a função canPreviewFile (linha ~85)
export const canPreviewFile = (attachment) => {
  if (!attachment || !attachment.name) {
    return false;
  }
  
  const fileType = getFileType(attachment.name);
  
  // Para imagens, verificar se tem thumbnail
  if (fileType.isImage) {
    return attachment.data && 
           attachment.data.image && 
           attachment.data.thumbnailUrls;
  }
  
  // Para vídeos, verificar se tem thumbnails de vídeo
  if (fileType.isVideo) {
    return attachment.data && 
           attachment.data.video && 
           attachment.data.videoThumbnailUrls;
  }
  
  // Para documentos, verificar se tem URL
  if (fileType.isDocument) {
    return attachment.data && attachment.data.url;
  }
  
  return false;
};

// Atualizar a função getPreviewUrl (linha ~110)
export const getPreviewUrl = (attachment) => {
  if (!canPreviewFile(attachment)) {
    return null;
  }
  
  const fileType = getFileType(attachment.name);
  
  if (fileType.isImage) {
    return attachment.data.url || 
           attachment.data.thumbnailUrls?.outside720 ||
           attachment.data.thumbnailUrls?.outside360;
  }
  
  if (fileType.isVideo) {
    // Para vídeos, retornar a primeira thumbnail disponível
    const videoThumbnails = attachment.data.videoThumbnailUrls;
    if (videoThumbnails && Object.keys(videoThumbnails).length > 0) {
      return Object.values(videoThumbnails)[0];
    }
    return attachment.data.url;
  }
  
  if (fileType.isDocument) {
    return attachment.data.url;
  }
  
  return null;
};

// Atualizar a função getFileIcon (linha ~140)
export const getFileIcon = (filename) => {
  const fileType = getFileType(filename);
  
  if (fileType.isImage) {
    return 'image';
  }
  
  if (fileType.isVideo) {
    return 'video';
  }
  
  if (fileType.isPdf) {
    return 'file pdf outline';
  }
  
  if (fileType.isDocument) {
    return 'file text outline';
  }
  
  if (fileType.isArchive) {
    return 'archive';
  }
  
  return 'file outline';
};
```

---

## 🎯 **FASE 3.5: INTEGRAÇÃO NA BARRA DIREITA DO HISTÓRICO**

### **3.5.1 Atualizar Componente de Atividades**
**Arquivo:** `client/src/components/activities/BoardActivitiesModal/Item.jsx`

```javascript
// Adicionar import no início do arquivo
import { VideoPreview } from '../../attachments/Attachments/video';

// Modificar a seção de filtragem de anexos (linha ~57)
// Filtrar anexos de imagem e vídeo para mostrar thumbnails
const imageAttachments = (attachments || []).filter(
  (attachment) =>
    attachment.type === AttachmentTypes.FILE &&
    ((attachment.data.image && attachment.data.thumbnailUrls) ||
     (attachment.data.video && attachment.data.videoThumbnailUrls)) &&
    canPreviewFile(attachment)
);

// Mostrar apenas o primeiro anexo (imagem ou vídeo)
const thumbnailAttachments = imageAttachments.slice(0, 1);

// Modificar a seção de renderização de thumbnails (linha ~470)
{thumbnailAttachments.length > 0 && (
  <div className={styles.thumbnails}>
    <Gallery
      withCaption
      withDownloadButton
      options={{
        wheelToZoom: true,
        showHideAnimationType: 'none',
        closeTitle: '',
        zoomTitle: '',
        arrowPrevTitle: '',
        arrowNextTitle: '',
        errorMsg: '',
      }}
      onBeforeOpen={handleBeforeGalleryOpen}
    >
      {thumbnailAttachments.map((attachment) => {
        const fileType = getFileType(attachment.name);
        
        if (fileType.isVideo) {
          // Para vídeos, usar o componente VideoPreview
          return (
            <GalleryItem
              key={attachment.id}
              {...attachment.data.video}
              original={attachment.data.url}
              caption={attachment.name}
            >
              {({ ref, open }) => (
                <div ref={ref} onClick={open} className={styles.videoThumbnail}>
                  <VideoPreview attachment={attachment} />
                </div>
              )}
            </GalleryItem>
          );
        } else {
          // Para imagens, usar o comportamento existente
          return (
            <GalleryItem
              key={attachment.id}
              {...attachment.data.image}
              original={attachment.data.url}
              caption={attachment.name}
            >
              {({ ref, open }) => (
                <img
                  ref={ref}
                  src={attachment.data.thumbnailUrls.outside720 || attachment.data.thumbnailUrls.outside360}
                  alt={attachment.name}
                  className={styles.thumbnail}
                  onClick={open}
                />
              )}
            </GalleryItem>
          );
        }
      })}
    </Gallery>
  </div>
)}
```

### **3.5.2 Atualizar Estilos do Item de Atividades**
**Arquivo:** `client/src/components/activities/BoardActivitiesModal/Item.module.scss`

```scss
// Adicionar após os estilos existentes

.videoThumbnail {
  cursor: pointer !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease !important;
  border: 2px solid transparent !important;
  width: 100% !important;
  height: auto !important;
  max-width: 100% !important;
  border-radius: 8px !important;
  overflow: hidden !important;

  &:hover {
    transform: scale(1.02) !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
    border-color: var(--accent) !important;
  }

  // Ajustar o container do VideoPreview para o contexto da barra direita
  :global(.container) {
    max-width: 100% !important;
    margin: 0 !important;
  }

  :global(.videoInfo) {
    display: none !important; // Ocultar informações de vídeo na barra direita
  }
}

// Adicionar indicador visual para vídeos
.videoIndicator {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  z-index: 1;
}
```

### **3.5.3 Criar Componente de Thumbnail de Vídeo para Atividades**
**Arquivo:** `client/src/components/activities/BoardActivitiesModal/VideoThumbnail.jsx`

```javascript
/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';

import styles from './Item.module.scss';

const VideoThumbnail = React.memo(({ attachment }) => {
  const { t } = useTranslation();

  const thumbnailUrl = useMemo(() => {
    if (!attachment.data.videoThumbnailUrls) {
      return null;
    }

    // Usar a primeira thumbnail disponível
    const urls = Object.values(attachment.data.videoThumbnailUrls);
    return urls.length > 0 ? urls[0] : null;
  }, [attachment.data.videoThumbnailUrls]);

  if (!thumbnailUrl) {
    return (
      <div className={styles.videoThumbnail}>
        <div className={styles.errorMessage}>
          {t('common.noVideoPreviewAvailable')}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.videoThumbnail}>
      <img
        src={thumbnailUrl}
        alt={attachment.name}
        className={styles.thumbnail}
      />
      <div className={styles.videoIndicator}>
        <Icon name="video" />
        {t('common.video')}
      </div>
      {attachment.data.video && (
        <div className={styles.videoDuration}>
          {Math.round(attachment.data.video.duration)}s
        </div>
      )}
    </div>
  );
});

VideoThumbnail.propTypes = {
  attachment: PropTypes.object.isRequired,
};

export default VideoThumbnail;
```

### **3.5.4 Atualizar Estilos para Suportar Vídeos na Barra Direita**
**Arquivo:** `client/src/components/activities/BoardActivitiesModal/Item.module.scss`

```scss
// Adicionar estilos para duração do vídeo
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

// Ajustar thumbnails para suportar vídeos
.thumbnails {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 8px 0 0 0;
  width: 100%;
  
  // Container para thumbnails de vídeo
  .videoThumbnail {
    position: relative;
    width: 100%;
    height: auto;
    border-radius: 8px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: auto;
      display: block;
    }
  }
}
```

---

## 🌐 **FASE 4: TRADUÇÕES E INTERNACIONALIZAÇÃO**

### **4.1 Adicionar Traduções em Português**
**Arquivo:** `client/src/locales/pt-PT/core.js`

```javascript
// Adicionar após a linha 564
noVideoPreviewAvailable: 'Pré-visualização de vídeo não disponível',
errorLoadingVideoPreview: 'Erro ao carregar pré-visualização de vídeo',
loadingVideoPreview: 'A carregar pré-visualização...',
duration: 'Duração',
videoThumbnailsGenerated: 'Thumbnails de vídeo gerados com sucesso',
videoProcessingError: 'Erro ao processar vídeo',
video: 'Vídeo',
```

### **4.2 Adicionar Traduções em Inglês**
**Arquivo:** `client/src/locales/en-US/core.js`

```javascript
// Adicionar traduções correspondentes
noVideoPreviewAvailable: 'Video preview not available',
errorLoadingVideoPreview: 'Error loading video preview',
loadingVideoPreview: 'Loading video preview...',
duration: 'Duration',
videoThumbnailsGenerated: 'Video thumbnails generated successfully',
videoProcessingError: 'Error processing video',
video: 'Video',
```

---

## 🧪 **FASE 5: TESTES E VALIDAÇÃO**

### **5.1 Testes Manuais**

#### **Teste 1: Upload de Vídeo**
```bash
# 1. Fazer upload de um arquivo MP4
# 2. Verificar se os thumbnails são gerados
# 3. Verificar se aparecem na interface
# 4. Verificar se o vídeo reproduz normalmente
```

#### **Teste 2: Integração na Barra Direita**
```bash
# 1. Fazer upload de vídeo
# 2. Verificar se aparece na barra direita do histórico
# 3. Verificar se o thumbnail é clicável
# 4. Verificar se abre o gallery corretamente
```

#### **Teste 3: Diferentes Formatos**
```bash
# Testar upload de:
# - MP4 (formato principal)
# - OGG
# - WebM
# - AVI
# - MOV
# - WMV
```

#### **Teste 4: Performance**
```bash
# 1. Upload de vídeo grande (>100MB)
# 2. Verificar tempo de processamento
# 3. Verificar uso de memória
# 4. Verificar se não bloqueia a interface
```

#### **Teste 5: Tratamento de Erros**
```bash
# 1. Upload de arquivo corrompido
# 2. Upload sem permissões de escrita
# 3. Verificar se erros são tratados graciosamente
```

### **5.2 Verificações de Logs**
```bash
# Verificar logs do servidor para:
# - Geração de thumbnails
# - Erros de processamento
# - Performance
# - Downloads de thumbnails
```

---

## 📋 **FASE 6: DEPLOY E MONITORAMENTO**

### **6.1 Checklist de Deploy**
- [ ] Todas as dependências instaladas
- [ ] FFmpeg configurado no servidor
- [ ] Permissões de escrita nos diretórios
- [ ] Logs configurados
- [ ] Cache configurado

### **6.2 Monitoramento**
```javascript
// Adicionar métricas de monitoramento
console.log('📊 Métricas de vídeo:', {
  totalVideos: videoCount,
  thumbnailsGenerated: thumbnailCount,
  averageProcessingTime: avgTime,
  errorRate: errorRate
});
```

---

## 🔄 **FASE 7: OTIMIZAÇÕES E MELHORIAS**

### **7.1 Otimizações de Performance**
- [ ] Cache de thumbnails
- [ ] Processamento assíncrono
- [ ] Compressão de imagens
- [ ] Lazy loading

### **7.2 Melhorias de UX**
- [ ] Loading states
- [ ] Error handling
- [ ] Fallback images
- [ ] Responsive design

---

## 📝 **NOTAS IMPORTANTES**

### **⚠️ Requisitos do Sistema**
- FFmpeg instalado no servidor
- Permissões de escrita nos diretórios
- Memória suficiente para processamento
- Espaço em disco para thumbnails

### **🔒 Segurança**
- Validação de tipos de arquivo
- Verificação de permissões
- Sanitização de nomes de arquivo
- Rate limiting

### **📊 Performance**
- Processamento assíncrono
- Cache de resultados
- Limpeza de arquivos temporários
- Monitoramento de recursos

### **🎯 Integração na Barra Direita**
- **Compatibilidade:** Mantém o sistema existente de thumbnails de imagens
- **Performance:** Thumbnails otimizados para o contexto da barra direita
- **UX:** Indicadores visuais para diferenciar vídeos de imagens
- **Responsividade:** Adaptação automática ao tamanho da barra

---

## ✅ **CRITÉRIOS DE SUCESSO**

1. **Funcionalidade:** Thumbnails gerados automaticamente para vídeos
2. **Performance:** Processamento não bloqueia a interface
3. **Compatibilidade:** Funciona com formatos principais de vídeo
4. **Segurança:** Validações e verificações implementadas
5. **UX:** Interface responsiva e intuitiva
6. **Manutenibilidade:** Código bem documentado e modular
7. **Integração:** Thumbnails de vídeo funcionam na barra direita do histórico

---

## 🎯 **PRÓXIMOS PASSOS**

1. Executar Fase 1 (Instalação)
2. Implementar Fase 2 (Backend)
3. Implementar Fase 3 (Frontend)
4. Implementar Fase 3.5 (Integração na Barra Direita)
5. Adicionar traduções (Fase 4)
6. Testes manuais (Fase 5)
7. Deploy e monitoramento (Fase 6)
8. Otimizações (Fase 7)

---

**📅 Timeline Estimado:** 3-4 dias de desenvolvimento
**👥 Recursos Necessários:** 1 desenvolvedor full-stack
**🔧 Ferramentas:** FFmpeg, Node.js, React, Vite
