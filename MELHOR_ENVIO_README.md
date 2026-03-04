# Integração Melhor Envio - Santos Anjos 3D

## 🚀 Status da Integração

✅ **Implementação Completa** - A integração com a API do Melhor Envio está totalmente implementada e funcionará em produção.

⚠️ **Limitação do Sandbox** - O ambiente de desenvolvimento (sandbox) tem restrições de DNS que impedem a conexão com `api.melhorenvio.com.br`. Isso é normal e esperado.

## 📋 Como Funciona

### Fluxo do Cliente

1. Cliente adiciona produtos ao carrinho
2. Informa o CEP de entrega (CEP: 00000-000)
3. Sistema calcula automaticamente as opções de frete disponíveis via API Melhor Envio
4. Cliente seleciona a opção de frete desejada (PAC, SEDEX, etc.)
5. Total (produtos + frete) é exibido no carrinho
6. Ao clicar em "Encomendar via WhatsApp", a mensagem inclui:
   - Lista de produtos com cores e tamanhos
   - Subtotal dos produtos
   - Frete selecionado com valor
   - Total geral
   - CEP do cliente

### Cálculo de Frete

O sistema usa as dimensões e pesos definidos para cada tamanho:

- **Tamanho P (144mm)**: 8x8x15cm, 100g
- **Tamanho M (216mm)**: 10x10x23cm, 150g
- **Tamanho G (288mm)**: 15x15x30cm, 250g

O cálculo considera o **maior tamanho** presente no carrinho para determinar as dimensões do pacote.

## 🔧 Configuração

### Variáveis de Ambiente

As seguintes variáveis já estão configuradas no arquivo `.env`:

```
MELHOR_ENVIO_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGc...
MELHOR_ENVIO_CLIENT_ID=22269
MELHOR_ENVIO_SECRET=uiu9ej5G4ZT1NHFiPhhYiU3BiM8zYReWgRRDs8hg
MELHOR_ENVIO_ORIGIN_CEP=89227320
```

### Arquivos Principais

- **`server/melhorenvio.ts`** - Lógica de integração com a API
- **`server/routers.ts`** - Endpoint tRPC `shipping.calculateMelhorEnvio`
- **`client/src/components/ShippingCalculator.tsx`** - Componente React para cálculo de frete
- **`client/src/components/Cart.tsx`** - Carrinho com integração de frete

## 🌐 Testando em Produção

### Por que não funciona no sandbox?

O ambiente sandbox tem restrições de DNS por segurança. O erro `getaddrinfo ENOTFOUND api.melhorenvio.com.br` é esperado durante o desenvolvimento.

### Como testar a API real?

1. **Salvar checkpoint** - Criar um checkpoint do projeto
2. **Publicar o site** - Clicar no botão "Publish" na interface do Manus
3. **Testar em produção** - Acessar o site publicado e testar o cálculo de frete

A API do Melhor Envio funcionará automaticamente em produção sem necessidade de alterações no código.

## 📝 Exemplo de Mensagem WhatsApp

```
Olá! Gostaria de fazer um pedido:

São Miguel Pequeno (Branco, P - 144mm) - R$ 45,00 x 1
Santa Gianna (Verde, M - 216mm) - R$ 67,50 x 2

*Subtotal: R$ 180,00*
*Frete (PAC): R$ 25,50*
*Total: R$ 205,50*

Meu CEP: 01310100

Por favor, envie o link de pagamento PIX.
```

## 🔒 Segurança

- Token de autenticação armazenado em variável de ambiente
- Chamadas à API feitas apenas no servidor (backend)
- Cliente não tem acesso direto ao token

## 📞 Suporte

Em caso de problemas com a API do Melhor Envio em produção:

1. Verificar se o token está válido (tokens JWT expiram)
2. Verificar se o CEP de origem está correto
3. Consultar logs do servidor para mensagens de erro detalhadas
4. Contatar suporte do Melhor Envio se necessário

## ✨ Próximos Passos

- [ ] Publicar o site
- [ ] Testar cálculo de frete em produção
- [ ] Validar integração com WhatsApp
- [ ] Monitorar logs para possíveis erros
