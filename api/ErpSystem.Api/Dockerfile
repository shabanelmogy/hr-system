# syntax=docker/dockerfile:1

ARG SDK_IMAGE=mcr.microsoft.com/dotnet/sdk:10.0.400-noble@sha256:4beef5b8919dcaa2dc924233bd069257e883cc7a061e09088a97d152d6a48510
ARG RUNTIME_IMAGE=mcr.microsoft.com/dotnet/aspnet:10.0.10-noble@sha256:f1126d438ccc359f51cc6d4701a8deae513856cf10f5fe645d29ea6403dcac6b

FROM ${SDK_IMAGE} AS build
WORKDIR /src

COPY . .
RUN dotnet restore ./ErpSystem.Api/ErpSystem.Api.csproj
RUN dotnet publish ./ErpSystem.Api/ErpSystem.Api.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish \
    /p:UseAppHost=false

FROM ${RUNTIME_IMAGE} AS final
WORKDIR /app

ENV ASPNETCORE_HTTP_PORTS=8080 \
    DOTNET_EnableDiagnostics=0

EXPOSE 8080

COPY --from=build /app/publish .

USER $APP_UID

ENTRYPOINT ["dotnet", "ErpSystem.Api.dll"]
