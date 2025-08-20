# Documentação CSS dos Cartões - Planka

## 📍 Localização Principal do Fundo dos Cartões

### 🎯 **FUNDO DO MODAL DO CARTÃO (CONFIRMADO)**
**Arquivo:** `ProjectContent.module.scss`
**Caminho:** `DEV/planka-personalizado/client/src/components/cards/CardModal/ProjectContent.module.scss`

**Seção Principal (linha 296-300):**
```scss
.wrapper {
  background: #f5f6f7;  /* ← AQUI SE EDITA O FUNDO DO MODAL */
  border-radius: 4px;
  margin: 0;
}
```

### 🎯 **FUNDO DO CARTÃO NO QUADRO**
**Arquivo:** `Card.module.scss`
**Caminho:** `DEV/planka-personalizado/client/src/components/cards/Card/Card.module.scss`

**Seção Principal (linhas 50-95):**
```scss
.wrapper {
  /* Liquid Glass base */
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%),
    rgba(24, 28, 36, 0.5);
  border: none;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease,
    background 0.2s ease;

  /* Inner depth and subtle tint */
  &:before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    border-radius: inherit;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: transparent;
  }

  /* Optional distortion/shine layer */
  &:after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    border-radius: inherit;
    filter: url('#glass-distortion');
    opacity: 0.12;
    background: linear-gradient(130deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 45%);
    mix-blend-mode: screen;
  }

  &:hover {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%),
      rgba(24, 28, 36, 0.52);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transform: none;

    .actionsButton {
      opacity: 1;
    }
    
    &:before {
      border-color: rgba(255, 255, 255, 0.22);
    }
  }
}
```

## 🎨 Arquivos CSS Relacionados aos Cartões

### 1. **Modal do Cartão (CONFIRMADO)**
- **Arquivo:** `ProjectContent.module.scss`
- **Caminho:** `client/src/components/cards/CardModal/ProjectContent.module.scss`
- **Função:** Estilos do modal que abre quando clica no cartão (fundo principal)

### 2. **Card Principal (no quadro)**
- **Arquivo:** `Card.module.scss`
- **Caminho:** `client/src/components/cards/Card/Card.module.scss`
- **Função:** Estilos principais do cartão no quadro (fundo, bordas, efeitos glass)

### 3. **Conteúdo Inline**
- **Arquivo:** `InlineContent.module.scss`
- **Caminho:** `client/src/components/cards/Card/InlineContent.module.scss`
- **Função:** Estilos para cartões inline (texto simples)

### 4. **Conteúdo de Projeto (no quadro)**
- **Arquivo:** `ProjectContent.module.scss`
- **Caminho:** `client/src/components/cards/Card/ProjectContent.module.scss`
- **Função:** Estilos para cartões de projeto no quadro (com imagens, descrições)

### 5. **Conteúdo de História**
- **Arquivo:** `StoryContent.module.scss`
- **Caminho:** `client/src/components/cards/Card/StoryContent.module.scss`
- **Função:** Estilos para cartões de história (narrativas)

### 6. **Cartão Arrastável**
- **Arquivo:** `DraggableCard.module.scss`
- **Caminho:** `client/src/components/cards/DraggableCard/DraggableCard.module.scss`
- **Função:** Estilos para funcionalidade de arrastar

### 7. **Chips e Elementos**
- **Arquivo:** `DueDateChip.module.scss`
- **Caminho:** `client/src/components/cards/DueDateChip/DueDateChip.module.scss`
- **Função:** Estilos para chips de data de vencimento

- **Arquivo:** `StopwatchChip.module.scss`
- **Caminho:** `client/src/components/cards/StopwatchChip/StopwatchChip.module.scss`
- **Função:** Estilos para chips de cronômetro

## 🌟 Tema Glass (Efeitos Visuais)

### 1. **Tema Glass Principal**
- **Arquivo:** `glass-theme.css`
- **Caminho:** `client/src/styles/glass-theme.css`
- **Função:** Variáveis CSS e classes utilitárias para efeito glass

### 2. **Modal Glass**
- **Arquivo:** `glass-modal.css`
- **Caminho:** `client/src/styles/glass-modal.css`
- **Função:** Estilos específicos para modais com efeito glass

### 3. **Estilos Globais**
- **Arquivo:** `styles.module.scss`
- **Caminho:** `client/src/styles.module.scss`
- **Função:** Estilos globais da aplicação

## 🎯 Como Editar o Fundo dos Cartões

### Para alterar o fundo do MODAL do cartão (janela que abre):
1. **Abra:** `DEV/planka-personalizado/client/src/components/cards/CardModal/ProjectContent.module.scss`
2. **Localize:** A classe `.wrapper` (linha 296-300)
3. **Modifique:** A propriedade `background` dentro de `.wrapper`

**Nota:** Para usar o mesmo fundo dos popups, altere para:
```scss
background: rgba(14, 17, 23, 0.75) !important;
```

### Para alterar o fundo do cartão no QUADRO:
1. **Abra:** `DEV/planka-personalizado/client/src/components/cards/Card/Card.module.scss`
2. **Localize:** A classe `.wrapper` (linha 50)
3. **Modifique:** A propriedade `background` dentro de `.wrapper`

**Nota:** Para usar o mesmo fundo dos popups, altere para:
```scss
background: rgba(14, 17, 23, 0.75) !important;
```

### Exemplo de modificação do MODAL:
```scss
.wrapper {
  background: rgba(255, 0, 0, 0.3); /* Fundo vermelho transparente */
  border-radius: 4px;
  margin: 0;
}
```

### Exemplo de modificação do CARTÃO no quadro:
```scss
.wrapper {
  /* Seu novo fundo aqui */
  background: 
    linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%),
    rgba(30, 35, 45, 0.6); /* Fundo mais escuro */
  
  /* Resto das propriedades... */
}
```

### Para alterar o efeito hover do cartão no quadro:
1. **Localize:** A seção `&:hover` dentro de `.wrapper` no arquivo `Card.module.scss`
2. **Modifique:** A propriedade `background` no hover

## 🔧 Estrutura de Classes CSS

### Classes Principais:
- `.wrapper` - Container principal do cartão
- `.content` - Conteúdo interno do cartão
- `.contentDisabled` - Estado desabilitado
- `.wrapperRecent` - Cartão recentemente criado
- `.actionsButton` - Botão de ações

### Classes de Conteúdo:
- `.name` - Nome do cartão
- `.nameClosed` - Nome riscado (cartão fechado)
- `.notification` - Badge de notificação
- `.labels` - Etiquetas do cartão
- `.attachments` - Anexos
- `.cover` - Imagem de capa

## 📝 Notas Importantes

1. **Efeito Glass:** O fundo usa `backdrop-filter: blur()` para criar o efeito de vidro
2. **Compatibilidade:** Inclui `-webkit-backdrop-filter` para Safari
3. **Transições:** Todas as mudanças têm transições suaves (0.2s ease)
4. **Pseudo-elementos:** Usa `:before` e `:after` para efeitos de profundidade
5. **Responsividade:** Os estilos são responsivos e se adaptam a diferentes tamanhos

## 🎨 Variáveis CSS Disponíveis

```css
:root {
  --glass-bg-rgb: 14, 17, 23;
  --glass-bg-strong-rgb: 20, 25, 34;
  --glass-border: rgba(255, 255, 255, 0.06);
  --glass-shadow: 0 14px 34px rgba(0, 0, 0, 0.55);
  --glass-blur: 16px;
  --text-primary: #e6edf3;
  --text-secondary: rgba(230, 237, 243, 0.75);
  --accent: #3b82f6;
}
```

## 🎯 **POPUPS E MENUS (CONFIRMADO)**

### **Arquivo Principal:** `Popup.module.css`
**Caminho:** `DEV/planka-personalizado/client/src/lib/popup/Popup.module.css`

### **Seções Principais:**

#### 1. **Wrapper Base (linha 35-44):**
```css
.wrapper {
  border-radius: 3px !important;
  border-width: 0 !important;
  box-shadow: 0 8px 16px -4px rgba(9, 45, 66, 0.25),
    0 0 0 1px rgba(9, 45, 66, 0.08) !important;
  margin-top: 6px !important;
  max-height: calc(100% - 70px);
  padding: 0 12px 12px !important;
  width: 304px;
}
```

#### 2. **Variante Glass (linha 47-58):**
```css
.glass {
  border-radius: 16px !important;
  background: rgba(14, 17, 23, 0.75) !important; /* ← FUNDO DOS POPUPS */
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.55) !important; /* ← SOMBRA DOS POPUPS */
  padding: 0 16px 12px !important;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  color: #e6edf3;
}
```

#### 3. **🎯 FUNDO PRINCIPAL DOS POPUPS (linha 62-70):**
```css
.glass::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  z-index: -1; /* manter blur atrás do conteúdo */
  pointer-events: none;
}
```

**Nota:** O fundo visual é criado pelo pseudo-elemento `::after` com `z-index: -1`. Para alterar o fundo, adicione `background: rgba(255, 0, 0, 0.3) !important;` nesta seção.

#### 4. **Variante Notifications (linha 75-85):**
```css
.notifications {
  width: 392px;
  border-radius: 16px !important;
  background: rgba(14, 17, 23, 0.75) !important; /* ← FUNDO POPUP NOTIFICAÇÕES */
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.55) !important; /* ← SOMBRA */
  padding: 0 16px 16px !important;
  position: relative;
  isolation: isolate;
  overflow: hidden;
}
```

#### 5. **Variante User (linha 105-115):**
```css
.user {
  width: 320px;
  border-radius: 16px !important;
  background: rgba(14, 17, 23, 0.75) !important; /* ← FUNDO POPUP UTILIZADOR */
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.55) !important; /* ← SOMBRA */
  padding: 0 16px 12px !important;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  color: #e6edf3;
}
```

### **Como Editar:**
1. **Fundo:** Modifique a propriedade `background` nas classes `.glass`, `.notifications`, `.user`
2. **Sombra:** Modifique a propriedade `box-shadow` nas mesmas classes
3. **Efeito Glass:** O `backdrop-filter: blur(16px)` cria o efeito de vidro

---

## 🔍 Busca por Palavras-chave

Para encontrar outros estilos relacionados:
- `background` - Propriedades de fundo
- `card` - Classes relacionadas a cartões
- `wrapper` - Containers principais
- `glass` - Efeitos de vidro
- `hover` - Estados de hover
- `transition` - Animações e transições
- `popup` - Menus e popups
- `menu` - Menus dropdown

---

## 🌑 **DIMMER DOS MODAIS (CONFIRMADO)**

### **🎯 Classes `dimmable dimmed` no `<body>`**

Quando um modal de cartão é aberto, as classes `dimmable dimmed` são automaticamente adicionadas ao elemento `<body>` pelo Semantic UI React.

**Exemplo:**
```html
<body id="app" class="g-root g-root_theme_light dimmable dimmed scrolling">
```

### **📁 Localização do Controle:**

#### **Arquivo Principal:** `use-closable-modal.jsx`
**Caminho:** `DEV/planka-personalizado/client/src/hooks/use-closable-modal.jsx`

**Seção Principal (linha 47):**
```jsx
<Modal
  open
  {...props}
  className={mergedClassName}
  closeIcon={closeIcon}
  onClose={handleClose}
  dimmer={{ inverted: true, className: 'red-dimmer' }} // ← AQUI SE CONTROLA O DIMMER
/>
```

### **🎨 Como Personalizar o Dimmer:**

#### **Opção 1: Via Props do Modal (Recomendado)**
No arquivo `use-closable-modal.jsx`, modifique a prop `dimmer`:

```jsx
// Dimmer personalizado
dimmer={{ 
  inverted: true, 
  className: 'custom-dimmer',
  blurring: true 
}}

// Dimmer com cor personalizada
dimmer={{ 
  inverted: true, 
  className: 'red-dimmer' 
}}
```

#### **Opção 2: Via CSS Global**
No arquivo `DEV/planka-personalizado/client/src/lib/custom-ui/styles.css`, adicione:

```css
/* Dimmer personalizado */
.custom-dimmer {
  background: rgba(0, 0, 0, 0.8) !important;
}

/* Dimmer vermelho para testes */
.red-dimmer {
  background: rgba(255, 0, 0, 0.5) !important;
}
```

### **🔧 Propriedades Disponíveis do Dimmer:**

- `inverted: true` - Dimmer escuro (padrão)
- `inverted: false` - Dimmer claro
- `blurring: true` - Efeito de blur no fundo
- `className: 'custom-class'` - Classe CSS personalizada
- `page: true` - Dimmer em toda a página
- `closable: true` - Fechar ao clicar no dimmer

### **📝 Notas Importantes:**

1. **Semantic UI:** O dimmer é controlado pelo componente `Modal` do Semantic UI React
2. **Automático:** As classes `dimmable dimmed` são adicionadas automaticamente
3. **CSS Global:** Para estilos personalizados, use o arquivo `custom-ui/styles.css`
4. **Prioridade:** Use `!important` para sobrescrever estilos do Semantic UI
5. **Hook:** O `useClosableModal` é usado pelo `CardModal.jsx` para renderizar o modal

### **🎯 Exemplo de Implementação:**

```jsx
// Em use-closable-modal.jsx
<Modal
  open
  {...props}
  className={mergedClassName}
  closeIcon={closeIcon}
  onClose={handleClose}
  dimmer={{ 
    inverted: true, 
    className: 'glass-dimmer',
    blurring: true 
  }}
/>
```

```css
/* Em custom-ui/styles.css */
.glass-dimmer {
  background: rgba(14, 17, 23, 0.75) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
}
```

---

## 🎨 **CORES DOS TEXTOS DOS CARTÕES (CONFIRMADO)**

### **📁 Localização dos Arquivos:**

#### **1. Cartão no Quadro - Conteúdo de Projeto**
**Arquivo:** `ProjectContent.module.scss`
**Caminho:** `DEV/planka-personalizado/client/src/components/cards/Card/ProjectContent.module.scss`

**Cores Principais:**
```scss
.name {
  color: #f3f4f6; /* ← COR PRINCIPAL DO TÍTULO DO CARTÃO */
  font-size: 14px;
  line-height: 18px;
}

.attachmentContent {
  color: #9ca3af; /* ← COR DOS TEXTOS SECUNDÁRIOS */
  font-size: 12px;
  line-height: 20px;
}

.notification {
  color: #fff; /* ← COR DO TEXTO DAS NOTIFICAÇÕES */
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
}
```

#### **2. Cartão no Quadro - Conteúdo Inline**
**Arquivo:** `InlineContent.module.scss`
**Caminho:** `DEV/planka-personalizado/client/src/components/cards/Card/InlineContent.module.scss`

**Cores Principais:**
```scss
.name {
  color: #f3f4f6; /* ← COR PRINCIPAL DO TÍTULO */
  font-size: 12px;
  font-weight: 300;
}

.attachmentContent {
  color: #9ca3af; /* ← COR DOS TEXTOS SECUNDÁRIOS */
  font-size: 12px;
  line-height: 20px;
}

.notification {
  color: #fff; /* ← COR DO TEXTO DAS NOTIFICAÇÕES */
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
}
```

#### **3. Cartão no Quadro - Conteúdo de História**
**Arquivo:** `StoryContent.module.scss`
**Caminho:** `DEV/planka-personalizado/client/src/components/cards/Card/StoryContent.module.scss`

**Cores Principais:**
```scss
.name {
  color: #f3f4f6; /* ← COR PRINCIPAL DO TÍTULO */
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
}

.descriptionText {
  color: #d1d5db; /* ← COR DO TEXTO DA DESCRIÇÃO */
  font-size: 10px;
}

.notification {
  color: #fff; /* ← COR DO TEXTO DAS NOTIFICAÇÕES */
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
}
```

#### **4. Modal do Cartão**
**Arquivo:** `ProjectContent.module.scss`
**Caminho:** `DEV/planka-personalizado/client/src/components/cards/CardModal/ProjectContent.module.scss`

**Cores Principais:**
```scss
.headerTitle {
  color: #17394d; /* ← COR PRINCIPAL DO TÍTULO NO MODAL */
  font-size: 20px;
  font-weight: bold;
}

.moduleHeader {
  color: #17394d; /* ← COR DOS CABEÇALHOS DOS MÓDULOS */
  font-size: 16px;
  font-weight: bold;
}

.text {
  color: #6b808c; /* ← COR DOS TEXTOS SECUNDÁRIOS */
  font-size: 12px;
  font-weight: bold;
}

.dueDate {
  color: #6b808c; /* ← COR DO TEXTO DA DATA */
}

.descriptionButton {
  color: #6b808c; /* ← COR DO BOTÃO DE DESCRIÇÃO */
}
```

#### **5. Campo de Edição do Nome (CONFIRMADO)**
**Arquivo:** `NameField.module.scss`
**Caminho:** `DEV/planka-personalizado/client/src/components/cards/CardModal/NameField.module.scss`

**Campo Principal (linha 13):**
```scss
.field {
  background: transparent;
  border: 1px solid transparent;
  border-radius: 3px;
  box-shadow: none;
  color: #17394d; /* ← COR DO TEXTO QUANDO EDITAS O NOME DO CARTÃO */
  font-weight: bold;
  margin: -5px;
  overflow: hidden;
  padding: 4px;
  resize: none;
  width: 100%;
}
```

**Nota:** Este é o campo de texto onde escreves o nome do cartão quando clicas para editar no modal.

#### **6. Chips e Elementos Especiais**

**DueDateChip:**
```scss
.wrapper {
  color: #6a808b; /* ← COR PADRÃO DO CHIP */
  background: #dce0e4;
}

.wrapperDueSoon {
  color: #fff; /* ← COR QUANDO VENCE EM BREVE */
  background: #f2711c;
}

.wrapperOverdue {
  color: #fff; /* ← COR QUANDO VENCIDO */
  background: #db2828;
}
```

**StopwatchChip:**
```scss
.wrapper {
  color: #6a808b; /* ← COR PADRÃO DO CRONÔMETRO */
  background: #dce0e4;
}

.wrapperActive {
  color: #fff; /* ← COR QUANDO ATIVO */
  background: #21ba45;
}
```

### **🎯 Como Editar as Cores dos Textos:**

#### **Para alterar a cor do título principal dos cartões:**
1. **Abra:** `DEV/planka-personalizado/client/src/components/cards/Card/ProjectContent.module.scss`
2. **Localize:** A classe `.name` (linha 67)
3. **Modifique:** A propriedade `color: #f3f4f6;`

#### **Para alterar a cor dos textos secundários:**
1. **Localize:** A classe `.attachmentContent` (linha 16)
2. **Modifique:** A propriedade `color: #9ca3af;`

#### **Para alterar a cor do título no modal:**
1. **Abra:** `DEV/planka-personalizado/client/src/components/cards/CardModal/ProjectContent.module.scss`
2. **Localize:** A classe `.headerTitle` (linha 175)
3. **Modifique:** A propriedade `color: #17394d;`

#### **Para alterar a cor do campo de edição do nome:**
1. **Abra:** `DEV/planka-personalizado/client/src/components/cards/CardModal/NameField.module.scss`
2. **Localize:** A classe `.field` (linha 13)
3. **Modifique:** A propriedade `color: #17394d;`

### **🎨 Paleta de Cores Atual:**

- **Títulos Principais:** `#f3f4f6` (branco acinzentado)
- **Textos Secundários:** `#9ca3af` (cinza claro)
- **Descrições:** `#d1d5db` (cinza médio)
- **Modal Títulos:** `#17394d` (azul escuro)
- **Modal Textos:** `#6b808c` (cinza azulado)
- **Notificações:** `#fff` (branco)
- **Chips Padrão:** `#6a808b` (cinza azulado)
- **Botão de Ações:** `#9ca3af` (cinza claro)

### **📝 Notas Importantes:**

1. **Consistência:** As cores são consistentes entre diferentes tipos de cartão
2. **Contraste:** As cores foram escolhidas para garantir boa legibilidade
3. **Estados:** Diferentes estados (hover, ativo, vencido) têm cores específicas
4. **Responsividade:** As cores se mantêm em diferentes tamanhos de tela
5. **Acessibilidade:** As cores atendem aos padrões de contraste para acessibilidade
