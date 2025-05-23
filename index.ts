import * as pulumi from "@pulumi/pulumi";
import { ContainerAppComponent } from "./component/ContainerAppComponent";

// Cargar configuración del stack
const config = new pulumi.Config();

const location = config.require("azure-native:location");
const resourceGroupName = config.require("containerApp:resourceGroupName");
const environmentId = config.require("containerApp:environmentId");

// Crear instancia del componente reutilizable
const containerApp = new ContainerAppComponent("my-app", {
  name: "my-app",
  location: location,
  resourceGroupName: resourceGroupName,
  environmentId: environmentId,
  image: "nginx:latest", // puedes usar cualquier imagen pública
  cpu: 1,                // opcional, por defecto 0.5
  memory: 2              // opcional, por defecto 1
});

// Exportar nombre y URL del container app
export const containerAppName = containerApp.containerApp.name;
export const containerAppUrl = containerApp.containerApp.configuration.apply(c => c.ingress?.fqdn ?? "no ingress");
