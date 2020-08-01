# Requisitos/Especificação
## Criação

Requisitos/especificações do Backend responsável pela aquisição e processamento dos campos estatísticos de medidas sincrofasoriais.

1.1 - Deve ser possível adicionar uma nova estatística diária
1.2 - O status code de uma estatística criada deverá ser 201
* `POST /api/stat/`: A rota deve receber `date, pmu, dados_recebidos, latencia_conforme, latencia_minima, latencia_media, latencia_maxima, dados_adequados, configuracao e pmu_time_quality`

## Seções
- [Banco de Dados](#banco-de-dados)
- [API openPDC](#)
- [Usuários](#)
- [Estatísticas de Sincrofasores](#)



## Banco de Dados