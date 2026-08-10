# rotahub-bff

BFF (Backend for Frontend) do RotaHub. Orquestra `orders-service` e `tracking-service` via REST síncrono para servir o Painel do Operador (e futuramente o Acompanhamento do Cliente).

- **Stack:** Node.js + NestJS
- **Auth:** JWT (MVP)
- **Comunicação:** apenas síncrona (REST) com os serviços — não fala diretamente com RabbitMQ, Postgres ou Mongo

Contratos completos (endpoints expostos ao frontend) estão documentados em `rotahub-infra/docs/contracts.md`.

## Rodando localmente

> TODO: preencher quando o projeto Nest for gerado.
