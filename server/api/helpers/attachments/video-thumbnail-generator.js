/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

var ffmpeg = require('fluent-ffmpeg');
var sharp = require('sharp');
var fs = require('fs').promises;
var path = require('path');

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
    var videoPath = inputs.videoPath;
    var outputDir = inputs.outputDir;
    var filename = inputs.filename;

    // Iniciando geração de thumbnails para vídeo

    // Verificar se FFmpeg está disponível
    try {
      await new Promise(function(resolve, reject) {
        ffmpeg.ffprobe(videoPath, function(err) {
          if (err && err.message.indexOf('ffmpeg') !== -1) {
            reject(new Error('FFmpeg não está disponível no sistema'));
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      sails.log.error('❌ FFmpeg não disponível:', error.message);
      throw new Error('FFmpeg não está instalado ou não está no PATH do sistema');
    }

    // Criar diretório de saída se não existir
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (error) {
      sails.log.error('❌ Erro ao criar diretório:', error.message);
      throw error;
    }

    // Obter metadados do vídeo primeiro para calcular timestamp inteligente
    var metadata = await new Promise(function(resolve, reject) {
      ffmpeg.ffprobe(videoPath, function(err, metadata) {
        if (err) reject(err);
        else resolve(metadata);
      });
    });

    // Metadados do vídeo obtidos

    // Calcular timestamp inteligente baseado na duração
    var duration = metadata.format.duration;
    var timestamp;

    if (duration <= 3) {
      // Vídeo muito curto: usar 1 segundo
      timestamp = '00:00:01';
    } else if (duration <= 10) {
      // Vídeo curto: usar meio da duração
      var midPoint = Math.floor(duration / 2);
      // Formato correto para qualquer duração
      if (midPoint < 10) {
        timestamp = '00:00:0' + midPoint;
      } else {
        timestamp = '00:00:' + midPoint;
      }
    } else {
      // Vídeo longo: usar 5 segundos (evita intro/outro)
      timestamp = '00:00:05';
    }

    // Timestamp calculado para extração do frame

    // Fallback: Se algo der errado, usar 1 segundo
    var timestamps = [timestamp];
    var fallbackTimestamp = '00:00:01';
    var thumbnails = [];

    try {
      // Gerar thumbnails para cada timestamp
      for (var i = 0; i < timestamps.length; i++) {
        var currentTimestamp = timestamps[i];
        var tempFramePath = path.join(outputDir, 'temp-frame-' + i + '.png');

        try {
          // Extraindo frame no timestamp calculado

          // Extrair frame com FFmpeg
          await new Promise(function(resolve, reject) {
            ffmpeg(videoPath)
              .screenshots({
                timestamps: [currentTimestamp],
                filename: 'temp-frame-' + i + '.png',
                folder: outputDir,
                size: '720x720'
              })
              .on('end', function() {
                resolve();
              })
              .on('error', function(err) {
                sails.log.error('❌ Erro ao extrair frame:', err.message);
                sails.log.error('❌ Detalhes do erro:', err);
                reject(err);
              })
              .on('stderr', function(stderrLine) {
                sails.log.debug('🔍 FFmpeg stderr:', stderrLine);
              });
          });

        } catch (error) {
          sails.log.error('❌ Erro com timestamp', currentTimestamp, ':', error.message);

          // Fallback: Tentar com 1 segundo se não for já o fallback
          if (currentTimestamp !== fallbackTimestamp) {
            sails.log.info('🔄 Tentando fallback com', fallbackTimestamp);
            currentTimestamp = fallbackTimestamp;

            // Tentar novamente com fallback
            await new Promise(function(resolve, reject) {
              ffmpeg(videoPath)
                .screenshots({
                  timestamps: [fallbackTimestamp],
                  filename: 'temp-frame-' + i + '.png',
                  folder: outputDir,
                  size: '720x720'
                })
                .on('end', function() {
                  resolve();
                })
                .on('error', function(err) {
                  sails.log.error('❌ Erro mesmo com fallback:', err.message);
                  reject(err);
                })
                .on('stderr', function(stderrLine) {
                  sails.log.debug('🔍 FFmpeg stderr (fallback):', stderrLine);
                });
            });
          } else {
            throw error; // Se até o fallback falhar
          }
        }

        // Verificar se o arquivo foi criado antes de processar
        try {
          await fs.access(tempFramePath);
        } catch (error) {
          sails.log.error('❌ Arquivo de frame não encontrado:', tempFramePath);
          sails.log.error('❌ Erro ao processar frame');
          throw error;
        }

        // Processar com Sharp (igual ao sistema de imagens)
        // Processando frame com Sharp

        var frameBuffer = await fs.readFile(tempFramePath);

        // Usar Sharp para criar thumbnails (igual ao sistema de imagens)
        var outside360Buffer = await sharp(frameBuffer)
          .resize(360, 360, {
            fit: 'outside',
            withoutEnlargement: true,
          })
          .png({
            quality: 75,
            force: false,
          })
          .toBuffer();

        var outside720Buffer = await sharp(frameBuffer)
          .resize(720, 720, {
            fit: 'outside',
            withoutEnlargement: true,
          })
          .png({
            quality: 75,
            force: false,
          })
          .toBuffer();

        // Salvar thumbnails processados usando fileManager (igual ao sistema de imagens)
        var fileManager = sails.hooks['file-manager'].getInstance();

        var thumbnail360Path = `${outputDir}/frame-${i}-360.png`;
        var thumbnail720Path = `${outputDir}/frame-${i}-720.png`;

        // Salvando thumbnail 360
        // Tamanho do buffer 360

        await fileManager.save(
          thumbnail360Path,
          outside360Buffer,
          'image/png'
        );

        // Thumbnail 360 salvo com sucesso

        // Salvando thumbnail 720
        // Tamanho do buffer 720

        await fileManager.save(
          thumbnail720Path,
          outside720Buffer,
          'image/png'
        );

        // Thumbnail 720 salvo com sucesso

        // Limpar frame temporário
        await fs.unlink(tempFramePath);

        thumbnails.push({
          frame360: thumbnail360Path,
          frame720: thumbnail720Path
        });

        // Thumbnails processados com Sharp
        // Caminhos dos thumbnails gerados
      }

      // Geração de thumbnail concluída
      // Resumo final do processamento
      // URLs que serão geradas para o frontend

      return {
        thumbnails: thumbnails,
        metadata: {
          duration: metadata.format.duration,
          width: metadata.streams[0] ? metadata.streams[0].width : null,
          height: metadata.streams[0] ? metadata.streams[0].height : null,
          format: metadata.format.format_name
        }
      };

    } catch (error) {
      sails.log.error('❌ Erro durante processamento de vídeo:', error.message);
      throw error;
    }
  },
};
