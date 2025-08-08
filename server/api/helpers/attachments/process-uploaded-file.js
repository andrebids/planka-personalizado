/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const fsPromises = require('fs').promises;
const { rimraf } = require('rimraf');
const { getEncoding } = require('istextorbinary');
const mime = require('mime');
const sharp = require('sharp');

const filenamify = require('../../../utils/filenamify');
const { MAX_SIZE_IN_BYTES_TO_GET_ENCODING } = require('../../../constants');

module.exports = {
  inputs: {
    file: {
      type: 'json',
      required: true,
    },
  },

  async fn(inputs) {
    const fileManager = sails.hooks['file-manager'].getInstance();

    const { id: fileReferenceId } = await FileReference.create().fetch();
    const dirPathSegment = `${sails.config.custom.attachmentsPathSegment}/${fileReferenceId}`;
    const filename = filenamify(inputs.file.filename);

    const mimeType = mime.getType(filename);
    const sizeInBytes = inputs.file.size;

    let buffer;
    let encoding = null;

    if (sizeInBytes <= MAX_SIZE_IN_BYTES_TO_GET_ENCODING) {
      try {
        buffer = await fsPromises.readFile(inputs.file.fd);
      } catch (error) {
        /* empty */
      }

      if (buffer) {
        encoding = getEncoding(buffer);
      }
    }

    const filePath = await fileManager.move(
      inputs.file.fd,
      `${dirPathSegment}/${filename}`,
      inputs.file.type,
    );

    const data = {
      fileReferenceId,
      filename,
      mimeType,
      sizeInBytes,
      encoding,
      image: null,
    };

    console.log('🔍 Verificando se é imagem:', mimeType, 'Excluído:', ['image/svg+xml', 'application/pdf'].includes(mimeType));
    
    if (!['image/svg+xml', 'application/pdf'].includes(mimeType)) {
      console.log('🖼️ Iniciando processamento de imagem com Sharp');
      
      let image = sharp(buffer || filePath, {
        animated: true,
      });

      let metadata;
      try {
        metadata = await image.metadata();
        console.log('📊 Metadata obtida:', metadata);
      } catch (error) {
        console.error('❌ Erro ao obter metadata:', error.message);
        /* empty */
      }

      if (metadata) {
        let { width, pageHeight: height = metadata.height } = metadata;
        if (metadata.orientation && metadata.orientation > 4) {
          [image, width, height] = [image.rotate(), height, width];
        }

        const thumbnailsPathSegment = `${dirPathSegment}/thumbnails`;
        const thumbnailsExtension = metadata.format === 'jpeg' ? 'jpg' : metadata.format;

        try {
          console.log('🖼️ Processando imagem:', filename, 'MIME:', mimeType, 'Tamanho:', sizeInBytes);
          console.log('📏 Dimensões:', width, 'x', height);
          
          const outside360Buffer = await image
            .resize(360, 360, {
              fit: 'outside',
              withoutEnlargement: true,
            })
            .png({
              quality: 75,
              force: false,
            })
            .toBuffer();

          console.log('✅ Thumbnail 360 gerado:', outside360Buffer.length, 'bytes');

          await fileManager.save(
            `${thumbnailsPathSegment}/outside-360.${thumbnailsExtension}`,
            outside360Buffer,
            inputs.file.type,
          );

          const outside720Buffer = await image
            .resize(720, 720, {
              fit: 'outside',
              withoutEnlargement: true,
            })
            .png({
              quality: 75,
              force: false,
            })
            .toBuffer();

          console.log('✅ Thumbnail 720 gerado:', outside720Buffer.length, 'bytes');

          await fileManager.save(
            `${thumbnailsPathSegment}/outside-720.${thumbnailsExtension}`,
            outside720Buffer,
            inputs.file.type,
          );

          data.image = {
            width,
            height,
            thumbnailsExtension,
          };
          
          console.log('✅ Imagem processada com sucesso:', data.image);
        } catch (error) {
          console.error('❌ Erro ao processar imagem:', error.message);
          console.error('❌ Stack trace:', error.stack);
          sails.log.warn(error.stack);
          await fileManager.deleteDir(thumbnailsPathSegment);
        }
      }
    }

    if (!filePath) {
      await rimraf(inputs.file.fd);
    }

    return data;
  },
};
