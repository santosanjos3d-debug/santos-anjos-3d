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
