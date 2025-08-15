# 🍕 Food Flow - App de Delivery

Um aplicativo de delivery moderno e responsivo desenvolvido com **Angular/Ionic**, seguindo as melhores práticas de desenvolvimento e arquitetura limpa.

## 🚀 Características

- **Design Moderno**: Interface limpa e intuitiva inspirada nos melhores apps de delivery
- **Responsivo**: Funciona perfeitamente em dispositivos móveis e desktop
- **Performance**: Otimizado para carregamento rápido e experiência fluida
- **Arquitetura Limpa**: Código organizado seguindo princípios SOLID
- **TypeScript**: Type safety completo para maior confiabilidade
- **Componentes Reutilizáveis**: Estrutura modular e escalável

## 🛠️ Tecnologias Utilizadas

- **Angular 17+**: Framework principal
- **Ionic 7+**: Framework para aplicações móveis
- **TypeScript**: Linguagem de programação
- **SCSS**: Pré-processador CSS
- **RxJS**: Programação reativa
- **Angular Router**: Navegação entre páginas

## 📱 Funcionalidades

### ✅ Implementadas
- [x] **Home Page**: Lista de restaurantes e categorias
- [x] **Busca**: Filtro por nome de restaurante ou tipo de culinária
- [x] **Categorias**: Filtro por categoria de comida
- [x] **Design Responsivo**: Adaptação para diferentes tamanhos de tela
- [x] **Loading States**: Indicadores de carregamento
- [x] **Empty States**: Estados vazios informativos
- [x] **Animações**: Transições suaves e interativas

### 🚧 Em Desenvolvimento
- [ ] **Página do Restaurante**: Menu completo e detalhes
- [ ] **Carrinho de Compras**: Adicionar/remover itens
- [ ] **Checkout**: Processo de finalização do pedido
- [ ] **Perfil do Usuário**: Dados pessoais e endereços
- [ ] **Histórico de Pedidos**: Lista de pedidos anteriores
- [ ] **Autenticação**: Login e cadastro de usuários

## 🏗️ Estrutura do Projeto

```
src/
├── app/
│   ├── models/           # Interfaces e tipos TypeScript
│   ├── services/         # Serviços para lógica de negócio
│   ├── home/            # Página principal
│   ├── restaurant/      # Página do restaurante (futuro)
│   ├── cart/           # Carrinho de compras (futuro)
│   ├── profile/        # Perfil do usuário (futuro)
│   └── orders/         # Histórico de pedidos (futuro)
├── assets/
│   └── images/         # Imagens do projeto
└── theme/              # Variáveis de tema
```

## 🎨 Design System

### Cores
- **Primary**: `#e53e3e` (Vermelho)
- **Secondary**: `#ed8936` (Laranja)
- **Accent**: `#f6e05e` (Amarelo)
- **Success**: `#38a169` (Verde)

### Gradientes
- **Primary Gradient**: Vermelho → Laranja
- **Warm Gradient**: Laranja → Amarelo

### Sombras
- **Card Shadow**: Sombra sutil para cards
- **Hover Shadow**: Sombra mais pronunciada no hover

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Ionic CLI

### Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd food_flow
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o projeto**
```bash
# Desenvolvimento
ionic serve

# Build para produção
ionic build

# Executar no dispositivo móvel
ionic capacitor run android
ionic capacitor run ios
```

## 📱 Screenshots

### Home Page
- Header com logo e busca
- Seção de destaque com promoções
- Grid de categorias
- Lista de restaurantes próximos

### Responsividade
- Mobile-first design
- Adaptação para tablets e desktop
- Navegação otimizada para touch

## 🧪 Testes

```bash
# Executar testes unitários
npm test

# Executar testes e2e
npm run e2e
```

## 📦 Build e Deploy

### Android
```bash
ionic capacitor add android
ionic capacitor copy android
ionic capacitor open android
```

### iOS
```bash
ionic capacitor add ios
ionic capacitor copy ios
ionic capacitor open ios
```

### Web
```bash
ionic build --prod
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Seu Nome**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [Seu Nome](https://linkedin.com/in/seu-perfil)

## 🙏 Agradecimentos

- [Ionic Framework](https://ionicframework.com/)
- [Angular](https://angular.io/)
- [Ionicons](https://ionicons.com/)
- Comunidade Angular/Ionic

---

⭐ Se este projeto te ajudou, considere dar uma estrela!
