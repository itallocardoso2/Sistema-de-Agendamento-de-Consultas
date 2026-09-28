# Sistema de Agendamento de Consultas Médicas

Protótipo do projeto da Faculdade Anhanguera (Unidade Turu): indexação com **Árvore B** para buscas rápidas por CPF, CRM e data, e relatório diário ordenado com **Merge Sort**.

**Equipe:** Itallo Cardoso Freitas, Danilo da Silva Portela, Paulo Victor Fernandes Coelho Martins e Breno.

## O que o protótipo faz
- **Buscar consulta** por CPF, CRM ou data, mostrando quantos nós a Árvore B leu contra uma busca sequencial.
- **Agendar** uma consulta, inserindo-a nos três índices.
- **Relatório diário** de atendimentos ordenado por horário.

## Como rodar
Abra o arquivo `index.html` no navegador. Não precisa instalar nada.

Para publicar no GitHub Pages: *Settings → Pages → Deploy from a branch → main / (root)*.

## Estrutura
- `index.html`: página e interface
- `style.css`: estilos
- `script.js`: Árvore B, Merge Sort, dados fictícios e lógica da interface

## Limitações
Os dados ficam só na memória do navegador (somem ao recarregar). A árvore ainda não é gravada em arquivo, e não há cancelar/remarcar nem prontuário. Esses pontos ficam para as próximas entregas.
