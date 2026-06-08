# Zelador.ia MVP

Protótipo local da vitrine Operia Lab para um assistente de zeladoria operacional que gera um pré-laudo de manutenção a partir de fotos e descrição.

## O que faz

- Registra um chamado com local, descrição e até 5 fotos.
- Gera fotos sintéticas de demonstração para cenários de umidade, elétrica e ar-condicionado.
- Gera diagnóstico estimado por catégoria.
- Sugere criticidade, prazo, custo-base, equipe e profissional indicado.
- Lista materiais prováveis e checklist de escopo da obra.
- Compara proposta do prestador com uma pesquisa média de referência.
- Anexa as fotos no pré-laudo.
- Registra prestador, prazo informado, proposta e mão de obra.
- Copia resumo para fornecedor e permite gerar PDF pelo navegador.
- Cria checklist de encerramento.
- Permite adicionar fotos depois do serviço e avaliar se o chamado pode ser encerrado.
- Inclui aba de acompanhamento com histórico de ordens de serviço.
- Filtra OS por catégoria/status e permite marcar em execução, pendente, resolvida ou excluir.
- Permite cadastrar e selecionar empreendimentos, separando OS por empreendimento ativo.

## Como abrir

Abra o arquivo `index.html` no navegador.

Para usar a análise visual real, rode o servidor local com uma chave da OpenAI:

```bash
OPENAI_API_KEY="sua_chave" python3 server.py
```

Sem `OPENAI_API_KEY`, a interface continua funcionando em modo demo com a lógica local.

## Proximas camadas

- Plugar análise real de imagens com OpenAI Responses API.
- Criar banco de chamados por andar/local.
- Adicionar tabela de preços por cidade/contrato.
- Gerar relatorio PDF com layout proprio.
- Comparar fotos antes/depois com visão computacional.
