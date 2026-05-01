# Project TODO - Santos Anjos 3D

## Produtos Completados
- [x] Nossa Senhora de Lourdes (pequena)
- [x] Sagrado Coração de Maria
- [x] Santa Gianna
- [x] Santa Hildegarda de Bingen (branca)
- [x] São Francisco de Assis
- [x] São José com Menino Jesus
- [x] Santo Antônio
- [x] São Bento
- [x] São Josemaria
- [x] São Miguel Pequeno (94mm)
- [x] São Miguel Médio (308mm)
- [x] Nossa Senhora de Lourdes Grande - Branca
- [x] Nossa Senhora de Lourdes Grande - Marrom
- [x] Nossa Senhora de Lourdes Grande - Verde

## Novos Produtos a Adicionar
- [x] Santa Hildegarda Verde (novo produto com imagem fornecida)

## Tarefas Pendentes
- [x] Processar imagem de Santa Hildegarda Verde com fundo branco
- [x] Adicionar Santa Hildegarda Verde ao catálogo
- [x] Testar catálogo atualizado
- [x] Editar imagem com fundo branco padronizado
- [x] Verificar imagem no catálogo

## Novo Recurso: Seletor de Cores
- [x] Atualizar estrutura de dados dos produtos com variações de cores
- [x] Implementar componente de seletor de cores na UI
- [x] Testar seletor de cores e integração com carrinho
- [x] Salvar checkpoint com seletor de cores implementado

## Novo Recurso: Seletor de Tamanhos com Preços
- [x] Atualizar estrutura de dados dos produtos com variações de tamanhos e preços
- [x] Implementar componente de seletor de tamanhos na UI com preço dinâmico
- [x] Testar seletor de tamanhos e integração com WhatsApp
- [x] Salvar checkpoint com seletor de tamanhos implementado

## Bug Fix: Erro "Failed to fetch" na API
- [x] Investigar e diagnosticar o erro de API
- [x] Verificar logs do servidor e conectividade
- [x] Corrigir o problema identificado
- [x] Testar a API e confirmar o funcionamento

## Novo Recurso: Carrinho de Compras Persistente
- [x] Criar hook useCart com gerenciamento de estado e localStorage
- [x] Implementar componente Cart com interface visual
- [x] Integrar carrinho com ProductModal e adicionar botão 'Adicionar ao Carrinho'
- [x] Implementar integração com WhatsApp para checkout
- [x] Testar carrinho e salvar checkpoint

## Bug Fix: Carrinho não está adicionando itens
- [ ] Investigar e diagnosticar o problema do carrinho
- [ ] Verificar logs do navegador e console de erros
- [ ] Corrigir o problema identificado
- [ ] Testar o carrinho e confirmar o funcionamento

## Bug Fix: Carrinho requer reload para mostrar itens
- [x] Criar sistema de sincronização de carrinho com eventos
- [x] Atualizar useCartSimple para usar eventos de sincronização
- [x] Testar o carrinho em tempo real
- [x] Corrigir número de WhatsApp no carrinho
- [x] Salvar checkpoint com carrinho corrigido

## Novo Recurso: Calculador de Frete Integrado (Melhor Envio API)
- [x] Criar componente ShippingCalculator com integração Melhor Envio
- [x] Integrar API do Melhor Envio no servidor (routers.ts)
- [x] Atualizar carrinho para incluir cálculo de frete automático
- [x] Atualizar mensagem do WhatsApp com frete incluído
- [x] Implementar seleção de serviço de frete (PAC, SEDEX, etc.)
- [x] Adicionar validação de CEP e opção de frete obrigatória
- [ ] Publicar site para testar API em produção (DNS bloqueado no sandbox)

## Bug Fix: Erro DNS em Produção (api.melhorenvio.com.br)
- [x] Investigar erro ENOTFOUND em produção
- [x] Verificar configuração de DNS/rede do servidor
- [x] Testar conexão direta com API do Melhor Envio
- [x] Implementar tabela de frete por região como solução alternativa
- [x] Criar testes unitários para tabela de frete
- [x] Validar cálculo de frete funcionando

## Atualização: Preços e Prazos Reais de Frete
- [x] Fazer cotações reais nos Correios para os 3 tamanhos (P, M, G)
- [x] Aumentar todos os valores em 10%
- [x] Adicionar 2 dias úteis em todos os prazos de entrega
- [x] Testar cálculo com novos valores
- [ ] Salvar checkpoint com tabela atualizada

## Feature: Retirar no Local
- [x] Adicionar opção de retirada à tabela de frete (R$ 0,00)
- [x] Atualizar ShippingCalculator para exibir retirada
- [x] Testar opção de retirada funcionando
- [x] Salvar checkpoint com retirada implementada
## Bug Fix: Remover tamanho Grande (G) do São Miguel
- [x] Remover opção de tamanho G do São Miguel
- [x] Manter apenas P e M para este produto
- [x] Testar mudança no carrinho
- [x] Salvar checkpoint com mudança


## Feature: Atualizar Preços com Margem de 60%
- [x] Processar tabela de custos fornecida
- [x] Atualizar preços de todos os produtos no Catalog.tsx
- [x] Testar preços atualizados no site
- [x] Salvar checkpoint com preços atualizados


## UI Fix: Remover Fundo Branco do Logo
- [x] Localizar arquivo do logo
- [x] Remover fundo branco e deixar transparente
- [x] Testar logo no site
- [x] Salvar checkpoint com logo atualizado

## Feature: Ativar API Melhor Envio com Fallback
- [x] Modificar router para tentar API primeiro
- [x] Implementar fallback para tabela estática em caso de erro
- [x] Adicionar logs detalhados para debug
- [x] Converter formato de resposta da API para formato do frontend
- [x] Adicionar opção de retirada local aos resultados da API
- [ ] Testar cálculo de frete no site (API + fallback)
- [ ] Salvar checkpoint com API ativada

## Debug: Endpoint para Visualizar Logs da API Melhor Envio
- [ ] Criar endpoint de debug para mostrar logs do servidor
- [ ] Testar endpoint e verificar erros da API
- [ ] Diagnosticar problema de conectividade
- [ ] Salvar checkpoint com endpoint de debug

## Bug: Deploy Vercel mostrando código-fonte
- [ ] Criar arquivo vercel.json com configurações corretas
- [ ] Ajustar build command e output directory
- [ ] Fazer commit e push para GitHub
- [ ] Verificar redeploy automático na Vercel
- [ ] Testar API Melhor Envio no site publicado


## MIGRAÇÃO VERCEL - NOVA ARQUITETURA SERVERLESS
- [x] Remover tRPC e dependências complexas (build:frontend criado)
- [x] Criar API simples em `/api/shipping.ts` (Vercel Functions) - já existe
- [x] Converter frontend para HTML/CSS/JS puro ou React simples (React + Vite)
- [x] Testar localmente com Vercel CLI (build funcionando)
- [ ] Configurar variáveis de ambiente na Vercel
- [ ] Deploy e validar funcionamento em produção

## Bug Fix: API de frete retornando HTML no ambiente local
- [x] Registrar rota /api/calculate-shipping no servidor Express local
- [x] Testar cálculo de frete no ambiente local
- [x] Salvar checkpoint com correção

## Bug Fix: Deploy falhou - MODULE_NOT_FOUND dist/index.js
- [x] Corrigir erro de build do servidor (dist/index.js não encontrado)
- [x] Garantir que o build do servidor gera dist/index.js corretamente
- [x] Corrigir API do Melhor Envio em produção (URL e payload corretos)
- [x] Testar build completo (frontend + servidor)
- [ ] Publicar novamente e validar frete em produção

## Bug Fix: Deploy ServiceDeployNotTemplate - outDir incorreto
- [x] Corrigir vite.config.ts: outDir de client/dist para dist/public
- [x] Testar build completo (dist/index.js + dist/public/index.html)
- [ ] Salvar checkpoint e publicar

## Feature: Filtrar opções de frete (SEDEX, Jadlog .Package, Jadlog .Com, Retirada)
- [x] Verificar nomes exatos retornados pela API do Melhor Envio
- [x] Filtrar API para retornar apenas as 5 opções desejadas (SEDEX id=2, Jadlog .Package id=3, Jadlog .Com id=4, JeT Standard id=33, Retirada)
- [x] Testar e salvar checkpoint

## Feature: Sistema de Pedidos com Etiqueta Automática (Melhor Envio)
- [x] Criar schema do banco: tabelas orders com endereço completo, etiqueta e rastreio
- [x] Criar tRPC procedures: createFull, list, updateStatus, generateLabel, getTracking
- [x] Implementar CheckoutModal com formulário de endereço completo + busca ViaCEP
- [x] Integrar Melhor Envio: adicionar ao carrinho → comprar → gerar → URL PDF
- [x] Criar painel admin com gestão de status, geração de etiqueta e WhatsApp
- [x] Enviar mensagem WhatsApp com resumo do pedido e endereço
- [x] Testar fluxo completo (13 testes passando) e salvar checkpoint

## Bug Fix: Erro INSERT orders - Schema não sincronizado
- [x] Verificar schema atual da tabela orders no banco (17 colunas antigas vs 28 novas)
- [x] Adicionar colunas novas via ALTER TABLE (endereço, frete, etiqueta)
- [x] Tornar colunas legadas (productId, pixKey) nullable
- [x] Adicionar valor 'shipped' ao ENUM de status
- [x] Testar INSERT com sucesso e salvar checkpoint

## Feature: CPF Obrigatório no Checkout
- [x] Tornar campo CPF obrigatório no CheckoutModal (frontend)
- [x] Atualizar validação no backend (routers.ts) para exigir customerDocument (min 11 dígitos)
- [x] Salvar checkpoint

## Feature: Atualizar São Miguel - Preços e Tamanhos
- [x] Verificar estrutura de produtos/tamanhos no banco e código (definido no Catalog.tsx)
- [x] Atualizar preços: P(144mm)=59,03 / M(216mm)=103,27 / G(288mm)=213,43
- [x] Salvar checkpoint

## Feature: Deletar Pedido no Admin
- [x] Função deleteOrder já existia no db.ts
- [x] Adicionar procedure orders.delete no routers.ts
- [x] Adicionar botão Excluir (vermelho, com confirmação) no painel Admin
- [x] Salvar checkpoint (17 testes passando)

## Feature: Login Admin com Usuário e Senha
- [x] Criar procedure admin.login no backend com bcrypt e JWT
- [x] Criar página AdminLogin no frontend
- [x] Proteger rota /admin com verificação de token admin
- [x] Configurar credenciais via secrets (ADMIN_EMAIL + ADMIN_PASSWORD_HASH)
- [x] Salvar checkpoint (17 testes passando)

## Feature: Deletar Pedido no Admin
- [x] Função deleteOrder já existia no db.ts
- [x] Adicionar procedure orders.delete no routers.ts
- [x] Adicionar botão Excluir (vermelho, com confirmação) no painel Admin
- [x] Salvar checkpoint (17 testes passando)

## Bug Fix: Login Admin não funciona
- [x] Diagnosticar: cookie-parser não configurado, req.cookies era undefined
- [x] Corrigir: usar req.headers.cookie + parse manual (igual ao SDK do Manus)
- [x] Testar: login + check retornam authenticated:true (17 testes passando)

## Bug Fix: Botão Excluir não aparece no Admin
- [ ] Verificar Admin.tsx e corrigir visibilidade do botão
- [ ] Salvar checkpoint

## Bug Fix: Geração de Etiqueta ME - CPF e cidade do remetente
- [x] Corrigir payload do remetente: adicionar address, number, district, city, state_abbr, country_id
- [x] Atualizar CPF para 05526634922 e endereço: Rua Arthur Zoefeldt 307, Iririú, Joinville/SC
- [x] Salvar checkpoint (17 testes passando)

## Bug Fix: CPF do remetente rejeitado pelo Melhor Envio
- [x] CPF 05526634922 é matematicamente válido
- [x] Problema: MELHOR_ENVIO_DOCUMENT tinha valor antigo 05526634900 (inválido)
- [x] Corrigido: atualizado secret para 05526634922 via webdev_request_secrets
- [x] Salvar checkpoint (17 testes passando)

## Feature: Gestão de Produtos no Admin (CRUD)
- [x] Analisar estrutura atual dos produtos no Catalog.tsx (15 produtos hardcoded)
- [x] Expandir tabela `products` no banco com dimensões, peso, tamanhos, cores, sortOrder, active
- [x] Migrar 14 produtos do Catalog.tsx para o banco de dados
- [x] Criar procedures tRPC: products.list, create, update, delete, uploadImage
- [x] Criar página AdminProducts com formulário completo (imagem, preço, dimensões, peso, tamanhos, cores)
- [x] Adicionar botão 'Produtos' no cabeçalho do Admin e rota /admin/products
- [x] Atualizar Catálogo para carregar produtos dinamicamente do banco
- [x] Testar fluxo completo (17 testes passando) e salvar checkpoint

## Migração Completa para Vercel Serverless
- [x] Analisar APIs existentes e mapear o que precisa ser migrado
- [x] Criar funções serverless: admin/login, admin/logout, admin/check
- [x] Criar funções serverless: products (list, create, update, delete, upload)
- [x] Criar funções serverless: orders (create, list, update-status, delete)
- [x] Criar funções serverless: generate-label (Melhor Envio)
- [x] Atualizar frontend para usar as novas APIs serverless (Catalog, CheckoutModal, AdminLogin, Admin, AdminProducts)
- [x] Testar build completo e fazer commit para Vercel

## Publicação no Vercel
- [x] Analisar estrutura atual e identificar adaptações necessárias
- [x] Criar vercel.json com configuração correta de rotas e build (outputDirectory: dist/public)
- [x] Adaptar servidor Express para Vercel Functions (serverless) - pasta api/ já existia
- [x] Verificar build completo para Vercel (pnpm run build:frontend → dist/public)
- [x] Corrigir upload-image.js para aceitar filename/base64Data do frontend
- [x] Corrigir banco de dados: coluna details adicionada e migração aplicada
- [ ] Configurar variáveis de ambiente no Vercel
- [ ] Deploy e validar funcionamento em produção
