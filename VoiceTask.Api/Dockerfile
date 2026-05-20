FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY VoiceTask.slnx .
COPY VoiceTask.Api/VoiceTask.Api.csproj VoiceTask.Api/
COPY VoiceTask.App/VoiceTask.App.csproj VoiceTask.App/
COPY VoiceTask.Data/VoiceTask.Data.csproj VoiceTask.Data/
COPY VoiceTask.Domain/VoiceTask.Domain.csproj VoiceTask.Domain/
RUN dotnet restore

COPY . .
RUN dotnet publish VoiceTask.Api/VoiceTask.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
RUN mkdir -p storage/audio
EXPOSE 8080
ENTRYPOINT ["dotnet", "VoiceTask.Api.dll"]
