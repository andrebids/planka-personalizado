# 📋 PLANO DE IMPLEMENTAÇÃO - LIQUID GLASS TIMELINE PANEL (VERSÃO CORRIGIDA)

## 🎯 OBJETIVO
Implementar o efeito liquid glass no painel de timeline (BoardActivitiesPanel) seguindo as regras fornecidas, criando um sistema de camadas com profundidade, reflexo e blur realista, **integrando com o sistema glass existente**.

---

## ⚠️ CORREÇÕES CRÍTICAS IDENTIFICADAS

### **1. Z-INDEX CORRIGIDO**
```scss
// ANTES (PROBLEMÁTICO):
z-index: 9999;

// DEPOIS (CORRETO):
z-index: 10008 !important; // Acima de todos os elementos existentes (max: 10007)
```

### **2. SVG DISTORTION JÁ EXISTE**
- **Remover:** Criação do arquivo `GlassDistortion.jsx`
- **Usar:** Filtro já definido em `Root.jsx`
- **Referência:** `filter: url(#glass-distortion)` já disponível

### **3. INTEGRAÇÃO COM SISTEMA GLASS EXISTENTE**
- **Usar:** Variáveis CSS existentes em `glass-theme.css`
- **Aproveitar:** Classes glass já implementadas
- **Manter:** Consistência com outros componentes glass

---

## 📁 ARQUIVOS A MODIFICAR (VERSÃO CORRIGIDA)

### 1. **BoardActivitiesPanel.module.scss**
**Localização:** `DEV/planka-personalizado/client/src/components/activities/BoardActivitiesPanel/BoardActivitiesPanel.module.scss`

**Alterações Necessárias:**

#### **A. Container Principal (.panel) - CORRIGIDO**
```scss
// ANTES:
.panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  max-width: 90vw;
  z-index: 9999; // ❌ PROBLEMA: Muito baixo
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0;
  border-left: 1px solid var(--glass-border);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.3);
}

// DEPOIS (CORRIGIDO):
.panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  max-width: 90vw;
  z-index: 10008 !important; // ✅ CORRIGIDO: Acima de todos os elementos
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 20px 0 0 20px !important;
  isolation: isolate;
  overflow: hidden;

  // Base Glass Structure - Layer 1: Main container
  background: rgba(var(--glass-bg-rgb), 0.75) !important;
  -webkit-backdrop-filter: blur(1px);
  backdrop-filter: blur(1px);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0px 6px 24px rgba(0, 0, 0, 0.2) !important;

  // Inner Shadow Layer - Layer 2: ::before pseudo-element
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    border-radius: 20px 0 0 20px;
    box-shadow: inset 0 0 20px -5px rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.05);
    pointer-events: none;
  }

  // Backdrop Blur Effects - Layer 3: ::after pseudo-element
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: 28px 0 0 28px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    filter: url(#glass-distortion); // ✅ Usar filtro existente
    isolation: isolate;
    pointer-events: none;
  }
}
```

#### **B. Header (.header)**
```scss
// ANTES:
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--glass-border);
  background: rgba(var(--glass-bg-rgb), 0.95);
  backdrop-filter: blur(var(--glass-blur));
  flex-shrink: 0;
}

// DEPOIS:
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important; // Forçar border
  background: linear-gradient(
    180deg,
    rgba(var(--glass-bg-rgb), 0.95) 0%,
    rgba(var(--glass-bg-rgb), 0.85) 100%
  ) !important; // Forçar background
  -webkit-backdrop-filter: blur(var(--glass-blur));
  backdrop-filter: blur(var(--glass-blur));
  flex-shrink: 0;
  position: relative;
  z-index: 1;

  // Inner highlight for header
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(circle at 12% 12%, rgba(255, 255, 255, 0.08), transparent 60%);
    pointer-events: none;
  }
}
```

#### **C. Botão Fechar (.closeButton)**
```scss
// ANTES:
.closeButton {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }
}

// DEPOIS:
.closeButton {
  background: rgba(59, 130, 246, 0.18) !important; // Forçar background
  border: 1px solid rgba(255, 255, 255, 0.1) !important; // Forçar border
  color: #93c5fd !important; // Forçar cor
  cursor: pointer;
  padding: 8px;
  border-radius: 10px !important; // Forçar border-radius
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);

  &:hover {
    background: rgba(59, 130, 246, 0.25) !important; // Forçar hover
    color: #ffffff !important; // Forçar cor hover
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important; // Forçar shadow
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2) !important; // Forçar shadow active
  }
}
```

#### **D. Conteúdo (.content)**
```scss
// ANTES:
.content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

// DEPOIS:
.content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.02);
}
```

#### **E. Placeholder (.placeholder)**
```scss
// ANTES:
.placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  padding: 40px 24px;
  text-align: center;

  p {
    margin: 16px 0 0 0;
    font-size: 14px;
  }
}

// DEPOIS:
.placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  padding: 40px 24px;
  text-align: center;
  position: relative;
  z-index: 1;

  p {
    margin: 16px 0 0 0;
    font-size: 14px;
    color: var(--text-secondary);
  }

  // Glass effect for placeholder icon container
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: inset 0 0 20px -5px rgba(255, 255, 255, 0.3);
    z-index: -1;
  }
}
```

#### **F. Backdrop (.backdrop) - CORRIGIDO**
```scss
// ANTES:
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 9998; // ❌ PROBLEMA: Muito baixo
  backdrop-filter: blur(2px);
}

// DEPOIS (CORRIGIDO):
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 10007 !important; // ✅ CORRIGIDO: Abaixo do painel mas acima de tudo
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}
```

#### **G. Adicionar Fallback CSS**
```scss
// NOVO: Fallback para navegadores sem suporte a backdrop-filter
@supports not (backdrop-filter: blur(2px)) {
  .panel {
    background: rgba(var(--glass-bg-strong-rgb), 0.9) !important;
    border-color: var(--glass-border) !important;
  }

  .header {
    background: rgba(var(--glass-bg-strong-rgb), 0.95) !important;
  }

  .closeButton {
    background: rgba(59, 130, 246, 0.3) !important;
  }

  .placeholder::before {
    background: rgba(var(--glass-bg-strong-rgb), 0.8) !important;
  }
}
```

#### **H. Estratégia de Sobrescrita CSS (NOVO)**
```scss
// NOVO: Sobrescrever estilos globais do glass-panel
.panel.glass-panel {
  // Forçar sobrescrita de estilos globais
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 20px 0 0 20px !important;
  background: rgba(var(--glass-bg-rgb), 0.75) !important;
  box-shadow: 0px 6px 24px rgba(0, 0, 0, 0.2) !important;
}

// Sobrescrever estilos específicos do glass-theme.css
.panel.glass-panel .header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  background: linear-gradient(
    180deg,
    rgba(var(--glass-bg-rgb), 0.95) 0%,
    rgba(var(--glass-bg-rgb), 0.85) 100%
  ) !important;
}

// Sobrescrever botão com especificidade máxima
.panel.glass-panel .closeButton {
  background: rgba(59, 130, 246, 0.18) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #93c5fd !important;
  border-radius: 10px !important;
}
```

---

### 2. **BoardActivitiesPanel.jsx - CORRIGIDO**
**Localização:** `DEV/planka-personalizado/client/src/components/activities/BoardActivitiesPanel/BoardActivitiesPanel.jsx`

**Alterações Necessárias:**

#### **A. REMOVER Importação SVG (NÃO NECESSÁRIA)**
```jsx
// ❌ REMOVER esta linha:
// import GlassDistortion from './GlassDistortion';
```

#### **B. REMOVER SVG do JSX (NÃO NECESSÁRIO)**
```jsx
// ANTES (INCORRETO):
return (
  <>
    {/* SVG Distortion Filter */}
    <GlassDistortion /> // ❌ REMOVER - já existe em Root.jsx
    
    {/* Backdrop */}
    <div 
      className={styles.backdrop} 
      onClick={handleBackdropClick}
      aria-hidden="true"
    />
    
    {/* Painel */}
    <div
      ref={panelRef}
      className={`${styles.panel} ${styles.open} glass-panel`}
      role="dialog"
      aria-modal="true"
      aria-label={t('common.boardActions', { context: 'title' })}
      tabIndex={-1}
    >
      {/* ... resto do conteúdo ... */}
    </div>
  </>
);

// DEPOIS (CORRETO):
return (
  <>
    {/* Backdrop */}
    <div 
      className={styles.backdrop} 
      onClick={handleBackdropClick}
      aria-hidden="true"
    />
    
    {/* Painel */}
    <div
      ref={panelRef}
      className={`${styles.panel} ${styles.open} glass-panel`}
      role="dialog"
      aria-modal="true"
      aria-label={t('common.boardActions', { context: 'title' })}
      tabIndex={-1}
    >
      {/* ... resto do conteúdo ... */}
    </div>
  </>
);
```

---

### 3. **GlassDistortion.jsx (NOVO ARQUIVO)**
**Localização:** `DEV/planka-personalizado/client/src/components/activities/BoardActivitiesPanel/GlassDistortion.jsx`

**Conteúdo Completo:**
```jsx
/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';

const GlassDistortion = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="0"
      height="0"
      style={{ position: 'absolute', overflow: 'hidden' }}
      className="hidden"
    >
      <defs>
        <filter
          id="glass-distortion"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          className="hidden"
        >
          <feTurbulence 
            type="fractalNoise"
            baseFrequency="0.008 0.008"
            numOctaves="2"
            seed="92"
            result="noise"
            className="hidden"
          />
          <feGaussianBlur
            in="noise"
            stdDeviation="2"
            result="blurred"
            className="hidden"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurred"
            scale="77"
            xChannelSelector="R"
            yChannelSelector="G"
            className="hidden"
          />
        </filter>
      </defs>
    </svg>
  );
};

export default GlassDistortion;
```

---

### 4. **glass-theme.css - EXTENSÕES (OPCIONAL)**
**Localização:** `DEV/planka-personalizado/client/src/styles/glass-theme.css`

**Adicionar novas variáveis CSS para timeline panel:**
```css
:root {
  /* Variáveis existentes... */
  
  /* Novas variáveis para timeline panel */
  --timeline-panel-blur: 8px;
  --timeline-panel-border-radius: 20px;
  --timeline-panel-shadow: 0px 6px 24px rgba(0, 0, 0, 0.2);
  --timeline-panel-inner-shadow: inset 0 0 20px -5px rgba(255, 255, 255, 0.6);
  --timeline-panel-z-index: 10008;
  --timeline-panel-backdrop-z-index: 10007;
}
```

---

## 🔄 ETAPAS DE IMPLEMENTAÇÃO (VERSÃO CORRIGIDA)

### **FASE 1: Base Glass Structure (2-3 horas)**
1. ✅ Corrigir z-index para 10008 (acima de todos os elementos)
2. ✅ Modificar `.panel` com propriedades base
3. ✅ Implementar `::before` para sombras internas  
4. ✅ Configurar `::after` para backdrop blur
5. ✅ Ajustar `.backdrop` com z-index 10007

### **FASE 2: Integração com Sistema Glass (1 hora)**
1. ✅ Remover criação de GlassDistortion.jsx (já existe)
2. ✅ Usar filtro SVG existente em Root.jsx
3. ✅ Integrar com variáveis CSS existentes
4. ✅ Manter consistência com outros componentes glass

### **FASE 3: Elementos Interativos (2-3 horas)**
1. ✅ Estilizar `.closeButton` com glass effect
2. ✅ Implementar `.header` com gradiente
3. ✅ Adicionar `.placeholder` com efeito glass
4. ✅ Configurar transições suaves

### **FASE 4: Responsividade e Fallbacks (1-2 horas)**
1. ✅ Adicionar media queries para mobile
2. ✅ Implementar fallback para navegadores sem backdrop-filter
3. ✅ Testar compatibilidade cross-browser
4. ✅ Validar acessibilidade

### **FASE 5: Resolução de Conflitos CSS (1 hora)**
1. ✅ Implementar estratégia de sobrescrita com `!important`
2. ✅ Usar especificidade CSS para forçar estilos
3. ✅ Testar sobrescrita de estilos globais
4. ✅ Validar que borders são aplicadas corretamente

### **FASE 6: Preview de Ficheiros (3-4 horas)**
1. 🔄 Implementar sistema de preview de imagens
2. 🔄 Adicionar suporte para PDFs e documentos
3. 🔄 Criar modal de preview com glass effect
4. 🔄 Integrar com sistema de anexos existente
5. 🔄 Implementar lazy loading para performance

### **FASE 7: Otimização de Texto e Contraste (1-2 horas)**
1. 🔄 Implementar sistema de contraste dinâmico
2. 🔄 Adicionar text-shadow para legibilidade
3. 🔄 Criar fallbacks para navegadores sem backdrop-filter
4. 🔄 Otimizar cores para diferentes fundos
5. 🔄 Testar acessibilidade e contraste

---

## 🧪 TESTES NECESSÁRIOS (ATUALIZADOS)

### **Testes de Renderização**
- [ ] Chrome (suporte completo a backdrop-filter)
- [ ] Firefox (suporte parcial)
- [ ] Safari (suporte completo)
- [ ] Edge (suporte completo)

### **Testes de Performance**
- [ ] Verificar impacto no FPS
- [ ] Testar com múltiplos painéis abertos
- [ ] Validar animações suaves

### **Testes de Acessibilidade**
- [ ] Contraste de texto adequado
- [ ] Navegação por teclado
- [ ] Screen readers
- [ ] Zoom 200%

### **Testes de Responsividade**
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile landscape (667x375)

### **Testes de Sobrescrita CSS**
- [ ] Verificar que borders são aplicadas corretamente
- [ ] Testar especificidade CSS com `!important`
- [ ] Validar sobrescrita de estilos globais
- [ ] Confirmar que glass-panel não interfere com outros componentes

### **Testes de Integração (NOVOS)**
- [ ] Verificar que z-index 10008 funciona corretamente
- [ ] Testar que filtro SVG existente é usado
- [ ] Validar integração com sistema glass existente
- [ ] Confirmar que não há conflitos com outros modais/popups

### **Testes de Contraste e Legibilidade (NOVOS)**
- [ ] Verificar contraste de texto em diferentes fundos
- [ ] Testar text-shadow em navegadores modernos
- [ ] Validar fallbacks para navegadores legados
- [ ] Confirmar acessibilidade (WCAG 2.1 AA)
- [ ] Testar em diferentes resoluções e tamanhos de fonte

---

## 📊 CRONOGRAMA DETALHADO (ATUALIZADO)

| Fase | Duração | Tarefas | Status |
|------|---------|---------|--------|
| 1 | 2-3h | Base Glass Structure (z-index corrigido) | ✅ Concluído |
| 2 | 1h | Integração com Sistema Glass Existente | ✅ Concluído |
| 3 | 2-3h | Elementos Interativos | ✅ Concluído |
| 4 | 1-2h | Responsividade/Fallbacks | ✅ Concluído |
| 5 | 1h | Resolução de Conflitos CSS | ✅ Concluído |
| 6 | 3-4h | Preview de Ficheiros | 🔄 Próximo |
| 7 | 1-2h | Otimização de Texto e Contraste | ⏳ Pendente |
| **Total** | **11-16h** | **Implementação Completa** | **🔄 Em Progresso** |

---

## 🎨 RESULTADO ESPERADO

### **Efeito Visual Final:**
- **Profundidade:** Sistema de 3 camadas (main + ::before + ::after)
- **Reflexo:** Sombras internas e gradientes sutis
- **Blur:** Backdrop-filter com distorção SVG (usando filtro existente)
- **Interatividade:** Botões com hover effects e transições suaves
- **Responsividade:** Adaptação perfeita a todos os dispositivos

### **Compatibilidade:**
- **Navegadores Modernos:** Efeito liquid glass completo
- **Navegadores Legados:** Fallback com glass effect básico

---

## 📁 IMPLEMENTAÇÃO PREVIEW DE FICHEIROS

### **Objetivo:**
Adicionar funcionalidade de preview de imagens, PDFs e outros tipos de ficheiros no painel de timeline, mantendo a consistência visual com o tema glass.

### **Tipos de Ficheiros Suportados:**
- **Imagens:** JPG, PNG, GIF, WebP, SVG
- **Documentos:** PDF, DOC, DOCX, TXT
- **Outros:** ZIP, RAR (apenas lista de ficheiros)

### **Arquivos a Criar/Modificar:**

#### **1. Componente de Preview Modal**
**Localização:** `client/src/components/activities/FilePreviewModal/`

**Estrutura:**
```
FilePreviewModal/
├── FilePreviewModal.jsx
├── FilePreviewModal.module.scss
├── ImagePreview.jsx
├── PdfPreview.jsx
├── DocumentPreview.jsx
└── index.js
```

#### **2. Integração com Item.jsx**
**Modificações em:** `client/src/components/activities/BoardActivitiesModal/Item.jsx`

**Funcionalidades:**
- Detectar anexos de imagem/documento
- Mostrar thumbnails clicáveis
- Abrir modal de preview ao clicar
- Suporte para múltiplos anexos

#### **3. Sistema de Detecção de Tipos**
**Localização:** `client/src/utils/fileTypeUtils.js`

**Funcionalidades:**
- Detectar tipo de ficheiro por extensão
- Validar se é previewável
- Retornar componente apropriado

### **Implementação Segura:**

#### **A. Isolamento de Estilos**
- Usar CSS Modules para evitar conflitos
- Prefixar classes com `file-preview-*`
- Manter z-index controlado (10009)

#### **B. Integração com Sistema Existente**
- Reutilizar seletores de anexos existentes
- Manter compatibilidade com `AttachmentTypes`
- Não modificar lógica de upload/download

#### **C. Performance**
- Lazy loading de previews
- Cache de thumbnails
- Compressão de imagens grandes

### **Fluxo de Implementação:**

#### **Passo 1: Criar Utilitários**
```javascript
// fileTypeUtils.js
export const getFileType = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  return {
    isImage: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext),
    isPdf: ext === 'pdf',
    isDocument: ['doc', 'docx', 'txt'].includes(ext),
    extension: ext
  };
};
```

#### **Passo 2: Componente de Preview**
```jsx
// FilePreviewModal.jsx
const FilePreviewModal = ({ file, isOpen, onClose }) => {
  const fileType = getFileType(file.name);
  
  return (
    <Modal open={isOpen} onClose={onClose} className="glass-panel">
      {fileType.isImage && <ImagePreview file={file} />}
      {fileType.isPdf && <PdfPreview file={file} />}
      {fileType.isDocument && <DocumentPreview file={file} />}
    </Modal>
  );
};
```

#### **Passo 3: Integração com Item**
```jsx
// Item.jsx - modificação
const [previewFile, setPreviewFile] = useState(null);

const handleThumbnailClick = (attachment) => {
  setPreviewFile(attachment);
};

// No JSX
{thumbnailAttachments.map((attachment) => (
  <Image
    key={attachment.id}
    src={attachment.data.thumbnailUrls.outside360}
    size="mini"
    rounded
    className={styles.thumbnail}
    alt={attachment.name}
    onClick={() => handleThumbnailClick(attachment)}
  />
))}

<FilePreviewModal 
  file={previewFile} 
  isOpen={!!previewFile} 
  onClose={() => setPreviewFile(null)} 
/>
```

### **Considerações de Segurança:**
- Validar URLs de ficheiros
- Sanitizar nomes de ficheiros
- Limitar tamanho de preview
- Implementar timeout para carregamento

### **Testes Necessários:**
- [ ] Preview de diferentes tipos de imagem
- [ ] Carregamento de PDFs grandes
- [ ] Performance com múltiplos anexos
- [ ] Responsividade em mobile
- [ ] Acessibilidade (teclado, screen readers)
- **Mobile:** Performance otimizada
- **Acessibilidade:** Contraste e navegação adequados
- **Integração:** Compatível com sistema glass existente

---

## ⚠️ CONSIDERAÇÕES IMPORTANTES (ATUALIZADAS)

### **Performance**
- Backdrop-filter pode impactar performance em dispositivos mais fracos
- SVG filter já existe, não adiciona complexidade extra
- Considerar `will-change` para otimização

### **Compatibilidade**
- Fallback obrigatório para navegadores sem backdrop-filter
- Testar em diferentes versões do WebKit
- Validar em dispositivos móveis

### **Manutenibilidade**
- Código modular e bem documentado
- Variáveis CSS para fácil customização
- Separação clara entre efeitos e funcionalidade

### **Resolução de Conflitos CSS**
- **Problema:** Borders definidas em múltiplos locais podem causar conflitos
- **Solução:** Usar especificidade CSS e `!important` quando necessário
- **Estratégia:** Sobrescrever estilos globais com classes específicas

### **Integração com Sistema Existente (NOVO)**
- **Aproveitar:** Sistema glass já implementado
- **Usar:** Variáveis CSS existentes
- **Manter:** Consistência com outros componentes
- **Evitar:** Duplicação de código

---

**📝 NOTA:** Este documento foi corrigido para resolver problemas críticos de z-index, aproveitar o sistema glass existente e evitar duplicação de código. Cada alteração deve ser testada incrementalmente para garantir funcionamento correto em todas as etapas.

---

## 🎨 ESTRATÉGIA DE CONTRASTE E LEGIBILIDADE DE TEXTO

### **Problema Identificado:**
Com fundos glass transparentes, os textos podem ficar ilegíveis dependendo do conteúdo por trás.

### **Solução Implementada:**

#### **1. Sistema de Contraste Dinâmico (ESTILO iOS 26)**
```scss
// Variáveis CSS para contraste - ESTILO iOS 26
:root {
  --text-shadow-ios: 0 1px 2px rgba(0, 0, 0, 0.3);
  --text-shadow-ios-strong: 0 1px 3px rgba(0, 0, 0, 0.5);
  --text-white-opaque: #ffffff;
  --text-white-secondary: rgba(255, 255, 255, 0.9);
  --text-white-tertiary: rgba(255, 255, 255, 0.7);
}

// Classes para diferentes tipos de texto - ESTILO iOS 26
.text-primary-glass {
  color: var(--text-white-opaque) !important; // Branco opaco como iOS 26
  text-shadow: var(--text-shadow-ios) !important; // Sombra sutil
  font-weight: 500 !important;
  background: none !important; // Sem background - apenas texto
  padding: 0 !important;
  border-radius: 0 !important;
}

.text-secondary-glass {
  color: var(--text-white-secondary) !important; // Branco ligeiramente transparente
  text-shadow: var(--text-shadow-ios) !important;
  font-weight: 400 !important;
  background: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
}

.text-tertiary-glass {
  color: var(--text-white-tertiary) !important; // Branco mais transparente
  text-shadow: var(--text-shadow-ios) !important;
  font-weight: 400 !important;
  background: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
}

.text-link-glass {
  color: var(--text-white-opaque) !important; // Links brancos opacos
  text-shadow: var(--text-shadow-ios) !important;
  font-weight: 500 !important;
  background: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
  text-decoration: underline !important;
  text-decoration-color: rgba(255, 255, 255, 0.3) !important;
  
  &:hover {
    color: var(--text-white-opaque) !important;
    text-shadow: var(--text-shadow-ios-strong) !important;
    text-decoration-color: rgba(255, 255, 255, 0.6) !important;
  }
}

// Títulos grandes como na imagem
.text-title-glass {
  color: var(--text-white-opaque) !important;
  text-shadow: var(--text-shadow-ios-strong) !important;
  font-weight: 600 !important;
  font-size: 1.2em !important;
  background: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
}
```

#### **2. Aplicação nos Componentes (ESTILO iOS 26)**
```scss
// BoardActivitiesPanel.module.scss
.title {
  @extend .text-title-glass; // Título grande como na imagem
  font-size: 20px !important;
  margin-bottom: 16px !important;
}

.content {
  // Texto principal das atividades - ESTILO iOS 26
  .author {
    @extend .text-primary-glass; // Nome do utilizador branco opaco
  }
  
  a {
    @extend .text-link-glass; // Links brancos com underline sutil
  }
  
  .date {
    @extend .text-tertiary-glass; // Data mais transparente
  }
  
  // Texto geral das atividades
  color: var(--text-white-secondary) !important;
  text-shadow: var(--text-shadow-ios) !important;
  line-height: 1.4 !important;
}

// Item.module.scss - ESTILO iOS 26
:global(#app) {
  .author {
    @extend .text-primary-glass; // Nome branco opaco
  }
  
  .content {
    // Sem fundo - apenas texto sobre glass
    background: none !important;
    padding: 12px 0 !important;
    border-radius: 0 !important;
    margin: 0 !important;
    color: var(--text-white-secondary) !important;
    text-shadow: var(--text-shadow-ios) !important;
  }
  
  .date {
    @extend .text-tertiary-glass; // Data mais transparente
  }
  
  // Links nos comentários
  a {
    @extend .text-link-glass;
  }
}
```

#### **3. Fallbacks para Navegadores Legados (ESTILO iOS 26)**
```scss
// Fallback para navegadores sem backdrop-filter
@supports not (backdrop-filter: blur(2px)) {
  .text-primary-glass {
    background: rgba(0, 0, 0, 0.3) !important; // Fundo sutil para legibilidade
    color: #ffffff !important;
    text-shadow: none !important;
    padding: 2px 4px !important;
    border-radius: 4px !important;
  }
  
  .text-secondary-glass {
    background: rgba(0, 0, 0, 0.2) !important;
    color: rgba(255, 255, 255, 0.9) !important;
    text-shadow: none !important;
    padding: 1px 3px !important;
    border-radius: 3px !important;
  }
  
  .text-tertiary-glass {
    background: rgba(0, 0, 0, 0.15) !important;
    color: rgba(255, 255, 255, 0.7) !important;
    text-shadow: none !important;
    padding: 1px 2px !important;
    border-radius: 2px !important;
  }
  
  .text-link-glass {
    background: rgba(0, 0, 0, 0.25) !important;
    color: #ffffff !important;
    text-shadow: none !important;
    padding: 2px 4px !important;
    border-radius: 4px !important;
    text-decoration: underline !important;
  }
  
  .text-title-glass {
    background: rgba(0, 0, 0, 0.4) !important;
    color: #ffffff !important;
    text-shadow: none !important;
    padding: 4px 8px !important;
    border-radius: 6px !important;
  }
}
```

#### **4. Detecção Automática de Contraste**
```javascript
// utils/contrastUtils.js
export const getContrastRatio = (background, foreground) => {
  // Implementar algoritmo WCAG para calcular contraste
  // Retornar 'light' ou 'dark' para aplicar estilo apropriado
};

export const applyContrastClass = (element, backgroundElement) => {
  const contrast = getContrastRatio(backgroundElement, element);
  element.classList.add(`text-${contrast}-glass`);
};
```

### **Benefícios da Estratégia (ESTILO iOS 26):**
- ✅ **Visual iOS 26:** Textos brancos opacos como na imagem
- ✅ **Legibilidade Perfeita:** Text-shadow sutil mas eficaz
- ✅ **Acessibilidade:** Conformidade com WCAG 2.1 AA
- ✅ **Estética Glass:** Semi-transparência apenas no fundo
- ✅ **Performance:** CSS puro, sem JavaScript necessário
- ✅ **Compatibilidade:** Fallbacks inteligentes para navegadores legados
- ✅ **Consistência:** Usa variáveis CSS existentes
